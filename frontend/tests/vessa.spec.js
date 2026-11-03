import { test, expect } from '@playwright/test';

test.describe('Vessa Skincare Lab - Full E2E & Functionality Suite', () => {

  test('1. Shell & Dashboard loads with KPI metrics', async ({ page }) => {
    await page.goto('/#/dashboard/overview');
    await expect(page).toHaveTitle(/Vessa/);

    // Verify Brand
    const brand = page.locator('.top .brand');
    await expect(brand).toBeVisible();
    await expect(brand).toContainText('Vessa');
    await expect(brand).toContainText('Marlow & Fern');

    // Verify KPI Cards in Welcome section
    await expect(page.locator('text=Units on hand')).toBeVisible();
    await expect(page.locator('text=Total stock value')).toBeVisible();
    await expect(page.locator('text=Low stock items')).toBeVisible();

    // Verify Overview regions
    await expect(page.locator('text=Inventory statistics')).toBeVisible();
    await expect(page.locator('text=Sales overview')).toBeVisible();
    await expect(page.locator('text=Recent activities')).toBeVisible();
    await expect(page.locator('text=Top sellers')).toBeVisible();
  });

  test('2. Navigation across all main sections & subtabs', async ({ page }) => {
    // Products
    await page.goto('/#/products/catalog');
    await expect(page).toHaveTitle(/Catalog · Vessa/);
    await expect(page.locator('text=Showing 12 of 12 products')).toBeVisible();

    // Batches
    await page.goto('/#/products/batches');
    await expect(page).toHaveTitle(/Batches · Vessa/);

    // Orders All
    await page.goto('/#/orders/all');
    await expect(page).toHaveTitle(/All orders · Vessa/);

    // Orders Board
    await page.goto('/#/orders/board');
    await expect(page).toHaveTitle(/Order board · Vessa/);

    // Purchasing Orders
    await page.goto('/#/purchasing/orders');
    await expect(page).toHaveTitle(/Purchase orders · Vessa/);

    // Warehouses Locations
    await page.goto('/#/warehouses/locations');
    await expect(page).toHaveTitle(/Locations · Vessa/);

    // Analytics Overview
    await page.goto('/#/analytics/overview');
    await expect(page).toHaveTitle(/Reports · Vessa/);

    // Customers Stockists
    await page.goto('/#/customers/stockists');
    await expect(page).toHaveTitle(/Stockists · Vessa/);

    // Settings Account
    await page.goto('/#/settings/account');
    await expect(page).toHaveTitle(/Account · Vessa/);

    // Help Center
    await page.goto('/#/help/center');
    await expect(page).toHaveTitle(/Help center · Vessa/);
  });

  test('3. Theme toggle between Light and Dark mode', async ({ page }) => {
    await page.goto('/#/dashboard/overview');

    const html = page.locator('html');
    const darkBtn = page.locator('button[data-theme-to="dark"]');
    const lightBtn = page.locator('button[data-theme-to="light"]');

    // Switch to dark
    await darkBtn.click();
    await expect(html).toHaveAttribute('data-theme', 'dark');

    // Switch back to light
    await lightBtn.click();
    await expect(html).toHaveAttribute('data-theme', 'light');
  });

  test('4. Command Palette (Search ⌘K) opens and filters', async ({ page }) => {
    await page.goto('/#/dashboard/overview');

    const searchBtn = page.locator('#btn-find');
    await searchBtn.click();

    const finder = page.locator('#finder');
    await expect(finder).toBeVisible();

    const input = page.locator('#finder-q');
    await expect(input).toBeFocused();

    // Type query
    await input.fill('Balm');
    await expect(page.locator('#finder-list')).toContainText('Calendula Rescue Balm');

    // Close on Escape
    await page.keyboard.press('Escape');
    await expect(finder).not.toBeVisible();
  });

  test('5. Notifications panel opens with alerts', async ({ page }) => {
    await page.goto('/#/dashboard/overview');

    const bellBtn = page.locator('#btn-bell');
    await bellBtn.click();

    const popover = page.locator('.pop-layer');
    await expect(popover).toBeVisible();
    await expect(popover).toContainText('Notifications');
    await expect(popover).toContainText('See every alert');

    // Close on Escape
    await page.keyboard.press('Escape');
  });

  test('6. Create New Menu opens all quick actions', async ({ page }) => {
    await page.goto('/#/dashboard/overview');

    const newBtn = page.locator('#btn-new');
    await newBtn.click();

    const popover = page.locator('.pop-layer');
    await expect(popover).toBeVisible();
    await expect(popover).toContainText('Sales order');
    await expect(popover).toContainText('Purchase order');
    await expect(popover).toContainText('Make a batch');
    await expect(popover).toContainText('Move stock');

    // Close on Escape
    await page.keyboard.press('Escape');
  });

  test('7. Account Menu & Sidebar collapse toggle', async ({ page }) => {
    await page.goto('/#/dashboard/overview');

    // Account menu
    const meBtn = page.locator('#btn-me');
    await meBtn.click();

    const popover = page.locator('.pop-layer');
    await expect(popover).toBeVisible();
    await expect(popover).toContainText('Account settings');
    await expect(popover).toContainText('Keyboard shortcuts');
    await expect(popover).toContainText('Export stock (CSV)');

    await page.keyboard.press('Escape');

    // Sidebar collapse toggle
    const sideToggle = page.locator('#btn-side');
    await sideToggle.click();
    const html = page.locator('html');
    await expect(html).toHaveClass(/side-open/);

    await sideToggle.click();
    await expect(html).not.toHaveClass(/side-open/);
  });

});
