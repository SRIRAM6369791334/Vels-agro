import { escapeHtml } from '../../../utils/dom';
import { motionDuration, gsap } from '../../../core/motion';
import type { ChartInstance, DonutRingOptions, DonutRingPart } from './types';

/**
 * Donut Ring Meter (historically aliased as createRingMeter)
 * Renders circular SVG progress ring arcs with center label and subtitle.
 */
export function renderDonutRingMeter(container: HTMLElement, options: DonutRingOptions): ChartInstance {
  container.classList.add('donut');
  const circumference = 2 * Math.PI * 52;
  let currentParts = options.parts;

  const renderSvg = () => {
    const total = currentParts.reduce((acc, part) => acc + part.value, 0) || 1;
    let accumulatedOffset = 0;

    container.innerHTML = `<svg viewBox="0 0 140 140" role="img" aria-label="${escapeHtml(options.label)}">
      <circle class="donut__track" cx="70" cy="70" r="52"/>
      ${currentParts
        .map((part) => {
          const arcLength = (part.value / total) * circumference;
          const gap = currentParts.length > 1 ? 3 : 0;
          const visibleLength = Math.max(0, arcLength - gap);
          const arcSvg = `<circle class="donut__arc tone-stroke--${part.tone}" cx="70" cy="70" r="52" stroke-dasharray="${visibleLength} ${circumference}" stroke-dashoffset="${-accumulatedOffset}" data-len="${visibleLength}"/>`;
          accumulatedOffset += arcLength;
          return arcSvg;
        })
        .join('')}
    </svg>
    <div class="donut__mid">
      <b>${escapeHtml(options.center)}</b>
      <span>${escapeHtml(options.sub)}</span>
    </div>`;
  };

  renderSvg();

  const playAnimation = (delay = 0) => {
    container.querySelectorAll<SVGCircleElement>('.donut__arc').forEach((arcEl, idx) => {
      const targetLen = Number(arcEl.dataset.len);
      gsap.fromTo(
        arcEl,
        {
          attr: {
            'stroke-dasharray': `0 ${circumference}`,
          },
        },
        {
          attr: {
            'stroke-dasharray': `${targetLen} ${circumference}`,
          },
          duration: motionDuration(1),
          delay: motionDuration(delay + idx * 0.12),
          ease: 'power3.inOut',
        }
      );
    });
  };

  return {
    play: playAnimation,
    update(newParts: DonutRingPart[], newCenter?: string) {
      currentParts = newParts;
      if (newCenter) {
        options.center = newCenter;
      }
      renderSvg();
      playAnimation();
    },
  };
}
