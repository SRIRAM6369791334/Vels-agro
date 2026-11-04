import { gsap, motionDuration, prefersReducedMotion } from '../core/motion';
import { escapeHtml, domQuery, domQueryAll, queryOne } from '../utils/dom';

export interface PromptField {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'select' | 'textarea' | 'date' | 'email' | 'tel';
  value?: any;
  required?: boolean;
  placeholder?: string;
  options?: [string, string][];
  min?: number;
  max?: number;
  step?: number;
  wide?: boolean;
  hint?: string;
}

export interface PromptDialogConfig {
  title: string;
  sub?: string;
  from?: HTMLElement | null;
  submit: string;
  danger?: boolean;
  fields: PromptField[];
  extra?: string;
  onMount?: (form: HTMLFormElement) => void;
  onSubmit: (values: Record<string, string>) => string | void;
}

const isMobile = matchMedia('(max-width: 760px)');

function reparentToast(): void {
  const toast = queryOne('.toast');
  if (!toast) return;
  const target =
    (['#modal', '#finder', '#drawer']
      .map((sel) => queryOne<HTMLDialogElement>(sel))
      .find((el) => el?.open && !el.dataset.closing) as HTMLElement) ?? document.body;
  if (toast.parentElement !== target) {
    target.append(toast);
  }
}

function wireModal(modal: HTMLDialogElement & { __close?: () => void }): void {
  if (modal.dataset.wired) return;
  modal.dataset.wired = '1';
  modal.addEventListener('cancel', (e) => {
    e.preventDefault();
    modal.__close?.();
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.__close?.();
  });
}

function animateClose(
  modal: HTMLDialogElement & { __close?: () => void },
  targetProps: gsap.TweenVars,
  onComplete?: () => void
): void {
  if (!modal.open || modal.dataset.closing) return;
  modal.dataset.closing = '1';
  reparentToast();
  gsap.to(modal, {
    ...targetProps,
    opacity: 0,
    duration: motionDuration(0.22),
    ease: 'power2.in',
    onComplete: () => {
      delete modal.dataset.closing;
      modal.close();
      gsap.set(modal, { clearProps: 'all' });
      onComplete?.();
    },
  });
}

function shakeElement(el: HTMLElement | null): void {
  if (!el || prefersReducedMotion.matches) return;
  gsap.fromTo(
    el,
    { x: -6 },
    { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)', clearProps: 'transform' }
  );
}

export function openPromptDialog(config: PromptDialogConfig): void {
  const modal = domQuery<HTMLDialogElement & { __close?: () => void }>('#modal');
  const mobile = isMobile.matches;
  const close = () => animateClose(modal, mobile ? { y: 60 } : { y: 12, scale: 0.98 });

  wireModal(modal);
  modal.__close = close;

  modal.innerHTML = `
    <form class="mform" method="dialog" novalidate>
      <header class="mform__head">
        <div>
          <h2 class="mform__title">${escapeHtml(config.title)}</h2>
          ${config.sub ? `<p class="mform__sub">${escapeHtml(config.sub)}</p>` : ''}
        </div>
        <button type="button" class="ibtn" aria-label="Close" title="Close" data-close>
          <svg class="ico" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </header>
      <div class="mform__grid">
        ${config.fields
          .map((f) => {
            const id = `f-${f.name}`;
            const val = f.value === undefined ? '' : escapeHtml(f.value);
            const attrs = `id="${id}" name="${f.name}" ${f.required ? 'required' : ''} ${f.placeholder ? `placeholder="${escapeHtml(f.placeholder)}"` : ''}`;
            const control =
              f.type === 'select'
                ? `<select ${attrs}>${(f.options ?? [])
                    .map(
                      ([v, l]) =>
                        `<option value="${escapeHtml(v)}"${String(f.value) === v ? ' selected' : ''}>${escapeHtml(l)}</option>`
                    )
                    .join('')}</select>`
                : f.type === 'textarea'
                  ? `<textarea ${attrs} rows="4">${val}</textarea>`
                  : `<input ${attrs} type="${f.type ?? 'text'}" value="${val}" ${f.min === undefined ? '' : `min="${f.min}"`} ${f.max === undefined ? '' : `max="${f.max}"`} ${f.step === undefined ? '' : `step="${f.step}"`} autocomplete="off" />`;
            return `<label class="field${f.wide ? ' field--wide' : ''}" for="${id}">
              <span class="field__label">${escapeHtml(f.label)}</span>
              ${control}
              ${f.hint ? `<span class="field__hint">${escapeHtml(f.hint)}</span>` : ''}
            </label>`;
          })
          .join('')}
        ${config.extra ?? ''}
      </div>
      <p class="mform__err" role="alert"></p>
      <footer class="mform__foot">
        <button type="button" class="btn btn--ghost" data-close>Cancel</button>
        <button type="submit" class="btn ${config.danger ? 'btn--danger' : 'btn--primary'}">${escapeHtml(config.submit)}</button>
      </footer>
    </form>
  `;

  const form = domQuery<HTMLFormElement>('form', modal);
  domQueryAll('[data-close]', modal).forEach((btn) => btn.addEventListener('click', close));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const missing = domQueryAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('[required]', form).find(
      (el) => !el.value.trim()
    );
    const errEl = queryOne<HTMLElement>('.mform__err', form);

    if (missing) {
      const fieldLabel =
        missing.closest('.field')?.querySelector('.field__label')?.textContent ?? 'This field';
      if (errEl) {
        errEl.textContent = `${fieldLabel} is required.`;
        shakeElement(errEl);
      }
      missing.focus();
      return;
    }

    const values = Object.fromEntries(
      [...new FormData(form).entries()].map(([k, v]) => [k, String(v).trim()])
    );

    const error = config.onSubmit(values);
    if (error) {
      if (errEl) {
        errEl.textContent = error;
        shakeElement(errEl);
      }
      return;
    }
    close();
  });

  config.onMount?.(form);
  modal.showModal();

  let fromVars: gsap.TweenVars = mobile ? { opacity: 0, y: 80 } : { opacity: 0, y: 18, scale: 0.97 };
  if (!mobile && config.from && config.from.isConnected) {
    const fromRect = config.from.getBoundingClientRect();
    const modalRect = modal.getBoundingClientRect();
    fromVars = {
      opacity: 0,
      scale: 0.6,
      x: fromRect.left + fromRect.width / 2 - (modalRect.left + modalRect.width / 2),
      y: fromRect.top + fromRect.height / 2 - (modalRect.top + modalRect.height / 2),
    };
  }

  gsap.fromTo(modal, fromVars, {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    duration: motionDuration(0.5),
    ease: 'back.out(1.4)',
    clearProps: 'transform',
  });

  if (matchMedia('(pointer: fine)').matches) {
    requestAnimationFrame(() => {
      queryOne<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input, select, textarea', form)?.focus();
    });
  }
}
