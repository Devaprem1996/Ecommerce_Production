import { PrismaClient, OrderStatus, PaymentStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function seedOrders() {
  console.log("Seeding realistic sample orders into live Neon DB...");

  // 1. Find customer user
  const customer = await prisma.user.findFirst({
    where: { role: "CUSTOMER" },
    include: { profile: true },
  });

  if (!customer) {
    console.error("No customer found to associate orders with.");
    return;
  }

  // 2. Ensure address exists for customer
  let address = await prisma.address.findFirst({
    where: { userId: customer.id },
  });

  if (!address) {
    address = await prisma.address.create({
      data: {
        userId: customer.id,
        fullName: "Priya Krishnan",
        phone: "9876543210",
        addressLine1: "Flat 4B, Ruby Block, OMR Road",
        city: "Chennai",
        state: "Tamil Nadu",
        postalCode: "600113",
        country: "India",
        isDefault: true,
      },
    });
  }

  // 3. Get some product variants
  const variants = await prisma.productVariant.findMany({
    take: 8,
    include: { product: true },
  });

  if (variants.length < 2) {
    console.error("Not enough variants found in catalog.");
    return;
  }

  const now = new Date();
  const sampleData = [
    {
      orderNumber: "YATHU-8910",
      customerName: "Priya Krishnan",
      status: OrderStatus.CONFIRMED,
      dateOffsetDays: 0, // Today
      items: [
        { variantIndex: 0, qty: 2 },
        { variantIndex: 1, qty: 1 },
      ],
    },
    {
      orderNumber: "YATHU-8909",
      customerName: "Vijay Kumar",
      status: OrderStatus.DELIVERED,
      dateOffsetDays: 1, // Yesterday
      items: [
        { variantIndex: 2, qty: 3 },
      ],
    },
    {
      orderNumber: "YATHU-8908",
      customerName: "Ramesh Raj",
      status: OrderStatus.DELIVERED,
      dateOffsetDays: 3,
      items: [
        { variantIndex: 1, qty: 2 },
        { variantIndex: 3, qty: 2 },
      ],
    },
    {
      orderNumber: "YATHU-8907",
      customerName: "Anjali Menon",
      status: OrderStatus.PACKED,
      dateOffsetDays: 15,
      items: [
        { variantIndex: 0, qty: 4 },
        { variantIndex: 2, qty: 2 },
      ],
    },
    {
      orderNumber: "YATHU-8906",
      customerName: "Devi Sundaram",
      status: OrderStatus.DELIVERED,
      dateOffsetDays: 45, // Last month
      items: [
        { variantIndex: 3, qty: 5 },
      ],
    },
    {
      orderNumber: "YATHU-8905",
      customerName: "Senthil Nathan",
      status: OrderStatus.DELIVERED,
      dateOffsetDays: 75, // 2 months ago
      items: [
        { variantIndex: 1, qty: 3 },
      ],
    },
    {
      orderNumber: "YATHU-8904",
      customerName: "Kavitha R.",
      status: OrderStatus.DELIVERED,
      dateOffsetDays: 105, // 3 months ago
      items: [
        { variantIndex: 0, qty: 3 },
      ],
    },
  ];

  for (const s of sampleData) {
    const existing = await prisma.order.findUnique({
      where: { orderNumber: s.orderNumber },
    });

    if (existing) {
      console.log(`Order ${s.orderNumber} already exists, skipping.`);
      continue;
    }

    const orderDate = new Date(now.getTime() - s.dateOffsetDays * 24 * 60 * 60 * 1000);

    let subtotal = 0;
    const orderItemsData = s.items.map((it) => {
      const v = variants[it.variantIndex % variants.length];
      const itemPrice = Number(v.discountPrice || v.price);
      const lineSubtotal = itemPrice * it.qty;
      subtotal += lineSubtotal;
      return {
        variantId: v.id,
        productName: `${v.product.nameEn} (${v.nameEn})`,
        sku: v.sku,
        quantity: it.qty,
        unitPrice: itemPrice,
        discount: 0,
        tax: 0,
        subtotal: lineSubtotal,
        createdAt: orderDate,
      };
    });

    const shippingCharge = subtotal > 499 ? 0 : 40;
    const grandTotal = subtotal + shippingCharge;

    const createdOrder = await prisma.order.create({
      data: {
        userId: customer.id,
        addressId: address.id,
        orderNumber: s.orderNumber,
        subtotal,
        discount: 0,
        tax: 0,
        shippingCharge,
        grandTotal,
        status: s.status,
        orderedAt: orderDate,
        createdAt: orderDate,
        orderItems: {
          create: orderItemsData,
        },
        payments: {
          create: {
            provider: "razorpay",
            providerOrderId: `order_fake_${s.orderNumber}`,
            providerPaymentId: `pay_fake_${s.orderNumber}`,
            currency: "INR",
            amount: grandTotal,
            status: PaymentStatus.SUCCESSFUL,
            paidAt: orderDate,
            createdAt: orderDate,
          },
        },
      },
    });

    console.log(`Seeded Order ${createdOrder.orderNumber} (₹${grandTotal}) for ${s.customerName}`);
  }

  console.log("Sample order seeding complete!");
}

seedOrders()
  .catch((e) => {
    console.error("Failed seeding orders:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
