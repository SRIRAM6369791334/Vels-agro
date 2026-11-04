import { escapeHtml } from '../../../utils/dom';
import { motionDuration, gsap } from '../../../core/motion';
import { SVG_NS, calculateNiceScale, buildCatmullRomPath } from './math';
import type { ChartInstance, LineChartOptions, LineChartSeries } from './types';

export function renderLineChart(container: HTMLElement, options: LineChartOptions): ChartInstance {
  container.classList.add('chart');
  const gradientId = `g-${options.label.replace(/\W/g, '')}`;
  const clipId = `c-${options.label.replace(/\W/g, '')}`;

  container.innerHTML = `<svg class="chart__svg" role="img" aria-label="${escapeHtml(options.label)}">
    <defs>
      <linearGradient id="${gradientId}" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" class="chart__stop0"/>
        <stop offset="1" class="chart__stop1"/>
      </linearGradient>
      <clipPath id="${clipId}">
        <rect class="chart__clip" x="0" y="0" height="100%"/>
      </clipPath>
    </defs>
    <g class="chart__grid"></g>
    <g class="chart__plot" clip-path="url(#${clipId})">
      <path class="chart__area" fill="url(#${gradientId})"/>
    </g>
    <g class="chart__x"></g>
    <line class="chart__cross" y1="0" />
    <g class="chart__dots"></g>
  </svg>
  <div class="chart__tip" role="status" aria-live="polite"></div>`;

  const svg = container.querySelector<SVGSVGElement>('svg')!;
  const plotGroup = svg.querySelector<SVGGElement>('.chart__plot')!;
  const gridGroup = svg.querySelector<SVGGElement>('.chart__grid')!;
  const xAxisGroup = svg.querySelector<SVGGElement>('.chart__x')!;
  const areaPath = svg.querySelector<SVGPathElement>('.chart__area')!;
  const clipRect = svg.querySelector<SVGRectElement>('.chart__clip')!;
  const crosshairLine = svg.querySelector<SVGLineElement>('.chart__cross')!;
  const dotsGroup = svg.querySelector<SVGGElement>('.chart__dots')!;
  const tooltip = container.querySelector<HTMLDivElement>('.chart__tip')!;

  let currentLabels = options.labels;
  let currentSeries = options.series;
  let seriesValues = currentSeries.map((s) => [...s.values]);
  const linePathElements: SVGPathElement[] = [];
  const revealProgress = { p: 0 };
  let currentWidth = 0;
  let chartHeight = options.height ?? 220;
  let activeIndex = -1;
  const insets = { l: 44, r: 12, t: 12, b: 26 };

  container.tabIndex = 0;

  function syncLineElements() {
    while (linePathElements.length < currentSeries.length) {
      const pathEl = document.createElementNS(SVG_NS, 'path');
      plotGroup.append(pathEl);
      linePathElements.push(pathEl);
    }
    linePathElements.forEach((pathEl, idx) => {
      const s = currentSeries[idx];
      pathEl.style.display = s ? '' : 'none';
      if (s) {
        pathEl.setAttribute(
          'class',
          `chart__line chart__line--${s.tone}${s.dashed ? ' is-dashed' : ''}`
        );
      }
    });
  }

  const getCeilingTick = () => calculateNiceScale(Math.max(1, ...seriesValues.flat()) * 1.08);
  const getXCoord = (index: number) =>
    insets.l + (currentLabels.length < 2 ? 0 : (index / (currentLabels.length - 1)) * (currentWidth - insets.l - insets.r));
  const getYCoord = (val: number) => insets.t + (1 - val / getCeilingTick()) * (chartHeight - insets.t - insets.b);

  function renderDom() {
    currentWidth = container.clientWidth;
    if (!currentWidth) {
      return;
    }
    chartHeight = options.height ?? Math.max(160, container.clientHeight || 220);
    svg.setAttribute('viewBox', `0 0 ${currentWidth} ${chartHeight}`);
    svg.setAttribute('width', String(currentWidth));
    svg.setAttribute('height', String(chartHeight));

    const maxTick = getCeilingTick();
    gridGroup.innerHTML = [0, 0.5, 1]
      .map(
        (fraction) =>
          `<line x1="${insets.l}" x2="${currentWidth - insets.r}" y1="${getYCoord(maxTick * fraction)}" y2="${getYCoord(maxTick * fraction)}"/><text x="${insets.l - 8}" y="${getYCoord(maxTick * fraction) + 4}" text-anchor="end">${escapeHtml(options.format(maxTick * fraction))}</text>`
      )
      .join('');

    const labelStride = Math.ceil(currentLabels.length / Math.max(2, Math.floor((currentWidth - insets.l) / 56)));
    const lastLabelIndex = currentLabels.length - 1;
    const shouldShowXLabel = (index: number) =>
      index === lastLabelIndex || (index % labelStride === 0 && getXCoord(lastLabelIndex) - getXCoord(index) >= 76 && !(index === labelStride && currentLabels.length > 2));

    xAxisGroup.innerHTML = currentLabels
      .map((label, idx) => {
        if (shouldShowXLabel(idx)) {
          const anchor = idx === lastLabelIndex && currentLabels.length > 2 ? 'end' : idx === 0 ? 'start' : 'middle';
          return `<text x="${getXCoord(idx)}" y="${chartHeight - 6}" text-anchor="${anchor}">${escapeHtml(label)}</text>`;
        }
        return '';
      })
      .join('');

    syncLineElements();
    seriesValues.forEach((vals, seriesIdx) => {
      const pathD = buildCatmullRomPath(vals.map((v, i) => [getXCoord(i), getYCoord(v)]));
      linePathElements[seriesIdx]?.setAttribute('d', pathD);
      if (seriesIdx === 0) {
        areaPath.setAttribute('d', `${pathD} L${getXCoord(vals.length - 1)},${chartHeight - insets.b} L${getXCoord(0)},${chartHeight - insets.b} Z`);
      }
    });

    const primaryTone = currentSeries[0]?.tone ?? 'pine';
    areaPath.setAttribute('class', `chart__area chart__area--${primaryTone}`);
    container.style.setProperty(
      '--area',
      `var(--${primaryTone === 'muted' ? 'faint' : primaryTone})`
    );

    clipRect.setAttribute('width', String(insets.l + (currentWidth - insets.l) * revealProgress.p + 2));
    crosshairLine.setAttribute('y1', String(insets.t));
    crosshairLine.setAttribute('y2', String(chartHeight - insets.b));

    if (activeIndex >= 0 && activeIndex < currentLabels.length) {
      crosshairLine.setAttribute('x1', String(getXCoord(activeIndex)));
      crosshairLine.setAttribute('x2', String(getXCoord(activeIndex)));
      crosshairLine.style.opacity = '1';

      dotsGroup.innerHTML = seriesValues
        .map(
          (vals, sIdx) =>
            `<circle class="chart__dot chart__dot--${currentSeries[sIdx]?.tone}" cx="${getXCoord(activeIndex)}" cy="${getYCoord(vals[activeIndex] ?? 0)}" r="4.5"/>`
        )
        .join('');

      tooltip.innerHTML = `<b>${escapeHtml(currentLabels[activeIndex] ?? '')}</b>${currentSeries.map((s, sIdx) => `<span><i class="tone--${s.tone}"></i>${escapeHtml(s.name)} <strong>${escapeHtml(options.format(seriesValues[sIdx]?.[activeIndex] ?? 0))}</strong></span>`).join('')}`;
      tooltip.style.opacity = '1';

      const leftPos = Math.min(currentWidth - tooltip.offsetWidth - 4, Math.max(4, getXCoord(activeIndex) - tooltip.offsetWidth / 2));
      const maxValAtPoint = Math.max(...seriesValues.map((vals) => vals[activeIndex] ?? 0));
      tooltip.style.transform = `translate(${leftPos}px, ${Math.max(0, getYCoord(maxValAtPoint) - tooltip.offsetHeight - 14)}px)`;
    } else {
      crosshairLine.style.opacity = '0';
      dotsGroup.innerHTML = '';
      tooltip.style.opacity = '0';
    }
  }

  const scheduleRender = () => requestAnimationFrame(renderDom);
  new ResizeObserver(scheduleRender).observe(container);
  container.addEventListener('card:resize', scheduleRender);
  container.closest('.card')?.addEventListener('card:resize', () => setTimeout(scheduleRender, 650));

  container.addEventListener('pointermove', (evt) => {
    const rect = svg.getBoundingClientRect();
    const estIndex = Math.round(
      ((evt.clientX - rect.left - insets.l) / Math.max(1, currentWidth - insets.l - insets.r)) * (currentLabels.length - 1)
    );
    activeIndex = Math.max(0, Math.min(currentLabels.length - 1, estIndex));
    scheduleRender();
  });

  container.addEventListener('pointerleave', () => {
    activeIndex = -1;
    scheduleRender();
  });

  container.addEventListener('keydown', (evt) => {
    if (evt.key === 'ArrowLeft' || evt.key === 'ArrowRight') {
      evt.preventDefault();
      activeIndex = Math.max(
        0,
        Math.min(
          currentLabels.length - 1,
          (activeIndex < 0 ? currentLabels.length - 1 : activeIndex) + (evt.key === 'ArrowRight' ? 1 : -1)
        )
      );
      scheduleRender();
    }
  });

  container.addEventListener('blur', () => {
    activeIndex = -1;
    scheduleRender();
  });

  return {
    play(delay = 0) {
      revealProgress.p = 0;
      scheduleRender();
      gsap.to(revealProgress, {
        p: 1,
        duration: motionDuration(1.4),
        delay: motionDuration(delay),
        ease: 'power2.inOut',
        onUpdate: scheduleRender,
        onComplete: scheduleRender,
      });
    },
    update(newSeries: LineChartSeries[], newLabels: string[] = currentLabels) {
      const interpolatedValues = newSeries.map((s, sIdx) =>
        s.values.map((_, valIdx) => {
          const oldVals = seriesValues[sIdx] ?? seriesValues[0] ?? [];
          const ratio = oldVals.length < 2 ? 0 : (valIdx / Math.max(1, s.values.length - 1)) * (oldVals.length - 1);
          const floorVal = oldVals[Math.floor(ratio)] ?? 0;
          return floorVal + ((oldVals[Math.ceil(ratio)] ?? floorVal) - floorVal) * (ratio - Math.floor(ratio));
        })
      );
      currentSeries = newSeries;
      currentLabels = newLabels;
      seriesValues = interpolatedValues;
      revealProgress.p = 1;

      const progressObj = { t: 0 };
      gsap.to(progressObj, {
        t: 1,
        duration: motionDuration(0.9),
        ease: 'power3.inOut',
        onUpdate: () => {
          seriesValues = newSeries.map((s, sIdx) =>
            s.values.map((targetVal, valIdx) => {
              const startVal = interpolatedValues[sIdx][valIdx] ?? 0;
              return startVal + (targetVal - startVal) * progressObj.t;
            })
          );
          scheduleRender();
        },
        onComplete: () => {
          seriesValues = newSeries.map((s) => [...s.values]);
          scheduleRender();
        },
      });
    },
    redraw: scheduleRender,
  };
}
