import { test, expect } from '@playwright/test';

test.describe('Challenger M2: Auxiliary Modules Empirical Stress & Landmark Verification', () => {

  const M2_ROUTES = [
    {
      hash: '#/analytics/overview',
      expectedTitle: 'Reports · Vels',
      subtabKey: 'overview',
      viewName: 'analytics',
    },
    {
      hash: '#/analytics/sales',
      expectedTitle: 'Sales · Vels',
      subtabKey: 'sales',
      viewName: 'analytics',
    },
    {
      hash: '#/analytics/stock',
      expectedTitle: 'Stock health · Vels',
      subtabKey: 'stock',
      viewName: 'analytics',
    },
    {
      hash: '#/customers/stockists',
      expectedTitle: 'Stockists · Vels',
      subtabKey: 'stockists',
      viewName: 'customers',
    },
    {
      hash: '#/customers/shoppers',
      expectedTitle: 'Shoppers · Vels',
      subtabKey: 'shoppers',
      viewName: 'customers',
    },
    {
      hash: '#/settings/account',
      expectedTitle: 'Account · Vels',
      subtabKey: 'account',
      viewName: 'settings',
    },
    {
      hash: '#/settings/company',
      expectedTitle: 'Company · Vels',
      subtabKey: 'company',
      viewName: 'settings',
    },
    {
      hash: '#/settings/team',
      expectedTitle: 'Team & roles · Vels',
      subtabKey: 'team',
      viewName: 'settings',
    },
    {
      hash: '#/settings/billing',
      expectedTitle: 'Billing · Vels',
      subtabKey: 'billing',
      viewName: 'settings',
    },
    {
      hash: '#/settings/notifications',
      expectedTitle: 'Notifications · Vels',
      subtabKey: 'notifications',
      viewName: 'settings',
    },
    {
      hash: '#/help/center',
      expectedTitle: 'Help center · Vels',
      subtabKey: 'center',
      viewName: 'help',
    },
    {
      hash: '#/help/tickets',
      expectedTitle: 'My tickets · Vels',
      subtabKey: 'tickets',
      viewName: 'help',
    },
  ];

  // =========================================================================
  // 1. DEEP-LINKING ACROSS ALL 12 M2 ROUTES & SUBTABS + TITLE VERIFICATION
  // =========================================================================
  test.describe('1. Deep-Linking & Middle-Dot Title Verification', () => {
    for (const route of M2_ROUTES) {
      test(`Direct load ${route.hash} -> title "${route.expectedTitle}" with Unicode middle dot (183)`, async ({ page }) => {
        const pageErrors = [];
        page.on('pageerror', (err) => pageErrors.push(err));

        await page.goto(route.hash);
        await page.waitForLoadState('networkidle');

        // Verify view container
        const view = page.locator(`[data-view="${route.viewName}"]`);
        await expect(view).toBeVisible();

        // Verify active subtab container is not hidden
        const subContainer = view.locator(`[data-sub="${route.subtabKey}"]`);
        await expect(subContainer).toBeVisible();

        // Verify document title exact ending
        await expect(page).toHaveTitle(route.expectedTitle);
        const title = await page.title();
        expect(title.endsWith(' · Vels')).toBe(true);

        // Verify exact unicode middle dot (char code 183 / \u00B7)
        const dotIndex = title.lastIndexOf(' · Vels') + 1;
        expect(title.charCodeAt(dotIndex)).toBe(183);

        // Verify zero uncaught page errors
        expect(pageErrors.length).toBe(0);
      });
    }
  });

  // =========================================================================
  // 2. DOM LANDMARKS ACROSS ALL 4 AUXILIARY MODULES
  // =========================================================================
  test.describe('2. DOM Landmarks Verification', () => {
    test('Landmark 1: "Annual Gross Revenue" is visible on Analytics overview', async ({ page }) => {
      await page.goto('#/analytics/overview');
      const eyebrow = page.locator('[data-view="analytics"] [data-sub="overview"] .head__eyebrow');
      await expect(eyebrow).toBeVisible();
      const text = await eyebrow.textContent();
      expect(text).toContain('Annual Gross Revenue');

      // Verify KPI metrics cards and charts
      const metricsGrid = page.locator('[data-view="analytics"] .an-metric');
      await expect(metricsGrid.first()).toBeVisible();
      const count = await metricsGrid.count();
      expect(count).toBeGreaterThanOrEqual(4);
    });

    test('Landmark 2: "Stockists" is visible on Customers stockists', async ({ page }) => {
      await page.goto('#/customers/stockists');
      const title = page.locator('[data-view="customers"] [data-sub="stockists"] .head__title');
      await expect(title).toBeVisible();
      const text = await title.textContent();
      expect(text).toContain('Stockists');

      // Verify stockist cards exist
      const cards = page.locator('[data-view="customers"] .cs-card');
      await expect(cards.first()).toBeVisible();
      expect(await cards.count()).toBeGreaterThan(0);
    });

    test('Landmark 3: "User Account" is visible on Settings account', async ({ page }) => {
      await page.goto('#/settings/account');
      const eyebrow = page.locator('[data-view="settings"] [data-sub="account"] .head__eyebrow');
      await expect(eyebrow).toBeVisible();
      const text = await eyebrow.textContent();
      expect(text).toContain('User Account');

      // Verify account form
      const accountForm = page.locator('[data-k="ac-form"]');
      await expect(accountForm).toBeVisible();
    });

    test('Landmark 4: "Help center" is visible on Help center', async ({ page }) => {
      await page.goto('#/help/center');
      const eyebrow = page.locator('[data-view="help"] [data-sub="center"] .head__eyebrow');
      await expect(eyebrow).toBeVisible();
      const text = await eyebrow.textContent();
      expect(text).toContain('Help center');

      // Verify FAQ list exists
      const faqList = page.locator('#hp-faq');
      await expect(faqList).toBeVisible();
    });
  });

  // =========================================================================
  // 3. SEARCH FILTERING & <mark> HIGHLIGHTING
  // =========================================================================
  test.describe('3. Search Filtering & <mark> Query Highlighting', () => {
    test('Customers Stockists: search filters cards and wraps query match in <mark>', async ({ page }) => {
      await page.goto('#/customers/stockists');
      const searchInput = page.locator('[data-k="s-q"]');
      await expect(searchInput).toBeVisible();

      // Retrieve first card's name before filtering
      const firstCardName = await page.locator('.cs-card .cs-card__name h3 b').first().textContent();
      expect(firstCardName).toBeTruthy();
      const query = firstCardName.trim().split(/\s+/)[0]; // e.g. "Juniper"

      // Count initial cards
      const initialCount = await page.locator('.cs-card').count();
      expect(initialCount).toBeGreaterThan(1);

      // Type search query
      await searchInput.fill(query);
      await page.waitForTimeout(200);

      // Verify filtered cards
      const filteredCards = page.locator('.cs-card');
      const filteredCount = await filteredCards.count();
      expect(filteredCount).toBeGreaterThan(0);
      expect(filteredCount).toBeLessThanOrEqual(initialCount);

      // Assert <mark> exists inside card name heading
      const markLocator = page.locator('.cs-card .cs-card__name h3 b mark');
      await expect(markLocator.first()).toBeVisible();
      const markText = await markLocator.first().textContent();
      expect(markText?.toLowerCase()).toBe(query.toLowerCase());

      // Clear search and ensure all restore
      await searchInput.fill('');
      await page.waitForTimeout(200);
      expect(await page.locator('.cs-card').count()).toBe(initialCount);
    });

    test('Help Center: search filters FAQs and wraps query match in <mark>', async ({ page }) => {
      await page.goto('#/help/center');
      const searchInput = page.locator('[data-k="hp-q"]');
      await expect(searchInput).toBeVisible();

      const initialCount = await page.locator('.hp-item').count();
      expect(initialCount).toBeGreaterThan(1);

      // Search for "batch"
      const query = 'batch';
      await searchInput.fill(query);
      await page.waitForTimeout(200);

      const filteredCount = await page.locator('.hp-item').count();
      expect(filteredCount).toBeGreaterThan(0);

      // Verify <mark> element highlights match in question or answer
      const markLocator = page.locator('.hp-item mark');
      await expect(markLocator.first()).toBeVisible();
      const markText = await markLocator.first().textContent();
      expect(markText?.toLowerCase()).toBe(query.toLowerCase());

      // Clear query and verify restore
      await searchInput.fill('');
      await page.waitForTimeout(200);
      expect(await page.locator('.hp-item').count()).toBe(initialCount);
    });
  });

  // =========================================================================
  // 4. ADVERSARIAL CHALLENGES & EDGE CASE RESILIENCE
  // =========================================================================
  test.describe('4. Adversarial Challenges & Edge Case Mining', () => {
    test('4.1 Invalid subtab routes fall back gracefully without unhandled crashes', async ({ page }) => {
      const pageErrors = [];
      page.on('pageerror', (err) => pageErrors.push(err));

      // Test invalid subtabs across all 4 modules
      const invalidRoutes = [
        { url: '#/analytics/invalid-subtab-xyz', titleEnd: 'Reports · Vels' },
        { url: '#/customers/unknown-customer-sub', titleEnd: 'Stockists · Vels' },
        { url: '#/settings/nonexistent-config', titleEnd: 'Account · Vels' },
        { url: '#/help/garbage-subtab', titleEnd: 'Help center · Vels' },
      ];

      for (const route of invalidRoutes) {
        await page.goto(route.url);
        await expect(page).toHaveTitle(route.titleEnd);
        const title = await page.title();
        expect(title.charCodeAt(title.lastIndexOf(' · Vels') + 1)).toBe(183);
      }

      expect(pageErrors.length).toBe(0);
    });

    test('4.2 Rapid subtab switching within modules (stress test)', async ({ page }) => {
      const pageErrors = [];
      page.on('pageerror', (err) => pageErrors.push(err));

      await page.goto('#/settings/account');

      // Rapidly switch through settings tabs 15 times
      const settingsSubtabs = ['account', 'company', 'team', 'billing', 'notifications'];
      for (let i = 0; i < 15; i++) {
        const sub = settingsSubtabs[i % settingsSubtabs.length];
        await page.evaluate((targetSub) => {
          location.hash = `#/settings/${targetSub}`;
        }, sub);
        await page.waitForTimeout(30);
      }

      // Final settle on notifications
      await page.evaluate(() => {
        location.hash = '#/settings/notifications';
      });
      await expect(page).toHaveTitle('Notifications · Vels');
      const notifSub = page.locator('[data-view="settings"] [data-sub="notifications"]');
      await expect(notifSub).toBeVisible();

      // Rapidly switch through analytics tabs 12 times
      const analyticsSubtabs = ['overview', 'sales', 'stock'];
      for (let i = 0; i < 12; i++) {
        const sub = analyticsSubtabs[i % analyticsSubtabs.length];
        await page.evaluate((targetSub) => {
          location.hash = `#/analytics/${targetSub}`;
        }, sub);
        await page.waitForTimeout(30);
      }

      await page.evaluate(() => {
        location.hash = '#/analytics/sales';
      });
      await expect(page).toHaveTitle('Sales · Vels');

      expect(pageErrors.length).toBe(0);
    });

    test('4.3 Adversarial and special character inputs in search inputs', async ({ page }) => {
      const pageErrors = [];
      page.on('pageerror', (err) => pageErrors.push(err));

      // Test regex metacharacters in Customers Search
      await page.goto('#/customers/stockists');
      const customerSearch = page.locator('[data-k="s-q"]');
      await customerSearch.fill('[({*+?^$|\\.');
      await page.waitForTimeout(150);

      // Verify no unhandled regex error
      expect(pageErrors.length).toBe(0);
      // Empty state or filtered message rendered
      const emptyState = page.locator('.cs-empty');
      await expect(emptyState).toBeVisible();

      // Test XSS attempt in Help Search
      await page.goto('#/help/center');
      const helpSearch = page.locator('[data-k="hp-q"]');
      await helpSearch.fill('<script>alert("XSS")</script>');
      await page.waitForTimeout(150);

      expect(pageErrors.length).toBe(0);
    });

    test('4.4 Reactive Support Ticket creation mutates store and persists in list', async ({ page }) => {
      await page.goto('#/help/tickets');
      await expect(page.locator('[data-view="help"] [data-sub="tickets"]')).toBeVisible();

      const initialTicketsCount = await page.locator('.hp-ticket').count();

      // Ticket form is inline in tickets subtab
      const form = page.locator('form[data-k="tk-form"]');
      await expect(form).toBeVisible();

      const subjectInput = form.locator('input[name="subject"]');
      const bodyTextarea = form.locator('textarea[name="body"]');

      const testSubject = `Empirical Challenger Ticket ${Date.now()}`;
      const testBody = 'Detailed investigation report regarding inventory lot discrepancy for batch #9421.';

      await subjectInput.fill(testSubject);
      await bodyTextarea.fill(testBody);

      // Submit
      const submitBtn = form.locator('button[type="submit"]');
      await submitBtn.click();

      // Verify newly created ticket appears in the list
      await page.waitForTimeout(300);
      const newCount = await page.locator('.hp-ticket').count();
      expect(newCount).toBe(initialTicketsCount + 1);

      // Verify new ticket subject text is visible in ticket card
      const createdTicket = page.locator('.hp-ticket', { hasText: testSubject });
      await expect(createdTicket).toBeVisible();
    });

    test('4.5 Customer Profile Drawer opens and closes on deep-link', async ({ page }) => {
      // Direct navigate to a stockist with ID
      await page.goto('#/customers/stockists');
      const firstCard = page.locator('.cs-card').first();
      await expect(firstCard).toBeVisible();

      const customerId = await firstCard.getAttribute('data-key');
      expect(customerId).toBeTruthy();

      // Deep link directly to this customer
      await page.goto(`#/customers/stockists/${customerId}`);
      const drawer = page.locator('#drawer');
      await expect(drawer).toBeVisible();

      // Drawer contains customer header
      const drawerTitle = drawer.locator('.dr-who b, .head__title, h2, h3');
      await expect(drawerTitle.first()).toBeVisible();

      // Close drawer via escape
      await page.keyboard.press('Escape');
      await expect(drawer).not.toBeVisible();
    });
  });

});
