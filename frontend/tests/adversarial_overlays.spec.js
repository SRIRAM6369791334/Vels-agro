import { test, expect } from '@playwright/test';

test.describe('Adversarial Overlay & Interaction Suite', () => {

  // --- 1. COMMAND PALETTE (#finder) ---
  test.describe('1. Command Palette (#finder)', () => {
    test('1.1 Auto-focus on #finder-q when opened via #btn-find', async ({ page }) => {
      await page.goto('/#/dashboard/overview');
      await page.locator('#btn-find').click();

      const finder = page.locator('#finder');
      await expect(finder).toBeVisible();

      const input = page.locator('#finder-q');
      await expect(input).toBeFocused();
    });

    test('1.2 Keyboard shortcut (Control+k or Meta+k) toggles palette', async ({ page }) => {
      await page.goto('/#/dashboard/overview');
      // Ensure page body has focus
      await page.locator('body').click();

      // Trigger shortcut
      await page.keyboard.press('Control+k');
      const finder = page.locator('#finder');
      await expect(finder).toBeVisible();

      const input = page.locator('#finder-q');
      await expect(input).toBeFocused();

      // Pressing Control+k again should toggle it off
      await page.keyboard.press('Control+k');
      await expect(finder).not.toBeVisible();
    });

    test('1.3 Search filtering: matches, case insensitivity, trimming, empty state', async ({ page }) => {
      await page.goto('/#/dashboard/overview');
      await page.locator('#btn-find').click();
      const input = page.locator('#finder-q');

      // Test lowercase / substring
      await input.fill('balm');
      const list = page.locator('#finder-list');
      await expect(list).toContainText('Calendula Rescue Balm');

      // Test case insensitivity
      await input.fill('bALm');
      await expect(list).toContainText('Calendula Rescue Balm');

      // Test whitespace trimming
      await input.fill('  balm  ');
      await expect(list).toContainText('Calendula Rescue Balm');

      // Test non-matching query
      await input.fill('xyz123_nonexistent_query');
      await expect(page.locator('.empty__title')).toContainText('Nothing matches');

      // Clear query restores default items
      await input.fill('');
      await expect(list).toContainText('Pages');
      await expect(list).toContainText('Products');
    });

    test('1.4 Dismissal: Escape key dismisses palette', async ({ page }) => {
      await page.goto('/#/dashboard/overview');

      await page.locator('#btn-find').click();
      await expect(page.locator('#finder')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.locator('#finder')).not.toBeVisible();
    });

    test('1.5 [REMEDIATED] Command palette vertical position is anchored in viewport (y < 300px)', async ({ page }) => {
      await page.goto('/#/dashboard/overview');
      await page.locator('#btn-find').click();
      await expect(page.locator('#finder')).toBeVisible();

      const rect = await page.locator('#finder').evaluate((el) => el.getBoundingClientRect());
      console.log('Observed Finder Bounding Rect:', JSON.stringify(rect));

      expect(rect.top).toBeGreaterThanOrEqual(50);
      expect(rect.top).toBeLessThan(300);
    });

    test('1.6 [REMEDIATED] Scrim backdrop has computed visibility: visible', async ({ page }) => {
      await page.goto('/#/dashboard/overview');
      await page.locator('#btn-find').click();
      await expect(page.locator('#finder')).toBeVisible();

      const visibility = await page.locator('.scrim').evaluate((el) => {
        return window.getComputedStyle(el).visibility;
      });
      console.log('Observed scrim visibility:', visibility);

      expect(visibility).toBe('visible');
    });
  });

  // --- 2. FLOATING POPOVERS (.pop-layer) ---
  test.describe('2. Floating Popovers (.pop-layer)', () => {
    test('2.1 Bell Notifications opens, has aria-expanded, and dismisses on Escape', async ({ page }) => {
      await page.goto('/#/dashboard/overview');
      const bellBtn = page.locator('#btn-bell');
      await bellBtn.click();

      await expect(bellBtn).toHaveAttribute('aria-expanded', 'true');
      const popover = page.locator('.pop-layer .pop');
      await expect(popover).toBeVisible();
      await expect(popover).toContainText('Notifications');

      await page.keyboard.press('Escape');
      await expect(popover).not.toBeVisible();
      await expect(bellBtn).toHaveAttribute('aria-expanded', 'false');
    });

    test('2.2 Quick Create opens, has aria-expanded, and dismisses on Escape', async ({ page }) => {
      await page.goto('/#/dashboard/overview');
      const newBtn = page.locator('#btn-new');
      await newBtn.click();

      await expect(newBtn).toHaveAttribute('aria-expanded', 'true');
      const popover = page.locator('.pop-layer .pop');
      await expect(popover).toBeVisible();
      await expect(popover).toContainText('Sales order');

      await page.keyboard.press('Escape');
      await expect(popover).not.toBeVisible();
      await expect(newBtn).toHaveAttribute('aria-expanded', 'false');
    });

    test('2.3 Account Menu opens, has aria-expanded, and dismisses on Escape', async ({ page }) => {
      await page.goto('/#/dashboard/overview');
      const meBtn = page.locator('#btn-me');
      await meBtn.click();

      await expect(meBtn).toHaveAttribute('aria-expanded', 'true');
      const popover = page.locator('.pop-layer .pop');
      await expect(popover).toBeVisible();
      await expect(popover).toContainText('Account settings');

      await page.keyboard.press('Escape');
      await expect(popover).not.toBeVisible();
      await expect(meBtn).toHaveAttribute('aria-expanded', 'false');
    });

    test('2.4 Mutual exclusivity and toggle behavior', async ({ page }) => {
      await page.goto('/#/dashboard/overview');

      // Toggle Bell open then closed via repeated click
      const bellBtn = page.locator('#btn-bell');
      await bellBtn.click();
      await expect(page.locator('.pop-layer .pop')).toBeVisible();
      await bellBtn.click();
      await expect(page.locator('.pop-layer .pop')).not.toBeVisible();

      // Open Bell then open Quick Create: only ONE popover in .pop-layer
      await bellBtn.click();
      await expect(page.locator('.pop-layer .pop')).toContainText('Notifications');
      const newBtn = page.locator('#btn-new');
      await newBtn.click();
      await expect(page.locator('.pop-layer .pop')).toContainText('Sales order');
      await expect(page.locator('.pop-layer .pop')).toHaveCount(1);
    });

    test('2.5 Dismissal on outside backdrop click', async ({ page }) => {
      await page.goto('/#/dashboard/overview');
      await page.locator('#btn-bell').click();
      await expect(page.locator('.pop-layer .pop')).toBeVisible();

      // Click outside in main body area
      await page.locator('main#main').click({ position: { x: 200, y: 200 } });
      await expect(page.locator('.pop-layer .pop')).not.toBeVisible();
    });

    test('2.6 [REMEDIATED] Clicking inside popover fires action without premature pointerdown unmount', async ({ page }) => {
      await page.goto('/#/dashboard/overview');

      // Open Quick Create and click 'Sales order'
      await page.locator('#btn-new').click();
      const salesOrderBtn = page.locator('.pop-layer button', { hasText: 'Sales order' });
      await expect(salesOrderBtn).toBeVisible();
      await salesOrderBtn.click();

      // Clicks are dispatched to handler; navigates to #/orders/all
      const currentUrl = page.url();
      console.log('Observed URL after clicking Sales order in popover:', currentUrl);
      expect(currentUrl).toContain('#/orders/all');
    });

    test('2.7 [REMEDIATED] Passive click inside popover header does not dismiss popover', async ({ page }) => {
      await page.goto('/#/dashboard/overview');
      await page.locator('#btn-bell').click();
      await expect(page.locator('.pop-layer .pop')).toBeVisible();

      // Click on non-interactive header title "Notifications"
      await page.locator('.pop-layer .pop__title').click();

      // Popover remains open after passive click inside
      const isVisible = await page.locator('.pop-layer .pop').isVisible();
      console.log('Popover visible after clicking title:', isVisible);
      expect(isVisible).toBe(true);
    });
  });

  // --- 3. SIDEBAR COLLAPSE & STATE SYNC ---
  test.describe('3. Sidebar Collapse & State Sync', () => {
    test('3.1 #btn-side toggles side-open on <html> and updates aria attributes', async ({ page }) => {
      await page.goto('/#/dashboard/overview');
      const html = page.locator('html');
      const sideBtn = page.locator('#btn-side');

      // Ensure initial state
      await expect(html).not.toHaveClass(/side-open/);
      await expect(sideBtn).toHaveAttribute('aria-pressed', 'false');

      // First click: expands/opens
      await sideBtn.click();
      await expect(html).toHaveClass(/side-open/);
      await expect(sideBtn).toHaveAttribute('aria-pressed', 'true');

      // Check localStorage
      const sideStorageOpen = await page.evaluate(() => localStorage.getItem('Vels:side'));
      expect(sideStorageOpen).toBe('1');

      // Second click: collapses/closes
      await sideBtn.click();
      await expect(html).not.toHaveClass(/side-open/);
      await expect(sideBtn).toHaveAttribute('aria-pressed', 'false');

      const sideStorageClosed = await page.evaluate(() => localStorage.getItem('Vels:side'));
      expect(sideStorageClosed).toBe('0');
    });

    test('3.2 Sidebar open state persists across page reloads', async ({ page }) => {
      await page.goto('/#/dashboard/overview');
      const html = page.locator('html');
      const sideBtn = page.locator('#btn-side');

      // Toggle to open
      await sideBtn.click();
      await expect(html).toHaveClass(/side-open/);

      // Reload
      await page.reload();
      await expect(html).toHaveClass(/side-open/);

      // Clean up: toggle back to closed
      await page.locator('#btn-side').click();
      await expect(html).not.toHaveClass(/side-open/);

      // Reload to verify closed persists
      await page.reload();
      await expect(html).not.toHaveClass(/side-open/);
    });

    test('3.3 Rapid toggle stress test (10 rapid clicks)', async ({ page }) => {
      await page.goto('/#/dashboard/overview');
      const html = page.locator('html');
      const sideBtn = page.locator('#btn-side');

      for (let i = 0; i < 10; i++) {
        await sideBtn.click();
      }
      // After 10 clicks (even number), it should be back to initial (not side-open)
      await expect(html).not.toHaveClass(/side-open/);
    });
  });

  // --- 4. REMEDIATION REGRESSION SUITE ---
  test.describe('4. Remediation Parity & Regression Suite', () => {
    test('4.1 Stockist link in Command Palette navigates to #/customers/stockists', async ({ page }) => {
      await page.goto('/#/dashboard/overview');
      await page.locator('#btn-find').click();
      await page.locator('#finder-q').fill('Juniper');
      const stockistOpt = page.locator('#finder-list .finder__opt', { hasText: 'Stockist · Portland, OR' });
      await expect(stockistOpt).toBeVisible();
      await stockistOpt.click();

      await expect(page).toHaveURL(/#\/customers\/stockists/);
      await expect(page.locator('h3', { hasText: 'Juniper & Moss Apothecary' })).toBeVisible();
    });

    test('4.2 Wildcard route fallback redirects unknown paths to /dashboard/overview', async ({ page }) => {
      await page.goto('/#/nonexistent-path-404');
      await expect(page).toHaveURL(/#\/dashboard\/overview/);
      await expect(page.locator('#btn-bell')).toBeVisible();
    });

    test('4.3 Bell badge conditionally rendered and hides when count is 0', async ({ page }) => {
      await page.goto('/#/dashboard/overview');
      const bellBadge = page.locator('#bell-badge');
      const initialCount = await bellBadge.count();
      if (initialCount > 0) {
        await expect(bellBadge).toBeVisible();
        await page.locator('#btn-bell').click();
        const markAllReadBtn = page.locator('.pop button', { hasText: 'Mark all read' });
        await expect(markAllReadBtn).toBeVisible();
        await markAllReadBtn.click();
        await expect(page.locator('#bell-badge')).toHaveCount(0);
      }
    });

    test('4.4 Command Palette ArrowDown and Enter keyboard navigation', async ({ page }) => {
      await page.goto('/#/dashboard/overview');
      await page.locator('#btn-find').click();
      await page.locator('#finder-q').fill('Orders');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      await expect(page.locator('#finder')).not.toBeVisible();
      await expect(page).toHaveURL(/#\/orders/);
    });
  });
});

