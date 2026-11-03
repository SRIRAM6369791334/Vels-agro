import {
  formatTime,
  escapeHtml,
  receiveTransfer,
  formatRelativeDay,
  store,
  showToast,
  closeDrawer,
  getActiveOrdersForLocation,
  ONE_DAY_MS,
  renderEmptyState,
  closeCurrentPopover,
  queryOne,
  animatePageTransition,
  domQuery,
  ONE_HOUR_MS,
  findProductById,
  formatProductFullName,
  cancelCount,
  renderAvatar,
  PO_STATUS_TONES,
  motionDuration,
  updateCountLine,
  renderTag,
  openDrawer,
  RETURN_REASONS,
  bindModalDismiss,
  getAvailableSuppliers,
  CARRIERS,
  animateWobble,
  formatRelativeTime,
  openMoveStockModal,
  formatInt,
  findLocationById,
  openNewTransferModal,
  animateRows,
  formatPercent,
  findMemberById,
  renderFilterBar,
  renderPagination,
  animateCards,
  exportDataBackup,
  formatMoneyRound,
  openScheduleCountModal,
  findMaterialById,
  pluralize,
  animatePop,
  gsap,
  renderPill,
  animateElementOut,
  domQueryAll,
  initLiftAnimations,
  renderIcon,
  bindMagnetic,
  isHoverCapable,
  renderPageHeader,
  completeCount,
  getLocationStockUnits,
  openNewBatchModal,
  renderProductThumb,
  STOCK_MOVE_REASON_NAMES,
} from "../../main.ts";
const De = [`locations`, `transfers`, `counts`];
let N;
let P = `locations`;
const F = new Set();
const I = (e) => domQuery(`[data-sub="${e}"]`, N);
const L = (e) => domQuery(`[data-k="${e}"]`, N);
const R = (e) => !!N && !N.hidden && P === e;
const Oe = {
  dc: [`warehouse`, `pine`],
  lab: [`flask`, `ocean`],
  shop: [`store`, `ochre`],
};
const ke = (e) => Oe[e?.kind ?? `dc`] ?? [`warehouse`, `pine`];
const Ae = (e, t = `md`) => {
  let [n, r] = ke(e);
  return renderTag(n, r, t);
};
function z(e, t, n) {
  let r = queryOne(`[data-stat="${t}"] [data-count]`, e);
  if (r && Number(r.dataset.count) !== n) {
    renderFilterBar(r, n);
    getAvailableSuppliers(r);
  }
}
function je(e, t, n) {
  let r = queryOne(`[data-stat="${t}"] .stat__suffix`, e);
  if (r) {
    r.textContent = n;
  }
}
function Me(e, t = 0.35) {
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
        delay: motionDuration(t + Math.min(n, 14) * 0.05),
        ease: `power3.inOut`,
      }
    );
  });
}
const B = (e) => {
  let t = formatRelativeDay(e);
  if (/^(Today|Tomorrow|Yesterday)$/.test(t)) {
    return t.toLowerCase();
  }
  return t;
};
const Ne = (e, n, r, i, a) =>
  `<button type="button" class="chip" ${n}="${e}" aria-pressed="${i}">${escapeHtml(r)}${a === undefined ? `` : ` <b data-n="${e}">${a}</b>`}</button>`;
const Pe = (e) => {
  if (e && !bindMagnetic()) {
    gsap.fromTo(
      e,
      {
        x: -8,
      },
      {
        x: 0,
        duration: 0.6,
        ease: `elastic.out(1, 0.3)`,
        clearProps: `transform`,
      }
    );
  }
};
let from = `dc`;
const Fe = {
  ambient: `pine`,
  cool: `sky`,
  quarantine: `ocean`,
  dispatch: `teal`,
};
const Ie = {
  ambient: `Ambient`,
  cool: `Cool`,
  quarantine: `Quarantine`,
  dispatch: `Dispatch`,
};
function Le(e) {
  let t = new Map();
  e.zones.forEach((e) =>
    t.set(
      e.id,
      Array.from(
        {
          length: e.bins,
        },
        (t, n) => ({
          code: `${e.id}-${String(n + 1).padStart(2, `0`)}`,
          n: n + 1,
          items: [],
          fill: 0,
          out: false,
        })
      )
    )
  );
  let n = (e, n, r, i = false) => {
    if (!e) {
      return;
    }
    let a = t.get(e);
    if (!a?.length) {
      return;
    }
    let o = a[(Math.max(1, n) - 1) % a.length];
    o.items.push(r);
    o.fill = Math.min(1, o.fill + r.fill);
    if (i) {
      o.out = true;
    }
  };
  let r = (t, n = ``) => e.zones.find((e) => e.kind === t && e.id !== n)?.id;
  let a = (e, t, n, r = ``) => ({
    name: formatProductFullName(e),
    sub: `${formatInt(t)} units${r}`,
    units: t,
    fill: Math.min(1, t / n),
    href: `/products/item/${e.id}`,
    p: e,
  });
  store.products.forEach((t, i) => {
    let o = t.stock[e.id] ?? 0;
    if (e.kind === `dc`) {
      let [e, r] = t.bin.split(`-`);
      if (o > 0 || t.active) {
        n(e, Number(r), a(t, o, t.reorderAt + t.reorderQty), o <= 0);
      }
    } else if (o > 0 && e.kind === `lab`) {
      n(r(`cool`), i + 1, a(t, o, 80, ` · finished goods`));
    } else if (o > 0 && e.kind === `shop`) {
      let r = Math.min(o, Math.ceil(o * 0.4));
      let s = o - r;
      let c = e.zones[0]?.id;
      let l = e.zones[1]?.id;
      n(c, (i % 10) + 1, a(t, r, 16, ` on the floor`));
      if (s > 0) {
        n(l, (i % 8) + 1, a(t, s, 40, ` in the back room`));
      }
    }
  });
  let o = store.materials.filter((t) => t.locId === e.id);
  [`Ingredient`, `Packaging`, `Shipping`].forEach((t) => {
    let i = o.filter((e) => e.kind === t);
    let a =
      e.kind === `lab`
        ? t === `Ingredient`
          ? e.zones.find((e) => e.id === `R`)?.id
          : e.zones.find((e) => e.id === `P`)?.id
        : r(`dispatch`);
    let s = e.zones.find((e) => e.id === a);
    i.forEach((e, r) =>
      n(a, s ? Math.floor((r * s.bins) / Math.max(1, i.length)) + 1 : r + 1, {
        name: e.name,
        sub: `${e.onHand} ${e.unit} · ${e.code}`,
        units: e.onHand,
        fill: Math.min(1, e.onHand / (e.reorderAt + e.reorderQty)),
        href: `/purchasing/materials/${e.id}`,
        ico: t === `Ingredient` ? `drop` : t === `Shipping` ? `box` : `layers`,
        tone: t === `Ingredient` ? `teal` : `ocean`,
      })
    );
  });
  store.batches
    .filter(
      (t) => t.locId === e.id && (t.status === `quarantine` || t.status === `hold`) && t.left > 0
    )
    .forEach((e, t) => {
      let i = findProductById(e.productId);
      if (i) {
        n(r(`quarantine`), t + 1, {
          name: formatProductFullName(i),
          sub: `Lot ${e.lot} · ${formatInt(e.left)} units · ${e.status === `hold` ? `on hold` : `in QA`}`,
          units: e.left,
          fill: Math.min(1, e.left / 600),
          href: `/products/batches/${e.id}`,
          p: i,
        });
      }
    });
  return t;
}
let H = new Map();
const Re = (e) => {
  let [t] = e.split(`-`);
  return H.get(t ?? ``)?.find((t) => t.code === e);
};
function ze(e) {
  let t = getLocationStockUnits(e.id);
  let used = 0;
  let total = 0;
  H.forEach((e) =>
    e.forEach((e) => {
      total++;
      if (e.items.some((e) => e.units > 0)) {
        used++;
      }
    })
  );
  let res = store.products.reduce(
    (acc, product) => acc + getActiveOrdersForLocation(product.id, e.id),
    0
  );
  return {
    units: t,
    cap: t / e.capacity,
    used,
    total,
    res,
  };
}
function Be() {
  let e = exportDataBackup(from);
  H = Le(e);
  let t = ze(e);
  let stats = [
    {
      key: `units`,
      icon: `boxes`,
      label: `Units here`,
      value: t.units,
      ico: `pine`,
    },
    {
      key: `cap`,
      icon: `warehouse`,
      label: `Capacity used`,
      value: t.cap,
      fmt: `pct`,
      ico: `teal`,
    },
    {
      key: `bins`,
      icon: `grid`,
      label: `Bins in use`,
      value: t.used,
      suffix: `of ${t.total}`,
      ico: `ocean`,
    },
    {
      key: `res`,
      icon: `orders`,
      label: `Promised to orders`,
      value: t.res,
      suffix: `units`,
      ico: `ochre`,
    },
  ];
  return `${renderPageHeader({
    eyebrow: `Where every jar, dropper and carton sits`,
    title: `Locations`,
    actions: `<button type="button" class="btn btn--primary magnetic" data-act="move">${renderIcon(`swap`)}Move stock</button>`,
    stats,
  })}
  <div class="wh-locs" data-k="locs" role="group" aria-label="Choose a location"></div>
  <div class="wh-grid">
    <div class="wh-main">
      <section class="card wh-map" aria-labelledby="wh-map-t">
        <header class="card__head"><div><h2 class="card__title" id="wh-map-t" data-k="map-title">Bin map</h2><p class="card__sub" data-k="map-sub"></p></div>
          <div class="card__tools"><div class="legend wh-legend"><span><i class="wh-sw wh-sw--0"></i>Empty</span><span><i class="wh-sw wh-sw--low"></i>Running low</span><span><i class="wh-sw wh-sw--1"></i>Part full</span><span><i class="wh-sw wh-sw--2"></i>Full</span><span><i class="wh-sw wh-sw--out"></i>Out</span></div></div></header>
        <div class="wh-zones" data-k="zones"></div>
        <div class="wh-tip" data-k="tip" aria-hidden="true"></div>
      </section>
      <section class="card wh-moves" aria-labelledby="wh-mv-t">
        <header class="card__head"><div><h2 class="card__title" id="wh-mv-t">Recent movements</h2><p class="card__sub">In and out of this site</p></div></header>
        <div class="rows wh-mvrows" data-k="moves"></div>
      </section>
    </div>
    <section class="card wh-stock" aria-labelledby="wh-st-t">
      <header class="card__head"><div><h2 class="card__title" id="wh-st-t">Stock here</h2><p class="card__sub" data-k="stock-sub"></p></div></header>
      <div class="wh-swrap"><table class="table wh-stable">
        <thead><tr><th scope="col">Product</th><th scope="col" class="r">On hand</th><th scope="col" class="r">Reserved</th><th scope="col" class="r">Free</th></tr></thead>
        <tbody data-k="stock"></tbody></table></div>
    </section>
  </div>`;
}
function Ve() {
  L(`locs`).innerHTML = store.locations
    .map((e) => {
      let n = getLocationStockUnits(e.id);
      let r = Math.min(1, n / e.capacity);
      let [, i] = ke(e);
      let a = findMemberById(e.managerId);
      return `<button type="button" class="wh-loc" data-loc="${e.id}" aria-pressed="${e.id === from}" style="--c:var(--${i})" data-lift>
      <span class="wh-loc__top">${Ae(e)}<span class="wh-loc__name"><b>${escapeHtml(e.name)}</b><small>${escapeHtml(e.city)}</small></span>${renderIcon(`check`, `wh-loc__check`)}</span>
      <span class="wh-loc__meta"><span>${renderIcon(`clock`)}${escapeHtml(e.hours)}</span><span class="wh-loc__mgr">${renderAvatar(e.managerId, `xs`)}${escapeHtml(a?.name ?? ``)}</span></span>
      <span class="wh-loc__fig"><b class="num">${formatInt(n)}</b><small>of ${formatInt(e.capacity)} units</small><em class="num">${formatPercent(r)}</em></span>
      <span class="meter"><span class="meter__fill" style="--c:var(--${i});transform:scaleX(${Math.max(0.02, r).toFixed(4)})"></span></span>
    </button>`;
    })
    .join(``);
  initLiftAnimations(L(`locs`));
}
function He(e, n) {
  let r = e.bins <= 12 ? e.bins : Math.ceil(e.bins / 2);
  let i = n.reduce(
    (acc, item) =>
      acc + item.items.reduce((acc_1, item_1) => acc_1 + (item_1.p ? item_1.units : 0), 0),
    0
  );
  let length = n.filter((e) => e.items.some((e) => e.units > 0)).length;
  return `<section class="wh-zone${e.bins >= 16 ? ` is-wide` : ``}" style="--c:var(--${Fe[e.kind]});--cols:${r};--cols-sm:${Math.min(r, 6)}" aria-label="${escapeHtml(e.name)}: ${length} of ${e.bins} bins in use">
    <header class="wh-zone__head"><b>${escapeHtml(e.name)}</b>${e.name.toLowerCase().includes(Ie[e.kind].toLowerCase()) ? `` : `<span class="wh-zone__kind">${escapeHtml(Ie[e.kind])}</span>`}<small>${length}/${e.bins} bins${i ? ` · ${formatInt(i)} units` : ``}</small></header>
    <div class="wh-bins">${n
      .map((e) => {
        let n = e.items.length > 0;
        let r =
          e.out && !e.items.some((e) => e.units > 0)
            ? `out`
            : n
              ? e.fill >= 0.66
                ? `full`
                : e.fill >= 0.25
                  ? `mid`
                  : `low`
              : `empty`;
        let i = n ? `${e.code}: ${e.items.map((e) => `${e.name}, ${e.sub}`).join(`; `)}` : ``;
        if (n) {
          return `<button type="button" class="wh-bin is-${r}" data-bin="${e.code}" style="--f:${e.fill.toFixed(3)}" aria-label="${escapeHtml(i)}"><span class="wh-bin__fill" style="transform:scaleY(${Math.max(0.06, e.fill).toFixed(3)})"></span><span class="wh-bin__n">${e.n}</span>${e.items.length > 1 ? `<i class="wh-bin__multi">${e.items.length}</i>` : ``}</button>`;
        }
        return `<span class="wh-bin is-empty" aria-hidden="true"><span class="wh-bin__n">${e.n}</span></span>`;
      })
      .join(``)}</div>
  </section>`;
}
function Ue() {
  let e = exportDataBackup(from);
  if (!e) {
    return;
  }
  H = Le(e);
  L(`map-title`).textContent = `${e.name} · bin map`;
  let t = ze(e);
  L(`map-sub`).textContent =
    `${pluralize(e.zones.length, `zone`)} · ${t.used} of ${t.total} bins in use · ${e.address}`;
  L(`zones`).innerHTML = e.zones.map((e) => He(e, H.get(e.id) ?? [])).join(``);
}
let U = null;
function We(e = 0) {
  let t = L(`zones`);
  let n = domQueryAll(`.wh-bin`, t);
  U?.kill();
  if (!n.length) {
    return;
  }
  let r = t.getBoundingClientRect();
  let i = Math.max(1, r.width);
  let a = Math.max(1, r.height);
  let o = n.map((e) => {
    let t = e.getBoundingClientRect();
    return ((t.left - r.left) / i) * 0.55 + ((t.top - r.top) / a) * 0.4;
  });
  U = gsap.timeline({
    delay: motionDuration(e),
  });
  U.fromTo(
    n,
    {
      opacity: 0,
      scale: 0.35,
      y: 10,
    },
    {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: motionDuration(0.55),
      ease: `back.out(2.2)`,
      delay: (e) => motionDuration(o[e] ?? 0),
      clearProps: `transform,opacity`,
    },
    0
  );
  let s = domQueryAll(`.wh-bin__fill`, t);
  U.fromTo(
    s,
    {
      scaleY: 0,
    },
    {
      scaleY: (e, t) => Number(/scaleY\(([\d.]+)\)/.exec(t.style.transform)?.[1] ?? 1),
      duration: motionDuration(0.8),
      ease: `power3.out`,
      delay: (e) => motionDuration(0.15 + (o[n.indexOf(s[e].parentElement)] ?? 0)),
    },
    0
  );
  animateRows(domQueryAll(`.wh-zone__head`, t), {
    y: 8,
    stagger: 0.05,
  });
}
function W(e) {
  let n = exportDataBackup(from);
  if (!n) {
    return;
  }
  let r = store.products
    .map((e) => ({
      p: e,
      on: e.stock[n.id] ?? 0,
      res: getActiveOrdersForLocation(e.id, n.id),
    }))
    .filter((e) => e.on > 0 || e.res > 0)
    .sort((e, t) => t.on - e.on);
  let a = (e) => {
    for (let [, t] of H) {
      let n = t.find((t) => t.items.some((t) => t.p === e && t.units > 0));
      if (n) {
        return n.code;
      }
    }
    return `—`;
  };
  L(`stock-sub`).textContent =
    `${pluralize(r.length, `product`)} · ${formatInt(r.reduce((acc, item) => acc + item.on, 0))} units`;
  let o = r.length
    ? r
        .map(({ p, on, res }) => {
          let o = on - res;
          return `<tr data-key="${p.id}">
      <td class="a-t"><a class="prod" href="/products/item/${p.id}">${renderProductThumb(p, `sm`)}<span><b>${escapeHtml(p.name)}</b><small>${escapeHtml(p.size)} · <span class="mono">${a(p)}</span></small></span></a></td>
      <td class="a-r r"><b class="num">${formatInt(on)}</b></td>
      <td class="a-s r"><span class="num ${res ? `` : `wh-dim`}">${res ? formatInt(res) : `—`}</span></td>
      <td class="a-p r"><b class="num ${o <= 0 ? `wh-bad` : o <= p.reorderAt / (n.kind === `dc` ? 1 : 6) ? `wh-warn` : ``}">${formatInt(o)}</b></td></tr>`;
        })
        .join(``)
    : `<tr><td colspan="4">${renderEmptyState(`Nothing stocked here`, `Move stock in from another site to fill these shelves.`, `box`, `<button type="button" class="btn btn--ghost btn--sm" data-act="move">${renderIcon(`swap`)}Move stock</button>`)}</td></tr>`;
  let c = L(`stock`);
  if (e) {
    bindModalDismiss(c, () => {
      c.innerHTML = o;
    });
  } else {
    c.innerHTML = o;
  }
}
function Ge(e) {
  let n = store.moves.filter((e) => e.locId === from).slice(0, 6);
  let r = n.length
    ? n
        .map((e) => {
          let n = findProductById(e.itemId);
          let r = n ? undefined : findMaterialById(e.itemId);
          return `<div class="row wh-mv" data-key="${e.id}">${n ? renderProductThumb(n, `sm`) : renderTag(`drop`, `ocean`, `sm`)}<span class="row__txt"><b>${escapeHtml(n ? formatProductFullName(n) : (r?.name ?? e.itemId))}</b><small>${escapeHtml(STOCK_MOVE_REASON_NAMES[e.kind])} · <span class="mono">${escapeHtml(e.ref)}</span></small></span><span class="row__end"><b class="${e.qty >= 0 ? `wh-up` : `wh-down`}">${e.qty >= 0 ? `+` : `−`}${formatInt(Math.abs(e.qty))}</b>${formatRelativeTime(e.at)}</span></div>`;
        })
        .join(``)
    : renderEmptyState(
        `No movements yet`,
        `Receipts, sales, transfers and counts at this site show here.`,
        `clock`
      );
  let a = L(`moves`);
  if (e) {
    bindModalDismiss(a, () => {
      a.innerHTML = r;
    });
  } else {
    a.innerHTML = r;
  }
}
function G() {
  let e = exportDataBackup(from);
  if (!e) {
    return;
  }
  let t = I(`locations`);
  let n = ze(e);
  z(t, `units`, n.units);
  z(t, `cap`, n.cap);
  z(t, `bins`, n.used);
  je(t, `bins`, `of ${n.total}`);
  z(t, `res`, n.res);
}
let Ke = 0;
function qe(e) {
  if (e === from || !exportDataBackup(e)) {
    return;
  }
  from = e;
  let t = ++Ke;
  domQueryAll(`.wh-loc`, I(`locations`)).forEach((t) =>
    t.setAttribute(`aria-pressed`, String(t.dataset.loc === e))
  );
  K();
  closeCurrentPopover();
  let n = domQueryAll(`.wh-bin, .wh-zone__head`, L(`zones`));
  let onComplete = () => {
    if (t === Ke) {
      Ue();
      G();
      W(false);
      Ge(false);
      We();
      animateRows(domQueryAll(`.wh-stock tbody tr, .wh-mv`, I(`locations`)).slice(0, 12), {
        y: 10,
        stagger: 0.035,
        delay: 0.1,
      });
    }
  };
  U?.kill();
  if (bindMagnetic() || !n.length) {
    onComplete();
    return;
  }
  gsap.to(n, {
    opacity: 0,
    scale: 0.6,
    duration: 0.22,
    ease: `power2.in`,
    stagger: {
      each: 0.003,
      from: `end`,
    },
    onComplete,
    overwrite: true,
  });
}
function Je(e) {
  return `<b>Bin ${escapeHtml(e.code)}</b>${e.items.map((e) => `<span>${e.p ? renderProductThumb(e.p, `sm`) : renderTag(e.ico ?? `drop`, e.tone ?? `teal`, `sm`)}<span><em>${escapeHtml(e.name)}</em><small>${escapeHtml(e.sub)}</small></span></span>`).join(``)}`;
}
function Ye(e) {
  let t = Re(e.dataset.bin ?? ``);
  if (!t) {
    return;
  }
  let n = L(`tip`);
  let r = e.closest(`.wh-map`);
  n.innerHTML = Je(t);
  let i = r.getBoundingClientRect();
  let a = e.getBoundingClientRect();
  let n_offsetWidth = n.offsetWidth;
  let n_offsetHeight = n.offsetHeight;
  let c = a.left - i.left + a.width / 2 - n_offsetWidth / 2;
  c = Math.max(10, Math.min(i.width - n_offsetWidth - 10, c));
  let l = a.top - i.top - n_offsetHeight - 10 > 0;
  n.style.left = `${c}px`;
  n.style.top = `${l ? a.top - i.top - n_offsetHeight - 10 : a.bottom - i.top + 10}px`;
  gsap.killTweensOf(n);
  gsap.fromTo(
    n,
    {
      opacity: 0,
      y: l ? 6 : -6,
    },
    {
      opacity: 1,
      y: 0,
      duration: motionDuration(0.2),
      ease: `power3.out`,
    }
  );
}
function K() {
  let e = queryOne(`[data-k="tip"]`, N);
  if (e) {
    gsap.to(e, {
      opacity: 0,
      duration: motionDuration(0.12),
      overwrite: true,
    });
  }
}
function Xe(e) {
  let n = Re(e.dataset.bin ?? ``);
  if (!n) {
    return;
  }
  let r = exportDataBackup(from)?.zones.find((e) => n.code.startsWith(`${e.id}-`));
  renderPagination(
    e,
    `<div class="pop__head"><span class="pop__title">Bin ${escapeHtml(n.code)}</span><small class="wh-dim">${escapeHtml(r?.name ?? ``)}</small></div>
    <div class="pop__list">${n.items.map((e) => `<a class="pop__row" href="${e.href}">${e.p ? renderProductThumb(e.p, `sm`) : renderTag(e.ico ?? `drop`, e.tone ?? `teal`, `sm`)}<span><b>${escapeHtml(e.name)}</b><small>${escapeHtml(e.sub)}</small></span></a>`).join(``)}</div>`,
    {
      label: `Bin ${n.code}`,
      align: `center`,
      cls: `wh-pop`,
    }
  );
}
function Ze() {
  let e = I(`locations`);
  e.innerHTML = Be();
  openMoveStockModal(e);
  let t = L(`zones`);
  t.addEventListener(`pointerover`, (e) => {
    if (!isHoverCapable.matches) {
      return;
    }
    let t = e.target.closest(`.wh-bin[data-bin]`);
    if (t) {
      Ye(t);
    }
  });
  t.addEventListener(`pointerout`, (e) => {
    let t = e.target.closest(`.wh-bin[data-bin]`);
    let e_relatedTarget = e.relatedTarget;
    if (t && !(e_relatedTarget && t.contains(e_relatedTarget))) {
      K();
    }
  });
  t.addEventListener(`focusin`, (e) => {
    let t = e.target.closest(`.wh-bin[data-bin]`);
    if (t && isHoverCapable.matches) {
      Ye(t);
    }
  });
  t.addEventListener(`focusout`, K);
  t.addEventListener(`click`, (e) => {
    let t = e.target.closest(`.wh-bin[data-bin]`);
    if (!t) {
      return;
    }
    openNewTransferModal(t);
    let n = Re(t.dataset.bin ?? ``);
    if (n) {
      K();
      if (isHoverCapable.matches && n.items.length === 1 && n.items[0]) {
        (window as any).navigateTo(n.items[0].href)
        return;
      }
      Xe(t);
    }
  });
  e.addEventListener(`click`, (e) => {
    let e_target = e.target;
    let n = e_target.closest(`.wh-loc`);
    if (n) {
      openNewTransferModal(n);
      if (n.dataset.loc !== from) {
        (window as any).navigateTo(`/warehouses/locations/${n.dataset.loc}`)
      }
      return;
    }
    let r = e_target.closest(`[data-act="move"]`);
    if (r) {
      openNewTransferModal(r);
      openNewBatchModal(
        {
          from,
          to: from === `shop` ? `dc` : `shop`,
        },
        r
      );
    }
  });
}
function Qe() {
  let e = I(`locations`);
  animatePageTransition(e);
  animateWobble(domQueryAll(`.wh-loc`, e), {
    delay: 0.1,
    stagger: 0.08,
  });
  Me(domQueryAll(`.wh-loc .meter__fill`, e), 0.45);
  animateCards(domQueryAll(`.wh-grid .card`, e), {
    stagger: 0.08,
    delay: 0.25,
  });
  We(0.45);
  animateRows(domQueryAll(`.wh-stock tbody tr, .wh-mv`, e).slice(0, 12), {
    y: 10,
    stagger: 0.035,
    delay: 0.55,
  });
}
function $e(e) {
  Ve();
  G();
  Ue();
  W(e);
  Ge(e);
}
let q = `all`;
const J = [];
const et = (e) => e.lines.reduce((acc, line) => acc + line.qty, 0);
function tt() {
  let e = store.transfers.filter((e) => e.status === `in-transit`);
  let t = store.transfers.filter((e) => e.status === `received` && e.receivedAt);
  let n = t.filter((e) => (e.receivedAt ?? 0) >= Date.now() - 30 * ONE_DAY_MS);
  return {
    road: e.reduce((acc, item) => acc + et(item), 0),
    planned: store.transfers.filter((e) => e.status === `planned`).length,
    recUnits: n.reduce((acc, item) => acc + et(item), 0),
    hours: t.length
      ? Math.round(
          t.reduce((acc, item) => acc + ((item.receivedAt ?? item.createdAt) - item.createdAt), 0) /
            t.length /
            ONE_HOUR_MS
        )
      : 0,
  };
}
function nt() {
  let e = tt();
  return `${renderPageHeader({
    eyebrow: `Stock moving between the lab, the DC and the shop`,
    title: `Transfers`,
    actions: `<button type="button" class="btn btn--primary magnetic" data-act="move">${renderIcon(`swap`)}Move stock</button>`,
    stats: [
      {
        key: `road`,
        icon: `truck`,
        label: `On the road`,
        value: e.road,
        suffix: `units`,
        ico: `ochre`,
      },
      {
        key: `planned`,
        icon: `calendar`,
        label: `Planned`,
        value: e.planned,
        suffix: `transfers`,
        ico: `sky`,
      },
      {
        key: `rec`,
        icon: `check`,
        label: `Received, 30 days`,
        value: e.recUnits,
        suffix: `units`,
        ico: `sage`,
      },
      {
        key: `hours`,
        icon: `timer`,
        label: `Average time on the road`,
        value: e.hours,
        suffix: `h`,
        ico: `ocean`,
      },
    ],
  })}
  <div class="toolbar"><div class="chips" data-k="tr-chips" role="group" aria-label="Filter by status">${[
    [`all`, `All`],
    [`planned`, CARRIERS.planned],
    [`in-transit`, CARRIERS[`in-transit`]],
    [`received`, CARRIERS.received],
  ]
    .map(([e, t]) => Ne(e, `data-trf`, t, e === q, 0))
    .join(``)}</div></div>
  <div class="wh-trs" data-k="tr-list"></div>`;
}
function rt(n) {
  let r = exportDataBackup(n.from);
  let i = exportDataBackup(n.to);
  let a = n.status === `in-transit`;
  let o = a
    ? Math.max(
        0.08,
        Math.min(0.92, (Date.now() - n.createdAt) / Math.max(ONE_HOUR_MS, n.eta - n.createdAt))
      )
    : 0;
  let s = a && n.eta < Date.now();
  let c = (e, n) =>
    `<span class="wh-route__end wh-route__end--${n}">${Ae(e, `sm`)}<span><b>${escapeHtml(e?.name ?? ``)}</b><small>${escapeHtml(e?.city ?? ``)}</small></span></span>`;
  return `<article class="card wh-tr is-${n.status}" data-key="${n.id}" data-tr="${n.id}" style="--c:var(--${RETURN_REASONS[n.status] === `faint` ? `slate` : RETURN_REASONS[n.status]})">
    <header class="wh-tr__head"><span class="wh-tr__no"><b class="mono">${escapeHtml(n.number)}</b><small>Planned ${B(n.createdAt)} ${formatTime(n.createdAt)} by ${escapeHtml(findMemberById(n.byId)?.name ?? ``)}</small></span>${s ? renderPill(`Running late`, `rose`, `clock`) : renderPill(CARRIERS[n.status], RETURN_REASONS[n.status])}</header>
    <div class="wh-route">${c(r, `from`)}
      <span class="wh-route__line" aria-hidden="true"><span class="wh-route__draw"><svg class="wh-route__svg" width="100%" height="12"><line x1="4" y1="6" x2="100%" y2="6" class="wh-route__track"/><line x1="4" y1="6" x2="100%" y2="6" class="wh-route__dash"/></svg></span>
        <span class="wh-route__truck" style="left:${(o * 100).toFixed(1)}%">${renderIcon(`truck`)}</span></span>
      ${c(i, `to`)}</div>
    <ul class="wh-tr__lines">${n.lines
      .map((e) => {
        let n = findProductById(e.productId);
        if (n) {
          return `<li><a href="/products/item/${n.id}">${renderProductThumb(n, `sm`)}<span><b>${escapeHtml(n.name)}</b><small>${escapeHtml(n.size)}</small></span><em class="num">× ${formatInt(e.qty)}</em></a></li>`;
        }
        return ``;
      })
      .join(``)}</ul>
    <footer class="wh-tr__foot"><span class="wh-tr__eta">${renderIcon(`clock`)}<span><b>${a ? (s ? `Was due ${formatTime(n.eta)}` : `Arrives ${B(n.eta)}, ${formatTime(n.eta)}`) : `Leaves when dispatched · ETA ${B(n.eta)}`}</b><small>${pluralize(et(n), `unit`)} · ${pluralize(n.lines.length, `line`)}</small></span></span>
      <button type="button" class="btn btn--primary btn--sm" data-step="${n.id}">${a ? `${renderIcon(`check`)}Receive` : `${renderIcon(`truck`)}Dispatch`}</button></footer>
  </article>`;
}
function it(n) {
  let r = exportDataBackup(n.from);
  let i = exportDataBackup(n.to);
  return `<div class="row wh-hist" data-key="h-${n.id}">${renderTag(`check`, `sage`, `sm`)}<span class="row__txt"><b><span class="mono">${escapeHtml(n.number)}</span> · ${escapeHtml(r?.name ?? ``)} ${renderIcon(`chevR`, `wh-arrow`)} ${escapeHtml(i?.name ?? ``)}</b><small>${pluralize(et(n), `unit`)} · received ${n.receivedAt ? `${B(n.receivedAt)} ${formatTime(n.receivedAt)}` : ``} · ${escapeHtml(findMemberById(n.byId)?.name ?? ``)}</small></span>
    <span class="wh-hist__thumbs">${n.lines
      .slice(0, 3)
      .map((e) => {
        let t = findProductById(e.productId);
        if (t) {
          return renderProductThumb(t, `sm`);
        }
        return ``;
      })
      .join(``)}</span></div>`;
}
function at(e) {
  J.splice(0).forEach((e) => e.kill());
  if (!bindMagnetic()) {
    domQueryAll(`.wh-tr.is-in-transit .wh-route__dash`, e).forEach((e) => {
      J.push(
        gsap.fromTo(
          e,
          {
            attr: {
              "stroke-dashoffset": 0,
            },
          },
          {
            attr: {
              "stroke-dashoffset": -12,
            },
            duration: 0.7,
            ease: `none`,
            repeat: -1,
          }
        )
      );
    });
    domQueryAll(`.wh-tr.is-in-transit .wh-route__truck .ico`, e).forEach((e) => {
      J.push(
        gsap.to(e, {
          y: -1.5,
          duration: 0.32,
          ease: `sine.inOut`,
          yoyo: true,
          repeat: -1,
        })
      );
    });
  }
}
function ot(e) {
  let t = I(`transfers`);
  let n = tt();
  z(t, `road`, n.road);
  z(t, `planned`, n.planned);
  z(t, `rec`, n.recUnits);
  z(t, `hours`, n.hours);
  let r = {
    all: store.transfers.length,
  };
  store.transfers.forEach((e) => {
    r[e.status] = (r[e.status] ?? 0) + 1;
  });
  domQueryAll(`[data-n]`, L(`tr-chips`)).forEach((e) => {
    e.textContent = String(r[e.dataset.n] ?? 0);
  });
  let a = store.transfers
    .filter((e) => e.status !== `received` && (q === `all` || e.status === q))
    .sort((e, t) => {
      if (e.status === t.status) {
        return e.eta - t.eta;
      }
      if (e.status === `in-transit`) {
        return -1;
      }
      return 1;
    });
  let o =
    q === `all` || q === `received`
      ? store.transfers
          .filter((e) => e.status === `received`)
          .sort((e, t) => (t.receivedAt ?? 0) - (e.receivedAt ?? 0))
      : [];
  let s = q !== `received` && !a.length;
  let c = `${a.map(rt).join(``)}
    ${s ? `<div class="card wh-trempty" data-key="empty-a">${renderEmptyState(q === `all` ? `Nothing on the road` : `No ${CARRIERS[q].toLowerCase()} transfers`, q === `all` ? `Every transfer has landed. Plan one to restock the shop or pull finished goods from the lab.` : `Try another status.`, `truck`, `<button type="button" class="btn btn--primary btn--sm" data-act="move">${renderIcon(`swap`)}Move stock</button>`)}</div>` : ``}
    ${o.length ? `<section class="card wh-histcard" data-key="hist" aria-labelledby="wh-h-t"><header class="card__head"><div><h2 class="card__title" id="wh-h-t">Received <span class="wh-count">${o.length}</span></h2><p class="card__sub">Landed and on the shelves</p></div></header><div class="rows">${o.slice(0, 12).map(it).join(``)}</div></section>` : q === `received` ? `<div class="card wh-trempty" data-key="empty-h">${renderEmptyState(`Nothing received yet`, `Transfers land here once they are received at the other end.`, `check`)}</div>` : ``}`;
  let u = L(`tr-list`);
  if (e) {
    bindModalDismiss(u, () => {
      u.innerHTML = c;
    });
  } else {
    u.innerHTML = c;
  }
  at(u);
}
function st() {
  let e = I(`transfers`);
  e.innerHTML = nt();
  openMoveStockModal(e);
  L(`tr-chips`).addEventListener(`click`, (e) => {
    let t = e.target.closest(`[data-trf]`);
    if (t) {
      openNewTransferModal(t);
      q = t.dataset.trf;
      domQueryAll(`[data-trf]`, L(`tr-chips`)).forEach((e) =>
        e.setAttribute(`aria-pressed`, String(e === t))
      );
      ot(true);
    }
  });
  e.addEventListener(`click`, (t) => {
    let t_target = t.target;
    let o = t_target.closest(`[data-act="move"]`);
    if (o) {
      openNewTransferModal(o);
      openNewBatchModal({}, o);
      return;
    }
    let s = t_target.closest(`[data-step]`);
    if (!s) {
      return;
    }
    openNewTransferModal(s);
    let c = store.transfers.find((e) => e.id === s.dataset.step);
    if (!c) {
      return;
    }
    let l = s.closest(`.wh-tr`);
    if (c.status === `in-transit` && l) {
      s.setAttribute(`disabled`, ``);
      animateElementOut(l, () => {
        receiveTransfer(c.id);
      });
      return;
    }
    let u = receiveTransfer(c.id);
    if (u) {
      showToast(u, {
        ico: `alert`,
      });
      Pe(l);
      return;
    }
    let f = queryOne(`[data-tr="${c.id}"]`, e);
    if (f) {
      gsap.fromTo(
        domQuery(`.wh-route__draw`, f),
        {
          scaleX: 0,
        },
        {
          scaleX: 1,
          transformOrigin: `0 50%`,
          duration: motionDuration(0.8),
          ease: `power3.inOut`,
          clearProps: `transform`,
        }
      );
      animatePop(domQuery(`.wh-route__truck`, f), {
        from: 0.2,
        delay: 0.3,
      });
    }
  });
}
function ct() {
  let e = I(`transfers`);
  animatePageTransition(e);
  animateRows(domQueryAll(`.toolbar .chip`, e), {
    y: 8,
    stagger: 0.04,
    delay: 0.15,
  });
  animateCards(domQueryAll(`.wh-tr, .wh-histcard, .wh-trempty`, e), {
    stagger: 0.08,
    delay: 0.2,
  });
  domQueryAll(`.wh-route__draw`, e).forEach((e, t) =>
    gsap.fromTo(
      e,
      {
        scaleX: 0,
      },
      {
        scaleX: 1,
        transformOrigin: `0 50%`,
        duration: motionDuration(0.9),
        delay: motionDuration(0.45 + t * 0.1),
        ease: `power3.inOut`,
        clearProps: `transform`,
      }
    )
  );
  animatePop(domQueryAll(`.wh-route__truck`, e), {
    from: 0.2,
    delay: motionDuration(0.9),
    stagger: 0.1,
  });
  animateRows(domQueryAll(`.wh-tr__lines li, .wh-hist`, e).slice(0, 16), {
    y: 8,
    stagger: 0.03,
    delay: 0.5,
  });
}
let Y = `all`;
let X = null;
let Z = false;
let lt = false;
const ut = {
  scheduled: `sky`,
  counting: `ocean`,
  done: `sage`,
};
const dt = (e) => e.lines.filter((e) => e.counted !== null).length;
const ft = (e) => {
  if (e.counted === null) {
    return null;
  }
  return e.counted - e.expected;
};
function Q(e) {
  let over = 0;
  let under = 0;
  let r = 0;
  let matched = 0;
  e.lines.forEach((e) => {
    let a = ft(e);
    if (a !== null) {
      if (a > 0) {
        over += a;
      } else if (a < 0) {
        under -= a;
      } else {
        matched++;
      }
      r += a * (findProductById(e.productId)?.cost ?? 0);
    }
  });
  return {
    over,
    under,
    net: over - under,
    value: r,
    matched,
  };
}
function pt(e) {
  switch (e) {
    case null:
      return `<span class="wh-var is-none">Not counted</span>`;
    case 0:
      return `<span class="wh-var is-ok">${renderIcon(`check`)}Match</span>`;
    default:
      return `<span class="wh-var ${Math.abs(e) <= 2 ? `is-warn` : `is-bad`}">${e > 0 ? `+` : `−`}${Math.abs(e)}</span>`;
  }
}
const mt = (e) =>
  exportDataBackup(e.locId)?.zones.find((t) => t.id === e.zone)?.name ?? `Zone ${e.zone}`;
function ht() {
  let e = store.counts.filter((e) => e.status === `done` && e.at >= Date.now() - 60 * 86400000);
  let t = e.reduce((acc, item) => acc + item.lines.length, 0);
  let n = e.reduce((acc, item) => acc + Q(item).matched, 0);
  return {
    sched: store.counts.filter((e) => e.status === `scheduled`).length,
    counting: store.counts.filter((e) => e.status === `counting`).length,
    acc: t ? n / t : 1,
    fixed: e.reduce((acc, item) => {
      let n = Q(item);
      return acc + n.over + n.under;
    }, 0),
  };
}
function gt() {
  let e = ht();
  return `${renderPageHeader({
    eyebrow: `Shelf by shelf, the stock on file meets the stock on the shelf`,
    title: `Cycle counts`,
    actions: `<button type="button" class="btn btn--primary magnetic" data-act="newcount">${renderIcon(`plus`)}New count</button>`,
    stats: [
      {
        key: `sched`,
        icon: `calendar`,
        label: `Scheduled`,
        value: e.sched,
        ico: `sky`,
      },
      {
        key: `counting`,
        icon: `clipboard`,
        label: `In progress`,
        value: e.counting,
        ico: `ocean`,
      },
      {
        key: `acc`,
        icon: `shield`,
        label: `Lines matched, 60 days`,
        value: e.acc,
        fmt: `pct`,
        ico: `sage`,
      },
      {
        key: `fixed`,
        icon: `refresh`,
        label: `Units corrected`,
        value: e.fixed,
        ico: `ochre`,
      },
    ],
  })}
  <section class="card tcard wh-counts" aria-label="Cycle counts">
    <div class="toolbar"><div class="chips" data-k="ct-chips" role="group" aria-label="Filter by status">${[
      [`all`, `All`],
      [`scheduled`, PO_STATUS_TONES.scheduled],
      [`counting`, PO_STATUS_TONES.counting],
      [`done`, PO_STATUS_TONES.done],
    ]
      .map(([e, t]) => Ne(e, `data-ctf`, t, e === Y, 0))
      .join(``)}</div></div>
    <div class="table-wrap"><table class="table table--stack wh-ctable" style="--areas:'t p' 's r' 'm x'">
      <thead><tr><th scope="col">Count</th><th scope="col">Counter</th><th scope="col">When</th><th scope="col">Lines</th><th scope="col" class="r">Variance</th><th scope="col">Status</th><th scope="col"><span class="sr">Action</span></th></tr></thead>
      <tbody data-k="ct-rows"></tbody></table></div>
  </section>`;
}
function _t(n) {
  let i = exportDataBackup(n.locId);
  let a = dt(n);
  let o = Q(n);
  let s = n.lines.length ? a / n.lines.length : 0;
  let c =
    n.status === `scheduled`
      ? `<button type="button" class="btn btn--soft btn--xs" data-start="${n.id}">${renderIcon(`play`)}Start count</button>`
      : n.status === `counting`
        ? `<a class="btn btn--primary btn--xs" href="/warehouses/counts/${n.id}">${renderIcon(`clipboard`)}Count sheet</a>`
        : `<a class="btn btn--ghost btn--xs" href="/warehouses/counts/${n.id}">Results${renderIcon(`chevR`)}</a>`;
  return `<tr class="is-link" data-key="${n.id}" data-ct="${n.id}" tabindex="0" aria-label="${escapeHtml(n.number)}">
    <td class="a-t"><span class="wh-ctname">${Ae(i, `sm`)}<span><b class="mono">${escapeHtml(n.number)}</b><small>${escapeHtml(i?.name ?? ``)} · ${escapeHtml(mt(n))}</small></span></span></td>
    <td class="a-s"><span class="wh-who">${renderAvatar(n.byId, `xs`)}<span>${escapeHtml(findMemberById(n.byId)?.name ?? ``)}<small class="wh-stackonly"> · ${escapeHtml(formatRelativeDay(n.at))}</small></span></span></td>
    <td class="a-h"><b class="wh-when">${escapeHtml(formatRelativeDay(n.at))}</b><small class="wh-dim">${formatTime(n.at)}</small></td>
    <td class="a-m"><span class="wh-ctlines"><span class="num">${n.status === `scheduled` ? pluralize(n.lines.length, `line`) : `${a}/${n.lines.length} counted`}</span>${n.status === `scheduled` ? `` : `<span class="meter"><span class="meter__fill" style="--c:var(--${ut[n.status]});transform:scaleX(${Math.max(0.02, s).toFixed(4)})"></span></span>`}</span></td>
    <td class="a-r r">${n.status === `done` ? (o.over + o.under ? `<span class="wh-varsum"><b class="num ${Math.abs(o.net) > 2 ? `wh-bad` : `wh-warn`}">${o.net > 0 ? `+` : o.net < 0 ? `−` : `±`}${Math.abs(o.net) || o.over + o.under}</b><small>${formatMoneyRound(Math.abs(o.value))} at cost</small></span>` : `<span class="wh-var is-ok">${renderIcon(`check`)}No variance</span>`) : n.status === `counting` && a ? `<span class="wh-varsum"><b class="num wh-dim">${o.net > 0 ? `+` : o.net < 0 ? `−` : `±`}${Math.abs(o.net)}</b><small>so far</small></span>` : `<span class="wh-dim">—</span>`}</td>
    <td class="a-p">${renderPill(PO_STATUS_TONES[n.status], ut[n.status])}</td>
    <td class="a-x r">${c}</td>
  </tr>`;
}
function $(e) {
  let t = I(`counts`);
  let n = ht();
  z(t, `sched`, n.sched);
  z(t, `counting`, n.counting);
  z(t, `acc`, n.acc);
  z(t, `fixed`, n.fixed);
  let r = {
    all: store.counts.length,
  };
  store.counts.forEach((e) => {
    r[e.status] = (r[e.status] ?? 0) + 1;
  });
  domQueryAll(`[data-n]`, L(`ct-chips`)).forEach((e) => {
    e.textContent = String(r[e.dataset.n] ?? 0);
  });
  let a = {
    counting: 0,
    scheduled: 1,
    done: 2,
  };
  let o = store.counts
    .filter((e) => Y === `all` || e.status === Y)
    .sort((e, t) => a[e.status] - a[t.status] || (e.status === `done` ? t.at - e.at : e.at - t.at));
  let s = o.length
    ? o.map(_t).join(``)
    : `<tr><td colspan="7">${store.counts.length ? renderEmptyState(`No ${PO_STATUS_TONES[Y]?.toLowerCase() ?? ``} counts`, `Try another status.`, `clipboard`, `<button type="button" class="btn btn--ghost btn--sm" data-clear="ct">Show every count</button>`) : renderEmptyState(`No counts yet`, `Schedule a cycle count to check a zone’s shelves against the books.`, `clipCheck`, `<button type="button" class="btn btn--primary btn--sm" data-act="newcount">${renderIcon(`plus`)}New count</button>`)}</td></tr>`;
  let c = L(`ct-rows`);
  if (e) {
    bindModalDismiss(c, () => {
      c.innerHTML = s;
    });
  } else {
    c.innerHTML = s;
  }
}
function vt() {
  let e = I(`counts`);
  e.innerHTML = gt();
  openMoveStockModal(e);
  L(`ct-chips`).addEventListener(`click`, (e) => {
    let t = e.target.closest(`[data-ctf]`);
    if (t) {
      openNewTransferModal(t);
      Y = t.dataset.ctf;
      domQueryAll(`[data-ctf]`, L(`ct-chips`)).forEach((e) =>
        e.setAttribute(`aria-pressed`, String(e === t))
      );
      $(true);
    }
  });
  e.addEventListener(`click`, (e) => {
    let e_target = e.target;
    let n = e_target.closest(`[data-act="newcount"]`);
    if (n) {
      openNewTransferModal(n);
      openScheduleCountModal(n);
      return;
    }
    if (e_target.closest(`[data-clear]`)) {
      Y = `all`;
      domQueryAll(`[data-ctf]`, L(`ct-chips`)).forEach((e) =>
        e.setAttribute(`aria-pressed`, String(e.getAttribute(`data-ctf`) === `all`))
      );
      $(true);
      return;
    }
    let r = e_target.closest(`[data-start]`);
    if (r) {
      openNewTransferModal(r);
      cancelCount(r.dataset.start);
      showToast(`Count started — the sheet is open`, {
        ico: `clipboard`,
      });
      (window as any).navigateTo(`/warehouses/counts/${r.dataset.start}`)
      return;
    }
    if (e_target.closest(`a, button`)) {
      return;
    }
    let i = e_target.closest(`[data-ct]`);
    if (i) {
      (window as any).navigateTo(`/warehouses/counts/${i.dataset.ct}`)
    }
  });
  e.addEventListener(`keydown`, (e) => {
    let t = e.target.closest?.(`tr[data-ct]`);
    if (t && e.target === t && (e.key === `Enter` || e.key === ` `)) {
      e.preventDefault();
      (window as any).navigateTo(`/warehouses/counts/${t.dataset.ct}`)
    }
  });
}
function yt() {
  let e = I(`counts`);
  animatePageTransition(e);
  animateCards(domQueryAll(`.wh-counts`, e), {
    delay: 0.15,
  });
  animateRows(domQueryAll(`.toolbar .chip`, e), {
    y: 8,
    stagger: 0.04,
    delay: 0.3,
  });
  animateRows(domQueryAll(`.wh-ctable tbody tr`, e), {
    y: 10,
    stagger: 0.05,
    delay: 0.35,
  });
  Me(domQueryAll(`.wh-ctable .meter__fill`, e), 0.6);
}
const bt = (e, counted, r) =>
  `<span class="stepper"><button type="button" class="ibtn ibtn--sm" data-step="-1" aria-label="One less ${escapeHtml(r)}" title="One less">${renderIcon(`minus`)}</button><input class="stepper__in num" type="number" inputmode="numeric" min="0" value="${counted ?? ``}" placeholder="–" data-pid="${e}" aria-label="Counted: ${escapeHtml(r)}" /><button type="button" class="ibtn ibtn--sm" data-step="1" aria-label="One more ${escapeHtml(r)}" title="One more">${renderIcon(`plus`)}</button></span>`;
function xt(n) {
  let i = exportDataBackup(n.locId);
  let a = dt(n);
  let o = Q(n);
  let s = n.lines.length ? a / n.lines.length : 0;
  let c = n.status === `done`;
  let l = n.status === `scheduled`;
  let u = n.lines
    .map((e) => {
      let n = findProductById(e.productId);
      if (!n) {
        return ``;
      }
      let r = ft(e);
      return `<div class="row wh-cl${e.counted === null && !l ? ` is-open` : ``}" data-line="${n.id}">
      ${renderProductThumb(n, `md`)}<span class="row__txt"><b>${escapeHtml(n.name)}</b><small>${escapeHtml(n.size)} · <span class="mono">${escapeHtml(n.sku)}</span></small></span>
      <span class="wh-cl__exp" data-exp><small>Expected</small><b class="num">${Z || c ? formatInt(e.expected) : `•••`}</b></span>
      <span class="wh-cl__in">${c ? `<span class="wh-cl__got"><small>Counted</small><b class="num">${formatInt(e.counted ?? e.expected)}</b></span>` : l ? `<span class="wh-dim">Starts with the count</span>` : bt(n.id, e.counted, formatProductFullName(n))}</span>
      <span class="wh-cl__var" data-var>${l ? `` : pt(r)}</span>
    </div>`;
    })
    .join(``);
  let d = ut[n.status];
  return `<header class="d-head">${renderTag(`clipCheck`, d)}<div><h2><span class="mono">${escapeHtml(n.number)}</span></h2><small>${escapeHtml(i?.name ?? ``)} · ${escapeHtml(mt(n))} · counted by ${escapeHtml(findMemberById(n.byId)?.name ?? ``)}</small></div></header>
    <div class="d-pills">${renderPill(PO_STATUS_TONES[n.status], d)}${renderPill(`${formatRelativeDay(n.at)} · ${formatTime(n.at)}`, `faint`, `calendar`)}${renderPill(pluralize(n.lines.length, `line`), `faint`, `list`)}</div>
    ${
      c
        ? `<div class="d-facts">
        <div><small>Lines matched</small><b class="num">${o.matched} <span>of ${n.lines.length}</span></b><span>${formatPercent(n.lines.length ? o.matched / n.lines.length : 1)} accurate</span></div>
        <div><small>Net variance</small><b class="num ${o.net ? (Math.abs(o.net) > 2 ? `wh-bad` : `wh-warn`) : `wh-good`}">${o.net > 0 ? `+` : o.net < 0 ? `−` : ``}${Math.abs(o.net)} <span>units</span></b><span>${formatMoneyRound(Math.abs(o.value))} at cost</span></div>
        <div><small>Found extra</small><b class="num">${o.over}</b><span>units over the books</span></div>
        <div><small>Missing</small><b class="num">${o.under}</b><span>units under the books</span></div>
      </div>`
        : `<div class="wh-prog"><div class="wh-prog__top"><b data-prog-t>${a} of ${pluralize(n.lines.length, `line`)} counted</b><span data-prog-v class="wh-dim">${a ? `net ${o.net > 0 ? `+` : o.net < 0 ? `−` : `±`}${Math.abs(o.net)} so far` : l ? `Not started` : `Start with any shelf`}</span></div>
        <span class="meter"><span class="meter__fill" data-prog style="--c:var(--ocean);transform:scaleX(${Math.max(0.02, s).toFixed(4)})"></span></span></div>`
    }
    ${c ? `` : `<label class="wh-reveal"><span><b>Show expected quantities</b><small>Counting blind keeps the count honest — reveal once you’re done.</small></span><button type="button" class="switch" role="switch" aria-checked="${Z}" data-reveal aria-label="Show expected quantities"></button></label>`}
    <section class="d-sec"><h3>Count sheet</h3><div class="rows wh-sheet">${u}</div></section>
    <p class="note note--warn wh-err" data-err hidden>${renderIcon(`alert`)}<span></span></p>
    <div class="d-actions">${l ? `<button type="button" class="btn btn--primary btn--sm" data-sheet="start">${renderIcon(`play`)}Start count</button>` : c ? `<a class="btn btn--ghost btn--sm" href="/warehouses/locations/${n.locId}">${renderIcon(`warehouse`)}${escapeHtml(i?.name ?? `Location`)}</a>` : `<button type="button" class="btn btn--primary btn--sm" data-sheet="finish">${renderIcon(`check`)}Finish count</button><span class="wh-dim wh-hint" data-left>${n.lines.length - a ? `${pluralize(n.lines.length - a, `line`)} to go` : `Every line counted`}</span>`}</div>`;
}
function St(e) {
  let t = store.counts.find((t) => t.id === e);
  if (!t) {
    showToast(`That count isn’t here any more`, {
      ico: `info`,
    });
    history.replaceState(null, ``, `/warehouses/counts`);
    return;
  }
  if (X === e && queryOne(`#drawer`)?.hasAttribute(`open`)) {
    return;
  }
  X = e;
  openDrawer(xt(t), {
    label: `Count sheet ${t.number}`,
    wide: true,
    onMount: (e) => {
      e.addEventListener(`click`, Dt);
      e.addEventListener(`input`, Et);
      e.addEventListener(`change`, Et);
    },
    onClose: () => {
      X = null;
      if (location.pathname.startsWith(`/warehouses/counts/`)) {
        history.replaceState(null, ``, `/warehouses/counts`);
      }
    },
  });
  let n = queryOne(`#drawer .drawer__inner`);
  if (n) {
    Me(domQueryAll(`[data-prog]`, n), 0.3);
  }
}
function Ct() {
  if (!X) {
    return;
  }
  let e = store.counts.find((e) => e.id === X);
  let t = queryOne(`#drawer .drawer__inner`);
  if (!e || !t) {
    if (!e) {
      closeDrawer();
    }
    return;
  }
  [...t.children].forEach((e) => {
    if (!e.classList.contains(`drawer__close`)) {
      e.remove();
    }
  });
  t.insertAdjacentHTML(`beforeend`, xt(e));
}
function wt(e, pid) {
  let n = queryOne(`#drawer .drawer__inner`);
  if (!n) {
    return;
  }
  let r = e.lines.find((e) => e.productId === pid);
  let i = queryOne(`[data-line="${pid}"]`, n);
  if (r && i) {
    let e = domQuery(`[data-var]`, i);
    let t = e.textContent;
    e.innerHTML = pt(ft(r));
    if (e.textContent !== t) {
      animatePop(e.firstElementChild, {
        from: 0.7,
      });
    }
    i.classList.toggle(`is-open`, r.counted === null);
    i.classList.remove(`is-missing`);
  }
  let a = dt(e);
  let o = Q(e);
  let s = queryOne(`[data-prog-t]`, n);
  if (s) {
    s.textContent = `${a} of ${pluralize(e.lines.length, `line`)} counted`;
  }
  let c = queryOne(`[data-prog-v]`, n);
  if (c) {
    c.textContent = a
      ? `net ${o.net > 0 ? `+` : o.net < 0 ? `−` : `±`}${Math.abs(o.net)} so far`
      : `Start with any shelf`;
  }
  let l = queryOne(`[data-left]`, n);
  if (l) {
    l.textContent =
      e.lines.length - a ? `${pluralize(e.lines.length - a, `line`)} to go` : `Every line counted`;
  }
  let u = queryOne(`[data-prog]`, n);
  if (u) {
    gsap.to(u, {
      scaleX: Math.max(0.02, e.lines.length ? a / e.lines.length : 0),
      duration: motionDuration(0.5),
      ease: `power3.out`,
    });
  }
}
function Tt(e) {
  let t = store.counts.find((e) => e.id === X);
  let pid = e.dataset.pid;
  if (!t || !pid || t.status !== `counting`) {
    return;
  }
  let r = e.value.trim();
  lt = true;
  updateCountLine(t.id, pid, r === `` ? null : Math.max(0, Number(r) || 0));
  lt = false;
  wt(t, pid);
}
function Et(e) {
  let t = e.target.closest(`.stepper__in`);
  if (t) {
    Tt(t);
  }
}
function Dt({ target }) {
  let n = target.closest(`[data-step]`);
  if (n) {
    let e = n.parentElement?.querySelector(`.stepper__in`);
    if (!e) {
      return;
    }
    openNewTransferModal(n);
    let t = store.counts.find((e) => e.id === X)?.lines.find((t) => t.productId === e.dataset.pid);
    let r = e.value === `` ? (Z && t ? t.expected : 0) : Number(e.value) || 0;
    e.value = String(Math.max(0, r + (e.value === `` && Z ? 0 : Number(n.dataset.step))));
    Tt(e);
    return;
  }
  let r = target.closest(`[data-reveal]`);
  if (r) {
    Z = !Z;
    r.setAttribute(`aria-checked`, String(Z));
    let e = store.counts.find((e) => e.id === X);
    if (!e) {
      return;
    }
    domQueryAll(`[data-line]`, target.closest(`.drawer__inner`) ?? document).forEach((t) => {
      let n = e.lines.find((e) => e.productId === t.dataset.line);
      let r = queryOne(`[data-exp] b`, t);
      if (n && r) {
        r.textContent = Z ? formatInt(n.expected) : `•••`;
        animatePop(r, {
          from: 0.6,
        });
      }
    });
    return;
  }
  let o = target.closest(`[data-sheet]`);
  if (!o || !X) {
    return;
  }
  openNewTransferModal(o);
  if (o.dataset.sheet === `start`) {
    cancelCount(X);
    showToast(`Count started — count each shelf and enter what you find`, {
      ico: `clipboard`,
    });
    return;
  }
  let s = completeCount(X);
  if (s) {
    let e = o.closest(`.drawer__inner`);
    let t = e ? queryOne(`[data-err]`, e) : null;
    if (t) {
      t.hidden = false;
      domQuery(`span`, t).textContent = s;
      Pe(t);
    }
    showToast(s, {
      ico: `alert`,
    });
    if (e) {
      domQueryAll(`.wh-cl.is-open`, e).forEach((e, t) => {
        e.classList.add(`is-missing`);
        gsap.fromTo(
          e,
          {
            x: -6,
          },
          {
            x: 0,
            duration: motionDuration(0.5),
            delay: motionDuration(t * 0.04),
            ease: `elastic.out(1, 0.35)`,
            clearProps: `transform`,
          }
        );
      });
    }
    queryOne(`#drawer .wh-cl.is-open .stepper__in`)?.focus();
  }
}
function Ot(e) {
  P = e;
  domQueryAll(`[data-sub]`, N).forEach((t) => {
    t.hidden = t.dataset.sub !== e;
  });
  if (e !== `transfers`) {
    J.splice(0).forEach((e) => e.kill());
  }
  if (!F.has(e)) {
    F.add(e);
    if (e === `locations`) {
      Ze();
    } else if (e === `transfers`) {
      st();
    } else {
      vt();
    }
  }
  if (e === `locations`) {
    $e(false);
    Qe();
  } else if (e === `transfers`) {
    ot(false);
    ct();
  } else {
    $(false);
    yt();
  }
}
export const page = {
  title: (e) =>
    ({
      locations: `Locations`,
      transfers: `Transfers`,
      counts: `Cycle counts`,
    })[e[0] ?? ``] ?? `Warehouses`,
  mount(e) {
    N = e;
    N.innerHTML = De.map((e) => `<div data-sub="${e}" hidden></div>`).join(``);
    let t = () => {
      if (R(`locations`)) {
        Ve();
        G();
        Ue();
        W(true);
      }
    };
    findLocationById(`products`, () => {
      t();
      if (R(`counts`)) {
        $(true);
      }
    });
    findLocationById(`batches`, t);
    findLocationById(`materials`, t);
    findLocationById(`orders`, () => {
      if (R(`locations`)) {
        G();
        W(true);
      }
    });
    findLocationById(`moves`, () => {
      if (R(`locations`)) {
        Ge(true);
      }
    });
    findLocationById(`transfers`, () => {
      if (R(`transfers`)) {
        ot(true);
      }
    });
    findLocationById(`counts`, () => {
      if (R(`counts`)) {
        $(true);
      }
      if (!lt && X && !N.hidden) {
        Ct();
      }
    });
  },
  enter({ params, same }) {
    let n = De.includes(params[0]) ? params[0] : `locations`;
    let r = params[1];
    if (n === `locations`) {
      if (X) {
        closeDrawer();
      }
      let e = from;
      if (r) {
        if (exportDataBackup(r)) {
          e = r;
        } else {
          showToast(`That location isn’t on file`, {
            ico: `info`,
          });
          history.replaceState(null, ``, `/warehouses/locations`);
        }
      }
      if (same && P === `locations` && F.has(`locations`)) {
        qe(e);
        return;
      }
      from = e;
      Ot(`locations`);
      return;
    }
    if (!(same && n === P && F.has(n))) {
      Ot(n);
    }
    if (n === `counts` && r) {
      St(r);
    } else if (X) {
      closeDrawer();
    }
  },
  leave() {
    if (X) {
      closeDrawer();
    }
    closeCurrentPopover();
    J.splice(0).forEach((e) => e.kill());
    U?.kill();
  },
};
