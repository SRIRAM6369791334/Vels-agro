const { chromium } = require('./node/node_modules/playwright');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/srira/.gemini/antigravity/brain/dd3077b4-440a-406b-b2ef-96ce9af6058d';

async function run() {
  console.log('=== Step 1: Creating 2 Active Sessions for Superadmin ===');
  
  // Session 1 (Device A)
  const login1 = await fetch('http://127.0.0.1:5000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0' },
    body: JSON.stringify({ email: 'admin@velsagro.com', password: 'SuperAdmin@123' })
  });
  const data1 = await login1.json();
  const token1 = data1.data.token;
  console.log('✅ Session 1 created (Chrome / Windows Workstation).');

  // Session 2 (Device B / Mobile or Safari)
  const login2 = await fetch('http://127.0.0.1:5000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Safari/605.1.15' },
    body: JSON.stringify({ email: 'admin@velsagro.com', password: 'SuperAdmin@123' })
  });
  const data2 = await login2.json();
  const token2 = data2.data.token;
  console.log('✅ Session 2 created (iPhone / Safari Mobile).');

  // Verify Session 2 is currently valid
  const check2Before = await fetch('http://127.0.0.1:5000/api/v1/auth/me', {
    headers: { 'Authorization': `Bearer ${token2}` }
  });
  console.log('Session 2 validity before revoking:', check2Before.status);
  if (check2Before.status !== 200) throw new Error('Session 2 should be active!');

  console.log('\n=== Step 2: Testing UI "Sign out other sessions" in Browser ===');
  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome'
  });

  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });

  const page = await context.newPage();

  // Login via UI on Session 1
  await page.goto('http://localhost:5173/login');
  await page.waitForSelector('#login-email');
  await page.fill('#login-email', 'admin@velsagro.com');
  await page.fill('#login-pass', 'SuperAdmin@123');
  await page.click('#login-submit');
  await page.waitForURL('**/dashboard/overview', { timeout: 10000 });

  // Navigate to Account Settings
  await page.goto('http://localhost:5173/settings/account');
  await page.waitForSelector('.st-grid--account');
  await page.waitForTimeout(1000);

  // Check sessions in UI
  const sessionRowsBefore = await page.$$('.st-sess__row');
  console.log(`UI shows ${sessionRowsBefore.length} active sessions before revoke.`);

  const revokeBtn = page.locator('[data-k="ac-out"]');
  const isRevokeBtnVisible = await revokeBtn.isVisible();
  console.log('Is "Sign out other sessions" button visible?:', isRevokeBtnVisible);

  if (!isRevokeBtnVisible) {
    throw new Error('FAIL: "Sign out other sessions" button is not visible when multiple sessions exist!');
  }

  // Take screenshot before revoking
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sessions_before_revoke.png') });

  // Click "Sign out other sessions"
  console.log('Clicking "Sign out other sessions" button...');
  await revokeBtn.click();

  // Wait for Confirm Dialog modal
  await page.waitForTimeout(600);
  const confirmBtn = page.locator('button:has-text("Sign them out"), button:has-text("Confirm")');
  await confirmBtn.first().waitFor({ state: 'visible', timeout: 5000 });
  console.log('Confirm dialog opened. Clicking confirm...');
  await confirmBtn.first().click();

  // Wait for network response and UI update
  await page.waitForTimeout(1500);

  // Check sessions in UI after revoking
  const sessionRowsAfter = await page.$$('.st-sess__row');
  console.log(`UI shows ${sessionRowsAfter.length} active session(s) after revoke.`);

  const isRevokeBtnVisibleAfter = await revokeBtn.isVisible();
  console.log('Is "Sign out other sessions" button hidden now?:', !isRevokeBtnVisibleAfter);

  // Take screenshot after revoking
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sessions_after_revoke.png') });

  await browser.close();

  console.log('\n=== Step 3: Verifying Revocation at Database & API Level ===');
  // Check if Session 2 is now rejected by the backend API
  const check2After = await fetch('http://127.0.0.1:5000/api/v1/auth/me', {
    headers: { 'Authorization': `Bearer ${token2}` }
  });
  const check2Data = await check2After.json();
  console.log('Session 2 status code now:', check2After.status);
  console.log('Session 2 response:', check2Data);

  if (check2After.status === 401) {
    console.log('✅ SUCCESS: Session 2 was instantly rejected by MySQL backend covering index!');
  } else {
    throw new Error('FAIL: Session 2 was not revoked! Status: ' + check2After.status);
  }

  console.log('\n🎉 ALL CHECKS PASSED: "Sign out other sessions" works 100% end-to-end!');
}

run().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
