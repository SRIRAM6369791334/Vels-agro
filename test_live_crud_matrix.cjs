const { chromium } = require('./node/node_modules/playwright');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/srira/.gemini/antigravity/brain/dd3077b4-440a-406b-b2ef-96ce9af6058d';

async function run() {
  console.log('=== Step 1: Login as Superadmin & Navigate to Team Settings ===');
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1200 } });

  page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message));
  page.on('response', (res) => {
    if (res.url().includes('/api/v1/')) {
      console.log(`API [${res.request().method()}] ${res.url()} -> Status ${res.status()}`);
    }
  });

  await page.goto('http://localhost:5173/login');
  await page.waitForSelector('#login-email');
  await page.fill('#login-email', 'admin@velsagro.com');
  await page.fill('#login-pass', 'SuperAdmin@123');
  await page.click('#login-submit');
  await page.waitForURL('**/dashboard/overview');

  await page.goto('http://localhost:5173/settings/team');
  await page.waitForSelector('.st-perms');
  await page.waitForTimeout(2000); // Wait for live MySQL API responses

  console.log('✅ Navigated to http://localhost:5173/settings/team.');

  // Check CRUD section headers
  const sectionHeaders = await page.$$('.st-matrix__section-header');
  console.log(`Found ${sectionHeaders.length} CRUD module section headers.`);
  if (sectionHeaders.length < 5) throw new Error('Expected at least 5 CRUD module headers!');

  // Check CRUD badges: C, R, U, D
  const cBadges = await page.$$('.crud-badge--c');
  const rBadges = await page.$$('.crud-badge--r');
  const uBadges = await page.$$('.crud-badge--u');
  const dBadges = await page.$$('.crud-badge--d');
  console.log(`CRUD Badges Found -> C: ${cBadges.length}, R: ${rBadges.length}, U: ${uBadges.length}, D: ${dBadges.length}`);

  // Check that real MySQL roles are loaded in table headers
  const roleHeaders = await page.$$eval('.st-matrix__role', (els) => els.map((e) => e.innerText.replace(/\n/g, ' ')));
  console.log('Loaded MySQL Roles:', roleHeaders);

  // Take screenshot of initial live CRUD matrix
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'live_crud_matrix_initial.png'), fullPage: true });

  console.log('\n=== Step 2: Creating a Role with CRD Preset via Live API ===');
  const createRoleBtn = page.locator('[data-k="tm-add-role"]');
  await createRoleBtn.click();
  await page.waitForSelector('#modal[open], #modal.is-open', { timeout: 3000 });
  await page.waitForTimeout(400);

  const roleName = `Field Dispatcher ${Date.now().toString().slice(-4)}`;
  console.log(`Attempting to create role: "${roleName}"`);
  await page.fill('#modal input[name="name"]', roleName);
  await page.fill('#modal input[name="description"]', 'Handles dispatches with Create, Read and Delete capabilities');
  await page.selectOption('#modal select[name="crudPreset"]', 'crd');

  // Submit and wait for response
  const [createResponse] = await Promise.all([
    page.waitForResponse((res) => res.url().includes('/api/v1/admin/roles') && res.request().method() === 'POST', { timeout: 5000 }),
    page.click('#modal button[type="submit"]'),
  ]);

  console.log(`Create Role API Response status: ${createResponse.status()}`);
  const createJson = await createResponse.json();
  console.log('Create Role Response body:', JSON.stringify(createJson));

  await page.waitForTimeout(2000);

  // Check that role appears in matrix
  const newRoleHeaders = await page.$$eval('.st-matrix__role', (els) => els.map((e) => e.innerText.replace(/\n/g, ' ')));
  console.log('Updated Matrix Headers:', newRoleHeaders);
  const createdFound = newRoleHeaders.some((h) => h.toLowerCase().includes(roleName.toLowerCase()));
  console.log(`Did new role "${roleName}" appear in the live matrix?:`, createdFound);
  if (!createdFound) throw new Error('New role was not found in the matrix after API creation!');

  console.log('\n=== Step 3: Toggling Permission Checkbox & Saving to MySQL ===');
  // Find a checkbox in one of the roles and toggle it
  const targetCb = page.locator('input.st-perm-cb[data-role-id]:not([disabled])').first();
  const parentToggle = page.locator('label.st-perm-toggle').filter({ has: targetCb });
  await parentToggle.scrollIntoViewIfNeeded();
  await parentToggle.click();
  await page.waitForTimeout(400);

  const dirtyBadge = page.locator('[data-k="tm-matrix-dirty"]');
  const saveBtn = page.locator('[data-k="tm-matrix-save"]');
  console.log('Is matrix dirty after toggle?:', await dirtyBadge.isVisible());
  if (!(await saveBtn.isVisible())) throw new Error('Save button should be visible when dirty!');

  // Click Save changes
  console.log('Saving permission changes to MySQL database...');
  await saveBtn.click();
  await page.waitForTimeout(1500);

  console.log('Is matrix dirty badge hidden after save?:', !(await dirtyBadge.isVisible()));

  // Take final screenshot
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'live_crud_matrix_saved.png'), fullPage: true });

  await browser.close();
  console.log('\n🎉 ALL LIVE CRUD MATRIX API INTEGRATION TESTS PASSED!');
}

run().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
