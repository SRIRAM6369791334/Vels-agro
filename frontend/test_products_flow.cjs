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

  console.log('1. Navigating to http://localhost:5173/#/products/catalog...');
  await page.goto('http://localhost:5173/#/products/catalog', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Check Category chips
  const catChips = await page.locator('.pc-cats .chip').allTextContents();
  console.log('Category chips:', catChips);

  // Screenshot Catalog Light
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'products_catalog_grid_light.png') });
  console.log('Saved products_catalog_grid_light.png');

  // Test Category filter - Tractors
  console.log('2. Clicking "Tractors" category filter chip...');
  await page.click('.pc-cats .chip[data-cat="Tractors"]');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'products_catalog_tractors_filter.png') });
  console.log('Saved products_catalog_tractors_filter.png');

  // Test Category filter - Spares
  console.log('3. Clicking "Spares" category filter chip...');
  await page.click('.pc-cats .chip[data-cat="Spares"]');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'products_catalog_spares_filter.png') });
  console.log('Saved products_catalog_spares_filter.png');

  // Reset to All
  await page.click('.pc-cats .chip[data-cat="all"]');
  await page.waitForTimeout(400);

  // Test Add Product Modal
  console.log('4. Opening "+ Add Product" modal...');
  await page.click('#btn-add-agro-prod');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'products_add_modal.png') });
  console.log('Saved products_add_modal.png');

  // Close modal
  await page.evaluate(() => document.querySelector('#modal')?.close());
  await page.waitForTimeout(300);

  // Navigate to Product Item Detail
  console.log('5. Navigating to product item detail: #/products/item/vels-trac-55...');
  await page.goto('http://localhost:5173/#/products/item/vels-trac-55', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'product_item_detail_light.png') });
  console.log('Saved product_item_detail_light.png');

  // Test Edit Product from Item Detail
  console.log('6. Testing "Edit Product" on item detail page...');
  await page.click('[data-do="edit-prod"]');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'product_item_edit_modal.png') });
  console.log('Saved product_item_edit_modal.png');
  await page.evaluate(() => document.querySelector('#modal')?.close());
  await page.waitForTimeout(400);

  // Test Dark Mode
  console.log('7. Testing Dark Theme...');
  await page.locator('button.theme-sw__btn[data-theme-to="dark"]').click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'product_item_detail_dark.png') });
  console.log('Saved product_item_detail_dark.png');

  // Dark Catalog
  await page.goto('http://localhost:5173/#/products/catalog', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'products_catalog_grid_dark.png') });
  console.log('Saved products_catalog_grid_dark.png');

  // Reset to Light
  await page.locator('button.theme-sw__btn[data-theme-to="light"]').click();
  await page.waitForTimeout(300);

  await browser.close();
  console.log('All tests completed successfully! Console error count:', errors.length);
})();
