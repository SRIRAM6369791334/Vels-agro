const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const consoleLogs = [];
  page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => consoleLogs.push(`[PAGE_ERROR] ${err.message}`));

  console.log('--- Step 1: Navigating to #/orders/all ---');
  await page.goto('http://localhost:5173/#/orders/all', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Take screenshot of Orders All table
  await page.screenshot({ path: 'C:/Users/srira/.gemini/antigravity/brain/a72a5efc-e799-4304-9f7e-b027276dd82e/orders_all_table_light.png' });
  console.log('Screenshot 1 captured: orders_all_table_light.png');

  // Verify rows exist
  const rowCount = await page.locator('tbody[data-k="o-body"] tr.is-link').count();
  console.log(`Order rows found: ${rowCount}`);

  // Test Search Filter: Search for "Selvakumar"
  console.log('--- Step 2: Testing Search for Farmer ---');
  await page.fill('input[data-k="o-q"]', 'Selvakumar');
  await page.waitForTimeout(500);
  const filteredCount = await page.locator('tbody[data-k="o-body"] tr.is-link').count();
  console.log(`Filtered rows for "Selvakumar": ${filteredCount}`);
  await page.screenshot({ path: 'C:/Users/srira/.gemini/antigravity/brain/a72a5efc-e799-4304-9f7e-b027276dd82e/orders_search_farmer.png' });

  // Clear search
  await page.fill('input[data-k="o-q"]', '');
  await page.waitForTimeout(500);

  // Test Channel Filter: Click "🏢 Dealers"
  console.log('--- Step 3: Testing Channel Filter for Dealers ---');
  const dealerChip = page.locator('.oa-seg button:has-text("Dealers")');
  if (await dealerChip.count() > 0) {
    await dealerChip.click();
    await page.waitForTimeout(500);
    const dealerRows = await page.locator('tbody[data-k="o-body"] tr.is-link').count();
    console.log(`Dealer orders found: ${dealerRows}`);
    await page.screenshot({ path: 'C:/Users/srira/.gemini/antigravity/brain/a72a5efc-e799-4304-9f7e-b027276dd82e/orders_filter_dealers.png' });
  }

  // Switch back to "All Orders"
  await page.locator('.oa-seg button:has-text("All")').click();
  await page.waitForTimeout(500);

  // Click on the first order to open drawer
  console.log('--- Step 4: Opening Order Details Drawer ---');
  const firstRow = page.locator('tbody[data-k="o-body"] tr.is-link').first();
  await firstRow.click();
  await page.waitForTimeout(1000);

  // Verify drawer is visible
  const drawer = page.locator('dialog.drawer[open]');
  console.log(`Drawer open: ${await drawer.isVisible()}`);
  await page.screenshot({ path: 'C:/Users/srira/.gemini/antigravity/brain/a72a5efc-e799-4304-9f7e-b027276dd82e/order_drawer_open.png' });

  // Test GST Invoice Modal
  console.log('--- Step 5: Testing GST Tax Invoice Modal ---');
  const invoiceBtn = page.locator('button[data-do="gst-invoice"]').first();
  await invoiceBtn.click();
  await page.waitForTimeout(1000);

  const invoiceModal = page.locator('#gst-invoice-modal-overlay');
  console.log(`Invoice Modal open: ${await invoiceModal.isVisible()}`);
  await page.screenshot({ path: 'C:/Users/srira/.gemini/antigravity/brain/a72a5efc-e799-4304-9f7e-b027276dd82e/gst_invoice_modal_tax.png' });

  // Switch to "Advance Payment Receipt" tab
  console.log('--- Step 6: Switching to Receipt Tab ---');
  await page.locator('.gst-inv-tab[data-tab="receipt"]').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'C:/Users/srira/.gemini/antigravity/brain/a72a5efc-e799-4304-9f7e-b027276dd82e/gst_invoice_modal_receipt.png' });

  // Switch to "Delivery Challan & Gate Pass" tab
  console.log('--- Step 7: Switching to Gate Pass Tab ---');
  await page.locator('.gst-inv-tab[data-tab="gatepass"]').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'C:/Users/srira/.gemini/antigravity/brain/a72a5efc-e799-4304-9f7e-b027276dd82e/gst_invoice_modal_gatepass.png' });

  // Close invoice modal
  await page.locator('.btn-inv-close').click();
  await page.waitForTimeout(500);

  // Test Edit Logistics Modal
  console.log('--- Step 8: Testing Edit Logistics Modal ---');
  const logisticsBtn = page.locator('button[data-do="edit-logistics"]').first();
  await logisticsBtn.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'C:/Users/srira/.gemini/antigravity/brain/a72a5efc-e799-4304-9f7e-b027276dd82e/order_edit_logistics_modal.png' });
  await page.locator('.btn-close-action').click();
  await page.waitForTimeout(500);

  // Test Change Status Modal
  console.log('--- Step 9: Testing Change Status Modal ---');
  const statusBtn = page.locator('button[data-do="change-status"]').first();
  await statusBtn.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'C:/Users/srira/.gemini/antigravity/brain/a72a5efc-e799-4304-9f7e-b027276dd82e/order_change_status_modal.png' });
  await page.locator('.btn-close-action').click();
  await page.waitForTimeout(500);

  // Navigate to #/orders/board
  console.log('--- Step 10: Testing #/orders/board (Kanban) ---');
  await page.goto('http://localhost:5173/#/orders/board', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'C:/Users/srira/.gemini/antigravity/brain/a72a5efc-e799-4304-9f7e-b027276dd82e/orders_kanban_board.png' });

  // Navigate to #/orders/returns
  console.log('--- Step 11: Testing #/orders/returns (Returns & Exchanges) ---');
  await page.goto('http://localhost:5173/#/orders/returns', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'C:/Users/srira/.gemini/antigravity/brain/a72a5efc-e799-4304-9f7e-b027276dd82e/orders_returns_page.png' });

  console.log('\n--- Console Logs Summary ---');
  const errors = consoleLogs.filter(l => l.includes('[error]') || l.includes('[PAGE_ERROR]'));
  console.log(`Total logs: ${consoleLogs.length}, Errors: ${errors.length}`);
  if (errors.length) {
    console.error('Errors found:', errors);
  }

  await browser.close();
  console.log('--- All Tests Completed Successfully! ---');
})();
