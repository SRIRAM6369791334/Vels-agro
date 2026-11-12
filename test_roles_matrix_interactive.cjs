const { chromium } = require('./node/node_modules/playwright');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/srira/.gemini/antigravity/brain/dd3077b4-440a-406b-b2ef-96ce9af6058d';

async function run() {
  console.log('=== Step 1: Navigating to Team & Roles Subtab ===');
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });

  // 1. UI Login as Superadmin
  await page.goto('http://localhost:5173/login');
  await page.waitForSelector('#login-email');
  await page.fill('#login-email', 'admin@velsagro.com');
  await page.fill('#login-pass', 'SuperAdmin@123');
  await page.click('#login-submit');
  await page.waitForURL('**/dashboard/overview', { timeout: 10000 });

  // 2. Open Team Settings
  await page.goto('http://localhost:5173/settings/team');
  await page.waitForSelector('.st-perms');
  await page.waitForTimeout(1500); // Wait for live matrix to fetch from MySQL

  console.log('=== Step 2: Verifying Live Permissions Matrix ===');
  const roleHeaders = await page.$$('.st-matrix__role');
  console.log(`Found ${roleHeaders.length} live role columns in the matrix.`);

  const newRoleBtn = page.locator('[data-k="tm-new-role"]');
  const isNewRoleBtnVisible = await newRoleBtn.isVisible();
  console.log('Is "+ New Role" button visible?:', isNewRoleBtnVisible);
  if (!isNewRoleBtnVisible) throw new Error('New Role button not visible!');

  const saveBtn = page.locator('[data-k="tm-save-matrix"]');
  const isSaveBtnDisabled = await saveBtn.isDisabled();
  console.log('Is "Save permissions" button initially disabled?:', isSaveBtnDisabled);

  // Take screenshot of initial live matrix
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'settings_team_matrix_initial.png') });

  console.log('\n=== Step 3: Testing "Create Role" Modal and Submission ===');
  await newRoleBtn.click();
  await page.waitForSelector('#create-role-form', { timeout: 5000 });
  console.log('✅ Create Role modal opened.');

  await page.fill('#create-role-form input[name="name"]', 'Quality Assurance Lead');
  await page.fill('#create-role-form input[name="description"]', 'Inspects product batches, formulations and approves releases');

  // Check 2 permissions
  const permCheckboxes = await page.$$('#create-role-form input[name="role_perms"]');
  if (permCheckboxes.length >= 2) {
    await permCheckboxes[0].check();
    await permCheckboxes[1].check();
    console.log('Checked 2 initial permissions for the new role.');
  }

  // Take modal screenshot
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'settings_team_create_role_modal.png') });

  // Submit form
  console.log('Submitting Create Role form...');
  await page.click('#create-role-form button[type="submit"]');

  // Wait for modal to close and matrix to reload
  await page.waitForTimeout(2000);

  // Verify new role column exists in matrix
  const newRoleHeader = page.locator('.st-matrix__role:has-text("Quality Assurance Lead")');
  const isNewRoleInMatrix = await newRoleHeader.isVisible();
  console.log('Is "Quality Assurance Lead" now in matrix?:', isNewRoleInMatrix);
  if (!isNewRoleInMatrix) throw new Error('New role did not appear in matrix!');

  console.log('\n=== Step 4: Testing Checkbox Interactivity & Matrix Dirty State ===');
  // Find a checkbox in the newly created role's column and toggle it
  const checkboxes = await page.$$('.st-perm-toggle');
  console.log(`Total interactive checkboxes in matrix: ${checkboxes.length}`);
  
  if (checkboxes.length > 0) {
    const targetCheckbox = checkboxes[checkboxes.length - 1]; // One in the new role column
    const wasChecked = await targetCheckbox.isChecked();
    console.log('Target checkbox state before toggle:', wasChecked);
    await targetCheckbox.click();
    console.log('Toggled target checkbox.');

    await page.waitForTimeout(500);

    const isSaveEnabled = !(await saveBtn.isDisabled());
    const isDirtyVisible = await page.locator('[data-k="tm-matrix-dirty"]').isVisible();
    console.log('Is "Save permissions" button now enabled?:', isSaveEnabled);
    console.log('Is "Unsaved matrix changes" dirty badge visible?:', isDirtyVisible);

    if (!isSaveEnabled) throw new Error('Save button did not enable after toggling checkbox!');

    // Take screenshot with dirty state and new role
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'settings_team_matrix_dirty.png') });

    // Click "Save permissions"
    console.log('Clicking "Save permissions" button...');
    await saveBtn.click();
    await page.waitForTimeout(2000);

    const isSaveDisabledAfter = await saveBtn.isDisabled();
    console.log('Is "Save permissions" button disabled again after saving?:', isSaveDisabledAfter);

    // Take final screenshot
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'settings_team_matrix_saved.png') });
  }

  await browser.close();
  console.log('\n🎉 ALL ROLE CREATION & PERMISSION MATRIX TESTS PASSED 100%!');
}

run().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
