const { chromium } = require('./node/node_modules/playwright');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/srira/.gemini/antigravity/brain/dd3077b4-440a-406b-b2ef-96ce9af6058d';

async function run() {
  console.log('--- Step 1: Testing Backend Email Immutability Validation (PUT /api/v1/auth/me) ---');
  
  // 1. Login to get token
  const loginRes = await fetch('http://127.0.0.1:5000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@velsagro.com', password: 'SuperAdmin@123' })
  });
  const loginData = await loginRes.json();
  if (!loginRes.ok || !loginData?.data?.token) {
    throw new Error('Login failed during test setup: ' + JSON.stringify(loginData));
  }
  const token = loginData.data.token;
  console.log('✅ Logged in successfully. Token acquired.');

  // 2. Try to update email -> MUST FAIL WITH 400
  const malformedEmailRes = await fetch('http://127.0.0.1:5000/api/v1/auth/me', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ email: 'tampered_admin@velsagro.com' })
  });
  const malformedData = await malformedEmailRes.json();
  console.log('PUT /api/v1/auth/me with altered email status:', malformedEmailRes.status);
  console.log('Response body:', malformedData);

  if (malformedEmailRes.status !== 400) {
    throw new Error(`Expected status 400 when attempting to modify email, got ${malformedEmailRes.status}`);
  }
  console.log('✅ Backend validation correctly blocked email modification with 400 Bad Request!');

  // 3. Normal update (name, phone) -> MUST SUCCEED
  const validUpdateRes = await fetch('http://127.0.0.1:5000/api/v1/auth/me', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ name: 'Super Administrator', phone: '+91 98400 12345', jobTitle: 'Chief System Administrator' })
  });
  const validData = await validUpdateRes.json();
  if (!validUpdateRes.ok) {
    throw new Error('Valid profile update failed: ' + JSON.stringify(validData));
  }
  console.log('✅ Legitimate profile update (name, phone, jobTitle) succeeded with 200 OK.');

  console.log('\n--- Step 2: Testing Frontend UI Lock & Readonly on http://localhost:5173/settings/account ---');
  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome'
  });

  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });

  const page = await context.newPage();
  
  // Login through UI
  console.log('Logging in via UI...');
  await page.goto('http://localhost:5173/login');
  await page.waitForSelector('#login-email');
  await page.fill('#login-email', 'admin@velsagro.com');
  await page.fill('#login-pass', 'SuperAdmin@123');
  await page.click('#login-submit');
  await page.waitForURL('**/dashboard/overview', { timeout: 10000 });
  console.log('✅ UI Login successful. Navigating to Account Settings...');

  await page.goto('http://localhost:5173/settings/account');
  await page.waitForSelector('.st-grid--account');

  // Check email field attributes
  const emailInput = page.locator('input[name="email"]');
  await emailInput.waitFor({ state: 'visible' });

  const isReadOnly = await emailInput.getAttribute('readonly');
  const tabIndex = await emailInput.getAttribute('tabindex');
  const ariaReadOnly = await emailInput.getAttribute('aria-readonly');
  const classList = await emailInput.getAttribute('class');
  const emailValue = await emailInput.inputValue();

  console.log('Email Input Attributes:');
  console.log('- readOnly attribute:', isReadOnly);
  console.log('- tabIndex:', tabIndex);
  console.log('- aria-readonly:', ariaReadOnly);
  console.log('- classList:', classList);
  console.log('- value:', emailValue);

  if (isReadOnly === null || ariaReadOnly !== 'true') {
    throw new Error('Email input is not marked readonly!');
  }

  // Verify hint
  const hintEl = page.locator('.st-field:has(input[name="email"]) .st-field__hint');
  const hintText = await hintEl.innerText();
  console.log('- Hint displayed:', hintText);

  // Take screenshot of the Account Settings page
  const screenshotPath = path.join(ARTIFACT_DIR, 'settings_account_email_locked.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`✅ Saved screenshot to ${screenshotPath}`);

  await browser.close();
  console.log('🎉 ALL TESTS PASSED SUCCESSFULLY!');
}

run().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
