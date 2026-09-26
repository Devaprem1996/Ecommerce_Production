import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      nameEn: true,
      nameTa: true,
      slug: true,
      thumbnailUrl: true,
      category: {
        select: {
          slug: true,
          nameEn: true,
        },
      },
      variants: {
        select: {
          price: true,
          discountPrice: true,
          nameEn: true,
          inventory: {
            select: {
              availableQuantity: true,
            },
          },
        },
      },
    },
  });

  console.log("TOTAL PRODUCTS IN DB:", products.length);
  products.forEach((p) => {
    console.log(`${p.slug} | ${p.nameEn} | ${p.category?.nameEn} | ${p.thumbnailUrl}`);
  });
}

main().finally(() => prisma.$disconnect());
