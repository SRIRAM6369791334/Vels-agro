import {
  escapeHtml,
  notifyStoreSubscribers,
  store,
  showToast,
  renderEmptyState,
  queryOne,
  animatePageTransition,
  domQuery,
  motionDuration,
  renderTag,
  formatDate,
  bindModalDismiss,
  animateWobble,
  formatRelativeTime,
  openMoveStockModal,
  findLocationById,
  openNewTransferModal,
  animateRows,
  Flip,
  renderFilterBar,
  animateCards,
  createHelpTicket,
  pluralize,
  animatePop,
  highlightSearchMatch,
  gsap,
  renderPill,
  domQueryAll,
  initLiftAnimations,
  renderIcon,
  bindMagnetic,
  renderPageHeader,
} from "../../main.ts";
let O;
let k = `center`;
const A = new Set();
const j = [`center`, `tickets`];
const M = (e) => domQuery(`[data-sub="${e}"]`, O);
const N = (e) => domQuery(`[data-k="${e}"]`, O);
const P = (e) => !!O && !O.hidden && k === e;
const F = {
  batches: {
    name: `Batches & QA`,
    icon: `flask`,
    tone: `ocean`,
    text: `Making lots, release, holds, expiry`,
  },
  stock: {
    name: `Stock & counts`,
    icon: `boxes`,
    tone: `pine`,
    text: `Transfers, counts, reorder points`,
  },
  orders: {
    name: `Orders & returns`,
    icon: `orders`,
    tone: `sky`,
    text: `Wholesale, online, the board, returns`,
  },
  buying: {
    name: `Purchasing`,
    icon: `cart`,
    tone: `ochre`,
    text: `Suppliers, POs, receiving`,
  },
  team: {
    name: `Team & data`,
    icon: `users`,
    tone: `teal`,
    text: `Roles, exports, settings`,
  },
  keys: {
    name: `Shortcuts`,
    icon: `command`,
    tone: `slate`,
    text: `Get around without the mouse`,
  },
};
const I = [
  {
    id: `batch-to-shelf`,
    cat: `batches`,
    q: `How does a batch get from the lab onto the shelf?`,
    a: `Make a batch from Products › Batches or from a product’s page. Vessa checks the bill of materials, takes the ingredients and packaging out of the Weaverville Lab’s stock and books the lot In QA. Its units don’t count as available until someone allowed to release batches opens the lot and presses Release — then they land at Riverside DC and show up in the ledger.`,
    link: [`#/products/batches`, `Open batches`],
  },
  {
    id: `hold-lot`,
    cat: `batches`,
    q: `What happens when I put a lot on hold?`,
    a: `Its remaining units come off sale straight away, so they can’t be picked for an order, and the lot keeps the reason you gave. Release it again once the problem is fixed — for example when replacement pumps arrive for a cleansing-oil lot that was sticking.`,
  },
  {
    id: `expiry`,
    cat: `batches`,
    q: `When does Vessa warn me that a lot is about to expire?`,
    a: `A lot’s expiry date is its make date plus the product’s shelf life. Once a released lot with stock left is inside the warning window — 90 days unless you change it — it raises an “Expiring soon” alert. Set the window to 30, 60, 90 or 120 days in Settings › Company › Stock preferences; the alerts, the dashboard and Stock health all follow at once.`,
    link: [`#/settings/company`, `Change the window`],
  },
  {
    id: `transfer`,
    cat: `stock`,
    q: `How do I move stock between the DC, the lab and the shop?`,
    a: `Use New › Transfer, or Move stock on the dashboard. Pick where it comes from, where it goes and the lines. A transfer goes Planned → In transit → Received: the units leave the source when it ships and arrive at the destination when someone receives it, and both moves are written to the stock ledger.`,
    link: [`#/warehouses/transfers`, `Open transfers`],
  },
  {
    id: `counts`,
    cat: `stock`,
    q: `How do cycle counts work?`,
    a: `Schedule a count for one zone from Warehouses › Counts. When it starts, Vessa snapshots what it expects on each shelf; the counter enters what is really there, line by line, then finishes the count. Any difference is booked as a count variance in the ledger, and the Stock accuracy dial in Analytics updates. To split aisles between two people, schedule one count per zone.`,
    link: [`#/warehouses/counts`, `Open counts`],
  },
  {
    id: `reorder-point`,
    cat: `stock`,
    q: `What is a reorder point, and why is a product marked low?`,
    a: `Every product has a reorder point and a run size. It is marked low when the stock you can sell at Riverside DC — what’s on hand minus what open orders have reserved — is at or under that point. Analytics › Stock health shows days of cover too: how long that stock lasts at the last 30 days’ rate.`,
    link: [`#/analytics/stock`, `See days of cover`],
  },
  {
    id: `adjust`,
    cat: `stock`,
    q: `Can I correct stock without running a count?`,
    a: `Yes. On a product, choose Adjust stock, pick the location, add or remove units and give a reason such as “broken in aisle” or “sent as samples”. The change is logged in the ledger with your name, and the toast offers an undo for a few seconds.`,
  },
  {
    id: `wholesale`,
    cat: `orders`,
    q: `How are wholesale orders different from online orders?`,
    a: `Wholesale orders are for stockists, priced at wholesale and packed in cases of six. They ship within three days and can be on Net 30 terms, so they stay unpaid until you mark them paid. Online orders are priced at retail and ship the next working day. Both move New → Picking → Packed → Shipped → Delivered on the board.`,
    link: [`#/orders/board`, `Open the board`],
  },
  {
    id: `returns`,
    cat: `orders`,
    q: `How do I handle a return?`,
    a: `Open it from Orders › Returns. Mark it Received when the parcel arrives, then either Restock it — the units go back on the shelf at Riverside DC — or Refund it. Items that leaked, were opened or caused a reaction should be refunded, never restocked. You can also Reject a request.`,
    link: [`#/orders/returns`, `Open returns`],
  },
  {
    id: `goal`,
    cat: `orders`,
    q: `How do I change the monthly sales goal?`,
    a: `On the dashboard, open the ⋯ menu on Sales overview and choose Edit monthly goal, or press Edit goal under the chart in Analytics › Reports. The goal covers every channel together, before tax.`,
    link: [`#/analytics/overview`, `Open reports`],
  },
  {
    id: `reorder-materials`,
    cat: `buying`,
    q: `How do I reorder materials that are running low?`,
    a: `Dashboard › Alerts has Draft every reorder: it writes one draft purchase order per supplier for every low material, at its reorder quantity. Check the drafts and Send them. When the delivery arrives, Receive all of it or just the part that came, and the lab’s stock goes up.`,
    link: [`#/purchasing/orders`, `Purchase orders`],
  },
  {
    id: `roles`,
    cat: `team`,
    q: `What can each role do?`,
    a: `Viewers can see stock, orders and reports. Staff can also pick, pack, ship, adjust stock and run counts. Managers can also release batches and send purchase orders. Admins can also change prices and costs and invite people. Only the owner sees billing. Change someone’s role in Settings › Team & roles.`,
    link: [`#/settings/team`, `Team & roles`],
  },
  {
    id: `export`,
    cat: `team`,
    q: `How do I export my data as CSV?`,
    a: `Settings › Company › Your data exports stock by location, every sales order and the full stock ledger. Analytics › Reports exports whatever report is on screen, row by row, and each invoice in Billing downloads on its own.`,
    link: [`#/settings/company`, `Your data`],
  },
  {
    id: `heatmap`,
    cat: `orders`,
    q: `When do most orders come in?`,
    a: `Analytics › Sales has a heatmap of orders by day of the week and hour. Hover a square to see how many orders landed then and what they were worth; the busiest hour is named above it. Plan picking shifts around it.`,
    link: [`#/analytics/sales`, `Open the heatmap`],
  },
  {
    id: `keys`,
    cat: `keys`,
    q: `What keyboard shortcuts are there?`,
    a: `Most of Vessa works from the keyboard. Press ? anywhere to see this list.`,
    keys: [
      [[`⌘`, `K`], `Search everything`],
      [[`g`, `d`], `Go to the dashboard (g then p, o, u, w, a, c, s or h for the others)`],
      [[`n`], `New sales order`],
      [[`c`], `The create menu`],
      [[`[`], `Collapse or expand the sidebar`],
      [[`?`], `Every shortcut`],
    ],
  },
];
let L = ``;
let R = `all`;
const z = new Set();
let B = ``;
function V() {
  return `<section class="hp-hero" aria-labelledby="hp-hero-t">
      <div class="hp-hero__txt"><p class="head__eyebrow">Help center</p><h1 class="head__title" id="hp-hero-t" tabindex="-1">How can we help?</h1>
        <p class="hp-hero__sub">Answers about batches, stock, orders and the team — written by the people who run Vessa.</p></div>
      <label class="hp-search">${renderIcon(`search`)}<input type="search" placeholder="Search the help center…" aria-label="Search the help center" aria-controls="hp-faq" data-k="hp-q" autocomplete="off" /><kbd data-k="hp-n"></kbd></label>
      <div class="hp-popular"><span>Popular:</span>${[`expiry`, `transfer`, `count`, `return`, `shortcuts`].map((t) => `<button type="button" class="chip" data-pop="${t}">${escapeHtml(t)}</button>`).join(``)}</div>
    </section>
    <div class="hp-cats" role="group" aria-label="Topic" data-k="hp-cats">${Object.keys(F)
      .map(
        (t) =>
          `<button type="button" class="hp-cat" data-cat="${t}" aria-pressed="false" style="--c:var(--${F[t].tone})">${renderTag(F[t].icon, F[t].tone)}<span><b>${escapeHtml(F[t].name)}</b><small>${escapeHtml(F[t].text)}</small></span><em class="num">${I.filter((e) => e.cat === t).length}</em></button>`
      )
      .join(``)}</div>
    <div class="hp-grid">
      <section class="card hp-faq" aria-labelledby="hp-faq-t">
        <header class="card__head"><div><h2 class="card__title" id="hp-faq-t">Questions and answers</h2><p class="card__sub" data-k="hp-sub"></p></div>
          <div class="card__tools"><button type="button" class="btn btn--ghost btn--sm" data-k="hp-all" hidden>${renderIcon(`close`)}Clear</button></div></header>
        <div class="hp-list" id="hp-faq" data-k="hp-list"></div>
      </section>
      <aside class="hp-side">
        <section class="card hp-stuck" aria-labelledby="hp-st-t">
          ${renderTag(`chat`, `pine`)}
          <h2 class="card__title" id="hp-st-t">Still stuck?</h2>
          <p>Write to the Vessa team. A person — not a bot — replies, usually within three working hours.</p>
          <ul class="hp-stuck__facts"><li>${renderIcon(`clock`)}Mon–Fri, 8 am–6 pm Eastern</li><li>${renderIcon(`chat`)}<span data-k="hp-open"></span></li></ul>
          <a class="btn btn--primary magnetic" href="#/help/tickets" data-k="hp-ask">${renderIcon(`send`)}Open a ticket</a>
        </section>
        <section class="card hp-keys" aria-labelledby="hp-k-t">
          <header class="card__head"><h2 class="card__title" id="hp-k-t">Quick keys</h2></header>
          <dl class="keys">${[
            [[`⌘`, `K`], `Search`],
            [[`g`, `d`], `Dashboard`],
            [[`n`], `New order`],
            [[`?`], `All shortcuts`],
          ]
            .map(
              ([t, n]) =>
                `<div><dt>${escapeHtml(n)}</dt><dd>${t.map((t) => `<kbd>${escapeHtml(t)}</kbd>`).join(``)}</dd></div>`
            )
            .join(``)}</dl>
        </section>
      </aside>
    </div>`;
}
function ie(t, n) {
  let r =
    z.has(t.id) ||
    (n.length >= 3 && t.a.toLowerCase().includes(n) && !t.q.toLowerCase().includes(n));
  return `<div class="hp-item${r ? ` is-open` : ``}" data-key="${t.id}" data-faq="${t.id}">
    <h3><button type="button" class="hp-q" aria-expanded="${r}" aria-controls="ans-${t.id}" id="q-${t.id}">${renderTag(F[t.cat].icon, F[t.cat].tone, `sm`)}<span>${highlightSearchMatch(t.q, n)}</span><i class="hp-q__chev">${renderIcon(`down`)}</i></button></h3>
    <div class="hp-a" id="ans-${t.id}" role="region" aria-labelledby="q-${t.id}" ${r ? `` : `hidden`}><div class="hp-a__in">
      <p>${highlightSearchMatch(t.a, n)}</p>
      ${t.keys ? `<dl class="keys hp-a__keys">${t.keys.map(([t, n]) => `<div><dt>${escapeHtml(n)}</dt><dd>${t.map((t) => `<kbd>${escapeHtml(t)}</kbd>`).join(``)}</dd></div>`).join(``)}</dl>` : ``}
      <div class="hp-a__foot">${t.link ? `<a class="btn btn--soft btn--xs" href="${t.link[0]}">${escapeHtml(t.link[1])}${renderIcon(`chevR`)}</a>` : ``}<span class="hp-a__cat">${escapeHtml(F[t.cat].name)}</span><span class="hp-help" data-k="hp-vote-${t.id}"><span>Did this help?</span><button type="button" class="btn btn--ghost btn--xs" data-vote="yes:${t.id}">Yes</button><button type="button" class="btn btn--ghost btn--xs" data-vote="no:${t.id}">No</button></span></div>
    </div></div>
  </div>`;
}
function H(e) {
  let t = L.trim().toLowerCase();
  let n = I.filter(
    (e) =>
      (R === `all` || e.cat === R) &&
      (!t ||
        `${e.q} ${e.a} ${F[e.cat].name} ${e.keys?.map((e) => e[1]).join(` `) ?? ``}`
          .toLowerCase()
          .includes(t))
  );
  let r = N(`hp-list`);
  let a = n.length
    ? n.map((e) => ie(e, t)).join(``)
    : renderEmptyState(
        t ? `Nothing about “${L.trim()}” yet` : `No answers here`,
        t
          ? `Try another word — “lot”, “stock”, “ship” — or ask the team, who reply within a working day.`
          : `This topic has no answers yet.`,
        `search`,
        `<span class="hp-empty__acts"><button type="button" class="btn btn--ghost btn--sm" data-k="hp-clear">Clear search</button><a class="btn btn--primary btn--sm" href="#/help/tickets" data-k="hp-ask2">${renderIcon(`send`)}Ask the team</a></span>`
      );
  if (e) {
    bindModalDismiss(r, () => {
      r.innerHTML = a;
    });
  } else {
    r.innerHTML = a;
  }
  N(`hp-sub`).textContent =
    t || R !== `all`
      ? `${pluralize(n.length, `answer`)}${R === `all` ? `` : ` in ${F[R].name}`}${t ? ` matching “${L.trim()}”` : ``}`
      : `${pluralize(I.length, `answer`)} across ${Object.keys(F).length} topics`;
  N(`hp-n`).textContent = t ? String(n.length) : `/`;
  N(`hp-all`).hidden = !t && R === `all`;
  domQueryAll(`[data-cat]`, O).forEach((e) =>
    e.setAttribute(`aria-pressed`, String(e.dataset.cat === R))
  );
}
function U(e, t) {
  let faq = e.dataset.faq;
  let r = domQuery(`.hp-q`, e);
  let i = domQuery(`.hp-a`, e);
  let a = t ?? r.getAttribute(`aria-expanded`) !== `true`;
  if (a === (r.getAttribute(`aria-expanded`) === `true`)) {
    return;
  }
  let o = [];
  for (let t = e.nextElementSibling; t; t = t.nextElementSibling) {
    o.push(t);
  }
  let l = Flip.getState(o);
  let u = () => {
    r.setAttribute(`aria-expanded`, String(a));
    e.classList.toggle(`is-open`, a);
    i.hidden = !a;
    if (a) {
      z.add(faq);
    } else {
      z.delete(faq);
    }
    if (!bindMagnetic()) {
      Flip.from(l, {
        duration: motionDuration(0.45),
        ease: `power3.inOut`,
        clearProps: `transform`,
      });
    }
  };
  gsap.killTweensOf(domQuery(`.hp-a__in`, e));
  gsap.to(domQuery(`.hp-q__chev`, e), {
    rotation: a ? 180 : 0,
    duration: motionDuration(0.4),
    ease: `back.out(2)`,
  });
  if (a) {
    u();
    gsap.fromTo(
      domQuery(`.hp-a__in`, e),
      {
        opacity: 0,
        y: -8,
      },
      {
        opacity: 1,
        y: 0,
        duration: motionDuration(0.4),
        ease: `power3.out`,
        clearProps: `transform,opacity`,
      }
    );
  } else {
    gsap.to(domQuery(`.hp-a__in`, e), {
      opacity: 0,
      y: -6,
      duration: motionDuration(0.16),
      ease: `power2.in`,
      onComplete: () => {
        u();
        gsap.set(domQuery(`.hp-a__in`, e), {
          clearProps: `opacity,transform`,
        });
      },
    });
  }
  if (a && location.hash !== `#/help/center/${faq}`) {
    history.replaceState(null, ``, `#/help/center/${faq}`);
  } else if (!a && location.hash === `#/help/center/${faq}`) {
    history.replaceState(null, ``, `#/help/center`);
  }
}
function W(e) {
  let t = queryOne(`[data-faq="${CSS.escape(e)}"]`, O);
  if (!t) {
    if (!I.some((t) => t.id === e)) {
      history.replaceState(null, ``, `#/help/center`);
      return;
    }
    L = ``;
    R = `all`;
    N(`hp-q`).value = ``;
    H(false);
    if (queryOne(`[data-faq="${CSS.escape(e)}"]`, O)) {
      return W(e);
    }
    return undefined;
  }
  U(t, true);
  setTimeout(
    () =>
      t.scrollIntoView({
        block: `center`,
        behavior: bindMagnetic() ? `auto` : `smooth`,
      }),
    motionDuration(200)
  );
  animatePop(domQuery(`.hp-q .tile`, t), {
    from: 0.7,
    delay: 0.2,
  });
}
function ae() {
  let e = M(`center`);
  e.innerHTML = V();
  openMoveStockModal(e);
  let t = N(`hp-q`);
  t.addEventListener(`input`, () => {
    L = t.value;
    H(true);
  });
  t.addEventListener(`keydown`, (e) => {
    if (e.key === `Escape` && t.value) {
      e.stopPropagation();
      t.value = ``;
      L = ``;
      H(true);
    }
  });
  e.addEventListener(`click`, (e) => {
    let e_target = e.target;
    let r = e_target.closest(`.hp-q`);
    if (r) {
      U(r.closest(`.hp-item`));
      return;
    }
    let i = e_target.closest(`[data-cat]`);
    if (i) {
      openNewTransferModal(i);
      R = R === i.dataset.cat ? `all` : i.dataset.cat;
      H(true);
      return;
    }
    let a = e_target.closest(`[data-pop]`);
    if (a) {
      openNewTransferModal(a);
      t.value = a.dataset.pop;
      L = t.value;
      R = `all`;
      H(true);
      t.focus();
      return;
    }
    if (e_target.closest(`[data-k="hp-clear"], [data-k="hp-all"]`)) {
      t.value = ``;
      L = ``;
      R = `all`;
      H(true);
      return;
    }
    if (e_target.closest(`[data-k="hp-ask2"]`)) {
      B = L.trim();
    }
    let o = e_target.closest(`[data-vote]`);
    if (o) {
      let [e, t] = o.dataset.vote.split(`:`);
      let n = N(`hp-vote-${t}`);
      n.innerHTML =
        e === `yes`
          ? `<span class="hp-help__done">${renderIcon(`check`)}Thanks — glad it helped</span>`
          : `<span class="hp-help__done">Sorry about that. <a href="#/help/tickets" data-ask-about="${t}">Ask the team</a></span>`;
      animatePop(n.firstElementChild, {
        from: 0.8,
      });
      return;
    }
    let s = e_target.closest(`[data-ask-about]`);
    if (s) {
      B = I.find((e) => e.id === s.dataset.askAbout)?.q ?? ``;
    }
  });
}
function G() {
  let length = store.tickets.filter((e) => e.status === `open`).length;
  let length_1 = store.tickets.filter((e) => e.status === `answered`).length;
  let r = queryOne(`[data-k="hp-open"]`, O);
  if (r) {
    r.innerHTML = length
      ? `<a href="#/help/tickets">${pluralize(length, `ticket`)} waiting on the team</a>`
      : length_1
        ? `<a href="#/help/tickets">${pluralize(length_1, `reply`, `replies`)} to read in your tickets</a>`
        : `You have no open tickets`;
  }
}
function oe() {
  let e = M(`center`);
  gsap
    .timeline()
    .add(animatePageTransition(e), 0)
    .fromTo(
      domQuery(`.hp-hero`, e),
      {
        opacity: 0,
        y: 20,
        scale: 0.99,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: motionDuration(0.8),
        ease: `power3.out`,
        clearProps: `transform,opacity`,
      },
      0
    )
    .add(
      animateRows(domQueryAll(`.hp-hero__sub, .hp-search, .hp-popular > *`, e), {
        y: 10,
        stagger: 0.04,
      }),
      0.15
    )
    .add(
      animateWobble(domQueryAll(`.hp-cat`, e), {
        stagger: 0.05,
      }),
      0.2
    )
    .add(
      animateCards(domQueryAll(`.card`, e), {
        stagger: 0.08,
      }),
      0.3
    )
    .add(
      animateRows(domQueryAll(`.hp-item`, e).slice(0, 12), {
        y: 10,
        stagger: 0.035,
      }),
      0.45
    );
  initLiftAnimations(e);
  G();
}
const se = [
  `Batches & QA`,
  `Stock & counts`,
  `Orders & returns`,
  `Purchasing`,
  `Printing & labels`,
  `Billing`,
  `Something else`,
];
const K = {
  open: [`sky`, `Open`],
  answered: [`sage`, `Answered`],
  closed: [`faint`, `Closed`],
};
let q = `all`;
let J = ``;
const Y = new Set();
let X = ``;
function ce() {
  return `${renderPageHeader({
    eyebrow: `Questions you’ve sent the Vessa team`,
    title: `My tickets`,
    actions: `<a class="btn btn--ghost" href="#/help/center">${renderIcon(`book`)}Help center</a>`,
    stats: [
      {
        key: `open`,
        icon: `inbox`,
        label: `Open`,
        value: 0,
        ico: `sky`,
      },
      {
        key: `answered`,
        icon: `chat`,
        label: `Answered`,
        value: 0,
        ico: `sage`,
      },
      {
        key: `closed`,
        icon: `check`,
        label: `Closed`,
        value: 0,
        ico: `slate`,
      },
      {
        key: `reply`,
        icon: `clock`,
        label: `Typical first reply`,
        value: 3,
        suffix: `hours`,
        ico: `pine`,
      },
    ],
  })}
  <div class="hp-tgrid">
    <section class="card hp-new" aria-labelledby="tk-n-t">
      <header class="card__head"><div><h2 class="card__title" id="tk-n-t">Ask the team</h2><p class="card__sub">From ${escapeHtml(store.settings.me.name)} · ${escapeHtml(store.settings.me.email)}</p></div>${renderTag(`send`, `pine`, `sm`)}</header>
      <form class="hp-form" data-k="tk-form" novalidate>
        <label class="field"><span class="field__label">Subject</span><input name="subject" maxlength="90" placeholder="Barcode labels print off-centre" autocomplete="off" /><span class="hp-err" role="alert"></span></label>
        <label class="field"><span class="field__label">Topic</span><select name="topic">${se.map((t) => `<option>${escapeHtml(t)}</option>`).join(``)}</select></label>
        <label class="field"><span class="field__label">What happened?</span><textarea name="body" rows="6" maxlength="1200" placeholder="What you did, what you expected and what Vessa did instead. Lot numbers and order numbers help."></textarea><span class="hp-count"><span class="hp-err" role="alert"></span><small data-k="tk-count">0 / 1200</small></span></label>
        <div class="hp-form__foot"><span class="hp-form__note">${renderIcon(`clock`)}Replies within three working hours</span><button type="submit" class="btn btn--primary">${renderIcon(`send`)}Send ticket</button></div>
      </form>
    </section>
    <section class="card hp-tlist" aria-labelledby="tk-l-t">
      <header class="card__head"><div><h2 class="card__title" id="tk-l-t">Your tickets</h2><p class="card__sub" data-k="tk-sub"></p></div>
        <div class="card__tools"><label class="search">${renderIcon(`search`)}<input type="search" placeholder="Search tickets…" aria-label="Search tickets" data-k="tk-q" /></label></div></header>
      <div class="toolbar"><div class="chips" data-k="tk-filter">${[`all`, `open`, `answered`, `closed`].map((e) => `<button type="button" class="chip" data-tf="${e}" aria-pressed="${e === q}">${e === `all` ? `All` : K[e][1]} <b data-tn="${e}"></b></button>`).join(``)}</div></div>
      <div class="hp-tickets" data-k="tk-list"></div>
    </section>
  </div>`;
}
function le(t, n) {
  let [r, i] = K[t.status];
  let a = Y.has(t.id);
  return `<div class="hp-ticket${a ? ` is-open` : ``}${t.id === X ? ` is-fresh` : ``}" data-key="${t.id}" data-tk="${t.id}">
    <button type="button" class="hp-ticket__head" aria-expanded="${a}" aria-controls="tk-${t.id}">
      <span class="hp-ticket__txt"><b>${highlightSearchMatch(t.subject, n)}</b><small><span class="mono">${highlightSearchMatch(t.number, n)}</span> · ${escapeHtml(t.topic)} · ${formatRelativeTime(t.at)}</small></span>
      ${renderPill(i, r)}<i class="hp-q__chev">${renderIcon(`down`)}</i></button>
    <div class="hp-ticket__body" id="tk-${t.id}" ${a ? `` : `hidden`}><div class="hp-a__in">
      <div class="hp-msg hp-msg--me"><span class="hp-msg__who">You · ${formatDate(t.at, true)}</span><p>${highlightSearchMatch(t.body, n)}</p></div>
      ${t.reply ? `<div class="hp-msg hp-msg--team"><span class="hp-msg__who">${renderIcon(`logo`)}Vessa support</span><p>${escapeHtml(t.reply)}</p></div>` : `<p class="hp-wait">${renderIcon(`hourglass`)}Waiting for the team — usually within three working hours.</p>`}
      <div class="hp-ticket__acts">${t.status === `answered` ? `<button type="button" class="btn btn--soft btn--xs" data-solve="${t.id}">${renderIcon(`check`)}That solved it</button>` : ``}${t.status === `closed` ? `<button type="button" class="btn btn--ghost btn--xs" data-reopen="${t.id}">${renderIcon(`refresh`)}Reopen</button>` : ``}</div>
    </div></div>
  </div>`;
}
function Z(e) {
  let t = J.trim().toLowerCase();
  [`all`, `open`, `answered`, `closed`].forEach((e) => {
    let t = queryOne(`[data-tn="${e}"]`, O);
    if (t) {
      t.textContent = String(
        e === `all` ? store.tickets.length : store.tickets.filter((t) => t.status === e).length
      );
    }
  });
  let r = store.tickets.filter(
    (e) =>
      (q === `all` || e.status === q) &&
      (!t || `${e.subject} ${e.body} ${e.number} ${e.topic}`.toLowerCase().includes(t))
  );
  let o = r.length
    ? r.map((e) => le(e, t)).join(``)
    : store.tickets.length
      ? renderEmptyState(
          t ? `No ticket mentions “${J.trim()}”` : `No ${K[q][1].toLowerCase()} tickets`,
          t
            ? `Search by subject, number or what you wrote.`
            : `Nothing is in this state right now.`,
          `inbox`,
          `<button type="button" class="btn btn--ghost btn--sm" data-k="tk-clear">Show every ticket</button>`
        )
      : renderEmptyState(
          `No tickets yet`,
          `When something in Vessa doesn’t work the way you expect, ask here — the answer lands in this list.`,
          `chat`
        );
  let s = N(`tk-list`);
  if (e) {
    bindModalDismiss(s, () => {
      s.innerHTML = o;
    });
  } else {
    s.innerHTML = o;
  }
  N(`tk-sub`).textContent =
    `${pluralize(store.tickets.length, `ticket`)} · ${store.tickets.filter((e) => e.status === `open`).length} waiting on the team`;
  let c = M(`tickets`);
  let l = (e, t) => renderFilterBar(queryOne(`[data-stat="${e}"] b[data-count]`, c), t);
  l(`open`, store.tickets.filter((e) => e.status === `open`).length);
  l(`answered`, store.tickets.filter((e) => e.status === `answered`).length);
  l(`closed`, store.tickets.filter((e) => e.status === `closed`).length);
}
function Q(e, t) {
  let n = e.dataset.tk;
  let r = domQuery(`.hp-ticket__head`, e);
  let i = domQuery(`.hp-ticket__body`, e);
  let a = t ?? r.getAttribute(`aria-expanded`) !== `true`;
  if (a === (r.getAttribute(`aria-expanded`) === `true`)) {
    return;
  }
  let o = [];
  for (let t = e.nextElementSibling; t; t = t.nextElementSibling) {
    o.push(t);
  }
  let l = Flip.getState(o);
  let u = domQuery(`.hp-a__in`, e);
  let d = () => {
    r.setAttribute(`aria-expanded`, String(a));
    e.classList.toggle(`is-open`, a);
    i.hidden = !a;
    if (a) {
      Y.add(n);
    } else {
      Y.delete(n);
    }
    if (!bindMagnetic()) {
      Flip.from(l, {
        duration: motionDuration(0.45),
        ease: `power3.inOut`,
        clearProps: `transform`,
      });
    }
  };
  gsap.to(domQuery(`.hp-q__chev`, e), {
    rotation: a ? 180 : 0,
    duration: motionDuration(0.4),
    ease: `back.out(2)`,
  });
  gsap.killTweensOf(u);
  if (a) {
    d();
    gsap.fromTo(
      u,
      {
        opacity: 0,
        y: -8,
      },
      {
        opacity: 1,
        y: 0,
        duration: motionDuration(0.4),
        ease: `power3.out`,
        clearProps: `transform,opacity`,
      }
    );
    animateRows(domQueryAll(`.hp-msg`, e), {
      y: 8,
      stagger: 0.08,
      delay: 0.05,
    });
  } else {
    gsap.to(u, {
      opacity: 0,
      y: -6,
      duration: motionDuration(0.16),
      ease: `power2.in`,
      onComplete: () => {
        d();
        gsap.set(u, {
          clearProps: `opacity,transform`,
        });
      },
    });
  }
  if (a) {
    history.replaceState(null, ``, `#/help/tickets/${n}`);
  } else if (location.hash.startsWith(`#/help/tickets/`)) {
    history.replaceState(null, ``, `#/help/tickets`);
  }
}
function ue(e) {
  let t = queryOne(`[data-tk="${CSS.escape(e)}"]`, O);
  if (!t) {
    if (!store.tickets.some((t) => t.id === e)) {
      history.replaceState(null, ``, `#/help/tickets`);
      return;
    }
    q = `all`;
    J = ``;
    N(`tk-q`).value = ``;
    domQueryAll(`[data-tf]`, O).forEach((e) =>
      e.setAttribute(`aria-pressed`, String(e.getAttribute(`data-tf`) === `all`))
    );
    Z(false);
    t = queryOne(`[data-tk="${CSS.escape(e)}"]`, O);
    if (!t) {
      return;
    }
  }
  Q(t, true);
  let r = t;
  setTimeout(
    () =>
      r.scrollIntoView({
        block: `center`,
        behavior: bindMagnetic() ? `auto` : `smooth`,
      }),
    motionDuration(200)
  );
}
function de() {
  let e = M(`tickets`);
  e.innerHTML = ce();
  let i = N(`tk-form`);
  let o = i.elements.namedItem(`subject`);
  let s = i.elements.namedItem(`body`);
  let l = i.elements.namedItem(`topic`);
  let u = (e, t) => {
    let n = e.closest(`.field`)?.querySelector(`.hp-err`);
    if (n) {
      n.textContent = t;
      e.setAttribute(`aria-invalid`, String(!!t));
      if (t && !bindMagnetic()) {
        gsap.fromTo(
          n,
          {
            x: -6,
          },
          {
            x: 0,
            duration: 0.5,
            ease: `elastic.out(1, 0.3)`,
            clearProps: `transform`,
          }
        );
      }
    }
  };
  i.addEventListener(`input`, (e) => {
    let e_target = e.target;
    if (e_target === o || e_target === s) {
      u(e_target, ``);
    }
    N(`tk-count`).textContent = `${s.value.length} / 1200`;
  });
  i.addEventListener(`submit`, (t) => {
    t.preventDefault();
    let d = o.value.trim();
    let f = s.value.trim();
    let p = d.length < 6 ? `Give it a subject of a few words.` : ``;
    let m = f.length < 20 ? `Tell us a little more — at least a sentence.` : ``;
    u(o, p);
    u(s, m);
    if (p) {
      o.focus();
      return;
    }
    if (m) {
      s.focus();
      return;
    }
    let h = createHelpTicket(d, f, l.value);
    X = store.tickets[0]?.id ?? ``;
    if (q !== `all` && q !== `open`) {
      q = `all`;
      domQueryAll(`[data-tf]`, e).forEach((e) =>
        e.setAttribute(`aria-pressed`, String(e.getAttribute(`data-tf`) === `all`))
      );
    }
    J = ``;
    N(`tk-q`).value = ``;
    Z(true);
    let g = queryOne(`[data-tk="${X}"]`, e);
    if (g && !bindMagnetic()) {
      gsap.fromTo(
        g,
        {
          y: -24,
          scale: 0.96,
          opacity: 0,
        },
        {
          y: 0,
          scale: 1,
          opacity: 1,
          duration: motionDuration(0.7),
          ease: `back.out(1.6)`,
          clearProps: `transform,opacity`,
        }
      );
    }
    i.reset();
    N(`tk-count`).textContent = `0 / 1200`;
    showToast(`${h} sent — we’ll reply within three working hours`, {
      ico: `send`,
    });
    setTimeout(() => {
      X = ``;
      g?.classList.remove(`is-fresh`);
    }, 2400);
  });
  N(`tk-q`).addEventListener(`input`, (e) => {
    J = e.target.value;
    Z(true);
  });
  N(`tk-filter`).addEventListener(`click`, (t) => {
    let n = t.target.closest(`[data-tf]`);
    if (n) {
      openNewTransferModal(n);
      q = n.dataset.tf;
      domQueryAll(`[data-tf]`, e).forEach((e) => e.setAttribute(`aria-pressed`, String(e === n)));
      Z(true);
    }
  });
  e.addEventListener(`click`, (i) => {
    let i_target = i.target;
    let o = i_target.closest(`.hp-ticket__head`);
    if (o) {
      Q(o.closest(`.hp-ticket`));
      return;
    }
    let s = i_target.closest(`[data-solve], [data-reopen]`);
    if (s) {
      openNewTransferModal(s);
      let e = s.dataset.solve ?? s.dataset.reopen;
      let i = store.tickets.find((t) => t.id === e);
      if (!i) {
        return;
      }
      i.status = s.dataset.solve ? `closed` : i.reply ? `answered` : `open`;
      notifyStoreSubscribers(`tickets`);
      showToast(
        s.dataset.solve ? `${i.number} closed — glad it’s sorted` : `${i.number} reopened`,
        {
          ico: s.dataset.solve ? `check` : `refresh`,
        }
      );
      return;
    }
    if (i_target.closest(`[data-k="tk-clear"]`)) {
      J = ``;
      q = `all`;
      N(`tk-q`).value = ``;
      domQueryAll(`[data-tf]`, e).forEach((e) =>
        e.setAttribute(`aria-pressed`, String(e.getAttribute(`data-tf`) === `all`))
      );
      Z(true);
    }
  });
}
function fe() {
  let e = M(`tickets`);
  gsap
    .timeline()
    .add(animatePageTransition(e), 0)
    .add(
      animateCards(domQueryAll(`.card`, e), {
        stagger: 0.1,
      }),
      0.12
    )
    .add(
      animateRows(domQueryAll(`.hp-form .field, .hp-form__foot`, e), {
        y: 10,
        stagger: 0.05,
      }),
      0.3
    )
    .add(
      animateRows(domQueryAll(`.hp-ticket, [data-tf]`, e), {
        y: 10,
        stagger: 0.04,
      }),
      0.35
    );
  if (B) {
    let t = domQuery(`[name="subject"]`, e);
    t.value = B.slice(0, 90);
    B = ``;
    setTimeout(() => {
      if (matchMedia(`(pointer: fine)`).matches) {
        domQuery(`[name="body"]`, e).focus();
      }
    }, motionDuration(500));
  }
}
function pe(e) {
  k = e;
  domQueryAll(`[data-sub]`, O).forEach((t) => {
    t.hidden = t.dataset.sub !== e;
  });
  if (!A.has(e)) {
    A.add(e);
    if (e === `center`) {
      ae();
    } else {
      de();
    }
  }
  if (e === `center`) {
    H(false);
    oe();
  } else {
    Z(false);
    fe();
  }
}
function $(e, t) {
  if (t) {
    if (e === `center`) {
      W(t);
    } else {
      ue(t);
    }
  }
}
export const page = {
  title: (e) => {
    if (e[0] === `tickets`) {
      return `My tickets`;
    }
    return `Help center`;
  },
  mount(e) {
    O = e;
    O.innerHTML = j.map((e) => `<div data-sub="${e}" hidden></div>`).join(``);
    findLocationById(`tickets`, () => {
      if (P(`tickets`)) {
        Z(true);
      } else if (P(`center`)) {
        G();
      }
    });
  },
  enter({ params, same }) {
    let n = j.includes(params[0] ?? ``) ? params[0] : `center`;
    if (same && n === k && A.has(n)) {
      $(n, params[1]);
      return;
    }
    pe(n);
    if (params[1]) {
      setTimeout(() => $(n, params[1]), motionDuration(450));
    }
  },
  leave() {},
};
