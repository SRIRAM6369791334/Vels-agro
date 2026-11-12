import { escapeHtml } from '../../../utils/dom';
import { prefersReducedMotion, gsap } from '../../../core/motion';

export interface FormFieldOptions {
  name: string;
  label: string;
  value?: string;
  type?: string;
  ac?: string;
  ph?: string;
  k?: string;
  wide?: boolean;
  readonly?: boolean;
  disabled?: boolean;
  hint?: string;
}

export const SAVED_BADGE_HTML = `<span class="st-saved" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 13 4 4L19 7"/></svg>Saved</span>`;

export function renderFormField(options: FormFieldOptions): string {
  const wideClass = options.wide ? ' st-field--wide' : '';
  const autocomplete = options.ac ? `autocomplete="${options.ac}"` : 'autocomplete="off"';
  const placeholder = options.ph ? `placeholder="${escapeHtml(options.ph)}"` : '';
  const dataKey = options.k ? `data-k="${options.k}"` : '';
  const inputType = options.type ?? 'text';
  const val = options.value ?? '';
  const isReadonly = options.readonly ? ' readonly aria-readonly="true" tabindex="-1"' : '';
  const isDisabled = options.disabled ? ' disabled' : '';
  const readonlyClass = (options.readonly || options.disabled) ? ' st-in--readonly' : '';
  const hintHtml = options.hint ? `<span class="st-field__hint">${escapeHtml(options.hint)}</span>` : '';

  return `<label class="st-field${wideClass}"><span class="field__label">${escapeHtml(options.label)}</span><input class="st-in${readonlyClass}" name="${options.name}" type="${inputType}" value="${escapeHtml(val)}" ${autocomplete} ${placeholder} ${dataKey}${isReadonly}${isDisabled} />${hintHtml}<span class="st-field__err" role="alert"></span></label>`;
}

export function renderSelectField(
  name: string,
  label: string,
  current: string,
  options: [string, string][],
  wide = false
): string {
  const wideClass = wide ? ' st-field--wide' : '';
  const optionsHtml = options
    .map(([val, text]) => `<option value="${escapeHtml(val)}"${val === current ? ' selected' : ''}>${escapeHtml(text)}</option>`)
    .join('');

  return `<label class="st-field${wideClass}"><span class="field__label">${escapeHtml(label)}</span><select class="st-in" name="${name}">${optionsHtml}</select><span class="st-field__err" role="alert"></span></label>`;
}

export function showFieldError(input: HTMLElement, errorText: string): void {
  const errEl = input.closest('.st-field')?.querySelector<HTMLElement>('.st-field__err');
  input.setAttribute('aria-invalid', String(!!errorText));
  if (errEl) {
    errEl.textContent = errorText;
    if (errorText && !prefersReducedMotion.matches) {
      gsap.fromTo(
        errEl,
        { x: -6 },
        { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)', clearProps: 'transform' }
      );
    }
  }
}

export function triggerSavedBadge(container: HTMLElement | null): void {
  const badge = container?.querySelector<HTMLElement>('.st-saved');
  if (badge) {
    gsap.killTweensOf(badge);
    if (prefersReducedMotion.matches) {
      gsap.set(badge, { opacity: 1 });
      gsap.to(badge, { opacity: 0, delay: 1.4, duration: 0 });
      return;
    }
    gsap
      .timeline()
      .fromTo(
        badge,
        { opacity: 0, x: -6, scale: 0.8 },
        { opacity: 1, x: 0, scale: 1, duration: 0.35, ease: 'back.out(2.2)' }
      )
      .to(
        badge,
        { opacity: 0, duration: 0.4, ease: 'power2.in', clearProps: 'transform' },
        '+=1.3'
      );
  }
}
