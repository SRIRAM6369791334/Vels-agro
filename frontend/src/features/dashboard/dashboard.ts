import {
  formatTime,
  escapeHtml,
  formatRelativeDay,
  store,
  getAlertItems,
  setSalesGoal,
  filterOrdersByDateRange,
  showToast,
  getActiveOrdersForLocation,
  ONE_DAY_MS,
  renderEmptyState,
  getTotalStockUnits,
  renderTrendBadge,
  KANBAN_STAGES,
  bindQuickActions,
  queryOne,
  domQuery,
  findProductById,
  formatProductFullName,
  getActiveOrders,
  renderAvatar,
  motionDuration,
  formatCurrencyCompact,
  getDraftPoSupplierIds,
  findCustomerByEmail,
  renderTag,
  startOfToday,
  getLastMonthValue,
  getPendingOrdersCount,
  formatDate,
  getAvailableLocations,
  bindModalDismiss,
  getAvailableSuppliers,
  getMaterialStock,
  openNewPoModal,
  getMaterialInventoryValue,
  formatRelativeTime,
  getExpiringBatches,
  openMoveStockModal,
  formatInt,
  releaseBatch,
  findLocationById,
  animateTitle,
  formatMoney,
  updateBatchStatus,
  getLowStockMaterials,
  openNewTransferModal,
  animateRows,
  openQuickCreateModal,
  getLowStockProducts,
  openNewOrderModal,
  findMemberById,
  openMakeBatchModal,
  daysUntilExpiry,
  animateCards,
  exportDataBackup,
  formatMoneyRound,
  pluralize,
  renderIconButton,
  animatePop,
  gsap,
  renderPill,
  domQueryAll,
  ORDER_STATUS_META,
  advanceOrderStatus,
  initLiftAnimations,
  renderIcon,
  createCustomElement,
  findCustomerById,
  getLocationStockUnits,
  formatMoneyK,
  openNewBatchModal,
  startOfMonth,
  renderSegmentedControl,
  getOrderTotal,
  renderProductThumb,
  renderOrderStatusBadge,
  initSegmentedControl,
  STOCK_MOVE_REASON_NAMES,
} from "../../main.ts";
import { createFanMeter, createBarChart, createSparkline } from "../../shared/widgets/charts.ts";
let B;
let V = `overview`;
const He = new Set();
const subtabQuery = (e) => domQuery(`[data-sub="${e}"]`, B);
const dataKeyQuery = (e) => domQuery(`[data-k="${e}"]`, B);
const isCurrentSubtab = (e) => !!B && !B.hidden && V === e;
function getStockHistory(e) {
  let t = getTotalStockUnits();
  let n = startOfToday();
  let i = [];
  for (let a = 0; a < e; a++) {
    i.unshift(t);
    let e = n - a * ONE_DAY_MS;
    t -= store.moves
      .filter((t) => t.at >= e && t.at < e + 86400000 && findProductById(t.itemId))
      .reduce((acc, item) => acc + item.qty, 0);
  }
  return i;
}
function getMonthStartStock() {
  let e = startOfMonth(Date.now());
  return (
    getTotalStockUnits() -
    store.moves
      .filter((t) => t.at >= e && findProductById(t.itemId))
      .reduce((acc, item) => acc + item.qty, 0)
  );
}
const getLastMonthInventoryValue = () =>
  store.months[store.months.length - 2]?.value ?? getLastMonthValue();
function renderDashboardOverviewTemplate() {
  let e = store.settings.me.name.split(` `)[0];
  return `
  <div class="db-top">
    <section class="db-hello" aria-label="Welcome">
      <p class="db-hello__clock"><i aria-hidden="true"></i><span data-k="clock"></span></p>
      <h1 class="head__title db-hello__title" tabindex="-1">Welcome back, ${escapeHtml(e)}!</h1>
      <p class="db-hello__sub" data-k="hello-sub"></p>
      <div class="db-hello__acts">
        <button type="button" class="btn btn--primary btn--sm magnetic" data-act="order">${renderIcon(`plus`)}New order</button>
        <button type="button" class="btn btn--ghost btn--sm" data-act="batch">${renderIcon(`flask`)}Make a batch</button>
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
        <button type="button" class="btn btn--ghost btn--sm db-range" data-k="range" aria-haspopup="menu" aria-expanded="false"><span>Monthly</span>${renderIcon(`down`)}</button>
        ${renderIconButton(`arrow`, `Expand`, `data-expand`, `card__expand ibtn--sm`)}</div>
      </header>
      <div data-k="hb"></div>
      <p class="db-inv__foot" data-k="inv-foot"></p>
    </section>
    <section class="card db-sales" aria-labelledby="sales-t">
      <header class="card__head"><h2 class="card__title" id="sales-t">Sales overview</h2><div class="card__tools">${renderIconButton(`moreV`, `Sales options`, `data-k="sales-menu" aria-haspopup="menu" aria-expanded="false"`, `ibtn--sm`)}</div></header>
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
      <header class="card__head"><h2 class="card__title" id="act-t">Recent activities</h2><div class="card__tools">${renderIconButton(`moreV`, `Activity options`, `data-k="act-menu" aria-haspopup="menu" aria-expanded="false"`, `ibtn--sm`)}</div></header>
      <div class="rows" data-k="acts"></div>
    </section>
    <section class="card" aria-labelledby="al-t">
      <header class="card__head"><h2 class="card__title" id="al-t">Alerts &amp; notifications</h2><div class="card__tools">${renderIconButton(`moreV`, `Alert options`, `data-k="al-menu" aria-haspopup="menu" aria-expanded="false"`, `ibtn--sm`)}</div></header>
      <div class="rows" data-k="alerts"></div>
    </section>
    <section class="card" aria-labelledby="top-t">
      <header class="card__head"><div><h2 class="card__title" id="top-t">Top sellers</h2><p class="card__sub">Last 30 days, by revenue</p></div><div class="card__tools">${renderIconButton(`moreV`, `Top seller options`, `data-k="top-menu" aria-haspopup="menu" aria-expanded="false"`, `ibtn--sm`)}</div></header>
      <div class="rows" data-k="top"></div>
    </section>
  </div>
  <div class="db-tail">
    <section class="card db-ship" aria-labelledby="ship-t">
      <header class="card__head"><div><h2 class="card__title" id="ship-t">Ships today</h2><p class="card__sub" data-k="ship-sub"></p></div>
        <div class="card__tools"><a class="btn btn--ghost btn--sm" href="/orders/board">${renderIcon(`board`)}Open board</a></div></header>
      <div class="db-ship__meter"><span class="meter"><span class="meter__fill" data-k="ship-fill" style="--c:var(--teal)"></span></span><b class="num" data-k="ship-pct">0%</b></div>
      <div class="rows" data-k="ship"></div>
    </section>
    <section class="card db-locs" aria-labelledby="loc-t">
      <header class="card__head"><div><h2 class="card__title" id="loc-t">Stock by location</h2><p class="card__sub">Finished goods on the shelves</p></div>
        <div class="card__tools"><button type="button" class="btn btn--ghost btn--sm" data-act="transfer">${renderIcon(`swap`)}Move stock</button></div></header>
      <div class="db-locs__list" data-k="locs"></div>
    </section>
  </div>`;
}
function renderKpiCard(e) {
  return `<span class="kpi__head"><span class="kpi__label">${escapeHtml(e.label)}</span><span class="kpi__ico" style="--c:var(--${e.tone})">${renderIcon(e.ico)}</span></span>
    <span class="kpi__value"><b class="num" data-kv="${e.key}">${escapeHtml(e.fmt(e.value))}</b>${e.delta ?? ``}</span>
    <span class="kpi__note">${e.note}</span>
    <span class="kpi__art" aria-hidden="true">${e.art}</span>`;
}
const Je = {
  units: 0,
  value: 0,
  low: 0,
};
function G(e) {
  let t = getTotalStockUnits();
  let n = getMonthStartStock();
  let a = getLastMonthValue();
  let o = getLastMonthInventoryValue();
  let s = getLowStockProducts();
  let c = getAlertItems();
  let l = getLowStockMaterials();
  dataKeyQuery(`kpi-units`).innerHTML = renderKpiCard({
    key: `units`,
    label: `Units on hand`,
    value: t,
    fmt: formatInt,
    ico: `boxes`,
    tone: `pine`,
    delta: renderTrendBadge((t - n) / Math.max(1, n)),
    note: `${store.products.length} SKUs · ${store.locations.length} sites`,
    art: createSparkline(getStockHistory(14), `pine`, 120, 34),
  });
  dataKeyQuery(`kpi-value`).innerHTML = renderKpiCard({
    key: `value`,
    label: `Total stock value`,
    value: a,
    fmt: formatMoneyRound,
    ico: `layers`,
    tone: `ocean`,
    delta: renderTrendBadge((a - o) / Math.max(1, o)),
    note: `At cost`,
    art: createSparkline(
      store.weeks.map((e) => e.value),
      `ocean`,
      120,
      34
    ),
  });
  dataKeyQuery(`kpi-low`).innerHTML = renderKpiCard({
    key: `low`,
    label: `Low stock items`,
    value: s.length + l.length,
    fmt: formatInt,
    ico: `alert`,
    tone: `ochre`,
    delta: c.length
      ? `<span class="delta delta--bad">${renderIcon(`alert`)}${c.length} out</span>`
      : ``,
    note: `${s.length} products · ${l.length} materials`,
    art: `<span class="kpi__thumbs">${[...c, ...s.filter((e) => !c.includes(e))]
      .slice(0, 4)
      .map((e) => renderProductThumb(e, `sm`))
      .join(``)}</span>`,
  });
  [`units`, `value`, `low`].forEach((n) => {
    let r = queryOne(`[data-kv="${n}"]`, B);
    if (!r) {
      return;
    }
    let i = n === `units` ? t : n === `value` ? a : s.length + l.length;
    let o = n === `value` ? formatMoneyRound : formatInt;
    if (e) {
      getAvailableLocations(r, i, o, {
        from: 0,
        duration: 1.5,
        delay: 0.25,
      });
    } else {
      getAvailableLocations(r, i, o, {
        from: Je[n],
        duration: 0.9,
      });
      if (Je[n] !== i) {
        getAvailableSuppliers(r);
      }
    }
    Je[n] = i;
  });
  if (e) {
    domQueryAll(`.kpi__art .spark path`, B).forEach((e, t) => {
      let n = e.getTotalLength();
      gsap.fromTo(
        e,
        {
          strokeDasharray: n,
          strokeDashoffset: n,
        },
        {
          strokeDashoffset: 0,
          duration: motionDuration(1.3),
          delay: motionDuration(0.4 + t * 0.12),
          ease: `power2.inOut`,
          clearProps: `strokeDasharray,strokeDashoffset`,
        }
      );
    });
    animatePop(domQueryAll(`.kpi__thumbs .thumb`, B), {
      from: 0.4,
      delay: 0.6,
      stagger: 0.08,
    });
  }
}
function Ye() {
  let length = ot().filter((e) => KANBAN_STAGES.indexOf(e.status) < 3).length;
  dataKeyQuery(`hello-sub`).innerHTML =
    `Here’s what’s moving in the stockroom today — <b>${pluralize(length, `order`)}</b> to ship and <b>${pluralize(store.batches.filter((e) => e.status === `quarantine`).length, `batch`, `batches`)}</b> waiting on QA.`;
}
function Xe() {
  let t = queryOne(`[data-k="clock"]`, B);
  if (t) {
    t.textContent = `${new Date(Date.now()).toLocaleDateString(`en-US`, {
      weekday: `long`,
      month: `short`,
      day: `numeric`,
    })} · ${formatTime(Date.now())}`;
  }
}
let K = `monthly`;
let q = null;
function Ze(e) {
  let t = e === `weekly` ? store.weeks : store.months;
  if (e !== `quarterly`) {
    return t.map((e) => ({
      label: e.label,
      values: [e.stockIn, e.stockOut, e.value],
    }));
  }
  let n = [];
  store.months.forEach((e, t) => {
    let r = Math.floor(t / 3);
    let i =
      n[r] ??
      (n[r] = {
        label: `Q${r + 1}`,
        values: [0, 0, 0],
      });
    i.values[0] += e.stockIn;
    i.values[1] += e.stockOut;
    i.values[2] = e.value;
  });
  return n;
}
function Qe() {
  let e = Ze(K);
  let t = e[e.length - 1];
  let n = e[e.length - 2];
  if (!t) {
    return;
  }
  let r = (t.values[0] ?? 0) - (t.values[1] ?? 0);
  dataKeyQuery(`inv-foot`).innerHTML =
    `${K === `weekly` ? `This week` : K === `monthly` ? `This month` : `This quarter`} so far: <b>${formatMoneyRound(t.values[0] ?? 0)}</b> in, <b>${formatMoneyRound(t.values[1] ?? 0)}</b> out — net <b class="${r >= 0 ? `is-up` : `is-down`}">${r >= 0 ? `+` : `−`}${formatMoneyRound(Math.abs(r))}</b>${n ? ` · value ${renderTrendBadge(((t.values[2] ?? 0) - (n.values[2] ?? 0)) / Math.max(1, n.values[2] ?? 1))} on the last ${K === `weekly` ? `week` : K === `monthly` ? `month` : `quarter`}` : ``}`;
}
let J = `month`;
let $e = null;
function et() {
  let e = startOfMonth(Date.now());
  if (J === `month`) {
    return {
      rev: getMaterialInventoryValue(),
      n: filterOrdersByDateRange(e, Date.now() + ONE_DAY_MS).length,
      label: `Sales goal`,
    };
  }
  let t = startOfMonth(e - ONE_DAY_MS);
  return {
    rev: formatCurrencyCompact(t, e),
    n: filterOrdersByDateRange(t, e).length,
    label: `Last month`,
  };
}
function Y(e) {
  let t = et();
  let goal = store.settings.goal;
  let i = t.rev / goal;
  if ($e) {
    if (!e) {
      $e.update(i, t.label);
    }
  } else {
    $e = createFanMeter(dataKeyQuery(`fan`), {
      value: i,
      label: `Sales: ${formatMoneyRound(t.rev)} of a ${formatMoneyRound(goal)} goal`,
      sub: t.label,
    });
  }
  if (e) {
    $e.play(0.35);
  }
  getAvailableLocations(dataKeyQuery(`n-sales`), t.n, formatInt, {
    from: e ? 0 : undefined,
    duration: e ? 1.3 : 0.8,
    delay: e ? 0.4 : 0,
  });
  getAvailableLocations(dataKeyQuery(`t-sales`), t.rev, formatMoneyRound, {
    from: e ? 0 : undefined,
    duration: e ? 1.3 : 0.8,
    delay: e ? 0.4 : 0,
  });
  let a =
    new Date(new Date(Date.now()).getFullYear(), new Date(Date.now()).getMonth() + 1, 0).getDate() -
    new Date(Date.now()).getDate();
  dataKeyQuery(`goal-line`).innerHTML =
    J === `month`
      ? t.rev >= goal
        ? `${renderIcon(`sparkle`)}Goal of <b>${formatMoneyRound(goal)}</b> reached — ${formatMoneyRound(t.rev - goal)} over.`
        : `${renderIcon(`trend`)}<b>${formatMoneyRound(goal - t.rev)}</b> to the <b>${formatMoneyRound(goal)}</b> goal, ${pluralize(a, `day`)} left.`
      : `${renderIcon(`calendar`)}Last month closed at <b>${formatMoneyRound(t.rev)}</b>.`;
}
const tt = {
  stock: [`box`, `pine`],
  ship: [`truck`, `teal`],
  order: [`orders`, `sky`],
  return: [`return`, `ocean`],
  po: [`cart`, `ochre`],
  batch: [`flask`, `ocean`],
  transfer: [`swap`, `teal`],
  count: [`clipCheck`, `sage`],
  team: [`users`, `slate`],
  note: [`note`, `slate`],
};
const nt = (e) => {
  let [n, r] = tt[e.kind];
  return `<a class="row" href="${e.href ?? `/dashboard/activity`}" data-key="${e.id}">${renderTag(n, r)}<span class="row__txt"><b>${escapeHtml(e.title)}</b><small>${escapeHtml(e.text)}</small></span><span class="row__end">${formatRelativeTime(e.at)}</span></a>`;
};
function rt(e) {
  let t = dataKeyQuery(`acts`);
  let n =
    store.activity.slice(0, 4).map(nt).join(``) ||
    renderEmptyState(`Nothing yet today`, `Stock moves, orders and batches show up here.`, `clock`);
  if (e) {
    t.innerHTML = n;
  } else {
    bindModalDismiss(t, () => {
      t.innerHTML = n;
    });
  }
}
function it() {
  let e = getAlertItems();
  let t = getLowStockProducts().filter((t) => !e.includes(t));
  let n = getExpiringBatches();
  let a = getActiveOrders();
  let o = store.batches.filter((e) => e.status === `quarantine`);
  return [
    {
      key: `out`,
      tone: `rose`,
      ico: `box`,
      title: `Out of stock`,
      text: e.length
        ? `${pluralize(e.length, `product`)} out at Riverside DC`
        : `Nothing is out of stock`,
      href: `/dashboard/alerts`,
      n: e.length,
    },
    {
      key: `exp`,
      tone: `teal`,
      ico: `calX`,
      title: `Expiring soon`,
      text: n.length
        ? `${pluralize(n.length, `lot`)} expire within ${store.settings.prefs.expiryWarnDays} days`
        : `No lots near expiry`,
      href: `/products/batches`,
      n: n.length,
    },
    {
      key: `low`,
      tone: `ochre`,
      ico: `alert`,
      title: `Low stock alert`,
      text: `${pluralize(t.length + getLowStockMaterials().length, `item`)} running low`,
      href: `/dashboard/alerts`,
      n: t.length + getLowStockMaterials().length,
    },
    {
      key: `pend`,
      tone: `sky`,
      ico: `hourglass`,
      title: `Pending orders`,
      text: `${pluralize(a.length, `order`)} waiting to ship`,
      href: `/orders/board`,
      n: a.length,
    },
    {
      key: `qa`,
      tone: `ocean`,
      ico: `flask`,
      title: `Batches in QA`,
      text: `${pluralize(o.length, `batch`, `batches`)} waiting for release`,
      href: `/products/batches`,
      n: o.length,
    },
  ];
}
function X() {
  dataKeyQuery(`alerts`).innerHTML = it()
    .slice(0, 4)
    .map(
      (e) =>
        `<a class="row row--tint db-alert${e.n ? `` : ` is-clear`}" href="${e.href}" style="--c:var(--${e.tone})" data-key="${e.key}">${renderTag(e.ico, e.tone)}<span class="row__txt"><b>${escapeHtml(e.title)}</b><small>${escapeHtml(e.text)}</small></span>${renderIcon(`chevR`, `row__go`)}</a>`
    )
    .join(``);
}
function at() {
  let e = getPendingOrdersCount(3);
  dataKeyQuery(`top`).innerHTML =
    e
      .map(
        (e) =>
          `<a class="row db-top__row" href="/products/item/${e.product.id}" data-key="${e.product.id}">${renderProductThumb(e.product, `lg`)}<span class="row__txt"><b>${escapeHtml(e.product.name)}</b><small>${escapeHtml(e.product.size)} · <span class="mono">${escapeHtml(e.product.sku)}</span></small></span><span class="row__end"><b>${formatMoneyRound(e.revenue)}</b>${pluralize(e.orders, `order`)}</span></a>`
      )
      .join(``) ||
    renderEmptyState(`No sales yet`, `Top sellers appear after the first orders.`, `chart`);
}
function ot() {
  let e = startOfToday() + ONE_DAY_MS;
  return store.orders
    .filter(
      (t) =>
        t.status !== `cancelled` &&
        (KANBAN_STAGES.indexOf(t.status) < 3
          ? t.shipBy < e
          : (t.history.find((e) => e.to === `shipped`)?.at ?? 0) >= startOfToday())
    )
    .sort(
      (e, t) =>
        KANBAN_STAGES.indexOf(e.status) - KANBAN_STAGES.indexOf(t.status) || e.shipBy - t.shipBy
    );
}
const st = {
  new: `Start picking`,
  picking: `Packed`,
  packed: `Ship`,
};
function ct(e) {
  let n = ot();
  let length = n.filter((e) => KANBAN_STAGES.indexOf(e.status) >= 3).length;
  let i = n.length ? length / n.length : 1;
  dataKeyQuery(`ship-sub`).textContent =
    `${length} of ${pluralize(n.length, `order`)} out the door`;
  gsap.to(dataKeyQuery(`ship-fill`), {
    scaleX: Math.max(0.02, i),
    duration: motionDuration(e ? 1.2 : 0.7),
    delay: motionDuration(e ? 0.5 : 0),
    ease: `power3.inOut`,
  });
  getAvailableLocations(dataKeyQuery(`ship-pct`), i, (e) => `${Math.round(e * 100)}%`, {
    duration: 0.9,
    delay: e ? 0.5 : 0,
  });
  let a = dataKeyQuery(`ship`);
  let o =
    n
      .slice(0, 5)
      .map((e) => {
        let n = findCustomerById(e.customerId);
        return `<div class="row db-ship__row" data-key="${e.id}">
    ${renderAvatar(e.customerId, `md`)}<a class="row__txt" href="/orders/all/${e.id}"><b>${escapeHtml(n?.name ?? ``)}</b><small><span class="mono">${e.number}</span> · ${pluralize(
      e.lines.reduce((acc, line) => acc + line.qty, 0),
      `unit`
    )} · ${formatMoney(getOrderTotal(e))}</small></a>
    <span class="db-ship__st">${renderOrderStatusBadge(e.status)}</span>
    ${st[e.status] ? `<button type="button" class="btn btn--soft btn--xs" data-adv="${e.id}">${escapeHtml(st[e.status])}${renderIcon(`chevR`)}</button>` : `<span class="db-ship__done">${renderIcon(`check`)}</span>`}
  </div>`;
      })
      .join(``) ||
    renderEmptyState(`Nothing due today`, `Every order due today is out the door.`, `truck`);
  if (e) {
    a.innerHTML = o;
  } else {
    bindModalDismiss(a, () => {
      a.innerHTML = o;
    });
  }
}
function lt(e) {
  dataKeyQuery(`locs`).innerHTML = store.locations
    .map((n) => {
      let r = getLocationStockUnits(n.id);
      let i = Math.min(1, r / n.capacity);
      return `<a class="db-loc" href="/warehouses/locations/${n.id}" data-lift>
      ${renderTag(n.kind === `dc` ? `warehouse` : n.kind === `lab` ? `flask` : `store`, n.kind === `dc` ? `pine` : n.kind === `lab` ? `ocean` : `ochre`)}
      <span class="db-loc__txt"><b>${escapeHtml(n.name)}</b><small>${escapeHtml(n.city)}</small></span>
      <span class="db-loc__fig"><b class="num" data-lu="${n.id}">${formatInt(r)}</b><small>of ${formatInt(n.capacity)}</small></span>
      <span class="meter db-loc__meter"><span class="meter__fill" data-lf="${n.id}" style="--c:var(--${n.kind === `dc` ? `pine` : n.kind === `lab` ? `ocean` : `ochre`});transform:scaleX(${e ? 0 : i})"></span></span>
    </a>`;
    })
    .join(``);
  if (e) {
    store.locations.forEach((e, t) => {
      gsap.to(domQuery(`[data-lf="${e.id}"]`, B), {
        scaleX: Math.max(0.02, Math.min(1, getLocationStockUnits(e.id) / e.capacity)),
        duration: motionDuration(1.1),
        delay: motionDuration(0.5 + t * 0.1),
        ease: `power3.inOut`,
      });
      getAvailableLocations(
        domQuery(`[data-lu="${e.id}"]`, B),
        getLocationStockUnits(e.id),
        formatInt,
        {
          from: 0,
          duration: 1.2,
          delay: 0.5 + t * 0.1,
        }
      );
    });
  }
  initLiftAnimations(dataKeyQuery(`locs`));
}
function ut() {
  let e = subtabQuery(`overview`);
  e.innerHTML = renderDashboardOverviewTemplate();
  q = createBarChart(dataKeyQuery(`hb`), {
    groups: Ze(K),
    series: [
      {
        name: `Stock in`,
        tone: `teal`,
      },
      {
        name: `Stock out`,
        tone: `pine`,
      },
      {
        name: `Stock value`,
        tone: `sky`,
      },
    ],
    format: formatMoneyRound,
    axis: formatMoneyK,
    label: `Inventory statistics by month: stock in, stock out and stock value at cost`,
    pick: matchMedia(`(max-width: 760px)`).matches ? -1 : store.months.length - 1,
  });
  bindQuickActions(e);
  openMoveStockModal(e);
  initLiftAnimations(e);
  dataKeyQuery(`legend`).addEventListener(`click`, (e) => {
    let t = e.target.closest(`button[data-s]`);
    if (!t || !q) {
      return;
    }
    openNewTransferModal(t);
    let n = q.toggle(Number(t.dataset.s));
    if (
      n === false &&
      t.getAttribute(`aria-pressed`) === `true` &&
      domQueryAll(`button[aria-pressed="true"]`, dataKeyQuery(`legend`)).length === 1
    ) {
      showToast(`Keep at least one series on`, {
        ico: `info`,
      });
      return;
    }
    t.setAttribute(`aria-pressed`, String(n));
  });
  dataKeyQuery(`range`).addEventListener(`click`, (e) => {
    let e_currentTarget = e.currentTarget;
    createCustomElement(
      e_currentTarget,
      [`weekly`, `monthly`, `quarterly`].map((e) => ({
        label: e[0].toUpperCase() + e.slice(1),
        checked: e === K,
        onSelect: () => {
          if (e === K) {
            return;
          }
          K = e;
          domQuery(`span`, e_currentTarget).textContent = e[0].toUpperCase() + e.slice(1);
          let n = Ze(e);
          q?.update(n, matchMedia(`(max-width: 760px)`).matches ? -1 : n.length - 1);
          Qe();
        },
      })),
      {
        align: `end`,
      }
    );
  });
  dataKeyQuery(`sales-menu`).addEventListener(`click`, (e) => {
    let e_currentTarget = e.currentTarget;
    createCustomElement(e_currentTarget, [
      {
        label: `This month`,
        checked: J === `month`,
        onSelect: () => {
          J = `month`;
          Y(false);
        },
      },
      {
        label: `Last month`,
        checked: J === `last`,
        onSelect: () => {
          J = `last`;
          Y(false);
        },
      },
      `-`,
      {
        label: `Edit monthly goal`,
        icon: `edit`,
        onSelect: () =>
          openQuickCreateModal({
            title: `Monthly sales goal`,
            sub: `Every channel together, before tax.`,
            from: e_currentTarget,
            submit: `Save goal`,
            fields: [
              {
                name: `goal`,
                label: `Goal (INR)`,
                type: `number`,
                value: store.settings.goal,
                min: 1000,
                step: 500,
                wide: true,
              },
            ],
            onSubmit: (e) => {
              let t = Number(e.goal);
              if (!(t >= 1000)) {
                return `Set a goal of at least ₹1,000.`;
              }
              setSalesGoal(t);
              showToast(`Goal set to ${formatMoneyRound(t)}`, {
                ico: `trend`,
              });
            },
          }),
      },
      {
        label: `Sales analytics`,
        icon: `chart`,
        onSelect: () => {
          (window as any).navigateTo(`/analytics/sales`)
        },
      },
    ]);
  });
  dataKeyQuery(`act-menu`).addEventListener(`click`, (e) =>
    createCustomElement(e.currentTarget, [
      {
        label: `All activity`,
        icon: `list`,
        onSelect: () => {
          (window as any).navigateTo(`/dashboard/activity`)
        },
      },
      {
        label: `Stock ledger`,
        icon: `layers`,
        onSelect: () => {
          (window as any).navigateTo(`/dashboard/activity`)
        },
      },
    ])
  );
  dataKeyQuery(`al-menu`).addEventListener(`click`, (e) =>
    createCustomElement(e.currentTarget, [
      {
        label: `Every alert`,
        icon: `bell`,
        onSelect: () => {
          (window as any).navigateTo(`/dashboard/alerts`)
        },
      },
      {
        label: `Alert settings`,
        icon: `gear`,
        onSelect: () => {
          (window as any).navigateTo(`/settings/notifications`)
        },
      },
    ])
  );
  dataKeyQuery(`top-menu`).addEventListener(`click`, (e) =>
    createCustomElement(e.currentTarget, [
      {
        label: `Full catalog`,
        icon: `box`,
        onSelect: () => {
          (window as any).navigateTo(`/products/catalog`)
        },
      },
      {
        label: `Sales by product`,
        icon: `chart`,
        onSelect: () => {
          (window as any).navigateTo(`/analytics/sales`)
        },
      },
    ])
  );
  e.addEventListener(`click`, (e) => {
    let e_target = e.target;
    let n = e_target.closest(`[data-act]`);
    if (n) {
      openNewTransferModal(n);
      if (n.dataset.act === `order`) {
        openNewOrderModal({}, n, (e) => {
          (window as any).navigateTo(`/orders/all/${e.id}`)
        });
      } else if (n.dataset.act === `batch`) {
        openMakeBatchModal(undefined, n);
      } else if (n.dataset.act === `transfer`) {
        openNewBatchModal({}, n);
      }
      return;
    }
    let r = e_target.closest(`[data-adv]`);
    if (r) {
      openNewTransferModal(r);
      let e = advanceOrderStatus(r.dataset.adv);
      if (e) {
        showToast(e, {
          ico: `alert`,
        });
      }
    }
  });
}
function dt() {
  let e = subtabQuery(`overview`);
  gsap
    .timeline()
    .add(animateTitle(domQuery(`.db-hello__title`, e)), 0)
    .add(
      animateRows(domQueryAll(`.db-hello__clock, .db-hello__sub, .db-hello__acts > *`, e), {
        y: 10,
        stagger: 0.06,
      }),
      0.1
    )
    .add(
      animateCards(domQueryAll(`.kpi`, e), {
        stagger: 0.08,
      }),
      0.05
    )
    .add(
      animateCards(domQueryAll(`.db-mid > .card`, e), {
        stagger: 0.1,
      }),
      0.2
    )
    .add(
      animateCards(domQueryAll(`.db-low > .card, .db-tail > .card`, e), {
        stagger: 0.07,
      }),
      0.35
    )
    .add(
      animateRows(domQueryAll(`.db-low .row`, e), {
        y: 12,
        stagger: 0.04,
      }),
      0.6
    )
    .add(
      animateRows(domQueryAll(`.db-tail .row, .db-loc`, e), {
        y: 12,
        stagger: 0.05,
      }),
      0.75
    )
    .add(
      animateRows(domQueryAll(`.db-legend > *, .db-range`, e), {
        y: -6,
        stagger: 0.05,
      }),
      0.45
    );
  Xe();
  Ye();
  G(true);
  q?.play(0.45);
  Qe();
  Y(true);
  rt(true);
  X();
  at();
  ct(true);
  lt(true);
}
let ft = `all`;
let pt = ``;
let Z = 24;
const mt = [
  [`all`, `Everything`, []],
  [`stock`, `Stock`, [`stock`, `count`]],
  [`ship`, `Orders & shipping`, [`order`, `ship`, `return`]],
  [`batch`, `Batches`, [`batch`]],
  [`po`, `Purchasing`, [`po`]],
  [`transfer`, `Transfers`, [`transfer`]],
  [`team`, `Team`, [`team`, `note`]],
];
function ht() {
  let e = subtabQuery(`activity`);
  e.innerHTML = `<header class="head"><div class="head__lead"><div class="head__text"><p class="head__eyebrow">Everything that happened in the stockroom</p><h1 class="head__title" tabindex="-1">Activity</h1></div></div>
      <div class="head__actions"><a class="btn btn--ghost" href="/dashboard/overview">${renderIcon(`back`)}Overview</a></div></header>
    <div class="db-actgrid">
      <section class="card" aria-label="Activity log">
        <div class="toolbar"><div class="chips" data-k="a-kinds">${mt.map(([e, n]) => `<button type="button" class="chip" data-kind="${e}" aria-pressed="${e === ft}">${escapeHtml(n)}</button>`).join(``)}</div>
          <span class="toolbar__spacer"></span><label class="search">${renderIcon(`search`)}<input type="search" placeholder="Search activity…" aria-label="Search activity" data-k="a-q" /></label></div>
        <div class="tl" data-k="a-list"></div>
        <div class="db-more"><button type="button" class="btn btn--ghost btn--sm" data-k="a-more">Show more</button></div>
      </section>
      <aside class="db-actside">
        <section class="card" aria-labelledby="mv-t"><header class="card__head"><div><h2 class="card__title" id="mv-t">Last 7 days</h2><p class="card__sub">Finished goods, in units</p></div></header><div class="db-flow" data-k="flow"></div></section>
        <section class="card" aria-labelledby="led-t"><header class="card__head"><div><h2 class="card__title" id="led-t">Stock ledger</h2><p class="card__sub">The latest movements</p></div></header><div class="rows db-ledger" data-k="ledger"></div></section>
      </aside>
    </div>`;
  dataKeyQuery(`a-kinds`).addEventListener(`click`, (e) => {
    let t = e.target.closest(`[data-kind]`);
    if (t) {
      openNewTransferModal(t);
      ft = t.dataset.kind;
      Z = 24;
      domQueryAll(`[data-kind]`, dataKeyQuery(`a-kinds`)).forEach((e) =>
        e.setAttribute(`aria-pressed`, String(e === t))
      );
      Q(true);
    }
  });
  dataKeyQuery(`a-q`).addEventListener(`input`, (e) => {
    pt = e.target.value;
    Z = 24;
    Q(true);
  });
  dataKeyQuery(`a-more`).addEventListener(`click`, () => {
    Z += 24;
    Q(true);
  });
}
function Q(i) {
  let a = mt.find(([e]) => e === ft)?.[2] ?? [];
  let o = pt.trim().toLowerCase();
  let s = store.activity.filter(
    (e) =>
      (!a.length || a.includes(e.kind)) &&
      (!o || `${e.title} ${e.text} ${findMemberById(e.who)?.name ?? ``}`.toLowerCase().includes(o))
  );
  let c = s.slice(0, Z);
  let l = ``;
  let d = c.length
    ? c
        .map((r) => {
          let i = formatRelativeDay(r.at);
          let a = i === l ? `` : `<h3 class="tl__day" data-key="d-${i}">${escapeHtml(i)}</h3>`;
          l = i;
          let [o, s] = tt[r.kind];
          return `${a}<a class="tl__item" href="${r.href ?? `/dashboard/activity`}" data-key="${r.id}">${renderTag(o, s, `sm`)}<span class="tl__txt"><b>${escapeHtml(r.title)}</b><span>${escapeHtml(r.text)}</span><small>${renderAvatar(r.who, `xs`)}${escapeHtml(findMemberById(r.who)?.name ?? (r.who === `web` ? `Online store` : ``))} · ${formatTime(r.at)}</small></span></a>`;
        })
        .join(``)
    : renderEmptyState(`No activity matches`, `Try another filter or clear the search.`, `search`);
  let f = dataKeyQuery(`a-list`);
  if (i) {
    bindModalDismiss(f, () => {
      f.innerHTML = d;
    });
  } else {
    f.innerHTML = d;
  }
  dataKeyQuery(`a-more`).hidden = s.length <= Z;
}
function gt() {
  dataKeyQuery(`ledger`).innerHTML = store.moves
    .slice(0, 9)
    .map((e) => {
      let n = findProductById(e.itemId);
      let i = n
        ? formatProductFullName(n)
        : (store.materials.find((t) => t.id === e.itemId)?.name ?? e.itemId);
      return `<div class="row db-ledger__row">${n ? renderProductThumb(n, `sm`) : renderTag(`drop`, `ocean`, `sm`)}<span class="row__txt"><b>${escapeHtml(i)}</b><small>${escapeHtml(STOCK_MOVE_REASON_NAMES[e.kind])} · <span class="mono">${escapeHtml(e.ref)}</span> · ${escapeHtml(exportDataBackup(e.locId)?.name ?? ``)}</small></span><span class="row__end"><b class="${e.qty >= 0 ? `is-up` : `is-down`}">${e.qty >= 0 ? `+` : `−`}${formatInt(Math.abs(e.qty))}</b>${formatRelativeTime(e.at)}</span></div>`;
    })
    .join(``);
  let e = startOfToday() - 6 * ONE_DAY_MS;
  let n = store.moves.filter((t) => t.at >= e && findProductById(t.itemId));
  let i = (e, t) =>
    n
      .filter((n) => e(n.kind) && Math.sign(n.qty) === t)
      .reduce((acc, item) => acc + Math.abs(item.qty), 0);
  let a = [
    [`Released from QA`, i((e) => e === `production`, 1), `ocean`],
    [`Shipped to customers`, i((e) => e === `sale`, -1), `pine`],
    [`Moved between sites`, i((e) => e === `transfer`, 1), `teal`],
    [`Returned to shelf`, i((e) => e === `return`, 1), `sky`],
    [
      `Adjusted or counted`,
      i((e) => e === `adjust` || e === `count`, -1) + i((e) => e === `adjust` || e === `count`, 1),
      `ochre`,
    ],
  ];
  let o = Math.max(1, ...a.map((e) => e[1]));
  dataKeyQuery(`flow`).innerHTML = a
    .map(
      ([e, n, r]) =>
        `<div class="db-flow__row"><span>${escapeHtml(e)}</span><b class="num">${formatInt(n)}</b><span class="meter"><span class="meter__fill" data-to="${Math.max(0.02, n / o)}" style="--c:var(--${r});transform:scaleX(${Math.max(0.02, n / o)})"></span></span></div>`
    )
    .join(``);
}
function _t() {
  let e = subtabQuery(`activity`);
  gsap
    .timeline()
    .add(animateTitle(domQuery(`.head__title`, e)), 0)
    .add(
      animateRows(domQueryAll(`.head__eyebrow, .head__actions > *`, e), {
        y: 8,
      }),
      0.05
    )
    .add(
      animateCards(domQueryAll(`.card`, e), {
        stagger: 0.08,
      }),
      0.1
    )
    .add(
      animateRows(domQueryAll(`.tl__item, .tl__day`, e).slice(0, 16), {
        y: 12,
        stagger: 0.035,
      }),
      0.3
    )
    .add(
      animateRows(domQueryAll(`.db-ledger__row`, e), {
        x: 10,
        y: 0,
        stagger: 0.04,
      }),
      0.4
    );
  gsap.fromTo(
    domQueryAll(`.db-flow .meter__fill`, e),
    {
      scaleX: 0,
    },
    {
      scaleX: (e, t) => Number(t.dataset.to ?? 1),
      duration: motionDuration(1),
      stagger: motionDuration(0.08),
      delay: motionDuration(0.4),
      ease: `power3.inOut`,
    }
  );
}
let vt = `all`;
function yt() {
  let e = subtabQuery(`alerts`);
  e.innerHTML = `<header class="head"><div class="head__lead"><div class="head__text"><p class="head__eyebrow">What wants a decision today</p><h1 class="head__title" tabindex="-1">Alerts</h1></div></div>
      <div class="head__actions">${renderSegmentedControl(
        `Show`,
        [
          [`all`, `All`],
          [`stock`, `Stock`],
          [`expiry`, `Expiry & QA`],
          [`orders`, `Orders`],
        ],
        vt
      )}</div></header>
    <div class="db-alerts" data-k="al-groups"></div>`;
  initSegmentedControl(domQuery(`.seg`, e), (e) => {
    vt = e;
    $(true);
  });
  e.addEventListener(`click`, (e) => {
    let from = e.target.closest(`[data-do]`);
    if (!from) {
      return;
    }
    openNewTransferModal(from);
    let [n, r] = from.dataset.do.split(`:`);
    if (n === `batch`) {
      openMakeBatchModal(r, from);
    } else if (n === `move`) {
      openNewBatchModal(
        {
          from: `dc`,
          to: `shop`,
          productId: r,
        },
        from
      );
    } else if (n === `movein`) {
      openNewBatchModal(
        {
          from: `shop`,
          to: `dc`,
          productId: r,
        },
        from
      );
    } else if (n === `po`) {
      openNewPoModal(
        {
          materialId: r,
        },
        from
      );
    } else if (n === `reorder`) {
      let e = getDraftPoSupplierIds();
      showToast(
        e.length
          ? `Drafted ${pluralize(e.length, `purchase order`)}`
          : `Everything low is already on order`,
        {
          ico: `truck`,
        }
      );
    } else {
      if (n === `release`) {
        releaseBatch(r);
      } else if (n === `hold`) {
        openQuickCreateModal({
          title: `Put lot on hold`,
          sub: `Its units come off sale until it is released.`,
          from,
          submit: `Hold lot`,
          fields: [
            {
              name: `note`,
              label: `Reason`,
              wide: true,
              required: true,
              placeholder: `Selling at the studio as a sample`,
              value: `Near expiry — moving to sample stock`,
            },
          ],
          onSubmit: (e) => {
            updateBatchStatus(r, e.note);
          },
        });
      }
    }
  });
}
function $(e) {
  let a = getAlertItems();
  let o = getLowStockProducts().filter((e) => !a.includes(e));
  let s = getLowStockMaterials();
  let l = getExpiringBatches();
  let d = store.batches.filter((e) => e.status === `quarantine`);
  let f = getActiveOrders();
  let p = f.filter((e) => e.shipBy < Date.now());
  let m = (e, n, r, i = `btn--ghost`) =>
    `<button type="button" class="btn ${i} btn--xs" data-do="${e}">${renderIcon(r)}${escapeHtml(n)}</button>`;
  let h = [
    {
      key: `out`,
      tab: `stock`,
      title: `Out of stock`,
      tone: `rose`,
      ico: `box`,
      items: a.map(
        (e) =>
          `<div class="row al-item" data-key="o-${e.id}">${renderProductThumb(e, `md`)}<span class="row__txt"><b>${escapeHtml(formatProductFullName(e))}</b><small>${e.stock.dc ?? 0} at the DC${getActiveOrdersForLocation(e.id, `dc`) ? ` · ${getActiveOrdersForLocation(e.id, `dc`)} promised to orders` : ``} · ${e.stock.shop ?? 0} at the shop · ${store.batches.filter((t) => t.productId === e.id && t.status === `quarantine`).reduce((acc, item) => acc + item.qty, 0) || `none`} in QA</small></span><span class="al-acts">${m(`batch:${e.id}`, `Make a batch`, `flask`, `btn--primary`)}${(e.stock.shop ?? 0) > 0 ? m(`movein:${e.id}`, `Pull from shop`, `swap`) : ``}</span></div>`
      ),
    },
    {
      key: `low`,
      tab: `stock`,
      title: `Running low`,
      tone: `ochre`,
      ico: `alert`,
      items: o.map(
        (e) =>
          `<div class="row al-item" data-key="l-${e.id}">${renderProductThumb(e, `md`)}<span class="row__txt"><b>${escapeHtml(formatProductFullName(e))}</b><small>${getMaterialStock(e, `dc`)} free · reorder at ${e.reorderAt} · makes ${e.reorderQty} a run</small></span><span class="al-acts">${m(`batch:${e.id}`, `Make a batch`, `flask`, `btn--soft`)}</span></div>`
      ),
    },
    {
      key: `mat`,
      tab: `stock`,
      title: `Materials to reorder`,
      tone: `ochre`,
      ico: `drop`,
      items: s.map((e) => {
        let n = findCustomerByEmail(e.id);
        return `<div class="row al-item" data-key="m-${e.id}">${renderTag(`drop`, `ochre`)}<span class="row__txt"><b>${escapeHtml(e.name)}</b><small>${e.onHand} ${e.unit} on hand · reorder at ${e.reorderAt}${n ? ` · <b>${formatInt(n)} on order</b>` : ``}</small></span><span class="al-acts">${n ? renderPill(`On order`, `sky`) : m(`po:${e.id}`, `Order`, `cart`, `btn--soft`)}</span></div>`;
      }),
    },
    {
      key: `exp`,
      tab: `expiry`,
      title: `Expiring soon`,
      tone: `teal`,
      ico: `calX`,
      items: l.map((e) => {
        let n = findProductById(e.productId);
        let r = daysUntilExpiry(e);
        return `<div class="row al-item" data-key="e-${e.id}">${renderProductThumb(n, `md`)}<span class="row__txt"><b>${escapeHtml(formatProductFullName(n))} <span class="mono al-lot">${escapeHtml(e.lot)}</span></b><small>${e.left} left · expires ${formatDate(e.expiresAt, true)} (${r <= 0 ? `expired` : `in ${pluralize(r, `day`)}`})</small></span><span class="al-acts">${m(`move:${n.id}`, `Sell at the shop`, `store`, `btn--soft`)}${m(`hold:${e.id}`, `Hold`, `pause`)}</span></div>`;
      }),
    },
    {
      key: `qa`,
      tab: `expiry`,
      title: `Waiting on QA`,
      tone: `ocean`,
      ico: `flask`,
      items: d.map((e) => {
        let n = findProductById(e.productId);
        return `<div class="row al-item" data-key="q-${e.id}">${renderProductThumb(n, `md`)}<span class="row__txt"><b>${escapeHtml(formatProductFullName(n))} <span class="mono al-lot">${escapeHtml(e.lot)}</span></b><small>${e.qty} units · made ${formatRelativeTime(e.madeAt)} by ${escapeHtml(findMemberById(e.chemistId)?.name ?? ``)}${e.note ? ` · ${escapeHtml(e.note)}` : ``}</small></span><span class="al-acts">${m(`release:${e.id}`, `Release`, `shield`, `btn--primary`)}</span></div>`;
      }),
    },
    {
      key: `late`,
      tab: `orders`,
      title: `Late to ship`,
      tone: `rose`,
      ico: `clock`,
      items: p.map(
        (e) =>
          `<a class="row al-item" href="/orders/all/${e.id}" data-key="t-${e.id}">${renderAvatar(e.customerId, `md`)}<span class="row__txt"><b>${escapeHtml(findCustomerById(e.customerId)?.name ?? ``)}</b><small><span class="mono">${e.number}</span> · due ${formatRelativeTime(e.shipBy)} · ${ORDER_STATUS_META[e.status].name}</small></span>${renderIcon(`chevR`, `row__go`)}</a>`
      ),
    },
    {
      key: `pend`,
      tab: `orders`,
      title: `Waiting to ship`,
      tone: `sky`,
      ico: `hourglass`,
      items: f
        .filter((e) => !p.includes(e))
        .slice(0, 8)
        .map(
          (e) =>
            `<a class="row al-item" href="/orders/all/${e.id}" data-key="p-${e.id}">${renderAvatar(e.customerId, `md`)}<span class="row__txt"><b>${escapeHtml(findCustomerById(e.customerId)?.name ?? ``)}</b><small><span class="mono">${e.number}</span> · ship by ${formatRelativeDay(e.shipBy).toLowerCase()} · ${formatMoney(getOrderTotal(e))}</small></span>${renderOrderStatusBadge(e.status)}</a>`
        ),
    },
  ].filter((e) => (vt === `all` || e.tab === vt) && e.items.length);
  let g = h.length
    ? h
        .map(
          (
            e
          ) => `<section class="card al-group" data-key="g-${e.key}" style="--c:var(--${e.tone})" aria-labelledby="alg-${e.key}">
      <header class="card__head"><h2 class="card__title" id="alg-${e.key}">${renderTag(e.ico, e.tone, `sm`)}${escapeHtml(e.title)} <span class="al-n">${e.items.length}</span></h2>
      ${e.key === `mat` && s.some((e) => !findCustomerByEmail(e.id)) ? `<div class="card__tools">${m(`reorder`, `Draft every reorder`, `truck`, `btn--primary`)}</div>` : ``}</header>
      <div class="rows">${e.items.join(``)}</div></section>`
        )
        .join(``)
    : `<section class="card">${renderEmptyState(`All clear`, `Nothing here wants a decision right now. New alerts appear as stock moves.`, `shield`)}</section>`;
  let b = dataKeyQuery(`al-groups`);
  if (e) {
    bindModalDismiss(b, () => {
      b.innerHTML = g;
    });
  } else {
    b.innerHTML = g;
  }
}
function bt() {
  let e = subtabQuery(`alerts`);
  gsap
    .timeline()
    .add(animateTitle(domQuery(`.head__title`, e)), 0)
    .add(
      animateRows(domQueryAll(`.head__eyebrow, .head__actions > *`, e), {
        y: 8,
      }),
      0.05
    )
    .add(
      animateCards(domQueryAll(`.al-group, .db-alerts > .card`, e), {
        stagger: 0.08,
      }),
      0.12
    )
    .add(
      animateRows(domQueryAll(`.al-item`, e).slice(0, 14), {
        y: 10,
        stagger: 0.035,
      }),
      0.3
    );
}
function xt(e, t) {
  let n = V;
  V = e;
  domQueryAll(`[data-sub]`, B).forEach((t) => {
    t.hidden = t.dataset.sub !== e;
  });
  if (!He.has(e)) {
    He.add(e);
    if (e === `overview`) {
      ut();
    } else if (e === `activity`) {
      ht();
    } else {
      yt();
    }
  }
  if (e === `overview`) {
    if (t || n !== e) {
      dt();
    }
  } else if (e === `activity`) {
    Q(false);
    gt();
    _t();
  } else {
    $(false);
    bt();
  }
}
export const page = {
  title: (e) =>
    ({
      activity: `Activity`,
      alerts: `Alerts`,
    })[e[0] ?? ``] ?? `Dashboard`,
  mount(e) {
    B = e;
    B.innerHTML = `<div data-sub="overview" hidden></div><div data-sub="activity" hidden></div><div data-sub="alerts" hidden></div>`;
    findLocationById(`orders`, () => {
      if (isCurrentSubtab(`overview`)) {
        G(false);
        Y(false);
        ct(false);
        at();
        X();
        Ye();
      } else if (isCurrentSubtab(`alerts`)) {
        $(true);
      }
    });
    findLocationById(`products`, () => {
      if (isCurrentSubtab(`overview`)) {
        G(false);
        X();
        lt(false);
      } else if (isCurrentSubtab(`alerts`)) {
        $(true);
      }
    });
    findLocationById(`materials`, () => {
      if (isCurrentSubtab(`overview`)) {
        G(false);
        X();
      } else if (isCurrentSubtab(`alerts`)) {
        $(true);
      }
    });
    findLocationById(`batches`, () => {
      if (isCurrentSubtab(`overview`)) {
        X();
        Ye();
      } else if (isCurrentSubtab(`alerts`)) {
        $(true);
      }
    });
    findLocationById(`pos`, () => {
      if (isCurrentSubtab(`alerts`)) {
        $(true);
      }
    });
    findLocationById(`activity`, () => {
      if (isCurrentSubtab(`overview`)) {
        rt(false);
      } else if (isCurrentSubtab(`activity`)) {
        Q(true);
      }
    });
    findLocationById(`moves`, () => {
      if (isCurrentSubtab(`activity`)) {
        gt();
      }
    });
    findLocationById(`history`, () => {
      if (isCurrentSubtab(`overview`) && q) {
        q.update(Ze(K), q.pinned);
        Qe();
      }
    });
    findLocationById(`settings`, () => {
      if (isCurrentSubtab(`overview`)) {
        Y(false);
      }
    });
    let t = 0;
    gsap.ticker.add(() => {
      let e = Date.now();
      if (e - t > 10000 && isCurrentSubtab(`overview`)) {
        t = e;
        Xe();
      }
    });
  },
  enter({ params, same }) {
    let n = [`overview`, `activity`, `alerts`].includes(params[0] ?? ``) ? params[0] : `overview`;
    if (!(same && n === V && He.has(n))) {
      xt(n, true);
    }
  },
  leave() {},
};
