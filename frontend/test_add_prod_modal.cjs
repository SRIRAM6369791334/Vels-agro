const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.text().includes('Uncaught') || msg.text().includes('TypeError')) {
      consoleErrors.push(msg.text());
      console.error('[Browser Error]', msg.text());
    }
  });

  await page.goto('http://localhost:5173/#/products/catalog', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Click "+ Add Product" button
  console.log('Clicking "+ Add Product"...');
  await page.click('#btn-add-agro-prod');
  await page.waitForTimeout(500);

  // Check if modal is visible
  const isOpen = await page.locator('#modal[open]').isVisible();
  console.log('Modal is open:', isOpen);

  // Fill in form and click save
  await page.fill('#prod-in-name', 'Vels Laser Land Leveler 7 Ft');
  await page.selectOption('#prod-in-cat', 'Implements');
  await page.fill('#prod-in-sku', 'VELS-LEVL-07');
  await page.click('#btn-save-prod-modal');
  await page.waitForTimeout(600);

  // Check if modal closed
  const isClosed = !(await page.locator('#modal[open]').isVisible());
  console.log('Modal closed after save:', isClosed);

  await browser.close();
  console.log('Test completed! Total console errors:', consoleErrors.length);
  process.exit(consoleErrors.length > 0 ? 1 : 0);
})();
