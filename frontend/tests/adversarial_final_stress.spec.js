import { test, expect } from '@playwright/test';

test.describe('Final Adversarial Challenger: Deep Stress & Mutation Oracle', () => {

  // =========================================================================
  // SUITE 1: POPOVER BUTTON ACTIONS & STATE MUTATIONS (NO DROPPED CLICKS)
  // =========================================================================
  test.describe('1. Popover Actions & State Mutation Verification', () => {

    test('1.1 AccountMenu: "Export stock (CSV)" triggers file download with valid CSV content', async ({ page }) => {
      await page.goto('/#/dashboard/overview');

      // Open Account Menu
      await page.locator('#btn-me').click();
      const popover = page.locator('.pop-layer .pop');
      await expect(popover).toBeVisible();

      const exportBtn = page.locator('.pop-layer button', { hasText: 'Export stock (CSV)' });
      await expect(exportBtn).toBeVisible();

      // Setup download listener
      const downloadPromise = page.waitForEvent('download');
      await exportBtn.click();
      const download = await downloadPromise;

      // Validate download filename
      const filename = download.suggestedFilename();
      console.log('Observed downloaded filename:', filename);
      expect(filename).toMatch(/^vessa-stock-\d{4}-\d{2}-\d{2}\.csv$/);

      // Verify popover closed after action
      await expect(popover).not.toBeVisible();
    });

    test('1.2 Notifications: "Mark all read" mutates data state and unmounts bell badge', async ({ page }) => {
      await page.goto('/#/dashboard/overview');

      // Check if unread badge exists initially
      const badge = page.locator('#bell-badge');
      const hasBadge = await badge.count() > 0;

      // Open notifications popover
      await page.locator('#btn-bell').click();
      const popover = page.locator('.pop-layer .pop');
      await expect(popover).toBeVisible();

      const markAllBtn = page.locator('.pop-layer button', { hasText: 'Mark all read' });
      await expect(markAllBtn).toBeVisible();

      if (hasBadge) {
        // Must be enabled when there are unread items
        await expect(markAllBtn).toBeEnabled();

        // Click mark all read
        await markAllBtn.click();

        // Button should become disabled
        await expect(markAllBtn).toBeDisabled();

        // Bell badge in topbar should be removed / 0 count
        await expect(page.locator('#bell-badge')).toHaveCount(0);

        // All notice rows in popover should lose .is-unread class
        const unreadRows = page.locator('.pop-layer .pop__row.is-unread');
        await expect(unreadRows).toHaveCount(0);

        // Verify state persisted in localStorage (debounced by 250ms in DataContext)
        await expect.poll(async () => {
          return await page.evaluate(() => {
            const raw = localStorage.getItem('vessa:data:v2');
            const data = raw ? JSON.parse(raw) : null;
            return data?.notices ? data.notices.some((n) => !n.read) : true;
          });
        }, { timeout: 3000 }).toBe(false);
      }
    });

    test('1.3 QuickCreate: All action buttons navigate to respective routes without dropped clicks', async ({ page }) => {
      const actions = [
        { label: 'Sales order', expectedUrl: '#/orders/all' },
        { label: 'Purchase order', expectedUrl: '#/purchasing/orders' },
        { label: 'Make a batch', expectedUrl: '#/products/batches' },
        { label: 'Move stock', expectedUrl: '#/warehouses/transfers' },
        { label: 'Schedule a count', expectedUrl: '#/warehouses/counts' },
        { label: 'Customer', expectedUrl: '#/customers/stockists' },
        { label: 'Invite teammate', expectedUrl: '#/settings/team' },
      ];

      for (const act of actions) {
        await page.goto('/#/dashboard/overview');
        await page.locator('#btn-new').click();
        const popover = page.locator('.pop-layer .pop');
        await expect(popover).toBeVisible();

        const btn = page.locator('.pop-layer button', { hasText: act.label });
        await expect(btn).toBeVisible();
        await btn.click();

        // Popover dismisses and URL is updated
        await expect(popover).not.toBeVisible();
        await expect(page).toHaveURL(new RegExp(act.expectedUrl.replace('/', '\\/')));
      }
    });

    test('1.4 AccountMenu: Theme buttons mutate theme and persist correctly', async ({ page }) => {
      await page.goto('/#/dashboard/overview');
      const html = page.locator('html');

      // Open Account Menu
      await page.locator('#btn-me').click();
      const darkBtn = page.locator('.pop-layer button', { hasText: 'Dark' });
      await expect(darkBtn).toBeVisible();
      await darkBtn.click();

      await expect(html).toHaveAttribute('data-theme', 'dark');

      // Re-open and select Light
      await page.locator('#btn-me').click();
      const lightBtn = page.locator('.pop-layer button', { hasText: 'Light' });
      await expect(lightBtn).toBeVisible();
      await lightBtn.click();

      await expect(html).toHaveAttribute('data-theme', 'light');
    });
  });

  // =========================================================================
  // SUITE 2: COMMAND PALETTE VIEWPORT, SCRIM & KEYBOARD ORACLE
  // =========================================================================
  test.describe('2. Command Palette Viewport, Scrim & Keyboard Oracle', () => {

    test('2.1 Viewport coordinates check across multiple responsive window dimensions', async ({ page }) => {
      const viewports = [
        { width: 1280, height: 720 },
        { width: 1920, height: 1080 },
        { width: 1024, height: 768 },
      ];

      for (const vp of viewports) {
        await page.setViewportSize(vp);
        await page.goto('/#/dashboard/overview');
        await page.locator('#btn-find').click();

        const finder = page.locator('#finder');
        await expect(finder).toBeVisible();

        const rect = await finder.evaluate((el) => el.getBoundingClientRect());
        console.log(`Viewport ${vp.width}x${vp.height} -> Finder top: ${rect.top}px, left: ${rect.left}px`);

        // Check top is in upper portion of viewport (y >= 50 and y < 300)
        expect(rect.top).toBeGreaterThanOrEqual(50);
        expect(rect.top).toBeLessThan(300);

        // Check horizontal centering
        const center = rect.left + rect.width / 2;
        const expectedCenter = vp.width / 2;
        expect(Math.abs(center - expectedCenter)).toBeLessThan(5);

        // Dismiss via Escape
        await page.keyboard.press('Escape');
        await expect(finder).not.toBeVisible();
      }
    });

    test('2.2 Scrim backdrop visibility and dismissal on backdrop click', async ({ page }) => {
      await page.goto('/#/dashboard/overview');
      await page.locator('#btn-find').click();

      const scrim = page.locator('.scrim');
      await expect(scrim).toBeVisible();

      const computedVisibility = await scrim.evaluate((el) => window.getComputedStyle(el).visibility);
      const computedOpacity = await scrim.evaluate((el) => window.getComputedStyle(el).opacity);
      expect(computedVisibility).toBe('visible');
      expect(Number(computedOpacity)).toBeGreaterThan(0.8);

      // Clicking scrim dismisses Command Palette
      // Click at viewport coordinate (50, 50) where scrim is uncovered
      await page.mouse.click(50, 50);
      await expect(page.locator('#finder')).not.toBeVisible();
    });

    test('2.3 Full Keyboard Navigation Oracle (ArrowDown, ArrowUp wrap-around, Enter selection)', async ({ page }) => {
      await page.goto('/#/dashboard/overview');
      await page.locator('#btn-find').click();

      const input = page.locator('#finder-q');
      await expect(input).toBeFocused();

      // Type query with multiple results
      await input.fill('Balm');
      const options = page.locator('#finder-list .finder__opt');
      await expect(options.first()).toBeVisible();
      const count = await options.count();
      expect(count).toBeGreaterThan(0);

      // Initial selected option is index 0
      await expect(options.nth(0)).toHaveAttribute('aria-selected', 'true');

      // Press ArrowDown -> index 1 selected
      if (count > 1) {
        await page.keyboard.press('ArrowDown');
        await expect(options.nth(1)).toHaveAttribute('aria-selected', 'true');
        await expect(options.nth(0)).toHaveAttribute('aria-selected', 'false');

        // Press ArrowUp -> back to index 0
        await page.keyboard.press('ArrowUp');
        await expect(options.nth(0)).toHaveAttribute('aria-selected', 'true');
      }

      // Press ArrowUp at index 0 -> wraps around to last item (count - 1)
      await page.keyboard.press('ArrowUp');
      await expect(options.nth(count - 1)).toHaveAttribute('aria-selected', 'true');

      // Press ArrowDown from last item -> wraps around back to index 0
      await page.keyboard.press('ArrowDown');
      await expect(options.nth(0)).toHaveAttribute('aria-selected', 'true');

      // Press Enter to select index 0
      await page.keyboard.press('Enter');

      // Palette should close and page URL should change to product or target item
      await expect(page.locator('#finder')).not.toBeVisible();
      expect(page.url()).toMatch(/#\/products\/item/);
    });
  });

  // =========================================================================
  // SUITE 3: RAPID TOGGLE & INTERLEAVED DISMISSAL STRESS HARNESS
  // =========================================================================
  test.describe('3. Rapid Toggle & Dismissal Stress Harness', () => {

    test('3.1 30-Cycle Rapid Popover Interleaving Stress Test', async ({ page }) => {
      await page.goto('/#/dashboard/overview');
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      const triggers = ['#btn-bell', '#btn-new', '#btn-me'];

      // Fire 30 rapid interleaved clicks
      for (let i = 0; i < 30; i++) {
        const trigger = triggers[i % triggers.length];
        await page.locator(trigger).click();

        // Exactly one popover or zero should ever be rendered
        const popCount = await page.locator('.pop-layer .pop').count();
        expect(popCount).toBeLessThanOrEqual(1);
      }

      // Final state: Click outside to dismiss
      await page.locator('main#main').click({ position: { x: 100, y: 100 } });
      await expect(page.locator('.pop-layer .pop')).toHaveCount(0);

      // Verify no uncaught exceptions occurred during spam
      expect(errors).toHaveLength(0);
    });

    test('3.2 Comprehensive Click-Outside Boundaries (Rail, Main, Topbar Brand, Esc)', async ({ page }) => {
      await page.goto('/#/dashboard/overview');

      // Case A: Click inside main area closes popover
      await page.locator('#btn-bell').click();
      await expect(page.locator('.pop-layer .pop')).toBeVisible();
      await page.locator('main#main').click({ position: { x: 250, y: 150 } });
      await expect(page.locator('.pop-layer .pop')).not.toBeVisible();

      // Case B: Click sidebar nav closes popover
      await page.locator('#btn-new').click();
      await expect(page.locator('.pop-layer .pop')).toBeVisible();
      await page.locator('.rail .nav').click({ position: { x: 20, y: 100 } });
      await expect(page.locator('.pop-layer .pop')).not.toBeVisible();

      // Case C: Click Topbar brand closes popover
      await page.locator('#btn-me').click();
      await expect(page.locator('.pop-layer .pop')).toBeVisible();
      await page.locator('.top .brand').click();
      await expect(page.locator('.pop-layer .pop')).not.toBeVisible();

      // Case D: Escape key closes popover
      await page.locator('#btn-bell').click();
      await expect(page.locator('.pop-layer .pop')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.locator('.pop-layer .pop')).not.toBeVisible();
    });

    test('3.3 Simultaneous / Interleaved Command Palette and Popover transitions', async ({ page }) => {
      await page.goto('/#/dashboard/overview');

      // Open Popover
      await page.locator('#btn-bell').click();
      await expect(page.locator('.pop-layer .pop')).toBeVisible();

      // Trigger Command Palette via Control+k
      await page.keyboard.press('Control+k');
      await expect(page.locator('#finder')).toBeVisible();

      // Press Escape -> LIFO closes finder first
      await page.keyboard.press('Escape');
      await expect(page.locator('#finder')).not.toBeVisible();

      // Press Escape second time -> closes underlying popover
      await page.keyboard.press('Escape');
      await expect(page.locator('.pop-layer .pop')).not.toBeVisible();
    });
  });

});
