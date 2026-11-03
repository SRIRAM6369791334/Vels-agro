import {
  formatTime,
  escapeHtml,
  formatRelativeDay,
  store,
  ACTIVE_ORDER_STAGES,
  updateReturnStatus,
  findOrderById,
  showToast,
  closeDrawer,
  ONE_DAY_MS,
  renderEmptyState,
  RETURN_STATUS_TONES,
  KANBAN_STAGES,
  queryOne,
  animatePageTransition,
  domQuery,
  findProductById,
  formatProductFullName,
  CHANNEL_NAMES,
  renderAvatar,
  renderNotificationItem,
  motionDuration,
  renderStockStatusBadge,
  findBatchByLotNumber,
  startOfToday,
  openDrawer,
  RETURN_STATUS_NAMES,
  formatDate,
  getAvailableLocations,
  bindModalDismiss,
  getAvailableSuppliers,
  animateWobble,
  getMaterialInventoryValue,
  formatRelativeTime,
  cancelOrder,
  openMoveStockModal,
  formatInt,
  findLocationById,
  exportOrdersCsv,
  animateTitle,
  formatMoney,
  openNewTransferModal,
  animateRows,
  formatPercent,
  openNewOrderModal,
  renderFilterBar,
  animateCards,
  getPendingReturnsCount,
  exportDataBackup,
  formatMoneyRound,
  pluralize,
  animatePop,
  highlightSearchMatch,
  markOrderPaid,
  gsap,
  renderPill,
  domQueryAll,
  ORDER_STATUS_META,
  advanceOrderStatus,
  initLiftAnimations,
  renderIcon,
  bindMagnetic,
  createCustomElement,
  findCustomerById,
  renderPageHeader,
  renderSegmentedControl,
  getOrderTotal,
  renderProductThumb,
  renderOrderStatusBadge,
  initSegmentedControl,
} from "../../main.ts";
const Le = [`all`, `board`, `returns`];
let N;
let Re = `all`;
const ze = new Set();
const P = (e) => domQuery(`[data-sub="${e}"]`, N);
const F = (e) => domQuery(`[data-k="${e}"]`, N);
const I = (e) => !!N && !N.hidden && Re === e;
const Be = {
  wholesale: `pine`,
  online: `sky`,
  studio: `ochre`,
};
const Ve = {
  wholesale: `Wholesale`,
  online: `Online`,
  studio: `Studio`,
};
const He = (channel) => `<span class="tag" style="--c:var(--${Be[channel]})">${Ve[channel]}</span>`;
const L = (e) => {
  if (ORDER_STATUS_META[e].tone === `faint`) {
    return `slate`;
  }
  return ORDER_STATUS_META[e].tone;
};
const Ue = (e) => findCustomerById(e.customerId)?.name ?? `Unknown customer`;
const We = (e) => {
  if (e) {
    return `/customers/${e.kind === `stockist` ? `stockists` : `shoppers`}/${e.id}`;
  }
  return `/customers/stockists`;
};
const R = (e) => ACTIVE_ORDER_STAGES.includes(e.status) && e.shipBy < Date.now();
const Ge = (t) => `${formatDate(t)}, ${formatTime(t)}`;
const Ke = (shipBy) => {
  let t = formatRelativeDay(shipBy);
  if ([`Today`, `Tomorrow`, `Yesterday`].includes(t)) {
    return t.toLowerCase();
  }
  return t;
};
function qe(e, t = 3) {
  let n = e.lines.map((e) => findProductById(e.productId)).filter((e) => !!e);
  return `<span class="o-thumbs">${n
    .slice(0, t)
    .map((e) => renderProductThumb(e, `sm`))
    .join(``)}${n.length > t ? `<span class="o-thumbs__more">+${n.length - t}</span>` : ``}</span>`;
}
const Je = {
  new: [`Start picking`, `scan`],
  picking: [`Mark packed`, `box`],
  packed: [`Ship order`, `truck`],
  shipped: [`Mark delivered`, `check`],
};
function Ye(e, key, n, badge, tone) {
  let a = queryOne(`[data-stat="${key}"]`, e);
  if (!a) {
    return;
  }
  let o = queryOne(`[data-count]`, a);
  if (o && Number(o.dataset.count) !== n) {
    renderFilterBar(o, n);
    getAvailableSuppliers(o);
  }
  let s = queryOne(`.badge`, a);
  if (s && badge !== undefined) {
    s.textContent = badge;
    s.className = `badge badge--${tone ?? `plain`}`;
    s.hidden = !badge;
  }
}
const z = () => domQuery(`#drawer`);
function Xe(e) {
  if (z().dataset.closing) {
    gsap.delayedCall(0.26, () => Xe(e));
  } else {
    e();
  }
}
let B = null;
const Ze = (e, t) => !!B && B.kind === e && B.id === t && z().open && !z().dataset.closing;
function Qe(e) {
  if (e.status === `cancelled`) {
    return Math.max(0, ...e.history.map((e) => KANBAN_STAGES.indexOf(e.to)));
  }
  return KANBAN_STAGES.indexOf(e.status);
}
function $e(e) {
  let n = Qe(e);
  let r = e.status === `cancelled`;
  return `<div class="od-steps${r ? ` is-cancelled` : ``}" role="list" aria-label="Order progress">
    <span class="od-steps__track" aria-hidden="true"><span class="od-steps__fill"></span></span>
    ${KANBAN_STAGES.map((i, a) => {
      let o = [...e.history].reverse().find((e) => e.to === i);
      let s = a < n || (a === n && (i === `delivered` || r));
      return `<div class="od-step ${s ? `is-done` : a === n ? `is-cur` : ``}" role="listitem" data-i="${a}"${a === n && !r ? ` aria-current="step"` : ``}>
        <span class="od-step__dot">${renderIcon(s ? `check` : ORDER_STATUS_META[i].icon)}</span><b>${ORDER_STATUS_META[i].name}</b><small>${o && a <= n ? escapeHtml(Ge(o.at)) : `&nbsp;`}</small></div>`;
    }).join(``)}
  </div>`;
}
function et(e) {
  let t = R(e);
  return `${renderOrderStatusBadge(e.status)}${e.status === `cancelled` ? `` : e.paid ? renderPill(`Paid`, `good`, `check`) : renderPill(`Awaiting payment`, `warn`, `clock`)}${He(e.channel)}${t ? renderPill(`Late · was due ${Ke(e.shipBy)}`, `rose`, `alert`) : ``}`;
}
function tt(r) {
  let i = exportDataBackup(r.locId);
  return `<div><small>Ships from</small><b>${escapeHtml(i?.name ?? `—`)}</b><span>${escapeHtml(i?.city ?? ``)}</span></div>
    <div class="${R(r) ? `is-late` : ``}"><small>Ship by</small><b>${escapeHtml(formatRelativeDay(r.shipBy))}</b><span>${formatTime(r.shipBy)}${R(r) ? ` · late` : ``}</span></div>
    <div><small>Carrier</small><b>${escapeHtml(r.carrier)}</b><span>${r.channel === `studio` ? `Handed over at the till` : r.channel === `wholesale` ? `Cartons, palletised over 40 units` : `Mailer carton`}</span></div>
    <div><small>Tracking</small><b class="mono od-track">${r.tracking ? escapeHtml(r.tracking) : `—`}</b><span>${r.tracking ? `<button type="button" class="od-link" data-do="copy">${renderIcon(`copy`)}Copy number</button>` : KANBAN_STAGES.indexOf(r.status) >= 3 ? `No label for collected orders` : `Issued when it ships`}</span></div>`;
}
function nt(e) {
  if (e.status === `cancelled`) {
    return ``;
  }
  return `<label class="od-pay__lab"><span class="od-pay__txt"><b>Payment received</b><small>${e.paid ? `${formatMoney(getOrderTotal(e))} settled${e.channel === `wholesale` ? ` on account` : ``}` : e.channel === `wholesale` ? `Net 30 invoice — switch on when it lands` : `Waiting on the card capture`}</small></span>
    <button type="button" class="switch" role="switch" aria-checked="${e.paid}" aria-label="Payment received" data-do="paid"${e.paid ? ` aria-disabled="true"` : ``}></button></label>`;
}
function rt(e) {
  return [...e.history]
    .reverse()
    .map(
      (n, r) =>
        `<li class="od-hist__item" data-key="h-${e.history.length - r}" style="--c:var(--${L(n.to)})"><i></i><span><b>${n.to === `new` ? `Order placed` : n.to === `cancelled` ? `Cancelled` : `Moved to ${ORDER_STATUS_META[n.to].name}`}</b><small>${escapeHtml(getPendingReturnsCount(n.by) || `Vels`)} · ${escapeHtml(renderNotificationItem(n.at))}</small></span></li>`
    )
    .join(``);
}
function it(e) {
  let t = Je[e.status];
  let n = KANBAN_STAGES.indexOf(e.status) < 3 && e.status !== `cancelled`;
  return (
    [
      t
        ? `<button type="button" class="btn btn--primary" data-do="advance">${renderIcon(t[1])}${t[0]}</button>`
        : ``,
      e.tracking
        ? `<button type="button" class="btn btn--ghost" data-do="copy">${renderIcon(`copy`)}Copy tracking</button>`
        : ``,
      n
        ? `<button type="button" class="btn btn--ghost od-cancel" data-do="cancel">${renderIcon(`close`)}Cancel order</button>`
        : ``,
    ].join(``) ||
    `<p class="od-closed">${renderIcon(e.status === `cancelled` ? `close` : `check`)}${e.status === `cancelled` ? `This order was cancelled — its stock went back on sale.` : `Delivered. Nothing left to do on this one.`}</p>`
  );
}
function at(e) {
  let n = findCustomerById(e.customerId);
  let r = e.lines
    .map((e) => {
      let n = findProductById(e.productId);
      if (n) {
        return `<div class="row od-line">${renderProductThumb(n, `md`)}<span class="row__txt"><b>${escapeHtml(n.name)}</b><small>${escapeHtml(n.size)} · <span class="mono">${escapeHtml(n.sku)}</span></small></span><span class="od-line__q">${formatInt(e.qty)} × ${formatMoney(e.price)}</span><b class="od-line__sub">${formatMoney(e.qty * e.price)}</b></div>`;
      }
      return ``;
    })
    .join(``);
  return `<header class="d-head"><span class="tile" style="--c:var(--${L(e.status)})" data-ds="tile">${renderIcon(`orders`)}</span><div><h2>${escapeHtml(e.number)}</h2><small>Placed ${escapeHtml(renderNotificationItem(e.createdAt))} · ${CHANNEL_NAMES[e.channel]}</small></div></header>
    <div class="d-pills" data-ds="pills">${et(e)}</div>
    <div data-ds="steps">${$e(e)}</div>
    <div data-ds="err" hidden></div>
    <section class="d-sec"><h3>Customer</h3><a class="row od-cust" href="${We(n)}">${renderAvatar(e.customerId, `md`)}<span class="row__txt"><b>${escapeHtml(n?.name ?? `Unknown`)}</b><small>${escapeHtml([n?.kind === `stockist` ? n.contact : ``, n ? `${n.city}, ${n.region}` : ``].filter(Boolean).join(` · `))}</small></span>${renderIcon(`chevR`, `row__go`)}</a></section>
    <div class="d-facts" data-ds="facts">${tt(e)}</div>
    <section class="d-sec"><h3>Items <span class="od-count">${pluralize(findBatchByLotNumber(e), `unit`)}</span></h3><div class="rows">${r}</div>
      <div class="od-total"><span>Order total</span><b>${formatMoney(getOrderTotal(e))}</b></div></section>
    <div class="od-pay" data-ds="pay">${nt(e)}</div>
    <section class="d-sec"><h3>History</h3><ol class="od-hist" data-ds="hist">${rt(e)}</ol></section>
    <footer class="d-actions" data-ds="acts">${it(e)}</footer>`;
}
function ot(e, t, n, r = 0) {
  let i = queryOne(`.od-steps__fill`, e);
  if (!i) {
    return;
  }
  let a = (e) => Math.max(0, e) / (KANBAN_STAGES.length - 1);
  gsap.fromTo(
    i,
    {
      scaleX: a(t),
    },
    {
      scaleX: a(n),
      duration: motionDuration(t < 0 ? 0.9 : 0.7),
      delay: motionDuration(r),
      ease: `power3.inOut`,
    }
  );
  let o = domQueryAll(`.od-step`, e);
  if (t < 0) {
    animatePop(
      o
        .filter((e) => e.classList.contains(`is-done`) || e.classList.contains(`is-cur`))
        .map((e) => domQuery(`.od-step__dot`, e)),
      {
        from: 0.5,
        delay: 0.15,
        stagger: 0.09,
      }
    );
    return;
  }
  let s = Math.min(t, n);
  let c = Math.max(t, n);
  o.slice(s, c + 1).forEach((e, t) =>
    animatePop(domQuery(`.od-step__dot`, e), {
      from: 0.55,
      delay: 0.12 + t * 0.08,
    })
  );
}
function st(e) {
  let t = findOrderById(e);
  let n = `/orders/${Re}`;
  if (!t) {
    showToast(`That order isn’t in the book any more`, {
      ico: `alert`,
    });
    history.replaceState(null, ``, n);
    return;
  }
  if (!Ze(`order`, e)) {
    Xe(() => {
      let { el } = openDrawer(at(t), {
        label: `Order ${t.number}`,
        wide: true,
        onClose: () => {
          if (B?.kind === `order` && B.id === e) {
            B = null;
          }
          if ((location.pathname.startsWith(`${n}/${e}`) || location.hash.startsWith(`${n}/${e}`))) {
            history.replaceState(null, ``, n);
          }
        },
      });
      B = {
        kind: `order`,
        id: e,
        el,
        status: t.status,
      };
      el.addEventListener(`click`, (t) => ct(t, e));
      ot(el, -1, Qe(t), 0.2);
    });
  }
}
function ct(e, t) {
  let n = e.target.closest(`[data-do]`);
  if (!n) {
    return;
  }
  let r = findOrderById(t);
  if (!r) {
    return;
  }
  openNewTransferModal(n);
  let i = n.dataset.do;
  if (i === `advance`) {
    let e = advanceOrderStatus(t);
    if (e) {
      showToast(e, {
        ico: `alert`,
      });
      lt(e);
    }
  } else {
    if (i === `cancel`) {
      cancelOrder(t);
    } else if (i === `paid`) {
      if (r.paid) {
        showToast(`Paid is final here — refunds go through Returns`, {
          ico: `info`,
        });
      } else {
        markOrderPaid(t);
      }
    } else if (i === `copy` && r.tracking) {
      renderStockStatusBadge(r.tracking, `Tracking number copied`);
    }
  }
}
function lt(e) {
  if (!B) {
    return;
  }
  let n = queryOne(`[data-ds="err"]`, B.el);
  if (n) {
    n.hidden = false;
    n.innerHTML = `<p class="note note--warn">${renderIcon(`alert`)}<span>${escapeHtml(e)}</span></p>`;
    if (!bindMagnetic()) {
      gsap.fromTo(
        n.firstElementChild,
        {
          x: -8,
          opacity: 0,
        },
        {
          x: 0,
          opacity: 1,
          duration: 0.6,
          ease: `elastic.out(1, 0.4)`,
          clearProps: `transform,opacity`,
        }
      );
    }
  }
}
function ut() {
  if (!B || B.kind !== `order` || !z().open) {
    return;
  }
  let e = findOrderById(B.id);
  if (!e) {
    closeDrawer();
    return;
  }
  let t = B.el;
  let n = (e, n) => {
    let r = queryOne(`[data-ds="${e}"]`, t);
    if (r) {
      r.innerHTML = n;
    }
    return r;
  };
  let B_status = B.status;
  let i = B_status === `cancelled` ? -1 : KANBAN_STAGES.indexOf(B_status);
  n(`pills`, et(e));
  n(`facts`, tt(e));
  n(`pay`, nt(e));
  n(`acts`, it(e));
  let a = queryOne(`[data-ds="tile"]`, t);
  if (a) {
    a.style.setProperty(`--c`, `var(--${L(e.status)})`);
  }
  let s = queryOne(`[data-ds="hist"]`, t);
  if (s) {
    bindModalDismiss(s, () => {
      s.innerHTML = rt(e);
    });
  }
  if (B_status !== e.status) {
    let r = queryOne(`[data-ds="err"]`, t);
    if (r) {
      r.hidden = true;
      r.innerHTML = ``;
    }
    n(`steps`, $e(e));
    ot(t, Math.max(0, i), Qe(e));
    animatePop(queryOne(`[data-ds="pills"] .spill`, t));
  } else {
    let n = queryOne(`.od-steps__fill`, t);
    if (n) {
      gsap.set(n, {
        scaleX: Qe(e) / (KANBAN_STAGES.length - 1),
      });
    }
  }
  B.status = e.status;
}
let V = `all`;
let H = `all`;
let dt = ``;
let U = 30;
let W = `date`;
let G = -1;
let K = 20;
const ft = [
  [7, `Last 7 days`],
  [30, `Last 30 days`],
  [90, `Last 90 days`],
  [0, `All time`],
];
const pt = [
  [`number`, `Order`, `a-h`],
  [`date`, `Date`, `a-h`],
  [`customer`, `Customer`, `a-t`],
  [`channel`, `Channel`, `a-h`],
  [`items`, `Items`, `a-s`],
  [`total`, `Total`, `a-r r`],
  [`paid`, `Paid`, `a-h`],
  [`status`, `Status`, `a-p`],
];
const mt = {
  number: (e) => Number(e.number.slice(3)) || 0,
  date: (e) => e.createdAt,
  customer: (e) => Ue(e).toLowerCase(),
  channel: (e) => e.channel,
  items: (e) => findBatchByLotNumber(e),
  total: (e) => getOrderTotal(e),
  paid: (e) => {
    if (e.status === `cancelled`) {
      return -1;
    }
    return +!!e.paid;
  },
  status: (e) => {
    if (e.status === `cancelled`) {
      return 9;
    }
    return KANBAN_STAGES.indexOf(e.status);
  },
};
function ht() {
  let e = store.orders.filter((e) => ACTIVE_ORDER_STAGES.includes(e.status));
  let t = e.filter((e) => e.shipBy < startOfToday() + ONE_DAY_MS);
  let n = e.filter(R);
  let a = store.orders.filter(
    (e) => e.channel === `wholesale` && !e.paid && e.status !== `cancelled`
  );
  return [
    {
      key: `open`,
      icon: `inbox`,
      ico: `sky`,
      label: `Open orders`,
      value: e.length,
      badge: `${pluralize(
        e.reduce((acc, item) => acc + findBatchByLotNumber(item), 0),
        `unit`
      )}`,
      tone: `plain`,
    },
    {
      key: `today`,
      icon: `truck`,
      ico: `teal`,
      label: `To ship today`,
      value: t.length,
      badge: n.length ? `${n.length} late` : `On time`,
      tone: n.length ? `bad` : `good`,
    },
    {
      key: `month`,
      icon: `dollar`,
      ico: `pine`,
      label: `Revenue this month`,
      value: getMaterialInventoryValue(),
      fmt: `money`,
    },
    {
      key: `unpaid`,
      icon: `receipt`,
      ico: `ochre`,
      label: `Unpaid wholesale`,
      value: a.reduce((acc, item) => acc + getOrderTotal(item), 0),
      fmt: `money`,
      badge: pluralize(a.length, `invoice`),
      tone: a.length ? `warn` : `good`,
    },
  ];
}
function gt() {
  let e = P(`all`);
  ht().forEach((t) => Ye(e, t.key, t.value, t.badge, t.tone));
}
function _t() {
  let e = U ? Date.now() - U * ONE_DAY_MS : 0;
  let t = dt.trim().toLowerCase();
  return store.orders.filter(
    (n) =>
      n.createdAt >= e &&
      (H === `all` || n.channel === H) &&
      (!t || `${n.number} ${Ue(n)} ${n.tracking ?? ``}`.toLowerCase().includes(t))
  );
}
function vt() {
  let e = P(`all`);
  e.innerHTML = `${renderPageHeader({
    eyebrow: `Every sale — stockists, the online shop and the studio till`,
    title: `All orders`,
    actions: `<button type="button" class="btn btn--ghost" data-act="export">${renderIcon(`download`)}Export CSV</button><button type="button" class="btn btn--primary magnetic" data-act="new">${renderIcon(`plus`)}New order</button>`,
    stats: ht(),
  })}
  <section class="card oa-card" aria-label="Orders">
    <div class="toolbar oa-toolbar">
      <div class="chips" data-k="o-st" role="group" aria-label="Status"></div>
      <span class="toolbar__spacer"></span>
      ${renderSegmentedControl(
        `Channel`,
        [
          [`all`, `All`],
          [`wholesale`, `Wholesale`],
          [`online`, `Online`],
          [`studio`, `Studio`],
        ],
        H,
        `oa-seg`
      )}
      <label class="search oa-search">${renderIcon(`search`)}<input type="search" placeholder="Number, customer or tracking…" aria-label="Search orders" data-k="o-q" /></label>
      <button type="button" class="btn btn--ghost btn--sm oa-range" data-k="o-range" aria-haspopup="menu" aria-expanded="false">${renderIcon(`calendar`)}<span>${ft.find((e) => e[0] === U)[1]}</span>${renderIcon(`down`)}</button>
    </div>
    <div class="table-wrap"><table class="table table--stack oa-table" style="--areas:'t r' 's p'"><thead data-k="o-head"></thead><tbody data-k="o-body"></tbody></table></div>
    <div class="oa-foot" data-k="o-foot"></div>
  </section>`;
  openMoveStockModal(e);
  bt = initSegmentedControl(domQuery(`.oa-seg`, e), (e) => {
    H = e;
    K = 20;
    q(true);
  });
  F(`o-st`).addEventListener(`click`, (e) => {
    let t = e.target.closest(`[data-st]`);
    if (t) {
      openNewTransferModal(t);
      V = t.dataset.st;
      K = 20;
      q(true);
    }
  });
  F(`o-q`).addEventListener(`input`, (e) => {
    dt = e.target.value;
    K = 20;
    q(true);
  });
  F(`o-range`).addEventListener(`click`, (e) => {
    let e_currentTarget = e.currentTarget;
    createCustomElement(
      e_currentTarget,
      ft.map(([e, n]) => ({
        label: n,
        checked: e === U,
        onSelect: () => {
          if (e !== U) {
            U = e;
            domQuery(`span`, e_currentTarget).textContent = n;
            K = 20;
            q(true);
          }
        },
      })),
      {
        align: `end`,
      }
    );
  });
  F(`o-head`).addEventListener(`click`, (e) => {
    let t = e.target.closest(`[data-sort]`);
    if (!t) {
      return;
    }
    let sort = t.dataset.sort;
    if (sort === W) {
      G = G === 1 ? -1 : 1;
    } else {
      W = sort;
      G = sort === `customer` || sort === `channel` ? 1 : -1;
    }
    q(true);
  });
  F(`o-body`).addEventListener(`click`, (e) => {
    let e_target = e.target;
    if (e_target.closest(`a, button`)) {
      return;
    }
    let n = e_target.closest(`tr[data-open]`);
    if (n) {
      (window as any).navigateTo(`/orders/all/${n.dataset.open}`)
    }
  });
  F(`o-foot`).addEventListener(`click`, (e) => {
    let t = e.target.closest(`[data-do]`);
    if (t) {
      if (t.dataset.do === `more`) {
        K += 20;
        q(true);
      } else {
        yt();
      }
    }
  });
  e.addEventListener(`click`, (e) => {
    let t = e.target.closest(`[data-act]`);
    if (t) {
      openNewTransferModal(t);
      if (t.dataset.act === `new`) {
        openNewOrderModal({}, t, (e) => {
          (window as any).navigateTo(`/orders/all/${e.id}`)
        });
      } else if (t.dataset.act === `export`) {
        exportOrdersCsv();
      } else if (t.dataset.act === `clear`) {
        yt();
      }
    }
  });
}
function yt() {
  V = `all`;
  dt = ``;
  U = 0;
  K = 20;
  let e = P(`all`);
  domQuery(`[data-k="o-q"]`, e).value = ``;
  domQuery(`[data-k="o-range"] span`, e).textContent = `All time`;
  H = `all`;
  bt?.select(`all`, {
    silent: true,
  });
  q(true);
}
var bt = null;
let xt = null;
function q(n) {
  let i = _t();
  let a = dt.trim();
  let o = new Map([[`all`, i.length]]);
  i.forEach((e) => o.set(e.status, (o.get(e.status) ?? 0) + 1));
  let s = F(`o-st`);
  let c = [`all`, `new`, `picking`, `packed`, `shipped`, `delivered`, `cancelled`];
  if (s.children.length) {
    c.forEach((e) => {
      let t = domQuery(`[data-st="${e}"]`, s);
      t.setAttribute(`aria-pressed`, String(e === V));
      let n = domQuery(`b`, t);
      let r = o.get(e) ?? 0;
      if (n.textContent !== String(r)) {
        n.textContent = String(r);
        getAvailableSuppliers(n);
      }
    });
  } else {
    s.innerHTML = c
      .map(
        (e) =>
          `<button type="button" class="chip" data-st="${e}" aria-pressed="${e === V}">${e === `all` ? `` : `<i class="dot" style="--c:var(--${L(e)})"></i>`}${e === `all` ? `All` : ORDER_STATUS_META[e].name} <b data-n="${e}">${o.get(e) ?? 0}</b></button>`
      )
      .join(``);
  }
  F(`o-head`).innerHTML =
    `<tr>${pt.map(([e, t, n]) => `<th scope="col" class="${n}"${e === W ? ` aria-sort="${G > 0 ? `ascending` : `descending`}"` : ``}><button type="button" data-sort="${e}">${t}${renderIcon(e === W && G > 0 ? `up` : `down`, e === W ? `` : `oa-idle`)}</button></th>`).join(``)}</tr>`;
  let l = i.filter((e) => V === `all` || e.status === V);
  let u = mt[W];
  l.sort((e, t) => {
    let n = u(e);
    let r = u(t);
    return (n < r ? -1 : +(n > r)) * G || t.createdAt - e.createdAt;
  });
  let d = l.slice(0, K);
  let f = F(`o-body`);
  let te = d.length
    ? d
        .map((n) => {
          let r = findCustomerById(n.customerId);
          let i = getOrderTotal(n);
          return `<tr class="is-link${n.status === `cancelled` ? ` is-void` : ``}" data-key="${n.id}" data-open="${n.id}">
      <td class="a-h"><a class="ref oa-no" href="/orders/all/${n.id}">${highlightSearchMatch(n.number, a)}</a>${R(n) ? `<span class="oa-late" title="Past its ship-by time">${renderIcon(`alert`)}</span>` : ``}</td>
      <td class="a-h oa-date">${escapeHtml(formatDate(n.createdAt))}<small>${escapeHtml(formatTime(n.createdAt))}</small></td>
      <td class="a-t"><span class="cell-person">${renderAvatar(n.customerId, `sm`)}<span><b>${highlightSearchMatch(r?.name ?? `Unknown`, a)}</b><small class="oa-city">${escapeHtml(r ? `${r.city}, ${r.region}` : ``)}</small><small class="oa-sub"><a class="oa-sub__no" href="/orders/all/${n.id}">${highlightSearchMatch(n.number, a)}</a> · ${escapeHtml(formatDate(n.createdAt))} · ${Ve[n.channel]}</small></span></span></td>
      <td class="a-h">${He(n.channel)}</td>
      <td class="a-s"><span class="oa-items">${qe(n)}<small>${pluralize(findBatchByLotNumber(n), `unit`)}</small></span></td>
      <td class="a-r r oa-tot"><b>${formatMoney(i)}</b>${n.tracking && a && n.tracking.toLowerCase().includes(a.toLowerCase()) ? `<small class="mono">${highlightSearchMatch(n.tracking, a)}</small>` : ``}</td>
      <td class="a-h">${n.status === `cancelled` ? `<span class="oa-dash">—</span>` : n.paid ? renderPill(`Paid`, `good`) : renderPill(`Unpaid`, `warn`)}</td>
      <td class="a-p">${renderOrderStatusBadge(n.status)}</td>
    </tr>`;
        })
        .join(``)
    : `<tr class="oa-empty"><td colspan="8">${store.orders.length ? renderEmptyState(`No orders match`, `Nothing ${V === `all` ? `` : `${ORDER_STATUS_META[V].name.toLowerCase()} `}in this view. Widen the dates or clear the search.`, `search`, `<button type="button" class="btn btn--ghost btn--sm" data-act="clear">${renderIcon(`refresh`)}Clear filters</button>`) : renderEmptyState(`No orders yet`, `Orders from stockists, the online shop and the studio land here.`, `orders`, `<button type="button" class="btn btn--primary btn--sm" data-act="new">${renderIcon(`plus`)}New order</button>`)}</td></tr>`;
  if (n) {
    bindModalDismiss(f, () => {
      f.innerHTML = te;
    });
  } else {
    f.innerHTML = te;
  }
  F(`o-foot`).innerHTML = l.length
    ? `<span>Showing <b>${formatInt(d.length)}</b> of ${pluralize(l.length, `order`)} · <b>${formatMoneyRound(l.reduce((acc, item) => acc + (item.status === `cancelled` ? 0 : getOrderTotal(item)), 0))}</b></span>${l.length > K ? `<button type="button" class="btn btn--ghost btn--sm" data-do="more">Show ${Math.min(20, l.length - K)} more${renderIcon(`down`)}</button>` : ``}`
    : ``;
}
function St() {
  let e = P(`all`);
  gsap
    .timeline()
    .add(animatePageTransition(e), 0)
    .add(
      animateCards(domQueryAll(`.oa-card`, e), {
        y: 26,
      }),
      0.15
    )
    .add(
      animateRows(domQueryAll(`.oa-toolbar > *:not(.toolbar__spacer), .oa-toolbar .chip`, e), {
        y: 8,
        stagger: 0.03,
      }),
      0.3
    )
    .add(
      animateRows(domQueryAll(`tbody tr`, e).slice(0, 14), {
        y: 12,
        stagger: 0.03,
      }),
      0.38
    );
}
const Ct = [`new`, `picking`, `packed`, `shipped`];
const wt = {
  new: `Waiting to be picked`,
  picking: `On the floor`,
  packed: `Boxed, label printed`,
  shipped: `With the carrier`,
};
let J = `all`;
const Tt = new Map();
const Et = () =>
  store.orders.filter(
    (e) =>
      e.status === `delivered` &&
      (e.history.findLast((e) => e.to === `delivered`)?.at ?? 0) >= startOfToday()
  );
function Dt(e) {
  let t = store.orders.filter((t) => t.status === e && (J === `all` || t.channel === J));
  if (e === `shipped`) {
    return t.sort(
      (e, t) =>
        (t.history.findLast((e) => e.to === `shipped`)?.at ?? 0) -
        (e.history.findLast((e) => e.to === `shipped`)?.at ?? 0)
    );
  }
  return t.sort((e, t) => e.shipBy - t.shipBy || e.createdAt - t.createdAt);
}
function Ot(e) {
  let r = findCustomerById(e.customerId);
  let i = R(e);
  let a = e.history.findLast((e) => e.to === `shipped`)?.at;
  let o =
    e.status === `shipped`
      ? `<span class="ob-ship is-out">${renderIcon(`truck`)}${escapeHtml(e.carrier.split(` `)[0] ?? ``)} · ${a ? formatRelativeTime(a) : ``}</span>`
      : `<span class="ob-ship${i ? ` is-late` : ``}">${renderIcon(i ? `alert` : `clock`)}${i ? `Late · ${escapeHtml(formatRelativeDay(e.shipBy))}` : `Ship ${/^[a-z]/.test(Ke(e.shipBy)) ? `` : `by `}${escapeHtml(Ke(e.shipBy))}`}</span>`;
  return `<article class="ob-card" data-key="${e.id}" data-id="${e.id}" tabindex="0" aria-roledescription="draggable order" aria-label="${escapeHtml(`${e.number}, ${r?.name ?? ``}, ${formatMoneyRound(getOrderTotal(e))}, ${ORDER_STATUS_META[e.status].name}${i ? `, late` : ``}`)}" aria-describedby="ob-help">
    <div class="ob-card__top"><span class="mono ob-card__no">${escapeHtml(e.number)}</span>${He(e.channel)}</div>
    <div class="ob-card__who">${renderAvatar(e.customerId, `sm`)}<b>${escapeHtml(r?.name ?? `Unknown`)}</b></div>
    <div class="ob-card__mid">${qe(e, 4)}<span class="ob-card__fig"><small>${pluralize(findBatchByLotNumber(e), `unit`)}</small><b>${formatMoneyRound(getOrderTotal(e))}</b></span></div>
    <div class="ob-card__foot">${o}${e.paid ? `` : `<span class="ob-unpaid" title="Awaiting payment">${renderIcon(`dollar`)}</span>`}</div>
  </article>`;
}
function kt() {
  let e = P(`board`);
  e.innerHTML = `<header class="head"><div class="head__lead"><div class="head__text"><p class="head__eyebrow">Pick, pack and ship — drag a card to move it on</p><h1 class="head__title" tabindex="-1">Order board</h1></div></div>
      <div class="head__actions">${renderSegmentedControl(
        `Channel`,
        [
          [`all`, `All`],
          [`wholesale`, `Wholesale`],
          [`online`, `Online`],
          [`studio`, `Studio`],
        ],
        J,
        `ob-seg`
      )}<button type="button" class="btn btn--primary magnetic" data-act="new">${renderIcon(`plus`)}New order</button></div></header>
    <p class="sr" id="ob-help">Press Enter to open. Arrow Left and Right move the order back or on a stage.</p>
    <div class="ob-note" data-k="b-note" hidden></div>
    <section class="card ob-wrap" aria-label="Order board">
      <div class="ob" data-k="board">
        ${Ct.map(
          (
            e
          ) => `<section class="ob-col" data-lane="${e}" style="--c:var(--${L(e)})" aria-labelledby="lane-${e}">
          <header class="ob-col__head"><span class="ob-col__ico">${renderIcon(ORDER_STATUS_META[e].icon)}</span><span class="ob-col__t"><h2 id="lane-${e}">${ORDER_STATUS_META[e].name}</h2><small>${wt[e]}</small></span><span class="ob-col__fig"><b class="ob-col__n num" data-n="${e}">0</b><small class="num" data-sum="${e}">$0</small></span></header>
          <div class="ob-col__list" data-list="${e}"></div></section>`
        ).join(``)}
        <section class="ob-col ob-col--done" data-lane="delivered" style="--c:var(--sage)" aria-labelledby="lane-delivered">
          <header class="ob-col__head"><span class="ob-col__ico">${renderIcon(`check`)}</span><span class="ob-col__t"><h2 id="lane-delivered">Delivered</h2><small>Today</small></span></header>
          <div class="ob-done"><b class="num" data-n="delivered">0</b><small>delivered today</small><a class="btn btn--ghost btn--xs" href="/orders/all">${renderIcon(`list`)}All orders</a><span class="ob-done__drop">${renderIcon(`check`)}Drop to mark delivered</span></div>
        </section>
      </div>
    </section>`;
  openMoveStockModal(e);
  xt = initSegmentedControl(domQuery(`.ob-seg`, e), (e) => {
    J = e;
    Mt(true);
  });
  e.addEventListener(`click`, (e) => {
    let t = e.target.closest(`[data-act]`);
    if (t) {
      openNewTransferModal(t);
      openNewOrderModal({}, t, (e) => {
        (window as any).navigateTo(`/orders/board/${e.id}`)
      });
    }
  });
  Ft(F(`board`));
}
let Y = null;
let At = null;
let jt = false;
function Mt(e) {
  if (Z) {
    jt = true;
    return;
  }
  let t = F(`board`);
  let n = () =>
    Ct.forEach((e) => {
      let n = Dt(e);
      domQuery(`[data-list="${e}"]`, t).innerHTML =
        n.map(Ot).join(``) ||
        `<p class="ob-empty">${renderIcon(ORDER_STATUS_META[e].icon)}${e === `new` ? `No new orders` : `Nothing ${ORDER_STATUS_META[e].name.toLowerCase()}`}</p>`;
    });
  if (e) {
    bindModalDismiss(t, n);
  } else {
    n();
  }
  [...Ct, `delivered`].forEach((e) => {
    let n = e === `delivered` ? Et().filter((e) => J === `all` || e.channel === J) : Dt(e);
    let n_length = n.length;
    let sum = n.reduce((acc, item) => acc + getOrderTotal(item), 0);
    let a = Tt.get(e);
    let o = queryOne(`[data-n="${e}"]`, t);
    let s = queryOne(`[data-sum="${e}"]`, t);
    getAvailableLocations(o, n_length, formatInt, {
      duration: a ? 0.6 : 1,
      from: a ? undefined : 0,
    });
    getAvailableLocations(s, sum, formatMoneyRound, {
      duration: a ? 0.7 : 1.1,
      from: a ? undefined : 0,
    });
    if (a && a.n !== n_length) {
      getAvailableSuppliers(o);
      getAvailableSuppliers(queryOne(`[data-lane="${e}"] .ob-col__ico`, t));
    }
    Tt.set(e, {
      n: n_length,
      sum,
    });
  });
  let r = Ct.reduce((acc, item) => acc + Dt(item).length, 0);
  let i = F(`b-note`);
  i.hidden = r > 0;
  if (!r) {
    i.innerHTML =
      J === `all`
        ? `${renderIcon(`sparkle`)}<span><b>The floor is clear.</b> Every order is out the door — new ones land in the first lane.</span>`
        : `${renderIcon(`filter`)}<span><b>No ${Ve[J].toLowerCase()} orders in progress.</b> ${J === `studio` ? `Studio sales are handed over at the till, so they skip the board.` : `Switch the channel back to All to see the rest.`}</span><button type="button" class="btn btn--ghost btn--xs" data-k="b-all">Show all</button>`;
  }
  queryOne(`[data-k="b-all"]`, i)?.addEventListener(`click`, () => {
    J = `all`;
    xt?.select(`all`, {
      silent: true,
    });
    Mt(true);
  });
  if (Y) {
    let { id, ghost } = Y;
    Y = null;
    let r = queryOne(`.ob-card[data-id="${id}"]`, t);
    if (r) {
      let e = ghost.getBoundingClientRect();
      let t = r.getBoundingClientRect();
      gsap.fromTo(
        r,
        {
          x: e.left - t.left + (e.width - t.width) / 2,
          y: e.top - t.top + (e.height - t.height) / 2,
          rotation: Number(gsap.getProperty(ghost, `rotation`)) || 0,
          scale: 1.04,
          zIndex: 5,
        },
        {
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          duration: motionDuration(0.55),
          ease: `back.out(1.5)`,
          overwrite: true,
          clearProps: `transform,zIndex`,
        }
      );
    }
    ghost.remove();
  }
  At &&=
    (queryOne(`.ob-card[data-id="${At}"]`, t)?.focus({
      preventScroll: true,
    }),
    null);
}
function Nt() {
  let e = P(`board`);
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
      animateCards(domQueryAll(`.ob-wrap`, e), {
        y: 26,
      }),
      0.12
    )
    .add(
      animateRows(domQueryAll(`.ob-col`, e), {
        y: 18,
        stagger: 0.07,
      }),
      0.22
    )
    .add(
      animateWobble(domQueryAll(`.ob-card`, e), {
        stagger: 0.05,
      }),
      0.4
    );
}
let X = null;
var Z = null;
function Pt(e, t, n) {
  let r = e.getBoundingClientRect();
  if (n < r.top - 60 || n > r.bottom + 60) {
    return null;
  }
  for (let n of domQueryAll(`.ob-col`, e)) {
    let e = n.getBoundingClientRect();
    if (t >= e.left && t <= e.right) {
      return n.dataset.lane ?? null;
    }
  }
  return null;
}
function Ft(e) {
  e.addEventListener(`pointerdown`, (t) => {
    if (t.button !== 0 || Z) {
      return;
    }
    let card = t.target.closest(`.ob-card`);
    if (!(!card || t.target.closest(`a, button`))) {
      X = {
        card,
        pid: t.pointerId,
        x: t.clientX,
        y: t.clientY,
        type: t.pointerType,
      };
      if (t.pointerType === `touch`) {
        card.classList.add(`is-pressing`);
        X.timer = gsap.delayedCall(0.35, () => {
          if (X) {
            Lt(e, X.x, X.y);
          }
        });
      }
    }
  });
  e.addEventListener(
    `touchmove`,
    (e) => {
      if (Z) {
        e.preventDefault();
      }
    },
    {
      passive: false,
    }
  );
  e.addEventListener(`contextmenu`, (e) => {
    if (X || Z) {
      e.preventDefault();
    }
  });
  addEventListener(`pointermove`, (t) => {
    if (Z && t.pointerId === Z.pid) {
      Rt(e, t.clientX, t.clientY);
      return;
    }
    if (!X || t.pointerId !== X.pid) {
      return;
    }
    let n = Math.hypot(t.clientX - X.x, t.clientY - X.y);
    if (X.type === `touch`) {
      if (n > 8) {
        It();
      }
    } else if (n > 5) {
      Lt(e, X.x, X.y);
      Rt(e, t.clientX, t.clientY);
    }
  });
  addEventListener(`pointerup`, (t) => {
    if (Z && t.pointerId === Z.pid) {
      Ut(e);
      return;
    }
    if (X && t.pointerId === X.pid) {
      let e = X.card;
      It();
      if (e.isConnected && t.target.closest?.(`.ob-card`) === e) {
        (window as any).navigateTo(`/orders/board/${e.dataset.id}`)
      }
    }
  });
  addEventListener(`pointercancel`, (e) => {
    if (Z && e.pointerId === Z.pid) {
      Wt();
    }
    if (X && e.pointerId === X.pid) {
      It();
    }
  });
  e.addEventListener(`keydown`, (e) => {
    let t = e.target.closest(`.ob-card`);
    if (!t) {
      return;
    }
    let n = t.dataset.id;
    let r = findOrderById(n);
    if (!r) {
      return;
    }
    if (e.key === `Enter` || e.key === ` `) {
      e.preventDefault();
      (window as any).navigateTo(`/orders/board/${n}`)
      return;
    }
    if (e.key !== `ArrowRight` && e.key !== `ArrowLeft`) {
      return;
    }
    e.preventDefault();
    let i = KANBAN_STAGES[KANBAN_STAGES.indexOf(r.status) + (e.key === `ArrowRight` ? 1 : -1)];
    if (!i) {
      Gt(t);
      return;
    }
    At = n;
    let a = advanceOrderStatus(n, i);
    if (a) {
      At = null;
      Gt(t);
      showToast(a, {
        ico: `alert`,
      });
    }
  });
}
function It() {
  X &&= (X.timer?.kill(), X.card.classList.remove(`is-pressing`), null);
}
function Lt(e, t, n) {
  if (!X || Z) {
    return;
  }
  let X_card = X.card;
  X.timer?.kill();
  X_card.classList.remove(`is-pressing`);
  let i = findOrderById(X_card.dataset.id ?? ``);
  if (!i) {
    X = null;
    return;
  }
  let a = X_card.getBoundingClientRect();
  let ghost = X_card.cloneNode(true);
  ghost.classList.add(`is-ghost`);
  [`tabindex`, `data-key`, `aria-describedby`, `aria-label`, `aria-roledescription`].forEach((e) =>
    ghost.removeAttribute(e)
  );
  ghost.setAttribute(`aria-hidden`, `true`);
  Object.assign(ghost.style, {
    left: `${a.left}px`,
    top: `${a.top}px`,
    width: `${a.width}px`,
    height: `${a.height}px`,
    transformOrigin: `${t - a.left}px ${n - a.top}px`,
  });
  document.body.append(ghost);
  X_card.classList.add(`is-lifted`);
  e.classList.add(`is-dragging`);
  domQueryAll(`.ob-col`, e).forEach((e) =>
    e.classList.toggle(`is-target`, e.dataset.lane !== i.status)
  );
  Z = {
    id: i.id,
    card: X_card,
    ghost,
    from: i.status,
    sx: t,
    sy: n,
    px: t,
    py: n,
    lastX: t,
    over: null,
    pid: X.pid,
    qx: gsap.quickTo(ghost, `x`, {
      duration: bindMagnetic() ? 0 : 0.14,
      ease: `power3.out`,
    }),
    qy: gsap.quickTo(ghost, `y`, {
      duration: bindMagnetic() ? 0 : 0.14,
      ease: `power3.out`,
    }),
    qr: gsap.quickTo(ghost, `rotation`, {
      duration: bindMagnetic() ? 0 : 0.35,
      ease: `power2.out`,
    }),
  };
  X = null;
  gsap.fromTo(
    ghost,
    {
      scale: 1,
    },
    {
      scale: 1.05,
      duration: motionDuration(0.28),
      ease: `back.out(2.2)`,
    }
  );
  Z.qr(2.5);
  if (navigator.vibrate && matchMedia(`(pointer: coarse)`).matches) {
    try {
      navigator.vibrate(12);
    } catch {}
  }
  gsap.ticker.add(Bt);
}
function Rt(e, clientX, clientY) {
  if (!Z) {
    return;
  }
  Z.px = clientX;
  Z.py = clientY;
  Z.qx(clientX - Z.sx);
  Z.qy(clientY - Z.sy);
  let r = clientX - Z.lastX;
  Z.lastX = clientX;
  Z.qr(gsap.utils.clamp(-9, 9, 2.5 + r * 0.7));
  zt(e);
}
function zt(e) {
  if (!Z) {
    return;
  }
  let t = Pt(e, Z.px, Z.py);
  if (t === Z.over) {
    return;
  }
  Z.over = t;
  domQueryAll(`.ob-col`, e).forEach((e) =>
    e.classList.toggle(`is-over`, e.dataset.lane === t && t !== Z.from)
  );
  let n = t && t !== Z.from ? queryOne(`[data-lane="${t}"] .ob-col__ico`, e) : null;
  if (n && !bindMagnetic()) {
    gsap.fromTo(
      n,
      {
        scale: 0.8,
      },
      {
        scale: 1,
        duration: 0.45,
        ease: `back.out(3)`,
        overwrite: true,
        clearProps: `transform`,
      }
    );
  }
}
function Bt() {
  if (!Z) {
    return;
  }
  let e = queryOne(`[data-k="board"]`, N);
  if (!e) {
    return;
  }
  let t = e.getBoundingClientRect();
  let n = false;
  if (e.scrollWidth > e.clientWidth) {
    if (Z.px < t.left + 48) {
      e.scrollLeft -= 12;
      n = true;
    } else if (Z.px > t.right - 48) {
      e.scrollLeft += 12;
      n = true;
    }
  }
  let r = matchMedia(`(max-width: 760px)`).matches ? 100 : 0;
  if (Z.py < 90) {
    scrollBy(0, -10);
    n = true;
  } else if (Z.py > innerHeight - r - 50) {
    scrollBy(0, 10);
    n = true;
  }
  if (n) {
    Z.over = `__`;
    zt(e);
  }
}
function Vt(e) {
  gsap.ticker.remove(Bt);
  e.classList.remove(`is-dragging`);
  domQueryAll(`.ob-col`, e).forEach((e) => e.classList.remove(`is-target`, `is-over`));
}
function Ht(e, t = false) {
  let n = e.card.getBoundingClientRect();
  let style = e.ghost.style;
  let x = n.left - parseFloat(style.left);
  let y = n.top - parseFloat(style.top);
  if (t) {
    let t = e.over ? queryOne(`[data-lane="${e.over}"]`, N) : null;
    if (t) {
      t.classList.add(`is-reject`);
      gsap.delayedCall(0.6, () => t.classList.remove(`is-reject`));
    }
  }
  gsap.to(e.ghost, {
    x,
    y,
    rotation: 0,
    scale: 1,
    duration: motionDuration(t ? 0.75 : 0.5),
    ease: t ? `elastic.out(1, 0.55)` : `back.out(1.4)`,
    overwrite: true,
    onComplete: () => {
      e.ghost.remove();
      e.card.classList.remove(`is-lifted`);
      if (jt) {
        jt = false;
        Mt(true);
      }
    },
  });
}
function Ut(e) {
  let t = Z;
  if (!t) {
    return;
  }
  Z = null;
  Vt(e);
  let t_over = t.over;
  if (!t_over || t_over === t.from || !findOrderById(t.id)) {
    Ht(t);
    return;
  }
  Y = {
    id: t.id,
    ghost: t.ghost,
  };
  jt = false;
  let r = advanceOrderStatus(t.id, t_over);
  if (r) {
    Y = null;
    Ht(t, true);
    showToast(r, {
      ico: `alert`,
    });
    return;
  }
  if (Y) {
    Y = null;
    Ht(t);
  }
}
function Wt() {
  let e = Z;
  if (!e) {
    return;
  }
  Z = null;
  let t = queryOne(`[data-k="board"]`, N);
  if (t) {
    Vt(t);
  }
  Ht(e);
}
function Gt(e) {
  if (!bindMagnetic()) {
    gsap.fromTo(
      e,
      {
        x: -7,
      },
      {
        x: 0,
        duration: 0.55,
        ease: `elastic.out(1, 0.3)`,
        clearProps: `transform`,
      }
    );
  }
}
let Q = `all`;
let Kt = ``;
const qt = [`all`, `requested`, `received`, `restocked`, `refunded`, `rejected`];
const Jt = (e) => {
  if (RETURN_STATUS_TONES[e] === `faint`) {
    return `slate`;
  }
  return RETURN_STATUS_TONES[e];
};
function Yt() {
  let e = Date.now() - 90 * ONE_DAY_MS;
  let t = store.returns.filter((t) => t.createdAt >= e && t.status !== `rejected`);
  let length = store.orders.filter(
    (t) => t.createdAt >= e && (t.status === `shipped` || t.status === `delivered`)
  ).length;
  return {
    rate: length ? new Set(t.map((e) => e.orderId)).size / length : 0,
    n: t.length,
    sent: length,
  };
}
function Xt() {
  let e = store.returns.filter((e) => e.status === `requested` || e.status === `received`);
  let t = Date.now() - 30 * ONE_DAY_MS;
  let n = store.returns.filter((e) => e.status === `refunded` && e.createdAt >= t);
  let i = store.returns.filter((e) => e.status === `restocked` && e.createdAt >= t);
  let a = Yt();
  return [
    {
      key: `open`,
      icon: `return`,
      ico: `sky`,
      label: `Open returns`,
      value: e.length,
      badge: `${e.filter((e) => e.status === `requested`).length} to receive`,
      tone: `plain`,
    },
    {
      key: `refund`,
      icon: `dollar`,
      ico: `teal`,
      label: `Refunded · 30 days`,
      value: n.reduce((acc, item) => acc + item.refund, 0),
      fmt: `money2`,
    },
    {
      key: `restock`,
      icon: `box`,
      ico: `sage`,
      label: `Units restocked · 30 days`,
      value: i.reduce((acc, item) => acc + item.qty, 0),
    },
    {
      key: `rate`,
      icon: `trendDown`,
      ico: `ochre`,
      label: `Return rate · 90 days`,
      value: a.rate,
      fmt: `pct1`,
      badge: a.rate <= 0.03 ? `Under target` : `Over 3% target`,
      tone: a.rate <= 0.03 ? `good` : `warn`,
    },
  ];
}
function Zt(e, t = `btn--xs`) {
  let n = (n, r, i, a) =>
    `<button type="button" class="btn ${a} ${t}" data-ret="${e.id}:${n}">${renderIcon(i)}${r}</button>`;
  if (e.status === `requested`) {
    return (
      n(`received`, `Mark received`, `inbox`, `btn--soft`) +
      n(`rejected`, `Reject`, `close`, `btn--ghost`)
    );
  }
  if (e.status === `received`) {
    return (
      n(`restocked`, `Restock`, `box`, `btn--soft`) +
      n(`refunded`, `Refund ${formatMoneyRound(e.refund)}`, `dollar`, `btn--primary`)
    );
  }
  return ``;
}
function Qt(e, n) {
  let r = findProductById(e.productId);
  let i = findOrderById(e.orderId);
  let a = i ? findCustomerById(i.customerId) : undefined;
  let s = Zt(e);
  return `<div class="rt-row" data-key="${e.id}">
    ${r ? renderProductThumb(r, `md`) : ``}
    <span class="rt-main"><a class="rt-name" href="/orders/returns/${e.id}">${highlightSearchMatch(r ? formatProductFullName(r) : `Product`, n)}</a>
      <small><span class="mono">${highlightSearchMatch(e.number, n)}</span> · ${i ? `<a class="ref rt-ord" href="/orders/all/${i.id}">${highlightSearchMatch(i.number, n)}</a>` : ``} · ${highlightSearchMatch(a?.name ?? ``, n)}</small>
      <span class="rt-reason">${renderIcon(`info`)}${highlightSearchMatch(e.reason, n)}</span></span>
    <span class="rt-amt"><small>Refund · ${formatInt(e.qty)} ${e.qty === 1 ? `unit` : `units`}</small><b>${formatMoney(e.refund)}</b></span>
    <span class="rt-st">${renderPill(RETURN_STATUS_NAMES[e.status], RETURN_STATUS_TONES[e.status])}<small>${escapeHtml(formatRelativeTime(e.createdAt))}</small></span>
    <span class="rt-acts">${s || `<span class="rt-done">${renderIcon(e.status === `rejected` ? `close` : `check`)}${e.status === `rejected` ? `Closed` : `Done`}</span>`}</span>
  </div>`;
}
function $t() {
  let e = P(`returns`);
  e.innerHTML = `${renderPageHeader({
    eyebrow: `Back from customers — check it, then restock or refund`,
    title: `Returns`,
    stats: Xt(),
  })}
    <div class="rt-grid">
      <section class="card rt-card" aria-label="Returns">
        <div class="toolbar"><div class="chips" data-k="r-st" role="group" aria-label="Status"></div><span class="toolbar__spacer"></span>
          <label class="search rt-search">${renderIcon(`search`)}<input type="search" placeholder="RMA, order, product or reason…" aria-label="Search returns" data-k="r-q" /></label></div>
        <div class="rt-list" data-k="r-list"></div>
      </section>
      <aside class="card rt-side" aria-labelledby="rr-t">
        <header class="card__head"><div><h2 class="card__title" id="rr-t">Return rate</h2><p class="card__sub">Orders sent back against orders shipped, last 90 days</p></div></header>
        <div class="rt-rate"><b class="num" data-k="r-rate">0%</b><span data-k="r-rate-sub"></span></div>
        <span class="meter rt-rate__meter"><span class="meter__fill" data-k="r-rate-fill" style="--c:var(--ochre)"></span><i class="rt-rate__mark" title="3% target" style="--at:.6"></i></span>
        <p class="rt-rate__legend"><span>0%</span><span>Target 3%</span><span>5%</span></p>
        <h3 class="rt-h3">Why things come back</h3>
        <div class="rt-reasons" data-k="r-reasons"></div>
      </aside>
    </div>`;
  F(`r-st`).addEventListener(`click`, (e) => {
    let t = e.target.closest(`[data-rs]`);
    if (t) {
      openNewTransferModal(t);
      Q = t.dataset.rs;
      $(true);
    }
  });
  F(`r-q`).addEventListener(`input`, (e) => {
    Kt = e.target.value;
    $(true);
  });
  e.addEventListener(`click`, (t) => {
    let t_target = t.target;
    let r = t_target.closest(`[data-ret]`);
    if (r) {
      openNewTransferModal(r);
      let [e, t] = r.dataset.ret.split(`:`);
      updateReturnStatus(e, t);
      return;
    }
    if (t_target.closest(`[data-act="rclear"]`)) {
      Q = `all`;
      Kt = ``;
      domQuery(`[data-k="r-q"]`, e).value = ``;
      $(true);
    }
  });
}
function $(e) {
  let t = Kt.trim();
  let n = t.toLowerCase();
  let i = store.returns.filter((e) => {
    if (!n) {
      return true;
    }
    let t = findProductById(e.productId);
    let r = findOrderById(e.orderId);
    return `${e.number} ${r?.number ?? ``} ${t ? formatProductFullName(t) : ``} ${e.reason} ${r ? Ue(r) : ``}`
      .toLowerCase()
      .includes(n);
  });
  let a = F(`r-st`);
  let s = (e) => {
    if (e === `all`) {
      return i.length;
    }
    return i.filter((t) => t.status === e).length;
  };
  if (a.children.length) {
    qt.forEach((e) => {
      let t = domQuery(`[data-rs="${e}"]`, a);
      t.setAttribute(`aria-pressed`, String(e === Q));
      let n = domQuery(`b`, t);
      if (n.textContent !== String(s(e))) {
        n.textContent = String(s(e));
        getAvailableSuppliers(n);
      }
    });
  } else {
    a.innerHTML = qt
      .map(
        (e) =>
          `<button type="button" class="chip" data-rs="${e}" aria-pressed="${e === Q}">${e === `all` ? `` : `<i class="dot" style="--c:var(--${Jt(e)})"></i>`}${e === `all` ? `All` : RETURN_STATUS_NAMES[e]} <b>${s(e)}</b></button>`
      )
      .join(``);
  }
  let c = {
    requested: 0,
    received: 1,
    restocked: 2,
    refunded: 2,
    rejected: 3,
  };
  let l = i
    .filter((e) => Q === `all` || e.status === Q)
    .sort((e, t) => c[e.status] - c[t.status] || t.createdAt - e.createdAt);
  let u = F(`r-list`);
  let d = l.length
    ? l.map((e) => Qt(e, t)).join(``)
    : store.returns.length
      ? renderEmptyState(
          `No returns match`,
          `Nothing ${Q === `all` ? `` : `${RETURN_STATUS_NAMES[Q].toLowerCase()} `}for that search.`,
          `search`,
          `<button type="button" class="btn btn--ghost btn--sm" data-act="rclear">${renderIcon(`refresh`)}Clear filters</button>`
        )
      : renderEmptyState(
          `No returns`,
          `When a customer sends something back, its RMA shows up here.`,
          `return`
        );
  if (e) {
    bindModalDismiss(u, () => {
      u.innerHTML = d;
    });
  } else {
    u.innerHTML = d;
  }
  tn(e);
}
let en = -1;
function tn(e) {
  let n = Yt();
  let i = F(`r-rate`);
  getAvailableLocations(i, n.rate, (e) => formatPercent(e, 1), {
    duration: e ? 0.8 : 1.3,
    from: e && en >= 0 ? undefined : 0,
    delay: e ? 0 : 0.35,
  });
  if (e && en >= 0 && en !== n.rate) {
    getAvailableSuppliers(i);
  }
  en = n.rate;
  F(`r-rate-sub`).innerHTML = `${pluralize(n.n, `return`)} · ${pluralize(n.sent, `order`)} shipped`;
  gsap.to(F(`r-rate-fill`), {
    scaleX: Math.max(0.02, Math.min(1, n.rate / 0.05)),
    duration: motionDuration(e ? 0.7 : 1.1),
    delay: motionDuration(e ? 0 : 0.4),
    ease: `power3.inOut`,
  });
  let a = new Map();
  store.returns.forEach((e) => a.set(e.reason, (a.get(e.reason) ?? 0) + 1));
  let o = [...a.entries()].sort((e, t) => t[1] - e[1]);
  let s = Math.max(1, ...o.map((e) => e[1]));
  let c = F(`r-reasons`);
  c.innerHTML = o.length
    ? o
        .map(
          ([e, n], r) =>
            `<div class="rt-why"><span>${escapeHtml(e)}</span><b class="num">${formatInt(n)}</b><span class="meter"><span class="meter__fill" style="--c:var(--${[`rose`, `ochre`, `ocean`, `sky`, `teal`, `slate`][r % 6]})" data-w="${Math.max(0.03, n / s)}"></span></span></div>`
        )
        .join(``)
    : `<p class="rt-none">No returns logged yet.</p>`;
  gsap.fromTo(
    domQueryAll(`.rt-why .meter__fill`, c),
    {
      scaleX: 0,
    },
    {
      scaleX: (e, t) => Number(t.dataset.w),
      duration: motionDuration(0.9),
      stagger: motionDuration(0.06),
      delay: motionDuration(e ? 0 : 0.45),
      ease: `power3.inOut`,
    }
  );
}
function nn() {
  let e = P(`returns`);
  gsap
    .timeline()
    .add(animatePageTransition(e), 0)
    .add(
      animateCards(domQueryAll(`.rt-card, .rt-side`, e), {
        y: 26,
        stagger: 0.1,
      }),
      0.15
    )
    .add(
      animateRows(domQueryAll(`.rt-card .chip, .rt-search`, e), {
        y: 8,
        stagger: 0.03,
      }),
      0.3
    )
    .add(
      animateRows(domQueryAll(`.rt-row`, e), {
        y: 12,
        stagger: 0.05,
      }),
      0.38
    );
}
function rn(e) {
  let n = findProductById(e.productId);
  let r = findOrderById(e.orderId);
  let i = r ? findCustomerById(r.customerId) : undefined;
  let a = [
    `requested`,
    `received`,
    e.status === `restocked` || e.status === `refunded` ? e.status : `refunded`,
  ];
  let s = e.status === `rejected` ? 0 : a.indexOf(e.status);
  return `<header class="d-head">${n ? renderProductThumb(n, `lg`) : ``}<div><h2>${escapeHtml(e.number)}</h2><small>${n ? escapeHtml(formatProductFullName(n)) : ``}</small></div></header>
    <div class="d-pills" data-ds="pills">${renderPill(RETURN_STATUS_NAMES[e.status], RETURN_STATUS_TONES[e.status])}${renderPill(e.reason, `slate`, `info`)}</div>
    <div class="rd-path${e.status === `rejected` ? ` is-rejected` : ``}" data-ds="path">${a.map((e, t) => `<span class="rd-path__step${t < s || (t === s && t === 2) ? ` is-done` : t === s ? ` is-cur` : ``}"><i>${renderIcon(t < s || (t === s && t === 2) ? `check` : e === `requested` ? `return` : e === `received` ? `inbox` : e === `restocked` ? `box` : `dollar`)}</i>${t === 2 && s < 2 ? `Restock or refund` : RETURN_STATUS_NAMES[e]}</span>`).join(`<span class="rd-path__bar" aria-hidden="true"></span>`)}</div>
    ${e.status === `rejected` ? `<p class="note">${renderIcon(`info`)}<span>Rejected — the customer was told why and nothing went back on the shelf.</span></p>` : ``}
    <div class="d-facts">
      <div><small>Quantity</small><b>${formatInt(e.qty)}</b><span>${r?.channel === `wholesale` ? `One inner carton` : `Single unit`}</span></div>
      <div><small>Refund</small><b>${formatMoney(e.refund)}</b><span>${e.status === `refunded` ? `Paid back` : `At the price paid`}</span></div>
      <div><small>Order</small><b>${r ? `<a class="rd-link mono" href="/orders/all/${r.id}">${escapeHtml(r.number)}</a>` : `—`}</b><span>${r ? escapeHtml(formatDate(r.createdAt, true)) : ``}</span></div>
      <div><small>Requested</small><b>${escapeHtml(formatRelativeTime(e.createdAt))}</b><span>${escapeHtml(renderNotificationItem(e.createdAt))}</span></div>
    </div>
    ${i ? `<section class="d-sec"><h3>Customer</h3><a class="row od-cust" href="${We(i)}">${renderAvatar(i.id, `md`)}<span class="row__txt"><b>${escapeHtml(i.name)}</b><small>${escapeHtml(i.email)}</small></span>${renderIcon(`chevR`, `row__go`)}</a></section>` : ``}
    ${n ? `<section class="d-sec"><h3>Product</h3><a class="row od-cust" href="/products/item/${n.id}">${renderProductThumb(n, `md`)}<span class="row__txt"><b>${escapeHtml(n.name)}</b><small>${escapeHtml(n.size)} · <span class="mono">${escapeHtml(n.sku)}</span> · ${formatInt(n.stock.dc ?? 0)} at the DC</small></span>${renderIcon(`chevR`, `row__go`)}</a></section>` : ``}
    <footer class="d-actions" data-ds="acts">${Zt(e, `btn--sm`) || `<p class="od-closed">${renderIcon(`check`)}Nothing left to do on this return.</p>`}</footer>`;
}
function an(e) {
  let t = store.returns.find((t) => t.id === e);
  if (!t) {
    showToast(`That return isn’t on file`, {
      ico: `alert`,
    });
    history.replaceState(null, ``, `/orders/returns`);
    return;
  }
  if (!Ze(`return`, e)) {
    Xe(() => {
      let { el } = openDrawer(rn(t), {
        label: `Return ${t.number}`,
        onClose: () => {
          if (B?.kind === `return` && B.id === e) {
            B = null;
          }
          if (location.pathname.startsWith(`/orders/returns/${e}`)) {
            history.replaceState(null, ``, `/orders/returns`);
          }
        },
      });
      B = {
        kind: `return`,
        id: e,
        el,
        status: t.status,
      };
      el.addEventListener(`click`, (e) => {
        let t = e.target.closest(`[data-ret]`);
        if (!t) {
          return;
        }
        openNewTransferModal(t);
        let [n, r] = t.dataset.ret.split(`:`);
        updateReturnStatus(n, r);
      });
    });
  }
}
function on() {
  if (!B || B.kind !== `return` || !z().open) {
    return;
  }
  let e = store.returns.find((e) => e.id === B.id);
  if (!e || e.status === B.status) {
    return;
  }
  let t = B.el;
  let n = rn(e);
  let i = document.createElement(`div`);
  i.innerHTML = n;
  [`pills`, `path`, `acts`].forEach((e) => {
    let n = queryOne(`[data-ds="${e}"]`, t);
    let r = queryOne(`[data-ds="${e}"]`, i);
    if (n && r) {
      n.innerHTML = r.innerHTML;
    }
  });
  animatePop(domQueryAll(`.rd-path__step.is-done i, .rd-path__step.is-cur i`, t), {
    from: 0.5,
    stagger: 0.06,
  });
  B.status = e.status;
}
function sn(e) {
  Re = e;
  domQueryAll(`[data-sub]`, N).forEach((t) => {
    t.hidden = t.dataset.sub !== e;
  });
  if (!ze.has(e)) {
    ze.add(e);
    if (e === `all`) {
      vt();
    } else if (e === `board`) {
      kt();
    } else {
      $t();
    }
  }
  if (e === `all`) {
    gt();
    q(false);
    St();
  } else if (e === `board`) {
    Tt.clear();
    Mt(false);
    Nt();
    initLiftAnimations(P(`board`));
  } else {
    $(false);
    nn();
  }
}
function cn(e, t) {
  if (t) {
    if (e === `returns`) {
      an(t);
    } else {
      st(t);
    }
    return;
  }
  if (B && z().open) {
    closeDrawer();
  }
}
export const page = {
  title: (e) =>
    ({
      board: `Order board`,
      returns: `Returns`,
    })[e[0] ?? ``] ?? (e[1] ? `Order ${findOrderById(e[1])?.number ?? ``}` : `All orders`),
  mount(e) {
    N = e;
    N.innerHTML = Le.map((e) => `<div data-sub="${e}" hidden></div>`).join(``);
    findLocationById(`orders`, () => {
      if (I(`all`)) {
        gt();
        q(true);
      } else if (I(`board`)) {
        Mt(true);
      } else if (I(`returns`)) {
        $(true);
      }
      ut();
    });
    findLocationById(`returns`, () => {
      if (I(`returns`)) {
        $(true);
        Xt().forEach((e) => Ye(P(`returns`), e.key, e.value, e.badge, e.tone));
      }
      on();
    });
    findLocationById(`customers`, () => {
      if (I(`all`)) {
        q(true);
      }
    });
  },
  enter({ params, same }) {
    let n = Le.includes(params[0]) ? params[0] : `all`;
    if (!(same && n === Re && ze.has(n))) {
      sn(n);
    }
    cn(n, params[1]);
  },
  leave() {
    It();
    Wt();
    if (B && z().open) {
      closeDrawer();
    }
  },
};
