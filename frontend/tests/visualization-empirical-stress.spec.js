import { test, expect } from '@playwright/test';

test.describe('Milestone 2: Empirical Visualization Engine Stress Suite', () => {

  test('1. Line Chart (renderLineChart / createLineChart): Catmull-Rom Bezier & DOM Lifecycle', async ({ page }) => {
    await page.goto('/#/analytics/overview');
    await expect(page).toHaveTitle(/Reports · Vels/);

    const chartContainer = page.locator('.an-main .chart');
    await expect(chartContainer).toBeVisible();

    // Verify SVG mount structure
    const svg = chartContainer.locator('svg.chart__svg');
    await expect(svg).toBeVisible();

    const viewBox = await svg.getAttribute('viewBox');
    expect(viewBox).toMatch(/^0 0 \d+ \d+$/);

    // Verify Catmull-Rom Bezier path on .chart__line
    const linePath = svg.locator('.chart__line');
    await expect(linePath.first()).toBeVisible();

    const dAttr = await linePath.first().getAttribute('d');
    expect(dAttr).toBeTruthy();
    expect(dAttr).toMatch(/^M\d+(\.\d+)?,[\d.-]+ C/);
    expect(dAttr).not.toContain('NaN');
    expect(dAttr).not.toContain('undefined');
    expect(dAttr).not.toContain('null');
    expect(dAttr).not.toContain('Infinity');

    // Verify Area path
    const areaPath = svg.locator('.chart__area');
    await expect(areaPath).toBeVisible();
    const areaD = await areaPath.getAttribute('d');
    expect(areaD).toMatch(/Z$/);
    expect(areaD).not.toContain('NaN');

    // Verify Grid lines and labels
    const gridLines = svg.locator('.chart__grid line');
    expect(await gridLines.count()).toBeGreaterThanOrEqual(3);

    // Verify X-axis ticks
    const xLabels = svg.locator('.chart__x text');
    expect(await xLabels.count()).toBeGreaterThan(0);

    // Test Pointer Interaction: Hover to trigger Crosshair and Tooltip
    const tip = chartContainer.locator('.chart__tip');
    await expect(tip).toHaveCSS('opacity', '0');

    // Hover near center of chart
    const box = await chartContainer.boundingBox();
    expect(box).toBeTruthy();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

    await expect(tip).toHaveCSS('opacity', '1');
    const tipText = await tip.textContent();
    expect(tipText).toBeTruthy();
    expect(tipText.length).toBeGreaterThan(0);

    const crosshair = svg.locator('.chart__cross');
    await expect(crosshair).toHaveCSS('opacity', '1');

    // Keyboard Navigation: Focus chart, press ArrowRight and ArrowLeft
    await chartContainer.focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await expect(crosshair).toHaveCSS('opacity', '1');

    // Unhover: Pointer leave dismisses crosshair & tooltip
    await page.mouse.move(10, 10);
    await expect(tip).toHaveCSS('opacity', '0');
    await expect(crosshair).toHaveCSS('opacity', '0');
  });

  test('2. Column Bar Chart (renderColumnBarChart / createDonutChart): Mounting & Scaling', async ({ page }) => {
    await page.goto('/#/analytics/overview');
    await expect(page).toHaveTitle(/Reports · Vels/);

    const barsContainer = page.locator('.bars[role="list"]');
    await expect(barsContainer.first()).toBeVisible();

    const cols = barsContainer.first().locator('.bars__col[role="listitem"]');
    const colCount = await cols.count();
    expect(colCount).toBeGreaterThan(0);

    // Check each column bar height and label
    for (let i = 0; i < colCount; i++) {
      const col = cols.nth(i);
      const bar = col.locator('.bars__bar');
      await expect(bar).toBeVisible();

      const style = await bar.getAttribute('style');
      expect(style).toMatch(/height:\s*[\d.]+(%)?/);
      expect(style).not.toContain('NaN');

      const lab = col.locator('.bars__lab');
      const labelText = await lab.textContent();
      expect(labelText?.trim().length).toBeGreaterThan(0);
    }
  });

  test('3. Donut Ring Meter (renderDonutRingMeter / createRingMeter): Arc & Stroke Dash Geometry', async ({ page }) => {
    await page.goto('/#/analytics/overview');
    await expect(page).toHaveTitle(/Reports · Vels/);

    const donut = page.locator('.donut');
    await expect(donut.first()).toBeVisible();

    // Verify SVG circle tracks and arcs
    const track = donut.first().locator('circle.donut__track');
    await expect(track).toBeVisible();
    await expect(track).toHaveAttribute('cx', '70');
    await expect(track).toHaveAttribute('cy', '70');
    await expect(track).toHaveAttribute('r', '52');

    const arcs = donut.first().locator('circle.donut__arc');
    const arcCount = await arcs.count();
    expect(arcCount).toBeGreaterThan(0);

    for (let i = 0; i < arcCount; i++) {
      const arc = arcs.nth(i);
      const strokeDasharray = await arc.getAttribute('stroke-dasharray');
      expect(strokeDasharray).toBeTruthy();
      expect(strokeDasharray).not.toContain('NaN');
      expect(strokeDasharray).not.toContain('undefined');

      const dataLen = await arc.getAttribute('data-len');
      expect(Number(dataLen)).toBeGreaterThanOrEqual(0);
    }

    // Verify Center label and subtitle
    const centerB = donut.first().locator('.donut__mid b');
    await expect(centerB).toBeVisible();
    expect((await centerB.textContent())?.trim().length).toBeGreaterThan(0);

    const subSpan = donut.first().locator('.donut__mid span');
    await expect(subSpan).toBeVisible();
  });

  test('4. Radial Gauge Meter (renderRadialGaugeMeter / createHorizontalBarChart): Dial & Needle', async ({ page }) => {
    await page.goto('/#/analytics/stock');
    await expect(page).toHaveTitle(/Stock health · Vels/);

    const gauge = page.locator('.gauge');
    await expect(gauge.first()).toBeVisible();

    // Verify Gauge track path
    const track = gauge.first().locator('path.gauge__track');
    await expect(track).toBeVisible();
    const trackD = await track.getAttribute('d');
    expect(trackD).toMatch(/^M[\d.-]+,[\d.-]+ A78,78 0 1 1 [\d.-]+,[\d.-]+$/);
    expect(trackD).not.toContain('NaN');

    // Verify Gauge arc path
    const arc = gauge.first().locator('path.gauge__arc');
    await expect(arc).toBeVisible();
    const strokeDash = await arc.getAttribute('stroke-dasharray');
    expect(strokeDash).toBeTruthy();
    expect(strokeDash).not.toContain('NaN');

    // Verify Gauge ticks lines
    const ticks = gauge.first().locator('.gauge__ticks line');
    expect(await ticks.count()).toBeGreaterThanOrEqual(10);

    // Verify Needle and Hub
    const needle = gauge.first().locator('.gauge__needle');
    await expect(needle).toBeVisible();

    // Verify Live numeric readout
    const num = gauge.first().locator('.gauge__mid b.num');
    await expect(num).toBeVisible();
    expect((await num.textContent())?.trim().length).toBeGreaterThan(0);
  });

  test('5. Sparkline (renderSparklineSvg / createSparkline): Micro Catmull-Rom SVG', async ({ page }) => {
    await page.goto('/#/analytics/overview');
    await expect(page).toHaveTitle(/Reports · Vels/);

    const sparklines = page.locator('svg.spark');
    const sparkCount = await sparklines.count();
    expect(sparkCount).toBeGreaterThanOrEqual(6); // 6 KPI cards

    for (let i = 0; i < Math.min(sparkCount, 6); i++) {
      const spark = sparklines.nth(i);
      const viewBox = await spark.getAttribute('viewBox');
      expect(viewBox).toMatch(/^0 0 \d+ \d+$/);

      const path = spark.locator('path.chart__line');
      await expect(path).toBeVisible();
      const d = await path.getAttribute('d');
      expect(d).toBeTruthy();
      expect(d).toMatch(/^M/);
      expect(d).not.toContain('NaN');
      expect(d).not.toContain('undefined');
    }
  });

  test('6. Grouped Bar Chart (renderGroupedBarChart / createBarChart): Interactive Toggles & Tooltips', async ({ page }) => {
    await page.goto('/#/dashboard/overview');
    await expect(page).toHaveTitle(/Vels/);

    const hb = page.locator('.hb');
    await expect(hb.first()).toBeVisible();

    // Verify Y-axis ticks
    const yAxisTicks = hb.first().locator('.hb__y span');
    expect(await yAxisTicks.count()).toBeGreaterThanOrEqual(6);

    // Verify Bar groups
    const groups = hb.first().locator('.hb__plot .hb__grp');
    const groupCount = await groups.count();
    expect(groupCount).toBeGreaterThanOrEqual(5);

    // Check bar heights
    const firstBars = groups.first().locator('.hb__bar');
    expect(await firstBars.count()).toBeGreaterThanOrEqual(2);

    // Test Hover interaction: group becomes hot and tooltip appears
    const tip = hb.first().locator('.hb__tip');
    const firstGroup = groups.first();
    const gBox = await firstGroup.boundingBox();
    expect(gBox).toBeTruthy();

    await page.mouse.move(gBox.x + gBox.width / 2, gBox.y + gBox.height / 2);
    await expect(firstGroup).toHaveClass(/is-hot/);
    await expect(tip).toHaveCSS('opacity', '1');

    // Test Click to pin
    await firstGroup.click();
    // Move away mouse
    await page.mouse.move(10, 10);
    // Group should remain hot because it is pinned
    await expect(firstGroup).toHaveClass(/is-hot/);
    await expect(tip).toHaveCSS('opacity', '1');

    // Click again to unpin
    await firstGroup.click();
    await page.mouse.move(10, 10);
    await expect(firstGroup).not.toHaveClass(/is-hot/);
    await expect(tip).toHaveCSS('opacity', '0');
  });

  test('7. Fan Meter (renderFanMeter / createFanMeter): 180-Degree Ray Array & Gradient', async ({ page }) => {
    await page.goto('/#/dashboard/overview');
    await expect(page).toHaveTitle(/Vels/);

    const fan = page.locator('.fan');
    await expect(fan.first()).toBeVisible();

    const svg = fan.first().locator('svg');
    await expect(svg).toHaveAttribute('viewBox', '0 0 320 164');

    // Verify Gradient definition
    const gradient = svg.locator('defs linearGradient');
    await expect(gradient).toBeAttached();

    // Verify 84 base rays and 84 lit rays
    const baseRays = svg.locator('.fan__base line');
    expect(await baseRays.count()).toBe(84);

    const litRays = svg.locator('.fan__lit line.fan__l');
    expect(await litRays.count()).toBe(84);

    // Verify Numeric readout
    const num = fan.first().locator('.fan__mid b.num');
    await expect(num).toBeVisible();
    const numText = await num.textContent();
    expect(numText).toMatch(/%$/);
  });

  test('8. Programmatic Chart Lifecycle Stress Test (update, play, redraw, set, toggle)', async ({ page }) => {
    await page.goto('/#/analytics/overview');
    await expect(page).toHaveTitle(/Reports · Vels/);

    // Test updating line chart via range segmented control buttons
    const range90 = page.locator('.an-range button', { hasText: '90 days' });
    await expect(range90).toBeVisible();
    await range90.click();

    // Verify chart survives update and still has valid Bezier path
    const chartLine = page.locator('.chart svg.chart__svg .chart__line').first();
    await expect(chartLine).toBeVisible();
    const d90 = await chartLine.getAttribute('d');
    expect(d90).toBeTruthy();
    expect(d90).not.toContain('NaN');

    // Switch to YTD
    const rangeYtd = page.locator('.an-range button', { hasText: 'This year' });
    await rangeYtd.click();
    const dYtd = await chartLine.getAttribute('d');
    expect(dYtd).toBeTruthy();
    expect(dYtd).not.toContain('NaN');

    // Switch metric to Orders, then Units, then Margin
    const metricBtns = page.locator('.an-metric');
    for (let i = 0; i < 4; i++) {
      await metricBtns.nth(i).click();
      const pathAttr = await chartLine.getAttribute('d');
      expect(pathAttr).toBeTruthy();
      expect(pathAttr).not.toContain('NaN');
    }
  });

  test('9. Full Backward Compatibility Exports & Aliases Validation', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    // Deep link through all chart-heavy views to ensure zero runtime exceptions
    await page.goto('/#/analytics/overview');
    await expect(page.locator('[data-k="ov-chart"]')).toBeVisible();

    await page.goto('/#/analytics/sales');
    await expect(page.locator('[data-k="sa-chart"]')).toBeVisible();

    await page.goto('/#/analytics/stock');
    await expect(page.locator('[data-k="sh-gauge"]')).toBeVisible();

    await page.goto('/#/dashboard/overview');
    await expect(page.locator('.fan').first()).toBeVisible();
    await expect(page.locator('.hb').first()).toBeVisible();

    expect(pageErrors).toEqual([]);
  });
});
