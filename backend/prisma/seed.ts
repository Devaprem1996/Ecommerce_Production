
import { PrismaClient, Role, DiscountType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  // 1. Clean up existing data to prevent duplicate keys on re-run
  console.log("Cleaning up existing database records...");
  await prisma.coupon.deleteMany({});
  await prisma.pincode.deleteMany({});
  await prisma.inventory.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.userProfile.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Seed Users
  console.log("Seeding users...");
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@yathu.com",
      role: Role.ADMIN,
      passwordHash: "$2a$12$L7/C6n04lskz1Y96G.K0reB9229M1kUeJg8f.tUqjYgW9T/UuP89y", // admin123
      isVerified: true,
      profile: {
        create: {
          firstName: "Super",
          lastName: "Admin",
        },
      },
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      email: "customer@gmail.com",
      role: Role.CUSTOMER,
      passwordHash: "$2a$12$Z0s/qXhWb5U/K/PekM9Vne6229M1kUeJg8f.tUqjYgW9T/UuP89y", // customer123
      isVerified: true,
      profile: {
        create: {
          firstName: "John",
          lastName: "Doe",
          phone: "9876543210",
        },
      },
    },
  });

  console.log(`Seeded users: Admin (${adminUser.email}), Customer (${customerUser.email})`);

  // 3. Seed Categories
  console.log("Seeding categories...");
  const oilCategory = await prisma.category.create({
    data: {
      nameEn: "Traditional Oils",
      nameTa: "பாரம்பரிய எண்ணெய்கள்",
      slug: "traditional-oils",
      descriptionEn: "Cold pressed organic traditional cooking oils",
      descriptionTa: "மரச்செக்கு முறையில் தயாரித்த பாரம்பரிய சமையல் எண்ணெய்கள்",
    },
  });

  const honeyCategory = await prisma.category.create({
    data: {
      nameEn: "Natural Honey",
      nameTa: "இயற்கை தேன்",
      slug: "natural-honey",
      descriptionEn: "Raw unprocessed forest and farm honey",
      descriptionTa: "அடர்ந்த காடு மற்றும் பண்ணைகளில் இருந்து சேகரிக்கப்பட்ட சுத்தமான தேன்",
    },
  });

  console.log("Seeded categories.");

  // 4. Seed Products, Variants, and Inventory
  console.log("Seeding products & inventory...");

  // Product 1: Coconut Oil
  const coconutOil = await prisma.product.create({
    data: {
      categoryId: oilCategory.id,
      nameEn: "Cold Pressed Coconut Oil",
      nameTa: "மரச்செக்கு தேங்காய் எண்ணெய்",
      slug: "cold-pressed-coconut-oil",
      brand: "Yathu Iyarkaiyagam",
      descriptionEn: "Naturally extracted cold pressed coconut oil from sun-dried sulfur-free copra.",
      descriptionTa: "வெயிலில் உலர்த்தப்பட்ட சல்பர் இல்லாத கொப்பரையில் இருந்து மரச்செக்கு மூலம் பிழியப்பட்ட சுத்தமான தேங்காய் எண்ணெய்.",
    },
  });

  const coconutOil500ml = await prisma.productVariant.create({
    data: {
      productId: coconutOil.id,
      nameEn: "500ml Bottle",
      nameTa: "500மி.லி பாட்டில்",
      sku: "YI-CO-500ML",
      price: 190.00,
      discountPrice: 175.00,
      weight: 0.5,
    },
  });

  await prisma.inventory.create({
    data: {
      variantId: coconutOil500ml.id,
      availableQuantity: 50,
      minimumStock: 5,
    },
  });

  const coconutOil1L = await prisma.productVariant.create({
    data: {
      productId: coconutOil.id,
      nameEn: "1 Litre Bottle",
      nameTa: "1 லிட்டர் பாட்டில்",
      sku: "YI-CO-1L",
      price: 360.00,
      discountPrice: 340.00,
      weight: 1.0,
    },
  });

  await prisma.inventory.create({
    data: {
      variantId: coconutOil1L.id,
      availableQuantity: 30,
      minimumStock: 5,
    },
  });

  // Product 2: Raw Honey
  const rawHoney = await prisma.product.create({
    data: {
      categoryId: honeyCategory.id,
      nameEn: "Raw Wild Forest Honey",
      nameTa: "சுத்தமான காட்டு தேன்",
      slug: "raw-wild-forest-honey",
      brand: "Yathu Iyarkaiyagam",
      descriptionEn: "Unpasteurized, unfiltered honey harvested ethically from forest honeycombs.",
      descriptionTa: "காடுகளின் தேன்கூட்டில் இருந்து பாரம்பரிய முறையில் எடுக்கப்பட்ட சுத்திகரிக்கப்படாத காட்டு தேன்.",
    },
  });

  const rawHoney250g = await prisma.productVariant.create({
    data: {
      productId: rawHoney.id,
      nameEn: "250g Jar",
      nameTa: "250கி ஜாடி",
      sku: "YI-WH-250G",
      price: 220.00,
      discountPrice: 200.00,
      weight: 0.25,
    },
  });

  await prisma.inventory.create({
    data: {
      variantId: rawHoney250g.id,
      availableQuantity: 15,
      minimumStock: 3,
    },
  });

  console.log("Seeded products, variants, and inventory.");

  // 5. Seed Pincodes (Delivery Availability)
  console.log("Seeding pincodes...");
  await prisma.pincode.createMany({
    data: [
      { pincode: "600001", city: "Chennai", state: "Tamil Nadu", available: true, estimatedDays: 2, shippingCharge: 40.00, freeDeliveryThreshold: 499.00 },
      { pincode: "600002", city: "Chennai", state: "Tamil Nadu", available: true, estimatedDays: 2, shippingCharge: 40.00, freeDeliveryThreshold: 499.00 },
      { pincode: "625001", city: "Madurai", state: "Tamil Nadu", available: true, estimatedDays: 3, shippingCharge: 50.00, freeDeliveryThreshold: 599.00 },
      { pincode: "560001", city: "Bengaluru", state: "Karnataka", available: true, estimatedDays: 4, shippingCharge: 70.00, freeDeliveryThreshold: 799.00 },
      { pincode: "110001", city: "New Delhi", state: "Delhi", available: false, estimatedDays: 7, shippingCharge: 120.00, freeDeliveryThreshold: 999.00 },
    ],
  });
  console.log("Seeded pincodes.");

  // 6. Seed Discount Coupons
  console.log("Seeding coupons...");
  await prisma.coupon.createMany({
    data: [
      {
        code: "WELCOME10",
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10.00,
        minOrderValue: 299.00,
        maxDiscount: 100.00,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days expiry
      },
      {
        code: "FESTIVE150",
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 150.00,
        minOrderValue: 999.00,
        startDate: new Date(),
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      },
    ],
  });
  console.log("Seeded coupons.");

  console.log("Database seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("Error during database seeding:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
