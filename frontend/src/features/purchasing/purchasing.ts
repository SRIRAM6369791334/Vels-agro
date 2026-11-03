import {
  escapeHtml,
  notifyStoreSubscribers,
  findPoById,
  store,
  showToast,
  closeDrawer,
  ONE_DAY_MS,
  renderEmptyState,
  findSupplierById,
  PO_STATUS_NAMES,
  queryOne,
  animatePageTransition,
  domQuery,
  formatProductFullName,
  motionDuration,
  getDraftPoSupplierIds,
  findCustomerByEmail,
  renderTag,
  startOfToday,
  TRANSFER_STATUS_NAMES,
  formatNumber,
  openDrawer,
  formatDate,
  getAvailableLocations,
  bindModalDismiss,
  getAvailableSuppliers,
  formatDateWithDay,
  openNewPoModal,
  formatRelativeTime,
  openMoveStockModal,
  formatInt,
  findLocationById,
  formatMoney,
  openNewTransferModal,
  animateRows,
  formatPercent,
  renderFilterBar,
  getCustomerOrdersCount,
  animateCards,
  renderRating,
  getPoTotalCost,
  formatMoneyRound,
  findMaterialById,
  pluralize,
  animateMagneticElement,
  renderIconButton,
  receivePo,
  animatePop,
  highlightSearchMatch,
  isMaterialLowStock,
  gsap,
  renderPill,
  domQueryAll,
  initLiftAnimations,
  renderIcon,
  createCustomElement,
  renderPageHeader,
  renderSegmentedControl,
  cancelPo,
  renderProductThumb,
  sendPo,
  initSegmentedControl,
} from "../../main.ts";
const Ae = [`orders`, `suppliers`, `materials`];
let M;
let N = `orders`;
const je = new Set();
const P = (e) => domQuery(`[data-sub="${e}"]`, M);
const F = (e) => domQuery(`[data-k="${e}"]`, M);
const I = (e) => !!M && !M.hidden && N === e;
const L = (t, n = `md`) => {
  if (t) {
    return `<span class="pu-mono pu-mono--${n}" style="--c:var(--${t.tone})" aria-hidden="true">${escapeHtml(renderRating(t.name))}</span>`;
  }
  return ``;
};
const Me = (e, qty) => {
  if (e) {
    return e.unit === `pcs` ? `${formatInt(qty)} ×` : `${formatNumber(qty, 2)} ${e.unit}`;
  }
  return formatInt(qty);
};
function Ne(eta) {
  let t = Math.round((new Date(eta).setHours(0, 0, 0, 0) - startOfToday()) / ONE_DAY_MS);
  if (t === 0) {
    return `today`;
  }
  if (t === 1) {
    return `tomorrow`;
  }
  if (t > 1) {
    return `in ${t} days`;
  }
  return `${pluralize(-t, `day`)} late`;
}
function Pe(e, t) {
  return queryOne(`[data-stat="${t}"] [data-count]`, e);
}
function R(e, t, n) {
  let r = Pe(e, t);
  if (r && Number(r.dataset.count) !== n) {
    renderFilterBar(r, n);
    getAvailableSuppliers(r);
  }
}
function Fe(e, t = 0.35) {
  e.forEach((e, n) => {
    let scaleX = Number(/scaleX\(([\d.]+)\)/.exec(e.style.transform)?.[1] ?? 1);
    gsap.fromTo(
      e,
      {
        scaleX: 0,
      },
      {
        scaleX,
        duration: motionDuration(1),
        delay: motionDuration(t + Math.min(n, 14) * 0.04),
        ease: `power3.inOut`,
      }
    );
  });
}
const z = (t, n, r, i, a, o = ``) =>
  `<button type="button" class="chip" ${n}="${t}" aria-pressed="${i}">${o ? renderIcon(o) : ``}${escapeHtml(r)}${a === undefined ? `` : ` <b data-n="${t}">${a}</b>`}</button>`;
let B = null;
function Ie(kind, t) {
  if (kind === `orders`) {
    return ct(t);
  }
  if (kind === `suppliers`) {
    return xt(t);
  }
  return jt(t);
}
function Le(kind, id) {
  let n = Ie(kind, id);
  if (!n) {
    showToast(
      kind === `orders`
        ? `That purchase order isn’t here any more`
        : kind === `suppliers`
          ? `That supplier isn’t on file`
          : `That material isn’t on file`,
      {
        ico: `info`,
      }
    );
    history.replaceState(null, ``, `/purchasing/${kind}`);
    return;
  }
  if (!(B && B.kind === kind && B.id === id && queryOne(`#drawer`)?.hasAttribute(`open`))) {
    B = {
      kind,
      id,
    };
    openDrawer(n, {
      label: kind === `orders` ? `Purchase order` : kind === `suppliers` ? `Supplier` : `Material`,
      wide: kind === `orders`,
      onMount: (e) => {
        e.addEventListener(`click`, Be);
      },
      onClose: () => {
        B = null;
        if (location.pathname.startsWith(`/purchasing/${kind}/`)) {
          history.replaceState(null, ``, `/purchasing/${kind}`);
        }
      },
    });
    ze();
  }
}
function Re() {
  if (!B) {
    return;
  }
  let e = queryOne(`#drawer .drawer__inner`);
  if (!e) {
    return;
  }
  let t = Ie(B.kind, B.id);
  if (!t) {
    closeDrawer();
    return;
  }
  [...e.children].forEach((e) => {
    if (!e.classList.contains(`drawer__close`)) {
      e.remove();
    }
  });
  e.insertAdjacentHTML(`beforeend`, t);
}
function ze() {
  let e = queryOne(`#drawer .drawer__inner`);
  if (e) {
    Fe(domQueryAll(`.meter__fill`, e), 0.3);
    domQueryAll(`.pu-ring__a`, e).forEach((e) => mt(e, 0.3));
  }
}
function Be(e) {
  let t = e.target.closest(`[data-act]`);
  if (t) {
    openNewTransferModal(t);
    Ve(t.dataset.act, t.dataset.id ?? ``, t);
    Re();
  }
}
function Ve(act, materialId, n) {
  if (act === `send`) {
    cancelPo(materialId);
  } else if (act === `recv` || act === `half`) {
    He(materialId, act === `half`, n);
  } else if (act === `cancel`) {
    receivePo(materialId);
  } else if (act === `newpo`) {
    openNewPoModal(
      {
        supplierId: materialId || undefined,
      },
      n
    );
  } else if (act === `order`) {
    openNewPoModal(
      {
        materialId,
      },
      n
    );
  } else if (act === `reorder`) {
    Ue();
  } else if (act === `fav`) {
    We(materialId, n);
  }
}
function He(materialId, t, r) {
  let i = findPoById(materialId);
  if (!i) {
    return;
  }
  let a = H(i);
  sendPo(materialId, t);
  let o = H(i) - a;
  if (!o) {
    return;
  }
  let s = !!r.closest(`#drawer`);
  let c = s ? null : queryOne(`[data-po="${materialId}"]`, M);
  let l = s ? queryOne(`#drawer [data-recv-d]`) : c ? queryOne(`[data-recv]`, c) : null;
  animateMagneticElement(l, `+${formatInt(o)} received`);
  if (s) {
    getAvailableSuppliers(l);
  }
}
function Ue() {
  if (
    store.materials.filter((e) => isMaterialLowStock(e) && findCustomerByEmail(e.id) === 0)
      .length &&
    N === `orders` &&
    W !== `all` &&
    W !== `draft`
  ) {
    W = `all`;
    K = true;
    domQueryAll(`[data-pof]`, P(`orders`)).forEach((e) =>
      e.setAttribute(`aria-pressed`, String(e.getAttribute(`data-pof`) === `all`))
    );
  }
  let e = getDraftPoSupplierIds();
  showToast(
    e.length
      ? `Drafted ${pluralize(e.length, `purchase order`)} from low stock — check and send`
      : `Everything low is already on order`,
    {
      ico: e.length ? `receipt` : `check`,
    }
  );
  if (e.length && N !== `orders`) {
    setTimeout(() => {
      (window as any).navigateTo(`/purchasing/orders`)
    }, 350);
  }
}
function We(materialId, n) {
  let r = findSupplierById(materialId);
  if (r) {
    r.favorite = !r.favorite;
    notifyStoreSubscribers(`suppliers`);
    animatePop(
      (queryOne(`[data-act="fav"][data-id="${materialId}"]`, M) ?? n).querySelector(`svg`),
      {
        from: 0.3,
      }
    );
    showToast(r.favorite ? `${r.name} added to favourites` : `${r.name} removed from favourites`, {
      ico: `star`,
    });
  }
}
const V = [`sent`, `partial`];
const Ge = (e) => e.lines.reduce((acc, line) => acc + line.qty, 0);
var H = (e) => e.lines.reduce((acc, line) => acc + line.received, 0);
const U = (e) => V.includes(e.status) && e.eta < startOfToday();
const Ke = {
  draft: 0,
  sent: 1,
  partial: 2,
  received: 3,
  cancelled: -1,
};
const qe = [`Draft`, `Sent`, `Part in`, `Received`];
const Je = (e) => {
  if (e.status === `draft`) {
    return 0;
  }
  if (V.includes(e.status)) {
    return 1;
  }
  if (e.status === `received`) {
    return 2;
  }
  return 3;
};
function Ye(e) {
  return [...e].sort(
    (e, t) =>
      Je(e) - Je(t) ||
      (e.status === `draft`
        ? t.createdAt - e.createdAt
        : V.includes(e.status)
          ? e.eta - t.eta
          : (t.receivedAt ?? t.createdAt) - (e.receivedAt ?? e.createdAt))
  );
}
var W = `all`;
let G = ``;
const Xe = new Map();
function Ze() {
  let e = startOfToday();
  let t = e + 7 * ONE_DAY_MS;
  let n = store.pos.filter((e) => e.status === `draft` || V.includes(e.status));
  return {
    openValue: n.reduce((acc, item) => acc + getPoTotalCost(item), 0),
    openN: n.length,
    dueWeek: store.pos.filter((n) => V.includes(n.status) && n.eta >= e && n.eta < t).length,
    late: store.pos.filter(U).length,
    onTime:
      store.suppliers.reduce((acc, supplier) => acc + supplier.onTime, 0) /
      Math.max(1, store.suppliers.length),
  };
}
function Qe() {
  let e = Ze();
  let stats = [
    {
      key: `open`,
      icon: `receipt`,
      label: `Open PO value`,
      value: e.openValue,
      fmt: `money`,
      ico: `pine`,
    },
    {
      key: `week`,
      icon: `calendar`,
      label: `Due this week`,
      value: e.dueWeek,
      suffix: `POs`,
      ico: `sky`,
    },
    {
      key: `late`,
      icon: `clock`,
      label: `Late`,
      value: e.late,
      suffix: `POs`,
      ico: `rose`,
    },
    {
      key: `ontime`,
      icon: `truck`,
      label: `Avg supplier on-time`,
      value: e.onTime,
      fmt: `pct`,
      ico: `sage`,
    },
  ];
  let n = [
    [`all`, `All`],
    [`draft`, PO_STATUS_NAMES.draft],
    [`sent`, PO_STATUS_NAMES.sent],
    [`partial`, PO_STATUS_NAMES.partial],
    [`received`, PO_STATUS_NAMES.received],
    [`cancelled`, PO_STATUS_NAMES.cancelled],
  ];
  return `${renderPageHeader({
    eyebrow: `Ingredients and packaging on their way to the lab`,
    title: `Purchase orders`,
    actions: `<button type="button" class="btn btn--ghost" data-act="reorder">${renderIcon(`refresh`)}Reorder low materials</button><button type="button" class="btn btn--primary magnetic" data-act="newpo">${renderIcon(`plus`)}New PO</button>`,
    stats,
  })}
  <div class="toolbar pu-toolbar">
    <div class="chips" data-k="po-chips" role="group" aria-label="Filter by status">${n.map(([e, t]) => z(e, `data-pof`, t, e === W, 0)).join(``)}</div>
    <span class="toolbar__spacer"></span>
    <label class="search pu-search">${renderIcon(`search`)}<input type="search" placeholder="PO, supplier or material…" aria-label="Search purchase orders" data-k="po-q" /></label>
  </div>
  <div class="pu-pos" data-k="po-list"></div>`;
}
function $e(t) {
  let n = Ke[t.status];
  let r = U(t)
    ? `rose`
    : TRANSFER_STATUS_NAMES[t.status] === `faint`
      ? `slate`
      : TRANSFER_STATUS_NAMES[t.status];
  return `<ol class="pu-steps${t.status === `cancelled` ? ` is-off` : ``}" style="--c:var(--${r})" aria-label="Progress: ${escapeHtml(PO_STATUS_NAMES[t.status])}">${qe.map((e, t) => `<li class="${t <= n ? `is-done` : ``}${t === n ? ` is-now` : ``}"><i></i><span>${e}</span></li>`).join(``)}</ol>`;
}
function et(e, t = ``) {
  let n = e.lines.slice(0, 2).map((e) => {
    let n = findMaterialById(e.materialId);
    return `<span>${Me(n, e.qty)} ${highlightSearchMatch(n?.name ?? e.materialId, t)}</span>`;
  });
  if (e.lines.length > 2) {
    n.push(`<span class="pu-more">+${e.lines.length - 2} more</span>`);
  }
  return n.join(``);
}
function tt(e) {
  let t = findSupplierById(e.supplierId);
  if (e.status === `draft`) {
    return {
      share: 0,
      tone: `slate`,
      lab: `Not sent yet`,
      val: `${t?.leadDays ?? `–`}-day lead`,
    };
  }
  if (e.status === `cancelled`) {
    return {
      share: 0,
      tone: `slate`,
      lab: `Cancelled`,
      val: `—`,
    };
  }
  if (e.status === `received`) {
    let t = (e.receivedAt ?? 0) > e.eta + ONE_DAY_MS;
    return {
      share: 1,
      tone: t ? `ochre` : `sage`,
      lab: `Received ${formatDate(e.receivedAt ?? e.eta)}`,
      val: t ? `arrived late` : `on time`,
    };
  }
  let n = e.sentAt ?? e.createdAt;
  let share = Math.max(0.02, Math.min(1, (Date.now() - n) / Math.max(ONE_DAY_MS, e.eta - n)));
  if (U(e)) {
    return {
      share: 1,
      tone: `rose`,
      lab: `Was due ${formatDate(e.eta)}`,
      val: Ne(e.eta),
    };
  }
  return {
    share,
    tone: `sky`,
    lab: `ETA ${formatDateWithDay(e.eta)}`,
    val: Ne(e.eta),
  };
}
function nt(e, t = false) {
  let n = t ? `btn--sm` : `btn--xs`;
  if (e.status === `draft`) {
    return `<button type="button" class="btn btn--primary ${n}" data-act="send" data-id="${e.id}">${renderIcon(`send`)}Send</button>${t ? `<button type="button" class="btn btn--ghost ${n}" data-act="cancel" data-id="${e.id}">${renderIcon(`close`)}Cancel PO</button>` : ``}`;
  }
  if (V.includes(e.status)) {
    return `<button type="button" class="btn btn--primary ${n}" data-act="recv" data-id="${e.id}">${renderIcon(`truck`)}Receive all</button><button type="button" class="btn btn--ghost ${n}" data-act="half" data-id="${e.id}">Receive half</button>${t ? `<button type="button" class="btn btn--ghost ${n}" data-act="cancel" data-id="${e.id}">${renderIcon(`close`)}Cancel PO</button>` : ``}`;
  }
  if (t) {
    return ``;
  }
  return `<a class="btn btn--ghost ${n}" href="/purchasing/orders/${e.id}">Details${renderIcon(`chevR`)}</a>`;
}
function rt(t, n) {
  let r = findSupplierById(t.supplierId);
  let i = Ge(t);
  let a = H(t);
  let o = i ? a / i : 0;
  let s = tt(t);
  let u = U(t);
  let d = t.status === `draft` || V.includes(t.status);
  return `<article class="card pu-po${u ? ` is-late` : ``}${t.status === `cancelled` ? ` is-off` : ``}" data-key="${t.id}" data-po="${t.id}" style="--c:var(--${TRANSFER_STATUS_NAMES[t.status] === `faint` ? `slate` : TRANSFER_STATUS_NAMES[t.status]})">
    <header class="pu-po__head">${L(r)}
      <a class="pu-po__who" href="/purchasing/orders/${t.id}"><b>${highlightSearchMatch(r?.name ?? ``, n)}</b><small><span class="mono">${highlightSearchMatch(t.number, n)}</span> · ${t.status === `draft` ? `drafted ${formatRelativeTime(t.createdAt)}` : `sent ${formatDate(t.sentAt ?? t.createdAt)}`}</small></a>
      ${u ? renderPill(`Late`, `rose`, `clock`) : renderPill(PO_STATUS_NAMES[t.status], TRANSFER_STATUS_NAMES[t.status])}
    </header>
    ${$e(t)}
    <p class="pu-po__lines">${et(t, n)}</p>
    <div class="pu-po__bars">
      <div class="pu-bar"><span class="pu-bar__lab">Received</span><b class="num">${formatInt(a)} <small>of ${formatInt(i)}</small></b>
        <span class="meter"><span class="meter__fill" data-recv style="--c:var(--sage);transform:scaleX(${o.toFixed(4)})"></span></span></div>
      <div class="pu-bar pu-bar--eta"><span class="pu-bar__lab">${escapeHtml(s.lab)}</span><b>${escapeHtml(s.val)}</b>
        <span class="meter"><span class="meter__fill" style="--c:var(--${s.tone});transform:scaleX(${s.share.toFixed(4)})"></span></span></div>
    </div>
    <footer class="pu-po__foot"><span class="pu-po__total"><small>${pluralize(t.lines.length, `line`)}</small><b class="num">${formatMoney(getPoTotalCost(t))}</b></span>
      <span class="pu-po__acts">${nt(t)}${d ? renderIconButton(`moreV`, `More for ${t.number}`, `data-more="${t.id}" aria-haspopup="menu" aria-expanded="false"`, `ibtn--sm`) : ``}</span></footer>
  </article>`;
}
let it = [];
var K = true;
function at() {
  let e = G.trim().toLowerCase();
  let t = Ye(store.pos).filter(
    (t) =>
      (W === `all` || t.status === W) &&
      (!e ||
        `${t.number} ${findSupplierById(t.supplierId)?.name ?? ``} ${t.lines.map((e) => findMaterialById(e.materialId)?.name ?? ``).join(` `)} ${t.note}`
          .toLowerCase()
          .includes(e))
  );
  if (!K && it.length) {
    let e = new Map(it.map((e, t) => [e, t]));
    let n = t.filter((t) => e.has(t.id)).sort((t, n) => e.get(t.id) - e.get(n.id));
    t.filter((t) => !e.has(t.id)).forEach((e) => {
      let r = t.indexOf(e);
      n.splice(Math.min(r, n.length), 0, e);
    });
    it = n.map((e) => e.id);
    return n;
  }
  K = false;
  it = t.map((e) => e.id);
  return t;
}
function q(e) {
  let t = P(`orders`);
  let n = Ze();
  R(t, `open`, n.openValue);
  R(t, `week`, n.dueWeek);
  R(t, `late`, n.late);
  R(t, `ontime`, n.onTime);
  let i = {
    all: store.pos.length,
  };
  store.pos.forEach((e) => {
    i[e.status] = (i[e.status] ?? 0) + 1;
  });
  domQueryAll(`[data-n]`, F(`po-chips`)).forEach((e) => {
    e.textContent = String(i[e.dataset.n] ?? 0);
  });
  let a = at();
  let o = a.length
    ? a.map((e) => rt(e, G.trim())).join(``)
    : store.pos.length
      ? `<div class="card pu-empty">${renderEmptyState(G ? `No purchase orders match “${G}”` : `No ${PO_STATUS_NAMES[W]?.toLowerCase() ?? ``} purchase orders`, `Try another status or clear the search.`, `search`, `<button type="button" class="btn btn--ghost btn--sm" data-clear="po">Clear filters</button>`)}</div>`
      : `<div class="card pu-empty">${renderEmptyState(`No purchase orders yet`, `Draft one for a material, or let Vels draft every reorder that’s due.`, `receipt`, `<button type="button" class="btn btn--primary btn--sm" data-act="newpo">${renderIcon(`plus`)}New PO</button>`)}</div>`;
  let c = F(`po-list`);
  if (e) {
    bindModalDismiss(c, () => {
      c.innerHTML = o;
    });
  } else {
    c.innerHTML = o;
  }
  a.forEach((t) => {
    let n = Ge(t);
    let r = n ? H(t) / n : 0;
    let i = Xe.get(t.id);
    if (e && i !== undefined && Math.abs(i - r) > 0.0001) {
      let e = queryOne(`[data-po="${t.id}"] [data-recv]`, c);
      if (e) {
        gsap.fromTo(
          e,
          {
            scaleX: i,
          },
          {
            scaleX: r,
            duration: motionDuration(1.1),
            ease: `power3.inOut`,
          }
        );
      }
    }
    Xe.set(t.id, r);
  });
}
function ot() {
  let e = P(`orders`);
  e.innerHTML = Qe();
  openMoveStockModal(e);
  F(`po-chips`).addEventListener(`click`, (e) => {
    let t = e.target.closest(`[data-pof]`);
    if (t) {
      openNewTransferModal(t);
      W = t.dataset.pof;
      domQueryAll(`[data-pof]`, F(`po-chips`)).forEach((e) =>
        e.setAttribute(`aria-pressed`, String(e === t))
      );
      K = true;
      q(true);
    }
  });
  F(`po-q`).addEventListener(`input`, (e) => {
    G = e.target.value;
    K = true;
    q(true);
  });
  e.addEventListener(`click`, (e) => {
    let e_target = e.target;
    if (e_target.closest(`[data-clear]`)) {
      K = true;
      W = `all`;
      G = ``;
      F(`po-q`).value = ``;
      domQueryAll(`[data-pof]`, F(`po-chips`)).forEach((e) =>
        e.setAttribute(`aria-pressed`, String(e.getAttribute(`data-pof`) === `all`))
      );
      q(true);
      return;
    }
    let r = e_target.closest(`[data-more]`);
    if (r) {
      let e = findPoById(r.dataset.more);
      if (!e) {
        return;
      }
      createCustomElement(r, [
        {
          label: `Open details`,
          icon: `receipt`,
          onSelect: () => {
            (window as any).navigateTo(`/purchasing/orders/${e.id}`)
          },
        },
        {
          label: `Email ${findSupplierById(e.supplierId)?.contact ?? `supplier`}`,
          icon: `mail`,
          onSelect: () => {
            location.href = `mailto:${findSupplierById(e.supplierId)?.email ?? ``}?subject=${encodeURIComponent(e.number)}`;
          },
        },
        `-`,
        {
          label: `Cancel PO`,
          icon: `close`,
          danger: true,
          onSelect: () => receivePo(e.id),
        },
      ]);
      return;
    }
    let i = e_target.closest(`[data-act]`);
    if (i) {
      openNewTransferModal(i);
      Ve(i.dataset.act, i.dataset.id ?? ``, i);
      return;
    }
    if (e_target.closest(`a, button, input`)) {
      return;
    }
    let a = e_target.closest(`[data-po]`);
    if (a) {
      (window as any).navigateTo(`/purchasing/orders/${a.dataset.po}`)
    }
  });
}
function st() {
  let e = P(`orders`);
  animatePageTransition(e);
  animateRows(domQueryAll(`.pu-toolbar .chip, .pu-toolbar .search`, e), {
    y: 8,
    stagger: 0.04,
    delay: 0.15,
  });
  animateCards(domQueryAll(`.pu-po, .pu-empty`, e).slice(0, 10), {
    stagger: 0.06,
    delay: 0.2,
  });
  Fe(domQueryAll(`.pu-po .meter__fill`, e).slice(0, 20), 0.5);
  domQueryAll(`.pu-po`, e)
    .slice(0, 10)
    .forEach((e, t) =>
      animatePop(domQueryAll(`.pu-steps li.is-done i`, e), {
        from: 0.2,
        delay: motionDuration(0.55 + t * 0.06),
        stagger: 0.07,
      })
    );
}
function ct(t) {
  let i = findPoById(t);
  if (!i) {
    return ``;
  }
  let a = findSupplierById(i.supplierId);
  let o = Ge(i);
  let s = H(i);
  let u = tt(i);
  let d = i.lines.reduce((acc, line) => acc + line.received * line.cost, 0);
  let f = [];
  f.push({
    at: i.createdAt,
    title: `Drafted`,
    text: `${pluralize(i.lines.length, `line`)} · ${formatMoneyRound(getPoTotalCost(i))}`,
    tone: `slate`,
    ico: `edit`,
  });
  if (i.sentAt) {
    f.push({
      at: i.sentAt,
      title: `Sent to ${a?.contact ?? `the supplier`}`,
      text: a?.email ?? ``,
      tone: `sky`,
      ico: `send`,
    });
  }
  let p = new Map();
  store.moves
    .filter((e) => e.kind === `receipt` && e.ref === i.number)
    .forEach((e) => {
      let t = Math.round(e.at / 60000);
      p.set(t, (p.get(t) ?? 0) + e.qty);
    });
  [...p.entries()].forEach(([e, t]) =>
    f.push({
      at: e * 60000,
      title: `Delivery received`,
      text: `${formatInt(t)} units onto the lab shelves`,
      tone: `sage`,
      ico: `truck`,
    })
  );
  let m = store.activity.find(
    (e) => e.kind === `po` && e.title === `Purchase order cancelled` && e.text === i.number
  );
  if (i.status === `cancelled`) {
    f.push({
      at: m?.at ?? Date.now(),
      title: `Cancelled`,
      text: `Nothing more is expected on this PO`,
      tone: `rose`,
      ico: `close`,
    });
  }
  if (i.status === `received` && !p.size && i.receivedAt) {
    f.push({
      at: i.receivedAt,
      title: `Received in full`,
      text: `${formatInt(o)} units onto the lab shelves`,
      tone: `sage`,
      ico: `truck`,
    });
  }
  if (V.includes(i.status) || i.status === `draft`) {
    f.push({
      at: i.eta,
      title: i.status === `draft` ? `Would arrive` : U(i) ? `Was due` : `Expected`,
      text: `${formatDateWithDay(i.eta)} · ${a?.leadDays ?? `–`}-day lead time`,
      tone: U(i) ? `rose` : `ochre`,
      ico: `calendar`,
      future: true,
    });
  }
  f.sort((e, t) => e.at - t.at);
  let ee = nt(i, true);
  return `<header class="d-head">${L(a, `lg`)}<div><h2><span class="mono">${escapeHtml(i.number)}</span></h2><small>${escapeHtml(a?.name ?? ``)} · ${escapeHtml(a?.city ?? ``)}, ${escapeHtml(a?.country ?? ``)}</small></div></header>
    <div class="d-pills">${U(i) ? renderPill(`Late`, `rose`, `clock`) : renderPill(PO_STATUS_NAMES[i.status], TRANSFER_STATUS_NAMES[i.status])}${i.note ? renderPill(`Has a note`, `ochre`, `note`) : ``}</div>
    ${$e(i)}
    <div class="d-facts">
      <div><small>Order total</small><b class="num">${formatMoney(getPoTotalCost(i))}</b><span>${pluralize(o, `unit`)} across ${pluralize(i.lines.length, `line`)}</span></div>
      <div><small>${escapeHtml(u.lab)}</small><b>${escapeHtml(i.status === `received` ? formatDate(i.receivedAt ?? i.eta) : formatDate(i.eta))}</b><span>${escapeHtml(u.val)}</span></div>
      <div><small>Received so far</small><b class="num" data-recv-d>${formatInt(s)} <span>of ${formatInt(o)}</span></b><span>${formatMoney(d)} at cost</span></div>
      <div><small>Created</small><b>${formatDate(i.createdAt, true)}</b><span>${formatRelativeTime(i.createdAt)}</span></div>
    </div>
    ${i.note ? `<p class="note">${renderIcon(`note`)}<span>${escapeHtml(i.note)}</span></p>` : ``}
    <section class="d-sec"><h3>Lines</h3><div class="rows">${i.lines
      .map((t) => {
        let n = findMaterialById(t.materialId);
        let r = t.qty ? t.received / t.qty : 0;
        return `<a class="row pu-dline" href="/purchasing/materials/${t.materialId}">${renderTag(n?.kind === `Ingredient` ? `drop` : n?.kind === `Shipping` ? `box` : `layers`, n?.kind === `Ingredient` ? `teal` : n?.kind === `Shipping` ? `sky` : `ocean`, `sm`)}
        <span class="row__txt"><b>${escapeHtml(n?.name ?? t.materialId)}</b><small><span class="mono">${escapeHtml(n?.code ?? ``)}</span> · ${formatMoney(t.cost)} / ${escapeHtml(n?.unit === `pcs` ? `piece` : (n?.unit ?? `unit`))}</small>
          <span class="pu-dline__m"><span class="meter"><span class="meter__fill" style="--c:var(--sage);transform:scaleX(${r.toFixed(4)})"></span></span><small class="num">${formatNumber(t.received, 2)} / ${formatNumber(t.qty, 2)} ${escapeHtml(n?.unit ?? ``)}</small></span></span>
        <span class="row__end"><b class="num">${formatMoneyRound(t.qty * t.cost)}</b>${r >= 1 ? `in full` : r > 0 ? `part in` : `due`}</span></a>`;
      })
      .join(``)}</div>
      <dl class="pu-totals"><div><dt>Subtotal</dt><dd class="num">${formatMoney(getPoTotalCost(i))}</dd></div><div><dt>Still due</dt><dd class="num">${formatMoney(getPoTotalCost(i) - d)}</dd></div><div><dt>Freight</dt><dd>Supplier pays</dd></div></dl>
    </section>
    <section class="d-sec"><h3>Supplier</h3>
      <div class="pu-contact">${L(a, `md`)}<span><b>${escapeHtml(a?.contact ?? ``)}</b><small>${escapeHtml(a?.name ?? ``)}</small></span>
        <a class="ibtn ibtn--sm" href="mailto:${escapeHtml(a?.email ?? ``)}?subject=${encodeURIComponent(i.number)}" aria-label="Email ${escapeHtml(a?.contact ?? ``)}" title="${escapeHtml(a?.email ?? ``)}">${renderIcon(`mail`)}</a>
        <a class="ibtn ibtn--sm" href="tel:${escapeHtml((a?.phone ?? ``).replace(/[^\d+]/g, ``))}" aria-label="Call ${escapeHtml(a?.contact ?? ``)}" title="${escapeHtml(a?.phone ?? ``)}">${renderIcon(`phone`)}</a></div>
      <a class="pu-link" href="/purchasing/suppliers/${i.supplierId}">Supplier profile${renderIcon(`chevR`)}</a>
    </section>
    <section class="d-sec"><h3>Timeline</h3><ol class="pu-tl">${f.map((t) => `<li class="${t.future ? `is-future` : ``}" style="--c:var(--${t.tone})"><span class="pu-tl__dot">${renderIcon(t.ico)}</span><span><b>${escapeHtml(t.title)}</b><small>${escapeHtml(t.text)}${t.text ? ` · ` : ``}${t.future ? formatDate(t.at) : `${formatDate(t.at)} · ${formatRelativeTime(t.at)}`}</small></span></li>`).join(``)}</ol></section>
    ${ee ? `<div class="d-actions">${ee}</div>` : ``}`;
}
let J = `name`;
let Y = false;
let lt = ``;
const ut = (e) =>
  store.pos
    .filter(
      (t) =>
        t.supplierId === e &&
        t.status !== `cancelled` &&
        t.status !== `draft` &&
        t.createdAt >= Date.now() - 90 * 86400000
    )
    .reduce((acc, item) => acc + getPoTotalCost(item), 0);
const dt = (e) =>
  store.pos.filter((t) => t.supplierId === e && (t.status === `draft` || V.includes(t.status)));
const ft = (e) => {
  if (e >= 0.95) {
    return `sage`;
  }
  if (e >= 0.88) {
    return `ochre`;
  }
  return `rose`;
};
function pt(onTime, t = `sm`) {
  return `<span class="pu-ring pu-ring--${t}" role="img" aria-label="${formatPercent(onTime)} on time"><svg viewBox="0 0 44 44" aria-hidden="true"><circle class="pu-ring__t" cx="22" cy="22" r="18" pathLength="100"/><circle class="pu-ring__a tone-stroke--${ft(onTime)}" cx="22" cy="22" r="18" pathLength="100" stroke-dasharray="${(onTime * 100).toFixed(1)} 100" data-v="${(onTime * 100).toFixed(1)}"/></svg><b class="num">${Math.round(onTime * 100)}%</b></span>`;
}
function mt(e, t = 0) {
  let n = Number(e.dataset.v ?? 0);
  gsap.fromTo(
    e,
    {
      attr: {
        "stroke-dasharray": `0 100`,
      },
    },
    {
      attr: {
        "stroke-dasharray": `${n} 100`,
      },
      duration: motionDuration(1.2),
      delay: motionDuration(t),
      ease: `power3.inOut`,
    }
  );
}
const ht = (rating) =>
  `<span class="pu-stars" role="img" aria-label="Rated ${rating} of 5" style="--r:${(rating / 5).toFixed(3)}"><span>${renderIcon(`star`).repeat(5)}</span><span class="pu-stars__on" aria-hidden="true">${renderIcon(`star`).repeat(5)}</span></span>`;
function gt() {
  let Bn_suppliers = store.suppliers;
  return {
    n: Bn_suppliers.length,
    onTime:
      Bn_suppliers.reduce((acc, supplier) => acc + supplier.onTime, 0) /
      Math.max(1, Bn_suppliers.length),
    spend: Bn_suppliers.reduce((acc, supplier) => acc + ut(supplier.id), 0),
    lead:
      Bn_suppliers.reduce((acc, supplier) => acc + supplier.leadDays, 0) /
      Math.max(1, Bn_suppliers.length),
  };
}
function _t() {
  let e = gt();
  return `${renderPageHeader({
    eyebrow: `The growers, makers and printers behind every jar`,
    title: `Suppliers`,
    actions: `<button type="button" class="btn btn--primary magnetic" data-act="newpo">${renderIcon(`plus`)}New PO</button>`,
    stats: [
      {
        key: `n`,
        icon: `building`,
        label: `Active suppliers`,
        value: e.n,
        ico: `pine`,
      },
      {
        key: `ontime`,
        icon: `truck`,
        label: `Average on-time`,
        value: e.onTime,
        fmt: `pct`,
        ico: `sage`,
      },
      {
        key: `spend`,
        icon: `dollar`,
        label: `Spend, last 90 days`,
        value: e.spend,
        fmt: `money`,
        ico: `ochre`,
      },
      {
        key: `lead`,
        icon: `clock`,
        label: `Average lead time`,
        value: Math.round(e.lead),
        suffix: `days`,
        ico: `sky`,
      },
    ],
  })}
  <div class="toolbar pu-toolbar">
    <div class="chips" data-k="sup-chips">${z(`fav`, `data-supfav`, `Favourites`, Y, store.suppliers.filter((e) => e.favorite).length, `star`)}</div>
    ${renderSegmentedControl(
      `Sort suppliers`,
      [
        [`name`, `Name`],
        [`ontime`, `On-time`],
        [`lead`, `Lead time`],
        [`spend`, `Spend`],
      ],
      J,
      `pu-sort`
    )}
    <span class="toolbar__spacer"></span>
    <label class="search pu-search">${renderIcon(`search`)}<input type="search" placeholder="Supplier, city or material…" aria-label="Search suppliers" data-k="sup-q" /></label>
  </div>
  <div class="pu-sups" data-k="sup-list"></div>`;
}
function vt(e, t) {
  let n = dt(e.id);
  let i = n.reduce((acc, item) => acc + getPoTotalCost(item), 0);
  let length = store.materials
    .filter((t) => t.supplierId === e.id)
    .filter(isMaterialLowStock).length;
  return `<article class="card pu-sup" data-key="${e.id}" data-sup="${e.id}" data-lift style="--c:var(--${e.tone})">
    <header class="pu-sup__head">${L(e, `lg`)}
      <a class="pu-sup__name" href="/purchasing/suppliers/${e.id}"><b>${highlightSearchMatch(e.name, t)}</b><small>${renderIcon(`map`)}${highlightSearchMatch(`${e.city}, ${e.country}`, t)}</small></a>
      <button type="button" class="ibtn ibtn--sm pu-fav" data-act="fav" data-id="${e.id}" aria-pressed="${e.favorite}" aria-label="${e.favorite ? `Remove from` : `Add to`} favourites" title="Favourite">${renderIcon(`star`)}</button>
    </header>
    <p class="pu-sup__supplies">${highlightSearchMatch(e.supplies, t)}</p>
    <div class="pu-sup__figs">
      <div class="pu-sup__fig">${pt(e.onTime)}<span>On time</span></div>
      <div class="pu-sup__fig"><b class="num">${e.leadDays}<small> d</small></b><span>Lead time</span></div>
      <div class="pu-sup__fig">${ht(e.rating)}<span>${e.rating.toFixed(1)} rating</span></div>
    </div>
    <footer class="pu-sup__foot">
      <span>${n.length ? `<b>${pluralize(n.length, `open PO`)}</b> · ${formatMoneyRound(i)}` : `No open POs`}${length ? ` · <span class="pu-warn">${pluralize(length, `material`)} low</span>` : ``}</span>
      ${renderIcon(`chevR`, `pu-sup__go`)}
    </footer>
  </article>`;
}
function X(e) {
  let t = P(`suppliers`);
  let n = gt();
  R(t, `n`, n.n);
  R(t, `ontime`, n.onTime);
  R(t, `spend`, n.spend);
  R(t, `lead`, Math.round(n.lead));
  let i = queryOne(`[data-n="fav"]`, t);
  if (i) {
    i.textContent = String(store.suppliers.filter((e) => e.favorite).length);
  }
  let a = lt.trim();
  let o = a.toLowerCase();
  let c = store.suppliers
    .filter(
      (e) =>
        (!Y || e.favorite) &&
        (!o ||
          `${e.name} ${e.city} ${e.country} ${e.supplies} ${e.contact}`.toLowerCase().includes(o))
    )
    .sort((e, t) => {
      if (J === `ontime`) {
        return t.onTime - e.onTime;
      }
      if (J === `lead`) {
        return e.leadDays - t.leadDays;
      }
      if (J === `spend`) {
        return ut(t.id) - ut(e.id);
      }
      return e.name.localeCompare(t.name);
    });
  let l = c.length
    ? c.map((e) => vt(e, a)).join(``)
    : `<div class="card pu-empty">${store.suppliers.length ? renderEmptyState(Y && !o ? `No favourites yet` : `No suppliers match “${a}”`, Y && !o ? `Star the suppliers you order from most and they gather here.` : `Try a city, a country or what they supply.`, Y && !o ? `star` : `search`, `<button type="button" class="btn btn--ghost btn--sm" data-clear="sup">Show every supplier</button>`) : renderEmptyState(`No suppliers on file`, `Suppliers appear here as soon as one is added.`, `building`)}</div>`;
  let d = F(`sup-list`);
  if (e) {
    bindModalDismiss(d, () => {
      d.innerHTML = l;
    });
  } else {
    d.innerHTML = l;
  }
  initLiftAnimations(d);
  if (e) {
    domQueryAll(`.pu-ring__a`, d).forEach((e) => {
      let t = e.dataset.v;
      if (t) {
        e.setAttribute(`stroke-dasharray`, `${t} 100`);
      }
    });
  }
}
function yt() {
  let e = P(`suppliers`);
  e.innerHTML = _t();
  openMoveStockModal(e);
  initSegmentedControl(domQuery(`.pu-sort`, e), (e) => {
    J = e;
    X(true);
  });
  F(`sup-q`).addEventListener(`input`, (e) => {
    lt = e.target.value;
    X(true);
  });
  e.addEventListener(`click`, (t) => {
    let t_target = t.target;
    let r = t_target.closest(`[data-supfav]`);
    if (r) {
      openNewTransferModal(r);
      Y = !Y;
      r.setAttribute(`aria-pressed`, String(Y));
      X(true);
      return;
    }
    if (t_target.closest(`[data-clear]`)) {
      Y = false;
      lt = ``;
      F(`sup-q`).value = ``;
      domQuery(`[data-supfav]`, e).setAttribute(`aria-pressed`, `false`);
      X(true);
      return;
    }
    let i = t_target.closest(`[data-act]`);
    if (i) {
      openNewTransferModal(i);
      Ve(i.dataset.act, i.dataset.id ?? ``, i);
      return;
    }
    if (t_target.closest(`a, button, input`)) {
      return;
    }
    let a = t_target.closest(`[data-sup]`);
    if (a) {
      (window as any).navigateTo(`/purchasing/suppliers/${a.dataset.sup}`)
    }
  });
}
function bt() {
  let e = P(`suppliers`);
  animatePageTransition(e);
  animateRows(domQueryAll(`.pu-toolbar .chip, .pu-toolbar .seg, .pu-toolbar .search`, e), {
    y: 8,
    stagger: 0.04,
    delay: 0.15,
  });
  animateCards(domQueryAll(`.pu-sup, .pu-empty`, e), {
    stagger: 0.06,
    delay: 0.2,
  });
  domQueryAll(`.pu-ring__a`, e).forEach((e, t) => mt(e, 0.45 + t * 0.06));
  domQueryAll(`.pu-sup .pu-ring b`, e).forEach((e, t) => {
    getAvailableLocations(
      e,
      Math.round(Number(e.parentElement?.querySelector(`.pu-ring__a`)?.dataset.v ?? 0)),
      (e) => `${Math.round(e)}%`,
      {
        from: 0,
        duration: 1.2,
        delay: motionDuration(0.45 + t * 0.06),
      }
    );
  });
}
function xt(t) {
  let n = findSupplierById(t);
  if (!n) {
    return ``;
  }
  let i = store.materials.filter((e) => e.supplierId === n.id);
  let a = Ye(store.pos.filter((e) => e.supplierId === n.id));
  let u = a.filter((e) => e.status === `draft` || V.includes(e.status));
  let d = a.filter((e) => e.status === `received` && e.receivedAt);
  let f = d.length
    ? d.filter((e) => (e.receivedAt ?? 0) <= e.eta + ONE_DAY_MS).length / d.length
    : n.onTime;
  return `<header class="d-head">${L(n, `lg`)}<div><h2>${escapeHtml(n.name)}</h2><small>${escapeHtml(n.city)}, ${escapeHtml(n.country)} · supplier since ${new Date(n.since).getFullYear()}</small></div></header>
    <div class="d-pills">${n.favorite ? renderPill(`Favourite`, `ochre`, `star`) : ``}${renderPill(`${n.leadDays}-day lead`, `sky`, `clock`)}${u.length ? renderPill(pluralize(u.length, `open PO`), `pine`) : renderPill(`Nothing open`, `faint`)}</div>
    <section class="d-sec"><h3>Performance</h3>
      <div class="pu-perf">${pt(n.onTime, `lg`)}
        <div class="d-facts">
          <div><small>Lead time</small><b class="num">${n.leadDays} days</b><span>Order to dock</span></div>
          <div><small>Spend, 90 days</small><b class="num">${formatMoneyRound(ut(n.id))}</b><span>${pluralize(a.filter((e) => e.status !== `cancelled` && e.status !== `draft` && e.createdAt >= Date.now() - 90 * 86400000).length, `PO`)}</span></div>
          <div><small>Rating</small><b class="num">${n.rating.toFixed(1)} <span>/ 5</span></b>${ht(n.rating)}</div>
          <div><small>Our deliveries</small><b class="num">${d.length ? formatPercent(f) : `—`}</b><span>${d.length ? `on time across ${pluralize(d.length, `delivery`, `deliveries`)}` : `none received yet`}</span></div>
        </div>
      </div>
    </section>
    <section class="d-sec"><h3>Contact</h3>
      <div class="rows">
        <div class="row">${L(n, `sm`)}<span class="row__txt"><b>${escapeHtml(n.contact)}</b><small>Account contact</small></span></div>
        <a class="row" href="mailto:${escapeHtml(n.email)}">${renderTag(`mail`, `pine`, `sm`)}<span class="row__txt"><b>${escapeHtml(n.email)}</b><small>Email</small></span>${renderIcon(`chevR`, `row__go`)}</a>
        <a class="row" href="tel:${escapeHtml(n.phone.replace(/[^\d+]/g, ``))}">${renderTag(`phone`, `teal`, `sm`)}<span class="row__txt"><b>${escapeHtml(n.phone)}</b><small>Phone</small></span>${renderIcon(`chevR`, `row__go`)}</a>
      </div>
    </section>
    <section class="d-sec"><h3>What they supply <span class="pu-count">${i.length}</span></h3>
      <div class="rows">${i.map((t) => `<a class="row" href="/purchasing/materials/${t.id}">${renderTag(t.kind === `Ingredient` ? `drop` : t.kind === `Shipping` ? `box` : `layers`, isMaterialLowStock(t) ? `ochre` : `teal`, `sm`)}<span class="row__txt"><b>${escapeHtml(t.name)}</b><small><span class="mono">${escapeHtml(t.code)}</span> · ${formatNumber(t.onHand, 2)} ${escapeHtml(t.unit)} on hand${findCustomerByEmail(t.id) ? ` · ${formatNumber(findCustomerByEmail(t.id), 2)} on order` : ``}</small></span>${isMaterialLowStock(t) ? renderPill(`Low`, `ochre`) : `<span class="row__end">${formatMoney(t.cost)}</span>`}</a>`).join(``) || renderEmptyState(`Nothing on file`, `No materials list this supplier yet.`, `drop`)}</div>
    </section>
    <section class="d-sec"><h3>Purchase orders <span class="pu-count">${a.length}</span></h3>
      <div class="rows">${
        a
          .slice(0, 8)
          .map(
            (t) =>
              `<a class="row" href="/purchasing/orders/${t.id}"><span class="row__txt"><b class="mono">${escapeHtml(t.number)}</b><small>${formatDate(t.createdAt, true)} · ${pluralize(t.lines.length, `line`)}</small></span>${U(t) ? renderPill(`Late`, `rose`) : renderPill(PO_STATUS_NAMES[t.status], TRANSFER_STATUS_NAMES[t.status])}<span class="row__end"><b class="num">${formatMoneyRound(getPoTotalCost(t))}</b></span></a>`
          )
          .join(``) ||
        renderEmptyState(`No purchase orders yet`, `Draft the first one below.`, `receipt`)
      }</div>
    </section>
    <div class="d-actions"><button type="button" class="btn btn--primary btn--sm" data-act="newpo" data-id="${n.id}">${renderIcon(`plus`)}New PO to ${escapeHtml(n.name.split(` `)[0] ?? n.name)}</button>
      <button type="button" class="btn btn--ghost btn--sm pu-fav-btn" data-act="fav" data-id="${n.id}" aria-pressed="${n.favorite}">${renderIcon(`star`)}${n.favorite ? `Favourite` : `Add to favourites`}</button></div>`;
}
let Z = `all`;
let Q = false;
let St = ``;
const Ct = {
  Ingredient: `teal`,
  Packaging: `ocean`,
  Shipping: `sky`,
};
const wt = {
  Ingredient: `drop`,
  Packaging: `layers`,
  Shipping: `box`,
};
const Tt = () =>
  store.pos
    .filter((e) => V.includes(e.status))
    .reduce(
      (acc, item) =>
        acc + item.lines.reduce((acc_1, line) => acc_1 + (line.qty - line.received) * line.cost, 0),
      0
    );
function Et() {
  return `${renderPageHeader({
    eyebrow: `Raw materials, packaging and shipping supplies`,
    title: `Materials`,
    actions: `<button type="button" class="btn btn--ghost" data-act="reorder">${renderIcon(`refresh`)}Reorder low materials</button><button type="button" class="btn btn--primary magnetic" data-act="newpo">${renderIcon(`plus`)}New PO</button>`,
    stats: [
      {
        key: `value`,
        icon: `layers`,
        label: `Materials value`,
        value: getCustomerOrdersCount(),
        fmt: `money`,
        ico: `ocean`,
      },
      {
        key: `low`,
        icon: `alert`,
        label: `Below reorder point`,
        value: store.materials.filter(isMaterialLowStock).length,
        ico: `ochre`,
      },
      {
        key: `due`,
        icon: `truck`,
        label: `On order, still due`,
        value: Tt(),
        fmt: `money`,
        ico: `sky`,
      },
      {
        key: `n`,
        icon: `boxes`,
        label: `Materials tracked`,
        value: store.materials.length,
        ico: `pine`,
      },
    ],
  })}
  <section class="card pu-mats tcard" aria-label="Materials">
    <div class="toolbar pu-toolbar">
      <div class="chips" data-k="mat-chips" role="group" aria-label="Filter by kind">
        ${z(`all`, `data-mk`, `All`, Z === `all`, 0)}${[`Ingredient`, `Packaging`, `Shipping`].map((e) => z(e, `data-mk`, e === `Ingredient` ? `Ingredients` : e, Z === e, 0)).join(``)}
        <span class="pu-chipsep" aria-hidden="true"></span>${z(`low`, `data-mlow`, `Low only`, Q, 0, `alert`)}
      </div>
      <span class="toolbar__spacer"></span>
      <label class="search pu-search">${renderIcon(`search`)}<input type="search" placeholder="Code, name or supplier…" aria-label="Search materials" data-k="mat-q" /></label>
    </div>
    <div class="table-wrap"><table class="table table--stack pu-mtable" style="--areas:'t r' 's p' 'm m'">
      <thead><tr><th scope="col">Code</th><th scope="col">Material</th><th scope="col">Kind</th><th scope="col">On hand</th><th scope="col" class="r">On order</th><th scope="col">Supplier</th><th scope="col" class="r">Unit cost</th><th scope="col" class="r">Value</th><th scope="col"><span class="sr">Actions</span></th></tr></thead>
      <tbody data-k="mat-rows"></tbody>
    </table></div>
  </section>`;
}
function Dt(e) {
  let t = e.reorderAt + e.reorderQty;
  return {
    fill: Math.max(0.02, Math.min(1, e.onHand / t)),
    tick: e.reorderAt / t,
  };
}
function Ot(t, n) {
  let r = findSupplierById(t.supplierId);
  let i = findCustomerByEmail(t.id);
  let a = isMaterialLowStock(t);
  let o = Dt(t);
  return `<tr class="is-link${a ? ` is-low` : ``}" data-key="${t.id}" data-mat="${t.id}" tabindex="0" aria-label="${escapeHtml(t.name)}">
    <td class="a-h"><span class="ref">${highlightSearchMatch(t.code, n)}</span></td>
    <td class="a-t"><span class="pu-mname"><b>${highlightSearchMatch(t.name, n)}</b><small class="pu-stackonly"><span class="mono">${highlightSearchMatch(t.code, n)}</span> · ${escapeHtml(r?.name ?? ``)}</small></span></td>
    <td class="a-s">${renderPill(t.kind, Ct[t.kind])}${a ? `<span class="pu-lowtag">${renderIcon(`alert`)}Low</span>` : ``}</td>
    <td class="a-m"><span class="pu-lvlcell"><span class="pu-lvlnum"><b class="num">${formatNumber(t.onHand, 2)}</b> ${escapeHtml(t.unit)}<small class="pu-stackonly">${i ? ` · ${formatNumber(i, 2)} on order` : ``} · reorder at ${formatNumber(t.reorderAt, 2)}</small></span>
      <span class="meter pu-lvl" title="Reorder at ${formatNumber(t.reorderAt, 2)} ${escapeHtml(t.unit)}"><span class="meter__fill" style="--c:var(--${a ? `ochre` : `teal`});transform:scaleX(${o.fill.toFixed(4)})"></span><i style="left:${(o.tick * 100).toFixed(2)}%"></i></span></span></td>
    <td class="a-h r">${i ? `<b class="num">${formatNumber(i, 2)}</b> <small class="pu-dim">${escapeHtml(t.unit)}</small>` : `<span class="pu-dim">—</span>`}</td>
    <td class="a-h"><span class="pu-supcell">${L(r, `sm`)}<span>${highlightSearchMatch(r?.name ?? ``, n)}</span></span></td>
    <td class="a-h r num">${formatMoney(t.cost)}</td>
    <td class="a-r r"><b class="num">${formatMoneyRound(t.onHand * t.cost)}</b></td>
    <td class="a-p r"><button type="button" class="btn ${a && !i ? `btn--soft` : `btn--ghost`} btn--xs" data-act="order" data-id="${t.id}">${renderIcon(`cart`)}Order</button></td>
  </tr>`;
}
function $(e) {
  let t = P(`materials`);
  R(t, `value`, getCustomerOrdersCount());
  R(t, `low`, store.materials.filter(isMaterialLowStock).length);
  R(t, `due`, Tt());
  R(t, `n`, store.materials.length);
  let n = {
    all: store.materials.length,
    low: store.materials.filter(isMaterialLowStock).length,
  };
  store.materials.forEach((e) => {
    n[e.kind] = (n[e.kind] ?? 0) + 1;
  });
  domQueryAll(`[data-n]`, F(`mat-chips`)).forEach((e) => {
    e.textContent = String(n[e.dataset.n] ?? 0);
  });
  let i = St.trim();
  let a = i.toLowerCase();
  let o = store.materials
    .filter(
      (e) =>
        (Z === `all` || e.kind === Z) &&
        (!Q || isMaterialLowStock(e)) &&
        (!a ||
          `${e.code} ${e.name} ${findSupplierById(e.supplierId)?.name ?? ``}`
            .toLowerCase()
            .includes(a))
    )
    .sort(
      (e, t) =>
        Number(isMaterialLowStock(t)) - Number(isMaterialLowStock(e)) ||
        e.code.localeCompare(t.code)
    );
  let l = o.length
    ? o.map((e) => Ot(e, i)).join(``)
    : `<tr><td colspan="9">${store.materials.length ? renderEmptyState(Q && !a ? `Nothing is running low` : `No materials match${i ? ` “${i}”` : ``}`, Q && !a ? `Every material is above its reorder point.` : `Try another kind or clear the search.`, Q && !a ? `shield` : `search`, `<button type="button" class="btn btn--ghost btn--sm" data-clear="mat">Show every material</button>`) : renderEmptyState(`No materials tracked`, `Add raw materials and packaging to plan batches and reorders.`, `drop`)}</td></tr>`;
  let u = F(`mat-rows`);
  if (e) {
    bindModalDismiss(u, () => {
      u.innerHTML = l;
    });
  } else {
    u.innerHTML = l;
  }
}
function kt() {
  let e = P(`materials`);
  e.innerHTML = Et();
  openMoveStockModal(e);
  let t = F(`mat-chips`);
  t.addEventListener(`click`, (e) => {
    let e_target = e.target;
    let r = e_target.closest(`[data-mk]`);
    if (r) {
      openNewTransferModal(r);
      Z = r.dataset.mk;
      domQueryAll(`[data-mk]`, t).forEach((e) => e.setAttribute(`aria-pressed`, String(e === r)));
      $(true);
      return;
    }
    let i = e_target.closest(`[data-mlow]`);
    if (i) {
      openNewTransferModal(i);
      Q = !Q;
      i.setAttribute(`aria-pressed`, String(Q));
      $(true);
    }
  });
  F(`mat-q`).addEventListener(`input`, (e) => {
    St = e.target.value;
    $(true);
  });
  e.addEventListener(`click`, (e) => {
    let e_target = e.target;
    if (e_target.closest(`[data-clear]`)) {
      Z = `all`;
      Q = false;
      St = ``;
      F(`mat-q`).value = ``;
      domQueryAll(`[data-mk]`, t).forEach((e) =>
        e.setAttribute(`aria-pressed`, String(e.getAttribute(`data-mk`) === `all`))
      );
      domQuery(`[data-mlow]`, t).setAttribute(`aria-pressed`, `false`);
      $(true);
      return;
    }
    let r = e_target.closest(`[data-act]`);
    if (r) {
      openNewTransferModal(r);
      Ve(r.dataset.act, r.dataset.id ?? ``, r);
      return;
    }
    if (e_target.closest(`a, button, input`)) {
      return;
    }
    let i = e_target.closest(`[data-mat]`);
    if (i) {
      (window as any).navigateTo(`/purchasing/materials/${i.dataset.mat}`)
    }
  });
  e.addEventListener(`keydown`, (e) => {
    let t = e.target.closest?.(`tr[data-mat]`);
    if (t && e.target === t && (e.key === `Enter` || e.key === ` `)) {
      e.preventDefault();
      (window as any).navigateTo(`/purchasing/materials/${t.dataset.mat}`)
    }
  });
}
function At() {
  let e = P(`materials`);
  animatePageTransition(e);
  animateCards(domQueryAll(`.pu-mats`, e), {
    delay: 0.15,
  });
  animateRows(domQueryAll(`.pu-toolbar .chip, .pu-toolbar .search`, e), {
    y: 8,
    stagger: 0.035,
    delay: 0.3,
  });
  animateRows(domQueryAll(`.pu-mtable tbody tr`, e).slice(0, 18), {
    y: 10,
    stagger: 0.035,
    delay: 0.35,
  });
  Fe(domQueryAll(`.pu-lvl .meter__fill`, e), 0.55);
}
function jt(t) {
  let n = findMaterialById(t);
  if (!n) {
    return ``;
  }
  let i = findSupplierById(n.supplierId);
  let a = findCustomerByEmail(n.id);
  let o = isMaterialLowStock(n);
  let u = Dt(n);
  let d = store.products
    .map((p) => ({
      p,
      b: p.bom.find((e) => e.materialId === n.id),
    }))
    .filter((e) => !!e.b)
    .map((e) => ({
      ...e,
      makes: Math.floor(n.onHand / e.b.per),
    }))
    .sort((e, t) => e.makes - t.makes);
  let f = Ye(store.pos.filter((e) => e.lines.some((e) => e.materialId === n.id)));
  return `<header class="d-head">${renderTag(wt[n.kind], o ? `ochre` : Ct[n.kind])}<div><h2>${escapeHtml(n.name)}</h2><small><span class="mono">${escapeHtml(n.code)}</span> · ${escapeHtml(n.kind)} · kept at the lab</small></div></header>
    <div class="d-pills">${renderPill(n.kind, Ct[n.kind])}${o ? renderPill(`Below reorder point`, `ochre`, `alert`) : renderPill(`Stocked`, `sage`)}${a ? renderPill(`${formatNumber(a, 2)} ${n.unit} on order`, `sky`, `truck`) : ``}</div>
    <div class="pu-dlevel"><div><small>On hand</small><b class="num">${formatNumber(n.onHand, 2)} <span>${escapeHtml(n.unit)}</span></b></div>
      <span class="meter pu-lvl pu-lvl--lg"><span class="meter__fill" style="--c:var(--${o ? `ochre` : `teal`});transform:scaleX(${u.fill.toFixed(4)})"></span><i style="left:${(u.tick * 100).toFixed(2)}%"></i></span>
      <small class="pu-dim">Reorder at ${formatNumber(n.reorderAt, 2)} ${escapeHtml(n.unit)} · orders of ${formatNumber(n.reorderQty, 2)} ${escapeHtml(n.unit)}</small></div>
    <div class="d-facts">
      <div><small>Unit cost</small><b class="num">${formatMoney(n.cost)}</b><span>per ${escapeHtml(n.unit === `pcs` ? `piece` : n.unit)}</span></div>
      <div><small>Value on hand</small><b class="num">${formatMoneyRound(n.onHand * n.cost)}</b><span>at cost</span></div>
      <div><small>On order</small><b class="num">${a ? `${formatNumber(a, 2)} ${escapeHtml(n.unit)}` : `—`}</b><span>${a ? `sent, not yet in` : `nothing open`}</span></div>
      <div><small>Supplier</small><b><a href="/purchasing/suppliers/${n.supplierId}" class="pu-link">${escapeHtml(i?.name ?? ``)}</a></b><span>${i ? `${i.leadDays}-day lead` : ``}</span></div>
    </div>
    <section class="d-sec"><h3>Used in <span class="pu-count">${d.length}</span></h3>
      <div class="rows">${d.map((t) => `<a class="row" href="/products/item/${t.p.id}">${renderProductThumb(t.p, `sm`)}<span class="row__txt"><b>${escapeHtml(formatProductFullName(t.p))}</b><small>${formatNumber(t.b.per, 3)} ${escapeHtml(n.unit)} per unit</small></span><span class="row__end"><b class="num${t.makes < t.p.reorderQty ? ` pu-warn` : ``}">${formatInt(t.makes)}</b>units it could make</span></a>`).join(``) || renderEmptyState(`Not in any formula`, `No product’s bill of materials uses this yet.`, `flask`)}</div>
    </section>
    <section class="d-sec"><h3>Purchase history <span class="pu-count">${f.length}</span></h3>
      <div class="rows">${
        f
          .slice(0, 8)
          .map((t) => {
            let r = t.lines.find((e) => e.materialId === n.id);
            return `<a class="row" href="/purchasing/orders/${t.id}"><span class="row__txt"><b class="mono">${escapeHtml(t.number)}</b><small>${formatDate(t.createdAt, true)} · ${formatNumber(r.received, 2)} of ${formatNumber(r.qty, 2)} ${escapeHtml(n.unit)} in</small></span>${U(t) ? renderPill(`Late`, `rose`) : renderPill(PO_STATUS_NAMES[t.status], TRANSFER_STATUS_NAMES[t.status])}<span class="row__end"><b class="num">${formatMoneyRound(r.qty * r.cost)}</b></span></a>`;
          })
          .join(``) ||
        renderEmptyState(`Never ordered`, `Its first purchase order will show here.`, `receipt`)
      }</div>
    </section>
    <div class="d-actions"><button type="button" class="btn btn--primary btn--sm" data-act="order" data-id="${n.id}">${renderIcon(`cart`)}Order ${escapeHtml(n.unit === `pcs` ? `more` : `${formatNumber(n.reorderQty, 2)} ${n.unit}`)}</button>
      <a class="btn btn--ghost btn--sm" href="/purchasing/suppliers/${n.supplierId}">${renderIcon(`building`)}Supplier</a></div>`;
}
function Mt(e) {
  N = e;
  domQueryAll(`[data-sub]`, M).forEach((t) => {
    t.hidden = t.dataset.sub !== e;
  });
  if (!je.has(e)) {
    je.add(e);
    if (e === `orders`) {
      ot();
    } else if (e === `suppliers`) {
      yt();
    } else {
      kt();
    }
  }
  if (e === `orders`) {
    K = true;
    q(false);
    st();
  } else if (e === `suppliers`) {
    X(false);
    bt();
  } else {
    $(false);
    At();
  }
}
export const page = {
  title: (e) =>
    ({
      orders: `Purchase orders`,
      suppliers: `Suppliers`,
      materials: `Materials`,
    })[e[0] ?? ``] ?? `Purchasing`,
  mount(e) {
    M = e;
    M.innerHTML = Ae.map((e) => `<div data-sub="${e}" hidden></div>`).join(``);
    findLocationById(`pos`, () => {
      if (I(`orders`)) {
        q(true);
      } else if (I(`suppliers`)) {
        X(true);
      } else if (I(`materials`)) {
        $(true);
      }
      if (!M.hidden) {
        Re();
      }
    });
    findLocationById(`materials`, () => {
      if (I(`materials`)) {
        $(true);
      }
      if (!M.hidden) {
        Re();
      }
    });
    findLocationById(`suppliers`, () => {
      if (I(`suppliers`)) {
        X(true);
      } else if (I(`orders`)) {
        q(false);
      }
      if (!M.hidden) {
        Re();
      }
    });
  },
  enter({ params, same }) {
    let n = Ae.includes(params[0]) ? params[0] : `orders`;
    let r = params[1];
    if (!(same && n === N && je.has(n))) {
      Mt(n);
    }
    if (r) {
      Le(n, r);
    } else if (B) {
      closeDrawer();
    }
  },
  leave() {
    if (B) {
      closeDrawer();
    }
  },
};
