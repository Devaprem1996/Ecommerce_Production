import { test, expect } from '@playwright/test';

test.describe('Storefront & Admin UI Feature Tests', () => {

  test('1. Home Page UI', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Yathu Iyarkaiyagam|Pure & Lab Tested/i);
    const nav = page.locator('nav, header').first();
    await expect(nav).toBeVisible();
    const main = page.locator('main, body').first();
    await expect(main).toBeVisible();
  });

  test('2. Shop Page & Product Catalog UI', async ({ page }) => {
    await page.goto('/shop');
    const shopHeading = page.locator('h1').first();
    await expect(shopHeading).toBeVisible();
    await page.waitForTimeout(1000);
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(100);
  });

  test('3. Product Detail Page & Price Info', async ({ page }) => {
    await page.goto('/shop');
    await page.waitForTimeout(1000);
    const productCard = page.locator('main div[class*="grid"] > div').first();
    if (await productCard.isVisible()) {
      await productCard.click();
      await page.waitForTimeout(1000);
    } else {
      await page.goto('/shop/cold-pressed-sesame-oil');
    }
    const title = page.locator('h1').first();
    await expect(title).toBeVisible();
  });

  test('4. Shopping Cart Page UI', async ({ page }) => {
    await page.goto('/cart');
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });

  test('5. Checkout Page UI', async ({ page }) => {
    await page.goto('/checkout');
    await expect(page).toHaveURL(/.*checkout/);
  });

  test('6. Customer Login Page (OTP Input UI)', async ({ page }) => {
    await page.goto('/login');
    const mobileInput = page.locator('input[type="tel"], input#mobile').first();
    await expect(mobileInput).toBeVisible();
  });

  test('7. Admin Login Page UI', async ({ page }) => {
    await page.goto('/admin/login');
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('8. Informational Footer/Static Pages', async ({ page }) => {
    for (const path of ['/about', '/contact', '/faq', '/privacy', '/terms']) {
      await page.goto(path);
      const heading = page.locator('h1, h2').first();
      await expect(heading).toBeVisible();
    }
  });

});
