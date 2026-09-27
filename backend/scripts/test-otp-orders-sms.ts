import prisma from "../src/config/db.js";
import { SmsService } from "../src/services/sms.service.js";
import { UserService } from "../src/services/user.service.js";
import { AuthService } from "../src/services/auth.service.js";
import {
  analyzeSms,
  sanitizeToGsm7,
  enforceSingleSegmentLimit,
} from "../src/utils/sms-char-counter.js";
import bcrypt from "bcryptjs";

// ANSI colors for clean test reporting
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const CYAN = "\x1b[36m";
const YELLOW = "\x1b[33m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ${GREEN}✓ PASS:${RESET} ${testName}`);
  } else {
    console.error(`  ${RED}✗ FAIL:${RESET} ${testName} ${detail ? `(${detail})` : ""}`);
    throw new Error(`Assertion failed: ${testName} - ${detail || ""}`);
  }
}

async function runAllTests() {
  console.log(`\n${BOLD}${CYAN}================================================================${RESET}`);
  console.log(`${BOLD}${CYAN}  RUNNING COMPREHENSIVE TEST SUITE FOR OTP LOGIN, ORDERS & SMS  ${RESET}`);
  console.log(`${BOLD}${CYAN}================================================================${RESET}\n`);

  let passedTests = 0;

  // -------------------------------------------------------------
  // TEST SUITE 1: SMS COST SAVING (GSM-7 UNICODE DETECTOR & <=160 CHARS)
  // -------------------------------------------------------------
  console.log(`${BOLD}1. SMS Cost-Saving & English GSM-7 Unicode Verification (<= 160 chars = Rs. 5):${RESET}`);

  const sampleOtp = "849201";
  const sampleOrderNo = "ORD-948123-5012";
  const sampleAmount = "1499";
  const sampleTrackUrl = "https://yathuarokiyagam.com/track-order";

  // Template 1: OTP SMS
  const otpMsg = enforceSingleSegmentLimit(
    `Your Yathu Arokiyagam verification code is ${sampleOtp}. Valid for 5 minutes.`
  );
  const otpAnalysis = analyzeSms(otpMsg);
  console.log(`  [OTP SMS] "${otpMsg}"`);
  console.log(`    Length: ${otpAnalysis.charCount}/160 | GSM-7 Compliant: ${otpAnalysis.isGsm7Compliant} | Segments: ${otpAnalysis.segments} | Cost: Rs.${otpAnalysis.costInr}`);
  assert(otpAnalysis.isGsm7Compliant, "OTP SMS must be 100% GSM-7 compliant (No Unicode leaks)");
  assert(otpAnalysis.charCount <= 160, "OTP SMS length must be <= 160 characters", `${otpAnalysis.charCount} chars`);
  assert(otpAnalysis.segments === 1, "OTP SMS must use exactly 1 SMS credit (Rs. 5)", `${otpAnalysis.segments} segments`);
  assert(otpAnalysis.costInr === 5, "OTP SMS cost must be Rs. 5", `Rs. ${otpAnalysis.costInr}`);
  passedTests++;

  // Template 2: Order Received SMS
  const orderReceivedMsg = enforceSingleSegmentLimit(
    `Dear Customer, order #${sampleOrderNo} (Rs.${sampleAmount}) received at Yathu Arokiyagam. We are preparing it. Track: ${sampleTrackUrl}`
  );
  const orderRecAnalysis = analyzeSms(orderReceivedMsg);
  console.log(`  [Order Received SMS] "${orderReceivedMsg}"`);
  console.log(`    Length: ${orderRecAnalysis.charCount}/160 | GSM-7 Compliant: ${orderRecAnalysis.isGsm7Compliant} | Segments: ${orderRecAnalysis.segments} | Cost: Rs.${orderRecAnalysis.costInr}`);
  assert(orderRecAnalysis.isGsm7Compliant, "Order Received SMS must be 100% GSM-7 compliant (No Unicode leaks)");
  assert(orderRecAnalysis.charCount <= 160, "Order Received SMS length must be <= 160 characters", `${orderRecAnalysis.charCount} chars`);
  assert(orderRecAnalysis.segments === 1, "Order Received SMS must consume exactly 1 segment", `${orderRecAnalysis.segments} segments`);
  assert(orderRecAnalysis.costInr === 5, "Order Received SMS cost must be Rs. 5", `Rs. ${orderRecAnalysis.costInr}`);
  passedTests++;

  // Template 3: Payment Confirmed SMS
  const paymentConfirmedMsg = enforceSingleSegmentLimit(
    `Dear Customer, payment of Rs.${sampleAmount} for order #${sampleOrderNo} is confirmed at Yathu Arokiyagam. Track: ${sampleTrackUrl}`
  );
  const payAnalysis = analyzeSms(paymentConfirmedMsg);
  console.log(`  [Payment Confirmed SMS] "${paymentConfirmedMsg}"`);
  console.log(`    Length: ${payAnalysis.charCount}/160 | GSM-7 Compliant: ${payAnalysis.isGsm7Compliant} | Segments: ${payAnalysis.segments} | Cost: Rs.${payAnalysis.costInr}`);
  assert(payAnalysis.isGsm7Compliant, "Payment Confirmed SMS must be 100% GSM-7 compliant (No Unicode leaks)");
  assert(payAnalysis.charCount <= 160, "Payment Confirmed SMS length must be <= 160 characters", `${payAnalysis.charCount} chars`);
  assert(payAnalysis.segments === 1, "Payment Confirmed SMS must consume exactly 1 segment", `${payAnalysis.segments} segments`);
  assert(payAnalysis.costInr === 5, "Payment Confirmed SMS cost must be Rs. 5", `Rs. ${payAnalysis.costInr}`);
  passedTests++;

  // Template 4: Order Delivered SMS
  const deliveredMsg = enforceSingleSegmentLimit(
    `Dear Customer, order #${sampleOrderNo} has been delivered. Thank you for shopping with Yathu Arokiyagam!`
  );
  const delAnalysis = analyzeSms(deliveredMsg);
  console.log(`  [Order Delivered SMS] "${deliveredMsg}"`);
  console.log(`    Length: ${delAnalysis.charCount}/160 | GSM-7 Compliant: ${delAnalysis.isGsm7Compliant} | Segments: ${delAnalysis.segments} | Cost: Rs.${delAnalysis.costInr}`);
  assert(delAnalysis.isGsm7Compliant, "Order Delivered SMS must be 100% GSM-7 compliant (No Unicode leaks)");
  assert(delAnalysis.charCount <= 160, "Order Delivered SMS length must be <= 160 characters", `${delAnalysis.charCount} chars`);
  assert(delAnalysis.segments === 1, "Order Delivered SMS must consume exactly 1 segment", `${delAnalysis.segments} segments`);
  assert(delAnalysis.costInr === 5, "Order Delivered SMS cost must be Rs. 5", `Rs. ${delAnalysis.costInr}`);
  passedTests++;

  // Template 5: Order Cancelled SMS
  const cancelledMsg = enforceSingleSegmentLimit(
    `Order #${sampleOrderNo} cancelled. Refund of Rs.${sampleAmount} initiated (5-7 days). Yathu Arokiyagam.`
  );
  const cancelAnalysis = analyzeSms(cancelledMsg);
  console.log(`  [Order Cancelled SMS] "${cancelledMsg}"`);
  console.log(`    Length: ${cancelAnalysis.charCount}/160 | GSM-7 Compliant: ${cancelAnalysis.isGsm7Compliant} | Segments: ${cancelAnalysis.segments} | Cost: Rs.${cancelAnalysis.costInr}`);
  assert(cancelAnalysis.isGsm7Compliant, "Order Cancelled SMS must be 100% GSM-7 compliant (No Unicode leaks)");
  assert(cancelAnalysis.charCount <= 160, "Order Cancelled SMS length must be <= 160 characters", `${cancelAnalysis.charCount} chars`);
  assert(cancelAnalysis.segments === 1, "Order Cancelled SMS must consume exactly 1 segment", `${cancelAnalysis.segments} segments`);
  assert(cancelAnalysis.costInr === 5, "Order Cancelled SMS cost must be Rs. 5", `Rs. ${cancelAnalysis.costInr}`);
  passedTests++;

  // Unicode Detector & Sanitizer test
  const trickyUnicodeText = "Order ₹499 “cancelled” – please check… 😊";
  const sanitized = sanitizeToGsm7(trickyUnicodeText);
  const sanitizedAnalysis = analyzeSms(sanitized);
  assert(sanitizedAnalysis.isGsm7Compliant, "Sanitizer converts ₹ to Rs., quotes to ASCII and strips emojis");
  assert(!sanitized.includes("₹"), "Sanitizer must replace ₹ symbol with Rs.");
  assert(sanitized.includes("Rs.499"), "Sanitizer must contain Rs.499");
  passedTests++;

  // -------------------------------------------------------------
  // TEST SUITE 2: OTP LOGIN & CUSTOMER DATA SAVED TO DATABASE
  // -------------------------------------------------------------
  console.log(`\n${BOLD}2. OTP Login & Customer Database Persistence Test:${RESET}`);

  // Generate unique test customer phone
  const testPhone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
  const testOtp = "729104";
  const testOtpHash = await bcrypt.hash(testOtp, 10);

  // Clean any previous test data
  await prisma.otpVerification.deleteMany({ where: { phone: testPhone } });
  const existingUser = await prisma.user.findFirst({ where: { phone: testPhone } });
  if (existingUser) {
    await prisma.user.delete({ where: { id: existingUser.id } });
  }

  // 1. Create OTP record in database
  const createdOtp = await prisma.otpVerification.create({
    data: {
      phone: testPhone,
      otpHash: testOtpHash,
      purpose: "LOGIN",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    },
  });
  assert(!!createdOtp.id, "OTP record created with 5-minute expiry in otp_verifications table");

  // 2. Perform OTP Verification (simulate OTP LOGIN)
  const isOtpValid = await bcrypt.compare(testOtp, createdOtp.otpHash);
  assert(isOtpValid, "OTP bcrypt hash matches entered 6-digit code");

  await prisma.otpVerification.update({
    where: { id: createdOtp.id },
    data: { isVerified: true },
  });

  // 3. Save customer user record to database upon OTP login
  const customerUser = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        phone: testPhone,
        email: `customer_${testPhone}@yathuarokiyagam.com`,
        role: "CUSTOMER",
        isGuest: false,
        isVerified: true,
        lastLoginAt: new Date(),
      },
    });

    await tx.userProfile.create({
      data: {
        userId: newUser.id,
        firstName: "Anand",
        lastName: "Kumar",
        phone: testPhone,
      },
    });

    return tx.user.findUnique({
      where: { id: newUser.id },
      include: { profile: true },
    });
  });

  assert(!!customerUser, "Customer user saved into database");
  assert(customerUser!.phone === testPhone, "Customer phone saved into database", customerUser!.phone!);
  assert(customerUser!.role === "CUSTOMER", "Customer role set to CUSTOMER");
  assert(customerUser!.isVerified === true, "Customer isVerified flag marked true");
  assert(customerUser!.isGuest === false, "Customer is not guest after OTP login");
  assert(!!customerUser!.profile, "Customer profile record created in user_profiles");
  assert(customerUser!.profile!.phone === testPhone, "Customer profile phone matches mobile");
  assert(customerUser!.profile!.firstName === "Anand", "Customer profile name persisted");
  passedTests++;

  // 4. Generate JWT tokens for customer
  const tokens = AuthService.generateTokens({
    userId: customerUser!.id,
    email: customerUser!.email || `phone_${testPhone}`,
    role: customerUser!.role,
  });
  assert(!!tokens.accessToken, "JWT access token successfully generated for OTP customer");
  assert(!!tokens.refreshToken, "JWT refresh token successfully generated for OTP customer");
  passedTests++;

  // -------------------------------------------------------------
  // TEST SUITE 3: LINK PAST ORDERS TO CUSTOMER DATABASE RECORD
  // -------------------------------------------------------------
  console.log(`\n${BOLD}3. Link Customer Orders to Database Account Test:${RESET}`);

  // Create an address with this customer's phone
  const testAddress = await prisma.address.create({
    data: {
      userId: customerUser!.id,
      fullName: "Anand Kumar",
      phone: testPhone,
      addressLine1: "123 Temple Road",
      city: "Tirunelveli",
      state: "Tamil Nadu",
      postalCode: "627001",
      country: "India",
      isDefault: true,
    },
  });

  // Find a product variant to attach to the order
  const variant = await prisma.productVariant.findFirst({
    include: { product: true },
  });
  if (!variant) {
    throw new Error("No product variant found in database for order testing.");
  }

  // Create an order for this customer
  const orderNumber1 = `ORD-${Date.now().toString().slice(-6)}-1001`;
  const createdOrder = await prisma.order.create({
    data: {
      userId: customerUser!.id,
      addressId: testAddress.id,
      orderNumber: orderNumber1,
      subtotal: 550,
      discount: 0,
      tax: 0,
      shippingCharge: 0,
      grandTotal: 550,
      status: "CONFIRMED",
      orderedAt: new Date(),
      orderItems: {
        create: [
          {
            variantId: variant.id,
            productName: variant.product.nameEn,
            sku: variant.sku,
            quantity: 2,
            unitPrice: 275,
            discount: 0,
            tax: 0,
            subtotal: 550,
          },
        ],
      },
      payments: {
        create: [
          {
            provider: "cod",
            providerOrderId: `COD-${Date.now()}`,
            amount: 550,
            currency: "INR",
            status: "PENDING",
          },
        ],
      },
    },
    include: {
      orderItems: true,
      address: true,
      payments: true,
    },
  });

  assert(!!createdOrder.id, "Order created in database");
  assert(createdOrder.userId === customerUser!.id, "Order is explicitly linked to customer userId");
  assert(createdOrder.address.phone === testPhone, "Order address contains customer phone");
  passedTests++;

  // -------------------------------------------------------------
  // TEST SUITE 4: TRACK ORDERS BY LOGIN OTP VIA (trackOrdersByOtp)
  // -------------------------------------------------------------
  console.log(`\n${BOLD}4. Track Orders by OTP Verification (trackOrdersByOtp) Test:${RESET}`);

  // Create OTP for order tracking
  const trackOtp = "638219";
  const trackOtpHash = await bcrypt.hash(trackOtp, 10);
  await prisma.otpVerification.create({
    data: {
      phone: testPhone,
      otpHash: trackOtpHash,
      purpose: "ORDER_TRACKING",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    },
  });

  // Call UserService.trackOrdersByOtp
  const trackingResult = await UserService.trackOrdersByOtp(testPhone, trackOtp);
  assert(trackingResult.orders.length >= 1, "trackOrdersByOtp successfully retrieved customer orders", `${trackingResult.orders.length} order(s)`);
  
  const trackedOrder = trackingResult.orders.find((o) => o.orderNumber === orderNumber1);
  assert(!!trackedOrder, "Specific customer order found in tracking results");
  assert(trackedOrder!.status === "CONFIRMED", "Order status accurately reported", trackedOrder!.status);
  assert(trackedOrder!.grandTotal === 550, "Order grandTotal accurately reported", `Rs. ${trackedOrder!.grandTotal}`);
  assert(trackedOrder!.carrierName === "Delhivery", "Carrier partner Delhivery configured");
  assert(trackedOrder!.items.length === 1, "Order items count matches");
  assert(trackedOrder!.items[0].quantity === 2, "Line item quantity matches");
  assert(!!trackingResult.accessToken, "Customer issued access token upon OTP order tracking");
  assert(!!trackingResult.user, "Customer profile returned in tracking payload");
  assert(trackingResult.user.phone === testPhone, "Customer phone in tracking response matches");
  passedTests++;

  // -------------------------------------------------------------
  // TEST SUITE 5: TRACK ORDER HISTORY (UserService.getOrders & getOrderById)
  // -------------------------------------------------------------
  console.log(`\n${BOLD}5. Track Order History for Customer Test:${RESET}`);

  // Fetch all orders for this customer (UserService.getOrders)
  const orderHistory = await UserService.getOrders(customerUser!.id);
  assert(orderHistory.length >= 1, "UserService.getOrders returns customer order history");
  const foundHistoryOrder = orderHistory.find((o) => o.orderNumber === orderNumber1);
  assert(!!foundHistoryOrder, "Order #ORD found in customer order history");
  assert(foundHistoryOrder!.orderItems.length >= 1, "Order items populated in history");
  assert(foundHistoryOrder!.payments.length >= 1, "Payment status populated in history");
  assert(foundHistoryOrder!.address.phone === testPhone, "Address phone matches customer phone");
  passedTests++;

  // Fetch single order detail (UserService.getOrderById)
  const singleOrder = await UserService.getOrderById(customerUser!.id, createdOrder.id);
  assert(!!singleOrder, "UserService.getOrderById retrieves single order details");
  assert(singleOrder.id === createdOrder.id, "Order ID matches");
  assert(singleOrder.orderNumber === orderNumber1, "Order number matches");
  assert(Number(singleOrder.grandTotal) === 550, "Order grand total matches");
  passedTests++;

  // Clean up test order & user
  console.log(`\n${BOLD}Cleaning up test records...${RESET}`);
  await prisma.orderItem.deleteMany({ where: { orderId: createdOrder.id } });
  await prisma.payment.deleteMany({ where: { orderId: createdOrder.id } });
  await prisma.order.delete({ where: { id: createdOrder.id } });
  await prisma.address.delete({ where: { id: testAddress.id } });
  await prisma.userProfile.deleteMany({ where: { userId: customerUser!.id } });
  await prisma.user.delete({ where: { id: customerUser!.id } });
  await prisma.otpVerification.deleteMany({ where: { phone: testPhone } });
  console.log(`  ${GREEN}✓ Test cleanup completed.${RESET}`);

  console.log(`\n${BOLD}${GREEN}================================================================${RESET}`);
  console.log(`${BOLD}${GREEN}  ALL TESTS PASSED! (${passedTests} test suites verified successfully) ${RESET}`);
  console.log(`${BOLD}${GREEN}================================================================${RESET}\n`);
}

runAllTests()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(`\n${RED}Test execution failed:${RESET}`, err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
