const { chromium } = require('./node/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();
  await page.goto('http://localhost:5173/login');
  await page.fill('#login-email', 'admin@velsagro.com');
  await page.fill('#login-pass', 'SuperAdmin@123');
  await page.click('#login-submit');
  await page.waitForURL('**/dashboard/overview');
  await page.goto('http://localhost:5173/settings/account');
  await page.waitForSelector('.st-profile');
  await page.waitForTimeout(2000); // Wait for GSAP animations to complete

  const formInfo = await page.evaluate(() => {
    const form = document.querySelector('[data-k="ac-form"]');
    const fields = Array.from(document.querySelectorAll('.st-field')).map((f) => {
      const input = f.querySelector('input');
      return {
        label: f.querySelector('.field__label')?.textContent,
        name: input?.name,
        value: input?.value,
        opacity: f ? window.getComputedStyle(f).opacity : '',
        transform: f ? window.getComputedStyle(f).transform : '',
        inputBg: input ? window.getComputedStyle(input).backgroundColor : '',
        inputColor: input ? window.getComputedStyle(input).color : '',
        inputBorder: input ? window.getComputedStyle(input).border : '',
      };
    });
    return {
      formFound: !!form,
      fields
    };
  });
  console.log(JSON.stringify(formInfo, null, 2));

  // Take an element screenshot of just the profile card
  const profileCard = await page.$('.st-profile');
  if (profileCard) {
    await profileCard.screenshot({ path: 'C:/Users/srira/.gemini/antigravity/brain/dd3077b4-440a-406b-b2ef-96ce9af6058d/profile_card_crop.png' });
    console.log('Saved profile card crop screenshot');
  }

  await browser.close();
})();
