import { $, escapeHtml } from '../utils';

export interface ModalOptions {
  title?: string;
  sub?: string;
  onMount?: (dialog: HTMLDialogElement) => void;
  onClose?: () => void;
}

export function openModal(contentHtml: string, options: ModalOptions = {}): HTMLDialogElement {
  const modal = $<HTMLDialogElement>('#modal');
  modal.innerHTML = `
    <div class="modal__card">
      ${options.title ? `<header class="modal__head"><h2 class="modal__title">${escapeHtml(options.title)}</h2>${options.sub ? `<p class="modal__sub">${escapeHtml(options.sub)}</p>` : ''}<button type="button" class="ibtn modal__close" data-close aria-label="Close modal"><svg class="ico" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button></header>` : ''}
      <div class="modal__body">${contentHtml}</div>
    </div>
  `;

  modal.showModal();
  options.onMount?.(modal);

  const closeBtn = modal.querySelector<HTMLButtonElement>('[data-close]');
  if (closeBtn) {
    closeBtn.onclick = () => closeModal();
  }

  modal.onclose = () => {
    options.onClose?.();
  };

  return modal;
}

export function closeModal(): void {
  const modal = $<HTMLDialogElement>('#modal');
  if (modal.open) {
    modal.close();
  }
}

export function confirmDialog(msg: string, title = 'Confirm', confirmText = 'Confirm', isDanger = false): Promise<boolean> {
  return new Promise((resolve) => {
    const html = `
      <p style="margin-bottom: var(--gap);">${escapeHtml(msg)}</p>
      <div style="display:flex; justify-content:flex-end; gap:8px;">
        <button type="button" class="btn btn--ghost btn--sm" data-action="cancel">Cancel</button>
        <button type="button" class="btn btn--sm ${isDanger ? 'btn--bad' : 'btn--primary'}" data-action="confirm">${escapeHtml(confirmText)}</button>
      </div>
    `;

    const modal = openModal(html, {
      title,
      onMount: (m) => {
        m.querySelector('[data-action="cancel"]')?.addEventListener('click', () => {
          modal.close();
          resolve(false);
        });
        m.querySelector('[data-action="confirm"]')?.addEventListener('click', () => {
          modal.close();
          resolve(true);
        });
      },
      onClose: () => resolve(false),
    });
  });
}
