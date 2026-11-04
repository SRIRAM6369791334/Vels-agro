import { escapeHtml } from '../../../utils/dom';
import { motionDuration, prefersReducedMotion, gsap } from '../../../core/motion';
import { calculateNiceScale } from './math';
import type { ChartInstance, GroupedBarChartOptions, GroupedBarGroup } from './types';

/**
 * Grouped Bar Chart (historically aliased as createBarChart)
 * Renders grouped vertical bars with series toggles, interactive tooltip, and pin support.
 */
export function renderGroupedBarChart(container: HTMLElement, options: GroupedBarChartOptions): ChartInstance {
  container.classList.add('hb');
  container.innerHTML = `<div class="hb__y" aria-hidden="true"></div>
    <div class="hb__plot" role="list" aria-label="${escapeHtml(options.label)}"></div>
    <div class="hb__tip" role="status" aria-live="polite"></div>`;

  const yAxisEl = container.querySelector<HTMLDivElement>('.hb__y')!;
  const plotEl = container.querySelector<HTMLDivElement>('.hb__plot')!;
  const tooltipEl = container.querySelector<HTMLDivElement>('.hb__tip')!;

  let currentGroups = options.groups;
  const activeSeriesMask = options.series.map(() => true);
  let hoveredIndex = -1;
  let pinnedIndex = options.pick ?? -1;

  container.tabIndex = 0;

  const getMaxTick = () =>
    calculateNiceScale(
      Math.max(
        1,
        ...currentGroups.flatMap((group) => group.values.filter((_, idx) => activeSeriesMask[idx]))
      ) * 1.05
    );

  const getBarRatio = (val: number, maxTick: number) => Math.max(0.012, val / maxTick);

  function renderYAxis(maxTick: number) {
    yAxisEl.innerHTML = [1, 0.8, 0.6, 0.4, 0.2, 0]
      .map((fraction) => `<span style="--f:${fraction}"><b>${escapeHtml(options.axis(maxTick * fraction))}</b></span>`)
      .join('');
  }

  function renderPlot() {
    const maxTick = getMaxTick();
    renderYAxis(maxTick);

    plotEl.innerHTML = currentGroups
      .map(
        (group, groupIdx) => `<div class="hb__grp" role="listitem" data-i="${groupIdx}" aria-label="${escapeHtml(group.label)}: ${options.series.map((s, sIdx) => `${s.name} ${options.format(group.values[sIdx] ?? 0)}`).join(', ')}">
      <div class="hb__bars">${options.series
        .map(
          (s, sIdx) =>
            `<span class="hb__bar${activeSeriesMask[sIdx] ? '' : ' is-off'}" data-s="${sIdx}" style="--c:var(--${s.tone === 'muted' ? 'faint' : s.tone});height:${getBarRatio(group.values[sIdx] ?? 0, maxTick) * 100}%"><i class="hb__fill"></i><i class="hb__cap"></i></span>`
        )
        .join('')}</div>
      <span class="hb__lab">${escapeHtml(group.label)}</span></div>`
      )
      .join('');

    updateTooltipAndHighlight(false);
  }

  function updateTooltipAndHighlight(animate = true) {
    const targetIndex = hoveredIndex >= 0 ? hoveredIndex : pinnedIndex;

    plotEl.querySelectorAll<HTMLElement>('.hb__grp').forEach((groupEl) => {
      const isTarget = Number(groupEl.dataset.i) === targetIndex;
      groupEl.classList.toggle('is-hot', isTarget);
      const fillElements = groupEl.querySelectorAll<HTMLElement>('.hb__fill');

      if (animate) {
        gsap.to(fillElements, {
          opacity: +!!isTarget,
          duration: motionDuration(isTarget ? 0.3 : 0.2),
          ease: 'power2.out',
          stagger: isTarget ? 0.04 : 0,
          overwrite: true,
        });
      } else {
        gsap.set(fillElements, {
          opacity: +!!isTarget,
        });
      }
    });

    const activeGroup = currentGroups[targetIndex];
    if (!activeGroup) {
      tooltipEl.style.opacity = '0';
      return;
    }

    tooltipEl.innerHTML = `<b>${escapeHtml(activeGroup.label)}</b>${options.series
      .map((s, sIdx) => {
        if (activeSeriesMask[sIdx]) {
          return `<span><i class="tone--${s.tone}"></i>${escapeHtml(s.name)}<strong>${escapeHtml(options.format(activeGroup.values[sIdx] ?? 0))}</strong></span>`;
        }
        return '';
      })
      .join('')}`;

    const barsContainer = plotEl.querySelector<HTMLElement>(`.hb__grp[data-i="${targetIndex}"] .hb__bars`);
    if (!barsContainer) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const barsRect = barsContainer.getBoundingClientRect();
    const visibleBarTops = [...barsContainer.querySelectorAll<HTMLElement>('.hb__bar:not(.is-off)')].map(
      (el) => el.getBoundingClientRect().top
    );
    const highestBarTop = Math.max(...visibleBarTops, barsRect.top);

    const tooltipLeft = Math.min(
      containerRect.width - tooltipEl.offsetWidth - 2,
      Math.max(2, barsRect.left - containerRect.left + barsRect.width / 2 - tooltipEl.offsetWidth / 2)
    );
    const tooltipTop = Math.max(
      0,
      Math.min(...visibleBarTops, highestBarTop) - containerRect.top - tooltipEl.offsetHeight - 10
    );

    const isNewlyShown = tooltipEl.style.opacity !== '1';
    tooltipEl.style.opacity = '1';

    if (isNewlyShown || !animate || prefersReducedMotion.matches) {
      gsap.set(tooltipEl, {
        x: tooltipLeft,
        y: tooltipTop,
      });
    } else {
      gsap.to(tooltipEl, {
        x: tooltipLeft,
        y: tooltipTop,
        duration: 0.35,
        ease: 'power3.out',
        overwrite: true,
      });
    }
  }

  function animateBarsTransition(prevRatiosMap: Map<string, number>) {
    const maxTick = getMaxTick();
    renderYAxis(maxTick);

    plotEl.querySelectorAll<HTMLElement>('.hb__grp').forEach((groupEl) => {
      const groupIdx = Number(groupEl.dataset.i);
      const group = currentGroups[groupIdx];
      if (!group) return;

      groupEl.querySelectorAll<HTMLElement>('.hb__bar').forEach((barEl) => {
        const seriesIdx = Number(barEl.dataset.s);
        const ratio = getBarRatio(group.values[seriesIdx] ?? 0, maxTick);
        barEl.classList.toggle('is-off', !activeSeriesMask[seriesIdx]);
        const prevRatio = prevRatiosMap.get(`${groupIdx}:${seriesIdx}`) ?? ratio;
        barEl.style.height = `${ratio * 100}%`;

        if (!activeSeriesMask[seriesIdx]) {
          gsap.to(barEl, {
            scaleY: 0,
            opacity: 0,
            transformOrigin: '50% 100%',
            duration: motionDuration(0.45),
            ease: 'power3.in',
          });
          return;
        }

        gsap.fromTo(
          barEl,
          {
            scaleY: Math.min(8, prevRatio / ratio),
            opacity: 1,
          },
          {
            scaleY: 1,
            opacity: 1,
            transformOrigin: '50% 100%',
            duration: motionDuration(0.8),
            ease: 'power3.inOut',
            delay: motionDuration(groupIdx * 0.015),
            clearProps: 'transform,opacity',
          }
        );
      });
    });

    updateTooltipAndHighlight(false);
  }

  const captureCurrentRatios = () => {
    const ratioMap = new Map<string, number>();
    const maxTick = getMaxTick();
    currentGroups.forEach((group, gIdx) =>
      group.values.forEach((val, sIdx) =>
        ratioMap.set(`${gIdx}:${sIdx}`, activeSeriesMask[sIdx] ? getBarRatio(val, maxTick) : 0.0001)
      )
    );
    return ratioMap;
  };

  const findNearestGroupIndex = (clientX: number): number => {
    const groupElements = [...plotEl.querySelectorAll<HTMLElement>('.hb__grp')];
    let nearestIdx = -1;
    let shortestDist = Infinity;
    groupElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const dist = Math.abs(rect.left + rect.width / 2 - clientX);
      if (dist < shortestDist) {
        shortestDist = dist;
        nearestIdx = Number(el.dataset.i);
      }
    });
    return nearestIdx;
  };

  plotEl.addEventListener('pointermove', (evt) => {
    const nearest = findNearestGroupIndex(evt.clientX);
    if (nearest !== hoveredIndex) {
      hoveredIndex = nearest;
      updateTooltipAndHighlight();
    }
  });

  plotEl.addEventListener('pointerleave', () => {
    hoveredIndex = -1;
    updateTooltipAndHighlight();
  });

  plotEl.addEventListener('click', (evt) => {
    const nearest = findNearestGroupIndex(evt.clientX);
    pinnedIndex = pinnedIndex === nearest ? -1 : nearest;
    hoveredIndex = -1;
    updateTooltipAndHighlight();
  });

  container.addEventListener('keydown', (evt) => {
    if (evt.key !== 'ArrowLeft' && evt.key !== 'ArrowRight') {
      return;
    }
    evt.preventDefault();
    const cur = hoveredIndex >= 0 ? hoveredIndex : pinnedIndex >= 0 ? pinnedIndex : currentGroups.length;
    pinnedIndex = Math.max(0, Math.min(currentGroups.length - 1, cur + (evt.key === 'ArrowRight' ? 1 : -1)));
    hoveredIndex = -1;
    updateTooltipAndHighlight();
  });

  new ResizeObserver(() => updateTooltipAndHighlight(false)).observe(container);
  renderPlot();

  return {
    play(delay = 0) {
      const visibleBars = plotEl.querySelectorAll('.hb__bar:not(.is-off)');
      gsap.fromTo(
        visibleBars,
        {
          scaleY: 0,
        },
        {
          scaleY: 1,
          transformOrigin: '50% 100%',
          duration: motionDuration(1),
          ease: 'power3.out',
          stagger: {
            each: motionDuration(0.018),
            from: 'start',
          },
          delay: motionDuration(delay),
          clearProps: 'transform',
        }
      );

      gsap.fromTo(
        yAxisEl.querySelectorAll('b'),
        {
          opacity: 0,
          x: -6,
        },
        {
          opacity: 1,
          x: 0,
          duration: motionDuration(0.5),
          stagger: motionDuration(0.05),
          delay: motionDuration(delay),
          clearProps: 'opacity,transform',
        }
      );

      gsap.fromTo(
        plotEl.querySelectorAll('.hb__lab'),
        {
          opacity: 0,
          y: 6,
        },
        {
          opacity: 1,
          y: 0,
          duration: motionDuration(0.4),
          stagger: motionDuration(0.03),
          delay: motionDuration(delay + 0.2),
          clearProps: 'opacity,transform',
        }
      );

      if (pinnedIndex >= 0) {
        gsap.delayedCall(motionDuration(delay + 1.1), () => updateTooltipAndHighlight());
      }
    },
    update(newGroups: GroupedBarGroup[], newPinned = -1) {
      const isSameLength = newGroups.length === currentGroups.length;
      const prevRatios = captureCurrentRatios();
      currentGroups = newGroups;
      pinnedIndex = newPinned;
      hoveredIndex = -1;

      if (isSameLength) {
        renderPlot();
        animateBarsTransition(prevRatios);
      } else {
        tooltipEl.style.opacity = '0';
        renderPlot();
        this.play();
      }
    },
    toggle(seriesIdx: number): boolean {
      if (activeSeriesMask.filter(Boolean).length === 1 && activeSeriesMask[seriesIdx]) {
        return false;
      }
      const prevRatios = captureCurrentRatios();
      activeSeriesMask[seriesIdx] = !activeSeriesMask[seriesIdx];
      animateBarsTransition(prevRatios);
      return activeSeriesMask[seriesIdx];
    },
    get pinned() {
      return pinnedIndex;
    },
  };
}
