import prisma from "../src/config/db.js";
import { generateOrderTrackingToken, verifyOrderTrackingToken } from "../src/services/sms.service.js";
import { UserService } from "../src/services/user.service.js";

async function runTest() {
  console.log("=== Testing Direct Token Order Tracking (No OTP) ===");

  // 1. Fetch an existing order from the database
  const order = await prisma.order.findFirst({
    where: { deletedAt: null },
    include: { address: true, user: true, orderItems: true },
    orderBy: { createdAt: "desc" },
  });

  if (!order) {
    console.error("No test order found in database.");
    process.exit(1);
  }

  console.log(`Found test order: #${order.orderNumber} (ID: ${order.id})`);

  // 2. Generate tracking token
  const token = generateOrderTrackingToken(order.orderNumber, order.id);
  console.log(`Generated HMAC Tracking Token: ${token}`);

  // 3. Verify token helper directly
  const isValid = verifyOrderTrackingToken(order.orderNumber, order.id, token);
  console.log(`Token verification result: ${isValid ? "PASS (Valid)" : "FAIL"}`);

  // 4. Test UserService.trackOrderByToken
  try {
    const result = await UserService.trackOrderByToken(order.orderNumber, token);
    console.log(`UserService.trackOrderByToken result:`);
    console.log(`  - Order Number: ${result.order.orderNumber}`);
    console.log(`  - Status: ${result.order.status}`);
    console.log(`  - Grand Total: ₹${result.order.grandTotal}`);
    console.log(`  - Items count: ${result.order.items.length}`);
    console.log(`  - Delivery Address: ${result.order.deliveryAddress}`);
    console.log(`  - Authenticated Access Token generated: ${result.accessToken ? "YES" : "NO"}`);
    console.log("PASS: Order fetched directly without OTP!");
  } catch (err: any) {
    console.error("FAIL: Error fetching order by token:", err.message);
    process.exit(1);
  }

  // 5. Test with tampered token
  try {
    await UserService.trackOrderByToken(order.orderNumber, "tampered_token_99");
    console.error("FAIL: Expected tampered token to be rejected!");
    process.exit(1);
  } catch (err: any) {
    console.log(`PASS: Tampered token was correctly rejected: "${err.message}"`);
  }

  // 6. Test with order UUID instead of orderNumber
  try {
    const resultById = await UserService.trackOrderByToken(order.id, token);
    console.log(`PASS: Order fetched using UUID (${resultById.order.orderNumber}) without OTP!`);
  } catch (err: any) {
    console.error("FAIL: Error fetching by UUID:", err.message);
    process.exit(1);
  }

  console.log("\n=== ALL TESTS PASSED SUCCESSFULLY ===");
  process.exit(0);
}

runTest().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
