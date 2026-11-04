import { gsap, Flip, motionDuration, playHaptic } from '../../../core/motion';
import { queryOne } from '../../../utils/dom';

let activeExpandedCard: HTMLElement | null = null;

export function collapseExpandedCard(): void {
  const card = activeExpandedCard;
  if (!card) return;
  activeExpandedCard = null;
  const placeholder = card.previousElementSibling as HTMLElement | null;
  const children = Array.from(card.children) as HTMLElement[];
  const scrim = queryOne('.scrim');

  if (scrim) {
    gsap.to(scrim, { autoAlpha: 0, duration: motionDuration(0.3) });
  }

  gsap.to(children, {
    opacity: 0,
    duration: motionDuration(0.14),
    onComplete: () => {
      const state = Flip.getState(card);
      card.classList.remove('is-focus');
      document.documentElement.classList.remove('has-focus');
      if (placeholder?.classList.contains('card-ph')) {
        placeholder.remove();
      }
      card.querySelector('[data-expand]')?.setAttribute('aria-label', 'Expand');
      card.dispatchEvent(new CustomEvent('card:resize'));
      Flip.from(state, {
        duration: motionDuration(0.5),
        ease: 'power3.inOut',
        scale: true,
        onComplete: () => gsap.set(card, { clearProps: 'transform' }),
      });
      gsap.to(children, {
        opacity: 1,
        duration: motionDuration(0.3),
        delay: motionDuration(0.3),
        clearProps: 'opacity',
      });
    },
  });
}

export function expandCard(card: HTMLElement, trigger?: HTMLElement): void {
  if (card.classList.contains('is-focus')) {
    collapseExpandedCard();
    return;
  }
  if (activeExpandedCard) {
    collapseExpandedCard();
  }
  const children = Array.from(card.children) as HTMLElement[];
  const placeholder = Object.assign(document.createElement('div'), { className: 'card-ph' });
  const computed = getComputedStyle(card);
  Object.assign(placeholder.style, {
    gridArea: computed.gridArea,
    gridColumn: computed.gridColumn,
    gridRow: computed.gridRow,
    height: `${card.offsetHeight}px`,
  });
  card.before(placeholder);

  const state = Flip.getState(card);
  card.classList.add('is-focus');
  document.documentElement.classList.add('has-focus');
  activeExpandedCard = card;
  trigger?.setAttribute('aria-label', 'Collapse');

  gsap.set(children, { opacity: 0 });
  const scrim = queryOne('.scrim');
  if (scrim) {
    gsap.to(scrim, { autoAlpha: 1, duration: motionDuration(0.35) });
  }

  Flip.from(state, {
    duration: motionDuration(0.6),
    ease: 'power3.inOut',
    scale: true,
    onComplete: () => card.dispatchEvent(new CustomEvent('card:resize')),
  });

  gsap.to(children, {
    opacity: 1,
    duration: motionDuration(0.35),
    delay: motionDuration(0.4),
    stagger: motionDuration(0.04),
    clearProps: 'opacity',
  });

  card.dispatchEvent(new CustomEvent('card:resize'));
  (trigger ?? card).focus?.();
}

export function bindCardExpand(container: HTMLElement): void {
  container.addEventListener('click', (e) => {
    const trigger = (e.target as HTMLElement).closest<HTMLElement>('[data-expand]');
    if (!trigger || !container.contains(trigger)) return;
    playHaptic(trigger);
    const card = trigger.closest<HTMLElement>('.card');
    if (card) {
      expandCard(card, trigger);
    }
  });
}
