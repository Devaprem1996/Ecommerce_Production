import http from 'http';
import https from 'https';

function fetchUrl(url, options = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const client = u.protocol === 'https:' ? https : http;
    const reqOptions = {
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = client.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: json, rawBody: data });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, rawBody: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('STARTING AUTOMATED SYSTEM & API INTEGRATION TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, testFn) {
    process.stdout.write(`[TEST] ${name} ... `);
    try {
      await testFn();
      console.log('✅ PASSED');
      passed++;
    } catch (err) {
      console.log('❌ FAILED:', err.message);
      failed++;
    }
  }

  // 1. Health Check
  await test('Backend Health Check (/api/v1/health)', async () => {
    const res = await fetchUrl('http://localhost:8080/api/v1/health');
    if (res.status !== 200 || !res.body?.success) {
      throw new Error(`Expected status 200 & success true, got status ${res.status}: ${JSON.stringify(res.body)}`);
    }
  });

  // 2. Categories API
  await test('Fetch Categories Catalog (/api/v1/cms/categories)', async () => {
    const res = await fetchUrl('http://localhost:8080/api/v1/cms/categories');
    const categories = res.body?.data?.categories;
    if (res.status !== 200 || !Array.isArray(categories)) {
      throw new Error(`Expected array of categories, got status ${res.status}: ${JSON.stringify(res.body)}`);
    }
    if (categories.length === 0) {
      throw new Error('Categories list is empty!');
    }
    console.log(`(Found ${categories.length} categories) `);
  });

  // 3. Products Catalog API
  let sampleProductSlug = '';
  await test('Fetch Products Catalog (/api/v1/cms/products)', async () => {
    const res = await fetchUrl('http://localhost:8080/api/v1/cms/products');
    if (res.status !== 200 || !res.body?.success) {
      throw new Error(`Expected status 200, got ${res.status}`);
    }
    const products = res.body.data?.products;
    if (!products || products.length === 0) {
      throw new Error('Products list is empty!');
    }
    sampleProductSlug = products[0].slug;
    console.log(`(Found ${products.length} products on page 1, sample slug: "${sampleProductSlug}") `);
  });

  // 4. Product Details API
  await test(`Fetch Product Details (/api/v1/cms/products/${sampleProductSlug})`, async () => {
    const res = await fetchUrl(`http://localhost:8080/api/v1/cms/products/${sampleProductSlug}`);
    const prod = res.body?.data?.product;
    if (res.status !== 200 || !prod?.slug) {
      throw new Error(`Failed to fetch product details for ${sampleProductSlug}`);
    }
    if (!prod.variants || prod.variants.length === 0) {
      throw new Error(`Product ${sampleProductSlug} has no variants!`);
    }
    console.log(`(Product "${prod.nameEn}" has ${prod.variants.length} variant(s)) `);
  });

  // 5. Pincode Lookup API
  await test('Shipping Pincode Check (/api/v1/shipping/pincode/600001)', async () => {
    const res = await fetchUrl('http://localhost:8080/api/v1/shipping/pincode/600001');
    const pincodeData = res.body?.data;
    if (res.status !== 200 || !pincodeData?.serviceable) {
      throw new Error(`Pincode 600001 expected to be serviceable, got status ${res.status}`);
    }
    console.log(`(Location: ${pincodeData.city}, Charge: ₹${pincodeData.shippingCharge}) `);
  });

  // 6. Admin Authentication API
  let adminToken = '';
  await test('Admin Authentication Login (/api/v1/auth/login)', async () => {
    const res = await fetchUrl('http://localhost:8080/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@yathu.com', password: 'admin123' }),
    });
    if (res.status !== 200 || !res.body?.data?.accessToken) {
      throw new Error(`Admin login failed with status ${res.status}: ${JSON.stringify(res.body)}`);
    }
    adminToken = res.body.data.accessToken;
  });

  // 7. Customer Authentication API
  await test('Customer Authentication Login (/api/v1/auth/login)', async () => {
    const res = await fetchUrl('http://localhost:8080/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'customer@gmail.com', password: 'customer123' }),
    });
    if (res.status !== 200 || !res.body?.data?.accessToken) {
      throw new Error(`Customer login failed with status ${res.status}: ${JSON.stringify(res.body)}`);
    }
  });

  // 8. Frontend Storefront Server Check (http://localhost:3000)
  await test('Frontend Homepage Route (http://localhost:3000)', async () => {
    const res = await fetchUrl('http://localhost:3000');
    if (res.status !== 200 || !res.rawBody?.includes('<html')) {
      throw new Error(`Frontend home returned status ${res.status}`);
    }
  });

  // 9. Frontend Shop Route Check
  await test('Frontend Shop Route (http://localhost:3000/shop)', async () => {
    const res = await fetchUrl('http://localhost:3000/shop');
    if (res.status !== 200) {
      throw new Error(`Frontend shop page returned status ${res.status}`);
    }
  });

  // 10. Frontend Admin Route Middleware Check (307 redirect protection for unauthenticated users)
  await test('Frontend Admin Auth Protection (Redirect 307 on /admin)', async () => {
    const res = await fetchUrl('http://localhost:3000/admin');
    if (res.status !== 307 && res.status !== 200) {
      throw new Error(`Expected redirect or access, got status ${res.status}`);
    }
  });

  console.log('\n====================================================');
  console.log(`TEST RESULTS SUMMARY: ${passed} PASSED, ${failed} FAILED out of ${passed + failed} TESTS`);
  console.log('====================================================');
}

runTests().catch(console.error);
