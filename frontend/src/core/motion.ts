import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';

gsap.registerPlugin(Flip);

export const prefersReducedMotion =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : { matches: false };

export function motionDuration(duration: number): number {
  return prefersReducedMotion.matches ? 0 : duration;
}

const counterMap = new WeakMap<Element, { v: number }>();

export function animateCounter(
  element: HTMLElement | null,
  target: number,
  formatter: (val: number) => string = (v) => String(Math.round(v)),
  options: { duration?: number; delay?: number; from?: number } = {}
): void {
  if (!element) return;
  const { duration = 1.2, delay = 0, from } = options;
  let state = counterMap.get(element);
  if (!state) {
    state = { v: from ?? 0 };
    counterMap.set(element, state);
  }
  if (from !== undefined) {
    state.v = from;
  }
  gsap.killTweensOf(state);

  if (prefersReducedMotion.matches || !duration || state.v === target) {
    state.v = target;
    element.textContent = formatter(target);
    return;
  }

  element.textContent = formatter(state.v);
  gsap.to(state, {
    v: target,
    duration: motionDuration(duration),
    delay: motionDuration(delay),
    ease: 'power3.out',
    onUpdate: () => {
      element.textContent = formatter(state!.v);
    },
    onComplete: () => {
      element.textContent = formatter(target);
    },
  });
}

export function playHaptic(element: HTMLElement | null): void {
  if (!element || prefersReducedMotion.matches) return;
  const target = element.querySelector('svg') ?? element;
  gsap.fromTo(
    target,
    { scale: 0.72 },
    { scale: 1, duration: 0.55, ease: 'back.out(3)', overwrite: true }
  );
}

export const animatePulse = playHaptic;

export function flashElement(element: HTMLElement | null): void {
  if (!element) return;
  element.classList.remove('is-flash');
  void element.offsetWidth;
  element.classList.add('is-flash');
  if (!prefersReducedMotion.matches) {
    gsap.fromTo(
      element,
      { y: -4, scale: 1.06 },
      {
        y: 0,
        scale: 1,
        duration: 0.55,
        ease: 'back.out(2.4)',
        overwrite: 'auto',
        clearProps: 'transform',
      }
    );
  }
}

export function morphReplace(container: HTMLElement, updateDom: () => void): void {
  if (prefersReducedMotion.matches) {
    updateDom();
    return;
  }
  const state = Flip.getState(container.children);
  updateDom();
  Flip.from(state, {
    duration: motionDuration(0.35),
    ease: 'power2.inOut',
    absolute: true,
  });
}

export function animateTitle(element: Element | null, delay = 0): gsap.core.Tween | null {
  if (!element || prefersReducedMotion.matches) return null;
  return gsap.fromTo(
    element,
    { opacity: 0, y: 16 },
    { opacity: 1, y: 0, duration: motionDuration(0.6), delay: motionDuration(delay), ease: 'power3.out' }
  );
}

export function animateCards(
  elements: Element[],
  options: { y?: number; stagger?: number; delay?: number } = {}
): gsap.core.Tween | null {
  if (!elements.length || prefersReducedMotion.matches) return null;
  const { y = 34, stagger = 0.07, delay = 0 } = options;
  return gsap.fromTo(
    elements,
    { opacity: 0, y, scale: 0.985 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: motionDuration(0.9),
      ease: 'power3.out',
      stagger: motionDuration(stagger),
      delay: motionDuration(delay),
      clearProps: 'transform,opacity',
    }
  );
}

export function animateRows(
  elements: Element[],
  options: { y?: number; stagger?: number; delay?: number } = {}
): gsap.core.Tween | null {
  if (!elements.length || prefersReducedMotion.matches) return null;
  const { y = 12, stagger = 0.045, delay = 0 } = options;
  return gsap.fromTo(
    elements,
    { opacity: 0, y },
    {
      opacity: 1,
      y: 0,
      duration: motionDuration(0.55),
      ease: 'power3.out',
      stagger: motionDuration(stagger),
      delay: motionDuration(delay),
      clearProps: 'transform,opacity',
    }
  );
}

export function animatePop(
  element: Element | null,
  options: { from?: number; delay?: number; stagger?: number } = {}
): gsap.core.Tween | null {
  if (!element || prefersReducedMotion.matches) return null;
  const { from = 0.6, delay = 0, stagger = 0.05 } = options;
  return gsap.fromTo(
    element,
    { scale: from, opacity: 0 },
    {
      scale: 1,
      opacity: 1,
      duration: 0.6,
      ease: 'back.out(3)',
      delay: motionDuration(delay),
      stagger,
      clearProps: 'transform,opacity',
    }
  );
}

export function bindMagnetic(root: Document | HTMLElement = document): void {
  const hasFinePointer = typeof window !== 'undefined' ? window.matchMedia('(pointer: fine)').matches : false;
  if (!hasFinePointer) return;
  const elements = root.querySelectorAll<HTMLElement>('.magnetic');
  elements.forEach((el) => {
    if ((el as any).__mag) return;
    (el as any).__mag = true;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
    el.addEventListener('pointermove', (e) => {
      if (prefersReducedMotion.matches) return;
      const rect = el.getBoundingClientRect();
      xTo((e.clientX - rect.left - rect.width / 2) * 0.24);
      yTo((e.clientY - rect.top - rect.height / 2) * 0.3);
    });
    el.addEventListener('pointerleave', () => {
      xTo(0);
      yTo(0);
    });
  });
}

export function initLiftAnimations(root: Document | HTMLElement = document, yOffset = -4): void {
  const hasFinePointer = typeof window !== 'undefined' ? window.matchMedia('(pointer: fine)').matches : false;
  if (!hasFinePointer) return;
  const elements = root.querySelectorAll<HTMLElement>('[data-lift]');
  elements.forEach((el) => {
    if ((el as any).__lift) return;
    (el as any).__lift = true;
    el.addEventListener('pointerenter', () => {
      if (prefersReducedMotion.matches) return;
      gsap.to(el, { y: yOffset, duration: 0.25, ease: 'power2.out' });
    });
    el.addEventListener('pointerleave', () => {
      gsap.to(el, { y: 0, duration: 0.3, ease: 'power2.out' });
    });
  });
}

export function animateFloatBadge(element: HTMLElement | null, text: string): void {
  if (!element || prefersReducedMotion.matches) return;
  const rect = element.getBoundingClientRect();
  const badge = Object.assign(document.createElement('span'), {
    className: 'float-up',
    textContent: text,
  });
  badge.setAttribute('aria-hidden', 'true');
  Object.assign(badge.style, {
    left: `${rect.left + rect.width / 2}px`,
    top: `${rect.top}px`,
  });
  document.body.append(badge);
  gsap.fromTo(
    badge,
    { opacity: 0, y: 6, xPercent: -50, scale: 0.9 },
    {
      keyframes: [
        { opacity: 1, y: -12, scale: 1, duration: 0.35, ease: 'back.out(2)' },
        { opacity: 0, y: -40, duration: 0.8, ease: 'power2.in', delay: 0.6 },
      ],
      onComplete: () => badge.remove(),
    }
  );
}

export const animateFloatIndicator = animateFloatBadge;

export { gsap, Flip };

