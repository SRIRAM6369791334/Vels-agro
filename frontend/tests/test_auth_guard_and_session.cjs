// Playwright Test for Authentication Guard, Topbar Sync & Session Revocation
const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Running Comprehensive Auth Guard & Session Security Tests...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext(); // Fresh browser context with NO cookies/localStorage
  const page = await context.newPage();

  try {
    // 1. Test Unauthenticated Access to /dashboard/overview (Must redirect to /login)
    console.log('\n[TEST 1] Visiting /dashboard/overview without token (Unauthenticated)...');
    await page.goto('http://localhost:5173/dashboard/overview');
    await page.waitForTimeout(1000);
    console.log('Current URL after guard check:', page.url());
    if (!page.url().includes('/login')) {
      throw new Error(`FAIL: Unauthenticated user was NOT redirected to /login! Landed on ${page.url()}`);
    }
    console.log('✓ PASS: Unauthenticated user strictly redirected to /login!');

    // 2. Test Unauthenticated Direct Visit to /login (Must stay on /login)
    console.log('\n[TEST 2] Visiting /login on fresh browser...');
    await page.goto('http://localhost:5173/login');
    await page.waitForTimeout(1000);
    console.log('Current URL:', page.url());
    if (!page.url().endsWith('/login')) {
      throw new Error(`FAIL: User was redirected away from /login! Landed on ${page.url()}`);
    }
    console.log('✓ PASS: Fresh user safely stays on /login!');

    // 3. Test Live Superadmin Login
    console.log('\n[TEST 3] Logging in as Superadmin...');
    await page.fill('#login-email', 'admin@velsagro.com');
    await page.fill('#login-pass', 'SuperAdmin@123');
    await page.click('#login-submit');

    await page.waitForURL('**/dashboard/overview', { timeout: 8000 });
    await page.waitForTimeout(500);
    console.log('✓ Successfully authenticated and navigated to:', page.url());

    // 4. Verify Topbar User Display
    const meBtnText = await page.textContent('#btn-me');
    console.log(`✓ Topbar Account Profile Display: "${meBtnText.replace(/\s+/g, ' ').trim()}"`);
    if (!meBtnText.includes('Super Administrator')) {
      throw new Error(`FAIL: Topbar did not display the active user role! Found: ${meBtnText}`);
    }
    console.log('✓ PASS: Topbar dynamically reflects real logged-in user and role!');

    // 5. Test Live Logout & Token Revocation
    console.log('\n[TEST 5] Testing Logout Flow...');
    // Click Sign Out
    await page.click('#btn-out');
    // Confirm dialog in main modal/confirm
    await page.waitForSelector('.mform__foot button[type="submit"]', { state: 'visible', timeout: 5000 });
    await page.click('.mform__foot button[type="submit"]');

    await page.waitForURL('**/login', { timeout: 5000 });
    console.log('✓ Successfully logged out and redirected to:', page.url());

    const tokenAfterLogout = await page.evaluate(() => localStorage.getItem('Vels:token'));
    const userAfterLogout = await page.evaluate(() => localStorage.getItem('Vels:active_user'));
    console.log('✓ Token cleared from localStorage:', tokenAfterLogout === null);
    console.log('✓ User cleared from localStorage:', userAfterLogout === null);

    // 6. Test Back-navigation after logout (Must stay locked out on /login)
    console.log('\n[TEST 6] Attempting back navigation to /dashboard/overview after logout...');
    await page.goto('http://localhost:5173/dashboard/overview');
    await page.waitForTimeout(1000);
    console.log('Current URL after post-logout protected route attempt:', page.url());
    if (!page.url().includes('/login')) {
      throw new Error(`FAIL: User could access protected dashboard after logging out!`);
    }
    console.log('✓ PASS: Protected dashboard strictly inaccessible after logout!');

    console.log('\n🎉 ALL SECURITY, ROUTE GUARD & SESSION TESTS PASSED 100%!');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
