// Vels Agro — Enterprise Admin Login Page Module
// Integrated with Real Agro Background, Ambient Physics & Glassmorphism
// Wired to Live Unified Authentication Gateway with GSAP & SweetAlert2
import Swal from 'sweetalert2';
import { gsap } from 'gsap';
import { unifiedLogin } from '../../core/api/authService';
import { ApiError } from '../../core/api/apiClient';
import './login.css';

let containerEl: HTMLElement | null = null;
let lockoutTimerInterval: any = null;
let remainingLockoutSeconds = 0;

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
          <div class="login-card__badge">
            <span class="login-card__badge-dot" aria-hidden="true"></span>
            <span>Enterprise Gateway</span>
          </div>
        </div>

        <!-- Heading Group -->
        <div class="login-card__head">
          <h1 class="login-card__title">Sign in to Vels Agro</h1>
          <p class="login-card__subtitle">
            Enter your administrative credentials to manage inventory, machinery & dealers
          </p>
        </div>

        <!-- Input Fields -->
        <div class="login-card__fields">
          <!-- Work Email -->
          <label class="field" for="login-email">
            <span class="field__label">
              <span>Work email</span>
              <span class="field__req" aria-hidden="true">*</span>
            </span>
            <div class="field__control">
              <svg class="ico field__ico" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
              <input
                type="email"
                id="login-email"
                name="email"
                class="field__input"
                placeholder="name@velsagro.com"
                autocomplete="username"
                required
              />
            </div>
          </label>

          <!-- Password -->
          <label class="field" for="login-pass">
            <div class="field__label-row">
              <span class="field__label">
                <span>Password</span>
                <span class="field__req" aria-hidden="true">*</span>
              </span>
            </div>
            <div class="field__control">
              <svg class="ico field__ico" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
                <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
              </svg>
              <input
                type="password"
                id="login-pass"
                name="password"
                class="field__input field__input--pass"
                placeholder="••••••••••••"
                autocomplete="current-password"
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

          <!-- Dynamic Error & Lockout Alert Banner -->
          <div class="login-alert" id="login-alert" role="alert" style="display: none;">
            <div class="login-alert__icon" id="login-alert-icon"></div>
            <div class="login-alert__content">
              <strong class="login-alert__title" id="login-alert-title"></strong>
              <p class="login-alert__desc" id="login-alert-desc"></p>
              <div class="login-alert__timer" id="login-alert-timer" style="display: none;">
                <span>Lockout expires in: </span><b id="lockout-countdown">15:00</b>
              </div>
            </div>
          </div>

          <!-- Action Button with Diagonal Shine Beam & Arrow Bounce -->
          <button type="submit" class="btn btn--primary login-card__btn" id="login-submit">
            <span>Sign in</span>
            <svg class="ico" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

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

function showLoginAlert(
  type: 'danger' | 'warning',
  title: string,
  desc: string,
  countdownSeconds?: number
) {
  const alertEl = document.querySelector('#login-alert') as HTMLElement | null;
  const iconEl = document.querySelector('#login-alert-icon') as HTMLElement | null;
  const titleEl = document.querySelector('#login-alert-title') as HTMLElement | null;
  const descEl = document.querySelector('#login-alert-desc') as HTMLElement | null;
  const timerWrap = document.querySelector('#login-alert-timer') as HTMLElement | null;
  const countdownEl = document.querySelector('#lockout-countdown') as HTMLElement | null;

  if (!alertEl || !iconEl || !titleEl || !descEl) return;

  // Clear previous intervals
  if (lockoutTimerInterval) {
    clearInterval(lockoutTimerInterval);
    lockoutTimerInterval = null;
  }

  alertEl.className = `login-alert login-alert--${type}`;
  alertEl.style.display = 'flex';
  titleEl.textContent = title;
  descEl.textContent = desc;

  if (type === 'danger') {
    iconEl.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    `;
    if (timerWrap) timerWrap.style.display = 'none';
  } else {
    // Warning / Lockout
    iconEl.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </svg>
    `;

    if (countdownSeconds && timerWrap && countdownEl) {
      timerWrap.style.display = 'flex';
      remainingLockoutSeconds = countdownSeconds;

      const updateTimerDisplay = () => {
        const mins = Math.floor(remainingLockoutSeconds / 60);
        const secs = remainingLockoutSeconds % 60;
        countdownEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      };

      updateTimerDisplay();
      lockoutTimerInterval = setInterval(() => {
        remainingLockoutSeconds--;
        if (remainingLockoutSeconds <= 0) {
          clearInterval(lockoutTimerInterval);
          lockoutTimerInterval = null;
          clearLoginAlert();
          const submitBtn = document.querySelector('#login-submit') as HTMLButtonElement | null;
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<span>Sign in</span>
              <svg class="ico" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>`;
          }
        } else {
          updateTimerDisplay();
        }
      }, 1000);
    }
  }

  // Trigger GSAP card shake animation (Q2 - Option A)
  gsap.fromTo(
    '.login-card',
    { x: -9 },
    {
      x: 9,
      duration: 0.06,
      repeat: 5,
      yoyo: true,
      ease: 'power2.inOut',
      onComplete: () => {
        gsap.set('.login-card', { x: 0 });
      },
    }
  );
}

function clearLoginAlert() {
  const alertEl = document.querySelector('#login-alert') as HTMLElement | null;
  if (alertEl) {
    alertEl.style.display = 'none';
  }
  const emailInput = document.querySelector('#login-email') as HTMLInputElement | null;
  const passInput = document.querySelector('#login-pass') as HTMLInputElement | null;
  emailInput?.classList.remove('is-invalid');
  passInput?.classList.remove('is-invalid');
}

async function handleLoginSubmit(e: Event) {
  e.preventDefault();
  const form = e.target as HTMLFormElement;
  const emailInput = form.querySelector('#login-email') as HTMLInputElement | null;
  const passInput = form.querySelector('#login-pass') as HTMLInputElement | null;
  const submitBtn = form.querySelector('#login-submit') as HTMLButtonElement | null;

  if (!emailInput || !passInput || !submitBtn) return;

  const email = emailInput.value.trim();
  const pass = passInput.value.trim();

  clearLoginAlert();

  // Basic client-side validation
  if (!email) {
    emailInput.classList.add('is-invalid');
    emailInput.focus();
    showLoginAlert('danger', 'Email Required', 'Please enter your administrator work email.');
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    emailInput.classList.add('is-invalid');
    emailInput.focus();
    showLoginAlert('danger', 'Invalid Email Format', 'Please enter a valid business email address.');
    return;
  }

  if (!pass) {
    passInput.classList.add('is-invalid');
    passInput.focus();
    showLoginAlert('danger', 'Password Required', 'Please enter your password.');
    return;
  }

  if (pass.length < 4) {
    passInput.classList.add('is-invalid');
    passInput.focus();
    showLoginAlert('danger', 'Password Too Short', 'Password must be at least 4 characters.');
    return;
  }

  // Visual loading feedback on button
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<span>Verifying credentials...</span>`;

  try {
    // Unified Smart Authentication Call (Q1 - Option C)
    const res = await unifiedLogin(email, pass);

    // Micro-interaction on button (Q4 - Option A)
    submitBtn.classList.add('is-success');
    submitBtn.innerHTML = `<span>✓ Authenticated</span>`;

    // SweetAlert2 notification with Agro Emerald Theme (Q4)
    const isDark = document.documentElement.dataset.theme === 'dark';
    await Swal.fire({
      title: 'Authentication Successful',
      text: `Welcome back, ${res.user.first_name || res.user.name || 'Admin'}! Secure session established.`,
      icon: 'success',
      timer: 1400,
      timerProgressBar: true,
      showConfirmButton: false,
      background: isDark ? '#142017' : '#ffffff',
      color: isDark ? '#f0fdf4' : '#14532d',
      iconColor: '#10b981',
      customClass: {
        popup: 'vels-swal-popup',
        timerProgressBar: 'vels-swal-progress',
      },
    });

    // Smooth navigation to Dashboard Overview
    try {
      if (typeof (window as any).navigateTo === 'function') {
        (window as any).navigateTo('/dashboard/overview');
      } else {
        window.location.pathname = '/dashboard/overview';
      }
    } catch (navErr) {
      console.error('Navigation error:', navErr);
      window.location.pathname = '/dashboard/overview';
    }
  } catch (err: any) {
    submitBtn.classList.remove('is-success');

    if (err instanceof ApiError && err.statusCode === 429) {
      // Q3 - Both (Amber Lockout Box + Live Countdown Timer + Disabled Button)
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Account Locked</span>`;
      showLoginAlert(
        'warning',
        'Security Lockout (Too Many Attempts)',
        err.message || 'Account temporarily locked due to too many failed attempts. Try again in 15 minutes.',
        900
      );
    } else {
      // Q2 - Option A (Card Shake + Red Banner Alert)
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>Sign in</span>
        <svg class="ico" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>`;

      passInput.classList.add('is-invalid');
      passInput.focus();

      const errMsg = err?.message || 'Invalid email or password.';
      showLoginAlert('danger', 'Authentication Failed', errMsg);
    }
  }
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
  const current = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  const next = current === 'dark' ? 'light' : 'dark';

  if (!(document as any).startViewTransition) {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('Vels:theme', JSON.stringify(next));
    } catch {}
    updateThemeIcons(next);
    return;
  }

  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  const transition = (document as any).startViewTransition(() => {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('Vels:theme', JSON.stringify(next));
    } catch {}
    updateThemeIcons(next);
  });

  transition.ready.then(() => {
    document.documentElement.animate(
      {
        clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`],
      },
      {
        duration: 480,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        pseudoElement: '::view-transition-new(root)',
      }
    );
  });
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
      const submitBtn = containerEl.querySelector('#login-submit') as HTMLButtonElement | null;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('is-success');
        submitBtn.innerHTML = `<span>Sign in</span>
          <svg class="ico" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>`;
      }
      clearLoginAlert();
      const emailInput = containerEl.querySelector('#login-email') as HTMLInputElement | null;
      if (emailInput && !emailInput.value) {
        emailInput.focus();
      }
    }
  },
  leave() {
    if (lockoutTimerInterval) {
      clearInterval(lockoutTimerInterval);
      lockoutTimerInterval = null;
    }
  },
};
