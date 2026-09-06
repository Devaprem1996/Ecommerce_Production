import { PrismaClient, Role, DiscountType } from "@prisma/client";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ProductVariantInput {
  name_en: string;
  name_ta: string;
  variants: string[];
}

interface CatalogData {
  [categoryName: string]: ProductVariantInput[];
}

// Category mappings with clean slugs & descriptions
const CATEGORY_META: Record<string, { slug: string; nameEn: string; nameTa: string; descEn: string; descTa: string }> = {
  Oils: {
    slug: "traditional-oils",
    nameEn: "Traditional Oils",
    nameTa: "பாரம்பரிய எண்ணெய்கள்",
    descEn: "Pure cold-pressed and wood-pressed traditional cooking oils",
    descTa: "மரச்செக்கு முறையில் பிழியப்பட்ட சுத்தமான பாரம்பரிய எண்ணெய்கள்",
  },
  Noodles: {
    slug: "millet-noodles",
    nameEn: "Millet Noodles",
    nameTa: "சிறுதானிய நூடுல்ஸ்",
    descEn: "Healthy chemical-free millet noodles for the whole family",
    descTa: "ரசாயனங்கள் இல்லாத ஆரோக்கியமான சிறுதானிய நூடுல்ஸ்",
  },
  Vermicelli: {
    slug: "millet-vermicelli",
    nameEn: "Millet Vermicelli",
    nameTa: "சிறுதானிய சேமியா",
    descEn: "Traditional nutrient-dense millet vermicelli (Semiya)",
    descTa: "ஊட்டச்சத்து நிறைந்த பாரம்பரிய சிறுதானிய சேமியா",
  },
  Sweetner: {
    slug: "natural-sweeteners",
    nameEn: "Natural Sweeteners & Salts",
    nameTa: "இயற்கை இனிப்புகள் மற்றும் உப்பு",
    descEn: "Unrefined jaggery, pure wild honey, and natural rock salts",
    descTa: "சுத்திகரிக்கப்படாத வெல்லம், காட்டுத் தேன் மற்றும் இந்துப்பு",
  },
  Millets: {
    slug: "organic-millets",
    nameEn: "Organic Millets",
    nameTa: "இயற்கை சிறுதானியங்கள்",
    descEn: "Nutritious semi-polished native millets and grains",
    descTa: "பாரம்பரிய முறையில் வளர்க்கப்பட்ட சத்துள்ள சிறுதானியங்கள்",
  },
  "Traditional Rices": {
    slug: "traditional-rices",
    nameEn: "Traditional Heritage Rices",
    nameTa: "பாரம்பரிய அரிசி வகைகள்",
    descEn: "Ancient Indian heritage rice varieties rich in immunity & nutrition",
    descTa: "நோய் எதிர்ப்புச் சக்தி தரும் நமது நாட்டுப் பாரம்பரிய அரிசி வகைகள்",
  },
  Flours: {
    slug: "healthy-flours",
    nameEn: "Healthy Grain Flours",
    nameTa: "ஆரோக்கியமான தானிய மாவுகள்",
    descEn: "Fresh stone-ground wheat and millet flours",
    descTa: "பாரம்பரியமாக அரைக்கப்பட்ட ஆரோக்கியமான தானிய மாவுகள்",
  },
  Flakes: {
    slug: "millet-rice-flakes",
    nameEn: "Millet & Rice Flakes (Aval)",
    nameTa: "சிறுதானிய மற்றும் அரிசி அவல்",
    descEn: "Nutritious traditional rice & millet flakes for healthy breakfast",
    descTa: "காலை உணவுக்கு ஏற்ற ஊட்டச்சத்து நிறைந்த பாரம்பரிய அவல் வகைகள்",
  },
  Pulses: {
    slug: "organic-pulses-dals",
    nameEn: "Organic Pulses & Dals",
    nameTa: "இயற்கை பருப்பு வகைகள்",
    descEn: "Native groundnuts, unpolished dals, and mud-packed pulses",
    descTa: "இயற்கையான முறையில் விளைவிக்கப்பட்ட பருப்பு மற்றும் தானியங்கள்",
  },
  Snacks: {
    slug: "traditional-snacks-sweets",
    nameEn: "Traditional Healthy Snacks & Sweets",
    nameTa: "பாரம்பரிய ஆரோக்கிய சிற்றுண்டிகள்",
    descEn: "Herbal biscuits, native chikkis, sesame balls, and traditional sweets",
    descTa: "மூலிகை பிஸ்கட்கள், கடலை மிட்டாய், எள்ளு உருண்டை மற்றும் பாரம்பரிய இனிப்புகள்",
  },
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getVariantPriceAndWeight(
  categoryKey: string,
  variantCode: string
): { price: number; discountPrice: number; weight: number; nameEn: string; nameTa: string } {
  const code = variantCode.toUpperCase();
  let weight = 1.0;
  let price = 100;
  let nameEn = variantCode;
  let nameTa = variantCode;

  if (code === "1L") {
    weight = 1.0;
    price = 340;
    nameEn = "1 Litre Bottle";
    nameTa = "1 லிட்டர் பாட்டில்";
  } else if (code === "500ML") {
    weight = 0.5;
    price = 180;
    nameEn = "500ml Bottle";
    nameTa = "500மி.லி பாட்டில்";
  } else if (code === "1KG") {
    weight = 1.0;
    price = 160;
    nameEn = "1 Kg Pack";
    nameTa = "1 கிலோ பேக்";
  } else if (code === "500GM") {
    weight = 0.5;
    price = 85;
    nameEn = "500g Pack";
    nameTa = "500கி பேக்";
  } else if (code === "250GM") {
    weight = 0.25;
    price = 45;
    nameEn = "250g Pack";
    nameTa = "250கி பேக்";
  } else if (code === "PCS") {
    weight = 0.18;
    price = 65;
    nameEn = "1 Pack (180g)";
    nameTa = "1 பாக்கெட் (180கி)";
  } else if (code === "BOX") {
    weight = 0.2;
    price = 90;
    nameEn = "1 Box (200g)";
    nameTa = "1 பெட்டி (200கி)";
  }

  // Category specific price overrides
  if (categoryKey === "Oils") {
    price = code === "1L" ? 380 : 200;
  } else if (categoryKey === "Sweetner") {
    if (code === "1KG") price = 140;
    if (code === "500GM") price = 75;
    if (code === "250GM") price = 40;
  } else if (categoryKey === "Traditional Rices") {
    if (code === "1KG") price = 175;
    if (code === "500GM") price = 95;
  } else if (categoryKey === "Pulses") {
    if (code === "1KG") price = 185;
    if (code === "500GM") price = 100;
    if (code === "250GM") price = 55;
  }

  const discountPrice = Math.round(price * 0.92);

  return { price, discountPrice, weight, nameEn, nameTa };
}

async function main() {
  console.log("Starting production database seeding...");

  // 1. Clean existing records to guarantee clean state
  console.log("Cleaning existing database tables...");
  await prisma.auditLog.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.wishlist.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.pincode.deleteMany({});
  await prisma.inventory.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.userProfile.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Seed Users
  console.log("Seeding initial Admin and Customer accounts...");
  const adminPasswordHash = "$2a$10$qZX6FIRRg3/3mptB7wzr4.M5OavvRTy3Fs4fEXSSjuZgbby4RSKm6"; // admin123
  const customerPasswordHash = "$2a$10$TVJmpSV1F15x6r6tt/tT2es4d5veThdetYUzntHPJ5nQYwDh0o0Ny"; // customer123

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@yathu.com",
      role: Role.ADMIN,
      passwordHash: adminPasswordHash,
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
      passwordHash: customerPasswordHash,
      isVerified: true,
      profile: {
        create: {
          firstName: "John",
          lastName: "Customer",
          phone: "9876543210",
        },
      },
    },
  });
  console.log(`Seeded users: Admin (${adminUser.email}), Customer (${customerUser.email})`);

  // 3. Load catalog JSON
  const jsonPath = path.join(__dirname, "parsed_products.json");
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Parsed products file not found at ${jsonPath}`);
  }
  const rawData = fs.readFileSync(jsonPath, "utf-8");
  const catalog: CatalogData = JSON.parse(rawData);

  let totalCategories = 0;
  let totalProducts = 0;
  let totalVariants = 0;

  // 4. Seed Categories, Products, and Variants
  for (const [categoryKey, productsList] of Object.entries(catalog)) {
    const meta = CATEGORY_META[categoryKey] || {
      slug: slugify(categoryKey),
      nameEn: categoryKey,
      nameTa: categoryKey,
      descEn: `${categoryKey} products`,
      descTa: `${categoryKey} பொருட்கள்`,
    };

    const category = await prisma.category.create({
      data: {
        nameEn: meta.nameEn,
        nameTa: meta.nameTa,
        slug: meta.slug,
        descriptionEn: meta.descEn,
        descriptionTa: meta.descTa,
        imageUrl: `https://res.cloudinary.com/yathu-iyarkaiyagam/image/upload/v1/yathu/categories/${meta.slug}.jpg`,
      },
    });
    totalCategories++;

    for (const prodItem of productsList) {
      const prodSlug = slugify(prodItem.name_en);
      const product = await prisma.product.create({
        data: {
          categoryId: category.id,
          nameEn: prodItem.name_en,
          nameTa: prodItem.name_ta || prodItem.name_en,
          slug: prodSlug,
          brand: "Yathu Iyarkaiyagam",
          descriptionEn: `Pure authentic organic ${prodItem.name_en} sourced naturally from farmers without preservatives.`,
          descriptionTa: `சுத்தமான இயற்கை முறையில் தயாரிக்கப்பட்ட ${prodItem.name_ta || prodItem.name_en}.`,
          thumbnailUrl: `https://res.cloudinary.com/yathu-iyarkaiyagam/image/upload/v1/yathu/products/${prodSlug}.jpg`,
        },
      });
      totalProducts++;

      for (let i = 0; i < prodItem.variants.length; i++) {
        const vCode = prodItem.variants[i];
        const vDetails = getVariantPriceAndWeight(categoryKey, vCode);
        const sku = `YI-${meta.slug.substring(0, 3).toUpperCase()}-P${totalProducts}-${vCode}-${i + 1}`;

        const variant = await prisma.productVariant.create({
          data: {
            productId: product.id,
            nameEn: vDetails.nameEn,
            nameTa: vDetails.nameTa,
            sku: sku,
            price: vDetails.price,
            discountPrice: vDetails.discountPrice,
            weight: vDetails.weight,
          },
        });
        totalVariants++;

        await prisma.inventory.create({
          data: {
            variantId: variant.id,
            availableQuantity: 50,
            minimumStock: 5,
          },
        });
      }
    }
  }

  // 5. Seed Delivery Pincodes
  console.log("Seeding South India delivery pincodes...");
  await prisma.pincode.createMany({
    data: [
      { pincode: "600001", city: "Chennai", state: "Tamil Nadu", available: true, estimatedDays: 2, shippingCharge: 40.0, freeDeliveryThreshold: 499.0 },
      { pincode: "600002", city: "Chennai", state: "Tamil Nadu", available: true, estimatedDays: 2, shippingCharge: 40.0, freeDeliveryThreshold: 499.0 },
      { pincode: "625001", city: "Madurai", state: "Tamil Nadu", available: true, estimatedDays: 3, shippingCharge: 50.0, freeDeliveryThreshold: 599.0 },
      { pincode: "641001", city: "Coimbatore", state: "Tamil Nadu", available: true, estimatedDays: 2, shippingCharge: 45.0, freeDeliveryThreshold: 499.0 },
      { pincode: "620001", city: "Tiruchirappalli", state: "Tamil Nadu", available: true, estimatedDays: 3, shippingCharge: 45.0, freeDeliveryThreshold: 499.0 },
      { pincode: "560001", city: "Bengaluru", state: "Karnataka", available: true, estimatedDays: 4, shippingCharge: 70.0, freeDeliveryThreshold: 799.0 },
      { pincode: "682001", city: "Kochi", state: "Kerala", available: true, estimatedDays: 4, shippingCharge: 70.0, freeDeliveryThreshold: 799.0 },
    ],
  });

  // 6. Seed Discount Coupons
  console.log("Seeding promotional discount coupons...");
  await prisma.coupon.createMany({
    data: [
      {
        code: "WELCOME10",
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10.0,
        minOrderValue: 299.0,
        maxDiscount: 100.0,
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      },
      {
        code: "YATHU100",
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 100.0,
        minOrderValue: 799.0,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log("=================================================");
  console.log("DATABASE SEEDING SUMMARY:");
  console.log(`- Categories Seeded : ${totalCategories}`);
  console.log(`- Products Seeded   : ${totalProducts}`);
  console.log(`- Variants Seeded   : ${totalVariants}`);
  console.log("- All sample products successfully purged & replaced with live customer catalog.");
  console.log("=================================================");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
