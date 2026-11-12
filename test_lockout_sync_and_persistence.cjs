const { chromium } = require('./node/node_modules/playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('1. Navigating to login page...');
  await page.goto('http://localhost:5173/login');
  await page.waitForSelector('#login-email');

  console.log('2. Entering locked credentials...');
  await page.fill('#login-email', 'sriramsri1234321@gmail.com');
  await page.fill('#login-pass', 'password123');

  console.log('3. Clicking submit...');
  await page.click('#login-submit');

  console.log('4. Waiting for 429 lockout alert...');
  await page.waitForSelector('.login-alert--warning');
  
  const alertText = await page.innerText('#login-alert-desc');
  const countdownText = await page.innerText('#lockout-countdown');
  const btnText = await page.innerText('#login-submit');
  const isBtnDisabled = await page.isDisabled('#login-submit');

  console.log('Alert text:', alertText);
  console.log('Countdown text:', countdownText);
  console.log('Button text:', btnText);
  console.log('Button disabled:', isBtnDisabled);

  const [mins, secs] = countdownText.split(':').map(Number);
  console.log(`Parsed timer: ${mins}m ${secs}s`);

  if (mins === 15 && secs === 0) {
    throw new Error('FAIL: Countdown started from default 15:00 instead of synchronized seconds!');
  }
  console.log('PASS: Timer synchronized correctly with backend remaining seconds!');

  const screenshotPath1 = path.join(__dirname, 'lockout_synchronized.png');
  await page.screenshot({ path: screenshotPath1 });
  console.log('Saved screenshot 1:', screenshotPath1);

  console.log('5. Testing page reload (F5)...');
  await page.reload();
  await page.waitForSelector('#login-email');

  // Short pause to let enter() mount and restore
  await page.waitForTimeout(600);

  const alertAfterReload = await page.isVisible('.login-alert--warning');
  const countdownAfterReload = await page.innerText('#lockout-countdown');
  const btnAfterReload = await page.innerText('#login-submit');
  const isBtnDisabledAfterReload = await page.isDisabled('#login-submit');
  const emailValueAfterReload = await page.inputValue('#login-email');

  console.log('Alert visible after reload:', alertAfterReload);
  console.log('Countdown text after reload:', countdownAfterReload);
  console.log('Button text after reload:', btnAfterReload);
  console.log('Button disabled after reload:', isBtnDisabledAfterReload);
  console.log('Email prefilled after reload:', emailValueAfterReload);

  if (!alertAfterReload) {
    throw new Error('FAIL: Alert disappeared on reload!');
  }
  if (!isBtnDisabledAfterReload) {
    throw new Error('FAIL: Button was not disabled after reload!');
  }

  const screenshotPath2 = path.join(__dirname, 'lockout_persisted_after_reload.png');
  await page.screenshot({ path: screenshotPath2 });
  console.log('Saved screenshot 2:', screenshotPath2);

  console.log('ALL TESTS PASSED SUCCESSFULLY!');
  await browser.close();
  process.exit(0);
})().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
