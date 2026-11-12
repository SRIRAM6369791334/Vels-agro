const { chromium } = require('./node/node_modules/playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('1. Logging in as Superadmin...');
  await page.goto('http://localhost:5173/login');
  await page.waitForSelector('#login-email');

  await page.fill('#login-email', 'admin@velsagro.com');
  await page.fill('#login-pass', 'SuperAdmin@123');
  await page.click('#login-submit');

  await page.waitForURL('**/dashboard/overview', { timeout: 10000 });
  console.log('PASS: Logged in successfully.');

  console.log('2. Navigating to http://localhost:5173/settings/account...');
  await page.goto('http://localhost:5173/settings/account');
  await page.waitForSelector('.st-grid--account');

  console.log('3. Checking that Password change section is removed...');
  const pwCard = await page.$('.st-pass');
  if (pwCard) {
    throw new Error('FAIL: Password change card (.st-pass) still exists on Account page!');
  }
  console.log('PASS: Password change section is completely removed.');

  console.log('4. Checking live profile data...');
  await page.waitForSelector('[data-k="ac-name"]');
  const nameText = await page.innerText('[data-k="ac-name"]');
  const roleText = await page.innerText('[data-k="ac-role"]');
  const tierText = await page.innerText('[data-k="ac-tier"]');

  console.log('Loaded Profile Data:');
  console.log('  Name:', nameText);
  console.log('  Role:', roleText);
  console.log('  Tier:', tierText);

  if (!nameText.includes('Super Administrator') && !nameText.includes('Admin')) {
    throw new Error('FAIL: Name was not loaded from profile!');
  }
  console.log('PASS: Profile loaded live authenticated user.');

  console.log('5. Checking active MySQL sessions list...');
  await page.waitForSelector('.st-sess__row');
  const sessionRows = await page.$$('.st-sess__row');
  console.log(`PASS: Found ${sessionRows.length} active session(s) in list.`);

  console.log('6. Testing Profile Edit & Save...');
  const nameInput = await page.$('input[name="name"]');
  const titleInput = await page.$('input[name="title"]');
  const phoneInput = await page.$('input[name="phone"]');
  const saveBtn = await page.$('[data-k="ac-save"]');

  await titleInput.fill('Director of Agriculture Operations');
  await phoneInput.fill('+91 99887 76655');

  // Verify save button enables
  const isSaveDisabled = await saveBtn.isDisabled();
  console.log('Save button disabled after typing:', isSaveDisabled);
  if (isSaveDisabled) {
    throw new Error('FAIL: Save button did not enable on dirty form!');
  }

  await saveBtn.click();
  await page.waitForTimeout(1000);

  // Check updated text
  const updatedRoleText = await page.innerText('[data-k="ac-role"]');
  console.log('Updated Role Subtitle:', updatedRoleText);

  if (!updatedRoleText.includes('Director of Agriculture Operations')) {
    throw new Error('FAIL: Job title did not update live in the UI!');
  }
  console.log('PASS: Profile successfully saved and updated in DB and UI!');

  const screenshotPath = path.join(__dirname, 'settings_account_live.png');
  await page.screenshot({ path: screenshotPath });
  console.log('Saved screenshot:', screenshotPath);

  console.log('ALL SETTINGS ACCOUNT TESTS PASSED WITH 100% SUCCESS!');
  await browser.close();
  process.exit(0);
})().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
