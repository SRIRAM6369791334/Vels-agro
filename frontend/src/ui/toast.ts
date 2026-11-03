import { $, escapeHtml } from '../utils';
import { gsap, motionDuration } from '../core/motion';

let toastTimer: number | undefined;

export interface ToastOptions {
  undo?: () => void;
  ico?: string;
  duration?: number;
}

export function showToast(msg: string, options: ToastOptions = {}): void {
  const toastEl = $<HTMLElement>('.toast');
  const msgEl = $<HTMLElement>('.toast__msg', toastEl);
  const undoBtn = $<HTMLButtonElement>('.toast__undo', toastEl);

  msgEl.innerHTML = escapeHtml(msg);

  if (options.undo) {
    undoBtn.hidden = false;
    undoBtn.onclick = () => {
      options.undo?.();
      hideToast();
    };
  } else {
    undoBtn.hidden = true;
  }

  toastEl.classList.add('is-active');
  gsap.fromTo(
    toastEl,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: motionDuration(0.3), ease: 'power2.out' }
  );

  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(hideToast, options.duration || 4000);
}

export function hideToast(): void {
  const toastEl = $<HTMLElement>('.toast');
  gsap.to(toastEl, {
    opacity: 0,
    y: 20,
    duration: motionDuration(0.2),
    ease: 'power2.in',
    onComplete: () => {
      toastEl.classList.remove('is-active');
    },
  });
}
