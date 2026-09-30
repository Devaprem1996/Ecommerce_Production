import prisma from "../src/config/db.js";
import { SmsService, generateOrderTrackingToken } from "../src/services/sms.service.js";
import { UserService } from "../src/services/user.service.js";

async function main() {
  const targetPhone = "7395989687";
  console.log(`\n======================================================`);
  console.log(`Testing Order Tracking & Live SMS for Phone: +91 ${targetPhone}`);
  console.log(`======================================================\n`);

  // 1. Ensure user and profile exist for 7395989687
  let user = await prisma.user.findFirst({
    where: { phone: targetPhone },
    include: { profile: true, addresses: true },
  });

  if (!user) {
    console.log(`Creating user record for +91 ${targetPhone}...`);
    user = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          phone: targetPhone,
          email: `customer_${targetPhone}@customer.yathu.local`,
          role: "CUSTOMER",
          isGuest: false,
          isVerified: true,
        },
      });
      await tx.userProfile.create({
        data: {
          userId: u.id,
          firstName: "Deva",
          lastName: "Prem",
          phone: targetPhone,
        },
      });
      return await tx.user.findUnique({
        where: { id: u.id },
        include: { profile: true, addresses: true },
      }) as any;
    });
  }

  // 2. Ensure address exists
  let address = user?.addresses?.[0];
  if (!address) {
    console.log(`Creating delivery address for +91 ${targetPhone}...`);
    address = await prisma.address.create({
      data: {
        userId: user!.id,
        fullName: "Deva Prem",
        phone: targetPhone,
        addressLine1: "12, Traditional Street",
        city: "Chennai",
        state: "Tamil Nadu",
        postalCode: "600001",
        country: "IN",
        isDefault: true,
      },
    });
  }

  // 3. Find or create an order
  let order = await prisma.order.findFirst({
    where: {
      OR: [{ userId: user!.id }, { addressId: address.id }],
      deletedAt: null,
    },
    include: { orderItems: true, address: true },
    orderBy: { createdAt: "desc" },
  });

  if (!order) {
    console.log(`Creating a sample verified order for +91 ${targetPhone}...`);
    const variant = await prisma.productVariant.findFirst({
      where: { isActive: true },
      include: { product: true },
    });

    if (!variant) {
      throw new Error("No active product variant found to create order.");
    }

    const orderNumber = `YA-${Date.now().toString().slice(-8)}`;
    const unitPrice = variant.discountPrice || variant.price;

    order = await prisma.order.create({
      data: {
        userId: user!.id,
        addressId: address.id,
        orderNumber,
        subtotal: unitPrice,
        tax: 0,
        shippingCharge: 50,
        grandTotal: Number(unitPrice) + 50,
        status: "CONFIRMED",
        orderedAt: new Date(),
        orderItems: {
          create: [
            {
              variantId: variant.id,
              productName: variant.product.nameEn,
              sku: variant.sku || "YA-PROD",
              quantity: 1,
              unitPrice,
              subtotal: unitPrice,
            },
          ],
        },
        payments: {
          create: [
            {
              provider: "razorpay",
              currency: "INR",
              amount: Number(unitPrice) + 50,
              status: "PAID",
              paidAt: new Date(),
            },
          ],
        },
      },
      include: { orderItems: true, address: true },
    });
  }

  console.log(`Order reference: #${order.orderNumber} (ID: ${order.id})`);
  console.log(`Grand Total: ₹${order.grandTotal}`);
  console.log(`Status: ${order.status}`);

  // 4. Generate the HMAC Tracking Token
  const token = generateOrderTrackingToken(order.orderNumber, order.id);
  const localTrackLink = `http://localhost:3000/track-order?id=${order.orderNumber}&t=${token}`;
  const prodTrackLink = `https://yathuarokiyagam.com/track-order?id=${order.orderNumber}&t=${token}`;

  console.log(`\nGenerated Secure Tracking Links:`);
  console.log(`- Local URL (Dev):   ${localTrackLink}`);
  console.log(`- Production URL:    ${prodTrackLink}`);

  // 5. Send Real SMS via Fast2SMS
  console.log(`\nDispatching real Fast2SMS message to +91 ${targetPhone}...`);
  const smsSuccess = await SmsService.sendOrderConfirmation({
    phone: targetPhone,
    orderNumber: order.orderNumber,
    grandTotal: Number(order.grandTotal),
    orderId: order.id,
  });

  console.log(`Fast2SMS Dispatch Status: ${smsSuccess ? "SUCCESS (Sent to carrier)" : "MOCK / FAILED"}`);

  // 6. Test Direct Token Retrieval (simulating clicking the link)
  console.log(`\nTesting Direct Order Retrieval via Token (No OTP)...`);
  const trackingData = await UserService.trackOrderByToken(order.orderNumber, token);

  console.log(`Order Verified Successfully:`);
  console.log(`- Order Number:  #${trackingData.order.orderNumber}`);
  console.log(`- Status:        ${trackingData.order.status}`);
  console.log(`- Recipient:     ${trackingData.order.deliveryAddress}`);
  console.log(`- Carrier:       ${trackingData.order.carrierName} (${trackingData.order.trackingNumber})`);
  console.log(`- Customer Auth: Token generated (${trackingData.accessToken.slice(0, 20)}...)`);

  console.log(`\n======================================================`);
  console.log(`TEST COMPLETED SUCCESSFULLY`);
  console.log(`You can open this link directly in your browser:`);
  console.log(localTrackLink);
  console.log(`======================================================\n`);
}

main()
  .catch((err) => {
    console.error("Test failed with error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
