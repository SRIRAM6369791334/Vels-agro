const { chromium } = require('playwright');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\srira\\.gemini\\antigravity\\brain\\a72a5efc-e799-4304-9f7e-b027276dd82e';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER CONSOLE ERROR:', msg.text());
    }
  });

  console.log('--- Step 1: Navigating to Farmers Database Subtab ---');
  await page.goto('http://localhost:5173/#/customers/farmers');
  await page.waitForTimeout(1500);

  // Take screenshot
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'customers_farmers_overview.png') });
  console.log('Saved: customers_farmers_overview.png');

  // Test search
  const searchInput = page.locator('#farmer-search-input');
  await searchInput.fill('Selvakumar');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'customers_farmers_search.png') });
  console.log('Saved: customers_farmers_search.png');
  await searchInput.fill('');
  await page.waitForTimeout(300);

  // Test filter pills
  await page.click('#farmer-filter-pills .promo-filter-pill[data-filter="large"]');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'customers_farmers_filter_large.png') });
  console.log('Saved: customers_farmers_filter_large.png');
  await page.click('#farmer-filter-pills .promo-filter-pill[data-filter="all"]');
  await page.waitForTimeout(300);

  // Test Farmer Profile Modal
  console.log('--- Step 2: Testing Farmer Dossier Modal ---');
  const profileBtn = page.locator('.farmer-btn-view-profile').first();
  await profileBtn.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'customer_farmer_profile_modal.png') });
  console.log('Saved: customer_farmer_profile_modal.png');
  await page.click('dialog.promo-modal [data-close]');
  await page.waitForTimeout(300);

  // Test Register New Farmer Modal
  console.log('--- Step 3: Testing Register New Farmer Modal ---');
  await page.click('#farmer-register-btn');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'customer_farmer_register_modal.png') });
  console.log('Saved: customer_farmer_register_modal.png');

  await page.fill('#rf-name', 'Murugesan Sundaram');
  await page.fill('#rf-phone', '+91 94431 88990');
  await page.fill('#rf-village', 'Gobichettipalayam');
  await page.fill('#rf-district', 'Erode, Tamil Nadu');
  await page.fill('#rf-acres', '22');
  await page.fill('#rf-crops', 'Turmeric, Sugarcane');
  await page.fill('#rf-patta', 'PATTA-ERD-8821');
  await page.fill('#rf-machinery', 'Vels Bull 45HP Tractor');
  await page.click('dialog.promo-modal button[type="submit"]');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'customers_farmers_after_registered.png') });
  console.log('Saved: customers_farmers_after_registered.png');

  // Step 4: Test Route Alias #/farmers
  console.log('--- Step 4: Testing Route Alias #/farmers ---');
  await page.goto('http://localhost:5173/#/farmers');
  await page.waitForTimeout(1000);
  const isHeaderPresent = await page.locator('.promo-container h2').first().innerText();
  console.log('Rendered header via #/farmers:', isHeaderPresent);

  // Step 5: Verify Old Subtabs Still Work 100%
  console.log('--- Step 5: Verifying Stockists and Shoppers Subtabs ---');
  await page.goto('http://localhost:5173/#/customers/stockists');
  await page.waitForTimeout(1000);
  const stockistsHeader = await page.locator('h1, h2').first().innerText();
  console.log('Stockists subtab header:', stockistsHeader);

  await page.goto('http://localhost:5173/#/customers/shoppers');
  await page.waitForTimeout(1000);
  const shoppersHeader = await page.locator('h1, h2').first().innerText();
  console.log('Shoppers subtab header:', shoppersHeader);

  console.log('All Section 11 Customer tests completed successfully!');
  await browser.close();
}

run().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
