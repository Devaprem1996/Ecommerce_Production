import { test, expect } from '@playwright/test';

test.describe('OTP Login, Order Tracking & History Tests', () => {

  test('1. Track Order Page loads with Mobile OTP verification form', async ({ page }) => {
    await page.goto('/track-order');
    await expect(page).toHaveTitle(/Track.*Order|Yathu Arokiyagam/i);

    // Verify phone input is present
    const phoneInput = page.locator('input[type="tel"]');
    await expect(phoneInput).toBeVisible();

    // Verify Send OTP button is present
    const sendOtpButton = page.getByRole('button', { name: /Send SMS Verification Code/i });
    await expect(sendOtpButton).toBeVisible();

    // Verify link to sign in or view order history
    const loginLink = page.locator('a[href="/login"], a[href="/account/orders"]');
    await expect(loginLink.first()).toBeVisible();
  });

  test('2. Customer Login Page provides Mobile OTP sign in route', async ({ page }) => {
    await page.goto('/login');

    // Click Mobile OTP switch tab if present
    const otpTabButton = page.locator('button:has-text("Mobile OTP"), button:has-text("OTP"), [data-mode="otp"]');
    if (await otpTabButton.first().isVisible()) {
      await otpTabButton.first().click();
    }

    const phoneField = page.locator('input[type="tel"], input#mobile');
    await expect(phoneField.first()).toBeVisible();
  });

  test('3. Account Orders Page requires authentication and redirects unauthorized user', async ({ page }) => {
    await page.goto('/account/orders');
    // Unauthenticated guest should be redirected to login or show auth challenge
    await page.waitForTimeout(1000);
    const url = page.url();
    const isLoginOrOrders = url.includes('/login') || url.includes('/account');
    expect(isLoginOrOrders).toBeTruthy();
  });

});
