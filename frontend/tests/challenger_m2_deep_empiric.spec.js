import { test, expect } from '@playwright/test';

test.describe('Milestone 2 Deep Empirical Stress & Critical Interaction Harness', () => {

  // =========================================================================
  // 1. RAPID SWITCHING ACROSS ALL SUBTABS (ANALYTICS, SETTINGS, CUSTOMERS, HELP)
  // =========================================================================
  test.describe('1. High-Frequency Rapid Subtab Transitions', () => {
    test('Interleaved rapid switching across all 12 auxiliary subtabs without errors', async ({ page }) => {
      const pageErrors = [];
      page.on('pageerror', (err) => pageErrors.push(err));

      await page.goto('#/analytics/overview');
      await page.waitForLoadState('networkidle');

      const allSubtabs = [
        '#/analytics/overview',
        '#/analytics/sales',
        '#/analytics/stock',
        '#/customers/stockists',
        '#/customers/shoppers',
        '#/settings/account',
        '#/settings/company',
        '#/settings/team',
        '#/settings/billing',
        '#/settings/notifications',
        '#/help/center',
        '#/help/tickets',
      ];

      // Execute 36 rapid sequential switches (3 full cycles) with 25ms delay
      for (let cycle = 0; cycle < 3; cycle++) {
        for (const targetRoute of allSubtabs) {
          await page.evaluate((h) => { location.hash = h; }, targetRoute);
          await page.waitForTimeout(25);
        }
      }

      // Settle on stockists
      await page.evaluate(() => { location.hash = '#/customers/stockists'; });
      await page.waitForTimeout(300);

      // Verify DOM landmarks settled cleanly
      await expect(page).toHaveTitle('Stockists · Vels');
      const cards = page.locator('.cs-card');
      await expect(cards.first()).toBeVisible();
      expect(await cards.count()).toBeGreaterThan(0);

      // Verify zero uncaught errors occurred during 36 transitions
      expect(pageErrors.length).toBe(0);
    });
  });

  // =========================================================================
  // 2. CUSTOMER SEARCH AND FILTERING (SPECIAL CHARACTERS, EMPTY, MATCHING, TAGS)
  // =========================================================================
  test.describe('2. Customer Search & Filtering Matrix', () => {
    test('Special characters, regex metacharacters, empty string, and matching query resilience', async ({ page }) => {
      const pageErrors = [];
      page.on('pageerror', (err) => pageErrors.push(err));

      await page.goto('#/customers/stockists');
      await page.waitForLoadState('networkidle');

      const searchInput = page.locator('[data-k="s-q"]');
      await expect(searchInput).toBeVisible();

      const initialCount = await page.locator('.cs-card').count();
      expect(initialCount).toBeGreaterThan(0);

      // 1. Adversarial regex inputs
      const adversarialInputs = ['(', '[', '{', '*', '+', '?', '^', '$', '|', '\\', '.', '(?=.*)'];
      for (const adv of adversarialInputs) {
        await searchInput.fill(adv);
        await page.waitForTimeout(50);
        expect(pageErrors.length).toBe(0);
      }

      // 2. Empty state rendering with clear button
      const emptyState = page.locator('.cs-empty');
      await expect(emptyState).toBeVisible();
      const clearBtn = page.locator('[data-act="sclear"]');
      await expect(clearBtn).toBeVisible();

      // Click clear filters button
      await clearBtn.click();
      await page.waitForTimeout(100);
      expect(await page.locator('.cs-card').count()).toBe(initialCount);
      expect(await searchInput.inputValue()).toBe('');

      // 3. Normal query matching
      await searchInput.fill('Apothecary');
      await page.waitForTimeout(100);
      const filtered = page.locator('.cs-card');
      const matchCount = await filtered.count();
      expect(matchCount).toBeGreaterThan(0);
      expect(matchCount).toBeLessThanOrEqual(initialCount);

      // Ensure <mark> highlights "Apothecary"
      const mark = page.locator('.cs-card .cs-card__name h3 b mark');
      await expect(mark.first()).toBeVisible();
      expect((await mark.first().textContent())?.toLowerCase()).toBe('apothecary');

      // 4. Tag chips filtering (vip, net30, new)
      await searchInput.fill('');
      await page.waitForTimeout(50);

      const vipChip = page.locator('[data-tag="vip"]');
      await expect(vipChip).toBeVisible();
      await vipChip.click();
      await page.waitForTimeout(100);

      expect(await vipChip.getAttribute('aria-pressed')).toBe('true');
      const vipCards = page.locator('.cs-card');
      expect(await vipCards.count()).toBeGreaterThan(0);

      // Reset to all
      const allChip = page.locator('[data-tag="all"]');
      await allChip.click();
      await page.waitForTimeout(100);
      expect(await page.locator('.cs-card').count()).toBe(initialCount);

      expect(pageErrors.length).toBe(0);
    });
  });

  // =========================================================================
  // 3. STOCKIST CARD EXPANSION & CUSTOMER DRAWER RENDERING
  // =========================================================================
  test.describe('3. Stockist Drawer & Interaction Lifecycle', () => {
    test('Stockist card click opens drawer, mounts chart, and syncs URL hash', async ({ page }) => {
      await page.goto('#/customers/stockists');
      await page.waitForLoadState('networkidle');

      const firstCard = page.locator('.cs-card').first();
      await expect(firstCard).toBeVisible();

      const customerId = await firstCard.getAttribute('data-key');
      expect(customerId).toBeTruthy();

      // Click card to open drawer
      await firstCard.click();

      const drawer = page.locator('#drawer');
      await expect(drawer).toBeVisible();

      // Verify URL hash updated with customerId
      expect(page.url()).toContain(`#/customers/stockists/${customerId}`);

      // Verify drawer contents
      await expect(drawer.locator('.d-head h2')).toBeVisible();
      await expect(drawer.locator('.d-facts')).toBeVisible();

      // Verify ColumnBarChart bars are rendered in monthly spend section
      const chartBars = drawer.locator('[data-ds="bars"] .bars__col');
      await expect(chartBars.first()).toBeVisible();
      expect(await chartBars.count()).toBeGreaterThan(0);

      // Verify orders list in drawer
      await expect(drawer.locator('[data-ds="orders"]')).toBeVisible();

      // Close drawer by pressing Escape
      await page.keyboard.press('Escape');
      await expect(drawer).not.toBeVisible();

      // Verify hash reverted to #/customers/stockists
      await expect(page).toHaveURL(/#\/customers\/stockists$/);
    });
  });

  // =========================================================================
  // 4. TICKET CREATION AND FORM VALIDATION
  // =========================================================================
  test.describe('4. Ticket Form Validation & Persistence', () => {
    test('Validation rejects empty/short fields with aria-invalid, accepts valid submission', async ({ page }) => {
      await page.goto('#/help/tickets');
      await page.waitForLoadState('networkidle');

      const form = page.locator('form[data-k="tk-form"]');
      await expect(form).toBeVisible();

      const subjectInput = form.locator('input[name="subject"]');
      const bodyInput = form.locator('textarea[name="body"]');
      const submitBtn = form.locator('button[type="submit"]');

      // 1. Empty submission
      await submitBtn.click();

      // Subject field should show error and aria-invalid
      await expect(subjectInput).toHaveAttribute('aria-invalid', 'true');
      const subjectErr = subjectInput.locator('xpath=ancestor::label//span[contains(@class, "hp-err")]');
      expect(await subjectErr.textContent()).toContain('Give it a subject');

      // 2. Short subject
      await subjectInput.fill('Hi');
      await submitBtn.click();
      await expect(subjectInput).toHaveAttribute('aria-invalid', 'true');

      // 3. Valid subject, empty body
      await subjectInput.fill('Valid Subject Title Here');
      await submitBtn.click();
      await expect(bodyInput).toHaveAttribute('aria-invalid', 'true');
      const bodyErr = bodyInput.locator('xpath=ancestor::label//span[contains(@class, "hp-err")]');
      expect(await bodyErr.textContent()).toContain('Tell us a little more');

      // 4. Short body (< 20 characters)
      await bodyInput.fill('Too short');
      await submitBtn.click();
      await expect(bodyInput).toHaveAttribute('aria-invalid', 'true');

      // 5. Valid submission
      const initialCount = await page.locator('.hp-ticket').count();
      const testSubject = `Automated Challenger Ticket ${Date.now()}`;
      const testBody = 'Detailed bug report verification body with more than twenty characters for testing.';

      await subjectInput.fill(testSubject);
      await bodyInput.fill(testBody);
      await submitBtn.click();

      // Verify newly created ticket appears in list
      await page.waitForTimeout(300);
      expect(await page.locator('.hp-ticket').count()).toBe(initialCount + 1);

      const createdTicket = page.locator('.hp-ticket', { hasText: testSubject });
      await expect(createdTicket).toBeVisible();
      await expect(createdTicket).toHaveClass(/is-fresh/);

      // Verify form was reset
      expect(await subjectInput.inputValue()).toBe('');
      expect(await bodyInput.inputValue()).toBe('');
    });
  });

  // =========================================================================
  // 5. THEME TOGGLE AND ACCENT PICKER CHANGES
  // =========================================================================
  test.describe('5. Theme Toggle & Accent Picker Dynamic Re-rendering', () => {
    test('Settings Account: Theme toggle switches data-theme, accent color updates data-accent', async ({ page }) => {
      await page.goto('#/settings/account');
      await page.waitForLoadState('networkidle');

      const html = page.locator('html');

      // Theme toggle buttons in account subtab
      const darkBtn = page.locator('.st-theme[data-pref="dark"]');
      const lightBtn = page.locator('.st-theme[data-pref="light"]');

      await darkBtn.click();
      await expect(html).toHaveAttribute('data-theme', 'dark');
      await expect(darkBtn).toHaveAttribute('aria-pressed', 'true');

      await lightBtn.click();
      await expect(html).toHaveAttribute('data-theme', 'light');
      await expect(lightBtn).toHaveAttribute('aria-pressed', 'true');

      // Accent picker in account subtab
      const accentButtons = page.locator('[data-k="ac-accents"] button[data-accent]');
      const accentCount = await accentButtons.count();
      expect(accentCount).toBeGreaterThan(0);

      // Click second accent button
      const targetAccentBtn = accentButtons.nth(1);
      const accentKey = await targetAccentBtn.getAttribute('data-accent');
      await targetAccentBtn.click();
      await page.waitForTimeout(100);

      // Check html[data-accent] updated
      await expect(html).toHaveAttribute('data-accent', accentKey ?? '');

      // Verify accent name display is updated
      const accentNameEl = page.locator('[data-k="ac-accent-name"]');
      expect(await accentNameEl.textContent()).toBeTruthy();
    });
  });

  // =========================================================================
  // 6. SCRIM VISIBILITY AND MODAL DISMISSALS
  // =========================================================================
  test.describe('6. Scrim Visibility & Modal Lifecycle', () => {
    test('Command palette displays scrim with opacity > 0.8, and modal dialogs open/dismiss cleanly', async ({ page }) => {
      await page.goto('#/customers/stockists');
      await page.waitForLoadState('networkidle');

      const scrim = page.locator('.scrim');

      // 1. Command Palette Scrim
      await page.locator('#btn-find').click();
      const finder = page.locator('#finder');
      await expect(finder).toBeVisible();
      await expect(scrim).toBeVisible();

      // Check computed opacity and visibility
      const opacity = await scrim.evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
      expect(opacity).toBeGreaterThan(0.8);

      // Dismiss via Escape
      await page.keyboard.press('Escape');
      await expect(finder).not.toBeVisible();
      await expect(scrim).not.toBeVisible();

      // Dismiss via Scrim click
      await page.locator('#btn-find').click();
      await expect(finder).toBeVisible();
      await expect(scrim).toBeVisible();
      await scrim.click({ position: { x: 10, y: 10 }, force: true });
      await expect(finder).not.toBeVisible();
      await expect(scrim).not.toBeVisible();

      // 2. Modal Dialog Lifecycle (Customer creation modal)
      const newCustBtn = page.locator('button[data-act="new"]').first();
      await expect(newCustBtn).toBeVisible();
      await newCustBtn.click();

      const modal = page.locator('#modal');
      await expect(modal).toBeVisible();

      // Dismiss modal by clicking cancel or close button
      const cancelBtn = modal.locator('button[data-dialog-close], button:has-text("Cancel")').first();
      if (await cancelBtn.isVisible()) {
        await cancelBtn.click();
      } else {
        await page.keyboard.press('Escape');
      }

      await expect(modal).not.toBeVisible();
    });
  });

});
