/**
 * Type-safe DOM query selectors and helpers
 */

export function domQuery<T extends Element = HTMLElement>(selector: string, scope: ParentNode = document): T {
  const el = scope.querySelector<T>(selector);
  if (!el) throw new Error(`Missing required element: ${selector}`);
  return el;
}

export function queryOne<T extends Element = HTMLElement>(selector: string, scope: ParentNode = document): T | null {
  return scope.querySelector<T>(selector);
}

export function domQueryAll<T extends Element = HTMLElement>(selector: string, scope: ParentNode = document): T[] {
  return Array.from(scope.querySelectorAll<T>(selector));
}

// Shortcuts
export const $ = domQuery;
export const $$ = domQueryAll;
export const qs = queryOne;

export function escapeHtml(str: string | number | null | undefined): string {
  if (str == null) return '';
  return String(str).replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] || char
  );
}

export function createCustomElement<T extends HTMLElement = HTMLElement>(
  html: string,
  parent?: HTMLElement,
  options: { prepend?: boolean } = {}
): T {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html.trim();
  const el = wrapper.firstElementChild as T;
  if (parent) {
    if (options.prepend && parent.firstChild) {
      parent.insertBefore(el, parent.firstChild);
    } else {
      parent.appendChild(el);
    }
  }
  return el;
}
