import { escapeHtml } from '../../../utils/dom';
import { motionDuration, animateCounter, gsap } from '../../../core/motion';
import type { ChartInstance, FanMeterOptions } from './types';

/**
 * 180-Degree Fan Lines Meter (historically aliased as createFanMeter)
 * Renders radiant rays with gradient fill and progressive light-up animations.
 */
export function renderFanMeter(container: HTMLElement, options: FanMeterOptions): ChartInstance {
  container.classList.add('fan');
  const rayCount = options.count ?? 84;
  const formatVal = options.format ?? ((val: number) => `${(val * 100).toFixed(1)}%`);

  const getRayAngle = (idx: number) => Math.PI - (idx / (rayCount - 1)) * Math.PI;

  const renderRayLine = (idx: number, cssClass: string) => {
    const angle = getRayAngle(idx);
    const cosVal = Math.cos(angle);
    const sinVal = Math.sin(angle);
    const x1 = (160 + 96 * cosVal).toFixed(1);
    const y1 = (156 - 96 * sinVal).toFixed(1);
    const x2 = (160 + 150 * cosVal).toFixed(1);
    const y2 = (156 - 150 * sinVal).toFixed(1);
    return `<line class="${cssClass}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
  };

  const gradientId = `fan-g${Math.random().toString(36).slice(2, 7)}`;

  container.innerHTML = `<svg viewBox="0 0 320 164" role="img" aria-label="${escapeHtml(options.label)}">
    <defs>
      <linearGradient id="${gradientId}" gradientUnits="userSpaceOnUse" x1="10" y1="0" x2="310" y2="0">
        <stop offset="0" class="fan__s0"/>
        <stop offset="1" class="fan__s1"/>
      </linearGradient>
    </defs>
    <g class="fan__base">${Array.from({ length: rayCount }, (_, i) => renderRayLine(i, '')).join('')}</g>
    <g class="fan__lit" style="stroke:url(#${gradientId})">${Array.from({ length: rayCount }, (_, i) => renderRayLine(i, 'fan__l')).join('')}</g>
    <path class="fan__ring" d="M78,156 A82,82 0 0 1 242,156"/>
  </svg>
  <div class="fan__mid">
    <b class="num">${escapeHtml(formatVal(0))}</b>
    <span>${escapeHtml(options.sub)}</span>
  </div>`;

  const litRays = [...container.querySelectorAll<SVGLineElement>('.fan__l')];
  const numberEl = container.querySelector<HTMLElement>('.fan__mid b')!;
  const subEl = container.querySelector<HTMLElement>('.fan__mid span')!;

  let currentValue = Math.max(0, Math.min(1, options.value));
  gsap.set(litRays, { opacity: 0 });

  const getLitIndex = (fraction: number) => Math.round(fraction * rayCount);

  function animateFan(fromFraction: number, toFraction: number, delay = 0) {
    const fromIdx = getLitIndex(fromFraction);
    const toIdx = getLitIndex(toFraction);

    if (toIdx > fromIdx) {
      gsap.fromTo(
        litRays.slice(fromIdx, toIdx),
        {
          opacity: 0,
          scale: 0.6,
          svgOrigin: '160 156',
        },
        {
          opacity: 1,
          scale: 1,
          duration: motionDuration(0.45),
          ease: 'back.out(2)',
          stagger: motionDuration(Math.min(0.022, 1.2 / Math.max(1, toIdx - fromIdx))),
          delay: motionDuration(delay),
          overwrite: true,
        }
      );
    } else if (toIdx < fromIdx) {
      gsap.to(litRays.slice(toIdx, fromIdx).reverse(), {
        opacity: 0,
        duration: motionDuration(0.25),
        stagger: motionDuration(0.012),
        delay: motionDuration(delay),
        overwrite: true,
      });
    }

    animateCounter(numberEl, toFraction, formatVal, {
      from: fromFraction,
      duration: 1.3,
      delay: motionDuration(delay),
    });
  }

  return {
    play(delay = 0) {
      gsap.set(litRays, { opacity: 0 });
      animateFan(0, currentValue, delay);
    },
    update(newVal: number, newSub?: string) {
      const prevVal = currentValue;
      currentValue = Math.max(0, Math.min(1, newVal));
      if (newSub !== undefined) {
        subEl.textContent = newSub;
      }
      animateFan(prevVal, currentValue);
    },
  };
}
