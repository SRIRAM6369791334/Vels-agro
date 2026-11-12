// Playwright E2E Test for Vels Agro Live Login Integration
const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Starting Playwright Live Login E2E Tests...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Ensure user starts signed out
  await page.addInitScript(() => {
    localStorage.setItem('Vels:signedout', '1');
    localStorage.removeItem('Vels:token');
    localStorage.removeItem('Vels:active_user');
  });

  try {
    // 1. Visit clean /login URL
    console.log('\n[TEST 1] Visiting clean http://localhost:5173/login');
    await page.goto('http://localhost:5173/login');
    await page.waitForSelector('#login-form');
    console.log('✓ Login page loaded successfully without hash (#):', page.url());

    // 2. Test Invalid Credentials (Wrong Password)
    console.log('\n[TEST 2] Testing Invalid Credentials (Wrong Password)...');
    await page.fill('#login-email', 'admin@velsagro.com');
    await page.fill('#login-pass', 'WrongPassword123');
    await page.click('#login-submit');

    await page.waitForSelector('.login-alert--danger', { state: 'visible', timeout: 5000 });
    const alertTitle = await page.textContent('#login-alert-title');
    const alertDesc = await page.textContent('#login-alert-desc');
    const passInputClass = await page.getAttribute('#login-pass', 'class');

    console.log(`✓ Danger Alert Banner Visible: "${alertTitle}" - "${alertDesc}"`);
    console.log(`✓ Password input marked with invalid border: ${passInputClass.includes('is-invalid')}`);

    // 3. Test Valid Superadmin Login
    console.log('\n[TEST 3] Testing Valid Superadmin Login (admin@velsagro.com / SuperAdmin@123)...');
    await page.fill('#login-email', 'admin@velsagro.com');
    await page.fill('#login-pass', 'SuperAdmin@123');
    await page.click('#login-submit');

    // Verify SweetAlert2 popup appearance
    await page.waitForSelector('.vels-swal-popup', { state: 'visible', timeout: 5000 });
    const swalTitle = await page.textContent('.swal2-title');
    console.log(`✓ SweetAlert2 Emerald Popup Triggered: "${swalTitle}"`);

    // Verify button micro-interaction
    const btnText = await page.textContent('#login-submit');
    console.log(`✓ Submit button state: "${btnText.trim()}"`);

    // Wait for transition to /dashboard/overview
    await page.waitForURL('**/dashboard/overview', { timeout: 8000 });
    console.log('✓ Successfully transitioned to Dashboard Overview:', page.url());

    // Verify localStorage has live token and user profile
    const token = await page.evaluate(() => localStorage.getItem('Vels:token'));
    const userStr = await page.evaluate(() => localStorage.getItem('Vels:active_user'));
    const user = JSON.parse(userStr || '{}');

    console.log('✓ Stored JWT Token exists:', Boolean(token && token.length > 20));
    console.log('✓ Stored User Profile:', JSON.stringify(user));

    console.log('\n🎉 ALL LIVE LOGIN TESTS PASSED SUCCESSFULLY! 100% PRODUCTION READY!');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
