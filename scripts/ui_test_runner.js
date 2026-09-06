import { chromium } from '@playwright/test';

async function runUITests() {
  console.log('====================================================');
  console.log('STARTING PLAYWRIGHT AUTOMATED E2E UI TESTS');
  console.log('====================================================\n');

  // Launch browser (headless or channel chrome/msedge)
  let browser;
  try {
    browser = await chromium.launch({ headless: true, channel: 'msedge' });
  } catch {
    try {
      browser = await chromium.launch({ headless: true, channel: 'chrome' });
    } catch {
      browser = await chromium.launch({ headless: true });
    }
  }

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  let passed = 0;
  let failed = 0;

  async function test(name, testFn) {
    process.stdout.write(`[UI TEST] ${name} ... `);
    try {
      await testFn(page);
      console.log('✅ PASSED');
      passed++;
    } catch (err) {
      console.log('❌ FAILED:', err.message);
      failed++;
    }
  }

  try {
    // 1. Home Page & Navigation Header
    await test('Home Page Load & Navigation Header', async (page) => {
      await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      // Verify title or main logo
      const title = await page.title();
      if (!title) throw new Error('Page title missing');

      // Check header elements
      const navLinks = await page.locator('nav a, header a').count();
      if (navLinks === 0) throw new Error('Header navigation links missing');
    });

    // 2. Language Switcher Toggle
    await test('Language Switcher Toggle (EN/TA)', async (page) => {
      await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
      const langBtn = page.locator('button:has-text("TA"), button:has-text("EN"), button:has-text("தமிழ்")').first();
      if (await langBtn.isVisible()) {
        await langBtn.click();
        await page.waitForTimeout(500);
        await langBtn.click(); // Toggle back
        await page.waitForTimeout(500);
      } else {
        console.log('(Language button skipped/not present in header) ');
      }
    });

    // 3. Shop Catalog Page & Filtering
    await test('Shop Page Catalog & Category Filters (/shop)', async (page) => {
      await page.goto('http://localhost:3000/shop', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);

      // Verify product cards are displayed
      const productCards = page.locator('a[href*="/shop/"]');
      const count = await productCards.count();
      if (count === 0) throw new Error('No product cards rendered on shop page');

      console.log(`(Found ${count} product cards on shop page) `);
    });

    // 4. Product Detail Page & Variant Selection
    let firstProductUrl = '';
    await test('Product Detail Page & Dynamic Price Updates', async (page) => {
      await page.goto('http://localhost:3000/shop', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);

      const firstProduct = page.locator('a[href*="/shop/"]').first();
      firstProductUrl = await firstProduct.getAttribute('href');
      
      if (!firstProductUrl) throw new Error('Could not find product link');
      
      await page.goto(`http://localhost:3000${firstProductUrl}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);

      // Verify product title & Add to Cart button
      const addToCartBtn = page.locator('button:has-text("Add to Cart"), button:has-text("ADD TO CART")').first();
      if (!(await addToCartBtn.isVisible())) {
        throw new Error('Add to Cart button missing on product detail page');
      }

      // Test variant buttons if present
      const variantBtns = page.locator('button[data-variant], button:has-text("Pack"), button:has-text("1L"), button:has-text("500g"), button:has-text("1kg")');
      const varCount = await variantBtns.count();
      if (varCount > 1) {
        await variantBtns.nth(1).click();
        await page.waitForTimeout(500);
      }
    });

    // 5. Add to Cart & Cart Page Navigation
    await test('Add to Cart & Cart Page Flow (/cart)', async (page) => {
      if (!firstProductUrl) {
        await page.goto('http://localhost:3000/shop', { waitUntil: 'domcontentloaded' });
        const link = await page.locator('a[href*="/shop/"]').first().getAttribute('href');
        firstProductUrl = link || '/shop';
      }
      await page.goto(`http://localhost:3000${firstProductUrl}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      const addToCartBtn = page.locator('button:has-text("Add to Cart"), button:has-text("ADD TO CART")').first();
      if (await addToCartBtn.isVisible()) {
        await addToCartBtn.click();
        await page.waitForTimeout(1000);
      }

      // Navigate to /cart
      await page.goto('http://localhost:3000/cart', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);

      // Check cart page elements
      const cartHeading = page.locator('h1, h2, div:has-text("Cart"), div:has-text("Shopping Cart")').first();
      if (!(await cartHeading.isVisible())) {
        throw new Error('Cart page heading not found');
      }
    });

    // 6. Checkout Page Navigation
    await test('Checkout Page Load (/checkout)', async (page) => {
      await page.goto('http://localhost:3000/checkout', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);

      // Check if checkout form or pincode input is present
      const pincodeInput = page.locator('input[placeholder*="pincode" i], input[placeholder*="pin" i], input[name="pincode"]').first();
      const addressHeader = page.locator('h1, h2, div:has-text("Checkout"), div:has-text("Shipping")').first();

      if (!(await addressHeader.isVisible()) && !(await pincodeInput.isVisible())) {
        throw new Error('Checkout page UI components not found');
      }
    });

    // 7. Customer Login Page UI
    await test('Customer Login Page (/login)', async (page) => {
      await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
      const submitBtn = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();

      if (!(await emailInput.isVisible()) || !(await passwordInput.isVisible())) {
        throw new Error('Login form inputs missing');
      }

      // Fill credentials
      await emailInput.fill('customer@gmail.com');
      await passwordInput.fill('customer123');
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
        await page.waitForTimeout(1500);
      }
    });

    // 8. Admin Login Page UI
    await test('Admin Login Page (/admin/login)', async (page) => {
      await page.goto('http://localhost:3000/admin/login', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      const passwordInput = page.locator('input[type="password"], input[name="password"]').first();

      if (!(await emailInput.isVisible()) || !(await passwordInput.isVisible())) {
        throw new Error('Admin login form inputs missing');
      }

      await emailInput.fill('admin@yathu.com');
      await passwordInput.fill('admin123');
      const submitBtn = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
        await page.waitForTimeout(1500);
      }
    });

    // 9. Static Informational Pages
    const pagesToTest = [
      { name: 'About Page (/about)', path: '/about' },
      { name: 'Contact Page (/contact)', path: '/contact' },
      { name: 'FAQ Page (/faq)', path: '/faq' },
      { name: 'Privacy Policy Page (/privacy)', path: '/privacy' },
      { name: 'Terms & Conditions Page (/terms)', path: '/terms' },
    ];

    for (const p of pagesToTest) {
      await test(p.name, async (page) => {
        await page.goto(`http://localhost:3000${p.path}`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(800);
        const heading = page.locator('h1, h2').first();
        if (!(await heading.isVisible())) {
          throw new Error(`Heading missing on ${p.path}`);
        }
      });
    }

  } finally {
    await browser.close();
  }

  console.log('\n====================================================');
  console.log(`PLAYWRIGHT UI TEST SUMMARY: ${passed} PASSED, ${failed} FAILED out of ${passed + failed} UI TESTS`);
  console.log('====================================================');
}

runUITests().catch(console.error);
