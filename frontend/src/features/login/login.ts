// Vels Agro — Enterprise Admin Login Page Module
// Integrated with Real Agro Background, Ambient Physics & Glassmorphism
import './login.css';

let containerEl: HTMLElement | null = null;

function renderLoginForm(): string {
  const currentTheme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';

  return `
    <!-- Background Canvas with Ken-Burns, Luminous Scrim & Glow Orbs -->
    <div class="login-bg-layer" aria-hidden="true">
      <div class="login-bg-image"></div>
      <div class="login-bg-scrim"></div>
      <div class="login-bg-orb login-bg-orb--1"></div>
      <div class="login-bg-orb login-bg-orb--2"></div>
      <div class="login-bg-mesh"></div>
    </div>

    <!-- Top Utility Bar: Live System Pill + Theme Switcher -->
    <header class="login-topbar" aria-label="System status & preferences">
      <div class="login-status-pill">
        <i aria-hidden="true"></i>
        <span>Vels Cloud Network • Operational</span>
      </div>

      <button
        type="button"
        class="login-theme-toggle"
        id="login-theme-toggle"
        aria-label="Toggle light or dark theme"
        title="Toggle theme"
      >
        <svg class="ico ico--sun" viewBox="0 0 24 24" aria-hidden="true" style="${currentTheme === 'dark' ? 'display: block;' : 'display: none;'}">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" />
        </svg>
        <svg class="ico ico--moon" viewBox="0 0 24 24" aria-hidden="true" style="${currentTheme === 'dark' ? 'display: none;' : 'display: block;'}">
          <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1Z" />
        </svg>
      </button>
    </header>

    <!-- Centered Glassmorphic Login Card -->
    <div class="login-view-wrap">
      <form class="login-card" id="login-form" novalidate>
        <!-- Card Top: Floating Logo & Enterprise Status Badge -->
        <div class="login-card__top">
          <div class="login-card__mark" aria-hidden="true">
            <img src="/brand/vels_logo.svg" alt="Vels Agro Logo" class="login-card__logo" />
          </div>
          <span class="badge badge--good">
            <i class="dot" aria-hidden="true"></i> Admin Portal
          </span>
        </div>

        <!-- Card Headline -->
        <div class="login-card__head">
          <h1 class="login-card__title">Welcome back to Vels</h1>
          <p class="login-card__sub">Sign in to Vels Agro Machinery &amp; Parts stockroom</p>
        </div>

        <!-- Work Email Field -->
        <label class="field">
          <span class="field__label">Work email</span>
          <input
            id="login-email"
            type="email"
            autocomplete="username"
            value="admin@velsagro.com"
            placeholder="name@velsagro.com"
            required
            spellcheck="false"
          />
        </label>

        <!-- Password Field with View Eye Toggle -->
        <label class="field">
          <span class="field__label">Password</span>
          <div class="field__input-wrap">
            <input
              id="login-pass"
              type="password"
              autocomplete="current-password"
              value="vels@admin2026"
              placeholder="••••••••••••"
              required
            />
            <button
              type="button"
              class="field__eye-btn"
              id="btn-toggle-pass"
              aria-label="Show password"
              title="Show password"
            >
              <svg class="ico ico--eye" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
                <circle cx="12" cy="12" r="2.8" />
              </svg>
              <svg class="ico ico--eye-off" viewBox="0 0 24 24" aria-hidden="true" style="display: none;">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-7 0-11-7-11-7a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 5c7 0 11 7 11 7a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="2" y1="2" x2="22" y2="22" />
              </svg>
            </button>
          </div>
        </label>

        <!-- Security & Remember Me Row -->
        <div class="login-card__row">
          <label class="login-card__remember">
            <input type="checkbox" id="login-remember" checked />
            <span>Keep me signed in</span>
          </label>
          <span class="login-card__ssl">
            <svg class="ico" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
              <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
            </svg>
            <span>SSL Secured</span>
          </span>
        </div>

        <p class="mform__err" id="login-err" role="alert"></p>

        <!-- Action Button with Diagonal Shine Beam & Arrow Bounce -->
        <button type="submit" class="btn btn--primary login-card__btn" id="login-submit">
          <span>Sign in</span>
          <svg class="ico" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>

        <!-- Card Trust Footer -->
        <div class="login-card__foot">
          <svg class="ico" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3.5 4.5 6v5.5c0 4.6 3.2 7.8 7.5 9 4.3-1.2 7.5-4.4 7.5-9V6z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <span>Authorized administrator access only • Enterprise Edition</span>
        </div>
      </form>

      <!-- Bottom Platform Signature -->
      <div class="login-footer-info">
        <span>Vels Agro Machinery &amp; Parts</span>
        <span>•</span>
        <span>Sai Techno Solutions</span>
      </div>
    </div>
  `;
}

function handleLoginSubmit(e: Event) {
  e.preventDefault();
  const form = e.target as HTMLFormElement;
  const emailInput = form.querySelector('#login-email') as HTMLInputElement | null;
  const passInput = form.querySelector('#login-pass') as HTMLInputElement | null;
  const errEl = form.querySelector('#login-err') as HTMLElement | null;
  const submitBtn = form.querySelector('#login-submit') as HTMLButtonElement | null;

  if (!emailInput || !passInput || !errEl) return;

  const email = emailInput.value.trim();
  const pass = passInput.value.trim();

  // Reset error
  errEl.textContent = '';
  errEl.classList.remove('is-active');

  // Basic validation
  if (!email) {
    errEl.textContent = 'Please enter your work email.';
    errEl.classList.add('is-active');
    emailInput.focus();
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errEl.textContent = 'Please enter a valid work email address.';
    errEl.classList.add('is-active');
    emailInput.focus();
    return;
  }

  if (!pass) {
    errEl.textContent = 'Please enter your password.';
    errEl.classList.add('is-active');
    passInput.focus();
    return;
  }

  if (pass.length < 4) {
    errEl.textContent = 'Password must be at least 4 characters.';
    errEl.classList.add('is-active');
    passInput.focus();
    return;
  }

  // Visual loading feedback on button
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>Signing in...</span>`;
  }

  setTimeout(() => {
    try {
      localStorage.setItem('Vels:signedout', '0');
      localStorage.setItem(
        'Vels:active_user',
        JSON.stringify({
          email,
          role: 'Super Admin',
          name: email.split('@')[0],
          loginTime: new Date().toISOString(),
        })
      );
    } catch (err) {
      console.warn('Storage save error:', err);
    }

    // Smooth navigation to Dashboard Overview
    if (typeof (window as any).navigateTo === 'function') {
      (window as any).navigateTo('/dashboard/overview');
    } else {
      window.location.href = '/dashboard/overview';
    }
  }, 350);
}

function updateThemeIcons(theme: string) {
  const sunIcon = document.querySelector('.login-theme-toggle .ico--sun') as HTMLElement | null;
  const moonIcon = document.querySelector('.login-theme-toggle .ico--moon') as HTMLElement | null;

  if (sunIcon && moonIcon) {
    sunIcon.style.display = theme === 'dark' ? 'block' : 'none';
    moonIcon.style.display = theme === 'dark' ? 'none' : 'block';
  }
}

function handleThemeToggle(e: MouseEvent) {
  const btn = (e.currentTarget as HTMLElement) || (document.getElementById('login-theme-toggle') as HTMLElement);
  const current = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  const next = current === 'dark' ? 'light' : 'dark';

  // Icon spin & bounce animation
  if (btn) {
    btn.animate(
      [
        { transform: 'scale(0.85) rotate(-90deg)' },
        { transform: 'scale(1.12) rotate(15deg)', offset: 0.7 },
        { transform: 'scale(1) rotate(0deg)' },
      ],
      { duration: 550, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }
    );
  }

  // 1. If global setTheme is available (from main.ts), delegate to it for native consistency
  if (typeof (window as any).setTheme === 'function') {
    (window as any).setTheme(next, btn);
    updateThemeIcons(next);
    return;
  }

  // 2. Direct circular ripple view-transition implementation (matches El in main.ts)
  const applyTheme = () => {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('Vels:theme', JSON.stringify(next));
    } catch {}
    updateThemeIcons(next);
  };

  const doc = document as any;
  if (!doc.startViewTransition || !btn) {
    applyTheme();
    return;
  }

  const rect = btn.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  const maxRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  const transition = doc.startViewTransition(applyTheme);

  transition.ready
    .then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 620,
          easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    })
    .catch(() => {});
}

export const page = {
  title: 'Admin Sign In',
  mount(el: HTMLElement) {
    containerEl = el;
    el.innerHTML = renderLoginForm();
    this.bindEvents(el);
  },
  bindEvents(el: HTMLElement) {
    const form = el.querySelector('#login-form');
    if (form) {
      form.addEventListener('submit', handleLoginSubmit);
    }

    const togglePassBtn = el.querySelector('#btn-toggle-pass') as HTMLButtonElement | null;
    const passInput = el.querySelector('#login-pass') as HTMLInputElement | null;
    if (togglePassBtn && passInput) {
      togglePassBtn.addEventListener('click', () => {
        const isPassword = passInput.type === 'password';
        passInput.type = isPassword ? 'text' : 'password';

        const eyeIcon = togglePassBtn.querySelector('.ico--eye') as HTMLElement | null;
        const eyeOffIcon = togglePassBtn.querySelector('.ico--eye-off') as HTMLElement | null;

        if (eyeIcon && eyeOffIcon) {
          eyeIcon.style.display = isPassword ? 'none' : 'block';
          eyeOffIcon.style.display = isPassword ? 'block' : 'none';
        }

        const label = isPassword ? 'Hide password' : 'Show password';
        togglePassBtn.setAttribute('aria-label', label);
        togglePassBtn.title = label;
      });
    }

    const themeBtn = el.querySelector('#login-theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', (e) => handleThemeToggle(e as MouseEvent));
    }
  },
  enter() {
    if (containerEl) {
      const emailInput = containerEl.querySelector('#login-email') as HTMLInputElement | null;
      if (emailInput && !emailInput.value) {
        emailInput.focus();
      }
    }
  },
  leave() {
    // Cleanup if needed
  },
};
