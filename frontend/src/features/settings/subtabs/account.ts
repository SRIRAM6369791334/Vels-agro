import {
  animateCards,
  animateRows,
  animatePop,
  playHaptic,
  gsap,
} from '../../../core/motion';
import { escapeHtml, domQuery, domQueryAll, queryOne } from '../../../utils/dom';
import { formatDate, formatRelativeTime, pluralize } from '../../../utils/formatters';
import { renderIcon, renderPill } from '../../../utils/icons';
import {
  getSavedTheme,
  setSavedTheme,
  bindAccentPicker,
  getCurrentAccentName,
  renderAccentPickerHtml,
  renderPageHeader,
  renderTag,
  showToast,
  confirmDialog,
  animatePageTransition,
} from '../../../main';
import { renderFormField, showFieldError } from '../components/form-controls';
import { getMe, updateProfile, getActiveSessions, revokeOtherSessions } from '../../../core/api/authService';

interface UserProfileData {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  name: string;
  jobTitle: string;
  phone: string;
  roleName: string;
  roleId?: number | null;
  userType: 'SUPER_ADMIN' | 'DASHBOARD_USER';
  permissions: string[];
  isActive: boolean;
  lastLoginAt?: string;
  createdAt?: string;
}

interface LiveSession {
  id: string;
  user_agent: string;
  ip_address: string;
  created_at: string;
  expires_at: string;
  is_current: number | boolean;
}

let activeProfile: UserProfileData = getInitialProfile();
let liveSessions: LiveSession[] = [];

function getInitialProfile(): UserProfileData {
  try {
    const raw = localStorage.getItem('Vels:active_user');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        id: parsed.id || 1,
        email: parsed.email || 'admin@velsagro.com',
        firstName: parsed.firstName || parsed.first_name || 'Admin',
        lastName: parsed.lastName || parsed.last_name || '',
        name: parsed.name || `${parsed.firstName || ''} ${parsed.lastName || ''}`.trim() || 'Admin User',
        jobTitle: parsed.jobTitle || parsed.job_title || (parsed.userType === 'SUPER_ADMIN' ? 'Super Administrator' : 'Staff Member'),
        phone: parsed.phone || '',
        roleName: parsed.roleName || parsed.role || 'Super Administrator',
        roleId: parsed.roleId || null,
        userType: parsed.userType || parsed.user_type || 'SUPER_ADMIN',
        permissions: parsed.permissions || ['*'],
        isActive: true,
        lastLoginAt: parsed.lastLoginAt || new Date().toISOString(),
        createdAt: parsed.createdAt || new Date().toISOString(),
      };
    }
  } catch {}

  return {
    id: 1,
    email: 'admin@velsagro.com',
    name: 'Super Administrator',
    jobTitle: 'Super Administrator',
    phone: '',
    roleName: 'Super Administrator',
    userType: 'SUPER_ADMIN',
    permissions: ['*'],
    isActive: true,
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
}

function renderUserAvatar(name: string, size = 'xl'): string {
  const clean = (name || '').trim();
  const initials = clean
    ? clean
        .split(/\s+/)
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'VA';
  return `<span class="av av--${size} av--pine" title="${escapeHtml(name)}" aria-hidden="true">${escapeHtml(initials)}</span>`;
}

function parseUserAgent(ua: string): { device: string; app: string; ico: string } {
  if (!ua || ua === 'node') {
    return { device: 'API Client / Script', app: 'Node.js Engine', ico: 'sidebar' };
  }
  const isMobile = /iPhone|iPad|Android|Mobile/i.test(ua);
  let browser = 'Web Browser';
  if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) browser = 'Chrome';
  else if (/Edg/i.test(ua)) browser = 'Microsoft Edge';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';

  let os = 'Windows';
  if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS';
  else if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Linux/i.test(ua)) os = 'Linux';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad/i.test(ua)) os = 'iOS';

  return {
    device: `${os} Workstation`,
    app: `${browser} · ${os}`,
    ico: isMobile ? 'mobile' : 'sidebar',
  };
}

export function renderAccountSubtab(): string {
  activeProfile = getInitialProfile();

  return `${renderPageHeader({
    eyebrow: 'User Account — Your live profile and security credentials',
    title: 'Account',
  })}
  <div class="st-grid st-grid--account">
    <div class="st-stack">
      <!-- Profile Card -->
      <section class="card st-profile" aria-labelledby="ac-p-t">
        <header class="card__head">
          <div>
            <h2 class="card__title" id="ac-p-t">Profile</h2>
            <p class="card__sub">How teammates see you across Vels stockroom, orders and audits</p>
          </div>
          ${renderTag('user', 'pine', 'sm')}
        </header>
        <div class="st-profile__body">
          <div class="st-profile__id">
            <span data-k="ac-av">${renderUserAvatar(activeProfile.name, 'xl')}</span>
            <div>
              <b data-k="ac-name">${escapeHtml(activeProfile.name)}</b>
              <small data-k="ac-role">${escapeHtml(activeProfile.jobTitle)} · ${escapeHtml(activeProfile.roleName)}</small>
            </div>
          </div>
          <form class="st-form" data-k="ac-form" novalidate>
            ${renderFormField({
              name: 'name',
              label: 'Full name',
              value: activeProfile.name,
              ac: 'name',
            })}
            ${renderFormField({
              name: 'email',
              label: 'Work email (Account Identity)',
              value: activeProfile.email,
              type: 'email',
              ac: 'email',
              readonly: true,
              hint: '🔒 Permanent login identity (cannot be modified for security reasons)',
            })}
            ${renderFormField({
              name: 'title',
              label: 'Job title',
              value: activeProfile.jobTitle,
              ac: 'organization-title',
            })}
            ${renderFormField({
              name: 'phone',
              label: 'Phone number',
              value: activeProfile.phone,
              type: 'tel',
              ac: 'tel',
            })}
            <div class="st-form__foot st-field--wide">
              <span class="st-dirty" data-k="ac-dirty" hidden>${renderIcon('edit')}Unsaved changes</span>
              <button type="button" class="btn btn--ghost btn--sm" data-k="ac-reset" hidden>Discard</button>
              <button type="submit" class="btn btn--primary btn--sm" data-k="ac-save" disabled>${renderIcon('check')}Save profile</button>
            </div>
          </form>
        </div>
      </section>

      <!-- Active Sessions Card -->
      <section class="card st-sess" aria-labelledby="ac-s-t">
        <header class="card__head">
          <div>
            <h2 class="card__title" id="ac-s-t">Where you’re signed in</h2>
            <p class="card__sub" data-k="ac-s-sub">Active MySQL sessions</p>
          </div>
          <div class="card__tools">
            <button type="button" class="btn btn--ghost btn--sm" data-k="ac-out" hidden>${renderIcon('logout')}Sign out other sessions</button>
          </div>
        </header>
        <div class="rows" data-k="ac-sessions">
          <div class="row"><small>Loading active sessions...</small></div>
        </div>
      </section>
    </div>

    <div class="st-stack">
      <!-- System Privileges & Account Metadata Card -->
      <section class="card st-security" aria-labelledby="ac-sec-t">
        <header class="card__head">
          <div>
            <h2 class="card__title" id="ac-sec-t">Privileges &amp; Security</h2>
            <p class="card__sub">System permissions and encryption status</p>
          </div>
          ${renderTag('shield', 'pine', 'sm')}
        </header>
        <div class="rows">
          <div class="row">
            <span class="row__txt">
              <b>Account Tier</b>
              <small data-k="ac-tier">${activeProfile.userType === 'SUPER_ADMIN' ? 'Super Administrator (Full System Privilege)' : 'Dashboard Staff User'}</small>
            </span>
            <span class="row__end">${renderPill(activeProfile.userType === 'SUPER_ADMIN' ? 'Tier 1' : 'Tier 2', 'pine')}</span>
          </div>
          <div class="row">
            <span class="row__txt">
              <b>Security Status</b>
              <small>Account Active &amp; Brute-Force Shield Enabled</small>
            </span>
            <span class="row__end">${renderPill('Active', 'sage')}</span>
          </div>
          <div class="row">
            <span class="row__txt">
              <b>Assigned Role</b>
              <small data-k="ac-priv-role">${escapeHtml(activeProfile.roleName)}</small>
            </span>
            <span class="row__end">${renderTag('key', 'ocean', 'sm')}</span>
          </div>
          <div class="row">
            <span class="row__txt">
              <b>Session Protocol</b>
              <small>JWT Bearer + SHA-256 Covering Index</small>
            </span>
            <span class="row__end">${renderTag('lock', 'teal', 'sm')}</span>
          </div>
        </div>
      </section>

      <!-- Appearance Card -->
      <section class="card st-look" aria-labelledby="ac-th-t">
        <header class="card__head">
          <div>
            <h2 class="card__title" id="ac-th-t">Appearance</h2>
            <p class="card__sub">Saved locally on this device</p>
          </div>
        </header>
        <div class="st-themes" role="group" aria-label="Theme">
          ${['light', 'dark', 'system']
            .map(
              (pref) => `<button type="button" class="st-theme" data-pref="${pref}" aria-pressed="${getSavedTheme() === pref}">
            <span class="st-theme__prev" data-pv="${pref}" aria-hidden="true"><i class="st-pv"><i></i><i></i><i></i></i>${pref === 'system' ? '<i class="st-pv st-pv--dark"><i></i><i></i><i></i></i>' : ''}</span>
            <span class="st-theme__name">${renderIcon(pref === 'light' ? 'sun' : pref === 'dark' ? 'moon' : 'sidebar')}${pref === 'light' ? 'Light' : pref === 'dark' ? 'Dark' : 'System'}<span class="st-theme__tick">${renderIcon('check')}</span></span>
          </button>`
            )
            .join('')}
        </div>
        <div class="st-accent">
          <div class="st-accent__head">
            <b>Accent colour</b>
            <small data-k="ac-accent-name">${escapeHtml(getCurrentAccentName())}</small>
          </div>
          <p class="st-accent__sub">Buttons, links, the active page and chart highlights.</p>
          <div data-k="ac-accents">${renderAccentPickerHtml()}</div>
        </div>
      </section>
    </div>
  </div>`;
}

export function renderSessionsList(container: HTMLElement, sessionData?: LiveSession[]): void {
  const sessionsEl = queryOne<HTMLElement>('[data-k="ac-sessions"]', container);
  if (!sessionsEl) return;

  if (sessionData) {
    liveSessions = sessionData;
  }

  if (liveSessions.length === 0) {
    sessionsEl.innerHTML = `<p class="st-sess__only">${renderIcon('shield')}No active sessions found.</p>`;
    return;
  }

  sessionsEl.innerHTML = liveSessions
    .map((s) => {
      const isCurrent = Boolean(s.is_current);
      const { device, app, ico } = parseUserAgent(s.user_agent);
      const timeStr = formatRelativeTime(new Date(s.created_at).getTime());
      const ip = s.ip_address || '127.0.0.1';

      return `<div class="row st-sess__row" data-key="${s.id}">
        ${renderTag(ico, isCurrent ? 'pine' : 'slate')}
        <span class="row__txt">
          <b>${escapeHtml(device)}${isCurrent ? ' <span class="st-this">This device</span>' : ''}</b>
          <small>${escapeHtml(app)} · IP: ${escapeHtml(ip)}</small>
        </span>
        <span class="row__end">
          ${isCurrent ? renderPill('Active now', 'sage') : escapeHtml(timeStr)}
        </span>
      </div>`;
    })
    .join('');

  const subEl = queryOne<HTMLElement>('[data-k="ac-s-sub"]', container);
  if (subEl) subEl.textContent = pluralize(liveSessions.length, 'active session');

  const outBtn = queryOne<HTMLElement>('[data-k="ac-out"]', container);
  if (outBtn) outBtn.hidden = liveSessions.length < 2;
}

export function isAccountFormDirty(form: HTMLFormElement): boolean {
  const getVal = (field: string) =>
    (form.elements.namedItem(field) as HTMLInputElement)?.value?.trim() ?? '';
  return (
    getVal('name') !== (activeProfile?.name ?? '') ||
    getVal('title') !== (activeProfile?.jobTitle ?? '') ||
    getVal('phone') !== (activeProfile?.phone ?? '')
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
    saveBtn.innerHTML = `<span>Save profile</span>`;
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
  const getField = (name: string) => form.elements.namedItem(name) as HTMLInputElement;
  if (getField('name')) {
    getField('name').value = activeProfile?.name || '';
    showFieldError(getField('name'), '');
  }
  if (getField('email')) {
    getField('email').value = activeProfile?.email || '';
    getField('email').readOnly = true; // Protect account login identity
    getField('email').tabIndex = -1;
    getField('email').setAttribute('aria-readonly', 'true');
    getField('email').classList.add('st-in--readonly');
  }
  if (getField('title')) {
    getField('title').value = activeProfile?.jobTitle || '';
    showFieldError(getField('title'), '');
  }
  if (getField('phone')) {
    getField('phone').value = activeProfile?.phone || '';
    showFieldError(getField('phone'), '');
  }
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

  // 1. Fetch live profile data from GET /api/v1/auth/me
  getMe()
    .then((profile: any) => {
      if (!profile) return;
      activeProfile = {
        id: profile.id,
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        name: profile.name || `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.email,
        jobTitle: profile.jobTitle || 'Super Administrator',
        phone: profile.phone || '',
        roleName: profile.roleName || 'Super Administrator',
        roleId: profile.roleId || null,
        userType: profile.userType || 'SUPER_ADMIN',
        permissions: profile.permissions || ['*'],
        isActive: Boolean(profile.isActive ?? true),
        lastLoginAt: profile.lastLoginAt,
        createdAt: profile.createdAt,
      };

      // Populate UI with fresh profile data
      const nameEl = queryOne<HTMLElement>('[data-k="ac-name"]', container);
      if (nameEl) nameEl.textContent = activeProfile.name;

      const roleEl = queryOne<HTMLElement>('[data-k="ac-role"]', container);
      if (roleEl) roleEl.textContent = `${activeProfile.jobTitle} · ${activeProfile.roleName}`;

      const avEl = queryOne<HTMLElement>('[data-k="ac-av"]', container);
      if (avEl) avEl.innerHTML = renderUserAvatar(activeProfile.name, 'xl');

      const privRoleEl = queryOne<HTMLElement>('[data-k="ac-priv-role"]', container);
      if (privRoleEl) privRoleEl.textContent = activeProfile.roleName;

      const form = queryOne<HTMLFormElement>('[data-k="ac-form"]', container);
      if (form) resetAccountForm(form, container);
    })
    .catch((err) => console.warn('Could not fetch /api/v1/auth/me:', err));

  // 2. Fetch live sessions from GET /api/v1/auth/sessions
  getActiveSessions()
    .then((sessions) => {
      renderSessionsList(container, sessions);
    })
    .catch((err) => console.warn('Could not fetch /api/v1/auth/sessions:', err));

  // 3. Bind form events for profile editing (PUT /api/v1/auth/me)
  const form = queryOne<HTMLFormElement>('[data-k="ac-form"]', container);
  if (form) {
    resetAccountForm(form, container);
    form.addEventListener('input', () => updateAccountFormState(form, container));

    queryOne<HTMLElement>('[data-k="ac-reset"]', container)?.addEventListener('click', () => {
      resetAccountForm(form, container);
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const getField = (name: string) => form.elements.namedItem(name) as HTMLInputElement;
      const nameVal = getField('name').value.trim();
      const titleVal = getField('title').value.trim();
      const phoneVal = getField('phone').value.trim();
      const saveBtn = queryOne<HTMLButtonElement>('[data-k="ac-save"]', container);

      let firstErrorInput: HTMLInputElement | null = null;
      showFieldError(getField('name'), nameVal.length >= 2 ? '' : 'Enter your name.');
      if (nameVal.length < 2) firstErrorInput = getField('name');

      if (firstErrorInput) {
        firstErrorInput.focus();
        return;
      }

      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = `<span>Saving...</span>`;
      }

      try {
        const updated = await updateProfile({
          name: nameVal,
          jobTitle: titleVal,
          phone: phoneVal,
        });

        activeProfile.name = updated.name;
        activeProfile.jobTitle = updated.jobTitle;
        activeProfile.phone = updated.phone;

        const nameEl = queryOne<HTMLElement>('[data-k="ac-name"]', container);
        if (nameEl) nameEl.textContent = updated.name;

        const roleEl = queryOne<HTMLElement>('[data-k="ac-role"]', container);
        if (roleEl) roleEl.textContent = `${updated.jobTitle} · ${updated.roleName}`;

        const avEl = queryOne<HTMLElement>('[data-k="ac-av"]', container);
        if (avEl) {
          avEl.innerHTML = renderUserAvatar(updated.name, 'xl');
          const avInner = domQuery('.av', avEl);
          if (avInner) animatePop(avInner, { from: 0.7 });
        }

        resetAccountForm(form, container);
        showToast('Profile saved successfully', { ico: 'check' });
      } catch (err: any) {
        showToast(err?.message || 'Failed to save profile', { ico: 'close' });
        updateAccountFormState(form, container);
      }
    });
  }

  // 4. Bind Theme Selector
  container.addEventListener('click', (e) => {
    const themeBtn = (e.target as HTMLElement).closest<HTMLButtonElement>('.st-theme');
    if (themeBtn) {
      playHaptic(themeBtn);
      setSavedTheme(themeBtn.dataset.pref as any, themeBtn);
      updateThemeButtons(container);
    }
  });

  // 5. Sign out other sessions (POST /api/v1/auth/sessions/revoke-others)
  queryOne<HTMLElement>('[data-k="ac-out"]', container)?.addEventListener('click', async (e) => {
    const currentTarget = e.currentTarget as HTMLElement;
    playHaptic(currentTarget);
    const others = liveSessions.filter((s) => !s.is_current);
    if (!others.length) return;

    const confirmed = await confirmDialog(
      'Sign out other sessions?',
      `${others.length} other active session(s) will be revoked from the database.`,
      'Sign them out'
    );
    if (!confirmed) return;

    try {
      await revokeOtherSessions();
      liveSessions = liveSessions.filter((s) => Boolean(s.is_current));
      renderSessionsList(container, liveSessions);
      showToast(`Signed out of ${pluralize(others.length, 'other session')}`, { ico: 'logout' });
    } catch (err: any) {
      showToast(err?.message || 'Failed to sign out other sessions', { ico: 'close' });
    }
  });
}

export function animateAccountSubtab(container: HTMLElement): void {
  gsap
    .timeline()
    .add(animatePageTransition(container), 0)
    .add(animateCards(domQueryAll('.card', container), { stagger: 0.07 }), 0.1)
    .add(
      animateRows(domQueryAll('.st-field, .st-theme, .st-sess__row', container), {
        y: 10,
        stagger: 0.03,
      }),
      0.3
    );

  const avEl = queryOne('.st-profile__id .av', container);
  if (avEl) animatePop(avEl, { from: 0.6, delay: 0.3 });
}
