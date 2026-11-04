import { store, findMemberById, notifyStoreSubscribers } from '../../../core/store';
import {
  animateCards,
  animateRows,
  animatePop,
  motionDuration,
  playHaptic,
  gsap,
} from '../../../core/motion';
import { ONE_DAY_MS } from '../../../core/constants';
import { escapeHtml, domQuery, domQueryAll, queryOne } from '../../../utils/dom';
import { formatDate, formatRelativeTime, pluralize } from '../../../utils/formatters';
import { renderIcon, renderPill } from '../../../utils/icons';
import {
  getSavedTheme,
  setSavedTheme,
  bindAccentPicker,
  getCurrentAccentName,
  renderAccentPickerHtml,
  renderAvatar,
  renderPageHeader,
  renderTag,
  showToast,
  confirmDialog,
  animateElementOut,
  animatePageTransition,
  bindModalDismiss,
} from '../../../main';
import { ActiveSession } from '../../../types/settings';
import { renderFormField, showFieldError } from '../components/form-controls';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

let sessions: ActiveSession[] = [
  {
    id: 's-mac',
    device: 'MacBook Pro',
    app: 'Safari 19 · macOS',
    where: 'Asheville, NC',
    at: Date.now(),
    ico: 'sidebar',
    me: true,
  },
  {
    id: 's-iphone',
    device: 'iPhone 16',
    app: 'Vels for iOS',
    where: 'Asheville, NC',
    at: Date.now() - 2 * 3600000,
    ico: 'mobile',
  },
  {
    id: 's-ipad',
    device: 'iPad Air',
    app: 'Safari · iPadOS',
    where: 'Weaverville, NC',
    at: Date.now() - 3 * ONE_DAY_MS,
    ico: 'mobile',
  },
];

const ROLE_NAMES: Record<string, string> = {
  owner: 'Owner',
  admin: 'Admin',
  manager: 'Manager',
  staff: 'Staff',
  viewer: 'Viewer',
};

export function renderAccountSubtab(): string {
  const me = store.settings.me;
  const currentMember = findMemberById('m-okafor');
  const roleName = ROLE_NAMES[currentMember?.role ?? 'admin'] ?? 'Admin';

  return `${renderPageHeader({
    eyebrow: 'User Account — Your profile and how you sign in',
    title: 'Account',
  })}
  <div class="st-grid st-grid--account">
    <div class="st-stack">
    <section class="card st-profile" aria-labelledby="ac-p-t">
      <header class="card__head"><div><h2 class="card__title" id="ac-p-t">Profile</h2><p class="card__sub">How teammates see you on orders, counts and the activity log</p></div></header>
      <div class="st-profile__body">
        <div class="st-profile__id"><span data-k="ac-av">${renderAvatar('m-okafor', 'xl')}</span><div><b data-k="ac-name">${escapeHtml(me.name)}</b><small data-k="ac-role">${escapeHtml(me.title)} · ${escapeHtml(roleName)}</small></div></div>
        <form class="st-form" data-k="ac-form" novalidate>
          ${renderFormField({
            name: 'name',
            label: 'Full name',
            value: me.name,
            ac: 'name',
          })}
          ${renderFormField({
            name: 'email',
            label: 'Work email',
            value: me.email,
            type: 'email',
            ac: 'email',
          })}
          ${renderFormField({
            name: 'title',
            label: 'Job title',
            value: me.title,
            ac: 'organization-title',
          })}
          ${renderFormField({
            name: 'phone',
            label: 'Phone',
            value: me.phone,
            type: 'tel',
            ac: 'tel',
          })}
          <div class="st-form__foot st-field--wide"><span class="st-dirty" data-k="ac-dirty" hidden>${renderIcon('edit')}Unsaved changes</span>
            <button type="button" class="btn btn--ghost btn--sm" data-k="ac-reset" hidden>Discard</button><button type="submit" class="btn btn--primary btn--sm" data-k="ac-save" disabled>${renderIcon('check')}Save profile</button></div>
        </form>
      </div>
    </section>
    <section class="card st-sess" aria-labelledby="ac-s-t">
      <header class="card__head"><div><h2 class="card__title" id="ac-s-t">Where you’re signed in</h2><p class="card__sub" data-k="ac-s-sub"></p></div>
        <div class="card__tools"><button type="button" class="btn btn--ghost btn--sm" data-k="ac-out">${renderIcon('logout')}Sign out other sessions</button></div></header>
      <div class="rows" data-k="ac-sessions"></div>
    </section>
    </div>
    <div class="st-stack">
    <section class="card st-pass" aria-labelledby="ac-pw-t">
      <header class="card__head"><div><h2 class="card__title" id="ac-pw-t">Password</h2><p class="card__sub">Changed ${formatDate(Date.now() - 64 * ONE_DAY_MS, true)}</p></div>${renderTag('lock', 'ocean', 'sm')}</header>
      <form class="st-form st-form--one" data-k="pw-form" novalidate>
        ${renderFormField({
          name: 'cur',
          label: 'Current password',
          type: 'password',
          ac: 'current-password',
        })}
        ${renderFormField({
          name: 'next',
          label: 'New password',
          type: 'password',
          ac: 'new-password',
          ph: 'At least 8 characters',
        })}
        <div class="st-strength" aria-live="polite"><span class="meter"><span class="meter__fill" data-k="pw-meter"></span></span><small data-k="pw-label">Use 8 or more characters, with a number</small></div>
        ${renderFormField({
          name: 'again',
          label: 'Repeat new password',
          type: 'password',
          ac: 'new-password',
        })}
        <div class="st-form__foot"><button type="submit" class="btn btn--dark btn--sm">${renderIcon('key')}Change password</button></div>
      </form>
    </section>
    <section class="card st-look" aria-labelledby="ac-th-t">
      <header class="card__head"><div><h2 class="card__title" id="ac-th-t">Appearance</h2><p class="card__sub">Saved on this device</p></div></header>
      <div class="st-themes" role="group" aria-label="Theme">${['light', 'dark', 'system']
        .map(
          (pref) => `<button type="button" class="st-theme" data-pref="${pref}" aria-pressed="${getSavedTheme() === pref}">
        <span class="st-theme__prev" data-pv="${pref}" aria-hidden="true"><i class="st-pv"><i></i><i></i><i></i></i>${pref === 'system' ? '<i class="st-pv st-pv--dark"><i></i><i></i><i></i></i>' : ''}</span>
        <span class="st-theme__name">${renderIcon(pref === 'light' ? 'sun' : pref === 'dark' ? 'moon' : 'sidebar')}${pref === 'light' ? 'Light' : pref === 'dark' ? 'Dark' : 'System'}<span class="st-theme__tick">${renderIcon('check')}</span></span>
      </button>`
        )
        .join('')}</div>
      <div class="st-accent">
        <div class="st-accent__head"><b>Accent colour</b><small data-k="ac-accent-name">${escapeHtml(getCurrentAccentName())}</small></div>
        <p class="st-accent__sub">Buttons, links, the active page and chart highlights. Choose a preset, or choose any colour — Vels tunes it so text stays readable in light and dark.</p>
        <div data-k="ac-accents">${renderAccentPickerHtml()}</div>
      </div>
    </section>
    </div>
  </div>`;
}

export function renderSessionsList(container: HTMLElement): void {
  const sessionsEl = queryOne<HTMLElement>('[data-k="ac-sessions"]', container);
  if (!sessionsEl) return;

  sessionsEl.innerHTML =
    sessions
      .map(
        (s) =>
          `<div class="row st-sess__row" data-key="${s.id}">${renderTag(s.ico, s.me ? 'pine' : 'slate')}<span class="row__txt"><b>${escapeHtml(s.device)}${s.me ? ' <span class="st-this">This device</span>' : ''}</b><small>${escapeHtml(s.app)} · ${escapeHtml(s.where)}</small></span><span class="row__end">${s.me ? renderPill('Active now', 'sage') : escapeHtml(formatRelativeTime(s.at))}</span></div>`
      )
      .join('') +
    (sessions.length === 1
      ? `<p class="st-sess__only">${renderIcon('shield')}Only this Mac is signed in. Anyone else will need your password.</p>`
      : '');

  const subEl = queryOne<HTMLElement>('[data-k="ac-s-sub"]', container);
  if (subEl) subEl.textContent = pluralize(sessions.length, 'device');

  const outBtn = queryOne<HTMLElement>('[data-k="ac-out"]', container);
  if (outBtn) outBtn.hidden = sessions.length < 2;
}

export function isAccountFormDirty(form: HTMLFormElement): boolean {
  const me = store.settings.me;
  const getVal = (field: string) => (form.elements.namedItem(field) as HTMLInputElement)?.value?.trim() ?? '';
  return (
    getVal('name') !== me.name ||
    getVal('email') !== me.email ||
    getVal('title') !== me.title ||
    getVal('phone') !== me.phone
  );
}

export function updateAccountFormState(form: HTMLFormElement, container: HTMLElement): void {
  const dirty = isAccountFormDirty(form);
  const saveBtn = queryOne<HTMLButtonElement>('[data-k="ac-save"]', container);
  const dirtyBadge = queryOne<HTMLElement>('[data-k="ac-dirty"]', container);
  const resetBtn = queryOne<HTMLElement>('[data-k="ac-reset"]', container);

  if (saveBtn) {
    const wasEnabled = !saveBtn.disabled;
    saveBtn.disabled = !dirty;
    if (resetBtn) resetBtn.hidden = !dirty;
    if (dirtyBadge) {
      dirtyBadge.hidden = !dirty;
      if (dirty && !wasEnabled) {
        animatePop(dirtyBadge, { from: 0.8 });
      }
    }
  }
}

export function resetAccountForm(form: HTMLFormElement, container: HTMLElement): void {
  const me = store.settings.me;
  ['name', 'email', 'title', 'phone'].forEach((field) => {
    const input = form.elements.namedItem(field) as HTMLInputElement;
    if (input) {
      input.value = (me as any)[field] ?? '';
      showFieldError(input, '');
    }
  });
  updateAccountFormState(form, container);
}

export function updateThemeButtons(container: HTMLElement): void {
  const currentTheme = getSavedTheme();
  domQueryAll('.st-theme', container).forEach((btn) =>
    btn.setAttribute('aria-pressed', String(btn.dataset.pref === currentTheme))
  );
}

export function initAccountSubtab(container: HTMLElement): void {
  const accentsEl = queryOne<HTMLElement>('[data-k="ac-accents"]', container);
  if (accentsEl) {
    bindAccentPicker(accentsEl, () => {
      const nameEl = queryOne<HTMLElement>('[data-k="ac-accent-name"]', container);
      if (nameEl) nameEl.textContent = getCurrentAccentName();
    });
  }

  renderSessionsList(container);

  const form = queryOne<HTMLFormElement>('[data-k="ac-form"]', container);
  if (form) {
    resetAccountForm(form, container);
    form.addEventListener('input', () => updateAccountFormState(form, container));

    queryOne<HTMLElement>('[data-k="ac-reset"]', container)?.addEventListener('click', () => {
      resetAccountForm(form, container);
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const getField = (name: string) => form.elements.namedItem(name) as HTMLInputElement;
      const nameVal = getField('name').value.trim();
      const emailVal = getField('email').value.trim();
      const titleVal = getField('title').value.trim();
      const phoneVal = getField('phone').value.trim();
      let firstErrorInput: HTMLInputElement | null = null;

      showFieldError(getField('name'), nameVal.length >= 2 ? '' : 'Enter your name.');
      if (nameVal.length < 2) firstErrorInput = getField('name');

      const emailErr = EMAIL_REGEX.test(emailVal)
        ? store.team.some((t) => t.id !== 'm-okafor' && t.email.toLowerCase() === emailVal.toLowerCase())
          ? 'A teammate already uses that email.'
          : ''
        : 'That email doesn’t look right.';
      showFieldError(getField('email'), emailErr);
      if (emailErr && !firstErrorInput) firstErrorInput = getField('email');

      const phoneErr = phoneVal && phoneVal.replace(/\D/g, '').length < 7 ? 'Use a full phone number.' : '';
      showFieldError(getField('phone'), phoneErr);
      if (phoneErr && !firstErrorInput) firstErrorInput = getField('phone');

      if (firstErrorInput) {
        firstErrorInput.focus();
        return;
      }

      Object.assign(store.settings.me, {
        name: nameVal,
        email: emailVal,
        title: titleVal || 'Teammate',
        phone: phoneVal,
      });

      const member = findMemberById('m-okafor');
      if (member) {
        Object.assign(member, {
          name: nameVal,
          email: emailVal,
          title: titleVal || member.title,
          phone: phoneVal,
        });
      }

      notifyStoreSubscribers('settings', 'team');

      const nameEl = queryOne<HTMLElement>('[data-k="ac-name"]', container);
      if (nameEl) nameEl.textContent = nameVal;

      const roleEl = queryOne<HTMLElement>('[data-k="ac-role"]', container);
      if (roleEl) roleEl.textContent = `${store.settings.me.title} · ${ROLE_NAMES[member?.role ?? 'admin']}`;

      const avEl = queryOne<HTMLElement>('[data-k="ac-av"]', container);
      if (avEl) {
        avEl.innerHTML = renderAvatar('m-okafor', 'xl');
        const avInner = domQuery('.av', avEl);
        if (avInner) animatePop(avInner, { from: 0.7 });
      }

      resetAccountForm(form, container);
      showToast('Profile saved', { ico: 'user' });
    });
  }

  // Password Form
  const pwForm = queryOne<HTMLFormElement>('[data-k="pw-form"]', container);
  if (pwForm) {
    const calcStrength = (pwd: string) => {
      let score = 0;
      if (pwd.length >= 8) score++;
      if (pwd.length >= 12) score++;
      if (/\d/.test(pwd)) score++;
      if (/[^A-Za-z0-9]/.test(pwd)) score++;
      if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
      return Math.min(4, score);
    };

    const strengthLabels = [
      'Use 8 or more characters, with a number',
      'Weak — add length and a number',
      'Fair — add a symbol or capitals',
      'Good',
      'Strong',
    ];
    const strengthTones = ['faint', 'rose', 'ochre', 'teal', 'sage'];

    pwForm.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      showFieldError(target, '');
      if (target.name !== 'next') return;

      const score = target.value ? calcStrength(target.value) : 0;
      const meterEl = queryOne<HTMLElement>('[data-k="pw-meter"]', container);
      if (meterEl) {
        meterEl.style.setProperty('--c', `var(--${strengthTones[score]})`);
        gsap.to(meterEl, {
          scaleX: target.value ? Math.max(0.08, score / 4) : 0,
          duration: motionDuration(0.5),
          ease: 'power3.out',
        });
      }
      const labelEl = queryOne<HTMLElement>('[data-k="pw-label"]', container);
      if (labelEl) labelEl.textContent = target.value ? strengthLabels[score] : strengthLabels[0];
    });

    pwForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const getField = (name: string) => pwForm.elements.namedItem(name) as HTMLInputElement;
      const curInput = getField('cur');
      const nextInput = getField('next');
      const againInput = getField('again');

      const validations: [HTMLInputElement, string][] = [
        [curInput, curInput.value ? '' : 'Enter your current password.'],
        [
          nextInput,
          nextInput.value.length < 8
            ? 'Use at least 8 characters.'
            : nextInput.value === curInput.value
              ? 'Pick a password you haven’t used here.'
              : '',
        ],
        [againInput, againInput.value === nextInput.value ? '' : 'The two new passwords don’t match.'],
      ];

      validations.forEach(([input, err]) => showFieldError(input, err));
      const firstErr = validations.find(([, err]) => err);
      if (firstErr) {
        firstErr[0].focus();
        return;
      }

      pwForm.reset();
      const meterEl = queryOne<HTMLElement>('[data-k="pw-meter"]', container);
      if (meterEl) {
        gsap.to(meterEl, { scaleX: 0, duration: motionDuration(0.4) });
      }
      const labelEl = queryOne<HTMLElement>('[data-k="pw-label"]', container);
      if (labelEl) labelEl.textContent = strengthLabels[0];

      const cardSub = domQuery('.card__sub', pwForm.closest('.card') as HTMLElement);
      if (cardSub) cardSub.textContent = 'Changed just now';

      showToast('Password changed — other devices stay signed in', { ico: 'lock' });
    });
  }

  // Theme Selector
  container.addEventListener('click', (e) => {
    const themeBtn = (e.target as HTMLElement).closest<HTMLButtonElement>('.st-theme');
    if (themeBtn) {
      playHaptic(themeBtn);
      setSavedTheme(themeBtn.dataset.pref as any, themeBtn);
      updateThemeButtons(container);
    }
  });

  // Sign out other sessions
  queryOne<HTMLElement>('[data-k="ac-out"]', container)?.addEventListener('click', async (e) => {
    const currentTarget = e.currentTarget as HTMLElement;
    playHaptic(currentTarget);
    const others = sessions.filter((s) => !s.me);
    if (!others.length) return;

    const confirmed = await confirmDialog(
      'Sign out other sessions?',
      `${others.map((s) => s.device).join(' and ')} will need your password to get back in.`,
      'Sign them out'
    );
    if (!confirmed) return;

    const sessionElements = others
      .map((s) => queryOne(`[data-key="${s.id}"]`, queryOne('[data-k="ac-sessions"]', container)))
      .filter((el): el is HTMLElement => !!el);

    let remaining = sessionElements.length;
    const onFinished = () => {
      if (--remaining <= 0) {
        bindModalDismiss(queryOne('[data-k="ac-sessions"]', container) as HTMLElement, () => {
          sessions = sessions.filter((s) => s.me);
          renderSessionsList(container);
        });
        showToast(`Signed out of ${pluralize(others.length, 'other device')}`, { ico: 'logout' });
      }
    };

    sessionElements.forEach((el) => animateElementOut(el, onFinished));
    if (!sessionElements.length) {
      remaining = 1;
      onFinished();
    }
  });
}

export function animateAccountSubtab(container: HTMLElement): void {
  gsap
    .timeline()
    .add(animatePageTransition(container), 0)
    .add(animateCards(domQueryAll('.card', container), { stagger: 0.07 }), 0.1)
    .add(animateRows(domQueryAll('.st-field, .st-theme, .st-sess__row', container), { y: 10, stagger: 0.03 }), 0.3);

  const avEl = queryOne('.st-profile__id .av', container);
  if (avEl) animatePop(avEl, { from: 0.6, delay: 0.3 });

  const meterEl = queryOne('[data-k="pw-meter"]', container);
  if (meterEl) gsap.set(meterEl, { scaleX: 0 });
}
