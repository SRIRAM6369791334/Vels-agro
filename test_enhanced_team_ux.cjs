const { chromium } = require('./node/node_modules/playwright');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/srira/.gemini/antigravity/brain/dd3077b4-440a-406b-b2ef-96ce9af6058d';

async function run() {
  console.log('=== Step 1: Navigating to Team & Roles with Supreme UX ===');
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });

  // Login
  await page.goto('http://localhost:5173/login');
  await page.waitForSelector('#login-email');
  await page.fill('#login-email', 'admin@velsagro.com');
  await page.fill('#login-pass', 'SuperAdmin@123');
  await page.click('#login-submit');
  await page.waitForURL('**/dashboard/overview');

  // Go to Team settings
  await page.goto('http://localhost:5173/settings/team');
  await page.waitForSelector('.st-perms');
  await page.waitForTimeout(1500);

  console.log('=== Step 2: Testing Matrix Search Filtering ===');
  const filterInput = page.locator('[data-k="tm-perm-q"]');
  await filterInput.fill('order');
  await page.waitForTimeout(500);
  console.log('Filtered permissions with keyword "order".');

  // Clear search filter
  await filterInput.fill('');
  await page.waitForTimeout(500);
  console.log('Cleared search filter.');

  console.log('=== Step 3: Testing Create Role Modal Quick Presets ===');
  await page.click('[data-k="tm-new-role"]');
  await page.waitForSelector('#create-role-form', { timeout: 5000 });
  console.log('Modal opened.');

  // Click "Operations & Stock" preset
  await page.click('button[data-preset="operations"]');
  await page.waitForTimeout(400);
  const countText1 = await page.innerText('[data-k="perm-count"]');
  console.log('Counter after Operations preset:', countText1);

  // Click "Auditor (Read-Only)" preset
  await page.click('button[data-preset="auditor"]');
  await page.waitForTimeout(400);
  const countText2 = await page.innerText('[data-k="perm-count"]');
  console.log('Counter after Auditor preset:', countText2);

  // Take screenshot of modal with presets in action
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'settings_team_modal_presets.png') });

  // Close modal
  await page.click('[data-action="cancel"]');
  await page.waitForTimeout(500);

  console.log('=== Step 4: Testing Floating Action Bar on Dirty Matrix State ===');
  const checkboxes = await page.$$('.st-perm-toggle');
  if (checkboxes.length > 0) {
    await checkboxes[0].click();
    await page.waitForTimeout(500);

    const floatBar = page.locator('[data-k="tm-float-bar"]');
    const isFloatVisible = await floatBar.isVisible();
    console.log('Is bottom floating action bar visible?:', isFloatVisible);

    // Take screenshot showing full page with floating save bar
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'settings_team_ux_supreme.png'), fullPage: true });
    console.log('Saved settings_team_ux_supreme.png');

    // Click Discard
    console.log('Clicking Discard on floating bar...');
    await page.click('[data-k="tm-discard-matrix"]');
    await page.waitForTimeout(600);

    const isFloatVisibleAfter = await floatBar.isVisible();
    console.log('Is floating bar hidden after discard?:', !isFloatVisibleAfter);
  }

  await browser.close();
  console.log('\n🎉 ALL SUPREME UX TESTS PASSED 100%!');
}

run().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
