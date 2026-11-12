const { chromium } = require('./node/node_modules/playwright');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/srira/.gemini/antigravity/brain/dd3077b4-440a-406b-b2ef-96ce9af6058d';

async function run() {
  console.log('--- Step 1: Launching Browser & Navigating to Team Settings ---');
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1100 } });

  await page.goto('http://localhost:5173/login');
  await page.waitForSelector('#login-email');
  await page.fill('#login-email', 'admin@velsagro.com');
  await page.fill('#login-pass', 'SuperAdmin@123');
  await page.click('#login-submit');
  await page.waitForURL('**/dashboard/overview');

  await page.goto('http://localhost:5173/settings/team');
  await page.waitForSelector('.st-perms');
  await page.waitForTimeout(1000);

  console.log('✅ Navigated to http://localhost:5173/settings/team.');

  // Verify interactive checkboxes exist
  const checkboxes = await page.$$('.st-perm-cb');
  console.log(`Found ${checkboxes.length} permission checkboxes in matrix.`);
  if (checkboxes.length === 0) throw new Error('No permission checkboxes found in matrix!');

  // Verify owner checkboxes are disabled
  const ownerCb = page.locator('input.st-perm-cb[data-role="owner"]').first();
  const isOwnerDisabled = await ownerCb.isDisabled();
  console.log('Is Owner checkbox disabled?:', isOwnerDisabled);
  if (!isOwnerDisabled) throw new Error('Owner checkbox should be disabled!');

  // Verify create role button exists
  const addRoleBtn = page.locator('[data-k="tm-add-role"]');
  const isAddRoleBtnVisible = await addRoleBtn.isVisible();
  console.log('Is "Create role" button visible?:', isAddRoleBtnVisible);
  if (!isAddRoleBtnVisible) throw new Error('"Create role" button is not visible!');

  // Take screenshot of initial interactive matrix
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'team_interactive_matrix.png'), fullPage: true });

  console.log('\n--- Step 2: Testing Checkbox Interactivity & Dirty State ---');
  // Toggle a staff checkbox (e.g. adjust stock) by clicking the visible label
  const staffAdjustToggle = page.locator('label.st-perm-toggle:has(input[data-role="staff"][data-perm="adjust"])');
  await staffAdjustToggle.scrollIntoViewIfNeeded();
  await staffAdjustToggle.click();
  await page.waitForTimeout(500);

  // Check dirty state
  const dirtyBadge = page.locator('[data-k="tm-matrix-dirty"]');
  const saveBtn = page.locator('[data-k="tm-matrix-save"]');
  const resetBtn = page.locator('[data-k="tm-matrix-reset"]');

  console.log('Dirty badge visible?:', await dirtyBadge.isVisible());
  console.log('Save changes button visible?:', await saveBtn.isVisible());
  console.log('Discard button visible?:', await resetBtn.isVisible());

  if (!(await saveBtn.isVisible())) {
    throw new Error('Save button should be visible when matrix is dirty!');
  }

  // Click Save changes
  console.log('Clicking "Save changes"...');
  await saveBtn.click();
  await page.waitForTimeout(600);
  console.log('Save clicked. Dirty badge hidden?:', !(await dirtyBadge.isVisible()));

  console.log('\n--- Step 3: Testing "Create role" Modal Flow ---');
  await addRoleBtn.click();
  await page.waitForTimeout(600);

  // Check modal
  const modalTitle = page.locator('.mform__title');
  await modalTitle.waitFor({ state: 'visible' });
  console.log('Modal title:', await modalTitle.innerText());

  // Take screenshot of Create Role modal
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'team_create_role_modal.png') });

  // Fill modal
  await page.fill('input[name="name"]', 'Quality Inspector');
  await page.fill('input[name="description"]', 'Performs raw material inspection and certifies finished batches');
  await page.selectOption('select[name="cloneFrom"]', 'manager');

  // Submit modal
  console.log('Submitting new role form...');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1000);

  // Verify new role column exists in matrix
  const newRoleCol = page.locator('.st-matrix__role[data-col^="custom_quality_inspector"]');
  const isNewColVisible = await newRoleCol.isVisible();
  console.log('New role column visible in matrix?:', isNewColVisible);
  if (!isNewColVisible) throw new Error('New role column not found in matrix!');

  // Verify new role filter chip exists
  const newRoleChip = page.locator('.chip[data-role-f^="custom_quality_inspector"]');
  const isChipVisible = await newRoleChip.isVisible();
  console.log('New role filter chip visible?:', isChipVisible);
  if (!isChipVisible) throw new Error('New role filter chip not found!');

  // Take screenshot of updated page with new role
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'team_role_created_saved.png'), fullPage: true });

  await browser.close();
  console.log('\n🎉 ALL STATIC UI TESTS PASSED SUCCESSFULLY!');
}

run().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
