import { store, getProductStock } from '../../../core/store';
import { CHANNEL_NAMES, ONE_DAY_MS } from '../../../core/constants';
import {
  motionDuration,
  animateCards,
  animateRows,
  animatePop,
  animateCounter,
  playHaptic,
  bindMagnetic,
  prefersReducedMotion,
  Flip,
  gsap,
} from '../../../core/motion';
import {
  renderLineChart,
  renderDonutRingMeter,
  renderColumnBarChart,
  renderSparklineSvg,
} from '../../../shared/widgets/charts';
import { escapeHtml, queryOne, domQuery, domQueryAll } from '../../../utils/dom';
import {
  formatDate,
  formatInt,
  formatMoney,
  formatMoneyK,
  formatMoneyRound,
  formatPercent,
  formatCsvRow,
  pluralize,
  startOfMonth,
} from '../../../utils/formatters';
import { renderIcon } from '../../../utils/icons';
import { startOfToday } from '../services/stats-cache';
import {
  setSalesGoal,
  showToast,
  renderPageHeader,
  renderTag,
  renderSegmentedControl,
  initSegmentedControl,
  renderEmptyState,
  renderTrendBadge,
  bindQuickActions,
  downloadFile,
  openQuickCreateModal,
  animatePageTransition,
} from '../../../main';
import {
  MetricKey,
  RangePreset,
  Granularity,
  SalesChannel,
} from '../../../types/analytics';
import {
  CHANNELS,
  CHANNEL_TONES,
  PRODUCT_CATEGORIES,
  METRIC_CONFIGS,
  getDateRangeBoundaries,
  getRangeDayStats,
  sumChannelStats,
  sumCategoryStats,
  getMetricSeriesData,
} from '../services/stats-cache';

export const RANGE_LABELS: Record<RangePreset, string> = {
  '30': 'Last 30 days',
  '90': 'Last 90 days',
  ytd: 'This year',
};

export const ALLOWED_GRANULARITIES: Record<RangePreset, Granularity[]> = {
  '30': ['day', 'week'],
  '90': ['day', 'week', 'month'],
  ytd: ['week', 'month'],
};

export const DEFAULT_GRANULARITY: Record<RangePreset, Granularity> = {
  '30': 'day',
  '90': 'week',
  ytd: 'month',
};

let currentMetric: MetricKey = 'rev';
let currentRange: RangePreset = '30';
let currentGranularity: Granularity = 'day';
let compareWithPrevious = true;
let currentChannel: string = 'all';

let lineChartInstance: any = null;
let ringMeterInstance: any = null;
let categoryBarsInstance: any = null;
let rangeSegCtrl: any = null;
let granSegCtrl: any = null;

export function renderOverviewSubtab(): string {
  const metricKeys = Object.keys(METRIC_CONFIGS) as MetricKey[];

  return `${renderPageHeader({
    eyebrow: 'Annual Gross Revenue — Build a report from your own numbers',
    title: 'Reports',
    actions: `${renderSegmentedControl(
      'Date range',
      [
        ['30', '30 days'],
        ['90', '90 days'],
        ['ytd', 'This year'],
      ],
      currentRange,
      'an-range'
    )}
      <button type="button" class="btn btn--primary magnetic" data-k="ov-export">${renderIcon('download')}Export CSV</button>`,
  })}
  <div class="an-metrics" role="group" aria-label="Metric" data-k="ov-metrics">
    ${metricKeys
      .map(
        (key) => `<button type="button" class="an-metric" data-metric="${key}" aria-pressed="${key === currentMetric}" style="--c:var(--${METRIC_CONFIGS[key].tone})">
      <span class="an-metric__top"><span class="an-metric__ico">${renderIcon(METRIC_CONFIGS[key].icon)}</span><span class="an-metric__label">${escapeHtml(METRIC_CONFIGS[key].label)}</span></span>
      <b class="an-metric__val num" data-mv="${key}">0</b>
      <span class="an-metric__foot"><span data-md="${key}"></span><span class="an-metric__spark" data-ms="${key}"></span></span>
    </button>`
      )
      .join('')}
    <span class="an-ring" aria-hidden="true"></span>
  </div>
  <section class="card an-main" aria-labelledby="ov-chart-t">
    <header class="card__head">
      <div><h2 class="card__title" id="ov-chart-t"><span data-k="ov-title">Revenue</span></h2><p class="card__sub" data-k="ov-sub"></p></div>
      <div class="card__tools">
        ${renderSegmentedControl(
          'Group by',
          [
            ['day', 'Day'],
            ['week', 'Week'],
            ['month', 'Month'],
          ],
          currentGranularity,
          'an-gran'
        )}
        <span class="an-cmp"><button type="button" class="switch" role="switch" aria-checked="true" aria-labelledby="ov-cmp-l" data-k="ov-cmp"></button><span id="ov-cmp-l">Compare</span></span>
        <button type="button" class="ibtn ibtn--sm card__expand" aria-label="Expand" title="Expand" data-expand>${renderIcon('arrow')}</button>
      </div>
    </header>
    <div class="an-main__bar">
      <div class="chips" role="group" aria-label="Channel" data-k="ov-chan">
        ${[['all', 'All channels'], ...CHANNELS.map((ch) => [ch, CHANNEL_NAMES[ch]])].map(([ch, label]) => `<button type="button" class="chip" data-chan="${ch}" aria-pressed="${ch === currentChannel}">${ch === 'all' ? '' : `<i class="dot" style="--c:var(--${CHANNEL_TONES[ch as SalesChannel]})"></i>`}${escapeHtml(label)}</button>`).join('')}
      </div>
      <div class="legend an-legend" data-k="ov-legend"></div>
    </div>
    <div class="an-main__plot"><div data-k="ov-chart"></div><div class="an-main__empty" data-k="ov-empty" hidden></div></div>
    <div class="an-main__foot" data-k="ov-foot"></div>
  </section>
  <div class="an-split">
    <section class="card an-donut" aria-labelledby="ov-don-t">
      <header class="card__head"><div><h2 class="card__title" id="ov-don-t" data-k="ov-don-title">By channel</h2><p class="card__sub" data-k="ov-don-sub"></p></div></header>
      <div class="an-donut__body"><div data-k="ov-donut"></div><ul class="an-parts" data-k="ov-parts"></ul></div>
    </section>
    <section class="card an-cats" aria-labelledby="ov-cat-t">
      <header class="card__head"><div><h2 class="card__title" id="ov-cat-t">By category</h2><p class="card__sub" data-k="ov-cat-sub"></p></div></header>
      <div data-k="ov-bars"></div>
      <p class="an-cats__foot" data-k="ov-cat-foot"></p>
    </section>
  </div>`;
}

function renderDeltaBadge(
  metric: MetricKey,
  total: number,
  prevTotal: number,
  canCompare: boolean
): string {
  if (!canCompare) {
    return `<span class="an-metric__na">${currentRange === 'ytd' ? 'First year in Vels' : '—'}</span>`;
  }
  if (metric === 'margin') {
    const pts = (total - prevTotal) * 100;
    const isGood = pts >= 0;
    return `<span class="delta delta--${isGood ? 'good' : 'bad'}">${renderIcon(isGood ? 'trend' : 'trendDown')}${isGood ? '+' : '−'}${Math.abs(pts).toFixed(1)} pts</span>`;
  }
  if (prevTotal) {
    return renderTrendBadge((total - prevTotal) / prevTotal);
  }
  return '';
}

function renderMetricSparkline(
  container: HTMLElement,
  values: number[],
  tone: string,
  animate: boolean
): void {
  container.innerHTML = renderSparklineSvg(values.length > 1 ? values : [0, ...values], tone, 84, 26);
  const path = queryOne('path', container);
  if (!path || !animate || prefersReducedMotion.matches) return;

  const len = path.getTotalLength();
  gsap.fromTo(
    path,
    { strokeDasharray: len, strokeDashoffset: len },
    {
      strokeDashoffset: 0,
      duration: motionDuration(1),
      ease: 'power2.inOut',
      clearProps: 'strokeDasharray,strokeDashoffset',
    }
  );
}

export function updateMetricsGrid(container: HTMLElement, animate = false): void {
  const metricKeys = Object.keys(METRIC_CONFIGS) as MetricKey[];

  metricKeys.forEach((key, idx) => {
    const data = getMetricSeriesData(
      key,
      currentRange,
      currentGranularity,
      key === 'stock' ? 'all' : currentChannel
    );

    const valEl = queryOne<HTMLElement>(`[data-mv="${key}"]`, container);
    if (valEl) {
      animateCounter(
        valEl,
        data.total,
        METRIC_CONFIGS[key].fmt,
        animate
          ? { from: 0, duration: 1.3, delay: 0.2 + idx * 0.05 }
          : { duration: 0.8 }
      );
    }

    const deltaEl = queryOne<HTMLElement>(`[data-md="${key}"]`, container);
    if (deltaEl) {
      deltaEl.innerHTML = renderDeltaBadge(key, data.total, data.prevTotal, data.canCompare);
    }

    const sparkEl = queryOne<HTMLElement>(`[data-ms="${key}"]`, container);
    if (sparkEl) {
      renderMetricSparkline(sparkEl, data.cur, METRIC_CONFIGS[key].tone, animate);
    }
  });
}

export function positionMetricActiveRing(container: HTMLElement, animate = false): void {
  const ring = queryOne<HTMLElement>('.an-ring', container);
  const activeBtn = queryOne<HTMLElement>(`.an-metric[data-metric="${currentMetric}"]`, container);
  if (!ring || !activeBtn || ring.parentElement === activeBtn) return;

  const state = Flip.getState(ring);
  activeBtn.append(ring);

  if (animate && !prefersReducedMotion.matches) {
    Flip.from(state, {
      duration: motionDuration(0.55),
      ease: 'power3.inOut',
      scale: true,
      clearProps: 'transform',
    });
  }
}

export function updateMainChart(container: HTMLElement, animate = false): void {
  const config = METRIC_CONFIGS[currentMetric];
  const channelParam = currentMetric === 'stock' ? 'all' : currentChannel;
  const seriesData = getMetricSeriesData(currentMetric, currentRange, currentGranularity, channelParam);
  const isComparing = compareWithPrevious && seriesData.canCompare;

  const prevPeriodLabel = currentRange === 'ytd' ? 'Last year' : `Previous ${currentRange} days`;
  const seriesList = [
    { name: config.label, values: seriesData.cur, tone: config.tone },
  ];

  if (isComparing) {
    seriesList.push({
      name: prevPeriodLabel,
      values: seriesData.prev,
      tone: 'muted',
      dashed: true as any,
    });
  }

  const bucketLabels = seriesData.buckets.map((b) => b.label);
  const chartEl = queryOne<HTMLElement>('[data-k="ov-chart"]', container);

  if (lineChartInstance) {
    lineChartInstance.update(seriesList, bucketLabels);
  } else if (chartEl) {
    lineChartInstance = renderLineChart(chartEl, {
      labels: bucketLabels,
      series: seriesList,
      format: (val: number) => config.axis(val),
      height: 300,
      label: 'Report chart',
    });
    if (animate) lineChartInstance.play(0.35);
  }

  const titleEl = queryOne<HTMLElement>('[data-k="ov-title"]', container);
  if (titleEl) titleEl.textContent = config.label;

  const subEl = queryOne<HTMLElement>('[data-k="ov-sub"]', container);
  if (subEl) {
    const channelSuffix = channelParam === 'all' ? '' : ` · ${CHANNEL_NAMES[channelParam]}`;
    subEl.textContent = `${RANGE_LABELS[currentRange]} · by ${currentGranularity}${channelSuffix}`;
  }

  const legendEl = queryOne<HTMLElement>('[data-k="ov-legend"]', container);
  if (legendEl) {
    legendEl.innerHTML = `<span><i class="tone--${config.tone}"></i>${escapeHtml(config.label)}</span>${isComparing ? `<span class="an-legend__prev"><i></i>${escapeHtml(prevPeriodLabel)}</span>` : ''}`;
  }

  const cmpBtn = queryOne<HTMLButtonElement>('[data-k="ov-cmp"]', container);
  if (cmpBtn) {
    cmpBtn.setAttribute('aria-checked', String(isComparing));
    cmpBtn.toggleAttribute('disabled', !seriesData.canCompare);
    cmpBtn.title = seriesData.canCompare
      ? 'Show the previous period as a dashed line'
      : 'Vels’s records start this January — there’s no last year to compare with yet';
  }

  domQueryAll('[data-chan]', container).forEach((btn) => {
    (btn as HTMLButtonElement).disabled = currentMetric === 'stock';
  });

  const emptyEl = queryOne<HTMLElement>('[data-k="ov-empty"]', container);
  if (emptyEl) {
    const wasHidden = emptyEl.hidden;
    emptyEl.hidden = !seriesData.empty;
    if (seriesData.empty) {
      const chName = channelParam === 'all' ? '' : `${CHANNEL_NAMES[channelParam].toLowerCase()} `;
      emptyEl.innerHTML = renderEmptyState(
        `No ${chName}sales in this range`,
        'Nothing was sold through this channel in the dates you picked. Widen the range or show every channel.',
        'chart',
        '<button type="button" class="btn btn--ghost btn--sm" data-k="ov-clear">Show every channel</button>'
      );
      if (wasHidden) {
        gsap.fromTo(
          emptyEl,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: motionDuration(0.4), ease: 'power3.out', clearProps: 'transform,opacity' }
        );
      }
    }
  }

  const bestBucketIndex = seriesData.cur.reduce((bestIdx, val, idx) => {
    if (val > (seriesData.cur[bestIdx] ?? -Infinity)) return idx;
    return bestIdx;
  }, 0);

  const deltaPct = seriesData.prevTotal ? (seriesData.total - seriesData.prevTotal) / seriesData.prevTotal : NaN;
  const currentMonthStart = startOfMonth(Date.now());
  const monthToDateTotals = sumChannelStats(
    getRangeDayStats(currentMonthStart, startOfToday() + ONE_DAY_MS).day,
    'all'
  );
  const mtdRev = monthToDateTotals.rev;
  const goal = store.settings.goal;

  const footEl = queryOne<HTMLElement>('[data-k="ov-foot"]', container);
  if (footEl) {
    const totalLeadText =
      currentMetric === 'stock'
        ? `Stock is worth <b>${formatMoneyRound(seriesData.total)}</b> at cost today`
        : `<b>${escapeHtml(config.fmt(seriesData.total))}</b> ${currentMetric === 'aov' || currentMetric === 'margin' ? 'across' : 'in'} ${RANGE_LABELS[currentRange].toLowerCase()}`;

    const compareText = seriesData.canCompare
      ? ` — ${currentMetric === 'margin' ? `${(seriesData.total - seriesData.prevTotal) * 100 >= 0 ? 'up' : 'down'} ${Math.abs((seriesData.total - seriesData.prevTotal) * 100).toFixed(1)} pts` : `${renderTrendBadge(deltaPct)} on the period before`}`
      : '';

    const bestBucketText =
      seriesData.buckets[bestBucketIndex] && !seriesData.empty
        ? `Best ${currentGranularity}: <b>${escapeHtml(seriesData.buckets[bestBucketIndex].label)}</b> (${escapeHtml(config.fmt(seriesData.cur[bestBucketIndex] ?? 0))}).`
        : '';

    const estText = seriesData.est
      ? `<span class="an-est">${renderIcon('info')}Before ${formatDate(startOfToday())} the figures are estimated from each month’s stock-out.</span>`
      : '';

    footEl.innerHTML = `<p>${totalLeadText}${compareText}. ${bestBucketText} ${estText}</p>
      <div class="an-goal"><span class="meter"><span class="meter__fill" data-k="ov-goal-fill" style="--c:var(--pine)"></span></span>
        <span>This month <b>${formatMoneyRound(mtdRev)}</b> of a <b>${formatMoneyRound(goal)}</b> goal</span>
        <button type="button" class="btn btn--ghost btn--xs" data-k="ov-goal">${renderIcon('edit')}Edit goal</button></div>`;

    const goalFill = queryOne<HTMLElement>('[data-k="ov-goal-fill"]', footEl);
    if (goalFill) {
      gsap.fromTo(
        goalFill,
        { scaleX: 0 },
        {
          scaleX: Math.max(0.02, Math.min(1, mtdRev / goal)),
          duration: motionDuration(1),
          delay: motionDuration(animate ? 0.6 : 0),
          ease: 'power3.inOut',
        }
      );
    }
  }

  updateBreakdowns(container, animate);
}

export function updateBreakdowns(container: HTMLElement, animate = false): void {
  const { start, end } = getDateRangeBoundaries(currentRange);
  const dayStats = getRangeDayStats(start, end).day;

  let donutTitle = 'By channel';
  let donutSub = '';
  let partsData: { key: string; label: string; value: number; tone: string; show: string }[] = [];
  let centerText = '';
  let centerSub = '';

  if (currentMetric === 'stock') {
    donutTitle = 'By location';
    donutSub = 'Products and materials on the shelves today';
    const matVal = store.materials.reduce((sum, m) => sum + m.onHand * m.cost, 0);

    partsData = store.locations.map((loc, idx) => {
      const prodVal = store.products.reduce(
        (sum, p) => sum + (p.stock[loc.id] ?? 0) * p.cost,
        0
      );
      const total = prodVal + (loc.id === 'lab' ? matVal : 0);
      const tone = (['pine', 'ocean', 'ochre'] as const)[idx % 3];
      return {
        key: loc.id,
        label: loc.name,
        value: total,
        tone,
        show: formatMoneyRound(total),
      };
    });

    centerText = formatMoneyK(partsData.reduce((sum, p) => sum + p.value, 0));
    centerSub = 'at cost';
  } else {
    donutTitle = 'By channel';
    partsData = CHANNELS.map((ch) => {
      const chTotals = sumChannelStats(dayStats, ch);
      const val =
        currentMetric === 'orders'
          ? chTotals.orders
          : currentMetric === 'units'
            ? chTotals.units
            : currentMetric === 'margin'
              ? chTotals.rev - chTotals.cogs
              : chTotals.rev;

      let showText = '';
      if (currentMetric === 'aov') {
        showText = formatMoney(chTotals.orders ? chTotals.rev / chTotals.orders : 0);
      } else if (currentMetric === 'margin') {
        showText = formatPercent(chTotals.rev ? (chTotals.rev - chTotals.cogs) / chTotals.rev : 0, 1);
      } else {
        showText = METRIC_CONFIGS[currentMetric].fmt(val);
      }

      return {
        key: ch,
        label: CHANNEL_NAMES[ch],
        value: val,
        tone: CHANNEL_TONES[ch],
        show: showText,
      };
    });

    const overallTotals = sumChannelStats(dayStats, 'all');
    if (currentMetric === 'orders') {
      centerText = formatInt(overallTotals.orders);
      centerSub = 'orders';
    } else if (currentMetric === 'units') {
      centerText = formatInt(overallTotals.units);
      centerSub = 'units';
    } else if (currentMetric === 'aov') {
      centerText = formatMoneyRound(overallTotals.orders ? overallTotals.rev / overallTotals.orders : 0);
      centerSub = 'per order';
    } else if (currentMetric === 'margin') {
      centerText = formatPercent(overallTotals.rev ? (overallTotals.rev - overallTotals.cogs) / overallTotals.rev : 0);
      centerSub = 'margin';
    } else {
      centerText = formatMoneyK(overallTotals.rev);
      centerSub = 'revenue';
    }

    donutSub =
      currentMetric === 'margin'
        ? 'Gross profit by channel, margin beside it'
        : currentMetric === 'aov'
          ? 'Revenue by channel, average order beside it'
          : `${METRIC_CONFIGS[currentMetric].label} by channel, ${RANGE_LABELS[currentRange].toLowerCase()}`;
  }

  const donTitleEl = queryOne<HTMLElement>('[data-k="ov-don-title"]', container);
  if (donTitleEl) donTitleEl.textContent = donutTitle;

  const donSubEl = queryOne<HTMLElement>('[data-k="ov-don-sub"]', container);
  if (donSubEl) donSubEl.textContent = donutSub;

  const totalSum = partsData.reduce((sum, p) => sum + Math.max(0, p.value), 0) || 1;
  const ringParts = partsData.map((p) => ({
    label: p.label,
    value: Math.max(0, p.value),
    tone: p.tone,
  }));

  const donutEl = queryOne<HTMLElement>('[data-k="ov-donut"]', container);
  if (ringMeterInstance) {
    ringMeterInstance.update(ringParts, centerText);
  } else if (donutEl) {
    ringMeterInstance = renderDonutRingMeter(donutEl, {
      parts: ringParts,
      center: centerText,
      sub: centerSub,
      label: 'Breakdown by channel',
    });
    ringMeterInstance.play(animate ? 0.5 : 0);
  }

  const partsListEl = queryOne<HTMLElement>('[data-k="ov-parts"]', container);
  if (partsListEl) {
    partsListEl.innerHTML = partsData
      .map(
        (p) =>
          `<li class="${currentMetric !== 'stock' && currentChannel !== 'all' && currentChannel === p.key ? 'is-on' : ''}"><i class="dot" style="--c:var(--${p.tone})"></i><span>${escapeHtml(p.label)}</span><b class="num">${escapeHtml(p.show)}</b><small>${formatPercent(Math.max(0, p.value) / totalSum)}</small></li>`
      )
      .join('');

    animateRows(domQueryAll('li', partsListEl), {
      x: 10,
      y: 0,
      stagger: 0.05,
      delay: animate ? 0.6 : 0.1,
    });
  }

  // Category Breakdown
  const catTargetChannel = currentMetric === 'stock' ? 'all' : currentChannel;
  const catValues = PRODUCT_CATEGORIES.map((cat) => {
    if (currentMetric === 'stock') {
      return store.products
        .filter((p) => p.category === cat)
        .reduce((sum, p) => sum + getProductStock(p) * p.cost, 0);
    }
    const catTotal = sumCategoryStats(dayStats, catTargetChannel, cat);
    if (currentMetric === 'units') return catTotal.units;
    if (currentMetric === 'margin') return catTotal.rev ? (catTotal.rev - catTotal.cogs) / catTotal.rev : 0;
    return catTotal.rev;
  });

  const catFormatter =
    currentMetric === 'units'
      ? formatInt
      : currentMetric === 'margin'
        ? (v: number) => formatPercent(v, 1)
        : formatMoneyRound;

  const catSubEl = queryOne<HTMLElement>('[data-k="ov-cat-sub"]', container);
  if (catSubEl) {
    catSubEl.textContent =
      currentMetric === 'stock'
        ? 'Products at cost, on hand today'
        : currentMetric === 'units'
          ? 'Units sold'
          : currentMetric === 'margin'
            ? 'Gross margin per category'
            : currentMetric === 'orders' || currentMetric === 'aov'
              ? 'Revenue (an order can span categories)'
              : 'Revenue';
  }

  const barsEl = queryOne<HTMLElement>('[data-k="ov-bars"]', container);
  if (categoryBarsInstance) {
    categoryBarsInstance.update(catValues);
  } else if (barsEl) {
    categoryBarsInstance = renderColumnBarChart(barsEl, {
      labels: PRODUCT_CATEGORIES,
      values: catValues,
      format: (v: number) => catFormatter(v),
      tone: METRIC_CONFIGS[currentMetric].tone,
      label: 'Breakdown by category',
    });
    categoryBarsInstance.play(animate ? 0.5 : 0);
  }

  if (barsEl) {
    domQueryAll('.bars__col', barsEl).forEach((col, idx) => {
      queryOne('.bars__val', col)?.remove();
      col.insertAdjacentHTML(
        'afterbegin',
        `<b class="bars__val num">${escapeHtml(catFormatter(catValues[idx] ?? 0))}</b>`
      );
    });
  }

  const bestCatIdx = catValues.reduce((bestIdx, val, idx) => {
    if (val > (catValues[bestIdx] ?? -Infinity)) return idx;
    return bestIdx;
  }, 0);
  const totalCatSum = catValues.reduce((sum, v) => sum + v, 0) || 1;

  const catFootEl = queryOne<HTMLElement>('[data-k="ov-cat-foot"]', container);
  if (catFootEl) {
    catFootEl.innerHTML = catValues.some((v) => v > 0)
      ? `<b>${escapeHtml(PRODUCT_CATEGORIES[bestCatIdx])}</b> leads with <b>${escapeHtml(catFormatter(catValues[bestCatIdx] ?? 0))}</b>${currentMetric === 'margin' ? '' : ` — ${formatPercent((catValues[bestCatIdx] ?? 0) / totalCatSum)} of the total`}.`
      : 'Nothing sold in this range.';
  }
}

export function exportOverviewReportCsv(fromEl?: HTMLElement): void {
  const config = METRIC_CONFIGS[currentMetric];
  const channelParam = currentMetric === 'stock' ? 'all' : currentChannel;
  const seriesData = getMetricSeriesData(currentMetric, currentRange, currentGranularity, channelParam);

  const channelLabel = channelParam === 'all' ? '' : ` (${CHANNEL_NAMES[channelParam]})`;
  const headers = [
    'Period start',
    'Period',
    `${config.label}${channelLabel}`,
    ...(seriesData.canCompare ? ['Previous period'] : []),
  ];

  const rows: (string | number)[][] = [headers];

  seriesData.buckets.forEach((b, idx) => {
    const curVal = (seriesData.cur[idx] ?? 0).toFixed(currentMetric === 'margin' ? 4 : 2);
    const row = [new Date(b.s).toISOString().slice(0, 10), b.label, curVal];
    if (seriesData.canCompare) {
      row.push((seriesData.prev[idx] ?? 0).toFixed(currentMetric === 'margin' ? 4 : 2));
    }
    rows.push(row);
  });

  const totalRow = [
    '',
    'Total',
    seriesData.total.toFixed(currentMetric === 'margin' ? 4 : 2),
  ];
  if (seriesData.canCompare) {
    totalRow.push(seriesData.prevTotal.toFixed(currentMetric === 'margin' ? 4 : 2));
  }
  rows.push(totalRow);

  const rangeCode = currentRange === 'ytd' ? 'ytd' : `${currentRange}d`;
  const fileName = `Vels-${config.label.toLowerCase().replace(/\W+/g, '-')}-${rangeCode}-by-${currentGranularity}-${new Date(Date.now()).toISOString().slice(0, 10)}.csv`;

  downloadFile(fileName, formatCsvRow(rows), 'text/csv');
  if (fromEl) playHaptic(fromEl);

  showToast(`${config.label} report exported — ${pluralize(seriesData.buckets.length, 'row')}`, {
    ico: 'download',
  });
}

function updateGranularityButtons(container: HTMLElement): void {
  domQueryAll('.an-gran .seg__btn', container).forEach((btn) => {
    (btn as HTMLButtonElement).disabled = !ALLOWED_GRANULARITIES[currentRange].includes(
      (btn as HTMLElement).dataset.value as Granularity
    );
  });
}

export function initOverviewSubtab(container: HTMLElement): void {
  bindQuickActions(container);
  bindMagnetic(container);
  positionMetricActiveRing(container, false);

  rangeSegCtrl = initSegmentedControl(domQuery('.an-range', container), (val) => {
    currentRange = val as RangePreset;
    if (!ALLOWED_GRANULARITIES[currentRange].includes(currentGranularity)) {
      currentGranularity = DEFAULT_GRANULARITY[currentRange];
      granSegCtrl?.select(currentGranularity, { silent: true });
    }
    updateGranularityButtons(container);
    updateMetricsGrid(container, false);
    updateMainChart(container, false);
  });

  granSegCtrl = initSegmentedControl(domQuery('.an-gran', container), (val) => {
    currentGranularity = val as Granularity;
    updateMetricsGrid(container, false);
    updateMainChart(container, false);
  });

  updateGranularityButtons(container);

  queryOne<HTMLElement>('[data-k="ov-metrics"]', container)?.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-metric]');
    if (btn && btn.dataset.metric !== currentMetric) {
      currentMetric = btn.dataset.metric as MetricKey;
      domQueryAll('[data-metric]', container).forEach((b) =>
        b.setAttribute('aria-pressed', String(b === btn))
      );
      positionMetricActiveRing(container, true);
      updateMainChart(container, false);
    }
  });

  queryOne<HTMLElement>('[data-k="ov-cmp"]', container)?.addEventListener('click', (e) => {
    playHaptic(e.currentTarget as HTMLElement);
    compareWithPrevious = !compareWithPrevious;
    updateMainChart(container, false);
  });

  queryOne<HTMLElement>('[data-k="ov-chan"]', container)?.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-chan]');
    if (btn && !btn.disabled && btn.dataset.chan !== currentChannel) {
      playHaptic(btn);
      currentChannel = btn.dataset.chan as string;
      domQueryAll('[data-chan]', container).forEach((b) =>
        b.setAttribute('aria-pressed', String(b.getAttribute('data-chan') === currentChannel))
      );
      updateMetricsGrid(container, false);
      updateMainChart(container, false);
    }
  });

  container.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;

    if (target.closest('[data-k="ov-clear"]')) {
      currentChannel = 'all';
      domQueryAll('[data-chan]', container).forEach((b) =>
        b.setAttribute('aria-pressed', String(b.getAttribute('data-chan') === 'all'))
      );
      updateMetricsGrid(container, false);
      updateMainChart(container, false);
    }

    const goalBtn = target.closest<HTMLElement>('[data-k="ov-goal"]');
    if (goalBtn) {
      openQuickCreateModal({
        title: 'Monthly sales goal',
        sub: 'Every channel together, before tax. The dashboard’s goal dial follows it.',
        from: goalBtn,
        submit: 'Save goal',
        fields: [
          {
            name: 'goal',
            label: 'Goal (INR)',
            type: 'number',
            value: store.settings.goal,
            min: 1000,
            step: 500,
            wide: true,
          },
        ],
        onSubmit: (vals) => {
          const num = Number(vals.goal);
          if (!(num >= 1000)) return 'Set a goal of at least ₹1,000.';
          setSalesGoal(num);
          showToast(`Goal set to ${formatMoneyRound(num)}`, { ico: 'trend' });
        },
      });
    }
  });

  queryOne<HTMLElement>('[data-k="ov-export"]', container)?.addEventListener('click', (e) =>
    exportOverviewReportCsv(e.currentTarget as HTMLElement)
  );
}

export function animateOverviewSubtab(container: HTMLElement): void {
  gsap
    .timeline()
    .add(animatePageTransition(container), 0)
    .add(animateCards(domQueryAll('.an-metric', container), { stagger: 0.06, y: 24 }), 0.05)
    .add(animateCards(domQueryAll('.an-main, .an-split > .card', container), { stagger: 0.1 }), 0.2)
    .add(animateRows(domQueryAll('.an-main__bar .chip, .an-main .card__tools > *', container), { y: -6, stagger: 0.04 }), 0.45);

  if (lineChartInstance) {
    updateMetricsGrid(container, true);
    updateMainChart(container, false);
    lineChartInstance.play(0.35);
    ringMeterInstance?.play(0.5);
    categoryBarsInstance?.play(0.5);
  } else {
    updateMetricsGrid(container, true);
    updateMainChart(container, true);
  }

  const ring = queryOne<HTMLElement>('.an-ring', container);
  if (ring) animatePop(ring, { from: 0.9, delay: 0.5 });
}
