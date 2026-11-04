import { escapeHtml } from '../../../utils/dom';
import { motionDuration, animateCounter, gsap } from '../../../core/motion';
import { calculatePolarPoint } from './math';
import type { ChartInstance, RadialGaugeOptions } from './types';

/**
 * 240-Degree Radial Gauge Meter (historically aliased as createHorizontalBarChart)
 * Renders circular dial gauge with rotating needle, status zones, and live counter.
 */
export function renderRadialGaugeMeter(container: HTMLElement, options: RadialGaugeOptions): ChartInstance {
  container.classList.add('gauge');
  const minAngle = -120;
  const maxAngle = 120;

  const [startPointX, startPointY] = calculatePolarPoint(minAngle);
  const [endPointX, endPointY] = calculatePolarPoint(maxAngle);
  const trackPathD = `M${startPointX.toFixed(2)},${startPointY.toFixed(2)} A78,78 0 1 1 ${endPointX.toFixed(2)},${endPointY.toFixed(2)}`;

  const tickCount = options.ticks ?? 10;
  const ticksMarkup = Array.from({ length: tickCount + 1 }, (_, idx) => {
    const angle = minAngle + ((maxAngle - minAngle) * idx) / tickCount;
    const [innerX, innerY] = calculatePolarPoint(angle, 63);
    const tickLen = idx % 5 === 0 ? 24 : 20;
    const [outerX, outerY] = calculatePolarPoint(angle, 78 - tickLen);
    return `<line x1="${innerX.toFixed(1)}" y1="${innerY.toFixed(1)}" x2="${outerX.toFixed(1)}" y2="${outerY.toFixed(1)}"${idx % 5 === 0 ? ' class="is-major"' : ''}/>`;
  }).join('');

  container.innerHTML = `<svg viewBox="0 0 200 168" role="img" aria-label="${escapeHtml(options.label)}">
    <path class="gauge__track" d="${trackPathD}" pathLength="100"/>
    <path class="gauge__arc" d="${trackPathD}" pathLength="100" stroke-dasharray="0 100"/>
    <g class="gauge__ticks">${ticksMarkup}</g>
    <g class="gauge__needle">
      <path d="M96.8,100 L100,44 L103.2,100 Z"/>
      <circle cx="100" cy="100" r="8"/>
      <circle class="gauge__hub" cx="100" cy="100" r="3"/>
    </g>
  </svg>
  <div class="gauge__mid">
    <b class="num">${escapeHtml(options.format(0))}</b>
    <span>${escapeHtml(options.sub)}</span>
  </div>`;

  const arcEl = container.querySelector<SVGPathElement>('.gauge__arc')!;
  const needleEl = container.querySelector<SVGGElement>('.gauge__needle')!;
  const numberEl = container.querySelector<HTMLElement>('.gauge__mid b')!;
  const subEl = container.querySelector<HTMLElement>('.gauge__mid span')!;

  let currentValue = Math.max(0, Math.min(1, options.value));

  const resolveZoneTone = (val: number): string => {
    if (options.zones) {
      if (val < options.zones.bad) return 'rose';
      if (val < options.zones.warn) return 'ochre';
      return 'sage';
    }
    return options.tone ?? 'pine';
  };

  const applyTone = (val: number) => {
    const tone = resolveZoneTone(val);
    arcEl.setAttribute('class', `gauge__arc tone-stroke--${tone}`);
    container.dataset.tone = tone;
  };

  gsap.set(needleEl, {
    rotation: minAngle,
    svgOrigin: '100 100',
  });
  applyTone(currentValue);

  const animateTo = (fromVal: number, targetVal: number, delay = 0) => {
    const progress = { p: fromVal };
    gsap.to(progress, {
      p: targetVal,
      duration: motionDuration(1.1),
      delay: motionDuration(delay),
      ease: 'power3.inOut',
      onUpdate: () => arcEl.setAttribute('stroke-dasharray', `${(progress.p * 100).toFixed(2)} 100`),
    });

    gsap.to(needleEl, {
      rotation: minAngle + (maxAngle - minAngle) * targetVal,
      svgOrigin: '100 100',
      duration: motionDuration(1.6),
      delay: motionDuration(delay),
      ease: 'elastic.out(1, 0.55)',
      overwrite: true,
    });

    animateCounter(numberEl, targetVal, options.format, {
      duration: 1.1,
      delay: motionDuration(delay),
      from: fromVal,
    });
  };

  return {
    play(delay = 0) {
      arcEl.setAttribute('stroke-dasharray', '0 100');
      gsap.set(needleEl, {
        rotation: minAngle,
        svgOrigin: '100 100',
      });
      animateTo(0, currentValue, delay);
    },
    update(newVal: number, newSub?: string) {
      const prevVal = currentValue;
      currentValue = Math.max(0, Math.min(1, newVal));
      applyTone(currentValue);
      if (newSub !== undefined) {
        subEl.textContent = newSub;
      }
      animateTo(prevVal, currentValue);
    },
    set(val: number, newSub?: string) {
      currentValue = Math.max(0, Math.min(1, val));
      applyTone(currentValue);
      if (newSub !== undefined) {
        subEl.textContent = newSub;
      }
      arcEl.setAttribute('stroke-dasharray', `${(currentValue * 100).toFixed(2)} 100`);
      gsap.set(needleEl, {
        rotation: minAngle + (maxAngle - minAngle) * currentValue,
        svgOrigin: '100 100',
      });
      animateCounter(numberEl, currentValue, options.format, {
        duration: 0,
      });
    },
  };
}
