import {
  escapeHtml,
  notifyStoreSubscribers,
  store,
  getSavedTheme,
  updateMemberRole,
  bindAccentPicker,
  showToast,
  ONE_DAY_MS,
  renderEmptyState,
  resetDemoData,
  queryOne,
  animatePageTransition,
  domQuery,
  ROLE_NAMES,
  confirmDialog,
  renderAccentPickerHtml,
  renderAvatarStack,
  getActiveOrders,
  bindTabControls,
  renderAvatar,
  motionDuration,
  TRANSFER_STATUS_TONES,
  ONE_MIN_MS,
  renderTag,
  downloadFile,
  CATEGORY_NAMES,
  openDrawer,
  formatDate,
  getAvailableLocations,
  bindModalDismiss,
  getAvailableSuppliers,
  formatRelativeTime,
  getExpiringBatches,
  openMoveStockModal,
  formatInt,
  findLocationById,
  setSavedTheme,
  exportOrdersCsv,
  formatMoney,
  getLowStockMaterials,
  openNewTransferModal,
  openModal,
  animateRows,
  openQuickCreateModal,
  openInviteTeammateModal,
  getLowStockProducts,
  Flip,
  findMemberById,
  renderFilterBar,
  animateCards,
  getCurrentAccentName,
  exportStockCsv,
  exportDataBackup,
  formatMoneyRound,
  pluralize,
  renderIconButton,
  animatePop,
  highlightSearchMatch,
  gsap,
  renderPill,
  animateElementOut,
  domQueryAll,
  renderIcon,
  exportMovementsCsv,
  bindMagnetic,
  renderPageHeader,
  getLocationStockUnits,
  renderSegmentedControl,
  removeTeammate,
  addNotification,
  initSegmentedControl,
  formatCsvRow,
} from "../../main.ts";
let P;
let Re = `account`;
const ze = new Set();
const Be = [`account`, `company`, `team`, `billing`, `notifications`];
const F = (e) => domQuery(`[data-sub="${e}"]`, P);
const I = (e) => domQuery(`[data-k="${e}"]`, P);
const L = (e) => !!P && !P.hidden && Re === e;
const Ve = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
function R(e, t) {
  let n = e.closest(`.st-field`)?.querySelector(`.st-field__err`);
  e.setAttribute(`aria-invalid`, String(!!t));
  if (n) {
    n.textContent = t;
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
}
const z = (t) =>
  `<label class="st-field${t.wide ? ` st-field--wide` : ``}"><span class="field__label">${escapeHtml(t.label)}</span><input class="st-in" name="${t.name}" type="${t.type ?? `text`}" value="${escapeHtml(t.value ?? ``)}" ${t.ac ? `autocomplete="${t.ac}"` : `autocomplete="off"`} ${t.ph ? `placeholder="${escapeHtml(t.ph)}"` : ``} ${t.k ? `data-k="${t.k}"` : ``} /><span class="st-field__err" role="alert"></span></label>`;
const He = (t, n, r, i, a = false) =>
  `<label class="st-field${a ? ` st-field--wide` : ``}"><span class="field__label">${escapeHtml(n)}</span><select class="st-in" name="${t}">${i.map(([t, n]) => `<option value="${escapeHtml(t)}"${t === r ? ` selected` : ``}>${escapeHtml(n)}</option>`).join(``)}</select><span class="st-field__err" role="alert"></span></label>`;
function Ue(e) {
  let t = e?.querySelector(`.st-saved`);
  if (t) {
    gsap.killTweensOf(t);
    if (bindMagnetic()) {
      gsap.set(t, {
        opacity: 1,
      });
      gsap.to(t, {
        opacity: 0,
        delay: 1.4,
        duration: 0,
      });
      return;
    }
    gsap
      .timeline()
      .fromTo(
        t,
        {
          opacity: 0,
          x: -6,
          scale: 0.8,
        },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.35,
          ease: `back.out(2.2)`,
        }
      )
      .to(
        t,
        {
          opacity: 0,
          duration: 0.4,
          ease: `power2.in`,
          clearProps: `transform`,
        },
        `+=1.3`
      );
  }
}
const B = `<span class="st-saved" aria-hidden="true">${renderIcon(`check`)}Saved</span>`;
let V = [
  {
    id: `s-mac`,
    device: `MacBook Pro`,
    app: `Safari 19 · macOS`,
    where: `Asheville, NC`,
    at: Date.now(),
    ico: `sidebar`,
    me: true,
  },
  {
    id: `s-iphone`,
    device: `iPhone 16`,
    app: `Vessa for iOS`,
    where: `Asheville, NC`,
    at: Date.now() - 2 * 3600000,
    ico: `mobile`,
  },
  {
    id: `s-ipad`,
    device: `iPad Air`,
    app: `Safari · iPadOS`,
    where: `Weaverville, NC`,
    at: Date.now() - 3 * ONE_DAY_MS,
    ico: `mobile`,
  },
];
function We() {
  let t = store.settings.me;
  return `${renderPageHeader({
    eyebrow: `Your profile and how you sign in`,
    title: `Account`,
  })}
  <div class="st-grid st-grid--account">
    <div class="st-stack">
    <section class="card st-profile" aria-labelledby="ac-p-t">
      <header class="card__head"><div><h2 class="card__title" id="ac-p-t">Profile</h2><p class="card__sub">How teammates see you on orders, counts and the activity log</p></div></header>
      <div class="st-profile__body">
        <div class="st-profile__id"><span data-k="ac-av">${renderAvatar(TRANSFER_STATUS_TONES, `xl`)}</span><div><b data-k="ac-name">${escapeHtml(t.name)}</b><small data-k="ac-role">${escapeHtml(t.title)} · ${escapeHtml(ROLE_NAMES[findMemberById(`m-okafor`)?.role ?? `admin`])}</small></div></div>
        <form class="st-form" data-k="ac-form" novalidate>
          ${z({
            name: `name`,
            label: `Full name`,
            value: t.name,
            ac: `name`,
          })}
          ${z({
            name: `email`,
            label: `Work email`,
            value: t.email,
            type: `email`,
            ac: `email`,
          })}
          ${z({
            name: `title`,
            label: `Job title`,
            value: t.title,
            ac: `organization-title`,
          })}
          ${z({
            name: `phone`,
            label: `Phone`,
            value: t.phone,
            type: `tel`,
            ac: `tel`,
          })}
          <div class="st-form__foot st-field--wide"><span class="st-dirty" data-k="ac-dirty">${renderIcon(`edit`)}Unsaved changes</span>
            <button type="button" class="btn btn--ghost btn--sm" data-k="ac-reset">Discard</button><button type="submit" class="btn btn--primary btn--sm" data-k="ac-save" disabled>${renderIcon(`check`)}Save profile</button></div>
        </form>
      </div>
    </section>
    <section class="card st-sess" aria-labelledby="ac-s-t">
      <header class="card__head"><div><h2 class="card__title" id="ac-s-t">Where you’re signed in</h2><p class="card__sub" data-k="ac-s-sub"></p></div>
        <div class="card__tools"><button type="button" class="btn btn--ghost btn--sm" data-k="ac-out">${renderIcon(`logout`)}Sign out other sessions</button></div></header>
      <div class="rows" data-k="ac-sessions"></div>
    </section>
    </div>
    <div class="st-stack">
    <section class="card st-pass" aria-labelledby="ac-pw-t">
      <header class="card__head"><div><h2 class="card__title" id="ac-pw-t">Password</h2><p class="card__sub">Changed ${formatDate(Date.now() - 64 * ONE_DAY_MS, true)}</p></div>${renderTag(`lock`, `ocean`, `sm`)}</header>
      <form class="st-form st-form--one" data-k="pw-form" novalidate>
        ${z({
          name: `cur`,
          label: `Current password`,
          type: `password`,
          ac: `current-password`,
        })}
        ${z({
          name: `next`,
          label: `New password`,
          type: `password`,
          ac: `new-password`,
          ph: `At least 8 characters`,
        })}
        <div class="st-strength" aria-live="polite"><span class="meter"><span class="meter__fill" data-k="pw-meter"></span></span><small data-k="pw-label">Use 8 or more characters, with a number</small></div>
        ${z({
          name: `again`,
          label: `Repeat new password`,
          type: `password`,
          ac: `new-password`,
        })}
        <div class="st-form__foot"><button type="submit" class="btn btn--dark btn--sm">${renderIcon(`key`)}Change password</button></div>
      </form>
    </section>
    <section class="card st-look" aria-labelledby="ac-th-t">
      <header class="card__head"><div><h2 class="card__title" id="ac-th-t">Appearance</h2><p class="card__sub">Saved on this device</p></div></header>
      <div class="st-themes" role="group" aria-label="Theme">${[`light`, `dark`, `system`]
        .map(
          (
            e
          ) => `<button type="button" class="st-theme" data-pref="${e}" aria-pressed="${getSavedTheme() === e}">
        <span class="st-theme__prev" data-pv="${e}" aria-hidden="true"><i class="st-pv"><i></i><i></i><i></i></i>${e === `system` ? `<i class="st-pv st-pv--dark"><i></i><i></i><i></i></i>` : ``}</span>
        <span class="st-theme__name">${renderIcon(e === `light` ? `sun` : e === `dark` ? `moon` : `sidebar`)}${e === `light` ? `Light` : e === `dark` ? `Dark` : `System`}<span class="st-theme__tick">${renderIcon(`check`)}</span></span>
      </button>`
        )
        .join(``)}</div>
      <div class="st-accent">
        <div class="st-accent__head"><b>Accent colour</b><small data-k="ac-accent-name">${escapeHtml(getCurrentAccentName())}</small></div>
        <p class="st-accent__sub">Buttons, links, the active page and chart highlights. Pick one, or choose any colour — Vessa tunes it so text stays readable in light and dark.</p>
        <div data-k="ac-accents">${renderAccentPickerHtml()}</div>
      </div>
    </section>
    </div>
  </div>`;
}
function Ge() {
  let t = I(`ac-sessions`);
  t.innerHTML =
    V.map(
      (t) =>
        `<div class="row st-sess__row" data-key="${t.id}">${renderTag(t.ico, t.me ? `pine` : `slate`)}<span class="row__txt"><b>${escapeHtml(t.device)}${t.me ? ` <span class="st-this">This device</span>` : ``}</b><small>${escapeHtml(t.app)} · ${escapeHtml(t.where)}</small></span><span class="row__end">${t.me ? renderPill(`Active now`, `sage`) : escapeHtml(formatRelativeTime(t.at))}</span></div>`
    ).join(``) +
    (V.length === 1
      ? `<p class="st-sess__only">${renderIcon(`shield`)}Only this Mac is signed in. Anyone else will need your password.</p>`
      : ``);
  I(`ac-s-sub`).textContent = pluralize(V.length, `device`);
  I(`ac-out`).hidden = V.length < 2;
}
function Ke() {
  let e = I(`ac-form`);
  let t = store.settings.me;
  let r = (t) => e.elements.namedItem(t).value.trim();
  return (
    r(`name`) !== t.name ||
    r(`email`) !== t.email ||
    r(`title`) !== t.title ||
    r(`phone`) !== t.phone
  );
}
function qe() {
  let e = Ke();
  let t = I(`ac-save`);
  let n = I(`ac-dirty`);
  let r = !t.disabled;
  t.disabled = !e;
  I(`ac-reset`).hidden = !e;
  n.hidden = !e;
  if (e && !r) {
    animatePop(n, {
      from: 0.8,
    });
  }
}
function Je() {
  let e = I(`ac-form`);
  let t = store.settings.me;
  [`name`, `email`, `title`, `phone`].forEach((n) => {
    let r = e.elements.namedItem(n);
    r.value = t[n];
    R(r, ``);
  });
  qe();
}
function Ye() {
  let e = getSavedTheme();
  domQueryAll(`.st-theme`, P).forEach((t) =>
    t.setAttribute(`aria-pressed`, String(t.dataset.pref === e))
  );
}
function account() {
  let e = F(`account`);
  e.innerHTML = We();
  bindAccentPicker(I(`ac-accents`), () => {
    I(`ac-accent-name`).textContent = getCurrentAccentName();
  });
  Ge();
  Je();
  let r = I(`ac-form`);
  r.addEventListener(`input`, qe);
  I(`ac-reset`).addEventListener(`click`, () => Je());
  r.addEventListener(`submit`, (e) => {
    e.preventDefault();
    let i = (e) => r.elements.namedItem(e);
    let a = i(`name`).value.trim();
    let email = i(`email`).value.trim();
    let c = i(`title`).value.trim();
    let phone = i(`phone`).value.trim();
    let u = null;
    R(i(`name`), a.length >= 2 ? `` : `Enter your name.`);
    if (a.length < 2) {
      u = i(`name`);
    }
    let d = Ve.test(email)
      ? store.team.some((e) => e.id !== `m-okafor` && e.email.toLowerCase() === email.toLowerCase())
        ? `A teammate already uses that email.`
        : ``
      : `That email doesn’t look right.`;
    R(i(`email`), d);
    if (d && !u) {
      u = i(`email`);
    }
    let m = phone && phone.replace(/\D/g, ``).length < 7 ? `Use a full phone number.` : ``;
    R(i(`phone`), m);
    if (m && !u) {
      u = i(`phone`);
    }
    if (u) {
      u.focus();
      return;
    }
    Object.assign(store.settings.me, {
      name: a,
      email,
      title: c || `Teammate`,
      phone,
    });
    let h = findMemberById(TRANSFER_STATUS_TONES);
    if (h) {
      Object.assign(h, {
        name: a,
        email,
        title: c || h.title,
        phone,
      });
    }
    notifyStoreSubscribers(`settings`, `team`);
    I(`ac-name`).textContent = a;
    I(`ac-role`).textContent = `${store.settings.me.title} · ${ROLE_NAMES[h?.role ?? `admin`]}`;
    I(`ac-av`).innerHTML = renderAvatar(TRANSFER_STATUS_TONES, `xl`);
    animatePop(domQuery(`.av`, I(`ac-av`)), {
      from: 0.7,
    });
    Je();
    showToast(`Profile saved`, {
      ico: `user`,
    });
  });
  let i = domQuery(`[data-k="pw-form"]`, e);
  let s = (e) => {
    let t = 0;
    if (e.length >= 8) {
      t++;
    }
    if (e.length >= 12) {
      t++;
    }
    if (/\d/.test(e)) {
      t++;
    }
    if (/[^A-Za-z0-9]/.test(e)) {
      t++;
    }
    if (/[A-Z]/.test(e) && /[a-z]/.test(e)) {
      t++;
    }
    return Math.min(4, t);
  };
  let c = [
    `Use 8 or more characters, with a number`,
    `Weak — add length and a number`,
    `Fair — add a symbol or capitals`,
    `Good`,
    `Strong`,
  ];
  let l = [`faint`, `rose`, `ochre`, `teal`, `sage`];
  i.addEventListener(`input`, (e) => {
    let e_target = e.target;
    R(e_target, ``);
    if (e_target.name !== `next`) {
      return;
    }
    let n = e_target.value ? s(e_target.value) : 0;
    let r = I(`pw-meter`);
    r.style.setProperty(`--c`, `var(--${l[n]})`);
    gsap.to(r, {
      scaleX: e_target.value ? Math.max(0.08, n / 4) : 0,
      duration: motionDuration(0.5),
      ease: `power3.out`,
    });
    I(`pw-label`).textContent = e_target.value ? c[n] : c[0];
  });
  i.addEventListener(`submit`, (e) => {
    e.preventDefault();
    let t = (e) => i.elements.namedItem(e);
    let n = t(`cur`);
    let r = t(`next`);
    let a = t(`again`);
    let s = [
      [n, n.value ? `` : `Enter your current password.`],
      [
        r,
        r.value.length < 8
          ? `Use at least 8 characters.`
          : r.value === n.value
            ? `Pick a password you haven’t used here.`
            : ``,
      ],
      [a, a.value === r.value ? `` : `The two new passwords don’t match.`],
    ];
    s.forEach(([e, t]) => R(e, t));
    let l = s.find(([, e]) => e);
    if (l) {
      l[0].focus();
      return;
    }
    i.reset();
    gsap.to(I(`pw-meter`), {
      scaleX: 0,
      duration: motionDuration(0.4),
    });
    I(`pw-label`).textContent = c[0];
    domQuery(`.card__sub`, i.closest(`.card`)).textContent = `Changed just now`;
    showToast(`Password changed — other devices stay signed in`, {
      ico: `lock`,
    });
  });
  e.addEventListener(`click`, (e) => {
    let t = e.target.closest(`.st-theme`);
    if (t) {
      openNewTransferModal(t);
      setSavedTheme(t.dataset.pref, t);
      Ye();
      return;
    }
  });
  I(`ac-out`).addEventListener(`click`, async (e) => {
    let e_currentTarget = e.currentTarget;
    openNewTransferModal(e_currentTarget);
    let n = V.filter((e) => !e.me);
    if (
      !n.length ||
      !(await confirmDialog(
        `Sign out other sessions?`,
        `${n.map((e) => e.device).join(` and `)} will need your password to get back in.`,
        `Sign them out`
      ))
    ) {
      return;
    }
    let r = n.map((e) => queryOne(`[data-key="${e.id}"]`, I(`ac-sessions`))).filter((e) => !!e);
    let r_length = r.length;
    let a = () => {
      if (!(--r_length > 0)) {
        bindModalDismiss(I(`ac-sessions`), () => {
          V = V.filter((e) => e.me);
          Ge();
        });
        showToast(`Signed out of ${pluralize(n.length, `other device`)}`, {
          ico: `logout`,
        });
      }
    };
    r.forEach((e) => animateElementOut(e, a));
    if (!r.length) {
      r_length = 1;
      a();
    }
  });
}
function Ze() {
  let e = F(`account`);
  gsap
    .timeline()
    .add(animatePageTransition(e), 0)
    .add(
      animateCards(domQueryAll(`.card`, e), {
        stagger: 0.07,
      }),
      0.1
    )
    .add(
      animateRows(domQueryAll(`.st-field, .st-theme, .st-sess__row`, e), {
        y: 10,
        stagger: 0.03,
      }),
      0.3
    );
  animatePop(queryOne(`.st-profile__id .av`, e), {
    from: 0.6,
    delay: 0.3,
  });
  gsap.set(I(`pw-meter`), {
    scaleX: 0,
  });
}
const Qe = [
  `January`,
  `February`,
  `March`,
  `April`,
  `May`,
  `June`,
  `July`,
  `August`,
  `September`,
  `October`,
  `November`,
  `December`,
];
const $e = [
  [`America/New_York`, `Eastern (New York)`],
  [`America/Chicago`, `Central (Chicago)`],
  [`America/Denver`, `Mountain (Denver)`],
  [`America/Los_Angeles`, `Pacific (Los Angeles)`],
];
function et() {
  let company = store.settings.company;
  let prefs = store.settings.prefs;
  return `${renderPageHeader({
    eyebrow: `The business behind Vessa`,
    title: `Company`,
  })}
  <div class="st-grid st-grid--company">
    <div class="st-stack">
    <section class="card st-co" aria-labelledby="co-d-t">
      <header class="card__head"><div><h2 class="card__title" id="co-d-t">Business details</h2><p class="card__sub">On invoices, packing slips and purchase orders</p></div>${renderTag(`building`, `pine`, `sm`)}</header>
      <form class="st-form" data-k="co-form" novalidate>
        ${z({
          name: `name`,
          label: `Trading name`,
          value: company.name,
        })}
        ${z({
          name: `legal`,
          label: `Legal name`,
          value: company.legal,
        })}
        ${z({
          name: `email`,
          label: `Contact email`,
          value: company.email,
          type: `email`,
        })}
        ${z({
          name: `phone`,
          label: `Phone`,
          value: company.phone,
          type: `tel`,
        })}
        ${z({
          name: `address`,
          label: `Registered address`,
          value: company.address,
          wide: true,
        })}
        ${z({
          name: `taxId`,
          label: `EIN`,
          value: company.taxId,
          ph: `00-0000000`,
        })}
        ${He(`currency`, `Currency`, company.currency, [
          [`USD`, `US dollar (USD)`],
          [`CAD`, `Canadian dollar (CAD)`],
          [`EUR`, `Euro (EUR)`],
          [`GBP`, `Pound sterling (GBP)`],
        ])}
        ${He(`timezone`, `Time zone`, company.timezone, $e)}
        ${He(
          `fiscalStart`,
          `Financial year starts`,
          company.fiscalStart,
          Qe.map((e) => [e, e])
        )}
        <div class="st-form__foot st-field--wide"><span class="st-dirty" data-k="co-dirty" hidden>${renderIcon(`edit`)}Unsaved changes</span><button type="submit" class="btn btn--primary btn--sm" data-k="co-save" disabled>${renderIcon(`check`)}Save details</button></div>
      </form>
    </section>
    <section class="card st-data" aria-labelledby="co-x-t">
      <header class="card__head"><div><h2 class="card__title" id="co-x-t">Your data</h2><p class="card__sub">Everything Vessa holds, as CSV</p></div></header>
      <div class="st-exports">
        <button type="button" class="st-export" data-export="stock">${renderTag(`boxes`, `pine`, `sm`)}<span><b>Stock</b><small>Every product by location</small></span>${renderIcon(`download`)}</button>
        <button type="button" class="st-export" data-export="orders">${renderTag(`orders`, `sky`, `sm`)}<span><b>Orders</b><small>${pluralize(store.orders.length, `sales order`)}</small></span>${renderIcon(`download`)}</button>
        <button type="button" class="st-export" data-export="moves">${renderTag(`layers`, `teal`, `sm`)}<span><b>Stock ledger</b><small>${pluralize(store.moves.length, `movement`)}</small></span>${renderIcon(`download`)}</button>
      </div>
      <div class="st-danger">
        <div><b>Reset demo data</b><small>Puts every product, order, batch and setting back to Monday morning. Your theme stays.</small></div>
        <button type="button" class="btn btn--danger btn--sm" data-k="co-reset">${renderIcon(`refresh`)}Reset data</button>
      </div>
    </section>
    </div>
    <div class="st-stack">
    <section class="card st-prefs" aria-labelledby="co-p-t">
      <header class="card__head"><div><h2 class="card__title" id="co-p-t">Stock preferences</h2><p class="card__sub">Every page reads these the moment they change</p></div></header>
      <div class="st-pref" data-k="pref-exp">
        <div class="st-pref__txt"><b>Expiry warning</b><small>Released lots inside this window raise an “Expiring soon” alert. <span data-k="co-exp-n"></span></small></div>
        <div class="st-pref__ctl">${renderSegmentedControl(
          `Expiry warning`,
          [
            [`30`, `30 d`],
            [`60`, `60 d`],
            [`90`, `90 d`],
            [`120`, `120 d`],
          ],
          String(prefs.expiryWarnDays),
          `st-seg-exp`
        )}${B}</div>
      </div>
      <div class="st-pref" data-k="pref-low">
        <div class="st-pref__txt"><b>Low stock is judged by</b><small>A fixed reorder point per product, or how many days the stock will last.</small></div>
        <div class="st-pref__ctl">${renderSegmentedControl(
          `Low stock mode`,
          [
            [`fixed`, `Reorder point`],
            [`cover`, `Days of cover`],
          ],
          prefs.lowStockMode,
          `st-seg-low`
        )}${B}</div>
      </div>
      <div class="st-pref" data-k="pref-loc">
        <div class="st-pref__txt"><b>Ship from</b><small>The location new sales orders pick from.</small></div>
        <div class="st-pref__ctl"><select class="select" data-k="co-loc" aria-label="Default ship-from location">${store.locations.map((t) => `<option value="${t.id}"${t.id === prefs.defaultLoc ? ` selected` : ``}>${escapeHtml(t.name)}</option>`).join(``)}</select>${B}</div>
      </div>
      <div class="st-pref" data-k="pref-week">
        <div class="st-pref__txt"><b>Week starts on</b><small>For weekly charts, the order heatmap and counts.</small></div>
        <div class="st-pref__ctl">${renderSegmentedControl(
          `Week starts on`,
          [
            [`mon`, `Monday`],
            [`sun`, `Sunday`],
          ],
          prefs.weekStart,
          `st-seg-week`
        )}${B}</div>
      </div>
    </section>
    <section class="card st-locs" aria-labelledby="co-l-t">
      <header class="card__head"><div><h2 class="card__title" id="co-l-t">Locations</h2><p class="card__sub">${pluralize(store.locations.length, `site`)} holding stock</p></div><div class="card__tools"><a class="btn btn--ghost btn--sm" href="#/warehouses/locations">${renderIcon(`warehouse`)}Manage</a></div></header>
      <div class="rows" data-k="co-locs"></div>
    </section>
    </div>

  </div>`;
}
function tt() {
  let e = I(`co-form`);
  let company = store.settings.company;
  return Object.keys(company).some((n) => {
    let r = e.elements.namedItem(n);
    return r && r.value.trim() !== company[n];
  });
}
function nt() {
  let e = tt();
  let t = I(`co-save`);
  let n = I(`co-dirty`);
  let r = !t.disabled;
  t.disabled = !e;
  n.hidden = !e;
  if (e && !r) {
    animatePop(n, {
      from: 0.8,
    });
  }
}
function rt(t) {
  let r = I(`co-locs`);
  r.innerHTML = store.locations
    .map((n) => {
      let r = getLocationStockUnits(n.id);
      let i = Math.min(1, r / n.capacity);
      let a = n.kind === `dc` ? `pine` : n.kind === `lab` ? `ocean` : `ochre`;
      return `<a class="row st-loc" href="#/warehouses/locations/${n.id}">${renderTag(n.kind === `dc` ? `warehouse` : n.kind === `lab` ? `flask` : `store`, a)}<span class="row__txt"><b>${escapeHtml(n.name)}</b><small>${escapeHtml(n.address)}, ${escapeHtml(n.city)} · ${escapeHtml(findMemberById(n.managerId)?.name ?? ``)}</small><span class="meter"><span class="meter__fill" style="--c:var(--${a});transform:scaleX(${t ? 0 : i})" data-to="${Math.max(0.02, i)}"></span></span></span><span class="row__end"><b>${formatInt(r)}</b>of ${formatInt(n.capacity)}</span></a>`;
    })
    .join(``);
  if (t) {
    gsap.to(domQueryAll(`.meter__fill`, r), {
      scaleX: (e, t) => Number(t.dataset.to),
      duration: motionDuration(1),
      stagger: motionDuration(0.08),
      delay: motionDuration(0.45),
      ease: `power3.inOut`,
    });
  }
}
function it(e = false) {
  let length = getExpiringBatches().length;
  let n = I(`co-exp-n`);
  n.innerHTML = `Right now <b class="num" data-k="co-exp-c">${length}</b> ${length === 1 ? `lot falls` : `lots fall`} inside it.`;
  if (!e) {
    getAvailableSuppliers(domQuery(`[data-k="co-exp-c"]`, n));
  }
}
function company() {
  let e = F(`company`);
  e.innerHTML = et();
  rt(false);
  it(true);
  let r = I(`co-form`);
  r.addEventListener(`input`, nt);
  r.addEventListener(`change`, nt);
  r.addEventListener(`submit`, (e) => {
    e.preventDefault();
    let i = (e) => r.elements.namedItem(e);
    let a = [
      [`name`, i(`name`).value.trim() ? `` : `Enter the trading name.`],
      [`legal`, i(`legal`).value.trim() ? `` : `Enter the legal name.`],
      [`email`, Ve.test(i(`email`).value.trim()) ? `` : `That email doesn’t look right.`],
      [
        `taxId`,
        /^\d{2}-?\d{7}$/.test(i(`taxId`).value.trim()) ? `` : `An EIN is nine digits: 12-3456789.`,
      ],
    ];
    a.forEach(([e, t]) => R(i(e), t));
    let s = a.find(([, e]) => e);
    if (s) {
      i(s[0]).focus();
      return;
    }
    let company = store.settings.company;
    Object.keys(company).forEach((e) => {
      let t = i(e);
      if (t) {
        company[e] = t.value.trim();
      }
    });
    notifyStoreSubscribers(`settings`);
    nt();
    showToast(`${company.name} details saved`, {
      ico: `building`,
    });
  });
  let i = (e, t, n) => {
    t();
    Ue(I(e));
    showToast(n, {
      ico: `check`,
    });
  };
  initSegmentedControl(domQuery(`.st-seg-exp`, e), (e) =>
    i(
      `pref-exp`,
      () => {
        store.settings.prefs.expiryWarnDays = Number(e);
        notifyStoreSubscribers(`settings`, `batches`);
        it();
      },
      `Expiry alerts now start ${e} days out`
    )
  );
  initSegmentedControl(domQuery(`.st-seg-low`, e), (e) =>
    i(
      `pref-low`,
      () => {
        store.settings.prefs.lowStockMode = e;
        notifyStoreSubscribers(`settings`);
      },
      e === `fixed` ? `Low stock follows each reorder point` : `Low stock follows days of cover`
    )
  );
  initSegmentedControl(domQuery(`.st-seg-week`, e), (e) =>
    i(
      `pref-week`,
      () => {
        store.settings.prefs.weekStart = e;
        notifyStoreSubscribers(`settings`);
      },
      `Weeks now start on ${e === `mon` ? `Monday` : `Sunday`}`
    )
  );
  I(`co-loc`).addEventListener(`change`, (e) => {
    let value = e.target.value;
    i(
      `pref-loc`,
      () => {
        store.settings.prefs.defaultLoc = value;
        notifyStoreSubscribers(`settings`);
      },
      `New orders ship from ${exportDataBackup(value)?.name ?? value}`
    );
  });
  e.addEventListener(`click`, async (e) => {
    let e_target = e.target;
    let n = e_target.closest(`[data-export]`);
    if (n) {
      openNewTransferModal(n);
      if (n.dataset.export === `stock`) {
        exportStockCsv();
      } else if (n.dataset.export === `orders`) {
        exportOrdersCsv();
      } else {
        exportMovementsCsv();
      }
      return;
    }
    let r = e_target.closest(`[data-k="co-reset"]`);
    if (r) {
      openNewTransferModal(r);
      if (
        !(await confirmDialog(
          `Reset all demo data?`,
          `Every change you made — orders, batches, stock, teammates and settings — goes back to how it was on Monday morning. This can’t be undone.`,
          `Reset everything`
        ))
      ) {
        return;
      }
      resetDemoData();
      showToast(`Demo data reset — reloading`, {
        ico: `refresh`,
      });
      setTimeout(() => location.reload(), 900);
    }
  });
}
function ot() {
  let e = F(`company`);
  gsap
    .timeline()
    .add(animatePageTransition(e), 0)
    .add(
      animateCards(domQueryAll(`.card`, e), {
        stagger: 0.07,
      }),
      0.1
    )
    .add(
      animateRows(domQueryAll(`.st-field, .st-pref, .st-export, .st-danger`, e), {
        y: 10,
        stagger: 0.025,
      }),
      0.3
    )
    .add(
      animateRows(domQueryAll(`.st-loc`, e), {
        x: 10,
        y: 0,
        stagger: 0.06,
      }),
      0.35
    );
  domQueryAll(`.st-loc .meter__fill`, e).forEach((e, t) =>
    gsap.fromTo(
      e,
      {
        scaleX: 0,
      },
      {
        scaleX: Number(e.dataset.to),
        duration: motionDuration(1),
        delay: motionDuration(0.45 + t * 0.08),
        ease: `power3.inOut`,
      }
    )
  );
}
const st = [`owner`, `admin`, `manager`, `staff`, `viewer`];
const ct = [`admin`, `manager`, `staff`, `viewer`];
const lt = {
  active: [`sage`, `Active`],
  away: [`ochre`, `Away`],
  invited: [`sky`, `Invited`],
};
let ut = ``;
let H = `all`;
const U = () => store.team.filter((e) => e.status !== `invited`).length;
function dt() {
  return `${renderPageHeader({
    eyebrow: `Who works in Vessa and what they can do`,
    title: `Team & roles`,
    actions: `<button type="button" class="btn btn--primary magnetic" data-k="tm-invite">${renderIcon(`userPlus`)}Invite teammate</button>`,
    stats: [
      {
        key: `members`,
        icon: `users`,
        label: `Members`,
        value: store.team.length,
        ico: `pine`,
      },
      {
        key: `active`,
        icon: `check`,
        label: `Active today`,
        value: store.team.filter((e) => e.status === `active`).length,
        ico: `sage`,
      },
      {
        key: `invited`,
        icon: `send`,
        label: `Pending invites`,
        value: store.team.filter((e) => e.status === `invited`).length,
        ico: `sky`,
      },
      {
        key: `seats`,
        icon: `key`,
        label: `Seats left`,
        value: Math.max(0, store.settings.billing.seats - U()),
        suffix: `of ${store.settings.billing.seats}`,
        ico: `ochre`,
      },
    ],
  })}
  <section class="card st-members tcard" aria-labelledby="tm-t">
    <header class="card__head"><div><h2 class="card__title" id="tm-t">Members</h2><p class="card__sub" data-k="tm-sub"></p></div>
      <div class="card__tools"><label class="search">${renderIcon(`search`)}<input type="search" placeholder="Search people…" aria-label="Search people" data-k="tm-q" /></label></div></header>
    <div class="toolbar"><div class="chips" data-k="tm-roles">${[`all`, ...ct].map((t) => `<button type="button" class="chip" data-role-f="${t}" aria-pressed="${t === H}">${t === `all` ? `Everyone` : escapeHtml(ROLE_NAMES[t])} <b data-rn="${t}"></b></button>`).join(``)}</div></div>
    <div class="table-wrap"><table class="table table--stack st-mtable" style="--areas:'t x' 's p' 'r r'">
      <thead><tr><th scope="col">Person</th><th scope="col">Works at</th><th scope="col">Role</th><th scope="col">Status</th><th scope="col"><span class="sr">Actions</span></th></tr></thead>
      <tbody data-k="tm-rows"></tbody>
    </table></div>
  </section>
  <div class="st-grid st-grid--team">
    <section class="card st-perms tcard" aria-labelledby="tm-p-t">
      <header class="card__head"><div><h2 class="card__title" id="tm-p-t">What each role can do</h2><p class="card__sub">Roles are set per person above</p></div></header>
      <div class="table-wrap"><table class="table st-matrix">
        <thead><tr><th scope="col">Permission</th>${st.map((t) => `<th scope="col" class="st-matrix__role" data-col="${t}">${escapeHtml(ROLE_NAMES[t])}<small data-rc="${t}"></small></th>`).join(``)}</tr></thead>
        <tbody>${CATEGORY_NAMES.map((t) => `<tr><th scope="row">${escapeHtml(t.label)}</th>${st.map((n) => `<td data-col="${n}">${t.roles.includes(n) ? `<span class="st-yes" role="img" aria-label="${escapeHtml(ROLE_NAMES[n])} can"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" pathLength="1"/></svg></span>` : `<span class="st-no" role="img" aria-label="${escapeHtml(ROLE_NAMES[n])} cannot"></span>`}</td>`).join(``)}</tr>`).join(``)}</tbody>
      </table></div>
    </section>
    <section class="card st-seats" aria-labelledby="tm-s-t">
      <header class="card__head"><div><h2 class="card__title" id="tm-s-t">Seats</h2><p class="card__sub" data-k="tm-plan"></p></div></header>
      <div class="st-seats__fig"><b class="num" data-k="tm-used">0</b><span>of <b data-k="tm-cap"></b> seats in use</span></div>
      <span class="meter st-seats__meter"><span class="meter__fill" data-k="tm-meter" style="--c:var(--pine)"></span><span class="meter__fill st-seats__inv" data-k="tm-meter-inv" style="--c:var(--sky)"></span></span>
      <ul class="st-seats__key"><li><i class="dot" style="--c:var(--pine)"></i>Active and away</li><li><i class="dot" style="--c:var(--sky)"></i>Invited, not joined yet</li></ul>
      <p class="st-seats__note" data-k="tm-note"></p>
      <a class="btn btn--ghost btn--sm" href="#/settings/billing">${renderIcon(`card`)}Change seats</a>
    </section>
  </div>`;
}
function ft(t, n) {
  let [r, i] = lt[t.status];
  let a = t.id === TRANSFER_STATUS_TONES;
  let o = t.role === `owner`;
  return `<tr class="is-link" data-key="${t.id}" data-open="${t.id}">
    <td class="a-t"><span class="cell-person">${renderAvatar(t.id, `md`)}<span><b>${highlightSearchMatch(t.name, n)}${a ? ` <span class="st-this">You</span>` : ``}</b><small>${highlightSearchMatch(t.title, n)} · ${highlightSearchMatch(t.email, n)}</small></span></span></td>
    <td class="a-s" data-label="Works at">${escapeHtml(exportDataBackup(t.locId)?.name ?? ``)}</td>
    <td class="a-r"><select class="select st-role" data-role="${t.id}" aria-label="Role for ${escapeHtml(t.name)}" ${a || o ? `disabled title="${a ? `You can’t change your own role` : `The owner’s role is fixed`}"` : ``}>${(o ? st : ct).map((n) => `<option value="${n}"${n === t.role ? ` selected` : ``}>${escapeHtml(ROLE_NAMES[n])}</option>`).join(``)}</select></td>
    <td class="a-p">${renderPill(i, r)}</td>
    <td class="a-x r">${t.status === `invited` ? renderIconButton(`send`, `Resend invite to ${t.name}`, `data-resend="${t.id}"`, `ibtn--sm`) : ``}${a || o ? `` : renderIconButton(`trash`, `Remove ${t.name}`, `data-remove="${t.id}"`, `ibtn--sm`)}</td>
  </tr>`;
}
function W(e) {
  let t = ut.trim().toLowerCase();
  [`all`, ...ct].forEach((e) => {
    let t = queryOne(`[data-rn="${e}"]`, P);
    if (t) {
      t.textContent = String(
        e === `all` ? store.team.length : store.team.filter((t) => t.role === e).length
      );
    }
  });
  let r = store.team.filter(
    (e) =>
      (H === `all` || e.role === H) &&
      (!t || `${e.name} ${e.title} ${e.email} ${e.team}`.toLowerCase().includes(t))
  );
  let i = r.length
    ? r.map((e) => ft(e, t)).join(``)
    : `<tr><td colspan="5">${t || H !== `all` ? renderEmptyState(t ? `No one matches “${ut.trim()}”` : `No ${ROLE_NAMES[H].toLowerCase()}s`, t ? `Search by name, job title or email.` : `Nobody holds this role yet — change one above or invite someone.`, `users`, `<button type="button" class="btn btn--ghost btn--sm" data-k="tm-clear">Show everyone</button>`) : renderEmptyState(`Just you so far`, `Invite the people who pick, pack and make — they get an email with a link.`, `userPlus`, `<button type="button" class="btn btn--primary btn--sm" data-k="tm-invite2">Invite teammate</button>`)}</td></tr>`;
  let a = I(`tm-rows`);
  if (e) {
    bindModalDismiss(a, () => {
      a.innerHTML = i;
    });
  } else {
    a.innerHTML = i;
  }
  I(`tm-sub`).textContent =
    `${pluralize(store.team.length, `person`, `people`)} across ${pluralize(new Set(store.team.map((e) => e.locId)).size, `site`)}`;
  st.forEach((e) => {
    let t = queryOne(`[data-rc="${e}"]`, P);
    if (t) {
      t.textContent = String(store.team.filter((t) => t.role === e).length);
    }
  });
}
function pt(e) {
  let billing = store.settings.billing;
  let r = U();
  let length = store.team.filter((e) => e.status === `invited`).length;
  getAvailableLocations(I(`tm-used`), r, formatInt, {
    from: e ? 0 : undefined,
    duration: 1,
    delay: e ? 0.4 : 0,
  });
  I(`tm-cap`).textContent = String(billing.seats);
  I(`tm-plan`).textContent =
    `${billing.plan} plan · up to ${G.find((e) => e.name === billing.plan)?.cap ?? billing.seats} seats`;
  gsap.to(I(`tm-meter`), {
    scaleX: Math.min(1, r / billing.seats),
    duration: motionDuration(1),
    delay: motionDuration(e ? 0.45 : 0),
    ease: `power3.inOut`,
  });
  let a = I(`tm-meter-inv`);
  gsap.to(a, {
    scaleX: Math.min(1, (r + length) / billing.seats),
    duration: motionDuration(1),
    delay: motionDuration(e ? 0.55 : 0),
    ease: `power3.inOut`,
  });
  let o = billing.seats - r;
  I(`tm-note`).innerHTML =
    o <= 0
      ? `${renderIcon(`alert`)}<span>Every seat is taken — add seats before the next invite.</span>`
      : o <= 2
        ? `${renderIcon(`info`)}<span><b>${pluralize(o, `seat`)}</b> left. Invites don’t use a seat until they join.</span>`
        : `${renderIcon(`check`)}<span><b>${pluralize(o, `seat`)}</b> free for new teammates.</span>`;
}
function mt() {
  let e = F(`team`);
  let t = (t, n) => renderFilterBar(queryOne(`[data-stat="${t}"] b[data-count]`, e), n);
  t(`members`, store.team.length);
  t(`active`, store.team.filter((e) => e.status === `active`).length);
  t(`invited`, store.team.filter((e) => e.status === `invited`).length);
  t(`seats`, Math.max(0, store.settings.billing.seats - U()));
  let r = queryOne(`[data-stat="seats"] .stat__suffix`, e);
  if (r) {
    r.textContent = `of ${store.settings.billing.seats}`;
  }
}
function ht(e = 0) {
  let t = domQueryAll(`.st-yes path`, P);
  if (bindMagnetic()) {
    gsap.set(t, {
      strokeDashoffset: 0,
    });
    return;
  }
  gsap.fromTo(
    t,
    {
      strokeDasharray: 1,
      strokeDashoffset: 1,
    },
    {
      strokeDashoffset: 0,
      duration: motionDuration(0.45),
      ease: `power2.out`,
      stagger: {
        each: motionDuration(0.025),
        from: `start`,
      },
      delay: motionDuration(e),
    }
  );
}
const gt = (since) => {
  let t = Math.floor((Date.now() - since) / (30.4 * ONE_DAY_MS));
  if (t < 1) {
    return `This month`;
  }
  if (t < 12) {
    return `${pluralize(t, `month`)} on the team`;
  }
  return `${pluralize(Math.floor(t / 12), `year`)}${t % 12 ? `, ${pluralize(t % 12, `month`)}` : ``} on the team`;
};
function _t(t) {
  let n = findMemberById(t);
  if (!n) {
    history.replaceState(null, ``, `#/settings/team`);
    return;
  }
  let [r, i] = lt[n.status];
  let a = n.id === TRANSFER_STATUS_TONES;
  openDrawer(
    `<div class="d-head">${renderAvatar(n.id, `lg`)}<div><h2>${escapeHtml(n.name)}</h2><small>${escapeHtml(n.title)} · ${escapeHtml(n.team)}</small></div></div>
    <div class="d-pills">${renderPill(i, r)}${renderPill(ROLE_NAMES[n.role], `pine`, `shield`)}</div>
    <div class="d-facts"><div><small>Works at</small><b>${escapeHtml(exportDataBackup(n.locId)?.name ?? ``)}</b><span>${escapeHtml(exportDataBackup(n.locId)?.city ?? ``)}</span></div><div><small>${n.status === `invited` ? `Invited` : `Joined`}</small><b>${formatDate(n.since, true)}</b><span>${gt(n.since)}</span></div></div>
    <div class="d-sec"><h3>Contact</h3><div class="rows"><a class="row" href="mailto:${escapeHtml(n.email)}">${renderTag(`mail`, `sky`, `sm`)}<span class="row__txt"><b>${escapeHtml(n.email)}</b><small>Email</small></span></a>${n.phone ? `<a class="row" href="tel:${escapeHtml(n.phone)}">${renderTag(`phone`, `teal`, `sm`)}<span class="row__txt"><b>${escapeHtml(n.phone)}</b><small>Phone</small></span></a>` : ``}</div></div>
    <div class="d-sec"><h3>As ${escapeHtml(ROLE_NAMES[n.role].toLowerCase())}, ${a ? `you` : n.name.split(` `)[0]} can</h3><ul class="st-can">${CATEGORY_NAMES.map((t) => `<li class="${t.roles.includes(n.role) ? `is-yes` : ``}">${renderIcon(t.roles.includes(n.role) ? `check` : `close`)}${escapeHtml(t.label)}</li>`).join(``)}</ul></div>
    <div class="d-actions"><a class="btn btn--ghost" href="mailto:${escapeHtml(n.email)}">${renderIcon(`mail`)}Email</a>${a || n.role === `owner` ? `` : `<button type="button" class="btn btn--ghost" data-d-remove="${n.id}">${renderIcon(`trash`)}Remove</button>`}</div>`,
    {
      label: n.name,
      onClose: () => {
        if (location.hash.startsWith(`#/settings/team/`)) {
          history.replaceState(null, ``, `#/settings/team`);
        }
      },
      onMount: (e) => {
        e.querySelector(`[data-d-remove]`)?.addEventListener(`click`, () => {
          removeTeammate(n.id);
        });
        animateRows(domQueryAll(`.st-can li`, e), {
          x: 8,
          y: 0,
          stagger: 0.03,
          delay: 0.2,
        });
      },
    }
  );
}
function team() {
  let e = F(`team`);
  e.innerHTML = dt();
  openMoveStockModal(e);
  I(`tm-invite`).addEventListener(`click`, (e) => {
    openNewTransferModal(e.currentTarget);
    openInviteTeammateModal(e.currentTarget);
  });
  I(`tm-q`).addEventListener(`input`, (e) => {
    ut = e.target.value;
    W(true);
  });
  I(`tm-roles`).addEventListener(`click`, (t) => {
    let n = t.target.closest(`[data-role-f]`);
    if (n) {
      openNewTransferModal(n);
      H = n.dataset.roleF;
      domQueryAll(`[data-role-f]`, e).forEach((e) =>
        e.setAttribute(`aria-pressed`, String(e === n))
      );
      W(true);
    }
  });
  e.addEventListener(`change`, (e) => {
    let t = e.target.closest(`[data-role]`);
    if (t) {
      updateMemberRole(t.dataset.role, t.value);
    }
  });
  e.addEventListener(`click`, (t) => {
    let t_target = t.target;
    let r = t_target.closest(`[data-remove]`);
    if (r) {
      openNewTransferModal(r);
      removeTeammate(r.dataset.remove);
      return;
    }
    let i = t_target.closest(`[data-resend]`);
    if (i) {
      openNewTransferModal(i);
      showToast(`Invite sent again to ${findMemberById(i.dataset.resend)?.email ?? ``}`, {
        ico: `send`,
      });
      return;
    }
    if (t_target.closest(`[data-k="tm-clear"]`)) {
      ut = ``;
      H = `all`;
      I(`tm-q`).value = ``;
      domQueryAll(`[data-role-f]`, e).forEach((e) =>
        e.setAttribute(`aria-pressed`, String(e.getAttribute(`data-role-f`) === `all`))
      );
      W(true);
      return;
    }
    let a = t_target.closest(`[data-k="tm-invite2"]`);
    if (a) {
      openInviteTeammateModal(a);
      return;
    }
    let s = t_target.closest(`[data-open]`);
    if (s && !t_target.closest(`select, button, a`)) {
      location.hash = `#/settings/team/${s.dataset.open}`;
    }
  });
  let t = domQuery(`.st-matrix`, e);
  t.addEventListener(`pointerover`, (e) => {
    let n = e.target.closest(`[data-col]`);
    domQueryAll(`[data-col]`, t).forEach((e) =>
      e.classList.toggle(`is-col`, !!n && e.dataset.col === n.dataset.col)
    );
  });
  t.addEventListener(`pointerleave`, () =>
    domQueryAll(`[data-col]`, t).forEach((e) => e.classList.remove(`is-col`))
  );
}
function yt() {
  let e = F(`team`);
  gsap
    .timeline()
    .add(animatePageTransition(e), 0)
    .add(
      animateCards(domQueryAll(`.card`, e), {
        stagger: 0.08,
      }),
      0.15
    )
    .add(
      animateRows(domQueryAll(`.st-mtable tbody tr`, e), {
        y: 10,
        stagger: 0.035,
      }),
      0.35
    )
    .add(
      animateRows(domQueryAll(`[data-role-f]`, e), {
        y: -6,
        stagger: 0.04,
      }),
      0.3
    );
  ht(0.6);
  pt(true);
}
var G = [
  {
    name: `Studio`,
    price: 49,
    cap: 5,
    blurb: `One maker, one shelf`,
    feats: [
      `Up to 5 seats`,
      `1 stock location`,
      `Batches with expiry dates`,
      `Online and studio orders`,
    ],
  },
  {
    name: `Growth`,
    price: 149,
    cap: 15,
    blurb: `A lab that sells wholesale`,
    feats: [
      `Up to 15 seats`,
      `3 stock locations`,
      `QA release and lot holds`,
      `Wholesale orders and stockists`,
      `Purchase orders and suppliers`,
    ],
  },
  {
    name: `Scale`,
    price: 349,
    cap: 50,
    blurb: `Several sites and a team`,
    feats: [
      `Up to 50 seats`,
      `Unlimited locations`,
      `Everything in Growth`,
      `API and webhooks`,
      `SSO and audit export`,
    ],
  },
];
const K = (e, t) => {
  if (t === `yearly`) {
    return e.price * 0.8;
  }
  return e.price;
};
let q = `all`;
function bt() {
  let billing = store.settings.billing;
  return `${renderPageHeader({
    eyebrow: `Your plan, seats and invoices`,
    title: `Billing`,
    stats: [
      {
        key: `bill`,
        icon: `dollar`,
        label: `Per month`,
        value: K(
          G.find((e) => e.name === billing.plan),
          billing.cycle
        ),
        fmt: `money`,
        ico: `pine`,
      },
      {
        key: `seats`,
        icon: `users`,
        label: `Seats in use`,
        value: U(),
        suffix: `of ${billing.seats}`,
        ico: `sky`,
      },
      {
        key: `paid`,
        icon: `receipt`,
        label: `Paid this year`,
        value: billing.invoices
          .filter(
            (e) =>
              e.status === `paid` &&
              new Date(e.at).getFullYear() === new Date(Date.now()).getFullYear()
          )
          .reduce((acc, item) => acc + item.amount, 0),
        fmt: `money`,
        ico: `sage`,
      },
    ],
  })}
  <section class="card st-plans-card" aria-labelledby="bi-p-t">
    <header class="card__head"><div><h2 class="card__title" id="bi-p-t">Plan</h2><p class="card__sub" data-k="bi-next"></p></div>
      <div class="card__tools">${renderSegmentedControl(
        `Billing cycle`,
        [
          [`monthly`, `Monthly`],
          [`yearly`, `Yearly · save 20%`],
        ],
        billing.cycle,
        `st-seg-cycle`
      )}</div></header>
    <div class="st-plans" data-k="bi-plans">${G.map(
      (
        n
      ) => `<div class="st-plan${n.name === billing.plan ? ` is-current` : ``}" data-plan="${n.name}">
      <div class="st-plan__top"><b class="st-plan__name">${escapeHtml(n.name)}</b>${n.name === billing.plan ? `<span class="st-current" data-k="bi-badge">${renderIcon(`check`)}Current</span>` : ``}</div>
      <p class="st-plan__blurb">${escapeHtml(n.blurb)}</p>
      <p class="st-plan__price"><b class="num" data-price="${n.name}">${formatMoneyRound(K(n, billing.cycle))}</b><span>/ month</span></p>
      <p class="st-plan__bill" data-billed="${n.name}"></p>
      <ul class="st-plan__feats">${n.feats.map((t) => `<li>${renderIcon(`check`)}${escapeHtml(t)}</li>`).join(``)}</ul>
      <button type="button" class="btn ${n.name === billing.plan ? `btn--ghost` : `btn--soft`} btn--sm st-plan__go" data-switch="${n.name}" ${n.name === billing.plan ? `disabled` : ``}>${n.name === billing.plan ? `Your plan` : `Switch to ${escapeHtml(n.name)}`}</button>
    </div>`
    ).join(``)}</div>
  </section>
  <div class="st-grid st-grid--billing">
    <section class="card st-pay" aria-labelledby="bi-c-t">
      <header class="card__head"><div><h2 class="card__title" id="bi-c-t">Payment method</h2><p class="card__sub">Charged on the 3rd of each ${billing.cycle === `yearly` ? `year` : `month`}</p></div></header>
      <div class="st-cc-wrap"><div class="st-cc" data-k="bi-card"></div></div>
      <div class="st-pay__foot"><button type="button" class="btn btn--ghost btn--sm" data-k="bi-update">${renderIcon(`edit`)}Update card</button></div>
    </section>
    <section class="card st-seatcard" aria-labelledby="bi-s-t">
      <header class="card__head"><div><h2 class="card__title" id="bi-s-t">Seats</h2><p class="card__sub" data-k="bi-seat-sub"></p></div>${B}</header>
      <div class="st-seatrow" data-k="bi-seatrow">${ONE_MIN_MS(`seats`, billing.seats, `seats`, U())}<div><b class="num" data-k="bi-seat-cost"></b><small data-k="bi-seat-note"></small></div></div>
      <span class="meter"><span class="meter__fill" data-k="bi-seat-meter" style="--c:var(--sky)"></span></span>
      <p class="st-seats__note" data-k="bi-seat-help"></p>
      <div class="st-holders"><small>Who holds a seat</small><div class="st-holders__row"><span data-k="bi-holders"></span><a class="btn btn--ghost btn--sm" href="#/settings/team">${renderIcon(`users`)}Manage team</a></div></div>
    </section>
  </div>
  <section class="card st-inv tcard" aria-labelledby="bi-i-t">
    <header class="card__head"><div><h2 class="card__title" id="bi-i-t">Invoices</h2><p class="card__sub" data-k="bi-inv-sub"></p></div>
      <div class="card__tools">${renderSegmentedControl(
        `Show invoices`,
        [
          [`all`, `All`],
          [`paid`, `Paid`],
          [`due`, `Due`],
        ],
        q,
        `st-seg-inv`
      )}</div></header>
    <div class="table-wrap"><table class="table table--stack st-itable" style="--areas:'t r' 's p'">
      <thead><tr><th scope="col">Invoice</th><th scope="col">Description</th><th scope="col">Status</th><th scope="col" class="r">Amount</th><th scope="col"><span class="sr">Download</span></th></tr></thead>
      <tbody data-k="bi-rows"></tbody>
    </table></div>
  </section>`;
}
const xt = (e) => {
  if (/^4/.test(e)) {
    return `Visa`;
  }
  if (/^(5[1-5]|2[2-7])/.test(e)) {
    return `Mastercard`;
  }
  if (/^3[47]/.test(e)) {
    return `Amex`;
  }
  if (/^6/.test(e)) {
    return `Discover`;
  }
  return `Card`;
};
function St() {
  let card = store.settings.billing.card;
  I(`bi-card`).innerHTML =
    `<div class="st-cc__face"><div class="st-cc__top"><span class="st-cc__chip" aria-hidden="true"></span><b class="st-cc__brand">${escapeHtml(card.brand)}</b></div>
    <p class="st-cc__num num" aria-label="Card ending ${escapeHtml(card.last4)}"><span>••••</span><span>••••</span><span>••••</span><span>${escapeHtml(card.last4)}</span></p>
    <div class="st-cc__bot"><span><small>Card holder</small><b>${escapeHtml(card.name)}</b></span><span><small>Expires</small><b class="num">${escapeHtml(card.exp)}</b></span></div></div>`;
}
function Ct(amount) {
  return (
    G.find((t) => t.price === amount || K(t, `yearly`) === amount)?.name ??
    store.settings.billing.plan
  );
}
function J(t) {
  let invoices = store.settings.billing.invoices;
  let i = invoices.filter((e) => q === `all` || e.status === q);
  let a = i.length
    ? i
        .map(
          (t) => `<tr class="is-link" data-key="${t.id}" data-inv="${t.id}">
      <td class="a-t"><b class="mono">${escapeHtml(t.id)}</b><small class="st-sub">${formatDate(t.at, true)}</small></td>
      <td class="a-s">Vessa ${escapeHtml(Ct(t.amount))} · ${new Date(t.at).toLocaleDateString(
        `en-US`,
        {
          month: `long`,
          year: `numeric`,
        }
      )}</td>
      <td class="a-p">${renderPill(t.status === `paid` ? `Paid` : `Due`, t.status === `paid` ? `sage` : `ochre`)}</td>
      <td class="a-r r"><b class="num">${formatMoney(t.amount)}</b></td>
      <td class="a-h r">${renderIconButton(`download`, `Download ${t.id}`, `data-dl="${t.id}"`, `ibtn--sm`)}</td></tr>`
        )
        .join(``)
    : `<tr><td colspan="5">${renderEmptyState(q === `due` ? `Nothing due` : `No invoices`, q === `due` ? `Every invoice is paid. The next one arrives on the 3rd.` : `Invoices appear after your first billing date.`, `receipt`, q === `all` ? `` : `<button type="button" class="btn btn--ghost btn--sm" data-k="bi-all">Show all invoices</button>`)}</td></tr>`;
  let o = I(`bi-rows`);
  if (t) {
    bindModalDismiss(o, () => {
      o.innerHTML = a;
    });
  } else {
    o.innerHTML = a;
  }
  I(`bi-inv-sub`).textContent =
    `${pluralize(invoices.length, `invoice`)} · ${formatMoney(invoices.reduce((acc, invoice) => acc + invoice.amount, 0))} in total`;
}
function wt() {
  let e = new Date(Date.now());
  return new Date(e.getFullYear(), e.getMonth() + +(e.getDate() >= 3), 3).getTime();
}
function Tt(e) {
  let billing = store.settings.billing;
  let r = G.find((e) => e.name === billing.plan);
  G.forEach((n) => {
    getAvailableLocations(
      domQuery(`[data-price="${n.name}"]`, P),
      K(n, billing.cycle),
      formatMoneyRound,
      {
        duration: e ? 0.8 : 0,
      }
    );
    domQuery(`[data-billed="${n.name}"]`, P).textContent =
      billing.cycle === `yearly`
        ? `${formatMoneyRound(K(n, `yearly`) * 12)} billed yearly`
        : `Billed monthly, cancel any time`;
  });
  I(`bi-next`).textContent =
    `${billing.plan} · next invoice ${formatMoney(billing.cycle === `yearly` ? K(r, `yearly`) * 12 : r.price)} on ${formatDate(wt(), true)}`;
  let i = (e, t) => renderFilterBar(queryOne(`[data-stat="${e}"] b[data-count]`, F(`billing`)), t);
  i(`bill`, K(r, billing.cycle));
  i(`seats`, U());
  let a = queryOne(`[data-stat="seats"] .stat__suffix`, F(`billing`));
  if (a) {
    a.textContent = `of ${billing.seats}`;
  }
}
function Y(e) {
  let billing = store.settings.billing;
  let cap = G.find((e) => e.name === billing.plan).cap;
  let i = U();
  let a = domQuery(`.stepper__in`, I(`bi-seatrow`));
  if (document.activeElement !== a) {
    a.value = String(billing.seats);
  }
  a.min = String(i);
  a.max = String(cap);
  I(`bi-seat-sub`).textContent = `${billing.plan} covers up to ${cap}`;
  I(`bi-seat-cost`).textContent = `${billing.seats} seats`;
  I(`bi-seat-note`).textContent = `${i} in use · ${Math.max(0, billing.seats - i)} free`;
  gsap.to(I(`bi-seat-meter`), {
    scaleX: Math.max(0.02, billing.seats / cap),
    duration: motionDuration(0.7),
    delay: motionDuration(e ? 0.4 : 0),
    ease: `power3.inOut`,
  });
  I(`bi-holders`).innerHTML = renderAvatarStack(
    store.team.filter((e) => e.status !== `invited`).map((e) => e.id),
    `sm`
  );
  I(`bi-seat-help`).innerHTML =
    billing.seats >= cap
      ? `${renderIcon(`info`)}<span>This is the most ${billing.plan} allows — Scale goes to 50.</span>`
      : `${renderIcon(`info`)}<span>Seats can’t go below the ${i} people using one.</span>`;
}
function Et(e) {
  let billing = store.settings.billing;
  let cap = G.find((e) => e.name === billing.plan).cap;
  let a = U();
  let o = Math.max(a, Math.min(cap, Math.round(e) || a));
  if (o === billing.seats) {
    Y(false);
    return;
  }
  billing.seats = o;
  notifyStoreSubscribers(`settings`);
  Ue(domQuery(`.st-seatcard`, P));
}
function Dt(e, r) {
  let billing = store.settings.billing;
  let a = G.find((t) => t.name === e);
  let s = U();
  if (s > a.cap) {
    showToast(`${a.name} covers ${a.cap} seats — ${s} people use one now`, {
      ico: `alert`,
    });
    return;
  }
  confirmDialog(
    `Switch to ${a.name}?`,
    `${formatMoneyRound(K(a, billing.cycle))} a month${billing.cycle === `yearly` ? `, billed yearly` : ``}, from the invoice on ${formatDate(wt(), true)}. ${a.cap < billing.seats ? `Seats drop to ${a.cap}.` : ``}`,
    `Switch to ${a.name}`,
    false
  ).then((n) => {
    if (!n) {
      return;
    }
    let r = queryOne(`[data-k="bi-badge"]`, P);
    let s = r ? Flip.getState(r) : null;
    billing.plan = e;
    billing.seats = Math.min(billing.seats, a.cap);
    domQueryAll(`.st-plan`, P).forEach((t) => {
      let n = t.dataset.plan === e;
      t.classList.toggle(`is-current`, n);
      let r = domQuery(`[data-switch]`, t);
      r.disabled = n;
      r.className = `btn ${n ? `btn--ghost` : `btn--soft`} btn--sm st-plan__go`;
      r.textContent = n ? `Your plan` : `Switch to ${t.dataset.plan}`;
    });
    let c = domQuery(`.st-plan__top`, domQuery(`.st-plan[data-plan="${e}"]`, P));
    if (r) {
      c.append(r);
      if (s && !bindMagnetic()) {
        Flip.from(s, {
          duration: motionDuration(0.7),
          ease: `power3.inOut`,
          scale: true,
          clearProps: `transform`,
        });
      }
    }
    notifyStoreSubscribers(`settings`);
    getAvailableSuppliers(domQuery(`[data-price="${e}"]`, P));
    showToast(`You’re on ${e} now`, {
      ico: `sparkle`,
    });
  });
}
function Ot(from) {
  openQuickCreateModal({
    title: `Update card`,
    sub: `Your next invoice goes on this card. We never store the full number.`,
    from,
    submit: `Save card`,
    fields: [
      {
        name: `number`,
        label: `Card number`,
        required: true,
        placeholder: `4242 4242 4242 4242`,
        wide: true,
      },
      {
        name: `exp`,
        label: `Expiry`,
        required: true,
        placeholder: `MM/YY`,
      },
      {
        name: `cvc`,
        label: `Security code`,
        required: true,
        placeholder: `3 or 4 digits`,
      },
      {
        name: `name`,
        label: `Name on card`,
        required: true,
        value: store.settings.billing.card.name,
        wide: true,
      },
    ],
    onMount: (e) => {
      let t = e.elements.namedItem(`number`);
      let n = e.elements.namedItem(`exp`);
      t.inputMode = `numeric`;
      n.inputMode = `numeric`;
      e.elements.namedItem(`cvc`).inputMode = `numeric`;
      t.autocomplete = `cc-number`;
      n.autocomplete = `cc-exp`;
      t.addEventListener(`input`, () => {
        t.value = t.value
          .replace(/\D/g, ``)
          .slice(0, 19)
          .replace(/(\d{4})(?=\d)/g, `$1 `);
      });
      n.addEventListener(`input`, () => {
        let e = n.value.replace(/\D/g, ``).slice(0, 4);
        n.value = e.length > 2 ? `${e.slice(0, 2)}/${e.slice(2)}` : e;
      });
    },
    onSubmit: (e) => {
      let r = (e.number ?? ``).replace(/\D/g, ``);
      let brand = xt(r);
      if (r.length < 15 || r.length > 16 || (brand === `Amex`) != (r.length === 15)) {
        return `That card number is the wrong length.`;
      }
      let a = 0;
      [...r].reverse().forEach((e, t) => {
        let n = Number(e);
        if (t % 2) {
          n *= 2;
          if (n > 9) {
            n -= 9;
          }
        }
        a += n;
      });
      if (a % 10) {
        return `That card number doesn’t check out — look for a typo.`;
      }
      let s = /^(\d{2})\/(\d{2})$/.exec(e.exp ?? ``);
      if (!s || Number(s[1]) < 1 || Number(s[1]) > 12) {
        return `Write the expiry as MM/YY.`;
      }
      let c = new Date(Date.now());
      if (
        2000 + Number(s[2]) < c.getFullYear() ||
        (2000 + Number(s[2]) === c.getFullYear() && Number(s[1]) < c.getMonth() + 1)
      ) {
        return `That card has expired.`;
      }
      if (!/^\d{3,4}$/.test(e.cvc ?? ``)) {
        return `The security code is 3 or 4 digits.`;
      }
      store.settings.billing.card = {
        brand,
        last4: r.slice(-4),
        exp: e.exp,
        name: e.name,
      };
      notifyStoreSubscribers(`settings`);
      let l = I(`bi-card`);
      if (bindMagnetic()) {
        St();
      } else {
        gsap
          .timeline()
          .to(l, {
            rotationY: 90,
            duration: 0.28,
            ease: `power2.in`,
          })
          .add(() => St())
          .fromTo(
            l,
            {
              rotationY: -90,
            },
            {
              rotationY: 0,
              duration: 0.5,
              ease: `back.out(1.6)`,
              clearProps: `transform`,
            }
          );
      }
      showToast(`${brand} ending ${r.slice(-4)} saved`, {
        ico: `card`,
      });
    },
  });
}
function kt(t) {
  let r = store.settings.billing.invoices.find((e) => e.id === t);
  if (!r) {
    history.replaceState(null, ``, `#/settings/billing`);
    return;
  }
  let company = store.settings.company;
  let card = store.settings.billing.card;
  openDrawer(
    `<div class="d-head">${renderTag(`receipt`, r.status === `paid` ? `sage` : `ochre`)}<div><h2 class="mono">${escapeHtml(r.id)}</h2><small>Issued ${formatDate(r.at, true)}</small></div></div>
    <div class="d-pills">${renderPill(r.status === `paid` ? `Paid` : `Due`, r.status === `paid` ? `sage` : `ochre`)}</div>
    <div class="d-facts"><div><small>Amount</small><b>${formatMoney(r.amount)}</b><span>USD, tax included</span></div><div><small>Paid with</small><b>${escapeHtml(card.brand)} •• ${escapeHtml(card.last4)}</b><span>${r.status === `paid` ? `on ${formatDate(r.at + ONE_DAY_MS)}` : `Pending`}</span></div></div>
    <div class="d-sec"><h3>Lines</h3><ul class="bom"><li><span>Vessa ${escapeHtml(Ct(r.amount))} plan</span><small>${new Date(
      r.at
    ).toLocaleDateString(`en-US`, {
      month: `long`,
      year: `numeric`,
    })}</small><b>${formatMoney(r.amount)}</b></li></ul></div>
    <div class="d-sec"><h3>Billed to</h3><p class="st-billto"><b>${escapeHtml(company.legal)}</b><br>${escapeHtml(company.address)}<br>EIN ${escapeHtml(company.taxId)}</p></div>
    <div class="d-actions"><button type="button" class="btn btn--primary" data-d-dl="${r.id}">${renderIcon(`download`)}Download CSV</button></div>`,
    {
      label: `Invoice ${r.id}`,
      onClose: () => {
        if (location.hash.startsWith(`#/settings/billing/`)) {
          history.replaceState(null, ``, `#/settings/billing`);
        }
      },
      onMount: (e) =>
        e.querySelector(`[data-d-dl]`)?.addEventListener(`click`, (e) => At(t, e.currentTarget)),
    }
  );
}
function At(e, t) {
  let r = store.settings.billing.invoices.find((t) => t.id === e);
  if (r) {
    if (t) {
      openNewTransferModal(t);
    }
    downloadFile(
      `${r.id}.csv`,
      formatCsvRow([
        [`Invoice`, `Date`, `Description`, `Amount (USD)`, `Status`],
        [
          r.id,
          new Date(r.at).toISOString().slice(0, 10),
          `Vessa ${Ct(r.amount)} plan`,
          r.amount.toFixed(2),
          r.status,
        ],
      ]),
      `text/csv`
    );
    showToast(`${r.id} downloaded`, {
      ico: `download`,
    });
  }
}
function billing() {
  let e = F(`billing`);
  e.innerHTML = bt();
  St();
  J(false);
  Tt(false);
  Y(false);
  initSegmentedControl(domQuery(`.st-seg-cycle`, e), (e) => {
    store.settings.billing.cycle = e;
    notifyStoreSubscribers(`settings`);
    showToast(
      e === `yearly`
        ? `Yearly billing — 20% off from the next invoice`
        : `Monthly billing from the next invoice`,
      {
        ico: `calendar`,
      }
    );
  });
  initSegmentedControl(domQuery(`.st-seg-inv`, e), (e) => {
    q = e;
    J(true);
  });
  bindTabControls(I(`bi-seatrow`), (e) => Et(Number(e.value)));
  domQuery(`.stepper__in`, I(`bi-seatrow`)).addEventListener(`blur`, () => Y(false));
  I(`bi-update`).addEventListener(`click`, (e) => {
    openNewTransferModal(e.currentTarget);
    Ot(e.currentTarget);
  });
  e.addEventListener(`click`, (t) => {
    let t_target = t.target;
    let r = t_target.closest(`[data-switch]`);
    if (r) {
      openNewTransferModal(r);
      Dt(r.dataset.switch, r);
      return;
    }
    let i = t_target.closest(`[data-dl]`);
    if (i) {
      At(i.dataset.dl, i);
      return;
    }
    if (t_target.closest(`[data-k="bi-all"]`)) {
      domQueryAll(`.st-seg-inv .seg__btn`, e)[0]?.click();
      return;
    }
    let a = t_target.closest(`[data-inv]`);
    if (a && !t_target.closest(`button, a`)) {
      location.hash = `#/settings/billing/${a.dataset.inv}`;
    }
  });
}
function Mt() {
  let e = F(`billing`);
  gsap
    .timeline()
    .add(animatePageTransition(e), 0)
    .add(
      animateCards(domQueryAll(`.card`, e), {
        stagger: 0.07,
      }),
      0.12
    )
    .add(
      animateCards(domQueryAll(`.st-plan`, e), {
        stagger: 0.08,
        y: 22,
      }),
      0.3
    )
    .add(
      animateRows(domQueryAll(`.st-plan__feats li`, e), {
        x: -6,
        y: 0,
        stagger: 0.02,
      }),
      0.55
    )
    .add(
      animateRows(domQueryAll(`.st-itable tbody tr`, e), {
        y: 8,
        stagger: 0.04,
      }),
      0.45
    );
  let t = I(`bi-card`);
  if (!bindMagnetic()) {
    gsap.fromTo(
      t,
      {
        rotationY: -24,
        rotationX: 8,
        y: 16,
        opacity: 0,
      },
      {
        rotationY: 0,
        rotationX: 0,
        y: 0,
        opacity: 1,
        duration: motionDuration(1.1),
        delay: motionDuration(0.35),
        ease: `power3.out`,
        clearProps: `transform,opacity`,
      }
    );
  }
  Y(true);
}
const X = [
  {
    key: `lowStock`,
    title: `Low stock`,
    text: () =>
      `When a product’s free stock at the DC reaches its reorder point. ${getLowStockProducts().length + getLowStockMaterials().length} items are low right now.`,
    ico: `alert`,
    tone: `ochre`,
  },
  {
    key: `expiry`,
    title: `Lots near expiry`,
    text: () =>
      `When a released lot comes inside ${store.settings.prefs.expiryWarnDays} days of its expiry date.`,
    ico: `calX`,
    tone: `teal`,
  },
  {
    key: `orders`,
    title: `New orders`,
    text: () => `Every wholesale order, and online orders over $100.`,
    ico: `orders`,
    tone: `sky`,
  },
  {
    key: `poUpdates`,
    title: `Purchase orders`,
    text: () => `When a supplier ships, part-ships or a delivery is late.`,
    ico: `truck`,
    tone: `ocean`,
  },
  {
    key: `returns`,
    title: `Returns`,
    text: () => `When a customer asks to send something back.`,
    ico: `return`,
    tone: `rose`,
  },
];
let Z = `all`;
const Nt = (t, n, r) =>
  `<button type="button" class="switch" role="switch" aria-checked="${n}" aria-label="${escapeHtml(r)}" data-n="${t}"></button>`;
function Pt() {
  let notify = store.settings.notify;
  return `${renderPageHeader({
    eyebrow: `What Vessa tells you, and where`,
    title: `Notifications`,
    actions: `<button type="button" class="btn btn--ghost" data-k="nt-test">${renderIcon(`bell`)}Send a test</button>`,
  })}
  <div class="st-grid st-grid--notif">
    <section class="card" aria-labelledby="nt-a-t">
      <header class="card__head"><div><h2 class="card__title" id="nt-a-t">Alerts</h2><p class="card__sub" data-k="nt-sub"></p></div>
        <div class="card__tools">${renderSegmentedControl(
          `Show alerts`,
          [
            [`all`, `All`],
            [`on`, `On`],
            [`off`, `Off`],
          ],
          Z,
          `st-seg-nf`
        )}</div></header>
      <div class="st-nlist" data-k="nt-list"></div>
    </section>
    <div class="st-stack">
      <section class="card" aria-labelledby="nt-c-t">
        <header class="card__head"><div><h2 class="card__title" id="nt-c-t">Where they go</h2><p class="card__sub">${escapeHtml(store.settings.me.email)}</p></div></header>
        <div class="st-nlist">
          <div class="st-nrow" data-row="email">${renderTag(`mail`, `sky`, `sm`)}<span class="st-nrow__txt"><b>Email</b><small>To ${escapeHtml(store.settings.me.email)}</small></span>${B}${Nt(`email`, notify.email, `Email notifications`)}</div>
          <div class="st-nrow" data-row="push">${renderTag(`mobile`, `pine`, `sm`)}<span class="st-nrow__txt"><b>Push</b><small>On the iPhone with Vessa installed</small></span>${B}${Nt(`push`, notify.push, `Push notifications`)}</div>
        </div>
      </section>
      <section class="card st-digest" aria-labelledby="nt-d-t">
        <header class="card__head"><div><h2 class="card__title" id="nt-d-t">Morning digest</h2><p class="card__sub">One email instead of many</p></div></header>
        <div class="st-nrow" data-row="digest">${renderTag(`sun`, `ochre`, `sm`)}<span class="st-nrow__txt"><b>Send a digest</b><small>Weekdays, before the first pick</small></span>${B}${Nt(`digest`, notify.digest, `Morning digest`)}</div>
        <label class="st-digest__at" data-k="nt-at-row"><span>Arrives at</span><select class="select" data-k="nt-at">${[
          `06:00`,
          `06:30`,
          `07:00`,
          `07:30`,
          `08:00`,
          `09:00`,
        ]
          .map(
            (e) =>
              `<option value="${e}"${(notify.digestAt ?? `07:00`) === e ? ` selected` : ``}>${new Date(
                2026,
                0,
                1,
                Number(e.slice(0, 2)),
                Number(e.slice(3))
              ).toLocaleTimeString(`en-US`, {
                hour: `numeric`,
                minute: `2-digit`,
              })}</option>`
          )
          .join(``)}</select></label>
        <div class="st-digest__prev" data-k="nt-prev"></div>
      </section>
    </div>
  </div>`;
}
function Q(t) {
  let notify = store.settings.notify;
  let i = X.filter((e) => Z === `all` || (Z === `on` ? notify[e.key] : !notify[e.key]));
  let a = i.length
    ? i
        .map(
          (t) =>
            `<div class="st-nrow" data-key="${t.key}" data-row="${t.key}">${renderTag(t.ico, t.tone, `sm`)}<span class="st-nrow__txt"><b>${escapeHtml(t.title)}</b><small>${escapeHtml(t.text())}</small></span>${B}${Nt(t.key, notify[t.key], t.title)}</div>`
        )
        .join(``)
    : renderEmptyState(
        Z === `on` ? `Every alert is off` : `Every alert is on`,
        Z === `on`
          ? `Vessa won’t tell you about anything. Turn on the ones you need.`
          : `Nothing is muted. Turn off what you don’t need to hear.`,
        `bell`,
        `<button type="button" class="btn btn--ghost btn--sm" data-k="nt-all">Show all alerts</button>`
      );
  let o = I(`nt-list`);
  if (t) {
    bindModalDismiss(o, () => {
      o.innerHTML = a;
    });
  } else {
    o.innerHTML = a;
  }
  let length = X.filter((e) => notify[e.key]).length;
  I(`nt-sub`).textContent =
    `${length} of ${X.length} on${!notify.email && !notify.push ? ` — but no channel is on, so nothing arrives` : ``}`;
}
function $() {
  let notify = store.settings.notify;
  I(`nt-at-row`).classList.toggle(`is-off`, !notify.digest);
  I(`nt-at`).disabled = !notify.digest;
  let r = [
    [`alert`, `items running low`, getLowStockProducts().length + getLowStockMaterials().length],
    [`calX`, `lots near expiry`, getExpiringBatches().length],
    [`truck`, `orders to ship`, getActiveOrders().length],
  ];
  I(`nt-prev`).innerHTML = notify.digest
    ? `<small>Tomorrow’s would say</small>${r.map(([t, n, r]) => `<span>${renderIcon(t)}<b class="num">${r}</b> ${escapeHtml(n)}</span>`).join(``)}`
    : `<small>${renderIcon(`pause`)}Digest is off — alerts arrive one at a time.</small>`;
}
function notifications() {
  let e = F(`notifications`);
  e.innerHTML = Pt();
  Q(false);
  $();
  initSegmentedControl(domQuery(`.st-seg-nf`, e), (e) => {
    Z = e;
    Q(true);
  });
  e.addEventListener(`click`, (r) => {
    let r_target = r.target;
    let a = r_target.closest(`[data-n]`);
    if (a) {
      let e = a.dataset.n;
      let r = !store.settings.notify[e];
      store.settings.notify[e] = r;
      a.setAttribute(`aria-checked`, String(r));
      notifyStoreSubscribers(`settings`);
      Ue(a.closest(`.st-nrow`));
      if (e === `digest`) {
        $();
      } else if ([`email`, `push`].includes(e)) {
        Q(false);
      } else {
        let e = I(`nt-sub`);
        e.textContent = `${X.filter((e) => store.settings.notify[e.key]).length} of ${X.length} on`;
        if (Z !== `all`) {
          setTimeout(() => {
            if (L(`notifications`)) {
              Q(true);
            }
          }, 650);
        }
      }
      return;
    }
    if (r_target.closest(`[data-k="nt-all"]`)) {
      domQueryAll(`.st-seg-nf .seg__btn`, e)[0]?.click();
      return;
    }
    let s = r_target.closest(`[data-k="nt-test"]`);
    if (s) {
      openNewTransferModal(s);
      let e = store.settings.notify;
      if (!e.push && !e.email) {
        showToast(`Turn on email or push first — there’s nowhere to send it`, {
          ico: `alert`,
        });
        return;
      }
      addNotification(
        `stock`,
        `Test alert — this is how Vessa tells you something needs a hand`,
        `#/settings/notifications`
      );
      notifyStoreSubscribers(`notices`);
      showToast(
        `Test sent${e.push ? ` to your iPhone` : ``}${e.push && e.email ? ` and` : ``}${e.email ? ` to ${store.settings.me.email}` : ``} — and to the bell`,
        {
          ico: `bell`,
        }
      );
    }
  });
  I(`nt-at`).addEventListener(`change`, (r) => {
    store.settings.notify.digestAt = r.target.value;
    notifyStoreSubscribers(`settings`);
    Ue(domQuery(`.st-digest [data-row="digest"]`, e));
    showToast(`Digest arrives at ${r.target.selectedOptions[0]?.textContent ?? ``}`, {
      ico: `clock`,
    });
  });
}
function It() {
  let e = F(`notifications`);
  gsap
    .timeline()
    .add(animatePageTransition(e), 0)
    .add(
      animateCards(domQueryAll(`.card`, e), {
        stagger: 0.08,
      }),
      0.1
    )
    .add(
      animateRows(domQueryAll(`.st-nrow`, e), {
        x: 10,
        y: 0,
        stagger: 0.04,
      }),
      0.3
    )
    .add(
      animateRows(domQueryAll(`.st-digest__prev > *`, e), {
        y: 6,
        stagger: 0.05,
      }),
      0.6
    );
}
const Lt = {
  account: `Account`,
  company: `Company`,
  team: `Team & roles`,
  billing: `Billing`,
  notifications: `Notifications`,
};
function Rt(e) {
  Re = e;
  domQueryAll(`[data-sub]`, P).forEach((t) => {
    t.hidden = t.dataset.sub !== e;
  });
  if (!ze.has(e)) {
    ze.add(e);
    ({
      account,
      company,
      team,
      billing,
      notifications,
    })[e]?.();
  }
  if (e === `account`) {
    Ye();
    Ze();
  } else if (e === `company`) {
    ot();
  } else if (e === `team`) {
    W(false);
    mt();
    yt();
  } else if (e === `billing`) {
    Tt(false);
    J(false);
    Mt();
  } else {
    Q(false);
    $();
    It();
  }
}
function zt(e, t) {
  if (t) {
    if (e === `team`) {
      _t(t);
    } else if (e === `billing`) {
      kt(t);
    }
  }
}
export const page = {
  title: (e) => Lt[e[0] ?? ``] ?? `Settings`,
  mount(e) {
    P = e;
    P.innerHTML = Be.map((e) => `<div data-sub="${e}" hidden></div>`).join(``);
    findLocationById(`team`, () => {
      if (L(`team`)) {
        W(true);
        mt();
        pt(false);
      }
      if (L(`billing`)) {
        Tt(false);
        Y(false);
      }
      if (L(`account`) && !Ke()) {
        Je();
      }
    });
    findLocationById(`settings`, () => {
      if (L(`billing`)) {
        Tt(true);
        Y(false);
        J(false);
        let e = queryOne(`.st-pay .card__sub`, P);
        if (e) {
          e.textContent = `Charged on the 3rd of each ${store.settings.billing.cycle === `yearly` ? `year` : `month`}`;
        }
      }
      if (L(`team`)) {
        mt();
        pt(false);
      }
      if (L(`notifications`)) {
        $();
      }
    });
    findLocationById(`batches`, () => {
      if (L(`company`)) {
        it();
      }
      if (L(`notifications`)) {
        $();
      }
    });
    findLocationById(`products`, () => {
      if (L(`notifications`)) {
        $();
      }
    });
    openModal(() => {
      if (ze.has(`account`)) {
        Ye();
      }
    });
  },
  enter({ params, same }) {
    let n = Be.includes(params[0] ?? ``) ? params[0] : `account`;
    if (same && n === Re && ze.has(n)) {
      zt(n, params[1]);
      return;
    }
    Rt(n);
    if (params[1]) {
      setTimeout(() => zt(n, params[1]), motionDuration(350));
    }
  },
  leave() {},
};
