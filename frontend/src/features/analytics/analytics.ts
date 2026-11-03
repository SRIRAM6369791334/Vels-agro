import {
  escapeHtml,
  store,
  setSalesGoal,
  showToast,
  ONE_DAY_MS,
  renderEmptyState,
  renderTrendBadge,
  bindQuickActions,
  queryOne,
  animatePageTransition,
  domQuery,
  findProductById,
  CATEGORY_TONES,
  formatProductFullName,
  CHANNEL_NAMES,
  renderAvatar,
  getTotalStockCostValue,
  motionDuration,
  renderTag,
  downloadFile,
  startOfToday,
  getLastMonthValue,
  formatDate,
  getAvailableLocations,
  bindModalDismiss,
  getMaterialStock,
  formatRelativeTime,
  openMoveStockModal,
  formatInt,
  findLocationById,
  exportOrdersCsv,
  getOrdersByCustomer,
  formatMoney,
  openNewTransferModal,
  renderProgressBar,
  animateRows,
  openQuickCreateModal,
  Flip,
  formatPercent,
  openNewOrderModal,
  renderFilterBar,
  openMakeBatchModal,
  daysUntilExpiry,
  animateCards,
  formatShortDate,
  exportStockCsv,
  exportDataBackup,
  formatMoneyRound,
  openScheduleCountModal,
  pluralize,
  generateDateSeries,
  animatePop,
  highlightSearchMatch,
  gsap,
  renderPill,
  domQueryAll,
  startOfDay,
  initLiftAnimations,
  renderIcon,
  bindMagnetic,
  findCustomerById,
  renderPageHeader,
  formatMoneyK,
  openNewBatchModal,
  startOfMonth,
  renderSegmentedControl,
  getOrderTotal,
  renderProductThumb,
  getProductStock,
  initSegmentedControl,
  formatCsvRow,
  getRecentOrders,
} from "../../main.ts";
import {
  createHorizontalBarChart,
  createDonutChart,
  createRingMeter,
  createSparkline,
  createLineChart,
} from "../../shared/widgets/charts.ts";
let P;
let Ue = `overview`;
const We = new Set();
const F = (e) => domQuery(`[data-sub="${e}"]`, P);
const I = (e) => domQuery(`[data-k="${e}"]`, P);
const L = (e) => !!P && !P.hidden && Ue === e;
const R = [`wholesale`, `online`, `studio`];
const Ge = {
  wholesale: `pine`,
  online: `sky`,
  studio: `ochre`,
};
const z = () => ({
  o: {
    wholesale: 0,
    online: 0,
    studio: 0,
  },
  c: Object.fromEntries(
    R.map((e) => [
      e,
      Object.fromEntries(
        formatShortDate.map((e) => [
          e,
          {
            rev: 0,
            units: 0,
            cogs: 0,
          },
        ])
      ),
    ])
  ),
});
function Ke(e, t, n = 1) {
  R.forEach((r) => {
    e.o[r] += t.o[r] * n;
    formatShortDate.forEach((i) => {
      let a = e.c[r][i];
      let o = t.c[r][i];
      a.rev += o.rev * n;
      a.units += o.units * n;
      a.cogs += o.cogs * n;
    });
  });
}
const qe = [0.5, 2, 2, 2, 2, 2, 1.5];
const B = (e, t) => {
  let n = new Date(e);
  n.setDate(n.getDate() + t);
  return n.getTime();
};
let V = null;
let H = 0;
let Je = z();
let Ye = 1;
function Xe() {
  V = new Map();
  let e = Infinity;
  for (let n of store.orders) {
    if (!getOrdersByCustomer(n)) {
      continue;
    }
    let t = startOfDay(n.createdAt);
    e = Math.min(e, t);
    let r = V.get(t);
    if (!r) {
      V.set(t, (r = z()));
    }
    r.o[n.channel] += 1;
    for (let e of n.lines) {
      let t = findProductById(e.productId);
      if (!t) {
        continue;
      }
      let i = r.c[n.channel][t.category];
      i.rev += e.qty * e.price;
      i.units += e.qty;
      i.cogs += e.qty * t.cost;
    }
  }
  H = isFinite(e) ? e : startOfToday();
  let Bn_months = store.months;
  let r = Bn_months.filter((e, t) => e.start >= H && t < Bn_months.length - 1);
  Je = z();
  let a = 0;
  let o = r[0]?.start ?? H;
  let s = r.length
    ? (Bn_months[Bn_months.indexOf(r[r.length - 1]) + 1]?.start ?? startOfToday())
    : startOfToday() + ONE_DAY_MS;
  for (let e = o; e < s; e = B(e, 1)) {
    let t = V.get(e);
    if (t) {
      Ke(Je, t);
    }
    a += qe[new Date(e).getDay()];
  }
  let c = r.length ? r.reduce((acc, item) => acc + item.stockOut, 0) / r.length : 1;
  Ye = 1 / Math.max(1, a * c);
}
const Ze = () => {
  V = null;
};
function Qe(e) {
  if (!V) {
    Xe();
  }
  if (e >= H) {
    return V.get(e) ?? z();
  }
  let n = new Date(e);
  let r = new Date(Date.now()).getFullYear();
  if (n.getFullYear() !== r) {
    return null;
  }
  let i = store.months[n.getMonth()];
  if (!i) {
    return null;
  }
  let a = z();
  Ke(a, Je, qe[n.getDay()] * i.stockOut * Ye);
  return a;
}
function U(e, t) {
  let day = z();
  let known = true;
  let est = false;
  for (let a = startOfDay(e); a < t; a = B(a, 1)) {
    let e = Qe(a);
    if (!e) {
      known = false;
      continue;
    }
    if (a < H) {
      est = true;
    }
    Ke(day, e);
  }
  return {
    day,
    known,
    est,
  };
}
function W(day, t) {
  let n = {
    rev: 0,
    orders: 0,
    units: 0,
    cogs: 0,
  };
  (t === `all` ? R : [t]).forEach((t) => {
    n.orders += day.o[t];
    formatShortDate.forEach((r) => {
      let i = day.c[t][r];
      n.rev += i.rev;
      n.units += i.units;
      n.cogs += i.cogs;
    });
  });
  return n;
}
function $e(day, t, n) {
  let r = {
    rev: 0,
    orders: 0,
    units: 0,
    cogs: 0,
  };
  (t === `all` ? R : [t]).forEach((t) => {
    let i = day.c[t][n];
    r.rev += i.rev;
    r.units += i.units;
    r.cogs += i.cogs;
  });
  return r;
}
function et(e) {
  let n = Date.now();
  if (e >= n) {
    return getLastMonthValue();
  }
  if (e >= n - 42 * 86400000) {
    return (
      getLastMonthValue() -
      store.moves.filter((t) => t.at > e).reduce((acc, item) => acc + item.value, 0)
    );
  }
  let r = store.weeks.length && e >= store.weeks[0].start ? store.weeks : store.months;
  let i = r.map((e, t) => [r[t + 1]?.start ?? n, e.value]);
  let a = r[0];
  if (a) {
    i.unshift([a.start, a.value - a.stockIn + a.stockOut]);
  }
  if (!i.length) {
    return getLastMonthValue();
  }
  if (e <= i[0][0]) {
    return i[0][1];
  }
  for (let t = 1; t < i.length; t++) {
    let [n, r] = i[t - 1];
    let [a, o] = i[t];
    if (e <= a) {
      return r + ((o - r) * (e - n)) / Math.max(1, a - n);
    }
  }
  return i[i.length - 1][1];
}
const fmt = (e) => formatPercent(e, 1);
const G = {
  rev: {
    label: `Revenue`,
    icon: `dollar`,
    tone: `pine`,
    fmt: formatMoneyRound,
    axis: formatMoneyK,
    note: `Order value before tax, every channel`,
  },
  orders: {
    label: `Orders`,
    icon: `orders`,
    tone: `sky`,
    fmt: formatInt,
    axis: formatInt,
    note: `Orders placed, cancelled ones left out`,
  },
  units: {
    label: `Units sold`,
    icon: `boxes`,
    tone: `ochre`,
    fmt: formatInt,
    axis: formatInt,
    note: `Bottles, jars and tubes on those orders`,
  },
  aov: {
    label: `Avg order value`,
    icon: `receipt`,
    tone: `ocean`,
    fmt: formatMoney,
    axis: formatMoneyK,
    note: `Revenue divided by orders`,
  },
  stock: {
    label: `Stock value`,
    icon: `layers`,
    tone: `teal`,
    fmt: formatMoneyRound,
    axis: formatMoneyK,
    note: `Products and materials at cost, at each period’s close`,
  },
  margin: {
    label: `Gross margin`,
    icon: `trend`,
    tone: `sage`,
    fmt,
    axis: (e) => formatPercent(e),
    note: `Revenue less the cost of the goods sold`,
  },
};
const nt = Object.keys(G);
const K = {
  30: `Last 30 days`,
  90: `Last 90 days`,
  ytd: `This year`,
};
const rt = {
  30: [`day`, `week`],
  90: [`day`, `week`, `month`],
  ytd: [`week`, `month`],
};
const it = {
  30: `day`,
  90: `week`,
  ytd: `month`,
};
function at(e) {
  let end = startOfToday() + ONE_DAY_MS;
  let start =
    e === `ytd` ? new Date(new Date(Date.now()).getFullYear(), 0, 1).getTime() : B(end, -Number(e));
  return {
    start,
    end,
    n: Math.round((end - start) / ONE_DAY_MS),
  };
}
function ot(e, n) {
  let { start, end } = at(e);
  let a = store.settings.prefs.weekStart === `sun` ? 0 : 1;
  let o = [];
  let s = start;
  while (s < end) {
    let e = new Date(s);
    let e_1;
    if (n === `day`) {
      e_1 = B(s, 1);
    } else if (n === `week`) {
      let n = (e.getDay() - a + 7) % 7;
      e_1 = B(s, 7 - n);
    } else {
      e_1 = new Date(e.getFullYear(), e.getMonth() + 1, 1).getTime();
    }
    e_1 = Math.min(e_1, end);
    o.push({
      s,
      e: e_1,
      label:
        n === `month`
          ? e.toLocaleDateString(`en-US`, {
              month: `short`,
            })
          : formatDate(s),
    });
    s = e_1;
  }
  return o;
}
function st(e, n, r, i) {
  if (e === `stock`) {
    let e = Math.min(r, Date.now());
    return {
      v: et(e),
      known: e > (store.months[0]?.start ?? 0),
      est: false,
    };
  }
  let a = U(n, r);
  let o = W(a.day, i);
  return {
    v:
      e === `rev`
        ? o.rev
        : e === `orders`
          ? o.orders
          : e === `units`
            ? o.units
            : e === `aov`
              ? o.orders
                ? o.rev / o.orders
                : 0
              : o.rev
                ? (o.rev - o.cogs) / o.rev
                : 0,
    known: a.known,
    est: a.est,
  };
}
function ct(e, t, n, r) {
  let { start, end, n: n_1 } = at(t);
  let buckets = ot(t, n);
  let c = buckets.map((t) => st(e, t.s, t.e, r));
  let l = buckets
    .map((e) => ({
      s: B(e.s, -n_1),
      e: B(e.e, -n_1),
    }))
    .map((t) => st(e, t.s, t.e, r));
  let u = st(e, start, end, r);
  let d = st(e, B(start, -n_1), start, r);
  let canCompare = l.every((e) => e.known) && d.known;
  let p = e === `stock` ? 1 : W(U(start, end).day, r).orders;
  return {
    buckets,
    cur: c.map((e) => e.v),
    prev: l.map((e) => e.v),
    canCompare,
    total: u.v,
    prevTotal: d.v,
    est: c.some((e) => e.est) || (canCompare && l.some((e) => e.est)),
    empty: !p,
  };
}
let q = `rev`;
let J = `30`;
let Y = `day`;
let lt = true;
let X = `all`;
let ut = null;
let dt = formatMoneyK;
let ft = null;
let pt = null;
let mt = null;
const ht = {
  parts: [],
  center: ``,
  sub: ``,
  label: `Breakdown by channel`,
};
let gt = null;
let _t = formatMoneyRound;
const vt = {
  labels: formatShortDate,
  values: [],
  format: (e) => _t(e),
  tone: `pine`,
  label: `Breakdown by category`,
};
function yt() {
  return `${renderPageHeader({
    eyebrow: `Build a report from your own numbers`,
    title: `Reports`,
    actions: `${renderSegmentedControl(
      `Date range`,
      [
        [`30`, `30 days`],
        [`90`, `90 days`],
        [`ytd`, `This year`],
      ],
      J,
      `an-range`
    )}
      <button type="button" class="btn btn--primary magnetic" data-k="ov-export">${renderIcon(`download`)}Export CSV</button>`,
  })}
  <div class="an-metrics" role="group" aria-label="Metric" data-k="ov-metrics">
    ${nt
      .map(
        (
          t
        ) => `<button type="button" class="an-metric" data-metric="${t}" aria-pressed="${t === q}" style="--c:var(--${G[t].tone})">
      <span class="an-metric__top"><span class="an-metric__ico">${renderIcon(G[t].icon)}</span><span class="an-metric__label">${escapeHtml(G[t].label)}</span></span>
      <b class="an-metric__val num" data-mv="${t}">0</b>
      <span class="an-metric__foot"><span data-md="${t}"></span><span class="an-metric__spark" data-ms="${t}"></span></span>
    </button>`
      )
      .join(``)}
    <span class="an-ring" aria-hidden="true"></span>
  </div>
  <section class="card an-main" aria-labelledby="ov-chart-t">
    <header class="card__head">
      <div><h2 class="card__title" id="ov-chart-t"><span data-k="ov-title">Revenue</span></h2><p class="card__sub" data-k="ov-sub"></p></div>
      <div class="card__tools">
        ${renderSegmentedControl(
          `Group by`,
          [
            [`day`, `Day`],
            [`week`, `Week`],
            [`month`, `Month`],
          ],
          Y,
          `an-gran`
        )}
        <span class="an-cmp"><button type="button" class="switch" role="switch" aria-checked="true" aria-labelledby="ov-cmp-l" data-k="ov-cmp"></button><span id="ov-cmp-l">Compare</span></span>
        <button type="button" class="ibtn ibtn--sm card__expand" aria-label="Expand" title="Expand" data-expand>${renderIcon(`arrow`)}</button>
      </div>
    </header>
    <div class="an-main__bar">
      <div class="chips" role="group" aria-label="Channel" data-k="ov-chan">
        ${[[`all`, `All channels`], ...R.map((e) => [e, CHANNEL_NAMES[e]])].map(([t, n]) => `<button type="button" class="chip" data-chan="${t}" aria-pressed="${t === X}">${t === `all` ? `` : `<i class="dot" style="--c:var(--${Ge[t]})"></i>`}${escapeHtml(n)}</button>`).join(``)}
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
const bt = (e, total, prevTotal, canCompare) => {
  if (!canCompare) {
    return `<span class="an-metric__na">${J === `ytd` ? `First year in Vels` : `—`}</span>`;
  }
  if (e === `margin`) {
    let e = (total - prevTotal) * 100;
    return `<span class="delta delta--${e >= 0 ? `good` : `bad`}">${renderIcon(e >= 0 ? `trend` : `trendDown`)}${e >= 0 ? `+` : `−`}${Math.abs(e).toFixed(1)} pts</span>`;
  }
  if (prevTotal) {
    return renderTrendBadge((total - prevTotal) / prevTotal);
  }
  return ``;
};
function xt(e, cur, tone, r) {
  e.innerHTML = createSparkline(cur.length > 1 ? cur : [0, ...cur], tone, 84, 26);
  let i = queryOne(`path`, e);
  if (!i || !r || bindMagnetic()) {
    return;
  }
  let a = i.getTotalLength();
  gsap.fromTo(
    i,
    {
      strokeDasharray: a,
      strokeDashoffset: a,
    },
    {
      strokeDashoffset: 0,
      duration: motionDuration(1),
      ease: `power2.inOut`,
      clearProps: `strokeDasharray,strokeDashoffset`,
    }
  );
}
function St(e) {
  nt.forEach((t, n) => {
    let r = ct(t, J, Y, t === `stock` ? `all` : X);
    getAvailableLocations(
      domQuery(`[data-mv="${t}"]`, P),
      r.total,
      G[t].fmt,
      e
        ? {
            from: 0,
            duration: 1.3,
            delay: 0.2 + n * 0.05,
          }
        : {
            duration: 0.8,
          }
    );
    domQuery(`[data-md="${t}"]`, P).innerHTML = bt(t, r.total, r.prevTotal, r.canCompare);
    xt(domQuery(`[data-ms="${t}"]`, P), r.cur, G[t].tone, e);
  });
}
function Ct(e) {
  let t = queryOne(`.an-ring`, P);
  let n = queryOne(`.an-metric[data-metric="${q}"]`, P);
  if (!t || !n || t.parentElement === n) {
    return;
  }
  let r = Flip.getState(t);
  n.append(t);
  if (e && !bindMagnetic()) {
    Flip.from(r, {
      duration: motionDuration(0.55),
      ease: `power3.inOut`,
      scale: true,
      clearProps: `transform`,
    });
  }
}
function Z(n) {
  let r = G[q];
  let s = q === `stock` ? `all` : X;
  let c = ct(q, J, Y, s);
  let l = lt && c.canCompare;
  dt = r.axis;
  let u = J === `ytd` ? `Last year` : `Previous ${J} days`;
  let d = [
    {
      name: r.label,
      values: c.cur,
      tone: r.tone,
    },
  ];
  if (l) {
    d.push({
      name: u,
      values: c.prev,
      tone: `muted`,
      dashed: true,
    });
  }
  let f = c.buckets.map((e) => e.label);
  if (ut) {
    ut.update(d, f);
  } else {
    ut = createLineChart(I(`ov-chart`), {
      labels: f,
      series: d,
      format: (e) => dt(e),
      height: 300,
      label: `Report chart`,
    });
    if (n) {
      ut.play(0.35);
    }
  }
  I(`ov-title`).textContent = r.label;
  I(`ov-sub`).textContent = `${K[J]} · by ${Y}${s === `all` ? `` : ` · ${CHANNEL_NAMES[s]}`}`;
  I(`ov-legend`).innerHTML =
    `<span><i class="tone--${r.tone}"></i>${escapeHtml(r.label)}</span>${l ? `<span class="an-legend__prev"><i></i>${escapeHtml(u)}</span>` : ``}`;
  let p = I(`ov-cmp`);
  p.setAttribute(`aria-checked`, String(l));
  p.toggleAttribute(`disabled`, !c.canCompare);
  p.title = c.canCompare
    ? `Show the previous period as a dashed line`
    : `Vels’s records start this January — there’s no last year to compare with yet`;
  domQueryAll(`[data-chan]`, P).forEach((e) => {
    e.disabled = q === `stock`;
  });
  let h = I(`ov-empty`);
  let g = !h.hidden;
  h.hidden = !c.empty;
  if (c.empty) {
    h.innerHTML = renderEmptyState(
      `No ${s === `all` ? `` : `${CHANNEL_NAMES[s].toLowerCase()} `}sales in this range`,
      `Nothing was sold through this channel in the dates you picked. Widen the range or show every channel.`,
      `chart`,
      `<button type="button" class="btn btn--ghost btn--sm" data-k="ov-clear">Show every channel</button>`
    );
    if (!g) {
      gsap.fromTo(
        h,
        {
          opacity: 0,
          y: 8,
        },
        {
          opacity: 1,
          y: 0,
          duration: motionDuration(0.4),
          ease: `power3.out`,
          clearProps: `transform,opacity`,
        }
      );
    }
  }
  let v = c.cur.reduce((acc, item, index) => {
    if (item > (c.cur[acc] ?? -Infinity)) {
      return index;
    }
    return acc;
  }, 0);
  let ee = c.prevTotal ? (c.total - c.prevTotal) / c.prevTotal : NaN;
  let rev = W(U(startOfMonth(Date.now()), startOfToday() + ONE_DAY_MS).day, `all`).rev;
  let goal = store.settings.goal;
  I(`ov-foot`).innerHTML =
    `<p>${q === `stock` ? `Stock is worth <b>${formatMoneyRound(c.total)}</b> at cost today` : `<b>${escapeHtml(r.fmt(c.total))}</b> ${q === `aov` || q === `margin` ? `across` : `in`} ${K[J].toLowerCase()}`}${c.canCompare ? ` — ${q === `margin` ? `${(c.total - c.prevTotal) * 100 >= 0 ? `up` : `down`} ${Math.abs((c.total - c.prevTotal) * 100).toFixed(1)} pts` : `${renderTrendBadge(ee)} on the period before`}` : ``}.
      ${c.buckets[v] && !c.empty ? `Best ${Y}: <b>${escapeHtml(c.buckets[v].label)}</b> (${escapeHtml(r.fmt(c.cur[v] ?? 0))}).` : ``}
      ${c.est ? `<span class="an-est">${renderIcon(`info`)}Before ${formatDate(H)} the figures are estimated from each month’s stock-out.</span>` : ``}</p>
    <div class="an-goal"><span class="meter"><span class="meter__fill" data-k="ov-goal-fill" style="--c:var(--pine)"></span></span>
      <span>This month <b>${formatMoneyRound(rev)}</b> of a <b>${formatMoneyRound(goal)}</b> goal</span>
      <button type="button" class="btn btn--ghost btn--xs" data-k="ov-goal">${renderIcon(`edit`)}Edit goal</button></div>`;
  gsap.fromTo(
    I(`ov-goal-fill`),
    {
      scaleX: 0,
    },
    {
      scaleX: Math.max(0.02, Math.min(1, rev / goal)),
      duration: motionDuration(1),
      delay: motionDuration(n ? 0.6 : 0),
      ease: `power3.inOut`,
    }
  );
  wt(n);
}
function wt(n) {
  let { start, end } = at(J);
  let day = U(start, end).day;
  let o = q;
  let s;
  let c;
  let l;
  let u;
  if (o === `stock`) {
    u = `By location`;
    let e = store.materials.reduce((acc, material) => acc + material.onHand * material.cost, 0);
    s = store.locations.map((n, r) => {
      let i =
        store.products.reduce(
          (acc, product) => acc + (product.stock[n.id] ?? 0) * product.cost,
          0
        ) + (n.id === `lab` ? e : 0);
      return {
        key: n.id,
        label: n.name,
        value: i,
        tone: [`pine`, `ocean`, `ochre`][r % 3],
        show: formatMoneyRound(i),
      };
    });
    c = formatMoneyK(s.reduce((acc, item) => acc + item.value, 0));
    l = `at cost`;
    I(`ov-don-sub`).textContent = `Products and materials on the shelves today`;
  } else {
    u = `By channel`;
    s = R.map((e) => {
      let t = W(day, e);
      let n =
        o === `orders`
          ? t.orders
          : o === `units`
            ? t.units
            : o === `margin`
              ? t.rev - t.cogs
              : t.rev;
      let show =
        o === `aov`
          ? formatMoney(t.orders ? t.rev / t.orders : 0)
          : o === `margin`
            ? fmt(t.rev ? (t.rev - t.cogs) / t.rev : 0)
            : G[o].fmt(n);
      return {
        key: e,
        label: CHANNEL_NAMES[e],
        value: n,
        tone: Ge[e],
        show,
      };
    });
    let e = W(day, `all`);
    c =
      o === `orders`
        ? formatInt(e.orders)
        : o === `units`
          ? formatInt(e.units)
          : o === `aov`
            ? formatMoneyRound(e.orders ? e.rev / e.orders : 0)
            : o === `margin`
              ? formatPercent(e.rev ? (e.rev - e.cogs) / e.rev : 0)
              : formatMoneyK(e.rev);
    l =
      o === `orders`
        ? `orders`
        : o === `units`
          ? `units`
          : o === `aov`
            ? `per order`
            : o === `margin`
              ? `margin`
              : `revenue`;
    I(`ov-don-sub`).textContent =
      o === `margin`
        ? `Gross profit by channel, margin beside it`
        : o === `aov`
          ? `Revenue by channel, average order beside it`
          : `${G[o].label} by channel, ${K[J].toLowerCase()}`;
  }
  I(`ov-don-title`).textContent = u;
  let d = s.reduce((acc, item) => acc + Math.max(0, item.value), 0) || 1;
  ht.sub = l;
  let f = s.map((e) => ({
    label: e.label,
    value: Math.max(0, e.value),
    tone: e.tone,
  }));
  if (mt) {
    mt.update(f, c);
  } else {
    ht.parts = f;
    ht.center = c;
    mt = createRingMeter(I(`ov-donut`), ht);
    if (n) {
      mt.play(0.5);
    } else {
      mt.play();
    }
  }
  let p = I(`ov-parts`);
  p.innerHTML = s
    .map(
      (t) =>
        `<li class="${o !== `stock` && X !== `all` && X === t.key ? `is-on` : ``}"><i class="dot" style="--c:var(--${t.tone})"></i><span>${escapeHtml(t.label)}</span><b class="num">${escapeHtml(t.show)}</b><small>${formatPercent(Math.max(0, t.value) / d)}</small></li>`
    )
    .join(``);
  animateRows(domQueryAll(`li`, p), {
    x: 10,
    y: 0,
    stagger: 0.05,
    delay: n ? 0.6 : 0.1,
  });
  let h = o === `stock` ? `all` : X;
  let g = formatShortDate.map((e) => {
    if (o === `stock`) {
      return store.products
        .filter((t) => t.category === e)
        .reduce((acc, item) => acc + getProductStock(item) * item.cost, 0);
    }
    let n = $e(day, h, e);
    if (o === `units`) {
      return n.units;
    }
    if (o === `margin`) {
      if (n.rev) {
        return (n.rev - n.cogs) / n.rev;
      }
      return 0;
    }
    return n.rev;
  });
  _t = o === `units` ? formatInt : o === `margin` ? fmt : formatMoneyRound;
  vt.tone = G[o].tone;
  I(`ov-cat-sub`).textContent =
    o === `stock`
      ? `Products at cost, on hand today`
      : o === `units`
        ? `Units sold`
        : o === `margin`
          ? `Gross margin per category`
          : o === `orders` || o === `aov`
            ? `Revenue (an order can span categories)`
            : `Revenue`;
  if (gt) {
    gt.update(g);
  } else {
    vt.values = g;
    gt = createDonutChart(I(`ov-bars`), vt);
    gt.play(n ? 0.5 : 0);
  }
  Tt(I(`ov-bars`), g, _t);
  let _ = g.reduce((acc, item, index) => {
    if (item > (g[acc] ?? -Infinity)) {
      return index;
    }
    return acc;
  }, 0);
  let v = g.reduce((acc, item) => acc + item, 0) || 1;
  I(`ov-cat-foot`).innerHTML = g.some((e) => e > 0)
    ? `<b>${escapeHtml(formatShortDate[_])}</b> leads with <b>${escapeHtml(_t(g[_] ?? 0))}</b>${o === `margin` ? `` : ` — ${formatPercent((g[_] ?? 0) / v)} of the total`}.`
    : `Nothing sold in this range.`;
}
function Tt(t, n, r) {
  domQueryAll(`.bars__col`, t).forEach((t, i) => {
    queryOne(`.bars__val`, t)?.remove();
    t.insertAdjacentHTML(`afterbegin`, `<b class="bars__val num">${escapeHtml(r(n[i] ?? 0))}</b>`);
  });
}
function Et(currentTarget) {
  let t = G[q];
  let n = q === `stock` ? `all` : X;
  let i = ct(q, J, Y, n);
  let a = [
    [
      `Period start`,
      `Period`,
      `${t.label}${n === `all` ? `` : ` (${CHANNEL_NAMES[n]})`}`,
      ...(i.canCompare ? [`Previous period`] : []),
    ],
  ];
  i.buckets.forEach((e, t) =>
    a.push([
      new Date(e.s).toISOString().slice(0, 10),
      e.label,
      (i.cur[t] ?? 0).toFixed(q === `margin` ? 4 : 2),
      ...(i.canCompare ? [(i.prev[t] ?? 0).toFixed(q === `margin` ? 4 : 2)] : []),
    ])
  );
  a.push([
    ``,
    `Total`,
    i.total.toFixed(q === `margin` ? 4 : 2),
    ...(i.canCompare ? [i.prevTotal.toFixed(q === `margin` ? 4 : 2)] : []),
  ]);
  downloadFile(
    `Vels-${t.label.toLowerCase().replace(/\W+/g, `-`)}-${J === `ytd` ? `ytd` : `${J}d`}-by-${Y}-${new Date(Date.now()).toISOString().slice(0, 10)}.csv`,
    formatCsvRow(a),
    `text/csv`
  );
  openNewTransferModal(currentTarget);
  showToast(`${t.label} report exported — ${pluralize(i.buckets.length, `row`)}`, {
    ico: `download`,
  });
}
function Dt() {
  let e = F(`overview`);
  e.innerHTML = yt();
  bindQuickActions(e);
  openMoveStockModal(e);
  Ct(false);
  ft = initSegmentedControl(domQuery(`.an-range`, e), (e) => {
    J = e;
    if (!rt[J].includes(Y)) {
      Y = it[J];
      pt?.select(Y, {
        silent: true,
      });
    }
    kt();
    St(false);
    Z(false);
  });
  pt = initSegmentedControl(domQuery(`.an-gran`, e), (e) => {
    Y = e;
    St(false);
    Z(false);
  });
  kt();
  I(`ov-metrics`).addEventListener(`click`, (t) => {
    let n = t.target.closest(`[data-metric]`);
    if (n && n.dataset.metric !== q) {
      q = n.dataset.metric;
      domQueryAll(`[data-metric]`, e).forEach((e) =>
        e.setAttribute(`aria-pressed`, String(e === n))
      );
      Ct(true);
      Z(false);
    }
  });
  I(`ov-cmp`).addEventListener(`click`, (e) => {
    openNewTransferModal(e.currentTarget);
    lt = !lt;
    Z(false);
  });
  I(`ov-chan`).addEventListener(`click`, (e) => {
    let t = e.target.closest(`[data-chan]`);
    if (!(!t || t.disabled)) {
      openNewTransferModal(t);
      Ot(t.dataset.chan);
    }
  });
  e.addEventListener(`click`, (e) => {
    let e_target = e.target;
    if (e_target.closest(`[data-k="ov-clear"]`)) {
      Ot(`all`);
    }
    let from = e_target.closest(`[data-k="ov-goal"]`);
    if (from) {
      openQuickCreateModal({
        title: `Monthly sales goal`,
        sub: `Every channel together, before tax. The dashboard’s goal dial follows it.`,
        from,
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
      });
    }
  });
  I(`ov-export`).addEventListener(`click`, (e) => Et(e.currentTarget));
}
function Ot(e) {
  if (e !== X) {
    X = e;
    domQueryAll(`[data-chan]`, P).forEach((t) =>
      t.setAttribute(`aria-pressed`, String(t.getAttribute(`data-chan`) === e))
    );
    St(false);
    Z(false);
  }
}
function kt() {
  domQueryAll(`.an-gran .seg__btn`, P).forEach((e) => {
    e.disabled = !rt[J].includes(e.dataset.value);
  });
}
function At() {
  let e = F(`overview`);
  gsap
    .timeline()
    .add(animatePageTransition(e), 0)
    .add(
      animateCards(domQueryAll(`.an-metric`, e), {
        stagger: 0.06,
        y: 24,
      }),
      0.05
    )
    .add(
      animateCards(domQueryAll(`.an-main, .an-split > .card`, e), {
        stagger: 0.1,
      }),
      0.2
    )
    .add(
      animateRows(domQueryAll(`.an-main__bar .chip, .an-main .card__tools > *`, e), {
        y: -6,
        stagger: 0.04,
      }),
      0.45
    );
  if (ut) {
    St(true);
    Z(false);
    ut.play(0.35);
    mt?.play(0.5);
    gt?.play(0.5);
  } else {
    St(true);
    Z(true);
  }
  animatePop(queryOne(`.an-ring`, e), {
    from: 0.9,
    delay: 0.5,
  });
}
let Q = `30`;
let jt = `rev`;
let Mt = ``;
let Nt = null;
const Pt = {
  OR: `Oregon`,
  TX: `Texas`,
  SC: `South Carolina`,
  GA: `Georgia`,
  MN: `Minnesota`,
  NC: `North Carolina`,
  NM: `New Mexico`,
  WA: `Washington`,
  VT: `Vermont`,
  IL: `Illinois`,
  AZ: `Arizona`,
  MA: `Massachusetts`,
  MI: `Michigan`,
  LA: `Louisiana`,
  CA: `California`,
  PA: `Pennsylvania`,
  CO: `Colorado`,
  WI: `Wisconsin`,
  FL: `Florida`,
  TN: `Tennessee`,
  VA: `Virginia`,
  NY: `New York`,
};
const Ft = () => at(Q);
const It = () => {
  let { start, end } = Ft();
  return store.orders.filter(
    (t) => getOrdersByCustomer(t) && t.createdAt >= start && t.createdAt < end
  );
};
const Lt = () => {
  let { start, n } = Ft();
  let r = B(start, -n);
  return store.orders.filter(
    (t) => getOrdersByCustomer(t) && t.createdAt >= r && t.createdAt < start
  );
};
function Rt() {
  let t = It();
  let n = t.reduce((acc, item) => acc + getOrderTotal(item), 0);
  let value = t.reduce(
    (acc, item) => acc + item.lines.reduce((acc_1, line) => acc_1 + line.qty, 0),
    0
  );
  return `${renderPageHeader({
    eyebrow: `Who buys, what sells, and when`,
    title: `Sales`,
    actions: `${renderSegmentedControl(
      `Date range`,
      [
        [`30`, `30 days`],
        [`90`, `90 days`],
      ],
      Q,
      `an-srange`
    )}
      <button type="button" class="btn btn--ghost" data-k="sa-export">${renderIcon(`download`)}Export orders</button>`,
    stats: [
      {
        key: `rev`,
        icon: `dollar`,
        label: `Revenue`,
        value: n,
        fmt: `money`,
        ico: `pine`,
      },
      {
        key: `orders`,
        icon: `orders`,
        label: `Orders`,
        value: t.length,
        ico: `sky`,
      },
      {
        key: `aov`,
        icon: `receipt`,
        label: `Average order`,
        value: t.length ? n / t.length : 0,
        fmt: `money`,
        ico: `ocean`,
      },
      {
        key: `units`,
        icon: `boxes`,
        label: `Units sold`,
        value,
        ico: `ochre`,
      },
    ],
  })}
  <div class="an-row an-row--21">
    <section class="card" aria-labelledby="sa-ch-t">
      <header class="card__head"><div><h2 class="card__title" id="sa-ch-t">Revenue by channel</h2><p class="card__sub" data-k="sa-ch-sub"></p></div>
        <div class="card__tools"><div class="legend">${R.map((t) => `<span><i class="tone--${Ge[t]}"></i>${escapeHtml(CHANNEL_NAMES[t])}</span>`).join(``)}</div><button type="button" class="ibtn ibtn--sm card__expand" aria-label="Expand" title="Expand" data-expand>${renderIcon(`arrow`)}</button></div></header>
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
      <div class="card__tools"><label class="search">${renderIcon(`search`)}<input type="search" placeholder="Search products…" aria-label="Search products" data-k="sa-q" /></label></div></header>
    <div class="table-wrap"><table class="table table--stack an-ptable" style="--areas:'t r' 's p'">
      <thead><tr><th scope="col">Product</th><th scope="col" class="r" aria-sort="${jt === `units` ? `descending` : `none`}" data-th="units"><button type="button" data-sort="units">Units${renderIcon(`down`)}</button></th><th scope="col" class="r" aria-sort="${jt === `rev` ? `descending` : `none`}" data-th="rev"><button type="button" data-sort="rev">Revenue${renderIcon(`down`)}</button></th><th scope="col">Share</th><th scope="col" class="r">Daily units</th></tr></thead>
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
      <header class="card__head"><div><h2 class="card__title" id="sa-st-t">Top stockists</h2><p class="card__sub">Wholesale accounts by revenue</p></div><div class="card__tools"><a class="btn btn--ghost btn--sm" href="/customers/stockists">${renderIcon(`users`)}All</a></div></header>
      <div class="rows" data-k="sa-stockists"></div>
    </section>
  </div>`;
}
function zt() {
  let e = It();
  let t = Lt();
  let n = e.reduce((acc, item) => acc + getOrderTotal(item), 0);
  let r = t.reduce((acc, item) => acc + getOrderTotal(item), 0);
  let i = e.reduce((acc, item) => acc + item.lines.reduce((acc_1, line) => acc_1 + line.qty, 0), 0);
  let a = F(`sales`);
  let o = (e, t) => renderFilterBar(queryOne(`[data-stat="${e}"] b[data-count]`, a), t);
  o(`rev`, n);
  o(`orders`, e.length);
  o(`aov`, e.length ? n / e.length : 0);
  o(`units`, i);
  let s = (e, t, n) => {
    let r = queryOne(`[data-stat="${e}"] .stat__value`, a);
    if (!r || (queryOne(`.badge`, r)?.remove(), !n)) {
      return;
    }
    let i = (t - n) / n;
    r.insertAdjacentHTML(
      `beforeend`,
      `<span class="badge badge--${i >= 0 ? `good` : `bad`}">${i >= 0 ? `+` : `−`}${Math.abs(i * 100).toFixed(1)}%</span>`
    );
  };
  s(`rev`, n, r);
  s(`orders`, e.length, t.length);
}
function Bt(t) {
  let n = Q === `30` ? `day` : `week`;
  let r = ot(Q, n);
  let i = R.map((e) => ({
    name: CHANNEL_NAMES[e],
    tone: Ge[e],
    values: r.map((t) => W(U(t.s, t.e).day, e).rev),
  }));
  let a = r.map((e) => e.label);
  if (Nt) {
    Nt.update(i, a);
  } else {
    Nt = createLineChart(I(`sa-chart`), {
      labels: a,
      series: i,
      format: formatMoneyK,
      height: 330,
      label: `Revenue by channel over time`,
    });
    if (t) {
      Nt.play(0.3);
    }
  }
  I(`sa-ch-sub`).textContent = `${K[Q]}, by ${n}`;
  let { start, end } = Ft();
  let day = U(start, end).day;
  let l = W(day, `all`).rev || 1;
  I(`sa-chsum`).innerHTML = R.map((t) => {
    let n = W(day, t);
    return `<div style="--c:var(--${Ge[t]})"><span><i class="dot"></i>${escapeHtml(CHANNEL_NAMES[t])}</span><b class="num">${formatMoneyRound(n.rev)}</b><small>${formatPercent(n.rev / l)} · ${pluralize(Math.round(n.orders), `order`)}</small></div>`;
  }).join(``);
}
function Vt() {
  let t = new Map();
  It().forEach((e) => {
    let n = findCustomerById(e.customerId)?.region || `—`;
    let r = t.get(n) ?? {
      rev: 0,
      n: 0,
    };
    r.rev += getOrderTotal(e);
    r.n += 1;
    t.set(n, r);
  });
  let n = [...t.entries()].sort((e, t) => t[1].rev - e[1].rev).slice(0, 8);
  let r = Math.max(1, ...n.map((e) => e[1].rev));
  let i = [...t.values()].reduce((acc, item) => acc + item.rev, 0) || 1;
  let o = I(`sa-regions`);
  o.innerHTML = n.length
    ? n
        .map(
          ([t, n], a) =>
            `<li data-key="${t}"><span class="an-rank__n">${a + 1}</span><span class="an-rank__txt"><b>${escapeHtml(Pt[t] ?? t)}</b><small>${pluralize(n.n, `order`)} · ${formatPercent(n.rev / i)}</small></span><b class="num">${formatMoneyRound(n.rev)}</b><span class="meter"><span class="meter__fill" style="--c:var(--${a === 0 ? `pine` : `ocean`});transform:scaleX(0)" data-to="${Math.max(0.02, n.rev / r)}"></span></span></li>`
        )
        .join(``)
    : `<li class="an-rank__empty">${renderEmptyState(`No sales yet`, `Revenue by state appears with the first orders.`, `map`)}</li>`;
  gsap.to(domQueryAll(`.meter__fill`, o), {
    scaleX: (e, t) => Number(t.dataset.to),
    duration: motionDuration(1),
    stagger: motionDuration(0.05),
    delay: motionDuration(0.3),
    ease: `power3.inOut`,
  });
}
function Ht() {
  let { start, end } = Ft();
  let r = new Map();
  store.orders
    .filter((t) => getOrdersByCustomer(t) && t.createdAt >= start && t.createdAt < end)
    .forEach((e) =>
      e.lines.forEach((e) => {
        let t = r.get(e.productId) ?? {
          units: 0,
          rev: 0,
        };
        t.units += e.qty;
        t.rev += e.qty * e.price;
        r.set(e.productId, t);
      })
    );
  let i = [...r.values()].reduce((acc, item) => acc + item.rev, 0) || 1;
  return store.products
    .map((e) => ({
      p: e,
      ...(r.get(e.id) ?? {
        units: 0,
        rev: 0,
      }),
      share: (r.get(e.id)?.rev ?? 0) / i,
    }))
    .sort((e, t) => {
      if (jt === `rev`) {
        return t.rev - e.rev;
      }
      return t.units - e.units;
    });
}
function Ut(t) {
  let n = Mt.trim().toLowerCase();
  let r = Ht();
  let i = r.filter(
    (e) => !n || `${e.p.name} ${e.p.size} ${e.p.sku} ${e.p.line}`.toLowerCase().includes(n)
  );
  let o = Math.max(0.0001, ...r.map((e) => e.share));
  let s = Q === `30` ? 30 : 91;
  let c = i.length
    ? i
        .map((t, r) => {
          let i = generateDateSeries(t.p.id, s);
          if (s > 30) {
            let e = [];
            for (let t = 0; t < i.length; t += 7) {
              e.push(i.slice(t, t + 7).reduce((acc, item) => acc + item, 0));
            }
            i = e;
          }
          return `<tr class="is-link" data-key="${t.p.id}" data-href="/products/item/${t.p.id}">
      <td class="a-t"><a class="prod" href="/products/item/${t.p.id}">${renderProductThumb(t.p, `md`)}<span><b>${highlightSearchMatch(t.p.name, n)}</b><small>${escapeHtml(t.p.size)} · <span class="mono">${highlightSearchMatch(t.p.sku, n)}</span></small></span></a></td>
      <td class="r a-p num" data-label="Units">${formatInt(t.units)}</td>
      <td class="r a-r"><b class="num an-ptable__rev">${formatMoneyRound(t.rev)}</b></td>
      <td class="a-s"><span class="an-share"><span class="meter"><span class="meter__fill" style="--c:var(--${r === 0 && !n ? `pine` : CATEGORY_TONES[t.p.category]});transform:scaleX(${Math.max(0.015, t.share / o)})"></span></span><small class="num">${formatPercent(t.share, 1)}</small></span></td>
      <td class="r a-h"><span class="an-spark">${createSparkline(i, CATEGORY_TONES[t.p.category], 96, 26)}</span></td>
    </tr>`;
        })
        .join(``)
    : `<tr><td colspan="5">${renderEmptyState(`Nothing matches “${Mt.trim()}”`, `Try a product name, size or SKU.`, `search`, `<button type="button" class="btn btn--ghost btn--sm" data-k="sa-clear">Clear search</button>`)}</td></tr>`;
  let l = I(`sa-rows`);
  if (t) {
    bindModalDismiss(l, () => {
      l.innerHTML = c;
    });
  } else {
    l.innerHTML = c;
  }
  I(`sa-top-sub`).textContent = `${K[Q]} · sorted by ${jt === `rev` ? `revenue` : `units`}`;
  domQueryAll(`[data-th]`, F(`sales`)).forEach((e) =>
    e.setAttribute(`aria-sort`, e.dataset.th === jt ? `descending` : `none`)
  );
}
function Wt(e) {
  let n = store.settings.prefs.weekStart === `sun` ? 0 : 1;
  let r = Array.from(
    {
      length: 7,
    },
    (e, t) => (n + t) % 7
  );
  let i = [`Sun`, `Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`];
  let a = r.map(() =>
    Array.from(
      {
        length: 16,
      },
      () => ({
        n: 0,
        rev: 0,
      })
    )
  );
  It().forEach((e) => {
    let t = new Date(e.createdAt);
    let n = r.indexOf(t.getDay());
    let i = Math.min(15, Math.max(0, t.getHours() - 6));
    let o = a[n]?.[i];
    if (o) {
      o.n += 1;
      o.rev += getOrderTotal(e);
    }
  });
  let o = Math.max(1, ...a.flat().map((e) => e.n));
  let s = (e) => {
    if (e === 12) {
      return `12 pm`;
    }
    if (e > 12) {
      return `${e - 12} pm`;
    }
    return `${e} am`;
  };
  let c = {
    r: 0,
    c: 0,
    n: -1,
  };
  a.forEach((e, r_2) =>
    e.forEach((e, c_2) => {
      if (e.n > c.n) {
        c = {
          r: r_2,
          c: c_2,
          n: e.n,
        };
      }
    })
  );
  let l = I(`sa-heat`);
  l.style.setProperty(`--cols`, `16`);
  l.setAttribute(`role`, `grid`);
  l.setAttribute(`aria-label`, `Orders by day of week and hour`);
  l.innerHTML = `<span class="an-heat__corner" aria-hidden="true"></span>${Array.from(
    {
      length: 16,
    },
    (e, t) =>
      `<span class="an-heat__h" aria-hidden="true">${(6 + t) % 3 == 0 ? s(6 + t).replace(` `, ``) : ``}</span>`
  ).join(``)}
    ${a.map((e, t) => `<span class="an-heat__d" role="rowheader">${i[r[t]]}</span>${e.map((e, n) => `<span class="an-heat__c${e.n ? `` : ` is-zero`}" role="gridcell" tabindex="${t === c.r && n === c.c ? 0 : -1}" style="--k:${(e.n / o).toFixed(3)}" data-tip="${i[r[t]]} ${s(6 + n)}–${s(6 + n + 1)}|${pluralize(e.n, `order`)}|${formatMoneyRound(e.rev)}" aria-label="${i[r[t]]} ${s(6 + n)}: ${pluralize(e.n, `order`)}"></span>`).join(``)}`).join(``)}`;
  I(`sa-heat-sub`).innerHTML =
    c.n > 0
      ? `Busiest: <b>${i[r[c.r]]} ${s(6 + c.c)}–${s(6 + c.c + 1)}</b> · ${pluralize(c.n, `order`)} in ${K[Q].toLowerCase()}`
      : `No orders in this range`;
  let u = domQueryAll(`.an-heat__c`, l);
  if (!bindMagnetic()) {
    gsap.fromTo(
      u,
      {
        opacity: 0,
        scale: 0.3,
      },
      {
        opacity: 1,
        scale: 1,
        duration: motionDuration(0.5),
        ease: `back.out(2)`,
        stagger: {
          grid: [7, 16],
          from: [0, 0],
          amount: motionDuration(e ? 1 : 0.6),
        },
        delay: motionDuration(e ? 0.4 : 0),
        clearProps: `transform,opacity`,
      }
    );
  }
}
function Gt() {
  let t = new Map();
  It()
    .filter((e) => e.channel === `wholesale`)
    .forEach((e) => {
      let n = t.get(e.customerId) ?? {
        rev: 0,
        n: 0,
        last: 0,
      };
      n.rev += getOrderTotal(e);
      n.n += 1;
      n.last = Math.max(n.last, e.createdAt);
      t.set(e.customerId, n);
    });
  let n = [...t.entries()].sort((e, t) => t[1].rev - e[1].rev).slice(0, 6);
  let r = I(`sa-stockists`);
  r.innerHTML = n.length
    ? n
        .map(([t, n]) => {
          let r = findCustomerById(t);
          return `<div class="row an-stk" data-key="${t}">
      ${renderAvatar(t, `md`)}<a class="row__txt" href="/customers/stockists/${t}"><b>${escapeHtml(r?.name ?? ``)}</b><small>${escapeHtml(r?.city ?? ``)}, ${escapeHtml(r?.region ?? ``)} · ${pluralize(n.n, `order`)} · last ${formatRelativeTime(n.last)}</small></a>
      <span class="row__end"><b>${formatMoneyRound(n.rev)}</b></span>
      <button type="button" class="ibtn ibtn--sm" data-reorder="${t}" aria-label="New order for ${escapeHtml(r?.name ?? ``)}" title="New order">${renderIcon(`plus`)}</button>
    </div>`;
        })
        .join(``)
    : renderEmptyState(
        `No wholesale orders`,
        `Stockists appear here once they order in this range.`,
        `store`
      );
}
function Kt() {
  let t = F(`sales`);
  t.innerHTML = Rt();
  bindQuickActions(t);
  initSegmentedControl(domQuery(`.an-srange`, t), (e) => {
    Q = e;
    qt(false);
  });
  I(`sa-export`).addEventListener(`click`, (e) => {
    openNewTransferModal(e.currentTarget);
    exportOrdersCsv();
  });
  I(`sa-q`).addEventListener(`input`, (e) => {
    Mt = e.target.value;
    Ut(true);
  });
  t.addEventListener(`click`, (e) => {
    let e_target = e.target;
    let n = e_target.closest(`[data-sort]`);
    if (n) {
      openNewTransferModal(n);
      jt = n.dataset.sort;
      Ut(true);
      return;
    }
    if (e_target.closest(`[data-k="sa-clear"]`)) {
      Mt = ``;
      I(`sa-q`).value = ``;
      Ut(true);
      return;
    }
    let r = e_target.closest(`[data-reorder]`);
    if (r) {
      openNewTransferModal(r);
      openNewOrderModal(
        {
          customerId: r.dataset.reorder,
        },
        r,
        (e) => {
          (window as any).navigateTo(`/orders/all/${e.id}`)
        }
      );
      return;
    }
    let i = e_target.closest(`tr[data-href]`);
    if (i && !e_target.closest(`a, button`)) {
      (window as any).navigateTo(i.dataset.href)
    }
  });
  let n = I(`sa-heat`);
  let r = I(`sa-heat-tip`);
  let i = (t) => {
    if (!t) {
      r.style.opacity = `0`;
      return;
    }
    let [i, a, o] = (t.dataset.tip ?? ``).split(`|`);
    r.innerHTML = `<b>${escapeHtml(i)}</b><span>${escapeHtml(a)} · ${escapeHtml(o)}</span>`;
    let s = n.parentElement.getBoundingClientRect();
    let c = t.getBoundingClientRect();
    r.style.opacity = `1`;
    gsap.set(r, {
      x: Math.max(
        0,
        Math.min(s.width - r.offsetWidth, c.left - s.left + c.width / 2 - r.offsetWidth / 2)
      ),
      y: Math.max(0, c.top - s.top - r.offsetHeight - 8),
    });
  };
  n.addEventListener(`pointerover`, (e) => i(e.target.closest(`.an-heat__c`)));
  n.addEventListener(`pointerleave`, () => i(null));
  n.addEventListener(`focusin`, (e) => i(e.target.closest(`.an-heat__c`)));
  n.addEventListener(`focusout`, () => i(null));
  n.addEventListener(`keydown`, (e) => {
    let t = domQueryAll(`.an-heat__c`, n);
    let r = t.indexOf(document.activeElement);
    let ArrowDown = Number(n.style.getPropertyValue(`--cols`)) || 1;
    let a = {
      ArrowRight: 1,
      ArrowLeft: -1,
      ArrowDown,
      ArrowUp: -ArrowDown,
    };
    if (r < 0 || !(e.key in a)) {
      return;
    }
    e.preventDefault();
    let o = t[Math.max(0, Math.min(t.length - 1, r + a[e.key]))];
    if (o) {
      t.forEach((e) => (e.tabIndex = -1));
      o.tabIndex = 0;
      o.focus();
    }
  });
}
function qt(e) {
  zt();
  Bt(e);
  Vt();
  Ut(!e);
  Wt(e);
  Gt();
  if (!e) {
    animateRows(domQueryAll(`.an-stk`, F(`sales`)), {
      x: 10,
      y: 0,
      stagger: 0.04,
    });
  }
}
function Jt() {
  let e = F(`sales`);
  gsap
    .timeline()
    .add(animatePageTransition(e), 0)
    .add(
      animateCards(domQueryAll(`.card`, e), {
        stagger: 0.07,
      }),
      0.15
    )
    .add(
      animateRows(domQueryAll(`.an-ptable tbody tr`, e).slice(0, 12), {
        y: 10,
        stagger: 0.035,
      }),
      0.45
    )
    .add(
      animateRows(domQueryAll(`.an-rank li, .an-stk, .an-chsum > div`, e), {
        x: 10,
        y: 0,
        stagger: 0.04,
      }),
      0.4
    );
  qt(true);
  if (Nt) {
    Nt.play(0.3);
  }
  domQueryAll(`.an-share .meter__fill`, e).forEach((e, t) => {
    let scaleX = Number(/scaleX\(([\d.]+)\)/.exec(e.style.transform)?.[1] ?? 1);
    gsap.fromTo(
      e,
      {
        scaleX: 0,
      },
      {
        scaleX,
        duration: motionDuration(1),
        delay: motionDuration(0.5 + t * 0.03),
        ease: `power3.inOut`,
      }
    );
  });
}
let $ = `all`;
let Yt = ``;
let Xt = null;
let Zt = null;
let Qt = null;
let $t = null;
const en = 120;
const tn = (e) => {
  if (e === Infinity) {
    return `none`;
  }
  if (e < 14) {
    return `bad`;
  }
  if (e < 30) {
    return `warn`;
  }
  return `ok`;
};
const nn = {
  bad: [`Critical`, `rose`],
  warn: [`Watch`, `ochre`],
  ok: [`Healthy`, `sage`],
  none: [`No sales`, `slate`],
};
function rn() {
  let counts = store.counts.filter((e) => e.status === `done`);
  let n = 0;
  let off = 0;
  let lines = 0;
  counts.forEach((e) =>
    e.lines.forEach((e) => {
      n += e.expected;
      off += Math.abs((e.counted ?? e.expected) - e.expected);
      lines += 1;
    })
  );
  return {
    acc: n ? 1 - off / n : 1,
    counts,
    lines,
    off,
  };
}
function an() {
  let e = store.products.reduce(
    (acc, product) => acc + getRecentOrders(product.id, 30) * product.cost,
    0
  );
  let n =
    (getTotalStockCostValue() +
      store.products.reduce(
        (acc, product) =>
          acc + (getProductStock(product) + getRecentOrders(product.id, 30)) * product.cost,
        0
      )) /
    2;
  let t = n ? (e * 365) / 30 / n : 0;
  return {
    t,
    days: t ? 365 / t : Infinity,
  };
}
function on() {
  let e = store.batches.filter(
    (e) => e.left > 0 && (e.status === `released` || e.status === `hold`)
  );
  let n = (e) => e.left * (findProductById(e.productId)?.cost ?? 0);
  return [30, 60, 90].map((d, r, i) => {
    let a = r ? i[r - 1] : -Infinity;
    let lots = e.filter((e) => daysUntilExpiry(e) <= d && daysUntilExpiry(e) > a);
    return {
      d,
      lots,
      value: lots.reduce((acc, lot) => acc + n(lot), 0),
      units: lots.reduce((acc, lot) => acc + lot.left, 0),
    };
  });
}
function sn() {
  let e = store.products
    .filter((e) => e.active)
    .map(renderProgressBar)
    .filter(isFinite)
    .sort((e, t) => e - t);
  if (e.length) {
    return e[Math.floor(e.length / 2)];
  }
  return 0;
}
function cn() {
  let n = on();
  let expiryWarnDays = store.settings.prefs.expiryWarnDays;
  return `${renderPageHeader({
    eyebrow: `How healthy the shelves are`,
    title: `Stock health`,
    actions: `<button type="button" class="btn btn--ghost" data-k="sh-export">${renderIcon(`download`)}Export stock</button><button type="button" class="btn btn--primary magnetic" data-k="sh-count">${renderIcon(`clipCheck`)}Schedule a count</button>`,
    stats: [
      {
        key: `value`,
        icon: `layers`,
        label: `Stock value`,
        value: getLastMonthValue(),
        fmt: `money`,
        ico: `teal`,
      },
      {
        key: `cover`,
        icon: `calendar`,
        label: `Median cover`,
        value: sn(),
        suffix: `days`,
        ico: `pine`,
      },
      {
        key: `turn`,
        icon: `refresh`,
        label: `Time on the shelf`,
        value: isFinite(an().days) ? an().days : 0,
        suffix: `days`,
        ico: `ocean`,
      },
      {
        key: `exp`,
        icon: `calX`,
        label: `Expiring ≤ ${Math.min(90, expiryWarnDays)} days`,
        value: n
          .filter((e) => e.d <= Math.max(30, Math.min(90, expiryWarnDays)))
          .reduce((acc, item) => acc + item.value, 0),
        fmt: `money`,
        ico: `rose`,
      },
    ],
  })}
  <div class="an-row an-row--cover">
    <section class="card an-cover" aria-labelledby="sh-cv-t">
      <header class="card__head"><div><h2 class="card__title" id="sh-cv-t">Days of cover</h2><p class="card__sub">Available stock at the last 30 days’ sell rate</p></div>
        <div class="card__tools"><label class="search">${renderIcon(`search`)}<input type="search" placeholder="Search products…" aria-label="Search products" data-k="sh-q" /></label></div></header>
      <div class="toolbar"><div class="chips" data-k="sh-filter">${[
        [`all`, `All`],
        [`risk`, `At risk`],
        [`ok`, `Healthy`],
      ]
        .map(
          ([t, n]) =>
            `<button type="button" class="chip" data-cv="${t}" aria-pressed="${t === $}">${escapeHtml(n)} <b data-cvn="${t}"></b></button>`
        )
        .join(``)}</div>
        <span class="toolbar__spacer"></span><span class="an-cover__key">${[`bad`, `warn`, `ok`].map((e) => `<span><i class="dot" style="--c:var(--${nn[e][1]})"></i>${nn[e][0]}</span>`).join(``)}</span></div>
      <div class="an-bar an-bar--scale" aria-hidden="true"><span></span><span class="an-scale">${[0, 30, 60, 90, en].map((e) => `<i style="left:${(e / en) * 100}%">${e === en ? `${e}+ days` : e}</i>`).join(``)}</span><span></span><span></span></div>
      <div class="an-bars" data-k="sh-cover"></div>
    </section>
    <div class="an-stack">
      <section class="card an-acc" aria-labelledby="sh-acc-t">
        <header class="card__head"><div><h2 class="card__title" id="sh-acc-t">Stock accuracy</h2><p class="card__sub">From finished cycle counts</p></div><div class="card__tools"><a class="btn btn--ghost btn--sm" href="/warehouses/counts">${renderIcon(`clipboard`)}Counts</a></div></header>
        <div data-k="sh-gauge"></div>
        <div class="rows an-acc__list" data-k="sh-counts"></div>
      </section>
      <section class="card" aria-labelledby="sh-loc-t">
        <header class="card__head"><div><h2 class="card__title" id="sh-loc-t">Value by location</h2><p class="card__sub">At cost, materials sit at the lab</p></div></header>
        <div class="an-donut__body"><div data-k="sh-donut"></div><ul class="an-parts an-parts--stack" data-k="sh-locparts"></ul></div>
      </section>
    </div>
  </div>
  <div class="an-row an-row--3">
    <section class="card" aria-labelledby="sh-cat-t">
      <header class="card__head"><div><h2 class="card__title" id="sh-cat-t">Value by category</h2><p class="card__sub">Finished goods at cost</p></div></header>
      <div data-k="sh-cat"></div><p class="an-cats__foot" data-k="sh-cat-foot"></p>
    </section>
    <section class="card" aria-labelledby="sh-st-t">
      <header class="card__head"><div><h2 class="card__title" id="sh-st-t">Sell-through</h2><p class="card__sub">Share of stock sold in 30 days</p></div></header>
      <div data-k="sh-st"></div><p class="an-cats__foot" data-k="sh-st-foot"></p>
    </section>
    <section class="card an-exp" aria-labelledby="sh-exp-t">
      <header class="card__head"><div><h2 class="card__title" id="sh-exp-t">Expiry exposure</h2><p class="card__sub" data-k="sh-exp-sub"></p></div><div class="card__tools"><a class="btn btn--ghost btn--sm" href="/products/batches">${renderIcon(`flask`)}Batches</a></div></header>
      <div class="an-exp__tiles" data-k="sh-exp"></div>
      <div class="rows an-exp__lots" data-k="sh-lots"></div>
    </section>
  </div>
  <section class="card an-dead" aria-labelledby="sh-dead-t">
    <header class="card__head"><div><h2 class="card__title" id="sh-dead-t">Dead stock</h2><p class="card__sub">On the shelf, with no sale in the last 30 days</p></div></header>
    <div class="rows an-dead__rows" data-k="sh-dead"></div>
  </section>`;
}
function ln(n) {
  let r = store.products
    .filter((e) => e.active)
    .map((e) => ({
      p: e,
      d: renderProgressBar(e),
    }))
    .sort((e, t) => e.d - t.d);
  let i = Yt.trim().toLowerCase();
  let o = (e) => e < 30;
  let s = {
    all: r.length,
    risk: r.filter((e) => o(e.d)).length,
    ok: r.filter((e) => !o(e.d)).length,
  };
  [`all`, `risk`, `ok`].forEach((e) => {
    let t = queryOne(`[data-cvn="${e}"]`, P);
    if (t) {
      t.textContent = String(s[e]);
    }
  });
  let l = r.filter(
    (e) =>
      ($ === `all` || ($ === `risk` ? o(e.d) : !o(e.d))) &&
      (!i || `${e.p.name} ${e.p.size} ${e.p.sku}`.toLowerCase().includes(i))
  );
  let u = I(`sh-cover`);
  let d = l.length
    ? l
        .map(({ p, d }) => {
          let a = tn(d);
          let [o, s] = nn[a];
          let c = d === Infinity ? 1 : Math.max(0.015, Math.min(1, d / en));
          return `<div class="an-bar" data-key="${p.id}" style="--c:var(--${s})">
      <a class="prod" href="/products/item/${p.id}">${renderProductThumb(p, `sm`)}<span><b>${highlightSearchMatch(p.name, i)}</b><small>${escapeHtml(p.size)} · ${formatInt(getMaterialStock(p))} free · ${formatInt(getRecentOrders(p.id, 30))} sold</small></span></a>
      <span class="an-bar__track"><span class="an-bar__fill" style="transform:scaleX(${n ? c : 0})" data-to="${c}"></span></span>
      <span class="an-bar__val"><b class="num">${d === Infinity ? `—` : `${formatInt(d)}<small> ${d === 1 ? `day` : `days`}</small>`}</b><em>${o}</em></span>
      ${a === `bad` || a === `warn` ? `<button type="button" class="btn btn--soft btn--xs" data-make="${p.id}">${renderIcon(`flask`)}Make</button>` : `<span class="an-bar__ok" aria-hidden="true"></span>`}
    </div>`;
        })
        .join(``)
    : renderEmptyState(
        i ? `Nothing matches “${Yt.trim()}”` : $ === `risk` ? `Nothing at risk` : `Nothing here`,
        i
          ? `Try a product name, size or SKU.`
          : $ === `risk`
            ? `Every product has at least a month of cover.`
            : `No product matches this filter.`,
        i ? `search` : `shield`,
        i || $ !== `all`
          ? `<button type="button" class="btn btn--ghost btn--sm" data-k="sh-clear">Show everything</button>`
          : ``
      );
  if (n) {
    bindModalDismiss(u, () => {
      u.innerHTML = d;
    });
  } else {
    u.innerHTML = d;
  }
  if (!n) {
    gsap.to(domQueryAll(`.an-bar__fill`, u), {
      scaleX: (e, t) => Number(t.dataset.to),
      duration: motionDuration(1.1),
      stagger: motionDuration(0.04),
      delay: motionDuration(0.35),
      ease: `power3.inOut`,
    });
  }
}
function un(t) {
  let n = rn();
  let r = Math.max(0, Math.min(1, (n.acc - 0.9) / 0.1));
  let sub = `${pluralize(n.counts.length, `count`)} · ${pluralize(n.lines, `line`)}`;
  if (Xt) {
    Xt.update(r, sub);
  } else {
    Xt = createHorizontalBarChart(I(`sh-gauge`), {
      value: r,
      format: (e) => `${(90 + e * 10).toFixed(1)}%`,
      sub,
      label: `Stock accuracy ${(n.acc * 100).toFixed(1)}%`,
      zones: {
        bad: 0.5,
        warn: 0.8,
      },
    });
    Xt.play(t ? 0.4 : 0);
  }
  I(`sh-counts`).innerHTML =
    n.counts
      .slice(0, 3)
      .map((t) => {
        let n = t.lines.reduce(
          (acc, line) => acc + Math.abs((line.counted ?? line.expected) - line.expected),
          0
        );
        return `<a class="row" href="/warehouses/counts/${t.id}">${renderTag(`clipCheck`, n ? `ochre` : `sage`, `sm`)}<span class="row__txt"><b><span class="mono">${escapeHtml(t.number)}</span> · ${escapeHtml(exportDataBackup(t.locId)?.name ?? ``)}</b><small>Zone ${escapeHtml(t.zone)} · ${pluralize(t.lines.length, `line`)} · ${formatRelativeTime(t.at)}</small></span><span class="row__end">${n ? renderPill(`${n} off`, `ochre`) : renderPill(`Exact`, `sage`)}</span></a>`;
      })
      .join(``) ||
    renderEmptyState(
      `No counts yet`,
      `Accuracy appears once a cycle count is closed.`,
      `clipboard`
    );
}
function dn(n) {
  let r = store.materials.reduce((acc, material) => acc + material.onHand * material.cost, 0);
  let i = [`pine`, `ocean`, `ochre`];
  let parts = store.locations.map((e, n) => ({
    label: e.name,
    value:
      store.products.reduce((acc, product) => acc + (product.stock[e.id] ?? 0) * product.cost, 0) +
      (e.id === `lab` ? r : 0),
    tone: i[n % 3],
    id: e.id,
  }));
  let o = parts.reduce((acc, part) => acc + part.value, 0) || 1;
  if (Zt) {
    Zt.update(parts, formatMoneyK(o));
  } else {
    Zt = createRingMeter(I(`sh-donut`), {
      parts,
      center: formatMoneyK(o),
      sub: `at cost`,
      label: `Stock value by location`,
    });
    Zt.play(n ? 0.5 : 0);
  }
  I(`sh-locparts`).innerHTML = parts
    .map(
      (t) =>
        `<li><i class="dot" style="--c:var(--${t.tone})"></i><a href="/warehouses/locations/${t.id}">${escapeHtml(t.label)}</a><b class="num">${formatMoneyRound(t.value)}</b><small>${formatPercent(t.value / o)}</small></li>`
    )
    .join(``);
}
function fn(n) {
  let r = formatShortDate.map((e) =>
    store.products
      .filter((t) => t.category === e)
      .reduce((acc, item) => acc + getProductStock(item) * item.cost, 0)
  );
  if (Qt) {
    Qt.update(r);
  } else {
    Qt = createDonutChart(I(`sh-cat`), {
      labels: formatShortDate,
      values: r,
      format: formatMoneyRound,
      tone: `teal`,
      label: `Stock value by category`,
    });
    Qt.play(n ? 0.5 : 0);
  }
  Tt(I(`sh-cat`), r, formatMoneyK);
  let i = r.reduce((acc, item, index) => {
    if (item > (r[acc] ?? 0)) {
      return index;
    }
    return acc;
  }, 0);
  let a = r.reduce((acc, item) => acc + item, 0) || 1;
  I(`sh-cat-foot`).innerHTML =
    `<b>${escapeHtml(formatShortDate[i])}</b> holds ${formatPercent((r[i] ?? 0) / a)} of it — <b>${formatMoneyRound(r[i] ?? 0)}</b>.`;
  let o = formatShortDate.map((e) => {
    let n = store.products.filter((t) => t.category === e);
    let r = n.reduce((acc, item) => acc + getRecentOrders(item.id, 30), 0);
    let i = n.reduce((acc, item) => acc + getProductStock(item), 0);
    if (r + i) {
      return r / (r + i);
    }
    return 0;
  });
  if ($t) {
    $t.update(o);
  } else {
    $t = createDonutChart(I(`sh-st`), {
      labels: formatShortDate,
      values: o,
      format: (e) => formatPercent(e),
      tone: `ocean`,
      label: `Sell-through by category, last 30 days`,
    });
    $t.play(n ? 0.6 : 0);
  }
  Tt(I(`sh-st`), o, (e) => formatPercent(e));
  let s = an();
  let c = o.reduce((acc, item, index) => {
    if (item > (o[acc] ?? 0)) {
      return index;
    }
    return acc;
  }, 0);
  I(`sh-st-foot`).innerHTML =
    `Stock turns <b>${s.t.toFixed(1)}×</b> a year — about <b>${isFinite(s.days) ? formatInt(s.days) : `—`} days</b> on the shelf. Fastest: <b>${escapeHtml(formatShortDate[c])}</b> (${formatPercent(o[c] ?? 0)}).`;
}
function pn(n) {
  let r = on();
  let expiryWarnDays = store.settings.prefs.expiryWarnDays;
  let o = r.reduce((acc, item) => acc + item.value, 0);
  I(`sh-exp-sub`).innerHTML =
    `Value at cost of lots that expire soon · alerts at <a href="/settings/company">${expiryWarnDays} days</a>`;
  I(`sh-exp`).innerHTML = r
    .map(
      (
        e,
        t
      ) => `<div class="an-exp__tile${e.d <= expiryWarnDays ? ` is-warn` : ``}" style="--c:var(--${[`rose`, `ochre`, `sky`][t]})">
      <small>${t ? `${r[t - 1].d + 1}–${e.d}` : `≤ ${e.d}`} days</small><b class="num" data-ev="${t}">${formatMoneyRound(n ? 0 : e.value)}</b><span>${pluralize(e.lots.length, `lot`)} · ${formatInt(e.units)} units</span>
      <span class="meter"><span class="meter__fill" style="transform:scaleX(0)" data-to="${o ? Math.max(0.02, e.value / o) : 0.02}"></span></span></div>`
    )
    .join(``);
  r.forEach((e, t) =>
    getAvailableLocations(domQuery(`[data-ev="${t}"]`, P), e.value, formatMoneyRound, {
      from: 0,
      duration: 1.2,
      delay: n ? 0.5 + t * 0.1 : 0,
    })
  );
  gsap.to(domQueryAll(`.an-exp__tile .meter__fill`, P), {
    scaleX: (e, t) => Number(t.dataset.to),
    duration: motionDuration(1),
    stagger: motionDuration(0.08),
    delay: motionDuration(n ? 0.6 : 0.1),
    ease: `power3.inOut`,
  });
  let s = r
    .flatMap((e) => e.lots)
    .sort((e, t) => e.expiresAt - t.expiresAt)
    .slice(0, 4);
  I(`sh-lots`).innerHTML = s.length
    ? s
        .map((t) => {
          let n = findProductById(t.productId);
          let r = daysUntilExpiry(t);
          return `<a class="row" href="/products/batches/${t.id}">${renderProductThumb(n, `sm`)}<span class="row__txt"><b>${escapeHtml(formatProductFullName(n))}</b><small><span class="mono">${escapeHtml(t.lot)}</span> · ${formatInt(t.left)} left${t.status === `hold` ? ` · on hold` : ``}</small></span><span class="row__end">${renderPill(r <= 0 ? `Expired` : `${r} d`, r <= 30 ? `rose` : r <= 60 ? `ochre` : `sky`)}</span></a>`;
        })
        .join(``)
    : renderEmptyState(
        `Nothing expires within 90 days`,
        `Every lot on the shelf has more than three months left.`,
        `calendar`
      );
}
function mn() {
  let n = store.products.filter(
    (e) => e.active && getProductStock(e) > 0 && getRecentOrders(e.id, 30) === 0
  );
  let r = I(`sh-dead`);
  r.innerHTML = n.length
    ? n
        .map(
          (
            n
          ) => `<div class="row" data-key="${n.id}">${renderProductThumb(n, `md`)}<a class="row__txt" href="/products/item/${n.id}"><b>${escapeHtml(formatProductFullName(n))}</b><small>${formatInt(getProductStock(n))} on hand · ${formatMoneyRound(getProductStock(n) * n.cost)} at cost · ${store.locations
            .filter((e) => (n.stock[e.id] ?? 0) > 0)
            .map((e) => e.name)
            .join(`, `)}</small></a>
      ${(n.stock.dc ?? 0) > 0 ? `<button type="button" class="btn btn--soft btn--xs" data-move="${n.id}">${renderIcon(`store`)}Sell at the shop</button>` : ``}</div>`
        )
        .join(``)
    : `<div class="an-dead__clear">${renderTag(`sparkle`, `sage`)}<span><b>No dead stock</b><small>Every product on the shelves sold at least once in the last 30 days. Slow movers show up here before they become a write-off.</small></span></div>`;
}
function hn() {
  let e = F(`stock`);
  let n = (t, n) => renderFilterBar(queryOne(`[data-stat="${t}"] b[data-count]`, e), n);
  let expiryWarnDays = store.settings.prefs.expiryWarnDays;
  n(`value`, getLastMonthValue());
  n(`cover`, sn());
  n(`turn`, isFinite(an().days) ? an().days : 0);
  n(
    `exp`,
    on()
      .filter((e) => e.d <= Math.max(30, Math.min(90, expiryWarnDays)))
      .reduce((acc, item) => acc + item.value, 0)
  );
  let i = queryOne(`[data-stat="exp"] .stat__label`, e);
  if (i?.lastChild) {
    i.lastChild.textContent = `Expiring ≤ ${Math.max(30, Math.min(90, expiryWarnDays))} days`;
  }
}
function gn() {
  let e = F(`stock`);
  e.innerHTML = cn();
  openMoveStockModal(e);
  I(`sh-filter`).addEventListener(`click`, (t) => {
    let n = t.target.closest(`[data-cv]`);
    if (n) {
      openNewTransferModal(n);
      $ = n.dataset.cv;
      domQueryAll(`[data-cv]`, e).forEach((e) => e.setAttribute(`aria-pressed`, String(e === n)));
      ln(true);
    }
  });
  I(`sh-q`).addEventListener(`input`, (e) => {
    Yt = e.target.value;
    ln(true);
  });
  I(`sh-count`).addEventListener(`click`, (e) => {
    openNewTransferModal(e.currentTarget);
    openScheduleCountModal(e.currentTarget);
  });
  I(`sh-export`).addEventListener(`click`, (e) => {
    openNewTransferModal(e.currentTarget);
    exportStockCsv();
  });
  e.addEventListener(`click`, (t) => {
    let t_target = t.target;
    let r = t_target.closest(`[data-make]`);
    if (r) {
      openNewTransferModal(r);
      openMakeBatchModal(r.dataset.make, r);
      return;
    }
    let i = t_target.closest(`[data-move]`);
    if (i) {
      openNewTransferModal(i);
      openNewBatchModal(
        {
          from: `dc`,
          to: `shop`,
          productId: i.dataset.move,
        },
        i
      );
      return;
    }
    if (t_target.closest(`[data-k="sh-clear"]`)) {
      Yt = ``;
      $ = `all`;
      I(`sh-q`).value = ``;
      domQueryAll(`[data-cv]`, e).forEach((e) =>
        e.setAttribute(`aria-pressed`, String(e.getAttribute(`data-cv`) === `all`))
      );
      ln(true);
    }
  });
}
function _n(e) {
  if (!e) {
    hn();
  }
  ln(!e);
  un(e);
  dn(e);
  fn(e);
  pn(e);
  mn();
}
function vn() {
  let e = F(`stock`);
  gsap
    .timeline()
    .add(animatePageTransition(e), 0)
    .add(
      animateCards(domQueryAll(`.card`, e), {
        stagger: 0.06,
      }),
      0.15
    )
    .add(
      animateRows(domQueryAll(`.an-bar`, e), {
        x: -10,
        y: 0,
        stagger: 0.03,
      }),
      0.35
    )
    .add(
      animateRows(
        domQueryAll(`.an-acc__list .row, .an-exp__lots .row, .an-dead__rows > *, .an-parts li`, e),
        {
          y: 10,
          stagger: 0.04,
        }
      ),
      0.5
    );
  _n(true);
  if (Xt) {
    Xt.play(0.4);
    Zt?.play(0.5);
    Qt?.play(0.5);
    $t?.play(0.6);
  }
  initLiftAnimations(e);
}
const yn = [`overview`, `sales`, `stock`];
function bn(e) {
  Ue = e;
  domQueryAll(`[data-sub]`, P).forEach((t) => {
    t.hidden = t.dataset.sub !== e;
  });
  if (!We.has(e)) {
    We.add(e);
    if (e === `overview`) {
      Dt();
    } else if (e === `sales`) {
      Kt();
    } else {
      gn();
    }
  }
  if (e === `overview`) {
    ft?.place(false);
    pt?.place(false);
    At();
  } else if (e === `sales`) {
    Jt();
  } else {
    vn();
  }
}
function xn() {
  if (L(`overview`)) {
    St(false);
    Z(false);
  } else if (L(`sales`)) {
    qt(false);
  } else if (L(`stock`)) {
    _n(false);
  }
}
export const page = {
  title: (e) =>
    ({
      sales: `Sales analytics`,
      stock: `Stock health`,
    })[e[0] ?? ``] ?? `Reports`,
  mount(e) {
    P = e;
    P.innerHTML = yn.map((e) => `<div data-sub="${e}" hidden></div>`).join(``);
    findLocationById(`orders`, () => {
      Ze();
      xn();
    });
    findLocationById(`history`, () => {
      Ze();
      xn();
    });
    findLocationById(`products`, xn);
    findLocationById(`batches`, () => {
      if (L(`stock`)) {
        _n(false);
      }
    });
    findLocationById(`counts`, () => {
      if (L(`stock`)) {
        _n(false);
      }
    });
    findLocationById(`moves`, () => {
      if (L(`overview`) && q === `stock`) {
        Z(false);
      }
    });
    findLocationById(`settings`, () => {
      if (L(`overview`)) {
        Z(false);
      } else if (L(`stock`)) {
        _n(false);
      } else if (L(`sales`)) {
        Wt(false);
      }
    });
  },
  enter({ params, same }) {
    let n = yn.includes(params[0] ?? ``) ? params[0] : `overview`;
    if (!(same && n === Ue && We.has(n))) {
      bn(n);
    }
  },
  leave() {},
};
