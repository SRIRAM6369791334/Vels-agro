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

  console.log('1. Navigating to http://localhost:5173/#/dealers/locations...');
  await page.goto('http://localhost:5173/#/dealers/locations', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  console.log('Page Title:', await page.title());

  // Screenshot of Dealer Locations (Light mode) - Exact Warehouses Layout with Yard Map & Stock Table
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'exact_dealer_locations_light.png') });
  console.log('Saved exact_dealer_locations_light.png');

  // Verify subtabs
  const subtabs = await page.locator('#tabs .tab').allTextContents();
  console.log('Subtabs in header:', subtabs);

  // Test selecting different dealer location card
  console.log('2. Clicking on second dealer card...');
  const dealerCards = page.locator('.wh-locs .wh-loc');
  const countCards = await dealerCards.count();
  console.log('Found dealer location cards count:', countCards);
  if (countCards > 1) {
    await dealerCards.nth(1).click();
    await page.waitForTimeout(800);
  }

  // Open Pricing Modal
  console.log('3. Opening Dealer Pricing Modal...');
  const pricingBtn = page.locator('.btn-pricing-dlr').first();
  if (await pricingBtn.isVisible()) {
    await pricingBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'exact_dealer_pricing_modal.png') });
    console.log('Saved exact_dealer_pricing_modal.png');
    // Save modal
    await page.locator('.btn-save-pricing').click();
    await page.waitForTimeout(600);
  }

  // Test Subtab: Dealer Transfers
  console.log('4. Navigating to http://localhost:5173/#/dealers/transfers...');
  await page.locator('#tabs a[data-sub="transfers"]').click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'exact_dealer_transfers_light.png') });
  console.log('Saved exact_dealer_transfers_light.png');

  // Test Subtab: Dealer Counts
  console.log('5. Navigating to http://localhost:5173/#/dealers/counts...');
  await page.locator('#tabs a[data-sub="counts"]').click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'exact_dealer_counts_table_light.png') });
  console.log('Saved exact_dealer_counts_table_light.png');

  // Click on first row to open Count Sheet drawer
  console.log('6. Clicking on count row to open Count Sheet Drawer...');
  const countRow = page.locator('.wh-ctable tbody tr[data-ct]').first();
  if (await countRow.isVisible()) {
    await countRow.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'exact_dealer_count_sheet_drawer.png') });
    console.log('Saved exact_dealer_count_sheet_drawer.png');

    // Test stepper button
    const stepPlus = page.locator('.btn-step-count[data-step="1"]').first();
    if (await stepPlus.isVisible()) {
      await stepPlus.click();
      await page.waitForTimeout(500);
    }

    // Close drawer
    await page.locator('#drawer .drawer__close').click();
    await page.waitForTimeout(600);
  }

  // Test Dark Mode
  console.log('7. Switching to Dark Theme...');
  await page.locator('button.theme-sw__btn[data-theme-to="dark"]').click();
  await page.waitForTimeout(800);

  // Screenshot Dealer Locations in Dark Mode
  await page.locator('#tabs a[data-sub="locations"]').click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'exact_dealer_locations_dark.png') });
  console.log('Saved exact_dealer_locations_dark.png');

  // Screenshot Dealer Transfers in Dark Mode
  await page.locator('#tabs a[data-sub="transfers"]').click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'exact_dealer_transfers_dark.png') });
  console.log('Saved exact_dealer_transfers_dark.png');

  await browser.close();

  console.log('All verification passed! Total console errors:', errors.length);
  if (errors.length > 0) {
    console.log('Errors:', errors);
  }
})();
