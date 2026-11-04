import {
  store,
  findProductById,
  findCustomerById,
  getLowStockProducts,
  getOutOfStockProducts,
  getLowStockMaterials,
} from '../../../core/store';
import {
  gsap,
  motionDuration,
  animateCounter,
  flashElement,
  playHaptic,
  bindMagnetic,
  initLiftAnimations,
  morphReplace,
  animateTitle,
  animateCards,
  animateRows,
  animatePop,
} from '../../../core/motion';
import { renderGroupedBarChart, renderFanMeter, renderSparklineSvg } from '../../../shared/widgets/charts';
import { domQuery, queryOne, domQueryAll, escapeHtml } from '../../../utils/dom';
import {
  formatInt,
  formatMoney,
  formatMoneyRound,
  formatMoneyK,
  formatTime,
  formatRelativeTime,
  pluralize,
} from '../../../utils/formatters';
import { openDropdownMenu } from '../../../ui/popover';
import { bindCardExpand } from '../components/card-expand';
import {
  getTotalStockUnits,
  getLocationStockUnits,
  getStockHistory,
  getMonthStartStock,
  getTotalInventoryValue,
  getLastMonthInventoryValue,
  getInventoryStatsGroups,
  getCurrentMonthSalesStats,
  getShippingOrdersToday,
  getDashboardAlertsSummary,
  getTopSellingProducts,
} from '../services/dashboard-metrics';
import {
  openNewOrderModal,
  openMakeBatchModal,
  openMoveStockModal,
  openQuickCreateModal,
  setSalesGoal,
  showToast,
  advanceOrderStatus,
  renderTag,
  renderAvatar,
  renderProductThumb,
  renderOrderStatusBadge,
  renderTrendBadge,
  renderEmptyState,
  renderIcon,
  renderIconButton,
} from '../../../main';

let invBarChart: any = null;
let salesFanMeter: any = null;
let currentRange = 'monthly';
let currentSalesMode = 'month';

const prevKpiState = {
  units: 0,
  value: 0,
  low: 0,
};

const ACTIVITY_KIND_META: Record<string, [string, string]> = {
  stock: ['box', 'pine'],
  ship: ['truck', 'teal'],
  order: ['orders', 'sky'],
  return: ['return', 'ocean'],
  po: ['cart', 'ochre'],
  batch: ['flask', 'ocean'],
  transfer: ['swap', 'teal'],
  count: ['clipCheck', 'sage'],
  team: ['users', 'slate'],
  note: ['note', 'slate'],
};

const STAGE_ACTION_LABELS: Record<string, string> = {
  new: 'Start picking',
  picking: 'Packed',
  packed: 'Ship',
};

export function renderDashboardOverviewTemplate(): string {
  const firstName = store.settings?.me?.name?.split(' ')[0] ?? 'there';
  return `
  <div class="db-top">
    <section class="db-hello" aria-label="Welcome">
      <p class="db-hello__clock"><i aria-hidden="true"></i><span data-k="clock"></span></p>
      <h1 class="head__title db-hello__title" tabindex="-1">Welcome back, ${escapeHtml(firstName)}!</h1>
      <p class="db-hello__sub" data-k="hello-sub"></p>
      <div class="db-hello__acts">
        <button type="button" class="btn btn--primary btn--sm magnetic" data-act="order">${renderIcon('plus')}New order</button>
        <button type="button" class="btn btn--ghost btn--sm" data-act="batch">${renderIcon('flask')}Make a batch</button>
      </div>
    </section>
    <a class="kpi" href="/products/catalog" data-lift data-k="kpi-units"></a>
    <a class="kpi" href="/analytics/stock" data-lift data-k="kpi-value"></a>
    <a class="kpi" href="/dashboard/alerts" data-lift data-k="kpi-low"></a>
  </div>
  <div class="db-mid">
    <section class="card db-inv" aria-labelledby="inv-t">
      <header class="card__head"><h2 class="card__title" id="inv-t">Inventory statistics</h2>
        <div class="card__tools"><div class="legend db-legend" data-k="legend">
          <button type="button" data-s="0" aria-pressed="true"><i class="tone--teal"></i>Stock in</button>
          <button type="button" data-s="1" aria-pressed="true"><i class="tone--pine"></i>Stock out</button>
          <button type="button" data-s="2" aria-pressed="true"><i class="tone--sky"></i>Stock value</button>
        </div>
        <button type="button" class="btn btn--ghost btn--sm db-range" data-k="range" aria-haspopup="menu" aria-expanded="false"><span>Monthly</span>${renderIcon('down')}</button>
        ${renderIconButton('arrow', 'Expand', 'data-expand', 'card__expand ibtn--sm')}</div>
      </header>
      <div data-k="hb"></div>
      <p class="db-inv__foot" data-k="inv-foot"></p>
    </section>
    <section class="card db-sales" aria-labelledby="sales-t">
      <header class="card__head"><h2 class="card__title" id="sales-t">Sales overview</h2><div class="card__tools">${renderIconButton('moreV', 'Sales options', 'data-k="sales-menu" aria-haspopup="menu" aria-expanded="false"', 'ibtn--sm')}</div></header>
      <div data-k="fan"></div>
      <dl class="db-sales__figs">
        <div><dt>Number of sales</dt><dd><b class="num" data-k="n-sales">0</b></dd></div>
        <div><dt>Total sales</dt><dd><b class="num" data-k="t-sales">₹0</b></dd></div>
      </dl>
      <p class="db-sales__goal" data-k="goal-line"></p>
    </section>
  </div>
  <div class="db-low">
    <section class="card" aria-labelledby="act-t">
      <header class="card__head"><h2 class="card__title" id="act-t">Recent activities</h2><div class="card__tools">${renderIconButton('moreV', 'Activity options', 'data-k="act-menu" aria-haspopup="menu" aria-expanded="false"', 'ibtn--sm')}</div></header>
      <div class="rows" data-k="acts"></div>
    </section>
    <section class="card" aria-labelledby="al-t">
      <header class="card__head"><h2 class="card__title" id="al-t">Alerts &amp; notifications</h2><div class="card__tools">${renderIconButton('moreV', 'Alert options', 'data-k="al-menu" aria-haspopup="menu" aria-expanded="false"', 'ibtn--sm')}</div></header>
      <div class="rows" data-k="alerts"></div>
    </section>
    <section class="card" aria-labelledby="top-t">
      <header class="card__head"><div><h2 class="card__title" id="top-t">Top sellers</h2><p class="card__sub">Last 30 days, by revenue</p></div><div class="card__tools">${renderIconButton('moreV', 'Top seller options', 'data-k="top-menu" aria-haspopup="menu" aria-expanded="false"', 'ibtn--sm')}</div></header>
      <div class="rows" data-k="top"></div>
    </section>
  </div>
  <div class="db-tail">
    <section class="card db-ship" aria-labelledby="ship-t">
      <header class="card__head"><div><h2 class="card__title" id="ship-t">Ships today</h2><p class="card__sub" data-k="ship-sub"></p></div>
        <div class="card__tools"><a class="btn btn--ghost btn--sm" href="/orders/board">${renderIcon('board')}Open board</a></div></header>
      <div class="db-ship__meter"><span class="meter"><span class="meter__fill" data-k="ship-fill" style="--c:var(--teal)"></span></span><b class="num" data-k="ship-pct">0%</b></div>
      <div class="rows" data-k="ship"></div>
    </section>
    <section class="card db-locs" aria-labelledby="loc-t">
      <header class="card__head"><div><h2 class="card__title" id="loc-t">Stock by location</h2><p class="card__sub">Finished goods on the shelves</p></div>
        <div class="card__tools"><button type="button" class="btn btn--ghost btn--sm" data-act="transfer">${renderIcon('swap')}Move stock</button></div></header>
      <div class="db-locs__list" data-k="locs"></div>
    </section>
  </div>`;
}

function renderKpiCard(kpi: {
  key: string;
  label: string;
  value: number;
  fmt: (v: number) => string;
  ico: string;
  tone: string;
  delta: string;
  note: string;
  art: string;
}): string {
  return `<span class="kpi__head"><span class="kpi__label">${escapeHtml(kpi.label)}</span><span class="kpi__ico" style="--c:var(--${kpi.tone})">${renderIcon(kpi.ico)}</span></span>
    <span class="kpi__value"><b class="num" data-kv="${kpi.key}">${escapeHtml(kpi.fmt(kpi.value))}</b>${kpi.delta ?? ''}</span>
    <span class="kpi__note">${kpi.note}</span>
    <span class="kpi__art" aria-hidden="true">${kpi.art}</span>`;
}

export function updateClock(container: HTMLElement): void {
  const clockEl = queryOne('[data-k="clock"]', container);
  if (clockEl) {
    clockEl.textContent = `${new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    })} · ${formatTime(Date.now())}`;
  }
}

export function updateHelloSub(container: HTMLElement): void {
  const ships = getShippingOrdersToday();
  const subEl = queryOne('[data-k="hello-sub"]', container);
  if (subEl) {
    const toShip = ships.filter((o: any) => ['new', 'picking', 'packed'].includes(o.status)).length;
    const qaBatches = (store.batches ?? []).filter((b: any) => b.status === 'quarantine').length;
    subEl.innerHTML = `Here’s what’s moving in the stockroom today — <b>${pluralize(toShip, 'order')}</b> to ship and <b>${pluralize(qaBatches, 'batch', 'batches')}</b> waiting on QA.`;
  }
}

export function updateKpiCards(container: HTMLElement, isMount: boolean): void {
  const units = getTotalStockUnits();
  const monthStartUnits = getMonthStartStock();
  const stockVal = getTotalInventoryValue();
  const lastMonthVal = getLastMonthInventoryValue();
  const lowProducts = getLowStockProducts();
  const outProducts = getOutOfStockProducts();
  const lowMaterials = getLowStockMaterials();

  const unitsEl = queryOne('[data-k="kpi-units"]', container);
  if (unitsEl) {
    unitsEl.innerHTML = renderKpiCard({
      key: 'units',
      label: 'Units on hand',
      value: units,
      fmt: formatInt,
      ico: 'boxes',
      tone: 'pine',
      delta: renderTrendBadge((units - monthStartUnits) / Math.max(1, monthStartUnits)),
      note: `${store.products?.length ?? 0} SKUs · ${store.locations?.length ?? 0} sites`,
      art: renderSparklineSvg(getStockHistory(14), 120, 34),
    });
  }

  const valueEl = queryOne('[data-k="kpi-value"]', container);
  if (valueEl) {
    valueEl.innerHTML = renderKpiCard({
      key: 'value',
      label: 'Total stock value',
      value: stockVal,
      fmt: formatMoneyRound,
      ico: 'layers',
      tone: 'ocean',
      delta: renderTrendBadge((stockVal - lastMonthVal) / Math.max(1, lastMonthVal)),
      note: 'At cost',
      art: renderSparklineSvg(
        (store.weeks ?? []).map((w: any) => w.value),
        120,
        34
      ),
    });
  }

  const lowEl = queryOne('[data-k="kpi-low"]', container);
  if (lowEl) {
    lowEl.innerHTML = renderKpiCard({
      key: 'low',
      label: 'Low stock items',
      value: lowProducts.length + lowMaterials.length,
      fmt: formatInt,
      ico: 'alert',
      tone: 'ochre',
      delta: outProducts.length
        ? `<span class="delta delta--bad">${renderIcon('alert')}${outProducts.length} out</span>`
        : '',
      note: `${lowProducts.length} products · ${lowMaterials.length} materials`,
      art: `<span class="kpi__thumbs">${[...outProducts, ...lowProducts.filter((p: any) => !outProducts.includes(p))]
        .slice(0, 4)
        .map((p: any) => renderProductThumb(p, 'sm'))
        .join('')}</span>`,
    });
  }

  ['units', 'value', 'low'].forEach((k) => {
    const valEl = queryOne<HTMLElement>(`[data-kv="${k}"]`, container);
    if (!valEl) return;
    const targetVal = k === 'units' ? units : k === 'value' ? stockVal : lowProducts.length + lowMaterials.length;
    const formatter = k === 'value' ? formatMoneyRound : formatInt;

    if (isMount) {
      animateCounter(valEl, targetVal, formatter, { from: 0, duration: 1.5, delay: 0.25 });
    } else {
      animateCounter(valEl, targetVal, formatter, { from: prevKpiState[k as keyof typeof prevKpiState], duration: 0.9 });
      if (prevKpiState[k as keyof typeof prevKpiState] !== targetVal) {
        flashElement(valEl);
      }
    }
    prevKpiState[k as keyof typeof prevKpiState] = targetVal;
  });

  if (isMount) {
    domQueryAll<SVGPathElement>('.kpi__art .spark path', container).forEach((path, idx) => {
      const len = path.getTotalLength();
      gsap.fromTo(
        path,
        { strokeDasharray: len, strokeDashoffset: len },
        {
          strokeDashoffset: 0,
          duration: motionDuration(1.3),
          delay: motionDuration(0.4 + idx * 0.12),
          ease: 'power2.inOut',
          clearProps: 'strokeDasharray,strokeDashoffset',
        }
      );
    });
    animatePop(queryOne('.kpi__thumbs', container), { from: 0.4, delay: 0.6, stagger: 0.08 });
  }
}

export function updateInventoryStatsFoot(container: HTMLElement): void {
  const groups = getInventoryStatsGroups(currentRange as any);
  const latest = groups[groups.length - 1];
  const prev = groups[groups.length - 2];
  const footEl = queryOne('[data-k="inv-foot"]', container);
  if (!footEl || !latest) return;

  const net = (latest.values[0] ?? 0) - (latest.values[1] ?? 0);
  const rangeName = currentRange === 'weekly' ? 'This week' : currentRange === 'monthly' ? 'This month' : 'This quarter';
  const unitName = currentRange === 'weekly' ? 'week' : currentRange === 'monthly' ? 'month' : 'quarter';

  footEl.innerHTML = `${rangeName} so far: <b>${formatMoneyRound(latest.values[0] ?? 0)}</b> in, <b>${formatMoneyRound(latest.values[1] ?? 0)}</b> out — net <b class="${net >= 0 ? 'is-up' : 'is-down'}">${net >= 0 ? '+' : '−'}${formatMoneyRound(Math.abs(net))}</b>${prev ? ` · value ${renderTrendBadge(((latest.values[2] ?? 0) - (prev.values[2] ?? 0)) / Math.max(1, prev.values[2] ?? 1))} on the last ${unitName}` : ''}`;
}

export function updateSalesOverview(container: HTMLElement, isMount: boolean): void {
  const stats = getCurrentMonthSalesStats(currentSalesMode as any);
  const goal = store.settings?.goal ?? 50000;
  const ratio = stats.rev / goal;
  const fanEl = queryOne<HTMLElement>('[data-k="fan"]', container);

  if (fanEl) {
    if (salesFanMeter) {
      if (!isMount) salesFanMeter.update(ratio, stats.label);
    } else {
      salesFanMeter = renderFanMeter(fanEl, ratio, 1);
    }
  }

  const nSalesEl = queryOne<HTMLElement>('[data-k="n-sales"]', container);
  const tSalesEl = queryOne<HTMLElement>('[data-k="t-sales"]', container);

  if (nSalesEl) {
    animateCounter(nSalesEl, stats.n, formatInt, { from: isMount ? 0 : undefined, duration: isMount ? 1.3 : 0.8, delay: isMount ? 0.4 : 0 });
  }
  if (tSalesEl) {
    animateCounter(tSalesEl, stats.rev, formatMoneyRound, { from: isMount ? 0 : undefined, duration: isMount ? 1.3 : 0.8, delay: isMount ? 0.4 : 0 });
  }

  const goalEl = queryOne('[data-k="goal-line"]', container);
  if (goalEl) {
    const daysLeft =
      new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate();
    goalEl.innerHTML =
      currentSalesMode === 'month'
        ? stats.rev >= goal
          ? `${renderIcon('sparkle')}Goal of <b>${formatMoneyRound(goal)}</b> reached — ${formatMoneyRound(stats.rev - goal)} over.`
          : `${renderIcon('trend')}<b>${formatMoneyRound(goal - stats.rev)}</b> to the <b>${formatMoneyRound(goal)}</b> goal, ${pluralize(daysLeft, 'day')} left.`
        : `${renderIcon('calendar')}Last month closed at <b>${formatMoneyRound(stats.rev)}</b>.`;
  }
}

export function updateRecentActivities(container: HTMLElement, isMount: boolean): void {
  const actsEl = queryOne<HTMLElement>('[data-k="acts"]', container);
  if (!actsEl) return;
  const listHtml =
    (store.activity ?? [])
      .slice(0, 4)
      .map((a: any) => {
        const [ico, tone] = ACTIVITY_KIND_META[a.kind] ?? ['clock', 'slate'];
        return `<a class="row" href="${a.href ?? '/dashboard/activity'}" data-key="${a.id}">${renderTag(ico, tone)}<span class="row__txt"><b>${escapeHtml(a.title)}</b><small>${escapeHtml(a.text)}</small></span><span class="row__end">${formatRelativeTime(a.at)}</span></a>`;
      })
      .join('') || renderEmptyState('Nothing yet today', 'Stock moves, orders and batches show up here.', 'clock');

  if (isMount) {
    actsEl.innerHTML = listHtml;
  } else {
    morphReplace(actsEl, () => {
      actsEl.innerHTML = listHtml;
    });
  }
}

export function updateAlertsList(container: HTMLElement): void {
  const alEl = queryOne('[data-k="alerts"]', container);
  if (!alEl) return;
  alEl.innerHTML = getDashboardAlertsSummary()
    .slice(0, 4)
    .map(
      (a) =>
        `<a class="row row--tint db-alert${a.n ? '' : ' is-clear'}" href="${a.href}" style="--c:var(--${a.tone})" data-key="${a.key}">${renderTag(a.ico, a.tone)}<span class="row__txt"><b>${escapeHtml(a.title)}</b><small>${escapeHtml(a.text)}</small></span>${renderIcon('chevR', 'row__go')}</a>`
    )
    .join('');
}

export function updateTopSellers(container: HTMLElement): void {
  const topEl = queryOne('[data-k="top"]', container);
  if (!topEl) return;
  const topItems = getTopSellingProducts(3);
  topEl.innerHTML =
    topItems
      .map(
        (t) =>
          `<a class="row db-top__row" href="/products/item/${t.product.id}" data-key="${t.product.id}">${renderProductThumb(t.product, 'lg')}<span class="row__txt"><b>${escapeHtml(t.product.name)}</b><small>${escapeHtml(t.product.size)} · <span class="mono">${escapeHtml(t.product.sku)}</span></small></span><span class="row__end"><b>${formatMoneyRound(t.revenue)}</b>${pluralize(t.orders, 'order')}</span></a>`
      )
      .join('') || renderEmptyState('No sales yet', 'Top sellers appear after the first orders.', 'chart');
}

export function updateShipsToday(container: HTMLElement, isMount: boolean): void {
  const orders = getShippingOrdersToday();
  const shippedCount = orders.filter((o: any) => ['shipped', 'delivered'].includes(o.status)).length;
  const ratio = orders.length ? shippedCount / orders.length : 1;

  const subEl = queryOne('[data-k="ship-sub"]', container);
  if (subEl) {
    subEl.textContent = `${shippedCount} of ${pluralize(orders.length, 'order')} out the door`;
  }

  const fillEl = queryOne<HTMLElement>('[data-k="ship-fill"]', container);
  if (fillEl) {
    gsap.to(fillEl, {
      scaleX: Math.max(0.02, ratio),
      duration: motionDuration(isMount ? 1.2 : 0.7),
      delay: motionDuration(isMount ? 0.5 : 0),
      ease: 'power3.inOut',
    });
  }

  const pctEl = queryOne<HTMLElement>('[data-k="ship-pct"]', container);
  if (pctEl) {
    animateCounter(pctEl, ratio, (v) => `${Math.round(v * 100)}%`, {
      duration: 0.9,
      delay: isMount ? 0.5 : 0,
    });
  }

  const shipRowsEl = queryOne<HTMLElement>('[data-k="ship"]', container);
  if (!shipRowsEl) return;
  const listHtml =
    orders
      .slice(0, 5)
      .map((o: any) => {
        const cust = findCustomerById(o.customerId);
        const totalUnits = (o.lines ?? []).reduce((acc: number, l: any) => acc + l.qty, 0);
        const totalCost = (o.lines ?? []).reduce((acc: number, l: any) => acc + l.qty * l.price, 0);
        return `<div class="row db-ship__row" data-key="${o.id}">
          ${renderAvatar(o.customerId, 'md')}<a class="row__txt" href="/orders/all/${o.id}"><b>${escapeHtml(cust?.name ?? '')}</b><small><span class="mono">${o.number}</span> · ${pluralize(totalUnits, 'unit')} · ${formatMoney(totalCost)}</small></a>
          <span class="db-ship__st">${renderOrderStatusBadge(o.status)}</span>
          ${STAGE_ACTION_LABELS[o.status] ? `<button type="button" class="btn btn--soft btn--xs" data-adv="${o.id}">${escapeHtml(STAGE_ACTION_LABELS[o.status])}${renderIcon('chevR')}</button>` : `<span class="db-ship__done">${renderIcon('check')}</span>`}
        </div>`;
      })
      .join('') || renderEmptyState('Nothing due today', 'Every order due today is out the door.', 'truck');

  if (isMount) {
    shipRowsEl.innerHTML = listHtml;
  } else {
    morphReplace(shipRowsEl, () => {
      shipRowsEl.innerHTML = listHtml;
    });
  }
}

export function updateLocations(container: HTMLElement, isMount: boolean): void {
  const locsEl = queryOne('[data-k="locs"]', container);
  if (!locsEl) return;
  locsEl.innerHTML = (store.locations ?? [])
    .map((l: any) => {
      const units = getLocationStockUnits(l.id);
      const ratio = Math.min(1, units / (l.capacity || 1));
      const tone = l.kind === 'dc' ? 'pine' : l.kind === 'lab' ? 'ocean' : 'ochre';
      const icon = l.kind === 'dc' ? 'warehouse' : l.kind === 'lab' ? 'flask' : 'store';
      return `<a class="db-loc" href="/warehouses/locations/${l.id}" data-lift>
        ${renderTag(icon, tone)}
        <span class="db-loc__txt"><b>${escapeHtml(l.name)}</b><small>${escapeHtml(l.city)}</small></span>
        <span class="db-loc__fig"><b class="num" data-lu="${l.id}">${formatInt(units)}</b><small>of ${formatInt(l.capacity)}</small></span>
        <span class="meter db-loc__meter"><span class="meter__fill" data-lf="${l.id}" style="--c:var(--${tone});transform:scaleX(${isMount ? 0 : ratio})"></span></span>
      </a>`;
    })
    .join('');

  if (isMount) {
    (store.locations ?? []).forEach((l: any, idx: number) => {
      const fillEl = queryOne(`[data-lf="${l.id}"]`, container);
      const numEl = queryOne<HTMLElement>(`[data-lu="${l.id}"]`, container);
      if (fillEl) {
        gsap.to(fillEl, {
          scaleX: Math.max(0.02, Math.min(1, getLocationStockUnits(l.id) / (l.capacity || 1))),
          duration: motionDuration(1.1),
          delay: motionDuration(0.5 + idx * 0.1),
          ease: 'power3.inOut',
        });
      }
      if (numEl) {
        animateCounter(numEl, getLocationStockUnits(l.id), formatInt, {
          from: 0,
          duration: 1.2,
          delay: 0.5 + idx * 0.1,
        });
      }
    });
  }
  initLiftAnimations(locsEl);
}

export function initDashboardOverview(container: HTMLElement): void {
  container.innerHTML = renderDashboardOverviewTemplate();

  const hbEl = queryOne<HTMLElement>('[data-k="hb"]', container);
  if (hbEl) {
    invBarChart = renderGroupedBarChart(hbEl, {
      groups: getInventoryStatsGroups(currentRange as any),
      series: [
        { name: 'Stock in', tone: 'teal' },
        { name: 'Stock out', tone: 'pine' },
        { name: 'Stock value', tone: 'sky' },
      ],
      format: formatMoneyRound,
      axis: formatMoneyK,
      label: 'Inventory statistics by month: stock in, stock out and stock value at cost',
      pick: matchMedia('(max-width: 760px)').matches ? -1 : (store.months?.length ?? 1) - 1,
    });
  }

  bindCardExpand(container);
  bindMagnetic(container);
  initLiftAnimations(container);

  const legendEl = queryOne('[data-k="legend"]', container);
  legendEl?.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-s]');
    if (!btn || !invBarChart) return;
    playHaptic(btn);
    const active = invBarChart.toggle(Number(btn.dataset.s));
    if (
      active === false &&
      btn.getAttribute('aria-pressed') === 'true' &&
      domQueryAll('button[aria-pressed="true"]', legendEl).length === 1
    ) {
      showToast('Keep at least one series on', { ico: 'info' });
      return;
    }
    btn.setAttribute('aria-pressed', String(active));
  });

  const rangeBtn = queryOne<HTMLElement>('[data-k="range"]', container);
  rangeBtn?.addEventListener('click', (e) => {
    const anchor = e.currentTarget as HTMLElement;
    openDropdownMenu(
      anchor,
      ['weekly', 'monthly', 'quarterly'].map((r) => ({
        label: r[0].toUpperCase() + r.slice(1),
        checked: r === currentRange,
        onSelect: () => {
          if (r === currentRange) return;
          currentRange = r;
          const span = queryOne('span', anchor);
          if (span) span.textContent = r[0].toUpperCase() + r.slice(1);
          const groups = getInventoryStatsGroups(r as any);
          invBarChart?.update(groups, matchMedia('(max-width: 760px)').matches ? -1 : groups.length - 1);
          updateInventoryStatsFoot(container);
        },
      })),
      { align: 'end' }
    );
  });

  const salesMenuBtn = queryOne<HTMLElement>('[data-k="sales-menu"]', container);
  salesMenuBtn?.addEventListener('click', (e) => {
    const anchor = e.currentTarget as HTMLElement;
    openDropdownMenu(anchor, [
      {
        label: 'This month',
        checked: currentSalesMode === 'month',
        onSelect: () => {
          currentSalesMode = 'month';
          updateSalesOverview(container, false);
        },
      },
      {
        label: 'Last month',
        checked: currentSalesMode === 'last',
        onSelect: () => {
          currentSalesMode = 'last';
          updateSalesOverview(container, false);
        },
      },
      '-',
      {
        label: 'Edit monthly goal',
        icon: 'edit',
        onSelect: () =>
          openQuickCreateModal({
            title: 'Monthly sales goal',
            sub: 'Every channel together, before tax.',
            from: anchor,
            submit: 'Save goal',
            fields: [
              {
                name: 'goal',
                label: 'Goal (INR)',
                type: 'number',
                value: store.settings?.goal ?? 50000,
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
          }),
      },
      {
        label: 'Sales analytics',
        icon: 'chart',
        onSelect: () => {
          (window as any).navigateTo('/analytics/sales');
        },
      },
    ]);
  });

  const actMenuBtn = queryOne<HTMLElement>('[data-k="act-menu"]', container);
  actMenuBtn?.addEventListener('click', (e) =>
    openDropdownMenu(e.currentTarget as HTMLElement, [
      {
        label: 'All activity',
        icon: 'list',
        onSelect: () => {
          (window as any).navigateTo('/dashboard/activity');
        },
      },
      {
        label: 'Stock ledger',
        icon: 'layers',
        onSelect: () => {
          (window as any).navigateTo('/dashboard/activity');
        },
      },
    ])
  );

  const alMenuBtn = queryOne<HTMLElement>('[data-k="al-menu"]', container);
  alMenuBtn?.addEventListener('click', (e) =>
    openDropdownMenu(e.currentTarget as HTMLElement, [
      {
        label: 'Every alert',
        icon: 'bell',
        onSelect: () => {
          (window as any).navigateTo('/dashboard/alerts');
        },
      },
      {
        label: 'Alert settings',
        icon: 'gear',
        onSelect: () => {
          (window as any).navigateTo('/settings/notifications');
        },
      },
    ])
  );

  const topMenuBtn = queryOne<HTMLElement>('[data-k="top-menu"]', container);
  topMenuBtn?.addEventListener('click', (e) =>
    openDropdownMenu(e.currentTarget as HTMLElement, [
      {
        label: 'Full catalog',
        icon: 'box',
        onSelect: () => {
          (window as any).navigateTo('/products/catalog');
        },
      },
      {
        label: 'Sales by product',
        icon: 'chart',
        onSelect: () => {
          (window as any).navigateTo('/analytics/sales');
        },
      },
    ])
  );

  container.addEventListener('click', (e) => {
    const actBtn = (e.target as HTMLElement).closest<HTMLElement>('[data-act]');
    if (actBtn) {
      playHaptic(actBtn);
      const act = actBtn.dataset.act;
      if (act === 'order') {
        openNewOrderModal({}, actBtn, (ord: any) => {
          (window as any).navigateTo(`/orders/all/${ord.id}`);
        });
      } else if (act === 'batch') {
        openMakeBatchModal(undefined, actBtn);
      } else if (act === 'transfer') {
        openMoveStockModal({}, actBtn);
      }
      return;
    }

    const advBtn = (e.target as HTMLElement).closest<HTMLElement>('[data-adv]');
    if (advBtn) {
      playHaptic(advBtn);
      const err = advanceOrderStatus(advBtn.dataset.adv);
      if (err) {
        showToast(err, { ico: 'alert' });
      }
    }
  });
}

export function animateDashboardOverview(container: HTMLElement): void {
  gsap
    .timeline()
    .add(animateTitle(queryOne('.db-hello__title', container)), 0)
    .add(
      animateRows(domQueryAll('.db-hello__clock, .db-hello__sub, .db-hello__acts > *', container), {
        y: 10,
        stagger: 0.06,
      }),
      0.1
    )
    .add(
      animateCards(domQueryAll('.kpi', container), {
        stagger: 0.08,
      }),
      0.05
    )
    .add(
      animateCards(domQueryAll('.db-mid > .card', container), {
        stagger: 0.1,
      }),
      0.2
    )
    .add(
      animateCards(domQueryAll('.db-low > .card, .db-tail > .card', container), {
        stagger: 0.07,
      }),
      0.35
    )
    .add(
      animateRows(domQueryAll('.db-low .row', container), {
        y: 12,
        stagger: 0.04,
      }),
      0.6
    )
    .add(
      animateRows(domQueryAll('.db-tail .row, .db-loc', container), {
        y: 12,
        stagger: 0.05,
      }),
      0.75
    )
    .add(
      animateRows(domQueryAll('.db-legend > *, .db-range', container), {
        y: -6,
        stagger: 0.05,
      }),
      0.45
    );

  updateClock(container);
  updateHelloSub(container);
  updateKpiCards(container, true);
  invBarChart?.play(0.45);
  updateInventoryStatsFoot(container);
  updateSalesOverview(container, true);
  updateRecentActivities(container, true);
  updateAlertsList(container);
  updateTopSellers(container);
  updateShipsToday(container, true);
  updateLocations(container, true);
}
