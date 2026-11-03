import {
  escapeHtml,
  store,
  showToast,
  closeDrawer,
  ONE_DAY_MS,
  renderEmptyState,
  queryOne,
  CUSTOMER_TAG_NAMES,
  animatePageTransition,
  domQuery,
  findProductById,
  renderAvatar,
  motionDuration,
  findBatchByLotNumber,
  openDrawer,
  formatDate,
  bindModalDismiss,
  getAvailableSuppliers,
  animateWobble,
  formatRelativeTime,
  openMoveStockModal,
  formatInt,
  findLocationById,
  openNewTransferModal,
  animateRows,
  formatPercent,
  openNewOrderModal,
  renderFilterBar,
  openNewCustomerModal,
  animateCards,
  formatMoneyRound,
  pluralize,
  renderIconButton,
  animatePop,
  highlightSearchMatch,
  gsap,
  domQueryAll,
  initLiftAnimations,
  renderIcon,
  bindMagnetic,
  createCustomElement,
  findCustomerById,
  renderPageHeader,
  startOfMonth,
  getOrderTotal,
  renderProductThumb,
  renderOrderStatusBadge,
} from "../../main.ts";
import { createDonutChart, createSparkline } from "../../shared/widgets/charts.ts";
const ge = [`stockists`, `shoppers`];
let N;
let P = `stockists`;
const F = new Set();
const I = (e) => domQuery(`[data-sub="${e}"]`, N);
const L = (e) => domQuery(`[data-k="${e}"]`, N);
const _e = (e) => !!N && !N.hidden && P === e;
const ve = {
  vip: `pine`,
  net30: `sky`,
  new: `sage`,
  subscriber: `ocean`,
};
const R = (e) => `<span class="tag" style="--c:var(--${ve[e]})">${CUSTOMER_TAG_NAMES[e]}</span>`;
function ye(e) {
  let t = [];
  let n = startOfMonth(Date.now());
  for (let r = 0; r < e; r++) {
    t.unshift(n);
    n = startOfMonth(n - ONE_DAY_MS);
  }
  return t;
}
function z(e) {
  let orders = store.orders
    .filter((t) => t.customerId === e.id)
    .sort((e, t) => t.createdAt - e.createdAt);
  let r = orders.filter((e) => e.status !== `cancelled`);
  let revenue = r.reduce((acc, item) => acc + getOrderTotal(item), 0);
  let a = ye(6);
  let monthly = a.map((e, t) => {
    let n = a[t + 1] ?? Date.now() + 86400000;
    return r
      .filter((t) => t.createdAt >= e && t.createdAt < n)
      .reduce((acc, item) => acc + getOrderTotal(item), 0);
  });
  return {
    orders,
    n: r.length,
    revenue,
    last: r[0]?.createdAt ?? 0,
    avg: r.length ? revenue / r.length : 0,
    monthly,
    unpaid: r.filter((e) => !e.paid).reduce((acc, item) => acc + getOrderTotal(item), 0),
  };
}
function B(e) {
  let n = new Map();
  store.customers.filter((t) => t.kind === e).forEach((e) => n.set(e.id, z(e)));
  return n;
}
const be = (last) => {
  if (last) {
    return formatRelativeTime(last);
  }
  return `No orders yet`;
};
function xe(e, key, n, badge, tone) {
  let a = queryOne(`[data-stat="${key}"]`, e);
  if (!a) {
    return;
  }
  let s = queryOne(`[data-count]`, a);
  if (s && Number(s.dataset.count) !== n) {
    renderFilterBar(s, n);
    getAvailableSuppliers(s);
  }
  let c = queryOne(`.badge`, a);
  if (c && badge !== undefined) {
    c.textContent = badge;
    c.className = `badge badge--${tone ?? `plain`}`;
  }
}
const Se = [
  [`revenue`, `Lifetime revenue`],
  [`last`, `Last order`],
  [`name`, `Name, A–Z`],
  [`since`, `Newest stockists`],
];
let V = ``;
let H = `all`;
let U = `revenue`;
let W = `grid`;
try {
  W = localStorage.getItem(`Vels:stockist-view`) === `list` ? `list` : `grid`;
} catch {}
function Ce() {
  let e = store.customers.filter((e) => e.kind === `stockist`);
  let n = B(`stockist`);
  let length = e.filter((e) => (n.get(e.id)?.last ?? 0) >= Date.now() - 60 * ONE_DAY_MS).length;
  let a = Date.now() - 90 * ONE_DAY_MS;
  let o = store.orders.filter(
    (e) => e.channel === `wholesale` && e.status !== `cancelled` && e.createdAt >= a
  );
  let s = o.reduce((acc, item) => acc + getOrderTotal(item), 0);
  let c = [...n.values()].reduce((acc, item) => acc + item.unpaid, 0);
  return [
    {
      key: `n`,
      icon: `store`,
      ico: `pine`,
      label: `Stockists`,
      value: e.length,
      badge: `${length} active`,
      tone: `good`,
    },
    {
      key: `rev`,
      icon: `trend`,
      ico: `teal`,
      label: `Wholesale · 90 days`,
      value: s,
      fmt: `money`,
    },
    {
      key: `avg`,
      icon: `receipt`,
      ico: `sky`,
      label: `Average order`,
      value: o.length ? s / o.length : 0,
      fmt: `money`,
    },
    {
      key: `due`,
      icon: `clock`,
      ico: `ochre`,
      label: `On account, unpaid`,
      value: c,
      fmt: `money`,
      badge: c ? `Net 30` : `All settled`,
      tone: c ? `warn` : `good`,
    },
  ];
}
function we(t, n, r) {
  let i = n.monthly.some((e) => e > 0);
  return `<a class="cs-card" href="/customers/stockists/${t.id}" data-key="${t.id}" data-lift>
    <span class="cs-card__id">${renderAvatar(t.id, `lg`)}<span class="cs-card__name"><b>${highlightSearchMatch(t.name, r)}</b><small>${highlightSearchMatch(t.contact, r)}</small></span></span>
    <span class="cs-card__loc">${renderIcon(`map`)}${highlightSearchMatch(`${t.city}, ${t.region}`, r)}</span>
    <span class="cs-card__tags">${t.tags.map(R).join(``) || `<span class="cs-none">No tags</span>`}</span>
    <span class="cs-card__figs"><span><small>Lifetime</small><b>${formatMoneyRound(n.revenue)}</b></span><span><small>Last order</small><b>${escapeHtml(be(n.last))}</b></span></span>
    <span class="cs-card__spark">${i ? createSparkline(n.monthly, `pine`, 220, 40) : `<span class="cs-flat"></span>`}<small>${i ? `${formatMoneyRound(n.monthly.at(-1) ?? 0)} this month` : `No spend in six months`}</small></span>
  </a>`;
}
function Te() {
  let e = I(`stockists`);
  e.innerHTML = `${renderPageHeader({
    eyebrow: `Shops that sell Marlow & Fern on their shelves`,
    title: `Stockists`,
    actions: `<button type="button" class="btn btn--primary magnetic" data-act="new">${renderIcon(`userPlus`)}New customer</button>`,
    stats: Ce(),
  })}
  <section class="card cs-wrap" aria-label="Stockists">
    <div class="toolbar">
      <div class="chips" data-k="s-tags" role="group" aria-label="Tag"></div>
      <span class="toolbar__spacer"></span>
      <label class="search cs-search">${renderIcon(`search`)}<input type="search" placeholder="Name, contact or city…" aria-label="Search stockists" data-k="s-q" /></label>
      <button type="button" class="btn btn--ghost btn--sm cs-sort" data-k="s-sort" aria-haspopup="menu" aria-expanded="false">${renderIcon(`filter`)}<span>${Se.find((e) => e[0] === U)[1]}</span>${renderIcon(`down`)}</button>
      <div class="cs-views" role="group" aria-label="Layout">${renderIconButton(`grid`, `Cards`, `data-view="grid" aria-pressed="${W === `grid`}"`, `ibtn--sm`)}${renderIconButton(`list`, `List`, `data-view="list" aria-pressed="${W === `list`}"`, `ibtn--sm`)}</div>
    </div>
    <div class="cs-grid${W === `list` ? ` is-list` : ``}" data-k="s-grid"></div>
  </section>`;
  openMoveStockModal(e);
  L(`s-tags`).addEventListener(`click`, (e) => {
    let t = e.target.closest(`[data-tag]`);
    if (t) {
      openNewTransferModal(t);
      H = t.dataset.tag;
      G(true);
    }
  });
  L(`s-q`).addEventListener(`input`, (e) => {
    V = e.target.value;
    G(true);
  });
  L(`s-sort`).addEventListener(`click`, (e) => {
    let e_currentTarget = e.currentTarget;
    createCustomElement(
      e_currentTarget,
      Se.map(([e, n]) => ({
        label: n,
        checked: e === U,
        onSelect: () => {
          if (e !== U) {
            U = e;
            domQuery(`span`, e_currentTarget).textContent = n;
            G(true);
          }
        },
      })),
      {
        align: `end`,
      }
    );
  });
  domQuery(`.cs-views`, e).addEventListener(`click`, (t) => {
    let n = t.target.closest(`[data-view]`);
    if (!(!n || n.dataset.view === W)) {
      openNewTransferModal(n);
      W = n.dataset.view;
      try {
        localStorage.setItem(`Vels:stockist-view`, W);
      } catch {}
      domQueryAll(`[data-view]`, e).forEach((e) => e.setAttribute(`aria-pressed`, String(e === n)));
      Ee();
    }
  });
  e.addEventListener(`click`, (t) => {
    let n = t.target.closest(`[data-act]`);
    if (n) {
      openNewTransferModal(n);
      if (n.dataset.act === `new`) {
        openNewCustomerModal(n, (e) => {
          (window as any).navigateTo(`/customers/${e.kind === `stockist` ? `stockists` : `shoppers`}/${e.id}`)
        });
      } else if (n.dataset.act === `sclear`) {
        V = ``;
        H = `all`;
        domQuery(`[data-k="s-q"]`, e).value = ``;
        G(true);
      }
    }
  });
}
function Ee() {
  let e = L(`s-grid`);
  let t = domQueryAll(`.cs-card`, e);
  if (bindMagnetic() || !t.length) {
    e.classList.toggle(`is-list`, W === `list`);
    return;
  }
  gsap.to(t, {
    opacity: 0,
    y: 8,
    scale: 0.97,
    duration: 0.16,
    stagger: 0.012,
    ease: `power2.in`,
    overwrite: true,
    onComplete: () => {
      e.classList.toggle(`is-list`, W === `list`);
      gsap.fromTo(
        t,
        {
          opacity: 0,
          y: 14,
          scale: 0.98,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.035,
          ease: `power3.out`,
          clearProps: `transform,opacity`,
        }
      );
      De(e, 0.1);
    },
  });
}
function De(e, t = 0) {
  domQueryAll(`.cs-card__spark path`, e).forEach((e, n) => {
    let r = e.getTotalLength();
    gsap.fromTo(
      e,
      {
        strokeDasharray: r,
        strokeDashoffset: r,
      },
      {
        strokeDashoffset: 0,
        duration: motionDuration(1.1),
        delay: motionDuration(t + Math.min(n, 10) * 0.06),
        ease: `power2.inOut`,
        clearProps: `strokeDasharray,strokeDashoffset`,
      }
    );
  });
}
function G(e) {
  let n = V.trim();
  let r = n.toLowerCase();
  let i = B(`stockist`);
  let o = store.customers.filter((e) => e.kind === `stockist`);
  let c = o.filter(
    (e) => !r || `${e.name} ${e.contact} ${e.city} ${e.region} ${e.email}`.toLowerCase().includes(r)
  );
  let u = [`all`, `vip`, `net30`, `new`];
  let d = (e) => {
    if (e === `all`) {
      return c.length;
    }
    return c.filter((t) => t.tags.includes(e)).length;
  };
  let f = L(`s-tags`);
  if (f.children.length) {
    u.forEach((e) => {
      let t = domQuery(`[data-tag="${e}"]`, f);
      t.setAttribute(`aria-pressed`, String(e === H));
      let n = domQuery(`b`, t);
      if (n.textContent !== String(d(e))) {
        n.textContent = String(d(e));
        getAvailableSuppliers(n);
      }
    });
  } else {
    f.innerHTML = u
      .map(
        (e) =>
          `<button type="button" class="chip" data-tag="${e}" aria-pressed="${e === H}">${e === `all` ? `All stockists` : CUSTOMER_TAG_NAMES[e]} <b>${d(e)}</b></button>`
      )
      .join(``);
  }
  let p = c.filter((e) => H === `all` || e.tags.includes(H));
  let m = (e) => i.get(e.id);
  p.sort((e, t) => {
    if (U === `revenue`) {
      return m(t).revenue - m(e).revenue;
    }
    if (U === `last`) {
      return m(t).last - m(e).last;
    }
    if (U === `since`) {
      return t.since - e.since;
    }
    return e.name.localeCompare(t.name);
  });
  let h = L(`s-grid`);
  let _ = p.length
    ? p.map((e) => we(e, m(e), n)).join(``)
    : `<div class="cs-empty">${o.length ? renderEmptyState(`No stockists match`, `Nothing ${H === `all` ? `` : `tagged ${CUSTOMER_TAG_NAMES[H]} `}for “${n || `that filter`}”. Try another name or city.`, `search`, `<button type="button" class="btn btn--ghost btn--sm" data-act="sclear">${renderIcon(`refresh`)}Clear filters</button>`) : renderEmptyState(`No stockists yet`, `Add the first shop that sells your range wholesale.`, `store`, `<button type="button" class="btn btn--primary btn--sm" data-act="new">${renderIcon(`userPlus`)}New customer</button>`)}</div>`;
  if (e) {
    bindModalDismiss(h, () => {
      h.innerHTML = _;
    });
  } else {
    h.innerHTML = _;
  }
  initLiftAnimations(h);
  if (e) {
    De(h);
  }
}
function Oe() {
  let e = I(`stockists`);
  gsap
    .timeline()
    .add(animatePageTransition(e), 0)
    .add(
      animateCards(domQueryAll(`.cs-wrap`, e), {
        y: 26,
      }),
      0.12
    )
    .add(
      animateRows(domQueryAll(`.cs-wrap .toolbar > *:not(.toolbar__spacer), .cs-wrap .chip`, e), {
        y: 8,
        stagger: 0.03,
      }),
      0.25
    )
    .add(
      animateWobble(domQueryAll(`.cs-card`, e).slice(0, 12), {
        stagger: 0.05,
      }),
      0.32
    );
  De(e, 0.6);
}
let ke = ``;
let K = `all`;
let q = `spend`;
let J = -1;
let Y = 25;
const Ae = [
  [`name`, `Shopper`, `a-t`],
  [`city`, `City`, `a-s`],
  [`orders`, `Orders`, `a-h r`],
  [`spend`, `Spend`, `a-r r`],
  [`last`, `Last order`, `a-p`],
  [``, `Tags`, `a-g`],
];
function je() {
  let e = store.customers.filter((e) => e.kind === `shopper`);
  let n = B(`shopper`);
  let r = e.filter((e) => (n.get(e.id)?.n ?? 0) > 0);
  let a = r.reduce((acc, item) => acc + (n.get(item.id)?.revenue ?? 0), 0);
  let o = Date.now() - 30 * ONE_DAY_MS;
  let s = new Set(e.map((e) => e.id));
  let c = store.orders.filter(
    (e) => s.has(e.customerId) && e.createdAt >= o && e.status !== `cancelled`
  );
  return [
    {
      key: `n`,
      icon: `users`,
      ico: `sky`,
      label: `Shoppers`,
      value: e.length,
      badge: `${e.filter((e) => e.since >= Date.now() - 30 * ONE_DAY_MS).length} new this month`,
      tone: `plain`,
    },
    {
      key: `sub`,
      icon: `refresh`,
      ico: `ocean`,
      label: `Subscribers`,
      value: e.filter((e) => e.tags.includes(`subscriber`)).length,
      badge: formatPercent(
        e.length ? e.filter((e) => e.tags.includes(`subscriber`)).length / e.length : 0
      ),
      tone: `plain`,
    },
    {
      key: `rep`,
      icon: `cart`,
      ico: `ochre`,
      label: `Spent · 30 days`,
      value: c.reduce((acc, item) => acc + getOrderTotal(item), 0),
      fmt: `money`,
      badge: pluralize(c.length, `order`),
      tone: `plain`,
    },
    {
      key: `avg`,
      icon: `dollar`,
      ico: `teal`,
      label: `Average spend`,
      value: r.length ? a / r.length : 0,
      fmt: `money`,
    },
  ];
}
function Me() {
  let e = I(`shoppers`);
  e.innerHTML = `${renderPageHeader({
    eyebrow: `People who buy online and at the studio shop`,
    title: `Shoppers`,
    actions: `<button type="button" class="btn btn--primary magnetic" data-act="new">${renderIcon(`userPlus`)}New customer</button>`,
    stats: je(),
  })}
  <section class="card sh-card" aria-label="Shoppers">
    <div class="toolbar">
      <div class="chips" data-k="p-tags" role="group" aria-label="Tag"></div>
      <span class="toolbar__spacer"></span>
      <label class="search cs-search">${renderIcon(`search`)}<input type="search" placeholder="Name, email or city…" aria-label="Search shoppers" data-k="p-q" /></label>
    </div>
    <div class="table-wrap"><table class="table table--stack sh-table" style="--areas:'t r' 's p' 'g g'"><thead data-k="p-head"></thead><tbody data-k="p-body"></tbody></table></div>
    <div class="sh-foot" data-k="p-foot"></div>
  </section>`;
  openMoveStockModal(e);
  L(`p-tags`).addEventListener(`click`, (e) => {
    let t = e.target.closest(`[data-tag]`);
    if (t) {
      openNewTransferModal(t);
      K = t.dataset.tag;
      Y = 25;
      X(true);
    }
  });
  L(`p-q`).addEventListener(`input`, (e) => {
    ke = e.target.value;
    Y = 25;
    X(true);
  });
  L(`p-head`).addEventListener(`click`, (e) => {
    let t = e.target.closest(`[data-sort]`);
    if (!t) {
      return;
    }
    let sort = t.dataset.sort;
    if (sort === q) {
      J = J === 1 ? -1 : 1;
    } else {
      q = sort;
      J = sort === `name` || sort === `city` ? 1 : -1;
    }
    X(true);
  });
  L(`p-body`).addEventListener(`click`, (e) => {
    let e_target = e.target;
    if (e_target.closest(`a, button`)) {
      return;
    }
    let n = e_target.closest(`tr[data-open]`);
    if (n) {
      (window as any).navigateTo(`/customers/shoppers/${n.dataset.open}`)
    }
  });
  L(`p-foot`).addEventListener(`click`, (e) => {
    if (e.target.closest(`[data-do="more"]`)) {
      Y += 25;
      X(true);
    }
  });
  e.addEventListener(`click`, (t) => {
    let n = t.target.closest(`[data-act]`);
    if (n) {
      openNewTransferModal(n);
      if (n.dataset.act === `new`) {
        openNewCustomerModal(n, (e) => {
          (window as any).navigateTo(`/customers/${e.kind === `stockist` ? `stockists` : `shoppers`}/${e.id}`)
        });
      } else if (n.dataset.act === `pclear`) {
        ke = ``;
        K = `all`;
        domQuery(`[data-k="p-q"]`, e).value = ``;
        X(true);
      }
    }
  });
}
function X(n) {
  let r = ke.trim();
  let i = r.toLowerCase();
  let o = B(`shopper`);
  let c = store.customers.filter((e) => e.kind === `shopper`);
  let u = c.filter(
    (e) => !i || `${e.name} ${e.email} ${e.city} ${e.region}`.toLowerCase().includes(i)
  );
  let f = [`all`, `vip`, `subscriber`, `new`, `none`];
  let p = (e) => {
    if (e === `all`) {
      return u.length;
    }
    if (e === `none`) {
      return u.filter((e) => !o.get(e.id)?.n).length;
    }
    return u.filter((t) => t.tags.includes(e)).length;
  };
  let m = L(`p-tags`);
  if (m.children.length) {
    f.forEach((e) => {
      let t = domQuery(`[data-tag="${e}"]`, m);
      t.setAttribute(`aria-pressed`, String(e === K));
      let n = domQuery(`b`, t);
      if (n.textContent !== String(p(e))) {
        n.textContent = String(p(e));
        getAvailableSuppliers(n);
      }
    });
  } else {
    m.innerHTML = f
      .map(
        (e) =>
          `<button type="button" class="chip" data-tag="${e}" aria-pressed="${e === K}">${e === `all` ? `All shoppers` : e === `none` ? `No orders yet` : CUSTOMER_TAG_NAMES[e]} <b>${p(e)}</b></button>`
      )
      .join(``);
  }
  let _ = u.filter((e) => K === `all` || (K === `none` ? !o.get(e.id)?.n : e.tags.includes(K)));
  let y = (e) => o.get(e.id);
  let x = {
    name: (e) => e.name.toLowerCase(),
    city: (e) => e.city,
    orders: (e) => y(e).n,
    spend: (e) => y(e).revenue,
    last: (e) => y(e).last,
  };
  _.sort((e, t) => {
    let n = x[q](e);
    let r = x[q](t);
    return (n < r ? -1 : +(n > r)) * J || e.name.localeCompare(t.name);
  });
  L(`p-head`).innerHTML =
    `<tr>${Ae.map(([e, t, n]) => `<th scope="col" class="${n}"${e && e === q ? ` aria-sort="${J > 0 ? `ascending` : `descending`}"` : ``}>${e ? `<button type="button" data-sort="${e}">${t}${renderIcon(e === q && J > 0 ? `up` : `down`, e === q ? `` : `sh-idle`)}</button>` : t}</th>`).join(``)}</tr>`;
  let S = _.slice(0, Y);
  let C = L(`p-body`);
  let w = S.length
    ? S.map((t) => {
        let n = y(t);
        return `<tr class="is-link" data-key="${t.id}" data-open="${t.id}">
      <td class="a-t"><span class="cell-person">${renderAvatar(t.id, `md`)}<span><a class="sh-name" href="/customers/shoppers/${t.id}">${highlightSearchMatch(t.name, r)}</a><small>${highlightSearchMatch(t.email, r)}</small></span></span></td>
      <td class="a-s sh-city">${renderIcon(`map`)}${highlightSearchMatch(`${t.city}, ${t.region}`, r)}</td>
      <td class="a-h r"><b>${formatInt(n.n)}</b></td>
      <td class="a-r r sh-spend"><b>${formatMoneyRound(n.revenue)}</b><small class="sh-n">${pluralize(n.n, `order`)}</small></td>
      <td class="a-p sh-last">${n.last ? `<span>${escapeHtml(formatRelativeTime(n.last))}</span>${formatRelativeTime(n.last) === formatDate(n.last) ? `` : `<small>${escapeHtml(formatDate(n.last))}</small>`}` : `<span class="sh-never">No orders yet</span>`}</td>
      <td class="a-g"><span class="sh-tags">${t.tags.map(R).join(``) || `<span class="cs-none">—</span>`}</span></td>
    </tr>`;
      }).join(``)
    : `<tr class="sh-empty"><td colspan="6">${c.length ? renderEmptyState(`No shoppers match`, `Try another name, email or city — or clear the filter.`, `search`, `<button type="button" class="btn btn--ghost btn--sm" data-act="pclear">${renderIcon(`refresh`)}Clear filters</button>`) : renderEmptyState(`No shoppers yet`, `People who buy online or in the studio appear here after their first order.`, `users`, `<button type="button" class="btn btn--primary btn--sm" data-act="new">${renderIcon(`userPlus`)}New customer</button>`)}</td></tr>`;
  if (n) {
    bindModalDismiss(C, () => {
      C.innerHTML = w;
    });
  } else {
    C.innerHTML = w;
  }
  L(`p-foot`).innerHTML =
    _.length > Y
      ? `<span>Showing ${formatInt(S.length)} of ${pluralize(_.length, `shopper`)}</span><button type="button" class="btn btn--ghost btn--sm" data-do="more">Show more${renderIcon(`down`)}</button>`
      : _.length
        ? `<span>${pluralize(_.length, `shopper`)} · ${formatMoneyRound(_.reduce((acc, item) => acc + y(item).revenue, 0))} spent</span>`
        : ``;
}
function Ne() {
  let e = I(`shoppers`);
  gsap
    .timeline()
    .add(animatePageTransition(e), 0)
    .add(
      animateCards(domQueryAll(`.sh-card`, e), {
        y: 26,
      }),
      0.12
    )
    .add(
      animateRows(domQueryAll(`.sh-card .toolbar > *:not(.toolbar__spacer), .sh-card .chip`, e), {
        y: 8,
        stagger: 0.03,
      }),
      0.25
    )
    .add(
      animateRows(domQueryAll(`tbody tr`, e).slice(0, 14), {
        y: 12,
        stagger: 0.03,
      }),
      0.33
    );
}
const Z = () => domQuery(`#drawer`);
function Pe(e) {
  if (Z().dataset.closing) {
    gsap.delayedCall(0.26, () => Pe(e));
  } else {
    e();
  }
}
let Q = null;
const Fe = 6;
function Ie(t) {
  if (t.orders.length) {
    return (
      t.orders
        .slice(0, Fe)
        .map(
          (t) =>
            `<a class="row cd-ord" href="/orders/all/${t.id}" data-key="${t.id}"><span class="row__txt"><b class="mono">${escapeHtml(t.number)}</b><small>${escapeHtml(formatDate(t.createdAt, true))} · ${pluralize(findBatchByLotNumber(t), `unit`)}</small></span>${renderOrderStatusBadge(t.status)}<b class="cd-ord__tot">${formatMoneyRound(getOrderTotal(t))}</b></a>`
        )
        .join(``) +
      (t.orders.length > Fe
        ? `<p class="cd-more">${pluralize(t.orders.length - Fe, `older order`)} — <a href="/orders/all">see the order book</a></p>`
        : ``)
    );
  }
  return renderEmptyState(`No orders yet`, `Their first order will show up here.`, `orders`);
}
function Le(e) {
  let t = new Map();
  e.orders
    .filter((e) => e.status !== `cancelled`)
    .forEach((e) => e.lines.forEach((e) => t.set(e.productId, (t.get(e.productId) ?? 0) + e.qty)));
  return [...t.entries()]
    .sort((e, t) => t[1] - e[1])
    .slice(0, 4)
    .map(([e, u]) => ({
      p: findProductById(e),
      u,
    }))
    .filter((e) => !!e.p);
}
function Re(t) {
  let n = z(t);
  let r = Le(n);
  let i = t.kind === `stockist`;
  return `<header class="d-head">${renderAvatar(t.id, `lg`)}<div><h2>${escapeHtml(t.name)}</h2><small>${i ? `${escapeHtml(t.contact)} · Stockist` : `Shopper`} · ${escapeHtml(t.city)}, ${escapeHtml(t.region)}</small></div></header>
    <div class="d-pills">${t.tags.map(R).join(``)}<span class="tag" style="--c:var(--slate)">Since ${escapeHtml(formatDate(t.since, true))}</span></div>
    <div class="cd-contact">
      <a class="cd-ch" href="mailto:${escapeHtml(t.email)}">${renderIcon(`mail`)}<span><small>Email</small><b>${escapeHtml(t.email)}</b></span></a>
      ${t.phone ? `<a class="cd-ch" href="tel:${escapeHtml(t.phone.replace(/[^\d+]/g, ``))}">${renderIcon(`phone`)}<span><small>Phone</small><b>${escapeHtml(t.phone)}</b></span></a>` : ``}
      <span class="cd-ch">${renderIcon(`map`)}<span><small>${i ? `Ships to` : `Lives in`}</small><b>${escapeHtml(t.city)}, ${escapeHtml(t.region)}</b></span></span>
    </div>
    <div class="d-facts" data-ds="facts">
      <div><small>Orders</small><b class="num" data-cf="n">${formatInt(n.n)}</b><span>${n.orders.length - n.n ? `${n.orders.length - n.n} cancelled` : `none cancelled`}</span></div>
      <div><small>Revenue</small><b class="num" data-cf="rev">${formatMoneyRound(n.revenue)}</b><span>${n.unpaid ? `${formatMoneyRound(n.unpaid)} unpaid` : `All paid`}</span></div>
      <div><small>Average order</small><b class="num">${formatMoneyRound(n.avg)}</b><span>${i ? `Wholesale prices` : `Retail prices`}</span></div>
      <div><small>Last order</small><b>${escapeHtml(n.last ? formatRelativeTime(n.last) : `—`)}</b><span>${n.last ? escapeHtml(formatDate(n.last, true)) : `Hasn’t ordered yet`}</span></div>
    </div>
    <section class="d-sec"><h3>Monthly spend</h3><div class="cd-bars" data-ds="bars"></div></section>
    <section class="d-sec"><h3>Orders</h3><div class="rows" data-ds="orders">${Ie(n)}</div></section>
    ${
      r.length
        ? `<section class="d-sec"><h3>Buys most</h3><div class="cd-top">${r
            .map(
              ({ p, u }) =>
                `<a class="cd-prod" href="/products/item/${p.id}">${renderProductThumb(p, `lg`)}<b>${escapeHtml(p.name)}</b><small>${escapeHtml(p.size)} · ${pluralize(u, `unit`)}</small></a>`
            )
            .join(``)}</div></section>`
        : ``
    }
    <section class="d-sec"><h3>Note</h3>${t.note ? `<p class="note">${renderIcon(`note`)}<span>${escapeHtml(t.note)}</span></p>` : `<p class="cd-nonote">No note on this account yet.</p>`}</section>
    <footer class="d-actions"><button type="button" class="btn btn--primary" data-do="order">${renderIcon(`plus`)}New order</button><a class="btn btn--ghost" href="mailto:${escapeHtml(t.email)}">${renderIcon(`mail`)}Email ${escapeHtml(i ? (t.contact.split(` `)[0] ?? ``) : (t.name.split(` `)[0] ?? ``))}</a></footer>`;
}
function ze(e) {
  let t = findCustomerById(e);
  let r = `/customers/${P}`;
  if (!t) {
    showToast(`That customer isn’t on file`, {
      ico: `alert`,
    });
    history.replaceState(null, ``, r);
    return;
  }
  if (!(Q?.id === e && Z().open && !Z().dataset.closing)) {
    Pe(() => {
      let { el } = openDrawer(Re(t), {
        label: t.name,
        onClose: () => {
          if (Q?.id === e) {
            Q = null;
          }
          if ((location.pathname.startsWith(`${r}/${e}`) || location.hash.startsWith(`${r}/${e}`))) {
            history.replaceState(null, ``, r);
          }
        },
      });
      let i = ye(6);
      let a = z(t);
      let chart = createDonutChart(domQuery(`[data-ds="bars"]`, el), {
        labels: i.map((e) =>
          new Date(e).toLocaleDateString(`en-US`, {
            month: `short`,
          })
        ),
        values: a.monthly,
        format: formatMoneyRound,
        tone: t.kind === `stockist` ? `pine` : `sky`,
        label: `Monthly spend of ${t.name}`,
        highlight: 5,
      });
      chart.play(0.3);
      Q = {
        id: e,
        el,
        chart,
      };
      animatePop(domQueryAll(`.cd-prod .thumb`, el), {
        from: 0.5,
        delay: 0.35,
        stagger: 0.07,
      });
      el.addEventListener(`click`, (t) => {
        let n = t.target.closest(`[data-do="order"]`);
        if (n) {
          openNewTransferModal(n);
          openNewOrderModal(
            {
              customerId: e,
            },
            n,
            (e) => {
              (window as any).navigateTo(`/orders/all/${e.id}`)
            }
          );
        }
      });
    });
  }
}
function Be() {
  if (!Q || !Z().open) {
    return;
  }
  let e = findCustomerById(Q.id);
  if (!e) {
    closeDrawer();
    return;
  }
  let t = z(e);
  let n = queryOne(`[data-ds="orders"]`, Q.el);
  if (n) {
    bindModalDismiss(n, () => {
      n.innerHTML = Ie(t);
    });
  }
  let i = queryOne(`[data-cf="n"]`, Q.el);
  let a = queryOne(`[data-cf="rev"]`, Q.el);
  if (i && i.textContent !== formatInt(t.n)) {
    i.textContent = formatInt(t.n);
    getAvailableSuppliers(i);
  }
  if (a && a.textContent !== formatMoneyRound(t.revenue)) {
    a.textContent = formatMoneyRound(t.revenue);
    getAvailableSuppliers(a);
  }
  Q.chart?.update(t.monthly);
}
function Ve(e) {
  P = e;
  domQueryAll(`[data-sub]`, N).forEach((t) => {
    t.hidden = t.dataset.sub !== e;
  });
  if (!F.has(e)) {
    F.add(e);
    if (e === `stockists`) {
      Te();
    } else {
      Me();
    }
  }
  if (e === `stockists`) {
    $(`stockists`);
    G(false);
    Oe();
  } else {
    $(`shoppers`);
    X(false);
    Ne();
  }
}
function $(e) {
  if (F.has(e)) {
    (e === `stockists` ? Ce() : je()).forEach((t) => xe(I(e), t.key, t.value, t.badge, t.tone));
  }
}
export const page = {
  title: (e) =>
    (e[0] === `shoppers` ? `Shoppers` : `Stockists`) +
    (e[1] && findCustomerById(e[1]) ? ` · ${findCustomerById(e[1]).name}` : ``),
  mount(e) {
    N = e;
    N.innerHTML = ge.map((e) => `<div data-sub="${e}" hidden></div>`).join(``);
    let t = () => {
      if (_e(`stockists`)) {
        $(`stockists`);
        G(true);
      } else if (_e(`shoppers`)) {
        $(`shoppers`);
        X(true);
      }
      Be();
    };
    findLocationById(`customers`, t);
    findLocationById(`orders`, t);
  },
  enter({ params, same }) {
    let n = ge.includes(params[0]) ? params[0] : `stockists`;
    if (!(same && n === P && F.has(n))) {
      Ve(n);
    }
    let i = params[1];
    if (i) {
      ze(i);
    } else if (Q && Z().open) {
      closeDrawer();
    }
  },
  leave() {
    if (Q && Z().open) {
      closeDrawer();
    }
  },
};
