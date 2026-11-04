import { store, findProductById, getProductStock } from '../../../core/store';
import { CATEGORY_NAMES, ONE_DAY_MS } from '../../../core/constants';
import {
  formatDate,
  formatInt,
  formatMoney,
  formatMoneyK,
  formatMoneyRound,
  formatPercent,
} from '../../../utils/formatters';
import {
  MetricKey,
  RangePreset,
  Granularity,
  SalesChannel,
  ChannelDayStats,
  TimeBucket,
  SeriesDataResult,
  MetricTotals,
} from '../../../types/analytics';

export const CHANNELS: SalesChannel[] = ['wholesale', 'online', 'studio'];

export const CHANNEL_TONES: Record<SalesChannel, string> = {
  wholesale: 'pine',
  online: 'sky',
  studio: 'ochre',
};

export const DAY_WEIGHTS = [0.5, 2, 2, 2, 2, 2, 1.5];

export const startOfDay = (ts: number): number => new Date(ts).setHours(0, 0, 0, 0);
export const startOfToday = (): number => startOfDay(Date.now());
export const isOrderActive = (order: { status: string }): boolean => order.status !== 'cancelled';

export function getTotalInventoryValue(): number {
  const productsVal = store.products.reduce((sum: number, p: any) => sum + getProductStock(p) * p.cost, 0);
  const materialsVal = store.materials.reduce((sum: number, m: any) => sum + m.onHand * m.cost, 0);
  return productsVal + materialsVal;
}

export const addDays = (timestamp: number, days: number): number => {
  const d = new Date(timestamp);
  d.setDate(d.getDate() + days);
  return d.getTime();
};

export const PRODUCT_CATEGORIES = [...CATEGORY_NAMES];

export function createEmptyDayStats(): ChannelDayStats {
  const channelObj: any = {};
  const catObj: any = {};

  CHANNELS.forEach((ch) => {
    channelObj[ch] = 0;
    catObj[ch] = {};
    PRODUCT_CATEGORIES.forEach((cat) => {
      catObj[ch][cat] = { rev: 0, units: 0, cogs: 0 };
    });
  });

  return { o: channelObj, c: catObj };
}

export function accumulateDayStats(
  target: ChannelDayStats,
  source: ChannelDayStats,
  multiplier = 1
): void {
  CHANNELS.forEach((ch) => {
    target.o[ch] += source.o[ch] * multiplier;
    PRODUCT_CATEGORIES.forEach((cat) => {
      const t = target.c[ch][cat];
      const s = source.c[ch][cat];
      if (t && s) {
        t.rev += s.rev * multiplier;
        t.units += s.units * multiplier;
        t.cogs += s.cogs * multiplier;
      }
    });
  });
}

let statsCache: Map<number, ChannelDayStats> | null = null;
let earliestOrderTimestamp = 0;
let baselineDayStats = createEmptyDayStats();
let velocityRatio = 1;

export function buildDailyStatsCache(): void {
  statsCache = new Map<number, ChannelDayStats>();
  let earliest = Infinity;

  for (const order of store.orders) {
    if (!isOrderActive(order)) continue;

    const dayStart = startOfDay(order.createdAt);
    earliest = Math.min(earliest, dayStart);

    let dayData = statsCache.get(dayStart);
    if (!dayData) {
      dayData = createEmptyDayStats();
      statsCache.set(dayStart, dayData);
    }

    dayData.o[order.channel as SalesChannel] += 1;

    for (const line of order.lines) {
      const product = findProductById(line.productId);
      if (!product) continue;

      const catMetrics = dayData.c[order.channel as SalesChannel]?.[product.category];
      if (catMetrics) {
        catMetrics.rev += line.qty * line.price;
        catMetrics.units += line.qty;
        catMetrics.cogs += line.qty * product.cost;
      }
    }
  }

  earliestOrderTimestamp = isFinite(earliest) ? earliest : startOfToday();

  const months = store.months;
  const historyMonths = months.filter(
    (m, idx) => m.start >= earliestOrderTimestamp && idx < months.length - 1
  );

  baselineDayStats = createEmptyDayStats();
  let totalWeightedDays = 0;
  const rangeStart = historyMonths[0]?.start ?? earliestOrderTimestamp;
  const rangeEnd = historyMonths.length
    ? months[months.indexOf(historyMonths[historyMonths.length - 1]) + 1]?.start ?? startOfToday()
    : startOfToday() + ONE_DAY_MS;

  for (let t = rangeStart; t < rangeEnd; t = addDays(t, 1)) {
    const cached = statsCache.get(t);
    if (cached) accumulateDayStats(baselineDayStats, cached);
    totalWeightedDays += DAY_WEIGHTS[new Date(t).getDay()];
  }

  const avgStockOut = historyMonths.length
    ? historyMonths.reduce((sum, m) => sum + m.stockOut, 0) / historyMonths.length
    : 1;

  velocityRatio = 1 / Math.max(1, totalWeightedDays * avgStockOut);
}

export function clearStatsCache(): void {
  statsCache = null;
}

export function getStatsForDay(dayTimestamp: number): ChannelDayStats | null {
  if (!statsCache) buildDailyStatsCache();

  if (dayTimestamp >= earliestOrderTimestamp) {
    return statsCache!.get(dayTimestamp) ?? createEmptyDayStats();
  }

  const date = new Date(dayTimestamp);
  const currentYear = new Date(Date.now()).getFullYear();
  if (date.getFullYear() !== currentYear) return null;

  const monthData = store.months[date.getMonth()];
  if (!monthData) return null;

  const estStats = createEmptyDayStats();
  accumulateDayStats(
    estStats,
    baselineDayStats,
    DAY_WEIGHTS[date.getDay()] * monthData.stockOut * velocityRatio
  );
  return estStats;
}

export function getRangeDayStats(
  start: number,
  end: number
): { day: ChannelDayStats; known: boolean; est: boolean } {
  const day = createEmptyDayStats();
  let known = true;
  let est = false;

  for (let t = startOfDay(start); t < end; t = addDays(t, 1)) {
    const dStats = getStatsForDay(t);
    if (!dStats) {
      known = false;
      continue;
    }
    if (t < earliestOrderTimestamp) {
      est = true;
    }
    accumulateDayStats(day, dStats);
  }

  return { day, known, est };
}

export function sumChannelStats(day: ChannelDayStats, channel: string): MetricTotals {
  const totals: MetricTotals = { rev: 0, orders: 0, units: 0, cogs: 0 };
  const targetChannels = channel === 'all' ? CHANNELS : [channel as SalesChannel];

  targetChannels.forEach((ch) => {
    totals.orders += day.o[ch] ?? 0;
    PRODUCT_CATEGORIES.forEach((cat) => {
      const metric = day.c[ch]?.[cat];
      if (metric) {
        totals.rev += metric.rev;
        totals.units += metric.units;
        totals.cogs += metric.cogs;
      }
    });
  });

  return totals;
}

export function sumCategoryStats(
  day: ChannelDayStats,
  channel: string,
  category: string
): MetricTotals {
  const totals: MetricTotals = { rev: 0, orders: 0, units: 0, cogs: 0 };
  const targetChannels = channel === 'all' ? CHANNELS : [channel as SalesChannel];

  targetChannels.forEach((ch) => {
    const metric = day.c[ch]?.[category];
    if (metric) {
      totals.rev += metric.rev;
      totals.units += metric.units;
      totals.cogs += metric.cogs;
    }
  });

  return totals;
}

export function getHistoricalStockCost(timestamp: number): number {
  const now = Date.now();
  if (timestamp >= now) return getTotalInventoryValue();

  if (timestamp >= now - 42 * 86400000) {
    const movesAfter = store.moves.filter((m) => m.at > timestamp);
    return getTotalInventoryValue() - movesAfter.reduce((sum, m) => sum + m.value, 0);
  }

  const timeline =
    store.weeks.length && timestamp >= store.weeks[0].start ? store.weeks : store.months;
  const points: [number, number][] = timeline.map((item, idx) => [
    timeline[idx + 1]?.start ?? now,
    item.value,
  ]);

  const first = timeline[0];
  if (first) {
    points.unshift([first.start, first.value - first.stockIn + first.stockOut]);
  }

  if (!points.length) return getTotalInventoryValue();
  if (timestamp <= points[0][0]) return points[0][1];

  for (let i = 1; i < points.length; i++) {
    const [t0, v0] = points[i - 1];
    const [t1, v1] = points[i];
    if (timestamp <= t1) {
      return v0 + ((v1 - v0) * (timestamp - t0)) / Math.max(1, t1 - t0);
    }
  }

  return points[points.length - 1][1];
}

export function getDateRangeBoundaries(preset: RangePreset): {
  start: number;
  end: number;
  daysCount: number;
} {
  const end = startOfToday() + ONE_DAY_MS;
  const start =
    preset === 'ytd'
      ? new Date(new Date(Date.now()).getFullYear(), 0, 1).getTime()
      : addDays(end, -Number(preset));
  return {
    start,
    end,
    daysCount: Math.round((end - start) / ONE_DAY_MS),
  };
}

export function getTimeBuckets(preset: RangePreset, granularity: Granularity): TimeBucket[] {
  const { start, end } = getDateRangeBoundaries(preset);
  const weekStartOffset = store.settings.prefs.weekStart === 'sun' ? 0 : 1;
  const buckets: TimeBucket[] = [];
  let s = start;

  while (s < end) {
    const d = new Date(s);
    let bucketEnd: number;

    if (granularity === 'day') {
      bucketEnd = addDays(s, 1);
    } else if (granularity === 'week') {
      const dayOfWeek = (d.getDay() - weekStartOffset + 7) % 7;
      bucketEnd = addDays(s, 7 - dayOfWeek);
    } else {
      bucketEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime();
    }

    bucketEnd = Math.min(bucketEnd, end);
    buckets.push({
      s,
      e: bucketEnd,
      label:
        granularity === 'month'
          ? d.toLocaleDateString('en-US', { month: 'short' })
          : formatDate(s),
    });
    s = bucketEnd;
  }

  return buckets;
}

export interface MetricDefinition {
  label: string;
  icon: string;
  tone: string;
  fmt: (n: number) => string;
  axis: (n: number) => string;
  note: string;
}

export const METRIC_CONFIGS: Record<MetricKey, MetricDefinition> = {
  rev: {
    label: 'Revenue',
    icon: 'dollar',
    tone: 'pine',
    fmt: formatMoneyRound,
    axis: formatMoneyK,
    note: 'Order value before tax, every channel',
  },
  orders: {
    label: 'Orders',
    icon: 'orders',
    tone: 'sky',
    fmt: formatInt,
    axis: formatInt,
    note: 'Orders placed, cancelled ones left out',
  },
  units: {
    label: 'Units sold',
    icon: 'boxes',
    tone: 'ochre',
    fmt: formatInt,
    axis: formatInt,
    note: 'Bottles, jars and tubes on those orders',
  },
  aov: {
    label: 'Avg order value',
    icon: 'receipt',
    tone: 'ocean',
    fmt: formatMoney,
    axis: formatMoneyK,
    note: 'Revenue divided by orders',
  },
  stock: {
    label: 'Stock value',
    icon: 'layers',
    tone: 'teal',
    fmt: formatMoneyRound,
    axis: formatMoneyK,
    note: 'Products and materials at cost, at each period’s close',
  },
  margin: {
    label: 'Gross margin',
    icon: 'trend',
    tone: 'sage',
    fmt: (v: number) => formatPercent(v, 1),
    axis: (v: number) => formatPercent(v),
    note: 'Revenue less the cost of the goods sold',
  },
};

export function evaluateMetricForPeriod(
  metric: MetricKey,
  start: number,
  end: number,
  channel: string
): { v: number; known: boolean; est: boolean } {
  if (metric === 'stock') {
    const evalTime = Math.min(end, Date.now());
    return {
      v: getHistoricalStockCost(evalTime),
      known: evalTime > (store.months[0]?.start ?? 0),
      est: false,
    };
  }

  const rangeStats = getRangeDayStats(start, end);
  const totals = sumChannelStats(rangeStats.day, channel);

  let val = 0;
  if (metric === 'rev') val = totals.rev;
  else if (metric === 'orders') val = totals.orders;
  else if (metric === 'units') val = totals.units;
  else if (metric === 'aov') val = totals.orders ? totals.rev / totals.orders : 0;
  else if (metric === 'margin') val = totals.rev ? (totals.rev - totals.cogs) / totals.rev : 0;

  return {
    v: val,
    known: rangeStats.known,
    est: rangeStats.est,
  };
}

export function getMetricSeriesData(
  metric: MetricKey,
  preset: RangePreset,
  granularity: Granularity,
  channel: string
): SeriesDataResult {
  const { start, end, daysCount } = getDateRangeBoundaries(preset);
  const buckets = getTimeBuckets(preset, granularity);

  const curEvals = buckets.map((b) => evaluateMetricForPeriod(metric, b.s, b.e, channel));
  const prevEvals = buckets
    .map((b) => ({ s: addDays(b.s, -daysCount), e: addDays(b.e, -daysCount) }))
    .map((b) => evaluateMetricForPeriod(metric, b.s, b.e, channel));

  const curTotalEval = evaluateMetricForPeriod(metric, start, end, channel);
  const prevTotalEval = evaluateMetricForPeriod(
    metric,
    addDays(start, -daysCount),
    start,
    channel
  );

  const canCompare = prevEvals.every((e) => e.known) && prevTotalEval.known;
  const orderCount = metric === 'stock' ? 1 : sumChannelStats(getRangeDayStats(start, end).day, channel).orders;

  return {
    buckets,
    cur: curEvals.map((e) => e.v),
    prev: prevEvals.map((e) => e.v),
    canCompare,
    total: curTotalEval.v,
    prevTotal: prevTotalEval.v,
    est: curEvals.some((e) => e.est) || (canCompare && prevEvals.some((e) => e.est)),
    empty: !orderCount,
  };
}
