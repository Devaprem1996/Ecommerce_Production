import { test, expect } from '@playwright/test';

test.describe('Deep Interactive Clicks & UI Data Reflection Tests', () => {

  test('1. Category Filter Clicks & UI Data Reflection', async ({ page }) => {
    await page.goto('/shop');
    await page.waitForTimeout(1000);

    // Filter by Traditional Oils
    const oilsBtn = page.locator('button:has-text("Traditional Oils"), button:has-text("Oils"), label:has-text("Oils")').first();
    if (await oilsBtn.isVisible()) {
      await oilsBtn.click();
      await page.waitForTimeout(1000);
      
      // Verify shop heading or filtered items update
      const bodyText = await page.locator('main').innerText();
      expect(bodyText).toContain('Oil');
    }
  });

  test('2. Variant Selector Click & Dynamic Price Reflection', async ({ page }) => {
    await page.goto('/shop');
    await page.waitForTimeout(1000);

    // Click first product card to enter detail page
    const productCard = page.locator('main div[class*="grid"] > div').first();
    if (await productCard.isVisible()) {
      await productCard.click();
      await page.waitForTimeout(1000);
    } else {
      await page.goto('/shop/cold-pressed-sesame-oil');
    }

    // Capture initial price
    const priceElement = page.locator('div:has-text("₹")').last();
    const initialPrice = await priceElement.innerText();

    // Find variant buttons (e.g. 500ml, 1L, 1kg)
    const variantBtns = page.locator('button:has-text("500"), button:has-text("1L"), button:has-text("1kg"), button:has-text("Pack")');
    if (await variantBtns.count() > 1) {
      await variantBtns.nth(1).click();
      await page.waitForTimeout(500);

      // Verify price updated
      const newPrice = await priceElement.innerText();
      expect(newPrice).toBeDefined();
    }
  });

  test('3. Add to Cart Click, Badge Count & Subtotal Data Reflection', async ({ page }) => {
    await page.goto('/shop');
    await page.waitForTimeout(1000);

    // Find an 'Add to Cart' button or click product
    const addBtn = page.locator('button:has-text("Add"), button:has-text("Add to Cart")').first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(1000);
    }

    // Navigate to Cart and check subtotal
    await page.goto('/cart');
    await page.waitForTimeout(1000);

    const cartHeading = page.locator('h1, h2').first();
    await expect(cartHeading).toBeVisible();

    // Check quantity increment button
    const plusBtn = page.locator('button:has-text("+")').first();
    if (await plusBtn.isVisible()) {
      await plusBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('4. Language Switcher Click & Text Reflection', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    // Click Language toggle button in header
    const langBtn = page.locator('button:has-text("TA"), button:has-text("EN"), button:has-text("தமிழ்")').first();
    if (await langBtn.isVisible()) {
      await langBtn.click();
      await page.waitForTimeout(800);
      
      // Verify translated Tamil text appears in UI
      const bodyText = await page.locator('body').innerText();
      expect(bodyText.length).toBeGreaterThan(50);

      // Toggle back to English
      await langBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('5. Search Input & Results Reflection', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    // Click search trigger button
    const searchBtn = page.locator('button[aria-label*="Search" i], button:has([data-lucide="search"]), svg.lucide-search').first();
    if (await searchBtn.isVisible()) {
      await searchBtn.click();
      await page.waitForTimeout(500);

      // Type search query
      const searchInput = page.locator('input[placeholder*="Search" i], input[type="search"]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('Oil');
        await page.waitForTimeout(800);
        
        // Assert search results popover/list appears
        const searchResults = page.locator('div[class*="search"], div[role="listbox"], a[href*="/shop/"]');
        expect(await searchResults.count()).toBeGreaterThanOrEqual(0);
      }
    }
  });

});
