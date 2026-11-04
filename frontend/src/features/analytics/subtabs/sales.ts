import { store, findCustomerById } from '../../../core/store';
import { CATEGORY_TONES, CHANNEL_NAMES } from '../../../core/constants';
import {
  motionDuration,
  animateCards,
  animateRows,
  animateCounter,
  playHaptic,
  morphReplace,
  prefersReducedMotion,
  gsap,
} from '../../../core/motion';
import { renderLineChart, renderSparklineSvg } from '../../../shared/widgets/charts';
import { escapeHtml, queryOne, domQuery, domQueryAll } from '../../../utils/dom';
import {
  formatDate,
  formatInt,
  formatMoney,
  formatMoneyK,
  formatMoneyRound,
  formatPercent,
  formatRelativeTime,
  pluralize,
} from '../../../utils/formatters';
import { renderIcon } from '../../../utils/icons';
import {
  renderPageHeader,
  renderTag,
  renderAvatar,
  renderProductThumb,
  renderSegmentedControl,
  initSegmentedControl,
  renderEmptyState,
  highlightSearchMatch,
  exportOrdersCsv,
  getOrderTotal,
  generateDateSeries,
  openNewOrderModal,
  bindQuickActions,
  animatePageTransition,
} from '../../../main';
import { RangePreset, SalesChannel } from '../../../types/analytics';
import {
  CHANNELS,
  CHANNEL_TONES,
  addDays,
  getDateRangeBoundaries,
  getTimeBuckets,
  getRangeDayStats,
  sumChannelStats,
  isOrderActive,
} from '../services/stats-cache';

export const US_STATES: Record<string, string> = {
  OR: 'Oregon',
  TX: 'Texas',
  SC: 'South Carolina',
  GA: 'Georgia',
  MN: 'Minnesota',
  NC: 'North Carolina',
  NM: 'New Mexico',
  WA: 'Washington',
  VT: 'Vermont',
  IL: 'Illinois',
  AZ: 'Arizona',
  MA: 'Massachusetts',
  MI: 'Michigan',
  LA: 'Louisiana',
  CA: 'California',
  PA: 'Pennsylvania',
  CO: 'Colorado',
  WI: 'Wisconsin',
  FL: 'Florida',
  TN: 'Tennessee',
  VA: 'Virginia',
  NY: 'New York',
};

let currentRange: RangePreset = '30';
let sortColumn: 'units' | 'rev' = 'rev';
let searchFilter = '';
let channelChartInstance: any = null;

export const getPeriodOrders = (): any[] => {
  const { start, end } = getDateRangeBoundaries(currentRange);
  return store.orders.filter(
    (o) => isOrderActive(o) && o.createdAt >= start && o.createdAt < end
  );
};

export const getPriorPeriodOrders = (): any[] => {
  const { start, daysCount } = getDateRangeBoundaries(currentRange);
  const priorStart = addDays(start, -daysCount);
  return store.orders.filter(
    (o) => isOrderActive(o) && o.createdAt >= priorStart && o.createdAt < start
  );
};

export function renderSalesSubtab(): string {
  const orders = getPeriodOrders();
  const totalRev = orders.reduce((sum, o) => sum + getOrderTotal(o), 0);
  const totalUnits = orders.reduce(
    (sum, o) => sum + o.lines.reduce((lSum: number, line: any) => lSum + line.qty, 0),
    0
  );

  return `${renderPageHeader({
    eyebrow: 'Who buys, what sells, and when',
    title: 'Sales',
    actions: `${renderSegmentedControl(
      'Date range',
      [
        ['30', '30 days'],
        ['90', '90 days'],
      ],
      currentRange,
      'an-srange'
    )}
      <button type="button" class="btn btn--ghost" data-k="sa-export">${renderIcon('download')}Export orders</button>`,
    stats: [
      {
        key: 'rev',
        icon: 'dollar',
        label: 'Revenue',
        value: totalRev,
        fmt: 'money',
        ico: 'pine',
      },
      {
        key: 'orders',
        icon: 'orders',
        label: 'Orders',
        value: orders.length,
        ico: 'sky',
      },
      {
        key: 'aov',
        icon: 'receipt',
        label: 'Average order',
        value: orders.length ? totalRev / orders.length : 0,
        fmt: 'money',
        ico: 'ocean',
      },
      {
        key: 'units',
        icon: 'boxes',
        label: 'Units sold',
        value: totalUnits,
        ico: 'ochre',
      },
    ],
  })}
  <div class="an-row an-row--21">
    <section class="card" aria-labelledby="sa-ch-t">
      <header class="card__head"><div><h2 class="card__title" id="sa-ch-t">Revenue by channel</h2><p class="card__sub" data-k="sa-ch-sub"></p></div>
        <div class="card__tools"><div class="legend">${CHANNELS.map((ch) => `<span><i class="tone--${CHANNEL_TONES[ch]}"></i>${escapeHtml(CHANNEL_NAMES[ch])}</span>`).join('')}</div><button type="button" class="ibtn ibtn--sm card__expand" aria-label="Expand" title="Expand" data-expand>${renderIcon('arrow')}</button></div></header>
      <div data-k="sa-chart"></div>
      <div class="an-chsum" data-k="sa-chsum"></div>
    </section>
    <section class="card" aria-labelledby="sa-reg-t">
      <header class="card__head"><div><h2 class="card__title" id="sa-reg-t">Sales by state</h2><p class="card__sub">Where the revenue ships to</p></div></header>
      <ol class="an-rank" data-k="sa-regions"></ol>
    </section>
  </div>
  <section class="card an-tops" aria-labelledby="sa-top-t">
    <header class="card__head"><div><h2 class="card__title" id="sa-top-t">Products</h2><p class="card__sub" data-k="sa-top-sub"></p></div>
      <div class="card__tools"><label class="search">${renderIcon('search')}<input type="search" placeholder="Search products…" aria-label="Search products" data-k="sa-q" /></label></div></header>
    <div class="table-wrap"><table class="table table--stack an-ptable" style="--areas:'t r' 's p'">
      <thead><tr><th scope="col">Product</th><th scope="col" class="r" aria-sort="${sortColumn === 'units' ? 'descending' : 'none'}" data-th="units"><button type="button" data-sort="units">Units${renderIcon('down')}</button></th><th scope="col" class="r" aria-sort="${sortColumn === 'rev' ? 'descending' : 'none'}" data-th="rev"><button type="button" data-sort="rev">Revenue${renderIcon('down')}</button></th><th scope="col">Share</th><th scope="col" class="r">Daily units</th></tr></thead>
      <tbody data-k="sa-rows"></tbody>
    </table></div>
  </section>
  <div class="an-row an-row--32">
    <section class="card an-heat" aria-labelledby="sa-heat-t">
      <header class="card__head"><div><h2 class="card__title" id="sa-heat-t">When orders come in</h2><p class="card__sub" data-k="sa-heat-sub"></p></div></header>
      <div class="an-heat__wrap"><div class="an-heat__grid" data-k="sa-heat"></div><div class="an-heat__tip" data-k="sa-heat-tip" role="status" aria-live="polite"></div></div>
      <div class="an-heat__key"><span>Fewer</span><i></i><span>More</span></div>
    </section>
    <section class="card" aria-labelledby="sa-st-t">
      <header class="card__head"><div><h2 class="card__title" id="sa-st-t">Top stockists</h2><p class="card__sub">Wholesale accounts by revenue</p></div><div class="card__tools"><a class="btn btn--ghost btn--sm" href="/customers/stockists">${renderIcon('users')}All</a></div></header>
      <div class="rows" data-k="sa-stockists"></div>
    </section>
  </div>`;
}

export function updateSalesStats(container: HTMLElement): void {
  const currentOrders = getPeriodOrders();
  const priorOrders = getPriorPeriodOrders();

  const curRev = currentOrders.reduce((sum, o) => sum + getOrderTotal(o), 0);
  const prevRev = priorOrders.reduce((sum, o) => sum + getOrderTotal(o), 0);
  const curUnits = currentOrders.reduce(
    (sum, o) => sum + o.lines.reduce((lSum: number, line: any) => lSum + line.qty, 0),
    0
  );

  const updateStat = (key: string, val: number) => {
    const el = queryOne<HTMLElement>(`[data-stat="${key}"] b[data-count]`, container);
    if (el) {
      el.dataset.count = String(val);
      const fmt = el.dataset.fmt === 'money' ? formatMoneyRound : formatInt;
      animateCounter(el, val, fmt, { duration: 0.9 });
    }
  };

  updateStat('rev', curRev);
  updateStat('orders', currentOrders.length);
  updateStat('aov', currentOrders.length ? curRev / currentOrders.length : 0);
  updateStat('units', curUnits);

  const appendDelta = (key: string, cur: number, prev: number) => {
    const statValEl = queryOne<HTMLElement>(`[data-stat="${key}"] .stat__value`, container);
    if (!statValEl) return;
    queryOne('.badge', statValEl)?.remove();
    if (!prev) return;

    const diff = (cur - prev) / prev;
    const isGood = diff >= 0;
    statValEl.insertAdjacentHTML(
      'beforeend',
      `<span class="badge badge--${isGood ? 'good' : 'bad'}">${isGood ? '+' : '−'}${Math.abs(diff * 100).toFixed(1)}%</span>`
    );
  };

  appendDelta('rev', curRev, prevRev);
  appendDelta('orders', currentOrders.length, priorOrders.length);
}

export function updateChannelRevenueChart(container: HTMLElement, animate = false): void {
  const granularity = currentRange === '30' ? 'day' : 'week';
  const buckets = getTimeBuckets(currentRange, granularity);

  const series = CHANNELS.map((ch) => ({
    name: CHANNEL_NAMES[ch],
    tone: CHANNEL_TONES[ch],
    values: buckets.map((b) => sumChannelStats(getRangeDayStats(b.s, b.e).day, ch).rev),
  }));

  const labels = buckets.map((b) => b.label);
  const chartEl = queryOne<HTMLElement>('[data-k="sa-chart"]', container);

  if (channelChartInstance) {
    channelChartInstance.update(series, labels);
  } else if (chartEl) {
    channelChartInstance = renderLineChart(chartEl, {
      labels,
      series,
      format: formatMoneyK,
      height: 330,
      label: 'Revenue by channel over time',
    });
    if (animate) channelChartInstance.play(0.3);
  }

  const subEl = queryOne<HTMLElement>('[data-k="sa-ch-sub"]', container);
  if (subEl) {
    subEl.textContent = `${currentRange === '30' ? 'Last 30 days' : 'Last 90 days'}, by ${granularity}`;
  }

  const { start, end } = getDateRangeBoundaries(currentRange);
  const periodDayStats = getRangeDayStats(start, end).day;
  const overallRev = sumChannelStats(periodDayStats, 'all').rev || 1;

  const chSumEl = queryOne<HTMLElement>('[data-k="sa-chsum"]', container);
  if (chSumEl) {
    chSumEl.innerHTML = CHANNELS.map((ch) => {
      const totals = sumChannelStats(periodDayStats, ch);
      return `<div style="--c:var(--${CHANNEL_TONES[ch]})"><span><i class="dot"></i>${escapeHtml(CHANNEL_NAMES[ch])}</span><b class="num">${formatMoneyRound(totals.rev)}</b><small>${formatPercent(totals.rev / overallRev)} · ${pluralize(Math.round(totals.orders), 'order')}</small></div>`;
    }).join('');
  }
}

export function updateSalesByState(container: HTMLElement): void {
  const stateMap = new Map<string, { rev: number; count: number }>();

  getPeriodOrders().forEach((order) => {
    const region = findCustomerById(order.customerId)?.region || '—';
    const current = stateMap.get(region) ?? { rev: 0, count: 0 };
    current.rev += getOrderTotal(order);
    current.count += 1;
    stateMap.set(region, current);
  });

  const sorted = [...stateMap.entries()].sort((a, b) => b[1].rev - a[1].rev).slice(0, 8);
  const maxRev = Math.max(1, ...sorted.map((s) => s[1].rev));
  const totalRev = [...stateMap.values()].reduce((sum, s) => sum + s.rev, 0) || 1;

  const listEl = queryOne<HTMLElement>('[data-k="sa-regions"]', container);
  if (listEl) {
    listEl.innerHTML = sorted.length
      ? sorted
          .map(([region, data], idx) => {
            const stateName = US_STATES[region] ?? region;
            const barRatio = Math.max(0.02, data.rev / maxRev);
            const tone = idx === 0 ? 'pine' : 'ocean';

            return `<li data-key="${region}"><span class="an-rank__n">${idx + 1}</span><span class="an-rank__txt"><b>${escapeHtml(stateName)}</b><small>${pluralize(data.count, 'order')} · ${formatPercent(data.rev / totalRev)}</small></span><b class="num">${formatMoneyRound(data.rev)}</b><span class="meter"><span class="meter__fill" style="--c:var(--${tone});transform:scaleX(0)" data-to="${barRatio}"></span></span></li>`;
          })
          .join('')
      : `<li class="an-rank__empty">${renderEmptyState('No sales yet', 'Revenue by state appears with the first orders.', 'map')}</li>`;

    gsap.to(domQueryAll('.meter__fill', listEl), {
      scaleX: (_i, el) => Number((el as HTMLElement).dataset.to),
      duration: motionDuration(1),
      stagger: motionDuration(0.05),
      delay: motionDuration(0.3),
      ease: 'power3.inOut',
    });
  }
}

export function updateTopProductsTable(container: HTMLElement, withDismiss = false): void {
  const query = searchFilter.trim().toLowerCase();
  const { start, end } = getDateRangeBoundaries(currentRange);
  const productAggMap = new Map<string, { units: number; rev: number }>();

  store.orders
    .filter((o) => isOrderActive(o) && o.createdAt >= start && o.createdAt < end)
    .forEach((order) => {
      order.lines.forEach((line: any) => {
        const item = productAggMap.get(line.productId) ?? { units: 0, rev: 0 };
        item.units += line.qty;
        item.rev += line.qty * line.price;
        productAggMap.set(line.productId, item);
      });
    });

  const totalRev = [...productAggMap.values()].reduce((sum, i) => sum + i.rev, 0) || 1;
  const productsWithStats = store.products
    .map((p) => {
      const stats = productAggMap.get(p.id) ?? { units: 0, rev: 0 };
      return { p, ...stats, share: stats.rev / totalRev };
    })
    .sort((a, b) => (sortColumn === 'rev' ? b.rev - a.rev : b.units - a.units));

  const filtered = productsWithStats.filter(
    (item) => !query || `${item.p.name} ${item.p.size} ${item.p.sku} ${item.p.line}`.toLowerCase().includes(query)
  );

  const maxShare = Math.max(0.0001, ...productsWithStats.map((item) => item.share));
  const sparkDays = currentRange === '30' ? 30 : 91;

  const rowsHtml = filtered.length
    ? filtered
        .map((item, idx) => {
          let sparkSeries = generateDateSeries(item.p.id, sparkDays);
          if (sparkDays > 30) {
            const weeklyGrouped: number[] = [];
            for (let i = 0; i < sparkSeries.length; i += 7) {
              weeklyGrouped.push(sparkSeries.slice(i, i + 7).reduce((sum, n) => sum + n, 0));
            }
            sparkSeries = weeklyGrouped;
          }

          const tone = idx === 0 && !query ? 'pine' : (CATEGORY_TONES[item.p.category] ?? 'pine');
          const shareScale = Math.max(0.015, item.share / maxShare);

          return `<tr class="is-link" data-key="${item.p.id}" data-href="/products/item/${item.p.id}">
      <td class="a-t"><a class="prod" href="/products/item/${item.p.id}">${renderProductThumb(item.p, 'md')}<span><b>${highlightSearchMatch(item.p.name, query)}</b><small>${escapeHtml(item.p.size)} · <span class="mono">${highlightSearchMatch(item.p.sku, query)}</span></small></span></a></td>
      <td class="r a-p num" data-label="Units">${formatInt(item.units)}</td>
      <td class="r a-r"><b class="num an-ptable__rev">${formatMoneyRound(item.rev)}</b></td>
      <td class="a-s"><span class="an-share"><span class="meter"><span class="meter__fill" style="--c:var(--${tone});transform:scaleX(${shareScale})"></span></span><small class="num">${formatPercent(item.share, 1)}</small></span></td>
      <td class="r a-h"><span class="an-spark">${renderSparklineSvg(sparkSeries, CATEGORY_TONES[item.p.category] ?? 'pine', 96, 26)}</span></td>
    </tr>`;
        })
        .join('')
    : `<tr><td colspan="5">${renderEmptyState(`Nothing matches “${searchFilter.trim()}”`, 'Try a product name, size or SKU.', 'search', '<button type="button" class="btn btn--ghost btn--sm" data-k="sa-clear">Clear search</button>')}</td></tr>`;

  const tbody = queryOne<HTMLElement>('[data-k="sa-rows"]', container);
  if (tbody) {
    if (withDismiss) {
      morphReplace(tbody, () => {
        tbody.innerHTML = rowsHtml;
      });
    } else {
      tbody.innerHTML = rowsHtml;
    }
  }

  const subEl = queryOne<HTMLElement>('[data-k="sa-top-sub"]', container);
  if (subEl) {
    subEl.textContent = `${currentRange === '30' ? 'Last 30 days' : 'Last 90 days'} · sorted by ${sortColumn === 'rev' ? 'revenue' : 'units'}`;
  }

  domQueryAll('[data-th]', container).forEach((th) => {
    th.setAttribute('aria-sort', (th as HTMLElement).dataset.th === sortColumn ? 'descending' : 'none');
  });
}

export function updateHeatmap(container: HTMLElement, animate = false): void {
  const weekStartOffset = store.settings.prefs.weekStart === 'sun' ? 0 : 1;
  const daysOrder = Array.from({ length: 7 }, (_v, idx) => (weekStartOffset + idx) % 7);
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const gridData = daysOrder.map(() =>
    Array.from({ length: 16 }, () => ({ n: 0, rev: 0 }))
  );

  getPeriodOrders().forEach((order) => {
    const d = new Date(order.createdAt);
    const dayIdx = daysOrder.indexOf(d.getDay());
    const hourIdx = Math.min(15, Math.max(0, d.getHours() - 6));
    const cell = gridData[dayIdx]?.[hourIdx];
    if (cell) {
      cell.n += 1;
      cell.rev += getOrderTotal(order);
    }
  });

  const maxOrdersInCell = Math.max(1, ...gridData.flat().map((c) => c.n));

  const formatHour = (hour: number) => {
    if (hour === 12) return '12 pm';
    if (hour > 12) return `${hour - 12} pm`;
    return `${hour} am`;
  };

  let peak = { r: 0, c: 0, n: -1 };
  gridData.forEach((row, rIdx) => {
    row.forEach((cell, cIdx) => {
      if (cell.n > peak.n) {
        peak = { r: rIdx, c: cIdx, n: cell.n };
      }
    });
  });

  const heatEl = queryOne<HTMLElement>('[data-k="sa-heat"]', container);
  if (heatEl) {
    heatEl.style.setProperty('--cols', '16');
    heatEl.setAttribute('role', 'grid');
    heatEl.setAttribute('aria-label', 'Orders by day of week and hour');

    const headerHoursHtml = Array.from({ length: 16 }, (_v, idx) => {
      const hr = 6 + idx;
      return `<span class="an-heat__h" aria-hidden="true">${hr % 3 === 0 ? formatHour(hr).replace(' ', '') : ''}</span>`;
    }).join('');

    const gridRowsHtml = gridData
      .map((row, rIdx) => {
        const rowHeader = `<span class="an-heat__d" role="rowheader">${dayLabels[daysOrder[rIdx]]}</span>`;
        const cellsHtml = row
          .map((cell, cIdx) => {
            const isZero = cell.n === 0;
            const tabIdx = rIdx === peak.r && cIdx === peak.c ? 0 : -1;
            const intensity = (cell.n / maxOrdersInCell).toFixed(3);
            const hourRange = `${dayLabels[daysOrder[rIdx]]} ${formatHour(6 + cIdx)}–${formatHour(6 + cIdx + 1)}`;
            const tipData = `${hourRange}|${pluralize(cell.n, 'order')}|${formatMoneyRound(cell.rev)}`;

            return `<span class="an-heat__c${isZero ? ' is-zero' : ''}" role="gridcell" tabindex="${tabIdx}" style="--k:${intensity}" data-tip="${tipData}" aria-label="${dayLabels[daysOrder[rIdx]]} ${formatHour(6 + cIdx)}: ${pluralize(cell.n, 'order')}"></span>`;
          })
          .join('');
        return `${rowHeader}${cellsHtml}`;
      })
      .join('');

    heatEl.innerHTML = `<span class="an-heat__corner" aria-hidden="true"></span>${headerHoursHtml}${gridRowsHtml}`;

    const subEl = queryOne<HTMLElement>('[data-k="sa-heat-sub"]', container);
    if (subEl) {
      subEl.innerHTML =
        peak.n > 0
          ? `Busiest: <b>${dayLabels[daysOrder[peak.r]]} ${formatHour(6 + peak.c)}–${formatHour(6 + peak.c + 1)}</b> · ${pluralize(peak.n, 'order')} in ${currentRange === '30' ? 'last 30 days' : 'last 90 days'}`
          : 'No orders in this range';
    }

    const cells = domQueryAll('.an-heat__c', heatEl);
    if (!prefersReducedMotion.matches) {
      gsap.fromTo(
        cells,
        { opacity: 0, scale: 0.3 },
        {
          opacity: 1,
          scale: 1,
          duration: motionDuration(0.5),
          ease: 'back.out(2)',
          stagger: {
            grid: [7, 16],
            from: [0, 0],
            amount: motionDuration(animate ? 1 : 0.6),
          },
          delay: motionDuration(animate ? 0.4 : 0),
          clearProps: 'transform,opacity',
        }
      );
    }
  }
}

export function updateTopStockists(container: HTMLElement): void {
  const stockistMap = new Map<string, { rev: number; count: number; last: number }>();

  getPeriodOrders()
    .filter((o) => o.channel === 'wholesale')
    .forEach((order) => {
      const cur = stockistMap.get(order.customerId) ?? { rev: 0, count: 0, last: 0 };
      cur.rev += getOrderTotal(order);
      cur.count += 1;
      cur.last = Math.max(cur.last, order.createdAt);
      stockistMap.set(order.customerId, cur);
    });

  const sorted = [...stockistMap.entries()].sort((a, b) => b[1].rev - a[1].rev).slice(0, 6);
  const stockistsEl = queryOne<HTMLElement>('[data-k="sa-stockists"]', container);

  if (stockistsEl) {
    stockistsEl.innerHTML = sorted.length
      ? sorted
          .map(([cId, data]) => {
            const customer = findCustomerById(cId);
            return `<div class="row an-stk" data-key="${cId}">
        ${renderAvatar(cId, 'md')}<a class="row__txt" href="/customers/stockists/${cId}"><b>${escapeHtml(customer?.name ?? '')}</b><small>${escapeHtml(customer?.city ?? '')}, ${escapeHtml(customer?.region ?? '')} · ${pluralize(data.count, 'order')} · last ${formatRelativeTime(data.last)}</small></a>
        <span class="row__end"><b>${formatMoneyRound(data.rev)}</b></span>
        <button type="button" class="ibtn ibtn--sm" data-reorder="${cId}" aria-label="New order for ${escapeHtml(customer?.name ?? '')}" title="New order">${renderIcon('plus')}</button>
      </div>`;
          })
          .join('')
      : renderEmptyState(
          'No wholesale orders',
          'Stockists appear here once they order in this range.',
          'store'
        );
  }
}

export function updateSalesSubtab(container: HTMLElement, animate = false): void {
  updateSalesStats(container);
  updateChannelRevenueChart(container, animate);
  updateSalesByState(container);
  updateTopProductsTable(container, !animate);
  updateHeatmap(container, animate);
  updateTopStockists(container);

  if (!animate) {
    animateRows(domQueryAll('.an-stk', container), {
      x: 10,
      y: 0,
      stagger: 0.04,
    });
  }
}

export function initSalesSubtab(container: HTMLElement): void {
  bindQuickActions(container);

  const rangeCtrl = domQuery('.an-srange', container);
  if (rangeCtrl) {
    initSegmentedControl(rangeCtrl, (val) => {
      currentRange = val as RangePreset;
      updateSalesSubtab(container, false);
    });
  }

  queryOne<HTMLElement>('[data-k="sa-export"]', container)?.addEventListener('click', (e) => {
    playHaptic(e.currentTarget as HTMLElement);
    exportOrdersCsv();
  });

  const searchInput = queryOne<HTMLInputElement>('[data-k="sa-q"]', container);
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchFilter = (e.target as HTMLInputElement).value;
      updateTopProductsTable(container, true);
    });
  }

  container.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;

    const sortBtn = target.closest<HTMLElement>('[data-sort]');
    if (sortBtn) {
      playHaptic(sortBtn);
      sortColumn = sortBtn.dataset.sort as 'units' | 'rev';
      updateTopProductsTable(container, true);
      return;
    }

    if (target.closest('[data-k="sa-clear"]')) {
      searchFilter = '';
      if (searchInput) searchInput.value = '';
      updateTopProductsTable(container, true);
      return;
    }

    const reorderBtn = target.closest<HTMLElement>('[data-reorder]');
    if (reorderBtn) {
      playHaptic(reorderBtn);
      const custId = reorderBtn.dataset.reorder;
      openNewOrderModal({ customerId: custId }, reorderBtn, (createdOrder: any) => {
        (window as any).navigateTo(`/orders/all/${createdOrder.id}`);
      });
      return;
    }

    const prodRow = target.closest<HTMLElement>('tr[data-href]');
    if (prodRow && !target.closest('a, button')) {
      (window as any).navigateTo(prodRow.dataset.href);
    }
  });

  // Heatmap interactive tooltip and keyboard navigation
  const heatEl = queryOne<HTMLElement>('[data-k="sa-heat"]', container);
  const tipEl = queryOne<HTMLElement>('[data-k="sa-heat-tip"]', container);

  const showTooltip = (cell: HTMLElement | null) => {
    if (!tipEl || !heatEl) return;
    if (!cell) {
      tipEl.style.opacity = '0';
      return;
    }

    const [header, ordersText, revText] = (cell.dataset.tip ?? '').split('|');
    tipEl.innerHTML = `<b>${escapeHtml(header)}</b><span>${escapeHtml(ordersText)} · ${escapeHtml(revText)}</span>`;

    const heatRect = heatEl.parentElement!.getBoundingClientRect();
    const cellRect = cell.getBoundingClientRect();
    tipEl.style.opacity = '1';

    gsap.set(tipEl, {
      x: Math.max(
        0,
        Math.min(heatRect.width - tipEl.offsetWidth, cellRect.left - heatRect.left + cellRect.width / 2 - tipEl.offsetWidth / 2)
      ),
      y: Math.max(0, cellRect.top - heatRect.top - tipEl.offsetHeight - 8),
    });
  };

  if (heatEl) {
    heatEl.addEventListener('pointerover', (e) => showTooltip((e.target as HTMLElement).closest('.an-heat__c')));
    heatEl.addEventListener('pointerleave', () => showTooltip(null));
    heatEl.addEventListener('focusin', (e) => showTooltip((e.target as HTMLElement).closest('.an-heat__c')));
    heatEl.addEventListener('focusout', () => showTooltip(null));

    heatEl.addEventListener('keydown', (e) => {
      const cells = domQueryAll('.an-heat__c', heatEl);
      const activeIdx = cells.indexOf(document.activeElement as HTMLElement);
      const cols = Number(heatEl.style.getPropertyValue('--cols')) || 1;
      const keyMap: Record<string, number> = {
        ArrowRight: 1,
        ArrowLeft: -1,
        ArrowDown: cols,
        ArrowUp: -cols,
      };

      if (activeIdx < 0 || !(e.key in keyMap)) return;
      e.preventDefault();

      const nextIdx = Math.max(0, Math.min(cells.length - 1, activeIdx + keyMap[e.key]));
      const nextCell = cells[nextIdx] as HTMLElement;
      if (nextCell) {
        cells.forEach((c) => ((c as HTMLElement).tabIndex = -1));
        nextCell.tabIndex = 0;
        nextCell.focus();
      }
    });
  }
}

export function animateSalesSubtab(container: HTMLElement): void {
  gsap
    .timeline()
    .add(animatePageTransition(container), 0)
    .add(animateCards(domQueryAll('.card', container), { stagger: 0.07 }), 0.15)
    .add(animateRows(domQueryAll('.an-ptable tbody tr', container).slice(0, 12), { y: 10, stagger: 0.035 }), 0.45)
    .add(animateRows(domQueryAll('.an-rank li, .an-stk, .an-chsum > div', container), { x: 10, y: 0, stagger: 0.04 }), 0.4);

  updateSalesSubtab(container, true);
  if (channelChartInstance) channelChartInstance.play(0.3);

  domQueryAll('.an-share .meter__fill', container).forEach((fillEl, idx) => {
    const targetScale = Number(/scaleX\(([\d.]+)\)/.exec((fillEl as HTMLElement).style.transform)?.[1] ?? 1);
    gsap.fromTo(
      fillEl,
      { scaleX: 0 },
      {
        scaleX: targetScale,
        duration: motionDuration(1),
        delay: motionDuration(0.5 + idx * 0.03),
        ease: 'power3.inOut',
      }
    );
  });
}
