const { chromium } = require('./node/node_modules/playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('1. Navigating to login page...');
  await page.goto('http://localhost:5173/login');
  await page.waitForSelector('#login-email');

  // Clear any existing localStorage token
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();
  await page.waitForSelector('#login-email');

  console.log('2. Entering locked staff credentials...');
  await page.fill('#login-email', 'sriramsri1234321@gmail.com');
  await page.fill('#login-pass', 'wrongpass');
  await page.click('#login-submit');

  console.log('3. Waiting for 429 lockout...');
  await page.waitForSelector('.login-alert--warning');

  let isBtnDisabled = await page.isDisabled('#login-submit');
  let btnText = await page.innerText('#login-submit');
  let isAlertVisible = await page.isVisible('.login-alert--warning');

  console.log('Locked staff state:');
  console.log('  Alert visible:', isAlertVisible);
  console.log('  Button text:', btnText);
  console.log('  Button disabled:', isBtnDisabled);

  if (!isBtnDisabled || !isAlertVisible) {
    throw new Error('FAIL: Staff account did not lock properly!');
  }

  const screenshot1 = path.join(__dirname, 'test_staff_locked.png');
  await page.screenshot({ path: screenshot1 });
  console.log('Saved screenshot 1:', screenshot1);

  console.log('4. User changes email to Superadmin (admin@velsagro.com)...');
  await page.fill('#login-email', 'admin@velsagro.com');

  // Check that button unlocked and alert disappeared immediately!
  await page.waitForTimeout(200);

  isAlertVisible = await page.isVisible('.login-alert--warning');
  isBtnDisabled = await page.isDisabled('#login-submit');
  btnText = await page.innerText('#login-submit');

  console.log('After switching to Superadmin email:');
  console.log('  Alert visible:', isAlertVisible);
  console.log('  Button text:', btnText);
  console.log('  Button disabled:', isBtnDisabled);

  if (isAlertVisible) {
    throw new Error('FAIL: Alert is still visible for Superadmin!');
  }
  if (isBtnDisabled) {
    throw new Error('FAIL: Button is still disabled for Superadmin!');
  }
  console.log('PASS: Button unlocked and alert cleared for Superadmin!');

  const screenshot2 = path.join(__dirname, 'test_superadmin_unlocked.png');
  await page.screenshot({ path: screenshot2 });
  console.log('Saved screenshot 2:', screenshot2);

  console.log('5. Entering Superadmin password and submitting...');
  await page.fill('#login-pass', 'SuperAdmin@123');
  await page.click('#login-submit');

  console.log('6. Waiting for dashboard navigation...');
  await page.waitForURL('**/dashboard/overview', { timeout: 10000 });
  console.log('PASS: Superadmin successfully logged in to dashboard overview!');

  const screenshot3 = path.join(__dirname, 'test_superadmin_dashboard.png');
  await page.screenshot({ path: screenshot3 });
  console.log('Saved screenshot 3:', screenshot3);

  console.log('7. Logging out and testing switching back to locked email...');
  await page.evaluate(() => {
    localStorage.removeItem('Vels:token');
    localStorage.removeItem('Vels:active_user');
  });
  await page.goto('http://localhost:5173/login');
  await page.waitForSelector('#login-email');

  // Type locked email again
  await page.fill('#login-email', 'sriramsri1234321@gmail.com');
  await page.waitForTimeout(200);

  isAlertVisible = await page.isVisible('.login-alert--warning');
  isBtnDisabled = await page.isDisabled('#login-submit');
  btnText = await page.innerText('#login-submit');

  console.log('After typing locked email again:');
  console.log('  Alert visible:', isAlertVisible);
  console.log('  Button text:', btnText);
  console.log('  Button disabled:', isBtnDisabled);

  if (!isAlertVisible || !isBtnDisabled) {
    throw new Error('FAIL: Lockout was not re-asserted when switching back to locked email!');
  }
  console.log('PASS: Lockout successfully re-asserted for locked email!');

  console.log('ALL TESTS PASSED WITH 100% SUCCESS!');
  await browser.close();
  process.exit(0);
})().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
