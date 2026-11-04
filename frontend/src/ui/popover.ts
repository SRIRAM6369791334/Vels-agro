import { gsap, motionDuration } from '../core/motion';
import { MenuItem } from '../types/common';
import { domQuery, queryOne, escapeHtml } from '../utils/dom';
import { renderIcon } from '../utils/icons';

export interface PopoverOptions {
  cls?: string;
  align?: 'start' | 'center' | 'end';
  label?: string;
  onClose?: () => void;
}

export interface PopoverInstance {
  el: HTMLElement;
  anchor: HTMLElement;
  close: (immediate?: boolean) => void;
  place: () => void;
}

let activePopover: PopoverInstance | null = null;

export function getActivePopover(): PopoverInstance | null {
  return activePopover;
}

export function closeCurrentPopover(immediate = false): void {
  if (activePopover) {
    activePopover.close(immediate);
  }
}

export function openPopover(
  anchor: HTMLElement,
  content: string | HTMLElement,
  options: PopoverOptions = {}
): PopoverInstance | null {
  const { cls = '', align = 'end', label = '', onClose } = options;

  // If clicked on the same anchor, toggle close and return null
  if (activePopover && activePopover.anchor === anchor) {
    closeCurrentPopover(true);
    return null;
  }

  // Ensure any previous popover is closed and removed from DOM immediately
  if (activePopover) {
    closeCurrentPopover(true);
  }
  const popLayer = queryOne('.pop-layer');
  if (popLayer) {
    popLayer.querySelectorAll('.pop').forEach((p) => {
      gsap.killTweensOf(p);
      p.remove();
    });
  }

  const el = document.createElement('div');
  el.className = `pop ${cls}`.trim();
  if (label) {
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', label);
  }

  if (typeof content === 'string') {
    el.innerHTML = content;
  } else {
    el.appendChild(content);
  }

  (popLayer || document.body).appendChild(el);
  anchor.setAttribute('aria-expanded', 'true');

  const place = () => {
    const anchorRect = anchor.getBoundingClientRect();
    const width = el.offsetWidth;
    const height = el.offsetHeight;
    const winW = window.innerWidth;
    const winH = window.innerHeight;

    let left =
      align === 'start'
        ? anchorRect.left
        : align === 'center'
        ? anchorRect.left + anchorRect.width / 2 - width / 2
        : anchorRect.right - width;

    left = Math.max(12, Math.min(winW - width - 12, left));
    const showBelow = anchorRect.bottom + 8 + height < winH - 12 || anchorRect.top < height + 8 + 12;
    const top = showBelow ? anchorRect.bottom + 8 : anchorRect.top - 8 - height;

    el.style.left = `${left}px`;
    el.style.top = `${Math.max(12, top)}px`;
    el.style.transformOrigin = `${anchorRect.left + anchorRect.width / 2 - left}px ${showBelow ? 0 : height}px`;
  };

  place();

  gsap.fromTo(
    el,
    { opacity: 0, scale: 0.94, y: -4 },
    { opacity: 1, scale: 1, y: 0, duration: motionDuration(0.32), ease: 'back.out(1.8)' }
  );

  const handlePointerDown = (e: MouseEvent | PointerEvent) => {
    const target = e.target as Node;
    if (el.contains(target) || anchor.contains(target)) return;
    if ((target as Element).closest?.('main, .main, .view')) {
      e.preventDefault();
      e.stopPropagation();
      const swallowClick = (ce: MouseEvent) => {
        ce.preventDefault();
        ce.stopPropagation();
        ce.stopImmediatePropagation();
      };
      document.addEventListener('click', swallowClick, { capture: true, once: true });
      setTimeout(() => document.removeEventListener('click', swallowClick, { capture: true }), 200);
    }
    close(true);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      close(true);
      anchor.focus();
    }
  };

  const handleReposition = () => {
    place();
  };

  // Add listeners after tick to prevent immediate trigger from current click
  setTimeout(() => {
    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);
  }, 0);

  function close(immediate = false) {
    if (activePopover?.el !== el) return;
    activePopover = null;
    anchor.setAttribute('aria-expanded', 'false');

    document.removeEventListener('pointerdown', handlePointerDown, true);
    document.removeEventListener('keydown', handleKeyDown, true);
    window.removeEventListener('resize', handleReposition);
    window.removeEventListener('scroll', handleReposition, true);

    if (immediate || motionDuration(0.16) === 0) {
      gsap.killTweensOf(el);
      el.remove();
      onClose?.();
    } else {
      gsap.to(el, {
        opacity: 0,
        scale: 0.96,
        duration: motionDuration(0.16),
        ease: 'power2.in',
        onComplete: () => {
          el.remove();
          onClose?.();
        },
      });
    }
  }

  const instance: PopoverInstance = { el, anchor, close, place };
  activePopover = instance;
  return instance;
}

export function openMenuPopover(
  anchor: HTMLElement,
  items: (MenuItem | '-')[],
  options: { align?: 'start' | 'center' | 'end' } = {}
): PopoverInstance | null {
  const container = document.createElement('div');
  container.setAttribute('role', 'menu');
  container.innerHTML = items
    .map((item, i) => {
      if (item === '-') return '<hr role="separator">';
      const isRadio = item.checked !== undefined;
      const role = isRadio ? 'menuitemradio' : 'menuitem';
      const checkedAttr = isRadio ? ` aria-checked="${item.checked}"` : '';
      const dangerCls = item.danger ? ' is-danger' : '';
      const iconHtml = item.icon ? renderIcon(item.icon) : '';
      const checkHtml = item.checked ? renderIcon('check', 'menu__check') : '';
      return `<button type="button" role="${role}"${checkedAttr} class="menu__item${dangerCls}" data-i="${i}">${iconHtml}<span>${escapeHtml(item.label)}</span>${checkHtml}</button>`;
    })
    .join('');

  container.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.menu__item');
    if (!btn) return;
    const index = Number(btn.dataset.i);
    const item = items[index];
    if (item && item !== '-' && item.onSelect) {
      closeCurrentPopover(true);
      item.onSelect();
    }
  });

  return openPopover(anchor, container, { cls: 'pop--menu', align: options.align ?? 'end' });
}

export function openDropdownMenu(anchor: HTMLElement, items: (MenuItem | '-')[], options?: { align?: 'start' | 'center' | 'end' }) {
  return openMenuPopover(anchor, items, options);
}

export function initTooltips(root: HTMLElement = document.body): void {
  // Tooltip binding helper
  const targets = root.querySelectorAll<HTMLElement>('[data-tip]');
  targets.forEach((target) => {
    if ((target as any).__tip) return;
    (target as any).__tip = true;
    target.addEventListener('pointerenter', () => {
      const tipText = target.getAttribute('data-tip');
      if (!tipText) return;
      target.setAttribute('title', tipText);
    });
  });
}
