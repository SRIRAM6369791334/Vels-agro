const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

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

  console.log('--- Step 1: Navigating to Payments Subtab ---');
  await page.goto('http://localhost:5173/#/orders/payments');
  await page.waitForTimeout(1500);

  // Screenshot payments subtab
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'payments_subtab_overview.png') });
  console.log('Saved: payments_subtab_overview.png');

  // Test search filter
  const searchInput = page.locator('#ps-search-input');
  await searchInput.fill('Muthuvelan');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'payments_search_muthuvelan.png') });
  console.log('Saved: payments_search_muthuvelan.png');
  await searchInput.fill('');
  await page.waitForTimeout(300);

  // Test filter pills
  await page.click('.ps-filter-pill[data-filter="failed"]');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'payments_filter_failed.png') });
  console.log('Saved: payments_filter_failed.png');

  await page.click('.ps-filter-pill[data-filter="all"]');
  await page.waitForTimeout(300);

  // Test View Details modal
  console.log('--- Step 2: Testing Payment Details Modal ---');
  const detailsBtn = page.locator('.ps-btn-view-txn').first();
  await detailsBtn.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'payment_details_modal.png') });
  console.log('Saved: payment_details_modal.png');
  await page.click('dialog.ps-modal [data-close]');
  await page.waitForTimeout(300);

  // Test Reconcile All
  console.log('--- Step 3: Testing Reconcile All Accounts ---');
  await page.click('#ps-reconcile-all-btn');
  await page.waitForTimeout(600);

  // Test Record Manual Receipt modal
  console.log('--- Step 4: Testing Record Manual Receipt Modal ---');
  await page.click('#ps-new-payment-btn');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'payment_record_receipt_modal.png') });
  console.log('Saved: payment_record_receipt_modal.png');
  await page.fill('#mf-order', '#AG-1088');
  await page.fill('#mf-amount', '150000');
  await page.fill('#mf-payer', 'Murugappa Agro Traders');
  await page.fill('#mf-ref', 'UTR-HDFC2611099881');
  await page.click('dialog.ps-modal button[type="submit"]');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'payments_after_receipt_added.png') });
  console.log('Saved: payments_after_receipt_added.png');

  // Test Shipments Subtab
  console.log('--- Step 5: Navigating to Shipments Subtab ---');
  await page.goto('http://localhost:5173/#/orders/shipments');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'shipments_subtab_overview.png') });
  console.log('Saved: shipments_subtab_overview.png');

  // Test Live GPS Tracking Modal
  console.log('--- Step 6: Testing Live GPS Tracking Modal ---');
  const trackBtn = page.locator('.ps-btn-track-gps').first();
  await trackBtn.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'shipment_gps_tracking_modal.png') });
  console.log('Saved: shipment_gps_tracking_modal.png');
  await page.click('dialog.ps-modal [data-close]');
  await page.waitForTimeout(300);

  // Test Update Shipment Status Modal
  console.log('--- Step 7: Testing Update Shipment Status Modal ---');
  const updateBtn = page.locator('.ps-btn-update-status').first();
  await updateBtn.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'shipment_update_status_modal.png') });
  console.log('Saved: shipment_update_status_modal.png');
  await page.click('dialog.ps-modal [data-close]');
  await page.waitForTimeout(300);

  // Test Create Dispatch Challan Modal
  console.log('--- Step 8: Testing Create Dispatch Challan Modal ---');
  await page.click('#ps-create-shipment-btn');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'shipment_create_challan_modal.png') });
  console.log('Saved: shipment_create_challan_modal.png');
  await page.click('dialog.ps-modal [data-close]');
  await page.waitForTimeout(300);

  // Test Top-level Aliases: #/payments and #/shipments
  console.log('--- Step 9: Testing Route Aliases #/payments and #/shipments ---');
  await page.goto('http://localhost:5173/#/payments');
  await page.waitForTimeout(1000);
  const isPaymentsActive = await page.locator('[data-sub="payments"]:not([hidden]) h2').innerText();
  console.log('Route #/payments rendered header:', isPaymentsActive);

  await page.goto('http://localhost:5173/#/shipments');
  await page.waitForTimeout(1000);
  const isShipmentsActive = await page.locator('[data-sub="shipments"]:not([hidden]) h2').innerText();
  console.log('Route #/shipments rendered header:', isShipmentsActive);

  // Test existing routes still function 100%
  console.log('--- Step 10: Verifying Old Routes ---');
  await page.goto('http://localhost:5173/#/orders/all');
  await page.waitForTimeout(1000);
  const ordersCount = await page.locator('.oa-table tr').count();
  console.log('Orders table row count on #/orders/all:', ordersCount);

  await page.goto('http://localhost:5173/#/orders/board');
  await page.waitForTimeout(1000);
  const kanbanColumns = await page.locator('.ob-col').count();
  console.log('Kanban columns count on #/orders/board:', kanbanColumns);

  await page.goto('http://localhost:5173/#/orders/returns');
  await page.waitForTimeout(1000);
  const returnsCount = await page.locator('.or-table tr').count();
  console.log('Returns table row count on #/orders/returns:', returnsCount);

  console.log('All tests completed successfully!');
  await browser.close();
}

run().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
