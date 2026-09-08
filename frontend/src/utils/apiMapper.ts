import { ProductType, CategoryType } from '@/types';

const PRODUCT_TYPE_IMAGE = {
  oils: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=600',
  noodles: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&q=80&w=600',
  vermicelli: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=600',
  sweeteners: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=600',
  millets: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600',
  rices: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?auto=format&fit=crop&q=80&w=600',
  flours: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600',
  flakes: 'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?auto=format&fit=crop&q=80&w=600',
  pulses: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&q=80&w=600',
  snacks: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&q=80&w=600',
  produce: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600',
  dairy: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=600',
  beverages: 'https://images.unsplash.com/photo-1523906630133-f6934a1ab26e?auto=format&fit=crop&q=80&w=600',
};

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  'traditional-oils': PRODUCT_TYPE_IMAGE.oils,
  'millet-noodles': PRODUCT_TYPE_IMAGE.noodles,
  'millet-vermicelli': PRODUCT_TYPE_IMAGE.vermicelli,
  'natural-sweeteners': PRODUCT_TYPE_IMAGE.sweeteners,
  'organic-millets': PRODUCT_TYPE_IMAGE.millets,
  'traditional-rices': PRODUCT_TYPE_IMAGE.rices,
  'healthy-flours': PRODUCT_TYPE_IMAGE.flours,
  'millet-rice-flakes': PRODUCT_TYPE_IMAGE.flakes,
  'organic-pulses-dals': PRODUCT_TYPE_IMAGE.pulses,
  'traditional-snacks-sweets': PRODUCT_TYPE_IMAGE.snacks,
  'natural-sweeteners-salts': PRODUCT_TYPE_IMAGE.sweeteners,
  'traditional-heritage-rices': PRODUCT_TYPE_IMAGE.rices,
  'healthy-grain-flours': PRODUCT_TYPE_IMAGE.flours,
  'millet-rice-flakes-aval': PRODUCT_TYPE_IMAGE.flakes,
  'traditional-healthy-snacks-sweets': PRODUCT_TYPE_IMAGE.snacks,
  'fruits-vegetables': PRODUCT_TYPE_IMAGE.produce,
  'dairy-eggs': PRODUCT_TYPE_IMAGE.dairy,
  'honey-spices': PRODUCT_TYPE_IMAGE.sweeteners,
  'grains-flours': PRODUCT_TYPE_IMAGE.flours,
  'beverages': PRODUCT_TYPE_IMAGE.beverages,
};

const DEFAULT_CATEGORY_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400';
const DEFAULT_PRODUCT_IMAGE = '/images/placeholder.svg';
const PRODUCT_IMAGE_MAP: Record<string, string> = {
  'aavarampoo-biscuits': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d3/Sweet_Biscuits_-_Kolkata_2011-11-15_7019.JPG/960px-Sweet_Biscuits_-_Kolkata_2011-11-15_7019.JPG',
  'achu-murukku': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/21/A_Traditional_Tamil_Snack_Murukku_1.jpg/960px-A_Traditional_Tamil_Snack_Murukku_1.jpg',
  'athur-kichili-samba-semi-polished-boiled': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/34/A_white_Ponni_Rice.JPG/960px-A_white_Ponni_Rice.JPG',
  'baloon-vine-biscuits': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/16/Biscuits_perspective.jpg/960px-Biscuits_perspective.jpg',
  'barnyard-millet-biscuits': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/74/Krupuk_Ikan_Cap_Jalu.jpg/960px-Krupuk_Ikan_Cap_Jalu.jpg',
  'barnyard-millet-noodles': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/87/Japanese_Soba_Noodles_Tsuta_-_waiting_queue_%282017-06-29_12.10.28_by_othree%29.jpg/960px-Japanese_Soba_Noodles_Tsuta_-_waiting_queue_%282017-06-29_12.10.28_by_othree%29.jpg',
  'barnyard-millet-semi-polished': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e0/Flowering_of_Echinochloa_crus-galli_plant_%28cockspur_grass_or_barnyard_grass%29.jpg/960px-Flowering_of_Echinochloa_crus-galli_plant_%28cockspur_grass_or_barnyard_grass%29.jpg',
  'barnyard-millet-vermicelli': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fd/Vermicelli_pudding.jpg/960px-Vermicelli_pudding.jpg',
  'black-horse-gram': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/12/Peeled_urad_beans.jpg/960px-Peeled_urad_beans.jpg',
  'black-kavuni-rice-biscuits': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/27/Plates_of_chocolate_chip_cookies_with_walnuts.jpg/960px-Plates_of_chocolate_chip_cookies_with_walnuts.jpg',
  'black-sesame-chikki': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/01/Sesame_Seed_Ball_%28Candy%29.jpg/960px-Sesame_Seed_Ball_%28Candy%29.jpg',
  'black-urad-dal': 'https://upload.wikimedia.org/wikipedia/commons/a/af/Lentejas_veganas_-_Vegan_black_lentils_%285094766956%29.jpg',
  'browntop-millet-semi-polished': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cb/Urochloa_ramosa_252725075.jpg/960px-Urochloa_ramosa_252725075.jpg',
  'castor-oil': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9c/Bottle%2C_castor_oil_%28AM_1969.210-4%29.jpg/960px-Bottle%2C_castor_oil_%28AM_1969.210-4%29.jpg',
  'coconut-burfi': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ab/Besan_Ki_Barfi_Recipe_by_Sonia_Goyal.jpg/960px-Besan_Ki_Barfi_Recipe_by_Sonia_Goyal.jpg',
  'finger-millet-biscuits': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ac/Biscuiterie_Alpes_Biscuits_Estrablin_05.jpg/960px-Biscuiterie_Alpes_Biscuits_Estrablin_05.jpg',
  'finger-millet-flakes': 'https://upload.wikimedia.org/wikipedia/commons/5/55/Ragi_Porridge.jpg',
  'finger-millet-flour': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ac/Ragi_millet_flour.jpg/960px-Ragi_millet_flour.jpg',
  'finger-millet-noodles': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/ff/Egg_Noodles_1.jpg/960px-Egg_Noodles_1.jpg',
  'foxtail-millet-biscuits': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fd/HK_food_%E5%B0%8F%E9%A3%9F_snack_biscuit_Haitai_Pack_EDO_cracker_April_2020_SS2_02.jpg/960px-HK_food_%E5%B0%8F%E9%A3%9F_snack_biscuit_Haitai_Pack_EDO_cracker_April_2020_SS2_02.jpg',
  'foxtail-millet-noodles': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d5/Thai_Prawn_Noodles_%2822154724644%29.jpg/960px-Thai_Prawn_Noodles_%2822154724644%29.jpg',
  'foxtail-millet-semi-polished': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/28/Foxtailmillet.jpg/960px-Foxtailmillet.jpg',
  'foxtail-millet-vermicelli': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cf/Semiya_payasam.jpg/960px-Semiya_payasam.jpg',
  'fried-native-sirumani-groundnut': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fb/Peanuts_%28Arachis_hypogaea%29_-_in_shell%2C_shell_cracked_open%2C_shelled%2C_peeled.jpg/960px-Peanuts_%28Arachis_hypogaea%29_-_in_shell%2C_shell_cracked_open%2C_shelled%2C_peeled.jpg',
  'fried-rice-balls': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/91/Puffed_Rice_of_Chinna_Salem.jpg/960px-Puffed_Rice_of_Chinna_Salem.jpg',
  'ginger-candy': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bd/HK_food_Made_in_Indonesia_%E8%96%91%E7%B3%96_Ginger_Candy_5-2013_Product_of_Ting_Ting_Jahe_SINA.jpg/960px-HK_food_Made_in_Indonesia_%E8%96%91%E7%B3%96_Ginger_Candy_5-2013_Product_of_Ting_Ting_Jahe_SINA.jpg',
  'green-gram': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9d/Vigna_radiata_256733486.jpg/960px-Vigna_radiata_256733486.jpg',
  'groundnut-balls': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/31/Peanut_Snack_%2826238488870%29.jpg/960px-Peanut_Snack_%2826238488870%29.jpg',
  'groundnut-chikki': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/eb/Peanut_Chikki_in_VA.jpg/960px-Peanut_Chikki_in_VA.jpg',
  'groundnut-coco-mittai': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c8/Caramel_Peanut_Candy_Apples_2592px.jpg/960px-Caramel_Peanut_Candy_Apples_2592px.jpg',
  'hibiscus-biscuits': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0a/Seven_sorts_of_cookies_red.png/960px-Seven_sorts_of_cookies_red.png',
  'himalayan-crystal-salt': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9b/Pink_rock_salt_crystal_3.jpg/960px-Pink_rock_salt_crystal_3.jpg',
  'himalayan-powder-salt': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/46/Himalayan_salt_%28coarse%29.jpg/960px-Himalayan_salt_%28coarse%29.jpg',
  'karupu-kavuni-rice-boiled': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e5/Liaoning_Chaoyang_black_rice.jpg/960px-Liaoning_Chaoyang_black_rice.jpg',
  'karupu-kavuni-rice-noodles': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/05/Pad_See_Ew_%E0%B8%9C%E0%B8%B1%E0%B8%94%E0%B8%8B%E0%B8%B5%E0%B8%AD%E0%B8%B4%E0%B9%8A%E0%B8%A7-_rice_noodles_cooked_in_a_wok_with_chicken%2C_chinese_broccoli%2C_egg%2C_black_soy_sauce.jpg/960px-Pad_See_Ew_%E0%B8%9C%E0%B8%B1%E0%B8%94%E0%B8%8B%E0%B8%B5%E0%B8%AD%E0%B8%B4%E0%B9%8A%E0%B8%A7-_rice_noodles_cooked_in_a_wok_with_chicken%2C_chinese_broccoli%2C_egg%2C_black_soy_sauce.jpg',
  'kattuyanam-rice-boiled': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f2/Kattuyanam_Rice.jpg/960px-Kattuyanam_Rice.jpg',
  'kerala-matta-rice-boiled': 'https://upload.wikimedia.org/wikipedia/commons/3/39/Kerala_matta_rice.jpg',
  'koda-millet-biscuits': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7c/Milletcookie.JPG/960px-Milletcookie.JPG',
  'kodo-millet-noodles': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5d/Wheat_Idiyappam_-_traditional_and_healthy_diet.jpg/960px-Wheat_Idiyappam_-_traditional_and_healthy_diet.jpg',
  'kodo-millet-semi-polished': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/62/Starr-170727-0534-Paspalum_scrobiculatum-seedheads-Makamakaole-Maui_-_Flickr_-_Starr_Environmental.jpg/960px-Starr-170727-0534-Paspalum_scrobiculatum-seedheads-Makamakaole-Maui_-_Flickr_-_Starr_Environmental.jpg',
  'kodo-millet-vermicelli': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/49/Vermicelli_Upma.jpg/960px-Vermicelli_Upma.jpg',
  'little-millet-biscuits': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/89/Handmade_shortbread_biscuits.jpg/960px-Handmade_shortbread_biscuits.jpg',
  'little-millet-noodles': 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Noodles_with_fried_egg.jpg',
  'little-millet-semi-polished': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/db/Panicum_miliare-2-nallur-yercaud-salem-India.jpg/960px-Panicum_miliare-2-nallur-yercaud-salem-India.jpg',
  'little-millet-vermicelli': 'https://upload.wikimedia.org/wikipedia/commons/0/09/Seviyan.JPG',
  'mappillai-samba-flakes': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/08/Rice_flakes_sweet.jpg/960px-Rice_flakes_sweet.jpg',
  'mappillai-samba-rice-boiled': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ab/Jiangxi_red_glutinous_rice.jpg/960px-Jiangxi_red_glutinous_rice.jpg',
  'millet-sweet-chikki': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/25/Peanut_brittle_surface_softly_reflecting_light.jpg/960px-Peanut_brittle_surface_softly_reflecting_light.jpg',
  'moong-dal': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/67/Vigna_radiata_256733484.jpg/960px-Vigna_radiata_256733484.jpg',
  'moth-gram': 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Vigna_aconitifolia_Jacquin_1767.jpg',
  'mud-packed-toor-dal': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6b/Pigeon_peas_dried.jpg/960px-Pigeon_peas_dried.jpg',
  'multi-grain-biscuits': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/09/Oatmeal_Cookies_with_orange_zest%2C_golden_raisins%2C_and_chocolate_chips.jpg/960px-Oatmeal_Cookies_with_orange_zest%2C_golden_raisins%2C_and_chocolate_chips.jpg',
  'native-finger-millet': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/31/Food_grain_finger_millet.jpg/960px-Food_grain_finger_millet.jpg',
  'native-pearl-millet': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/01/Pearl_millet_crops_with_grains_in_the_Northern_part_of_Namibia_1.jpg/960px-Pearl_millet_crops_with_grains_in_the_Northern_part_of_Namibia_1.jpg',
  'native-sirumani-groundnut': 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Selecting_Groundnut_seeds_for_Planting.jpg',
  'natural-wild-honey': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/24/Three_French_monofloral_honey_jars.jpg/960px-Three_French_monofloral_honey_jars.jpg',
  'palm-jaggery-crystal': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/23/Palmsugar.jpg/960px-Palmsugar.jpg',
  'palm-jaggery-round': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/35/Organic_palm_jaggery.jpg/960px-Organic_palm_jaggery.jpg',
  'pearl-millet-biscuits': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/40/Multi_millet_biscuits.jpg/960px-Multi_millet_biscuits.jpg',
  'pearl-millet-flakes': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/33/Millet_porridge.png/960px-Millet_porridge.png',
  'pearl-millet-vermicelli': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4a/Shevaya_or_Seviyan_or_Vermicelli_Kheer_with_dryfruits.jpg/960px-Shevaya_or_Seviyan_or_Vermicelli_Kheer_with_dryfruits.jpg',
  'pirandai-biscuits': 'https://upload.wikimedia.org/wikipedia/commons/4/47/Digestive_biscuits.jpg',
  'ponmani-idly-rice-boiled': 'https://upload.wikimedia.org/wikipedia/commons/1/11/Idli_Sambar.JPG',
  'poongar-rice-boiled': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/81/Seven_varieties_of_Rice.jpg/960px-Seven_varieties_of_Rice.jpg',
  'rathasali-rice-boiled': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/de/Germinated_brown_rice_-_medium_grain.jpg/960px-Germinated_brown_rice_-_medium_grain.jpg',
  'seeraga-samba-fully-polished-boiled': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8b/Seeraga_samba_mutton_biriyani_-Home_made-Tamilnadu-IMG_20210411_140551.jpg/960px-Seeraga_samba_mutton_biriyani_-Home_made-Tamilnadu-IMG_20210411_140551.jpg',
  'sesame-balls': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2d/Gur_Rewari_%28a_kind_of_Gajak%29_from_Lucknow%2C_a_traditional_Indian_snack_made_with_Jaggery_and_crunchy_sesame_seeds_in_the_form_of_crispy_bars.jpg/960px-Gur_Rewari_%28a_kind_of_Gajak%29_from_Lucknow%2C_a_traditional_Indian_snack_made_with_Jaggery_and_crunchy_sesame_seeds_in_the_form_of_crispy_bars.jpg',
  'sesame-seedai': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8d/Murukku_variety_02.jpg/960px-Murukku_variety_02.jpg',
  'sugarcane-jaggery-powder': 'https://upload.wikimedia.org/wikipedia/commons/c/c0/Jaggery_powder.png',
  'sugarcane-jaggery-round': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ca/Liquid_Jaggery_of_Bangladesh.jpg/960px-Liquid_Jaggery_of_Bangladesh.jpg',
  'thanga-samba-semi-polished-boiled': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/29/Short-grain_rice_%28japonica%29.jpg/960px-Short-grain_rice_%28japonica%29.jpg',
  'thooyamalli-fully-polished-boiled': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8c/Rice_processing_in_South_East_Nigeria18.jpg/960px-Rice_processing_in_South_East_Nigeria18.jpg',
  'thooyamalli-semi-polished-boiled': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3f/JP_%E6%97%A5%E6%9C%AC_Japan_%E4%BA%AC%E9%83%BD_Kyoto_%E5%9B%9B%E6%A2%9D_Shijo_side_Sukiya_Restaurant_food_cooked_steamed_white_rice_June_2026_N13P_01.jpg/960px-JP_%E6%97%A5%E6%9C%AC_Japan_%E4%BA%AC%E9%83%BD_Kyoto_%E5%9B%9B%E6%A2%9D_Shijo_side_Sukiya_Restaurant_food_cooked_steamed_white_rice_June_2026_N13P_01.jpg',
  'thuthuvalai-biscuits': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/59/Peanut_butter_cookies%2C_2015-07-12.jpg/960px-Peanut_butter_cookies%2C_2015-07-12.jpg',
  'toor-dal': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7c/Straucherbsen_%28Toor_Dal%29_in_einem_indischen_Supermarkt.jpeg/960px-Straucherbsen_%28Toor_Dal%29_in_einem_indischen_Supermarkt.jpeg',
  'wheat-flakes': 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Wheaties_5.jpg',
  'wheat-flour': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/94/Wheat_flour_%28Obusera%29_2.jpg/960px-Wheat_flour_%28Obusera%29_2.jpg',
  'white-horse-gram': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/64/Sa-horsegram.jpg/960px-Sa-horsegram.jpg',
  'white-sorghum': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/56/Sorghum_grain_boiled.jpg/960px-Sorghum_grain_boiled.jpg',
  'white-sorghum-flakes': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5e/Sorghum_flour.jpg/960px-Sorghum_flour.jpg',
  'white-urad-dal': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6f/Black_gram.jpg/960px-Black_gram.jpg',
  'wood-pressed-coconut-oil': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3e/Coconut_oil_bottle_in_the_background_of_dried_coconuts_from_Kaleeswari_Farm.jpg/960px-Coconut_oil_bottle_in_the_background_of_dried_coconuts_from_Kaleeswari_Farm.jpg',
  'wood-pressed-groundnut-oil': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b9/Groundnut_oils_inside_galloons.jpg/960px-Groundnut_oils_inside_galloons.jpg',
  'wood-pressed-sesame-oil': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/22/Sesame_oil_label.jpg/960px-Sesame_oil_label.jpg',
};


export function resolveProductImage(slug: string, categorySlug: string): string {
  const exact = PRODUCT_IMAGE_MAP[slug];
  if (exact) return exact;

  const s = (slug || '').toLowerCase();
  const has = (...words: string[]) => words.some((w) => s.includes(w));

  if (has('vermicelli')) return PRODUCT_TYPE_IMAGE.vermicelli;
  if (has('noodles')) return PRODUCT_TYPE_IMAGE.noodles;
  if (has('biscuits', 'chikki', 'candy', 'burfi', 'seedai', 'murukku', 'mittai')
    || s.includes('balls')
    || s.includes('fried')
    || s.includes('-coco-')) return PRODUCT_TYPE_IMAGE.snacks;
  if (has('flakes')) return PRODUCT_TYPE_IMAGE.flakes;
  if (has('oil')) return PRODUCT_TYPE_IMAGE.oils;
  if (has('honey', 'jaggery', 'salt')) return PRODUCT_TYPE_IMAGE.sweeteners;
  if (has('flour')) return PRODUCT_TYPE_IMAGE.flours;
  if (s.includes('groundnut')) return CATEGORY_IMAGE_MAP[categorySlug] || PRODUCT_TYPE_IMAGE.pulses;
  if (has('gram', 'dal', 'urad', 'toor', 'moong')) return PRODUCT_TYPE_IMAGE.pulses;

  return CATEGORY_IMAGE_MAP[categorySlug] || CATEGORY_IMAGE_MAP['fruits-vegetables'] || DEFAULT_PRODUCT_IMAGE;
}

export function mapCategoryToFrontend(backendCategory: any): CategoryType {
  const slug = backendCategory.slug;
  const rawImage = backendCategory.imageUrl || '';

  const isPlaceholderUrl = !rawImage || rawImage.includes('yathu/categories/');
  const image = isPlaceholderUrl ? (CATEGORY_IMAGE_MAP[slug] || DEFAULT_CATEGORY_IMAGE) : rawImage;

  return {
    id: backendCategory.id,
    name: backendCategory.nameEn,
    nameTamil: backendCategory.nameTa || undefined,
    slug: slug,
    image: image,
    itemCount: backendCategory._count?.products ?? 0,
  };
}

export function mapProductToFrontend(backendProduct: any): ProductType {
  const firstVariant = backendProduct.variants?.[0];
  const rawImage = backendProduct.thumbnailUrl || firstVariant?.images?.[0] || '';
  const isPlaceholderUrl = !rawImage || rawImage.includes('yathu/products/') || rawImage.includes('placeholder');

  const image = isPlaceholderUrl
    ? resolveProductImage(backendProduct.slug, backendProduct.category?.slug)
    : rawImage;

  const stock = firstVariant?.inventory?.availableQuantity ?? 0;
  const price = firstVariant?.price ? Number(firstVariant.price) : 0;
const unit = firstVariant?.weight
    ? `${firstVariant.weight}${firstVariant.unit || 'kg'}`
    : firstVariant?.nameEn || '1 unit';

  return {
    id: backendProduct.id,
    name: backendProduct.nameEn,
    nameTamil: backendProduct.nameTa || undefined,
    description: backendProduct.descriptionEn || '',
    descriptionTamil: backendProduct.descriptionTa || undefined,
    price: price,
    images: [image],
    category: backendProduct.category?.nameEn || 'General',
    stock: stock,
    rating: backendProduct.rating ? Number(backendProduct.rating) : 4.5,
    reviewsCount: backendProduct.reviewsCount ?? 0,
    isOrganic: backendProduct.isOrganic ?? true,
    isLabTested: backendProduct.isLabTested ?? false,
    unit: unit,
  };
}

