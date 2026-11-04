import { test, expect } from '@playwright/test';

test.describe('Adversarial Stress Suite: Visualization Engine & Charts', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/#/dashboard/overview');
    await page.waitForLoadState('networkidle');
    await page.evaluate(async () => {
      if (!window.__CHARTS__) {
        window.__CHARTS__ = await import('/assets/charts-test-bundle.js');
      }
    });
  });

  // Helper to run code in page context using pre-imported charts bundle and AsyncFunction
  async function evaluateChartTest(page, testFnString) {
    return await page.evaluate(async (fnStr) => {
      const charts = window.__CHARTS__;
      const container = document.createElement('div');
      container.id = 'stress-test-chart-container';
      container.style.width = '600px';
      container.style.height = '300px';
      container.style.position = 'relative';
      document.body.appendChild(container);

      try {
        const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
        const fn = new AsyncFunction('charts', 'container', fnStr);
        const res = await fn(charts, container);
        // Wait for two frames to ensure scheduled renderDom and layout cycles complete
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        return res;
      } finally {
        container.remove();
      }
    }, testFnString);
  }

  // =========================================================================
  // 1. SPARKLINE SVG (renderSparklineSvg / createSparkline)
  // =========================================================================
  test.describe('1. Sparkline SVG Adversarial Edge Cases', () => {
    test('Empty data array ([]) generates empty path without NaN or error', async ({ page }) => {
      const result = await evaluateChartTest(page, `
        const svg = charts.renderSparklineSvg([]);
        return {
          svg,
          hasSvg: svg.includes('<svg'),
          hasNaN: svg.includes('NaN'),
          hasUndefined: svg.includes('undefined'),
          hasInfinity: svg.includes('Infinity'),
        };
      `);
      expect(result.hasSvg).toBe(true);
      expect(result.hasNaN).toBe(false);
      expect(result.hasUndefined).toBe(false);
      expect(result.hasInfinity).toBe(false);
    });

    test('Single data point generates safe path without NaN', async ({ page }) => {
      const result = await evaluateChartTest(page, `
        const svg = charts.renderSparklineSvg([42]);
        return {
          svg,
          hasNaN: svg.includes('NaN'),
          hasUndefined: svg.includes('undefined'),
        };
      `);
      expect(result.hasNaN).toBe(false);
      expect(result.hasUndefined).toBe(false);
    });

    test('All-zero values generate valid collinear path without NaN', async ({ page }) => {
      const result = await evaluateChartTest(page, `
        const svg = charts.renderSparklineSvg([0, 0, 0, 0, 0]);
        return {
          svg,
          hasNaN: svg.includes('NaN'),
          hasUndefined: svg.includes('undefined'),
        };
      `);
      expect(result.hasNaN).toBe(false);
      expect(result.hasUndefined).toBe(false);
    });

    test('Negative numbers and mixed negative/positive handled smoothly', async ({ page }) => {
      const result = await evaluateChartTest(page, `
        const svg1 = charts.renderSparklineSvg([-10, -50, -2, -100]);
        const svg2 = charts.renderSparklineSvg([-50, 0, 50, 100]);
        return {
          hasNaN: svg1.includes('NaN') || svg2.includes('NaN'),
          hasUndefined: svg1.includes('undefined') || svg2.includes('undefined'),
        };
      `);
      expect(result.hasNaN).toBe(false);
      expect(result.hasUndefined).toBe(false);
    });

    test('Extremely large numbers (billions) handled without overflow', async ({ page }) => {
      const result = await evaluateChartTest(page, `
        const svg = charts.renderSparklineSvg([1e9, 5e11, 2e10, 8e11]);
        return {
          hasNaN: svg.includes('NaN'),
          hasInfinity: svg.includes('Infinity'),
        };
      `);
      expect(result.hasNaN).toBe(false);
      expect(result.hasInfinity).toBe(false);
    });

    test('NaN, null, and undefined values do not crash generator', async ({ page }) => {
      const result = await evaluateChartTest(page, `
        const svg = charts.renderSparklineSvg([10, NaN, null, undefined, 20]);
        return {
          hasSvg: svg.includes('<svg'),
        };
      `);
      expect(result.hasSvg).toBe(true);
    });
  });

  // =========================================================================
  // 2. LINE CHART (renderLineChart / createLineChart)
  // =========================================================================
  test.describe('2. Line Chart Adversarial Edge Cases', () => {
    test('Empty data arrays and empty labels mount without error', async ({ page }) => {
      const result = await evaluateChartTest(page, `
        const chart = charts.renderLineChart(container, {
          label: 'Empty Test',
          labels: [],
          series: [{ name: 'S1', tone: 'pine', values: [] }],
          format: (v) => String(v),
        });
        chart.play();
        chart.redraw();
        await new Promise(r => requestAnimationFrame(r));
        const svg = container.querySelector('svg');
        return {
          mounted: !!svg,
          viewBox: svg.getAttribute('viewBox'),
          hasNaN: container.innerHTML.includes('NaN'),
        };
      `);
      expect(result.mounted).toBe(true);
      expect(result.hasNaN).toBe(false);
    });

    test('Single data point mounts cleanly without NaN in paths', async ({ page }) => {
      const result = await evaluateChartTest(page, `
        const chart = charts.renderLineChart(container, {
          label: 'Single Point',
          labels: ['Point 1'],
          series: [{ name: 'S1', tone: 'pine', values: [100] }],
          format: (v) => '$' + v,
        });
        chart.play();
        await new Promise(r => requestAnimationFrame(r));
        const d = container.querySelector('.chart__line')?.getAttribute('d') ?? '';
        return {
          d,
          hasNaN: container.innerHTML.includes('NaN'),
        };
      `);
      expect(result.hasNaN).toBe(false);
      expect(result.d).not.toContain('NaN');
    });

    test('All-zero series values scale to safe ceiling without division by zero', async ({ page }) => {
      const result = await evaluateChartTest(page, `
        const chart = charts.renderLineChart(container, {
          label: 'Zeros',
          labels: ['Q1', 'Q2', 'Q3', 'Q4'],
          series: [{ name: 'ZeroSeries', tone: 'pine', values: [0, 0, 0, 0] }],
          format: (v) => String(v),
        });
        chart.play();
        await new Promise(r => requestAnimationFrame(r));
        const line = container.querySelector('.chart__line');
        return {
          d: line?.getAttribute('d') ?? '',
          hasNaN: container.innerHTML.includes('NaN'),
        };
      `);
      expect(result.hasNaN).toBe(false);
      expect(result.d).not.toContain('NaN');
    });

    test('Negative numbers and mixed negative/positive values handle smoothly', async ({ page }) => {
      const result = await evaluateChartTest(page, `
        const chart = charts.renderLineChart(container, {
          label: 'Negative Test',
          labels: ['W1', 'W2', 'W3', 'W4'],
          series: [{ name: 'Loss', tone: 'rose', values: [-20, -100, -5, -40] }],
          format: (v) => String(v),
        });
        chart.play();
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        return {
          hasNaN: container.innerHTML.includes('NaN'),
          hasLine: !!container.querySelector('.chart__line'),
        };
      `);
      expect(result.hasNaN).toBe(false);
      expect(result.hasLine).toBe(true);
    });

    test('Extremely large values (billions) generate valid SVG without overflow', async ({ page }) => {
      const result = await evaluateChartTest(page, `
        const chart = charts.renderLineChart(container, {
          label: 'Billions Test',
          labels: ['2023', '2024', '2025', '2026'],
          series: [{ name: 'Rev', tone: 'pine', values: [1e9, 2.5e9, 1.8e9, 5e9] }],
          format: (v) => (v / 1e9).toFixed(1) + 'B',
        });
        chart.play();
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        return {
          hasNaN: container.innerHTML.includes('NaN'),
          hasInfinity: container.innerHTML.includes('Infinity'),
        };
      `);
      expect(result.hasNaN).toBe(false);
      expect(result.hasInfinity).toBe(false);
    });

    test('Update lifecycle with mismatched series length and new labels', async ({ page }) => {
      const result = await evaluateChartTest(page, `
        const chart = charts.renderLineChart(container, {
          label: 'Update Test',
          labels: ['Jan', 'Feb', 'Mar'],
          series: [{ name: 'A', tone: 'pine', values: [10, 20, 30] }],
          format: (v) => String(v),
        });
        chart.update(
          [
            { name: 'A', tone: 'pine', values: [50, 40, 60, 80, 100] },
            { name: 'B', tone: 'sky', values: [20, 30, 40, 50, 60], dashed: true },
          ],
          ['Jan', 'Feb', 'Mar', 'Apr', 'May']
        );
        await new Promise(r => setTimeout(r, 150));
        return {
          pathCount: container.querySelectorAll('.chart__line').length,
          hasNaN: container.innerHTML.includes('NaN'),
        };
      `);
      expect(result.pathCount).toBeGreaterThanOrEqual(2);
      expect(result.hasNaN).toBe(false);
    });
  });

  // =========================================================================
  // 3. COLUMN BAR CHART (renderColumnBarChart / createDonutChart)
  // =========================================================================
  test.describe('3. Column Bar Chart Adversarial Edge Cases', () => {
    test('Empty values and labels mount empty list without crashing', async ({ page }) => {
      const result = await evaluateChartTest(page, `
        const chart = charts.renderColumnBarChart(container, {
          label: 'Empty Bars',
          labels: [],
          values: [],
          format: (v) => String(v),
        });
        chart.play();
        return {
          hasBars: container.classList.contains('bars'),
          colCount: container.querySelectorAll('.bars__col').length,
          hasNaN: container.innerHTML.includes('NaN'),
        };
      `);
      expect(result.hasBars).toBe(true);
      expect(result.colCount).toBe(0);
      expect(result.hasNaN).toBe(false);
    });

    test('Single value with highlight option mounts correctly', async ({ page }) => {
      const result = await evaluateChartTest(page, `
        const chart = charts.renderColumnBarChart(container, {
          label: 'Single Bar',
          labels: ['Sole SKU'],
          values: [85],
          highlight: 0,
          format: (v) => v + '%',
        });
        chart.play();
        const col = container.querySelector('.bars__col');
        return {
          isHi: col?.classList.contains('is-hi'),
          hasNaN: container.innerHTML.includes('NaN'),
        };
      `);
      expect(result.isHi).toBe(true);
      expect(result.hasNaN).toBe(false);
    });

    test('All-zero values generate zero height percentages safely', async ({ page }) => {
      const result = await evaluateChartTest(page, `
        const chart = charts.renderColumnBarChart(container, {
          label: 'All Zeros',
          labels: ['A', 'B', 'C'],
          values: [0, 0, 0],
          format: (v) => String(v),
        });
        const heights = [...container.querySelectorAll('.bars__bar')].map(b => b.style.height);
        return {
          heights,
          hasNaN: container.innerHTML.includes('NaN'),
        };
      `);
      expect(result.hasNaN).toBe(false);
      result.heights.forEach(h => expect(h).toBe('0%'));
    });

    test('Extremely large values (trillions) calculate valid scale and heights', async ({ page }) => {
      const result = await evaluateChartTest(page, `
        const chart = charts.renderColumnBarChart(container, {
          label: 'Trillions',
          labels: ['X', 'Y', 'Z'],
          values: [1e12, 5e11, 2e12],
          format: (v) => (v / 1e12).toFixed(1) + 'T',
        });
        chart.play();
        return {
          hasNaN: container.innerHTML.includes('NaN'),
          hasInfinity: container.innerHTML.includes('Infinity'),
        };
      `);
      expect(result.hasNaN).toBe(false);
      expect(result.hasInfinity).toBe(false);
    });

    test('Update lifecycle with varying sizes and values', async ({ page }) => {
      const result = await evaluateChartTest(page, `
        const chart = charts.renderColumnBarChart(container, {
          label: 'Update Bars',
          labels: ['A', 'B', 'C'],
          values: [10, 20, 30],
          format: (v) => String(v),
        });
        chart.update([100, 50, 80]);
        return {
          hasNaN: container.innerHTML.includes('NaN'),
        };
      `);
      expect(result.hasNaN).toBe(false);
    });
  });

  // =========================================================================
  // 4. DONUT RING METER (renderDonutRingMeter / createRingMeter)
  // =========================================================================
  test.describe('4. Donut Ring Meter Adversarial Edge Cases', () => {
    test('Empty parts array mounts ring track and center label without NaN', async ({ page }) => {
      const result = await evaluateChartTest(page, `
        const chart = charts.renderDonutRingMeter(container, {
          label: 'Empty Donut',
          center: '0%',
          sub: 'None',
          parts: [],
        });
        chart.play();
        return {
          hasTrack: !!container.querySelector('.donut__track'),
          arcCount: container.querySelectorAll('.donut__arc').length,
          hasNaN: container.innerHTML.includes('NaN'),
        };
      `);
      expect(result.hasTrack).toBe(true);
      expect(result.arcCount).toBe(0);
      expect(result.hasNaN).toBe(false);
    });

    test('Single part takes full circumference safely', async ({ page }) => {
      const result = await evaluateChartTest(page, `
        const chart = charts.renderDonutRingMeter(container, {
          label: 'Single Part',
          center: '100%',
          sub: 'Complete',
          parts: [{ value: 500, tone: 'pine' }],
        });
        chart.play();
        const arc = container.querySelector('.donut__arc');
        return {
          dataLen: Number(arc?.getAttribute('data-len') ?? 0),
          hasNaN: container.innerHTML.includes('NaN'),
        };
      `);
      expect(result.dataLen).toBeGreaterThan(300);
      expect(result.hasNaN).toBe(false);
    });

    test('All-zero part values handle division by zero fallback to 1', async ({ page }) => {
      const result = await evaluateChartTest(page, `
        const chart = charts.renderDonutRingMeter(container, {
          label: 'Zero Parts',
          center: '0',
          sub: 'Zero',
          parts: [
            { value: 0, tone: 'pine' },
            { value: 0, tone: 'sky' },
          ],
        });
        return {
          hasNaN: container.innerHTML.includes('NaN'),
        };
      `);
      expect(result.hasNaN).toBe(false);
    });

    test('Extremely large part values calculate proportional arcs correctly', async ({ page }) => {
      const result = await evaluateChartTest(page, `
        const chart = charts.renderDonutRingMeter(container, {
          label: 'Huge Parts',
          center: '3B',
          sub: 'Units',
          parts: [
            { value: 1e9, tone: 'pine' },
            { value: 2e9, tone: 'sky' },
          ],
        });
        chart.play();
        return {
          hasNaN: container.innerHTML.includes('NaN'),
          hasInfinity: container.innerHTML.includes('Infinity'),
        };
      `);
      expect(result.hasNaN).toBe(false);
      expect(result.hasInfinity).toBe(false);
    });

    test('Update lifecycle with new parts and center label', async ({ page }) => {
      const result = await evaluateChartTest(page, `
        const chart = charts.renderDonutRingMeter(container, {
          label: 'Donut Update',
          center: '10',
          sub: 'Old',
          parts: [{ value: 10, tone: 'pine' }],
        });
        chart.update(
          [
            { value: 40, tone: 'pine' },
            { value: 60, tone: 'ochre' },
          ],
          '100'
        );
        const center = container.querySelector('.donut__mid b')?.textContent;
        return {
          center,
          arcCount: container.querySelectorAll('.donut__arc').length,
          hasNaN: container.innerHTML.includes('NaN'),
        };
      `);
      expect(result.center).toBe('100');
      expect(result.arcCount).toBe(2);
      expect(result.hasNaN).toBe(false);
    });
  });

  // =========================================================================
  // 5. RADIAL GAUGE METER (renderRadialGaugeMeter / createHorizontalBarChart)
  // =========================================================================
  test.describe('5. Radial Gauge Meter Adversarial Edge Cases', () => {
    test('Boundary values 0.0 and 1.0 set needle angle cleanly', async ({ page }) => {
      const result = await evaluateChartTest(page, `
        const chart = charts.renderRadialGaugeMeter(container, {
          label: 'Gauge 0',
          value: 0,
          sub: 'Min',
          format: (v) => Math.round(v * 100) + '%',
        });
        chart.play();
        chart.set(1.0, 'Max');
        return {
          hasTrack: !!container.querySelector('.gauge__track'),
          hasNeedle: !!container.querySelector('.gauge__needle'),
          hasNaN: container.innerHTML.includes('NaN'),
        };
      `);
      expect(result.hasTrack).toBe(true);
      expect(result.hasNeedle).toBe(true);
      expect(result.hasNaN).toBe(false);
    });

    test('Negative and overflow values clamp strictly to [0, 1]', async ({ page }) => {
      const result = await evaluateChartTest(page, `
        const chart = charts.renderRadialGaugeMeter(container, {
          label: 'Gauge Clamp',
          value: -0.75,
          sub: 'Negative',
          format: (v) => String(v),
        });
        chart.set(5.5, 'Over');
        return {
          hasNaN: container.innerHTML.includes('NaN'),
        };
      `);
      expect(result.hasNaN).toBe(false);
    });

    test('Custom zones (bad, warn) assign correct zone tones', async ({ page }) => {
      const result = await evaluateChartTest(page, `
        const chart = charts.renderRadialGaugeMeter(container, {
          label: 'Gauge Zones',
          value: 0.2,
          sub: 'Risk',
          format: (v) => String(v),
          zones: { bad: 0.35, warn: 0.7 },
        });
        const tone1 = container.dataset.tone;
        chart.set(0.5);
        const tone2 = container.dataset.tone;
        chart.set(0.9);
        const tone3 = container.dataset.tone;
        return { tone1, tone2, tone3 };
      `);
      expect(result.tone1).toBe('rose');
      expect(result.tone2).toBe('ochre');
      expect(result.tone3).toBe('sage');
    });

    test('Update with new value and new subtitle', async ({ page }) => {
      const result = await evaluateChartTest(page, `
        const chart = charts.renderRadialGaugeMeter(container, {
          label: 'Gauge Live',
          value: 0.5,
          sub: 'Target',
          format: (v) => Math.round(v * 100) + '%',
        });
        chart.update(0.85, 'Updated Subtitle');
        const sub = container.querySelector('.gauge__mid span')?.textContent;
        return {
          sub,
          hasNaN: container.innerHTML.includes('NaN'),
        };
      `);
      expect(result.sub).toBe('Updated Subtitle');
      expect(result.hasNaN).toBe(false);
    });
  });

  // =========================================================================
  // 6. GROUPED BAR CHART (renderGroupedBarChart / createBarChart)
  // =========================================================================
  test.describe('6. Grouped Bar Chart Adversarial Edge Cases', () => {
    test('Empty groups array mounts empty plot without error', async ({ page }) => {
      const result = await evaluateChartTest(page, `
        const chart = charts.renderGroupedBarChart(container, {
          label: 'Empty HB',
          groups: [],
          series: [{ name: 'S1', tone: 'pine' }],
          axis: (v) => String(v),
          format: (v) => String(v),
        });
        chart.play();
        return {
          hasHb: container.classList.contains('hb'),
          groupCount: container.querySelectorAll('.hb__grp').length,
          hasNaN: container.innerHTML.includes('NaN'),
        };
      `);
      expect(result.hasHb).toBe(true);
      expect(result.groupCount).toBe(0);
      expect(result.hasNaN).toBe(false);
    });

    test('Single group, single series mounts and displays cleanly', async ({ page }) => {
      const result = await evaluateChartTest(page, `
        const chart = charts.renderGroupedBarChart(container, {
          label: 'Single Group',
          groups: [{ label: 'W01', values: [150] }],
          series: [{ name: 'Units', tone: 'pine' }],
          axis: (v) => String(v),
          format: (v) => v + ' units',
          pick: 0,
        });
        chart.play();
        return {
          groupCount: container.querySelectorAll('.hb__grp').length,
          pinned: chart.pinned,
          hasNaN: container.innerHTML.includes('NaN'),
        };
      `);
      expect(result.groupCount).toBe(1);
      expect(result.pinned).toBe(0);
      expect(result.hasNaN).toBe(false);
    });

    test('All-zero group values scale safely with minimum bar height ratio', async ({ page }) => {
      const result = await evaluateChartTest(page, `
        const chart = charts.renderGroupedBarChart(container, {
          label: 'Zero HB',
          groups: [
            { label: 'G1', values: [0, 0] },
            { label: 'G2', values: [0, 0] },
          ],
          series: [
            { name: 'S1', tone: 'pine' },
            { name: 'S2', tone: 'sky' },
          ],
          axis: (v) => String(v),
          format: (v) => String(v),
        });
        return {
          hasNaN: container.innerHTML.includes('NaN'),
        };
      `);
      expect(result.hasNaN).toBe(false);
    });

    test('Extremely large values (billions) generate proper Y-axis and bar heights', async ({ page }) => {
      const result = await evaluateChartTest(page, `
        const chart = charts.renderGroupedBarChart(container, {
          label: 'Billions HB',
          groups: [
            { label: 'Americas', values: [1.2e9, 2.5e9] },
            { label: 'EMEA', values: [8e8, 1.9e9] },
          ],
          series: [
            { name: 'Wholesale', tone: 'pine' },
            { name: 'Direct', tone: 'sky' },
          ],
          axis: (v) => (v / 1e9).toFixed(1) + 'B',
          format: (v) => '$' + (v / 1e9).toFixed(2) + 'B',
        });
        chart.play();
        return {
          hasNaN: container.innerHTML.includes('NaN'),
          hasInfinity: container.innerHTML.includes('Infinity'),
        };
      `);
      expect(result.hasNaN).toBe(false);
      expect(result.hasInfinity).toBe(false);
    });

    test('Series toggle functionality maintains state and prevents all-disabled', async ({ page }) => {
      const result = await evaluateChartTest(page, `
        const chart = charts.renderGroupedBarChart(container, {
          label: 'Toggle HB',
          groups: [{ label: 'G1', values: [100, 200] }],
          series: [
            { name: 'S1', tone: 'pine' },
            { name: 'S2', tone: 'sky' },
          ],
          axis: (v) => String(v),
          format: (v) => String(v),
        });
        const toggle1 = chart.toggle(0);
        const toggle2 = chart.toggle(1);
        return {
          toggle1,
          toggle2,
          hasNaN: container.innerHTML.includes('NaN'),
        };
      `);
      expect(result.toggle1).toBe(false);
      expect(result.toggle2).toBe(false);
      expect(result.hasNaN).toBe(false);
    });
  });

  // =========================================================================
  // 7. FAN METER (renderFanMeter / createFanMeter)
  // =========================================================================
  test.describe('7. Fan Meter Adversarial Edge Cases', () => {
    test('Boundary values 0.0 and 1.0 render complete ray spectrum', async ({ page }) => {
      const result = await evaluateChartTest(page, `
        const chart = charts.renderFanMeter(container, {
          label: 'Fan 0',
          value: 0,
          sub: 'Zero',
        });
        chart.play();
        chart.update(1.0, 'Full');
        return {
          baseRays: container.querySelectorAll('.fan__base line').length,
          litRays: container.querySelectorAll('.fan__lit line').length,
          hasNaN: container.innerHTML.includes('NaN'),
        };
      `);
      expect(result.baseRays).toBe(84);
      expect(result.litRays).toBe(84);
      expect(result.hasNaN).toBe(false);
    });

    test('Negative and overflow values clamp strictly to [0, 1]', async ({ page }) => {
      const result = await evaluateChartTest(page, `
        const chart = charts.renderFanMeter(container, {
          label: 'Fan Clamp',
          value: -2.5,
          sub: 'Negative',
        });
        chart.update(15.0, 'Over');
        return {
          hasNaN: container.innerHTML.includes('NaN'),
        };
      `);
      expect(result.hasNaN).toBe(false);
    });

    test('Custom ray count parameter (e.g. 36 rays) renders precise ray count', async ({ page }) => {
      const result = await evaluateChartTest(page, `
        const chart = charts.renderFanMeter(container, {
          label: 'Fan 36',
          value: 0.6,
          sub: '60%',
          count: 36,
        });
        return {
          baseRays: container.querySelectorAll('.fan__base line').length,
          litRays: container.querySelectorAll('.fan__lit line').length,
          hasNaN: container.innerHTML.includes('NaN'),
        };
      `);
      expect(result.baseRays).toBe(36);
      expect(result.litRays).toBe(36);
      expect(result.hasNaN).toBe(false);
    });
  });

  // =========================================================================
  // 8. RAPID RESIZE REFLOW & REDRAW STRESS HARNESS
  // =========================================================================
  test('8. Rapid Resize Reflow Stress Harness (50 rapid transitions across charts)', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    const result = await evaluateChartTest(page, `
      const lineChart = charts.renderLineChart(container, {
        label: 'Stress Resize Line',
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        series: [
          { name: 'Revenue', tone: 'pine', values: [100, 250, 180, 420, 310, 500] },
          { name: 'Target', tone: 'sky', values: [120, 200, 220, 350, 380, 480], dashed: true },
        ],
        format: (v) => '$' + v,
      });

      // Rapidly fire 50 resize and card:resize events with varying widths
      for (let i = 0; i < 50; i++) {
        const testWidth = 300 + (i % 10) * 50;
        container.style.width = testWidth + 'px';
        container.dispatchEvent(new CustomEvent('card:resize'));
        lineChart.redraw();
      }

      await new Promise(r => requestAnimationFrame(r));
      const svg = container.querySelector('svg');
      const viewBox = svg.getAttribute('viewBox');
      return {
        viewBox,
        hasNaN: container.innerHTML.includes('NaN'),
      };
    `);

    expect(pageErrors).toEqual([]);
    expect(result.hasNaN).toBe(false);
    expect(result.viewBox).toMatch(/^0 0 \d+ \d+$/);
  });
});
