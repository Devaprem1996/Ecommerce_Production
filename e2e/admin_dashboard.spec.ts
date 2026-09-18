import { test, expect } from '@playwright/test';

test('Verify Live /admin Dashboard with Neon DB', async ({ page }) => {
  // 1. Navigate to Admin Login
  await page.goto('/admin/login');
  await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();

  // 2. Fill login form
  await page.fill('input[type="email"], input[name="email"]', 'admin@yathuarokiyagam.com');
  await page.fill('input[type="password"], input[name="password"]', 'Password123');

  // Wait for login response
  const [response] = await Promise.all([
    page.waitForResponse(resp => resp.url().includes('/api/auth/admin/login')),
    page.click('button[type="submit"]'),
  ]);

  expect(response.status()).toBe(200);

  // 3. Wait for navigation to /admin
  await page.waitForURL(url => url.pathname === '/admin', { timeout: 20000 });
  await page.waitForLoadState('networkidle');

  // Wait extra 3s for React Query data rendering and Recharts animations
  await page.waitForTimeout(3000);

  // 4. Verify Heading & Live Badge
  const heading = page.locator('h1:has-text("Dashboard Overview")');
  await expect(heading).toBeVisible({ timeout: 10000 });

  const liveBadge = page.locator('text="Live Neon DB"');
  await expect(liveBadge).toBeVisible();

  // 5. Verify KPI Cards
  const totalRevenue = page.locator('text="Total Revenue"');
  await expect(totalRevenue).toBeVisible();

  const totalOrders = page.locator('text="Total Orders"');
  await expect(totalOrders).toBeVisible();

  const activeCustomers = page.locator('text="Active Customers"');
  await expect(activeCustomers).toBeVisible();

  const organicProducts = page.locator('text="Organic Products"');
  await expect(organicProducts).toBeVisible();

  // Verify organic products count 85
  const productCount = page.locator('text="85"');
  await expect(productCount.first()).toBeVisible();

  // 6. Verify Gross Revenue Trend Area Chart
  const chartTitle = page.locator('text="Gross Revenue Trend"');
  await expect(chartTitle).toBeVisible();

  // 7. Verify Recent Orders Table
  const recentOrdersTitle = page.locator('text="Recent Orders"');
  await expect(recentOrdersTitle).toBeVisible();
  const orderReceipt = page.locator('text="YATHU-8910"');
  await expect(orderReceipt).toBeVisible();

  // 8. Verify Top Products
  const topProductsTitle = page.locator('text="Top Products"');
  await expect(topProductsTitle).toBeVisible();

  // 9. Test Refresh Button Click
  const refreshBtn = page.locator('button:has-text("Refresh")');
  await expect(refreshBtn).toBeVisible();
  await refreshBtn.click();
  await page.waitForTimeout(1000);

  // 10. Capture full-page screenshot
  const screenshotPath = 'C:\\Users\\DEV\\.gemini\\antigravity-ide\\brain\\243eff8e-c5a8-44d1-9f13-6dcd5ccfbd7f\\admin_dashboard_live.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Saved screenshot to: ${screenshotPath}`);
});
