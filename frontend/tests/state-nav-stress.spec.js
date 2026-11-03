import { test, expect } from '@playwright/test';

test.describe('Challenger 1: State & Navigation Stress Suite', () => {

  const primaryRoutes = [
    { hash: '#/dashboard/overview', expectedTitle: 'Dashboard · Vels', selector: 'text=Units on hand' },
    { hash: '#/products/catalog', expectedTitle: 'Catalog · Vels', selector: 'text=Showing 12 of 12 products' },
    { hash: '#/orders/board', expectedTitle: 'Order board · Vels', selector: 'text=Pick' },
    { hash: '#/purchasing/orders', expectedTitle: 'Purchase orders · Vels', selector: 'text=Purchase orders' },
    { hash: '#/warehouses/locations', expectedTitle: 'Locations · Vels', selector: 'text=Riverside DC' },
    { hash: '#/analytics/overview', expectedTitle: 'Reports · Vels', selector: 'text=Annual Gross Revenue' },
    { hash: '#/customers/stockists', expectedTitle: 'Stockists · Vels', selector: 'text=Stockists' },
    { hash: '#/settings/account', expectedTitle: 'Account · Vels', selector: 'text=User Account' },
    { hash: '#/help/center', expectedTitle: 'Help center · Vels', selector: 'text=Help center' },
  ];

  const subtabRoutes = [
    { hash: '#/dashboard/activity', expectedTitle: 'Activity · Vels' },
    { hash: '#/dashboard/alerts', expectedTitle: 'Alerts · Vels' },
    { hash: '#/products/batches', expectedTitle: 'Batches · Vels' },
    { hash: '#/orders/all', expectedTitle: 'All orders · Vels' },
    { hash: '#/orders/returns', expectedTitle: 'Returns · Vels' },
    { hash: '#/purchasing/suppliers', expectedTitle: 'Suppliers · Vels' },
    { hash: '#/purchasing/materials', expectedTitle: 'Materials · Vels' },
    { hash: '#/warehouses/transfers', expectedTitle: 'Transfers · Vels' },
    { hash: '#/warehouses/counts', expectedTitle: 'Counts · Vels' },
    { hash: '#/analytics/sales', expectedTitle: 'Sales · Vels' },
    { hash: '#/analytics/stock', expectedTitle: 'Stock health · Vels' },
    { hash: '#/customers/shoppers', expectedTitle: 'Shoppers · Vels' },
    { hash: '#/settings/company', expectedTitle: 'Company · Vels' },
    { hash: '#/settings/team', expectedTitle: 'Team & roles · Vels' },
    { hash: '#/settings/billing', expectedTitle: 'Billing · Vels' },
    { hash: '#/settings/notifications', expectedTitle: 'Notifications · Vels' },
    { hash: '#/help/tickets', expectedTitle: 'My tickets · Vels' },
  ];

  test('SN-01: Deep-linking direct load on all 9 primary routes', async ({ page }) => {
    for (const r of primaryRoutes) {
      await page.goto(r.hash);
      await expect(page).toHaveTitle(r.expectedTitle);
      
      // Verify exact middle dot character code \u00B7 (183)
      const title = await page.title();
      expect(title).toContain('\u00B7');
      const dotIndex = title.indexOf('\u00B7');
      expect(title.charCodeAt(dotIndex)).toBe(183);

      // Verify DOM landmark
      await expect(page.locator(r.selector).first()).toBeVisible();
    }
  });

  test('SN-02: Deep-linking to all 17 secondary subtabs and title synchronization', async ({ page }) => {
    for (const r of subtabRoutes) {
      await page.goto(r.hash);
      await expect(page).toHaveTitle(r.expectedTitle);
      const title = await page.title();
      expect(title).toContain('\u00B7');
      expect(title.endsWith(' · Vels')).toBeTruthy();
    }
  });

  test('SN-03: Section redirect behavior for bare section URLs', async ({ page }) => {
    const sectionRedirects = [
      { from: '#/', to: '#/dashboard/overview' },
      { from: '#/dashboard', to: '#/dashboard/overview' },
      { from: '#/products', to: '#/products/catalog' },
      { from: '#/orders', to: '#/orders/all' },
      { from: '#/purchasing', to: '#/purchasing/orders' },
      { from: '#/warehouses', to: '#/warehouses/locations' },
      { from: '#/analytics', to: '#/analytics/overview' },
      { from: '#/customers', to: '#/customers/stockists' },
      { from: '#/settings', to: '#/settings/account' },
      { from: '#/help', to: '#/help/center' },
    ];

    for (const { from, to } of sectionRedirects) {
      await page.goto(from);
      await page.waitForURL(`**/${to}`);
      expect(page.url()).toContain(to);
    }
  });

  test('SN-04: Browser History traversal (Back & Forward) across routes', async ({ page }) => {
    const sequence = [
      { hash: '#/dashboard/overview', expectedTitle: 'Dashboard · Vels' },
      { hash: '#/products/catalog', expectedTitle: 'Catalog · Vels' },
      { hash: '#/orders/board', expectedTitle: 'Order board · Vels' },
      { hash: '#/warehouses/locations', expectedTitle: 'Locations · Vels' },
      { hash: '#/settings/account', expectedTitle: 'Account · Vels' },
    ];

    // Navigate sequentially
    await page.goto(sequence[0].hash);
    for (let i = 1; i < sequence.length; i++) {
      await page.evaluate((h) => { window.location.hash = h; }, sequence[i].hash);
      await expect(page).toHaveTitle(sequence[i].expectedTitle);
    }

    // Step backwards through history
    for (let i = sequence.length - 2; i >= 0; i--) {
      await page.goBack();
      await expect(page).toHaveTitle(sequence[i].expectedTitle);
      expect(page.url()).toContain(sequence[i].hash);
    }

    // Step forwards through history
    for (let i = 1; i < sequence.length; i++) {
      await page.goForward();
      await expect(page).toHaveTitle(sequence[i].expectedTitle);
      expect(page.url()).toContain(sequence[i].hash);
    }
  });

  test('SN-05: Rapid hash-navigation stress testing (30 rapid transitions)', async ({ page }) => {
    await page.goto('#/dashboard/overview');
    const hashes = [
      '#/products/catalog',
      '#/orders/board',
      '#/purchasing/orders',
      '#/warehouses/locations',
      '#/analytics/overview',
      '#/customers/stockists',
      '#/settings/account',
      '#/help/center',
      '#/dashboard/activity',
      '#/products/batches'
    ];

    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    // Rapidly alternate hash
    for (let i = 0; i < 30; i++) {
      const targetHash = hashes[i % hashes.length];
      await page.evaluate((h) => { window.location.hash = h; }, targetHash);
    }

    // Settle on orders board
    await page.evaluate(() => { window.location.hash = '#/orders/board'; });
    await expect(page).toHaveTitle('Order board · Vels');
    await expect(page.locator('text=Pick')).toBeVisible();

    expect(errors).toHaveLength(0);
  });

  test('SN-06: Theme toggle, DOM data-theme attribute, and localStorage persistence', async ({ page }) => {
    await page.goto('#/dashboard/overview');
    const html = page.locator('html');
    const darkBtn = page.locator('button[data-theme-to="dark"]');
    const lightBtn = page.locator('button[data-theme-to="light"]');

    // Toggle to Dark
    await darkBtn.click();
    await expect(html).toHaveAttribute('data-theme', 'dark');

    // Verify localStorage format (JSON-stringified as per vanilla spec)
    const storedDark = await page.evaluate(() => localStorage.getItem('Vels:theme'));
    expect(storedDark).toBe('"dark"');

    // Full page reload to test cold-boot persistence from localStorage
    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'dark');

    // Toggle back to Light
    await lightBtn.click();
    await expect(html).toHaveAttribute('data-theme', 'light');

    const storedLight = await page.evaluate(() => localStorage.getItem('Vels:theme'));
    expect(storedLight).toBe('"light"');

    // Full page reload to verify light persistence
    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'light');
  });

  test('SN-07: Cold boot with pre-set localStorage theme', async ({ browser }) => {
    // Fresh context with dark theme pre-loaded before any scripts execute
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.addInitScript(() => {
      localStorage.setItem('Vels:theme', JSON.stringify('dark'));
    });

    await page.goto('http://localhost:5173/#/dashboard/overview');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'dark');

    await context.close();
  });

  test('SN-08: Corrupted localStorage resilience', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    // Seed invalid unparseable JSON into localStorage
    await page.addInitScript(() => {
      localStorage.setItem('Vels:theme', '{invalid-json:');
      localStorage.setItem('Vels:side', 'invalid-boolean');
      localStorage.setItem('Vels:accent', '#invalid');
    });

    await page.goto('http://localhost:5173/#/dashboard/overview');
    
    // Page must remain functional and not crash
    await expect(page.locator('.top .brand')).toBeVisible();
    await expect(page).toHaveTitle(/Dashboard · Vels/);

    expect(errors).toHaveLength(0);
    await context.close();
  });

  test('SN-09: Sidebar state collapse toggle & localStorage persistence', async ({ page }) => {
    await page.goto('#/dashboard/overview');
    const html = page.locator('html');
    const sideBtn = page.locator('#btn-side');

    // Initial state: not side-open
    await expect(html).not.toHaveClass(/side-open/);

    // Click collapse toggle
    await sideBtn.click();
    await expect(html).toHaveClass(/side-open/);
    const sideStored = await page.evaluate(() => localStorage.getItem('Vels:side'));
    expect(sideStored).toBe('1');

    // Reload page
    await page.reload();
    await expect(html).toHaveClass(/side-open/);

    // Toggle back
    await sideBtn.click();
    await expect(html).not.toHaveClass(/side-open/);
    const sideClosed = await page.evaluate(() => localStorage.getItem('Vels:side'));
    expect(sideClosed).toBe('0');
  });

  test('SN-10: Adversarial unknown route inspection redirects to dashboard overview', async ({ page }) => {
    await page.goto('#/unknown-route-404');
    await expect(page).toHaveURL(/#\/dashboard\/overview/);
    await expect(page).toHaveTitle(/Vels/);
  });

});
