import { escapeHtml } from '../../../utils/dom';
import { motionDuration, gsap } from '../../../core/motion';
import { calculateNiceScale } from './math';
import type { ChartInstance, ColumnBarChartOptions } from './types';

/**
 * Column Bar Chart (historically aliased as createDonutChart)
 * Renders vertical column bars with percentage heights and animated growth.
 */
export function renderColumnBarChart(container: HTMLElement, options: ColumnBarChartOptions): ChartInstance {
  container.classList.add('bars');
  container.setAttribute('role', 'list');
  container.setAttribute('aria-label', options.label);

  let currentValues = options.values;

  const renderBars = () => {
    const niceCeiling = calculateNiceScale(Math.max(1, ...currentValues));
    container.innerHTML = options.labels
      .map((label, idx) => {
        const val = currentValues[idx] ?? 0;
        const isHighlighted = idx === (options.highlight ?? -1);
        const formattedVal = options.format(val);
        const barHeightPct = (val / niceCeiling) * 100;
        return `<div class="bars__col${isHighlighted ? ' is-hi' : ''}" role="listitem" aria-label="${escapeHtml(label)}: ${escapeHtml(formattedVal)}" title="${escapeHtml(label)}: ${escapeHtml(formattedVal)}">
      <div class="bars__track"><span class="bars__bar bars__bar--${options.tone ?? 'pine'}" style="height:${barHeightPct}%"></span></div><span class="bars__lab">${escapeHtml(label)}</span></div>`;
      })
      .join('');
  };

  renderBars();

  return {
    play(delay = 0) {
      gsap.fromTo(
        container.querySelectorAll('.bars__bar'),
        {
          scaleY: 0,
        },
        {
          scaleY: 1,
          transformOrigin: '50% 100%',
          duration: motionDuration(0.9),
          ease: 'power3.out',
          stagger: motionDuration(0.035),
          delay: motionDuration(delay),
          clearProps: 'transform',
        }
      );
    },
    update(newValues: number[]) {
      const oldCeiling = calculateNiceScale(Math.max(1, ...currentValues));
      const newCeiling = calculateNiceScale(Math.max(1, ...newValues));
      const previousValues = currentValues;
      currentValues = newValues;

      renderBars();

      container.querySelectorAll('.bars__bar').forEach((barEl, idx) => {
        const oldRatio = (previousValues[idx] ?? 0) / oldCeiling;
        const newRatio = Math.max(0.0001, (newValues[idx] ?? 0) / newCeiling);
        const startScale = Math.min(6, oldRatio / newRatio);

        gsap.fromTo(
          barEl,
          {
            scaleY: startScale,
          },
          {
            scaleY: 1,
            transformOrigin: '50% 100%',
            duration: motionDuration(0.7),
            ease: 'power3.inOut',
            clearProps: 'transform',
          }
        );
      });
    },
  };
}
