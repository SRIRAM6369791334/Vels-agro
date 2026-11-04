const { chromium } = require('@playwright/test');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/srira/.gemini/antigravity/brain/a72a5efc-e799-4304-9f7e-b027276dd82e';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.error('[Browser Error]', msg.text());
    }
  });

  console.log('1. Navigating to http://localhost:5173/#/dashboard/overview...');
  await page.goto('http://localhost:5173/#/dashboard/overview', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Verify sidebar ordering
  const navItems = await page.locator('.rail .nav__track > .nav__item span').allTextContents();
  console.log('Sidebar nav items in order:', navItems.slice(0, 5));

  // Click Categories in sidebar
  console.log('2. Clicking "Categories" in sidebar...');
  await page.locator('a[data-route="categories"]').click();
  await page.waitForTimeout(1200);

  console.log('Current URL:', page.url());
  console.log('Page Title:', await page.title());

  // Screenshot of Categories List (Light mode)
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'categories_list_light.png') });
  console.log('Saved categories_list_light.png');

  // Verify subtabs
  const subtabs = await page.locator('#tabs .tab').allTextContents();
  console.log('Subtabs in header:', subtabs);

  // Test Quick Re-order button
  console.log('3. Testing Re-order button on second category...');
  const moveUpBtn = page.locator('.btn-reorder-up').nth(1);
  if (await moveUpBtn.isVisible()) {
    await moveUpBtn.click();
    await page.waitForTimeout(600);
  }

  // Test Subtab: Sub-categories
  console.log('4. Navigating to Sub-categories (#/categories/sub)...');
  await page.locator('#tabs a[data-sub="sub"]').click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'categories_sub_table_light.png') });
  console.log('Saved categories_sub_table_light.png');

  // Open "View Products" drawer
  console.log('5. Clicking "View Products" to open slide-in drawer...');
  const viewProdsBtn = page.locator('.btn-view-sub-prods').first();
  if (await viewProdsBtn.isVisible()) {
    await viewProdsBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'categories_sub_drawer.png') });
    console.log('Saved categories_sub_drawer.png');
    // Close drawer
    await page.locator('#drawer .drawer__close').click();
    await page.waitForTimeout(500);
  }

  // Test Subtab: Brands & Model Compatibility Matrix
  console.log('6. Navigating to Brand Compatibility Matrix (#/categories/brands)...');
  await page.locator('#tabs a[data-sub="brands"]').click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'categories_brand_matrix_light.png') });
  console.log('Saved categories_brand_matrix_light.png');

  // Test Matrix Cell Toggle
  console.log('7. Toggling matrix cell compatibility...');
  const matrixCell = page.locator('.btn-toggle-rule').first();
  if (await matrixCell.isVisible()) {
    await matrixCell.click();
    await page.waitForTimeout(600);
  }

  // Switch to Dark Theme
  console.log('8. Testing Dark Theme...');
  await page.locator('button.theme-sw__btn[data-theme-to="dark"]').click();
  await page.waitForTimeout(800);

  // Screenshot Matrix in Dark Mode
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'categories_brand_matrix_dark.png') });
  console.log('Saved categories_brand_matrix_dark.png');

  // Screenshot Main Categories in Dark Mode
  await page.locator('#tabs a[data-sub="list"]').click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'categories_list_dark.png') });
  console.log('Saved categories_list_dark.png');

  await browser.close();

  console.log('All categories tests completed! Console errors count:', errors.length);
  if (errors.length > 0) {
    console.log('Errors:', errors);
  }
})();
