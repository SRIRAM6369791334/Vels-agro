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

export function animateTitle(element: Element | null, delay = 0): gsap.core.Tween | null {
  if (!element || prefersReducedMotion.matches) return null;
  return gsap.fromTo(
    element,
    { opacity: 0, y: 16 },
    { opacity: 1, y: 0, duration: motionDuration(0.6), delay: motionDuration(delay), ease: 'power3.out' }
  );
}

export function animateCards(elements: Element[], options: { y?: number; stagger?: number; delay?: number } = {}): gsap.core.Tween | null {
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

export function animateRows(elements: Element[], options: { y?: number; stagger?: number; delay?: number } = {}): gsap.core.Tween | null {
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

export function animatePop(element: Element | null, options: { from?: number; delay?: number; stagger?: number } = {}): gsap.core.Tween | null {
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

export { gsap, Flip };
