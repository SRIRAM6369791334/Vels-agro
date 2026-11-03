import { $ } from '../utils';

export interface DrawerOptions {
  label?: string;
  onMount?: (drawer: HTMLDialogElement) => void;
  onClose?: () => void;
  wide?: boolean;
}

export function openDrawer(contentHtml: string, options: DrawerOptions = {}): HTMLDialogElement {
  const drawer = $<HTMLDialogElement>('#drawer');
  drawer.className = `drawer ${options.wide ? 'drawer--wide' : ''}`;
  drawer.innerHTML = `
    <div class="drawer__panel">
      <header class="drawer__head">
        <h2 class="drawer__title">${options.label || 'Details'}</h2>
        <button type="button" class="ibtn drawer__close" data-close aria-label="Close drawer">
          <svg class="ico" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>
        </button>
      </header>
      <div class="drawer__body">${contentHtml}</div>
    </div>
  `;

  drawer.showModal();
  options.onMount?.(drawer);

  const closeBtn = drawer.querySelector<HTMLButtonElement>('[data-close]');
  if (closeBtn) {
    closeBtn.onclick = () => closeDrawer();
  }

  drawer.onclose = () => {
    options.onClose?.();
  };

  return drawer;
}

export function closeDrawer(): void {
  const drawer = $<HTMLDialogElement>('#drawer');
  if (drawer.open) {
    drawer.close();
  }
}
