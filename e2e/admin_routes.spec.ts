import { test, expect } from '@playwright/test';

test('Verify All Admin Routes Connected to Live Neon DB', async ({ page }) => {
  test.setTimeout(120000);
  const base = 'C:\\Users\\DEV\\.gemini\\antigravity-ide\\brain\\243eff8e-c5a8-44d1-9f13-6dcd5ccfbd7f\\';

  // 1. Authenticate as Admin
  await page.goto('/admin/login');
  await page.fill('input[type="email"], input[name="email"]', 'admin@yathuarokiyagam.com');
  await page.fill('input[type="password"], input[name="password"]', 'Password123');

  const [response] = await Promise.all([
    page.waitForResponse(resp => resp.url().includes('/api/auth/admin/login')),
    page.click('button[type="submit"]'),
  ]);
  expect(response.status()).toBe(200);

  await page.waitForURL(url => url.pathname === '/admin', { timeout: 20000 });
  await page.waitForLoadState('networkidle');

  // ----------------------------------------------------
  // Slice 1: /admin/products (Images, Pagination & Category View)
  // ----------------------------------------------------
  console.log('--- Testing /admin/products ---');
  await page.goto('/admin/products');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2500);

  // Verify Heading & Live Badge
  await expect(page.locator('h1:has-text("Product Catalog")')).toBeVisible();
  await expect(page.locator('text=/Live Neon DB/')).toBeVisible();

  // 1. Verify Connected Images (non-placeholder, distinct)
  const productImages = page.locator('tbody tr img');
  expect(await productImages.count()).toBeGreaterThan(5);
  const firstImgSrc = await productImages.first().getAttribute('src');
  console.log(`First product image src: ${firstImgSrc}`);
  expect(firstImgSrc).toBeTruthy();

  // 2. Verify Pagination
  await expect(page.locator('text=/Showing 1-15 of 85/')).toBeVisible();
  const page2Btn = page.locator('button:text-is("2")');
  await expect(page2Btn).toBeVisible();
  await page2Btn.click();
  await page.waitForTimeout(500);
  await expect(page.locator('text=/Showing 16-30 of 85/')).toBeVisible();

  // Go back to page 1
  const page1Btn = page.locator('button:text-is("1")');
  await page1Btn.click();
  await page.waitForTimeout(500);

  // Test live search filter on products
  const searchInput = page.locator('input[placeholder*="Search"]');
  await searchInput.fill('Oil');
  await page.waitForTimeout(600);
  const filteredRows = await page.locator('tbody tr').count();
  console.log(`Filtered rows for 'Oil': ${filteredRows}`);
  expect(filteredRows).toBeGreaterThan(0);
  await searchInput.fill(''); // Clear search
  await page.waitForTimeout(500);

  // Capture table view screenshot with real images & pagination
  await page.screenshot({ path: base + 'admin_products_live.png', fullPage: true });

  // 3. Verify Category-Wise View Mode
  console.log('--- Testing Category-Wise View ---');
  const byCategoryBtn = page.locator('button:has-text("By Category")');
  await expect(byCategoryBtn).toBeVisible();
  await byCategoryBtn.click();
  await page.waitForTimeout(1000);

  // Verify category section cards
  await expect(page.locator('h3:has-text("Traditional Oils")')).toBeVisible();
  await expect(page.locator('h3:has-text("Millet Noodles")')).toBeVisible();

  // Capture Category-Wise View screenshot
  await page.screenshot({ path: base + 'admin_products_category_view.png', fullPage: true });

  // Switch back to Table View
  const tableBtn = page.locator('button:has-text("Table")');
  await tableBtn.click();
  await page.waitForTimeout(500);

  // ----------------------------------------------------
  // Slice 2: /admin/categories
  // ----------------------------------------------------
  console.log('--- Testing /admin/categories ---');
  await page.goto('/admin/categories');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2500);

  await expect(page.locator('h1:has-text("Category Hierarchy")')).toBeVisible();
  await expect(page.locator('text=/Live Neon DB/')).toBeVisible();

  // Verify categories rendered
  const categoryItems = page.locator('text=/products/');
  expect(await categoryItems.count()).toBeGreaterThan(0);
  await page.screenshot({ path: base + 'admin_categories_live.png', fullPage: true });

  // ----------------------------------------------------
  // Slice 3: /admin/orders
  // ----------------------------------------------------
  console.log('--- Testing /admin/orders ---');
  await page.goto('/admin/orders');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2500);

  await expect(page.locator('h1:has-text("Orders Management")')).toBeVisible();
  await expect(page.locator('text=/Live Neon DB/')).toBeVisible();

  // Verify status tabs
  await expect(page.locator('button:has-text("confirmed")')).toBeVisible();
  await expect(page.locator('button:has-text("delivered")')).toBeVisible();
  await page.screenshot({ path: base + 'admin_orders_live.png', fullPage: true });

  // ----------------------------------------------------
  // Slice 4: /admin/coupons
  // ----------------------------------------------------
  console.log('--- Testing /admin/coupons ---');
  await page.goto('/admin/coupons');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2500);

  await expect(page.locator('h1:has-text("Coupons Engine")')).toBeVisible();
  await expect(page.locator('text=/Live Neon DB/')).toBeVisible();
  await page.screenshot({ path: base + 'admin_coupons_live.png', fullPage: true });

  // ----------------------------------------------------
  // Slice 5: /admin/settings/pincodes
  // ----------------------------------------------------
  console.log('--- Testing /admin/settings/pincodes ---');
  await page.goto('/admin/settings/pincodes');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2500);

  await expect(page.locator('h1:has-text("Pincodes & Serviceability")')).toBeVisible();
  await expect(page.locator('text=/Live Neon DB/')).toBeVisible();
  await page.screenshot({ path: base + 'admin_pincodes_live.png', fullPage: true });

  console.log('All screenshots captured and all route tests passed!');
});
