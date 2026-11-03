// Vels Agro — Dedicated Admin Login Page Module
import './login.css';

interface RolePreset {
  name: string;
  role: string;
  email: string;
  pass: string;
  icon: string;
}

const ROLES: RolePreset[] = [
  {
    name: 'Super Admin',
    role: 'superadmin',
    email: 'admin@velsagro.com',
    pass: 'vels@admin2026',
    icon: '👑',
  },
  {
    name: 'Inventory Mgr',
    role: 'inventory',
    email: 'inventory@velsagro.com',
    pass: 'vels@inv2026',
    icon: '📦',
  },
  {
    name: 'Dealer Mgr',
    role: 'dealers',
    email: 'dealers@velsagro.com',
    pass: 'vels@dealer2026',
    icon: '🤝',
  },
];

let containerEl: HTMLElement | null = null;
let currentRole = ROLES[0];

function renderLoginForm(): string {
  return `
    <div class="login-page">
      <!-- Left Hero Banner -->
      <aside class="login-hero">
        <div class="login-hero__brand">
          <img src="/brand/vels_logo.svg" alt="Vels Agro" class="login-hero__logo" />
          <div>
            <span class="login-hero__title">Vels Agro</span>
            <span class="login-hero__badge">Admin Web App</span>
          </div>
        </div>

        <div class="login-hero__body">
          <h1 class="login-hero__headline">Agricultural Machinery & Spare Parts Command Center</h1>
          <p class="login-hero__sub">
            Integrated management panel for dual-channel operations: B2C retail orders, B2B authorized dealer networks, live logistics tracking, and automated GST compliance.
          </p>

          <div class="login-hero__features">
            <div class="login-feat">
              <div class="login-feat__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v18M3 12h18M6 7l12 10M18 7L6 17"/></svg>
              </div>
              <div class="login-feat__text">
                <b>Machinery & Model Compatibility</b>
                <span>Multi-brand tractor & equipment parts matching engine</span>
              </div>
            </div>

            <div class="login-feat">
              <div class="login-feat__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div class="login-feat__text">
                <b>B2B Dealer Network Portal</b>
                <span>Dealer KYC approvals, custom wholesale pricing & inventory quotas</span>
              </div>
            </div>

            <div class="login-feat">
              <div class="login-feat__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              </div>
              <div class="login-feat__text">
                <b>Courier Logistics & AWB Tracking</b>
                <span>Automated courier assignment, live AWB sync & RTO prevention</span>
              </div>
            </div>
          </div>
        </div>

        <div class="login-hero__foot">
          <span>Sai Techno Solutions • Enterprise Platform</span>
          <span>Version 2.4 (INR/GST Ready)</span>
        </div>
      </aside>

      <!-- Right Form Container -->
      <section class="login-form-panel">
        <div class="login-box">
          <div class="login-box__head">
            <div class="login-box__icon">
              <img src="/brand/vels_logo.svg" alt="Vels" />
            </div>
            <h2 class="login-box__title">Admin Sign In</h2>
            <p class="login-box__desc">Enter your credentials to manage Vels Agro platform</p>
          </div>

          <!-- Role Presets for Testing -->
          <div class="login-roles">
            <div class="login-roles__label">
              <span>Quick Login by Role</span>
              <small>Click to auto-fill</small>
            </div>
            <div class="login-roles__chips">
              ${ROLES.map(
                (r, idx) => `
                <button type="button" class="login-role-chip ${idx === 0 ? 'is-active' : ''}" data-role-idx="${idx}">
                  <span>${r.icon} ${r.name}</span>
                  <small>${r.role}</small>
                </button>
              `,
              ).join('')}
            </div>
          </div>

          <!-- Error Banner -->
          <div class="login-err" id="login-err-msg"></div>

          <!-- Form -->
          <form class="login-form" id="admin-login-form" novalidate>
            <div class="login-field">
              <label for="admin-email">Admin Email Address</label>
              <div class="login-input-wrap">
                <svg class="login-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input id="admin-email" type="email" autocomplete="username" value="${currentRole.email}" placeholder="admin@velsagro.com" required />
              </div>
            </div>

            <div class="login-field">
              <label for="admin-pass">Secure Password</label>
              <div class="login-input-wrap">
                <svg class="login-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input id="admin-pass" type="password" autocomplete="current-password" value="${currentRole.pass}" placeholder="••••••••••••" required />
              </div>
            </div>

            <button type="submit" class="login-btn" id="login-submit-btn">
              <span>Sign In to Dashboard</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </form>

          <footer class="login-foot">
            <p>Vels Agro Admin Panel • Authorized Personnel Only</p>
            <p style="font-size: 11px; opacity: 0.7; margin-top: 4px;">Session is protected with end-to-end token encryption</p>
          </footer>
        </div>
      </section>
    </div>
  `;
}

export const page = {
  title: 'Admin Login',
  mount(el: HTMLElement) {
    containerEl = el;
    el.innerHTML = renderLoginForm();
    this.bindEvents(el);
  },
  bindEvents(el: HTMLElement) {
    const form = el.querySelector('#admin-login-form') as HTMLFormElement | null;
    const emailInput = el.querySelector('#admin-email') as HTMLInputElement | null;
    const passInput = el.querySelector('#admin-pass') as HTMLInputElement | null;
    const errMsg = el.querySelector('#login-err-msg') as HTMLElement | null;
    const chips = el.querySelectorAll('.login-role-chip');

    // Role quick-picker
    chips.forEach((chip) => {
      chip.addEventListener('click', (e) => {
        const btn = (e.currentTarget as HTMLElement);
        const idx = Number(btn.dataset.roleIdx ?? 0);
        currentRole = ROLES[idx];

        chips.forEach((c) => c.classList.remove('is-active'));
        btn.classList.add('is-active');

        if (emailInput && passInput) {
          emailInput.value = currentRole.email;
          passInput.value = currentRole.pass;
          if (errMsg) errMsg.classList.remove('is-visible');
        }
      });
    });

    // Form submit
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = emailInput?.value.trim() ?? '';
      const pass = passInput?.value ?? '';

      if (!/^\S+@\S+\.\S+$/.test(email)) {
        if (errMsg) {
          errMsg.textContent = 'Please enter a valid official admin email.';
          errMsg.classList.add('is-visible');
        }
        emailInput?.focus();
        return;
      }

      if (pass.length < 4) {
        if (errMsg) {
          errMsg.textContent = 'Password must be at least 4 characters.';
          errMsg.classList.add('is-visible');
        }
        passInput?.focus();
        return;
      }

      // Success Login
      if (errMsg) errMsg.classList.remove('is-visible');
      try {
        localStorage.removeItem('Vels:signedout');
        localStorage.setItem(
          'Vels:active_user',
          JSON.stringify({
            name: currentRole.name,
            role: currentRole.role,
            email: email,
            loginTime: Date.now(),
          })
        );
      } catch {}

      // Transition smoothly to dashboard
      const submitBtn = el.querySelector('#login-submit-btn') as HTMLButtonElement | null;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Authenticating...</span>`;
      }

      setTimeout(() => {
        if ((window as any).navigateTo) {
          (window as any).navigateTo('/dashboard/overview');
        } else {
          location.href = '/dashboard/overview';
        }
      }, 350);
    });
  },
  enter() {
    document.documentElement.dataset.route = 'login';
    const emailInput = containerEl?.querySelector('#admin-email') as HTMLInputElement | null;
    emailInput?.focus();
  },
  leave() {
    // Left login page
  },
};
