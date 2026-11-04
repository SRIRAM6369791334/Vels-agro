const { chromium } = require('playwright');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/srira/.gemini/antigravity/brain/a72a5efc-e799-4304-9f7e-b027276dd82e';

async function verifyModals() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('1. Checking Coupons Modal (#/promotions/coupons)...');
  await page.goto('http://localhost:5173/#/promotions/coupons', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.click('#promo-new-coupon-btn');
  await page.waitForSelector('dialog.promo-modal[open]');
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'promo_modal_coupons_compact.png') });
  await page.click('dialog.promo-modal[open] [data-close]');
  await page.waitForTimeout(300);

  console.log('2. Checking Discounts Modal (#/promotions/discounts)...');
  await page.goto('http://localhost:5173/#/promotions/discounts', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.click('#promo-new-discount-btn');
  await page.waitForSelector('dialog.promo-modal[open]');
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'promo_modal_discounts_compact.png') });
  await page.click('dialog.promo-modal[open] [data-close]');
  await page.waitForTimeout(300);

  console.log('3. Checking Dealer Schemes Modal (#/promotions/dealers)...');
  await page.goto('http://localhost:5173/#/promotions/dealers', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.click('#promo-new-scheme-btn');
  await page.waitForSelector('dialog.promo-modal[open]');
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'promo_modal_dealers_compact.png') });
  await page.click('dialog.promo-modal[open] [data-close]');
  await page.waitForTimeout(300);

  console.log('4. Checking Banners Modal (#/promotions/banners)...');
  await page.goto('http://localhost:5173/#/promotions/banners', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.click('#promo-new-banner-btn');
  await page.waitForSelector('dialog.promo-modal[open]');
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'promo_modal_banners_compact.png') });
  await page.click('dialog.promo-modal[open] [data-close]');
  await page.waitForTimeout(300);

  console.log('5. Checking Farmers DB Overview (#/customers/farmers)...');
  await page.goto('http://localhost:5173/#/customers/farmers', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'customers_farmers_styled_overview.png') });

  await browser.close();
  console.log('All compact modals and farmers page verified successfully!');
}

verifyModals().catch((err) => {
  console.error('Error verifying modals:', err);
  process.exit(1);
});
