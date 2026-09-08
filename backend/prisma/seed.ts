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
    nameTa: "à®ªà®¾à®°à®®à¯à®ªà®°à®¿à®¯ à®Žà®£à¯à®£à¯†à®¯à¯à®•à®³à¯",
    descEn: "Pure cold-pressed and wood-pressed traditional cooking oils",
    descTa: "à®®à®°à®šà¯à®šà¯†à®•à¯à®•à¯ à®®à¯à®±à¯ˆà®¯à®¿à®²à¯ à®ªà®¿à®´à®¿à®¯à®ªà¯à®ªà®Ÿà¯à®Ÿ à®šà¯à®¤à¯à®¤à®®à®¾à®© à®ªà®¾à®°à®®à¯à®ªà®°à®¿à®¯ à®Žà®£à¯à®£à¯†à®¯à¯à®•à®³à¯",
  },
  Noodles: {
    slug: "millet-noodles",
    nameEn: "Millet Noodles",
    nameTa: "à®šà®¿à®±à¯à®¤à®¾à®©à®¿à®¯ à®¨à¯‚à®Ÿà¯à®²à¯à®¸à¯",
    descEn: "Healthy chemical-free millet noodles for the whole family",
    descTa: "à®°à®šà®¾à®¯à®©à®™à¯à®•à®³à¯ à®‡à®²à¯à®²à®¾à®¤ à®†à®°à¯‹à®•à¯à®•à®¿à®¯à®®à®¾à®© à®šà®¿à®±à¯à®¤à®¾à®©à®¿à®¯ à®¨à¯‚à®Ÿà¯à®²à¯à®¸à¯",
  },
  Vermicelli: {
    slug: "millet-vermicelli",
    nameEn: "Millet Vermicelli",
    nameTa: "à®šà®¿à®±à¯à®¤à®¾à®©à®¿à®¯ à®šà¯‡à®®à®¿à®¯à®¾",
    descEn: "Traditional nutrient-dense millet vermicelli (Semiya)",
    descTa: "à®Šà®Ÿà¯à®Ÿà®šà¯à®šà®¤à¯à®¤à¯ à®¨à®¿à®±à¯ˆà®¨à¯à®¤ à®ªà®¾à®°à®®à¯à®ªà®°à®¿à®¯ à®šà®¿à®±à¯à®¤à®¾à®©à®¿à®¯ à®šà¯‡à®®à®¿à®¯à®¾",
  },
  Sweetner: {
    slug: "natural-sweeteners",
    nameEn: "Natural Sweeteners & Salts",
    nameTa: "à®‡à®¯à®±à¯à®•à¯ˆ à®‡à®©à®¿à®ªà¯à®ªà¯à®•à®³à¯ à®®à®±à¯à®±à¯à®®à¯ à®‰à®ªà¯à®ªà¯",
    descEn: "Unrefined jaggery, pure wild honey, and natural rock salts",
    descTa: "à®šà¯à®¤à¯à®¤à®¿à®•à®°à®¿à®•à¯à®•à®ªà¯à®ªà®Ÿà®¾à®¤ à®µà¯†à®²à¯à®²à®®à¯, à®•à®¾à®Ÿà¯à®Ÿà¯à®¤à¯ à®¤à¯‡à®©à¯ à®®à®±à¯à®±à¯à®®à¯ à®‡à®¨à¯à®¤à¯à®ªà¯à®ªà¯",
  },
  Millets: {
    slug: "organic-millets",
    nameEn: "Organic Millets",
    nameTa: "à®‡à®¯à®±à¯à®•à¯ˆ à®šà®¿à®±à¯à®¤à®¾à®©à®¿à®¯à®™à¯à®•à®³à¯",
    descEn: "Nutritious semi-polished native millets and grains",
    descTa: "à®ªà®¾à®°à®®à¯à®ªà®°à®¿à®¯ à®®à¯à®±à¯ˆà®¯à®¿à®²à¯ à®µà®³à®°à¯à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿ à®šà®¤à¯à®¤à¯à®³à¯à®³ à®šà®¿à®±à¯à®¤à®¾à®©à®¿à®¯à®™à¯à®•à®³à¯",
  },
  "Traditional Rices": {
    slug: "traditional-rices",
    nameEn: "Traditional Heritage Rices",
    nameTa: "à®ªà®¾à®°à®®à¯à®ªà®°à®¿à®¯ à®…à®°à®¿à®šà®¿ à®µà®•à¯ˆà®•à®³à¯",
    descEn: "Ancient Indian heritage rice varieties rich in immunity & nutrition",
    descTa: "à®¨à¯‹à®¯à¯ à®Žà®¤à®¿à®°à¯à®ªà¯à®ªà¯à®šà¯ à®šà®•à¯à®¤à®¿ à®¤à®°à¯à®®à¯ à®¨à®®à®¤à¯ à®¨à®¾à®Ÿà¯à®Ÿà¯à®ªà¯ à®ªà®¾à®°à®®à¯à®ªà®°à®¿à®¯ à®…à®°à®¿à®šà®¿ à®µà®•à¯ˆà®•à®³à¯",
  },
  Flours: {
    slug: "healthy-flours",
    nameEn: "Healthy Grain Flours",
    nameTa: "à®†à®°à¯‹à®•à¯à®•à®¿à®¯à®®à®¾à®© à®¤à®¾à®©à®¿à®¯ à®®à®¾à®µà¯à®•à®³à¯",
    descEn: "Fresh stone-ground wheat and millet flours",
    descTa: "à®ªà®¾à®°à®®à¯à®ªà®°à®¿à®¯à®®à®¾à®• à®…à®°à¯ˆà®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿ à®†à®°à¯‹à®•à¯à®•à®¿à®¯à®®à®¾à®© à®¤à®¾à®©à®¿à®¯ à®®à®¾à®µà¯à®•à®³à¯",
  },
  Flakes: {
    slug: "millet-rice-flakes",
    nameEn: "Millet & Rice Flakes (Aval)",
    nameTa: "à®šà®¿à®±à¯à®¤à®¾à®©à®¿à®¯ à®®à®±à¯à®±à¯à®®à¯ à®…à®°à®¿à®šà®¿ à®…à®µà®²à¯",
    descEn: "Nutritious traditional rice & millet flakes for healthy breakfast",
    descTa: "à®•à®¾à®²à¯ˆ à®‰à®£à®µà¯à®•à¯à®•à¯ à®à®±à¯à®± à®Šà®Ÿà¯à®Ÿà®šà¯à®šà®¤à¯à®¤à¯ à®¨à®¿à®±à¯ˆà®¨à¯à®¤ à®ªà®¾à®°à®®à¯à®ªà®°à®¿à®¯ à®…à®µà®²à¯ à®µà®•à¯ˆà®•à®³à¯",
  },
  Pulses: {
    slug: "organic-pulses-dals",
    nameEn: "Organic Pulses & Dals",
    nameTa: "à®‡à®¯à®±à¯à®•à¯ˆ à®ªà®°à¯à®ªà¯à®ªà¯ à®µà®•à¯ˆà®•à®³à¯",
    descEn: "Native groundnuts, unpolished dals, and mud-packed pulses",
    descTa: "à®‡à®¯à®±à¯à®•à¯ˆà®¯à®¾à®© à®®à¯à®±à¯ˆà®¯à®¿à®²à¯ à®µà®¿à®³à¯ˆà®µà®¿à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿ à®ªà®°à¯à®ªà¯à®ªà¯ à®®à®±à¯à®±à¯à®®à¯ à®¤à®¾à®©à®¿à®¯à®™à¯à®•à®³à¯",
  },
  Snacks: {
    slug: "traditional-snacks-sweets",
    nameEn: "Traditional Healthy Snacks & Sweets",
    nameTa: "à®ªà®¾à®°à®®à¯à®ªà®°à®¿à®¯ à®†à®°à¯‹à®•à¯à®•à®¿à®¯ à®šà®¿à®±à¯à®±à¯à®£à¯à®Ÿà®¿à®•à®³à¯",
    descEn: "Herbal biscuits, native chikkis, sesame balls, and traditional sweets",
    descTa: "à®®à¯‚à®²à®¿à®•à¯ˆ à®ªà®¿à®¸à¯à®•à®Ÿà¯à®•à®³à¯, à®•à®Ÿà®²à¯ˆ à®®à®¿à®Ÿà¯à®Ÿà®¾à®¯à¯, à®Žà®³à¯à®³à¯ à®‰à®°à¯à®£à¯à®Ÿà¯ˆ à®®à®±à¯à®±à¯à®®à¯ à®ªà®¾à®°à®®à¯à®ªà®°à®¿à®¯ à®‡à®©à®¿à®ªà¯à®ªà¯à®•à®³à¯",
  },
};

const CATEGORY_TYPE_IMAGE: Record<string, string> = {
  "traditional-oils": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=600",
  "millet-noodles": "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&q=80&w=600",
  "millet-vermicelli": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=600",
  "natural-sweeteners": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=600",
  "organic-millets": "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600",
  "traditional-rices": "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?auto=format&fit=crop&q=80&w=600",
  "healthy-flours": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600",
  "millet-rice-flakes": "https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?auto=format&fit=crop&q=80&w=600",
  "organic-pulses-dals": "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&q=80&w=600",
  "traditional-snacks-sweets": "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&q=80&w=600",
};


const PRODUCT_IMAGE_MAP: Record<string, string> = {
  "aavarampoo-biscuits": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d3/Sweet_Biscuits_-_Kolkata_2011-11-15_7019.JPG/960px-Sweet_Biscuits_-_Kolkata_2011-11-15_7019.JPG",
  "achu-murukku": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/21/A_Traditional_Tamil_Snack_Murukku_1.jpg/960px-A_Traditional_Tamil_Snack_Murukku_1.jpg",
  "athur-kichili-samba-semi-polished-boiled": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/34/A_white_Ponni_Rice.JPG/960px-A_white_Ponni_Rice.JPG",
  "baloon-vine-biscuits": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/16/Biscuits_perspective.jpg/960px-Biscuits_perspective.jpg",
  "barnyard-millet-biscuits": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/74/Krupuk_Ikan_Cap_Jalu.jpg/960px-Krupuk_Ikan_Cap_Jalu.jpg",
  "barnyard-millet-noodles": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/87/Japanese_Soba_Noodles_Tsuta_-_waiting_queue_%282017-06-29_12.10.28_by_othree%29.jpg/960px-Japanese_Soba_Noodles_Tsuta_-_waiting_queue_%282017-06-29_12.10.28_by_othree%29.jpg",
  "barnyard-millet-semi-polished": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e0/Flowering_of_Echinochloa_crus-galli_plant_%28cockspur_grass_or_barnyard_grass%29.jpg/960px-Flowering_of_Echinochloa_crus-galli_plant_%28cockspur_grass_or_barnyard_grass%29.jpg",
  "barnyard-millet-vermicelli": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fd/Vermicelli_pudding.jpg/960px-Vermicelli_pudding.jpg",
  "black-horse-gram": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/12/Peeled_urad_beans.jpg/960px-Peeled_urad_beans.jpg",
  "black-kavuni-rice-biscuits": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/27/Plates_of_chocolate_chip_cookies_with_walnuts.jpg/960px-Plates_of_chocolate_chip_cookies_with_walnuts.jpg",
  "black-sesame-chikki": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/01/Sesame_Seed_Ball_%28Candy%29.jpg/960px-Sesame_Seed_Ball_%28Candy%29.jpg",
  "black-urad-dal": "https://upload.wikimedia.org/wikipedia/commons/a/af/Lentejas_veganas_-_Vegan_black_lentils_%285094766956%29.jpg",
  "browntop-millet-semi-polished": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cb/Urochloa_ramosa_252725075.jpg/960px-Urochloa_ramosa_252725075.jpg",
  "castor-oil": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9c/Bottle%2C_castor_oil_%28AM_1969.210-4%29.jpg/960px-Bottle%2C_castor_oil_%28AM_1969.210-4%29.jpg",
  "coconut-burfi": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ab/Besan_Ki_Barfi_Recipe_by_Sonia_Goyal.jpg/960px-Besan_Ki_Barfi_Recipe_by_Sonia_Goyal.jpg",
  "finger-millet-biscuits": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ac/Biscuiterie_Alpes_Biscuits_Estrablin_05.jpg/960px-Biscuiterie_Alpes_Biscuits_Estrablin_05.jpg",
  "finger-millet-flakes": "https://upload.wikimedia.org/wikipedia/commons/5/55/Ragi_Porridge.jpg",
  "finger-millet-flour": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ac/Ragi_millet_flour.jpg/960px-Ragi_millet_flour.jpg",
  "finger-millet-noodles": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/ff/Egg_Noodles_1.jpg/960px-Egg_Noodles_1.jpg",
  "foxtail-millet-biscuits": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fd/HK_food_%E5%B0%8F%E9%A3%9F_snack_biscuit_Haitai_Pack_EDO_cracker_April_2020_SS2_02.jpg/960px-HK_food_%E5%B0%8F%E9%A3%9F_snack_biscuit_Haitai_Pack_EDO_cracker_April_2020_SS2_02.jpg",
  "foxtail-millet-noodles": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d5/Thai_Prawn_Noodles_%2822154724644%29.jpg/960px-Thai_Prawn_Noodles_%2822154724644%29.jpg",
  "foxtail-millet-semi-polished": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/28/Foxtailmillet.jpg/960px-Foxtailmillet.jpg",
  "foxtail-millet-vermicelli": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cf/Semiya_payasam.jpg/960px-Semiya_payasam.jpg",
  "fried-native-sirumani-groundnut": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fb/Peanuts_%28Arachis_hypogaea%29_-_in_shell%2C_shell_cracked_open%2C_shelled%2C_peeled.jpg/960px-Peanuts_%28Arachis_hypogaea%29_-_in_shell%2C_shell_cracked_open%2C_shelled%2C_peeled.jpg",
  "fried-rice-balls": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/91/Puffed_Rice_of_Chinna_Salem.jpg/960px-Puffed_Rice_of_Chinna_Salem.jpg",
  "ginger-candy": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bd/HK_food_Made_in_Indonesia_%E8%96%91%E7%B3%96_Ginger_Candy_5-2013_Product_of_Ting_Ting_Jahe_SINA.jpg/960px-HK_food_Made_in_Indonesia_%E8%96%91%E7%B3%96_Ginger_Candy_5-2013_Product_of_Ting_Ting_Jahe_SINA.jpg",
  "green-gram": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9d/Vigna_radiata_256733486.jpg/960px-Vigna_radiata_256733486.jpg",
  "groundnut-balls": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/31/Peanut_Snack_%2826238488870%29.jpg/960px-Peanut_Snack_%2826238488870%29.jpg",
  "groundnut-chikki": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/eb/Peanut_Chikki_in_VA.jpg/960px-Peanut_Chikki_in_VA.jpg",
  "groundnut-coco-mittai": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c8/Caramel_Peanut_Candy_Apples_2592px.jpg/960px-Caramel_Peanut_Candy_Apples_2592px.jpg",
  "hibiscus-biscuits": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0a/Seven_sorts_of_cookies_red.png/960px-Seven_sorts_of_cookies_red.png",
  "himalayan-crystal-salt": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9b/Pink_rock_salt_crystal_3.jpg/960px-Pink_rock_salt_crystal_3.jpg",
  "himalayan-powder-salt": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/46/Himalayan_salt_%28coarse%29.jpg/960px-Himalayan_salt_%28coarse%29.jpg",
  "karupu-kavuni-rice-boiled": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e5/Liaoning_Chaoyang_black_rice.jpg/960px-Liaoning_Chaoyang_black_rice.jpg",
  "karupu-kavuni-rice-noodles": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/05/Pad_See_Ew_%E0%B8%9C%E0%B8%B1%E0%B8%94%E0%B8%8B%E0%B8%B5%E0%B8%AD%E0%B8%B4%E0%B9%8A%E0%B8%A7-_rice_noodles_cooked_in_a_wok_with_chicken%2C_chinese_broccoli%2C_egg%2C_black_soy_sauce.jpg/960px-Pad_See_Ew_%E0%B8%9C%E0%B8%B1%E0%B8%94%E0%B8%8B%E0%B8%B5%E0%B8%AD%E0%B8%B4%E0%B9%8A%E0%B8%A7-_rice_noodles_cooked_in_a_wok_with_chicken%2C_chinese_broccoli%2C_egg%2C_black_soy_sauce.jpg",
  "kattuyanam-rice-boiled": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f2/Kattuyanam_Rice.jpg/960px-Kattuyanam_Rice.jpg",
  "kerala-matta-rice-boiled": "https://upload.wikimedia.org/wikipedia/commons/3/39/Kerala_matta_rice.jpg",
  "koda-millet-biscuits": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7c/Milletcookie.JPG/960px-Milletcookie.JPG",
  "kodo-millet-noodles": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5d/Wheat_Idiyappam_-_traditional_and_healthy_diet.jpg/960px-Wheat_Idiyappam_-_traditional_and_healthy_diet.jpg",
  "kodo-millet-semi-polished": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/62/Starr-170727-0534-Paspalum_scrobiculatum-seedheads-Makamakaole-Maui_-_Flickr_-_Starr_Environmental.jpg/960px-Starr-170727-0534-Paspalum_scrobiculatum-seedheads-Makamakaole-Maui_-_Flickr_-_Starr_Environmental.jpg",
  "kodo-millet-vermicelli": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/49/Vermicelli_Upma.jpg/960px-Vermicelli_Upma.jpg",
  "little-millet-biscuits": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/89/Handmade_shortbread_biscuits.jpg/960px-Handmade_shortbread_biscuits.jpg",
  "little-millet-noodles": "https://upload.wikimedia.org/wikipedia/commons/a/ab/Noodles_with_fried_egg.jpg",
  "little-millet-semi-polished": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/db/Panicum_miliare-2-nallur-yercaud-salem-India.jpg/960px-Panicum_miliare-2-nallur-yercaud-salem-India.jpg",
  "little-millet-vermicelli": "https://upload.wikimedia.org/wikipedia/commons/0/09/Seviyan.JPG",
  "mappillai-samba-flakes": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/08/Rice_flakes_sweet.jpg/960px-Rice_flakes_sweet.jpg",
  "mappillai-samba-rice-boiled": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ab/Jiangxi_red_glutinous_rice.jpg/960px-Jiangxi_red_glutinous_rice.jpg",
  "millet-sweet-chikki": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/25/Peanut_brittle_surface_softly_reflecting_light.jpg/960px-Peanut_brittle_surface_softly_reflecting_light.jpg",
  "moong-dal": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/67/Vigna_radiata_256733484.jpg/960px-Vigna_radiata_256733484.jpg",
  "moth-gram": "https://upload.wikimedia.org/wikipedia/commons/c/c8/Vigna_aconitifolia_Jacquin_1767.jpg",
  "mud-packed-toor-dal": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6b/Pigeon_peas_dried.jpg/960px-Pigeon_peas_dried.jpg",
  "multi-grain-biscuits": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/09/Oatmeal_Cookies_with_orange_zest%2C_golden_raisins%2C_and_chocolate_chips.jpg/960px-Oatmeal_Cookies_with_orange_zest%2C_golden_raisins%2C_and_chocolate_chips.jpg",
  "native-finger-millet": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/31/Food_grain_finger_millet.jpg/960px-Food_grain_finger_millet.jpg",
  "native-pearl-millet": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/01/Pearl_millet_crops_with_grains_in_the_Northern_part_of_Namibia_1.jpg/960px-Pearl_millet_crops_with_grains_in_the_Northern_part_of_Namibia_1.jpg",
  "native-sirumani-groundnut": "https://upload.wikimedia.org/wikipedia/commons/2/2f/Selecting_Groundnut_seeds_for_Planting.jpg",
  "natural-wild-honey": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/24/Three_French_monofloral_honey_jars.jpg/960px-Three_French_monofloral_honey_jars.jpg",
  "palm-jaggery-crystal": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/23/Palmsugar.jpg/960px-Palmsugar.jpg",
  "palm-jaggery-round": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/35/Organic_palm_jaggery.jpg/960px-Organic_palm_jaggery.jpg",
  "pearl-millet-biscuits": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/40/Multi_millet_biscuits.jpg/960px-Multi_millet_biscuits.jpg",
  "pearl-millet-flakes": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/33/Millet_porridge.png/960px-Millet_porridge.png",
  "pearl-millet-vermicelli": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4a/Shevaya_or_Seviyan_or_Vermicelli_Kheer_with_dryfruits.jpg/960px-Shevaya_or_Seviyan_or_Vermicelli_Kheer_with_dryfruits.jpg",
  "pirandai-biscuits": "https://upload.wikimedia.org/wikipedia/commons/4/47/Digestive_biscuits.jpg",
  "ponmani-idly-rice-boiled": "https://upload.wikimedia.org/wikipedia/commons/1/11/Idli_Sambar.JPG",
  "poongar-rice-boiled": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/81/Seven_varieties_of_Rice.jpg/960px-Seven_varieties_of_Rice.jpg",
  "rathasali-rice-boiled": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/de/Germinated_brown_rice_-_medium_grain.jpg/960px-Germinated_brown_rice_-_medium_grain.jpg",
  "seeraga-samba-fully-polished-boiled": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8b/Seeraga_samba_mutton_biriyani_-Home_made-Tamilnadu-IMG_20210411_140551.jpg/960px-Seeraga_samba_mutton_biriyani_-Home_made-Tamilnadu-IMG_20210411_140551.jpg",
  "sesame-balls": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2d/Gur_Rewari_%28a_kind_of_Gajak%29_from_Lucknow%2C_a_traditional_Indian_snack_made_with_Jaggery_and_crunchy_sesame_seeds_in_the_form_of_crispy_bars.jpg/960px-Gur_Rewari_%28a_kind_of_Gajak%29_from_Lucknow%2C_a_traditional_Indian_snack_made_with_Jaggery_and_crunchy_sesame_seeds_in_the_form_of_crispy_bars.jpg",
  "sesame-seedai": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8d/Murukku_variety_02.jpg/960px-Murukku_variety_02.jpg",
  "sugarcane-jaggery-powder": "https://upload.wikimedia.org/wikipedia/commons/c/c0/Jaggery_powder.png",
  "sugarcane-jaggery-round": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ca/Liquid_Jaggery_of_Bangladesh.jpg/960px-Liquid_Jaggery_of_Bangladesh.jpg",
  "thanga-samba-semi-polished-boiled": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/29/Short-grain_rice_%28japonica%29.jpg/960px-Short-grain_rice_%28japonica%29.jpg",
  "thooyamalli-fully-polished-boiled": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8c/Rice_processing_in_South_East_Nigeria18.jpg/960px-Rice_processing_in_South_East_Nigeria18.jpg",
  "thooyamalli-semi-polished-boiled": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3f/JP_%E6%97%A5%E6%9C%AC_Japan_%E4%BA%AC%E9%83%BD_Kyoto_%E5%9B%9B%E6%A2%9D_Shijo_side_Sukiya_Restaurant_food_cooked_steamed_white_rice_June_2026_N13P_01.jpg/960px-JP_%E6%97%A5%E6%9C%AC_Japan_%E4%BA%AC%E9%83%BD_Kyoto_%E5%9B%9B%E6%A2%9D_Shijo_side_Sukiya_Restaurant_food_cooked_steamed_white_rice_June_2026_N13P_01.jpg",
  "thuthuvalai-biscuits": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/59/Peanut_butter_cookies%2C_2015-07-12.jpg/960px-Peanut_butter_cookies%2C_2015-07-12.jpg",
  "toor-dal": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7c/Straucherbsen_%28Toor_Dal%29_in_einem_indischen_Supermarkt.jpeg/960px-Straucherbsen_%28Toor_Dal%29_in_einem_indischen_Supermarkt.jpeg",
  "wheat-flakes": "https://upload.wikimedia.org/wikipedia/commons/e/e7/Wheaties_5.jpg",
  "wheat-flour": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/94/Wheat_flour_%28Obusera%29_2.jpg/960px-Wheat_flour_%28Obusera%29_2.jpg",
  "white-horse-gram": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/64/Sa-horsegram.jpg/960px-Sa-horsegram.jpg",
  "white-sorghum": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/56/Sorghum_grain_boiled.jpg/960px-Sorghum_grain_boiled.jpg",
  "white-sorghum-flakes": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5e/Sorghum_flour.jpg/960px-Sorghum_flour.jpg",
  "white-urad-dal": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6f/Black_gram.jpg/960px-Black_gram.jpg",
  "wood-pressed-coconut-oil": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3e/Coconut_oil_bottle_in_the_background_of_dried_coconuts_from_Kaleeswari_Farm.jpg/960px-Coconut_oil_bottle_in_the_background_of_dried_coconuts_from_Kaleeswari_Farm.jpg",
  "wood-pressed-groundnut-oil": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b9/Groundnut_oils_inside_galloons.jpg/960px-Groundnut_oils_inside_galloons.jpg",
  "wood-pressed-sesame-oil": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/22/Sesame_oil_label.jpg/960px-Sesame_oil_label.jpg",
};


const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400";

function resolveSeedProductImage(slug: string, categorySlug: string): string {
  const exact = PRODUCT_IMAGE_MAP[slug];
  if (exact) return exact;

  const s = slug.toLowerCase();
  const has = (...words: string[]) => words.some((w) => s.includes(w));

  if (has("vermicelli")) return CATEGORY_TYPE_IMAGE["millet-vermicelli"];
  if (has("noodles")) return CATEGORY_TYPE_IMAGE["millet-noodles"];
  if (
    has("biscuits", "chikki", "candy", "burfi", "seedai", "murukku", "mittai") ||
    s.includes("balls") ||
    s.includes("fried") ||
    s.includes("-coco-")
  ) {
    return CATEGORY_TYPE_IMAGE["traditional-snacks-sweets"];
  }
  if (has("flakes")) return CATEGORY_TYPE_IMAGE["millet-rice-flakes"];
  if (has("oil")) return CATEGORY_TYPE_IMAGE["traditional-oils"];
  if (has("honey", "jaggery", "salt")) return CATEGORY_TYPE_IMAGE["natural-sweeteners"];
  if (has("flour")) return CATEGORY_TYPE_IMAGE["healthy-flours"];
  if (s.includes("groundnut")) {
    return CATEGORY_TYPE_IMAGE[categorySlug] || CATEGORY_TYPE_IMAGE["organic-pulses-dals"];
  }
  if (has("gram", "dal", "urad", "toor", "moong")) {
    return CATEGORY_TYPE_IMAGE["organic-pulses-dals"];
  }
  return CATEGORY_TYPE_IMAGE[categorySlug] || FALLBACK_IMAGE;
}

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
    nameTa = "1 à®²à®¿à®Ÿà¯à®Ÿà®°à¯ à®ªà®¾à®Ÿà¯à®Ÿà®¿à®²à¯";
  } else if (code === "500ML") {
    weight = 0.5;
    price = 180;
    nameEn = "500ml Bottle";
    nameTa = "500à®®à®¿.à®²à®¿ à®ªà®¾à®Ÿà¯à®Ÿà®¿à®²à¯";
  } else if (code === "1KG") {
    weight = 1.0;
    price = 160;
    nameEn = "1 Kg Pack";
    nameTa = "1 à®•à®¿à®²à¯‹ à®ªà¯‡à®•à¯";
  } else if (code === "500GM") {
    weight = 0.5;
    price = 85;
    nameEn = "500g Pack";
    nameTa = "500à®•à®¿ à®ªà¯‡à®•à¯";
  } else if (code === "250GM") {
    weight = 0.25;
    price = 45;
    nameEn = "250g Pack";
    nameTa = "250à®•à®¿ à®ªà¯‡à®•à¯";
  } else if (code === "PCS") {
    weight = 0.18;
    price = 65;
    nameEn = "1 Pack (180g)";
    nameTa = "1 à®ªà®¾à®•à¯à®•à¯†à®Ÿà¯ (180à®•à®¿)";
  } else if (code === "BOX") {
    weight = 0.2;
    price = 90;
    nameEn = "1 Box (200g)";
    nameTa = "1 à®ªà¯†à®Ÿà¯à®Ÿà®¿ (200à®•à®¿)";
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
      descTa: `${categoryKey} à®ªà¯Šà®°à¯à®Ÿà¯à®•à®³à¯`,
    };

    const category = await prisma.category.create({
      data: {
        nameEn: meta.nameEn,
        nameTa: meta.nameTa,
        slug: meta.slug,
        descriptionEn: meta.descEn,
        descriptionTa: meta.descTa,
        imageUrl: CATEGORY_TYPE_IMAGE[meta.slug] || FALLBACK_IMAGE,
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
          brand: "Yathu Arokiyagam",
          descriptionEn: `Pure authentic naturally grown ${prodItem.name_en} sourced honestly from farmers without preservatives.`,
          descriptionTa: `à®šà¯à®¤à¯à®¤à®®à®¾à®© à®‡à®¯à®±à¯à®•à¯ˆ à®®à¯à®±à¯ˆà®¯à®¿à®²à¯ à®¤à®¯à®¾à®°à®¿à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿ ${prodItem.name_ta || prodItem.name_en}.`,
          thumbnailUrl: resolveSeedProductImage(prodSlug, meta.slug),
        },
      });
      totalProducts++;

      for (let i = 0; i < prodItem.variants.length; i++) {
        const vCode = prodItem.variants[i];
        const vDetails = getVariantPriceAndWeight(categoryKey, vCode);
        const sku = `YA-${meta.slug.substring(0, 3).toUpperCase()}-P${totalProducts}-${vCode}-${i + 1}`;

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
      { pincode: "625515", city: "Chinnmanur", state: "Tamil Nadu", available: true, estimatedDays: 2, shippingCharge: 40.0, freeDeliveryThreshold: 499.0 },
      { pincode: "625531", city: "Theni", state: "Tamil Nadu", available: true, estimatedDays: 2, shippingCharge: 40.0, freeDeliveryThreshold: 499.0 },
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

