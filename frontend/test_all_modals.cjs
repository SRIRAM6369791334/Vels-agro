const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // 1. Check Add Category Modal
  await page.goto('http://localhost:5173/#/categories/list', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.click('#btn-add-main-cat');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'frontend/verify_add_category_modal.png' });
  await page.click('.btn-close-modal');
  await page.waitForTimeout(300);

  // 2. Check Add Subcategory Modal
  await page.goto('http://localhost:5173/#/categories/sub', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.click('#btn-add-sub-cat');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'frontend/verify_add_subcategory_modal.png' });
  await page.click('.btn-close-modal');
  await page.waitForTimeout(300);

  // 3. Check Add Model Modal
  await page.goto('http://localhost:5173/#/categories/brands', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.click('#btn-add-model');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'frontend/verify_add_model_modal.png' });

  await browser.close();
  console.log('Done verifying all 3 modals!');
})();
