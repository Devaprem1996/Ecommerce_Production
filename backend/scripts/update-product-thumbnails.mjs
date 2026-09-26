import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const updates = [
  { slug: "wood-pressed-sesame-oil", img: "/images/bestseller-sesame-oil.jpg" },
  { slug: "natural-wild-honey", img: "/images/bestseller-raw-honey.jpg" },
  { slug: "wood-pressed-groundnut-oil", img: "/images/bestseller-groundnut-oil.jpg" },
  { slug: "sugarcane-jaggery-powder", img: "/images/bestseller-jaggery-powder.jpg" },
  { slug: "palm-jaggery-round", img: "/images/bestseller-palm-jaggery.jpg" },
  { slug: "karupu-kavuni-rice-boiled", img: "/images/bestseller-karupu-kavuni.jpg" },
  { slug: "achu-murukku", img: "/images/prod-achu-murukku.jpg" },
  { slug: "groundnut-chikki", img: "/images/prod-groundnut-chikki.jpg" },
  { slug: "ginger-candy", img: "/images/prod-ginger-candy.jpg" },
  { slug: "sesame-seedai", img: "/images/prod-sesame-seedai.jpg" },
  { slug: "kodo-millet-noodles", img: "/images/prod-millet-noodles.jpg" },
  { slug: "native-sirumani-groundnut", img: "/images/prod-roasted-groundnuts.jpg" },
  { slug: "fried-native-sirumani-groundnut", img: "/images/prod-roasted-groundnuts.jpg" },
];

async function main() {
  for (const item of updates) {
    try {
      const res = await prisma.product.update({
        where: { slug: item.slug },
        data: { thumbnailUrl: item.img },
      });
      console.log(`Updated ${item.slug} -> ${item.img}`);
    } catch (e) {
      console.warn(`Could not update ${item.slug}:`, e.message);
    }
  }
}

main().finally(() => prisma.$disconnect());
