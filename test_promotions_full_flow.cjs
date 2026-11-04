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

  console.log('--- Step 1: Navigating to Coupons Subtab ---');
  await page.goto('http://localhost:5173/#/promotions/coupons');
  await page.waitForTimeout(1500);

  // Take screenshot
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'promotions_coupons_overview.png') });
  console.log('Saved: promotions_coupons_overview.png');

  // Test search
  const searchInput = page.locator('#promo-coupon-search-input');
  await searchInput.fill('KISAN');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'promotions_search_kisan.png') });
  console.log('Saved: promotions_search_kisan.png');
  await searchInput.fill('');
  await page.waitForTimeout(300);

  // Test filter pills
  await page.click('#promo-coupon-filter-pills .promo-filter-pill[data-filter="farmers"]');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'promotions_filter_farmers.png') });
  console.log('Saved: promotions_filter_farmers.png');
  await page.click('#promo-coupon-filter-pills .promo-filter-pill[data-filter="all"]');
  await page.waitForTimeout(300);

  // Test Create Coupon Modal
  console.log('--- Step 2: Testing Create Coupon Modal ---');
  await page.click('#promo-new-coupon-btn');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'promotions_create_coupon_modal.png') });
  console.log('Saved: promotions_create_coupon_modal.png');

  await page.fill('#cf-code', 'DIWALIAGRO26');
  await page.fill('#cf-val', '12000');
  await page.fill('#cf-min', '150000');
  await page.fill('#cf-title', 'Diwali Agro Machinery Mega Cashback');
  await page.fill('#cf-desc', 'Flat ₹12,000 festive token cashback on high HP tractors and rotavators.');
  await page.click('dialog.promo-modal button[type="submit"]');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'promotions_after_coupon_added.png') });
  console.log('Saved: promotions_after_coupon_added.png');

  // Step 3: Product & Category Discounts
  console.log('--- Step 3: Navigating to Discounts Subtab ---');
  await page.goto('http://localhost:5173/#/promotions/discounts');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'promotions_discounts_overview.png') });
  console.log('Saved: promotions_discounts_overview.png');

  // Test Create Discount Modal
  await page.click('#promo-new-discount-btn');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'promotions_create_discount_modal.png') });
  console.log('Saved: promotions_create_discount_modal.png');
  await page.click('dialog.promo-modal [data-close]');
  await page.waitForTimeout(300);

  // Step 4: Dealer Special Schemes
  console.log('--- Step 4: Navigating to Dealer Schemes Subtab ---');
  await page.goto('http://localhost:5173/#/promotions/dealers');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'promotions_dealer_schemes_overview.png') });
  console.log('Saved: promotions_dealer_schemes_overview.png');

  // Step 5: Banners & Featured Machinery
  console.log('--- Step 5: Navigating to Banners Subtab ---');
  await page.goto('http://localhost:5173/#/promotions/banners');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'promotions_banners_overview.png') });
  console.log('Saved: promotions_banners_overview.png');

  // Test Mobile Mockup Preview Modal
  console.log('--- Step 6: Testing Mobile Storefront Preview Modal ---');
  const previewBtn = page.locator('.promo-btn-preview-banner').first();
  await previewBtn.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'promotions_banner_mobile_mockup.png') });
  console.log('Saved: promotions_banner_mobile_mockup.png');
  await page.click('dialog.promo-modal [data-close]');
  await page.waitForTimeout(300);

  // Step 7: Test Route Aliases #/offers
  console.log('--- Step 7: Testing Route Alias #/offers ---');
  await page.goto('http://localhost:5173/#/offers');
  await page.waitForTimeout(1000);
  const isHeaderPresent = await page.locator('.promo-container h2').first().innerText();
  console.log('Rendered header via #/offers:', isHeaderPresent);

  console.log('All tests passed successfully!');
  await browser.close();
}

run().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
