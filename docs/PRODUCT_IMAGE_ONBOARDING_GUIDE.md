# Product Image Onboarding & Cloudinary Integration Guide
**Brand**: Yathu Arokiyagam (யது ஆரோக்கியகம்)  
**Target Audience**: Client / Photography Team, Catalog Manager, Developer Team  
**Document Version**: 1.0.0  
**Date**: September 2026  

---

## 1. Overview & Objectives

This document defines the complete standard operating procedure (SOP) for collecting, standardizing, uploading, and linking product images for all **85 catalog products** listed in `ProductListForWebsite.xlsx`.

Following this guide ensures:
1. High visual quality and consistency across the e-commerce storefront.
2. Fast page load performance via optimized image dimensions.
3. Automated database mapping via Cloudinary slug matching without manual one-by-one database updates.

---

## 2. Client Photography & Image Standards

Please share these exact requirements with the client or photography team prior to taking or editing product photos:

### Technical Specifications
* **Aspect Ratio**: `1:1` (Square) — Mandatory for uniform product grids.
* **Resolution**: `800 x 800 px` minimum (`1000 x 1000 px` recommended).
* **File Formats**: `.jpg`, `.png`, or `.webp`.
* **File Size**: Below **1.5 MB** per photo.
* **Background**: Clean solid white or light neutral/natural background.
* **Framing**: Centered product with 10–15% padding on all edges.

---

## 3. Image Naming Convention & Directory Structure

> [!IMPORTANT]
> To enable automated matching between the website catalog and Cloudinary, every image file **MUST** be named using the exact lowercased English product slug with hyphens.

### Storage Folder Structure (Google Drive / OneDrive)
Organize folders by category so images can be reviewed and uploaded systematically:
```text
📦 Yathu_Product_Images/
├── 📁 01_Oils/
│   ├── wood-pressed-grountnut-oil.jpg
│   ├── wood-pressed-seasame-oil.jpg
│   └── ...
├── 📁 02_Noodles/
├── 📁 03_Vermicelli/
├── 📁 04_Sweetner/
├── 📁 05_Millets/
├── 📁 06_Traditional_Rices/
├── 📁 07_Flours/
├── 📁 08_Flakes/
├── 📁 09_Pulses/
└── 📁 10_Snacks/
```

---

## 4. Master Product-to-Filename Reference Table (85 Items)

Use this table as the master checklist when naming photo files for the client catalog:

### 1. Traditional Oils (4 Items)
| S.No | Product Name (English) | Product Name (Tamil) | Target Image Filename |
| :--- | :--- | :--- | :--- |
| 1 | Wood Pressed Grountnut Oil | மரச்செக்கு கடலை எண்ணெய் | `wood-pressed-grountnut-oil.jpg` |
| 2 | Wood Pressed Seasame Oil | மரச்செக்கு நல்லெண்ணெய் | `wood-pressed-seasame-oil.jpg` |
| 3 | Wood Pressed Coconut Oil | மரச்செக்கு தேங்காய் எண்ணெய் | `wood-pressed-coconut-oil.jpg` |
| 4 | Castor Oil | ஆமணக்கு எண்ணெய் | `castor-oil.jpg` |

### 2. Millet Noodles (6 Items)
| S.No | Product Name (English) | Product Name (Tamil) | Target Image Filename |
| :--- | :--- | :--- | :--- |
| 5 | Kodo Millet Noodles | வரகு நூடுல்ஸ் | `kodo-millet-noodles.jpg` |
| 6 | Little Millet Noodles | சாமை நூடுல்ஸ் | `little-millet-noodles.jpg` |
| 7 | Barnyard Millet Noodles | குதிரைவாலி நூடுல்ஸ் | `barnyard-millet-noodles.jpg` |
| 8 | Foxtail Millet Noodles | தினை நூடுல்ஸ் | `foxtail-millet-noodles.jpg` |
| 9 | Finger Millet Noodles | ராகி நூடுல்ஸ் | `finger-millet-noodles.jpg` |
| 10 | Karupu Kavuni Rice Noodles | கருப்பு கவுனி நூடுல்ஸ் | `karupu-kavuni-rice-noodles.jpg` |

### 3. Millet Vermicelli (5 Items)
| S.No | Product Name (English) | Product Name (Tamil) | Target Image Filename |
| :--- | :--- | :--- | :--- |
| 11 | Kodo Millet Vermicelli | வரகு சேமியா | `kodo-millet-vermicelli.jpg` |
| 12 | Little Millet Vermicelli | சாமை சேமியா | `little-millet-vermicelli.jpg` |
| 13 | Barnyard Millet Vermicelli | குதிரைவாலி சேமியா | `barnyard-millet-vermicelli.jpg` |
| 14 | Foxtail Millet Vermicelli | திணை சேமியா | `foxtail-millet-vermicelli.jpg` |
| 15 | Pearl Millet Vermicelli | கம்பு சேமியா | `pearl-millet-vermicelli.jpg` |

### 4. Natural Sweeteners & Salts (7 Items)
| S.No | Product Name (English) | Product Name (Tamil) | Target Image Filename |
| :--- | :--- | :--- | :--- |
| 16 | Sugarcane Jaggery Powder | நாட்டு சர்க்கரை | `sugarcane-jaggery-powder.jpg` |
| 17 | Sugarcane Jaggery Round | உருண்டை வெல்லம் | `sugarcane-jaggery-round.jpg` |
| 18 | Palm Jaggery Round | பனங்கருப்பட்டி | `palm-jaggery-round.jpg` |
| 19 | Palm Jaggery Crystal | பனங்கற்கண்டு | `palm-jaggery-crystal.jpg` |
| 20 | Honey | தேன் | `honey.jpg` |
| 21 | Himalayan Powder Salt | இந்துப்பு தூள் | `himalayan-powder-salt.jpg` |
| 22 | Himalayan Crystal Salt | இந்துப்பு கல் | `himalayan-crystal-salt.jpg` |

### 5. Organic Millets (8 Items)
| S.No | Product Name (English) | Product Name (Tamil) | Target Image Filename |
| :--- | :--- | :--- | :--- |
| 23 | Kodo Millet Semi Polished | வரகு | `kodo-millet-semi-polished.jpg` |
| 24 | Little Millet Semi Polished | சாமை | `little-millet-semi-polished.jpg` |
| 25 | Barnyard Millet Semi Polished | குதிரைவாலி | `barnyard-millet-semi-polished.jpg` |
| 26 | Foxtail Millet Semi Polished | திணை | `foxtail-millet-semi-polished.jpg` |
| 27 | Browntop Millet Semi Polished | குல சாமை | `browntop-millet-semi-polished.jpg` |
| 28 | Native Pearl Millet | நாட்டு கம்பு | `native-pearl-millet.jpg` |
| 29 | Native Finger Millet | நாட்டு ராகி | `native-finger-millet.jpg` |
| 30 | White Sorghum | வெள்ளை சோளம் | `white-sorghum.jpg` |

### 6. Traditional Heritage Rices (12 Items)
| S.No | Product Name (English) | Product Name (Tamil) | Target Image Filename |
| :--- | :--- | :--- | :--- |
| 31 | Thooyamalli Semi Polished Boiled | தூயமல்லி | `thooyamalli-semi-polished-boiled.jpg` |
| 32 | Thooyamalli Fully Polished Boiled | தூயமல்லி | `thooyamalli-fully-polished-boiled.jpg` |
| 33 | Athur Kichili Samba Semi Polished Boiled | ஆத்தூர் கிச்சிலி சம்பா | `athur-kichili-samba-semi-polished-boiled.jpg` |
| 34 | Thanga Samba Semi Polished Boiled | தங்க சம்பா | `thanga-samba-semi-polished-boiled.jpg` |
| 35 | Seeraga Samba Fully Polished Boiled | சீரக சம்பா | `seeraga-samba-fully-polished-boiled.jpg` |
| 36 | Karupu Kavuni Rice Boiled | கருப்பு கவுனி | `karupu-kavuni-rice-boiled.jpg` |
| 37 | Mappillai Samba Rice Boiled | மாப்பிள்ளை சம்பா | `mappillai-samba-rice-boiled.jpg` |
| 38 | Kerala Matta Rice Boiled | கேரள மட்டை அரிசி | `kerala-matta-rice-boiled.jpg` |
| 39 | Kattuyanam Rice Boiled | காட்டுயானம் | `kattuyanam-rice-boiled.jpg` |
| 40 | Rathasali Rice Boiled | இரத்தசாலி | `rathasali-rice-boiled.jpg` |
| 41 | Poongar Rice Boiled | பூங்கார் | `poongar-rice-boiled.jpg` |
| 42 | Ponmani Idly Rice Boiled | பொன்மணி இட்லி அரிசி | `ponmani-idly-rice-boiled.jpg` |

### 7. Healthy Flours (2 Items)
| S.No | Product Name (English) | Product Name (Tamil) | Target Image Filename |
| :--- | :--- | :--- | :--- |
| 43 | Wheat Flour | கோதுமை மாவு | `wheat-flour.jpg` |
| 44 | Finger Millet Flour | ராகி மாவு | `finger-millet-flour.jpg` |

### 8. Flakes - Aval (5 Items)
| S.No | Product Name (English) | Product Name (Tamil) | Target Image Filename |
| :--- | :--- | :--- | :--- |
| 45 | Mappillai Samba Flakes | மாப்பிள்ளை சம்பா அவல் | `mappillai-samba-flakes.jpg` |
| 46 | Wheat Flakes | கோதுமை அவல் | `wheat-flakes.jpg` |
| 47 | Finger Millet Flakes | ராகி அவல் | `finger-millet-flakes.jpg` |
| 48 | Pearl Millet Flakes | கம்பு அவல் | `pearl-millet-flakes.jpg` |
| 49 | White Sorghum Flakes | சோளம் அவல் | `white-sorghum-flakes.jpg` |

### 9. Organic Pulses & Dals (10 Items)
| S.No | Product Name (English) | Product Name (Tamil) | Target Image Filename |
| :--- | :--- | :--- | :--- |
| 50 | Native Sirumani Groundnut | சிறுமணி நாட்டு நிலக்கடலை | `native-sirumani-groundnut.jpg` |
| 51 | Moth Gram | நரிப்பயறு | `moth-gram.jpg` |
| 52 | Green Gram | பச்சை பயறு | `green-gram.jpg` |
| 53 | White Horse Gram | வெள்ளை கொள்ளு பயறு | `white-horse-gram.jpg` |
| 54 | Black Horse Gram | கருப்பு கொள்ளு பயறு | `black-horse-gram.jpg` |
| 55 | White Urad Dal | வெள்ளை உளுந்து பருப்பு | `white-urad-dal.jpg` |
| 56 | Black Urad Dal | கருப்பு உளுந்து  பருப்பு | `black-urad-dal.jpg` |
| 57 | Toor Dal | துவரம் பருப்பு | `toor-dal.jpg` |
| 58 | Mud-Packed Toor Dal | மண்கட்டிய துவரம் பருப்பு | `mud-packed-toor-dal.jpg` |
| 59 | Moong Dal | பாசிப்பருப்பு | `moong-dal.jpg` |

### 10. Traditional Healthy Snacks & Sweets (26 Items)
| S.No | Product Name (English) | Product Name (Tamil) | Target Image Filename |
| :--- | :--- | :--- | :--- |
| 60 | Baloon Vine Biscuits | முடக்கத்தான் பிஸ்கட் | `baloon-vine-biscuits.jpg` |
| 61 | Aavarampoo Biscuits | ஆவாரம்பூ பிஸ்கட் | `aavarampoo-biscuits.jpg` |
| 62 | Hibiscus Biscuits | செம்பருத்தி பிஸ்கட் | `hibiscus-biscuits.jpg` |
| 63 | Thuthuvalai Biscuits | தூதுவளை பிஸ்கட் | `thuthuvalai-biscuits.jpg` |
| 64 | Pirandai Biscuits | பிரண்டை பிஸ்கட் | `pirandai-biscuits.jpg` |
| 65 | Pearl Millet Biscuits | கம்பு பிஸ்கட் | `pearl-millet-biscuits.jpg` |
| 66 | Sorghum Millet Biscuits | சோளம் பிஸ்கட் | `sorghum-millet-biscuits.jpg` |
| 67 | Finger Millet Biscuits | ராகி பிஸ்கட் | `finger-millet-biscuits.jpg` |
| 68 | Multi Grain Biscuits | நவதானிய பிஸ்கட் | `multi-grain-biscuits.jpg` |
| 69 | Black Kavuni Rice Biscuits | கருப்பு கவுனி பிஸ்கட் | `black-kavuni-rice-biscuits.jpg` |
| 70 | Koda Millet Biscuits | வரகு பிஸ்கட் | `koda-millet-biscuits.jpg` |
| 71 | Foxtail Millet Biscuits | தினை பிஸ்கட் | `foxtail-millet-biscuits.jpg` |
| 72 | Little Millet Biscuits | சாமை பிஸ்கட் | `little-millet-biscuits.jpg` |
| 73 | Barnyard Millet Biscuits | குதிரைவாலி பிஸ்கட் | `barnyard-millet-biscuits.jpg` |
| 74 | Groundnut Balls | நிலக்கடலை உருண்டை | `groundnut-balls.jpg` |
| 75 | Sesame Balls | எள்ளு உருண்டை | `sesame-balls.jpg` |
| 76 | Groundnut Chikki | கடலை மிட்டாய் | `groundnut-chikki.jpg` |
| 77 | Black Sesame Chikki | எள்ளு மிட்டாய் | `black-sesame-chikki.jpg` |
| 78 | Groundnut Coco Mittai | கோகோ மிட்டாய் | `groundnut-coco-mittai.jpg` |
| 79 | Millet Sweet Chikki | சிறுதானிய மிட்டாய் | `millet-sweet-chikki.jpg` |
| 80 | Fried Rice Balls | பொரி உருண்டை | `fried-rice-balls.jpg` |
| 81 | Ginger Candy | இஞ்சி மரப்பா | `ginger-candy.jpg` |
| 82 | Coconut Burfi | தேங்காய் பர்பி | `coconut-burfi.jpg` |
| 83 | Sesame Seedai | எள்ளு சீடை | `sesame-seedai.jpg` |
| 84 | Achu Murukku | அச்சு முறுக்கு | `achu-murukku.jpg` |
| 85 | Fried Native Sirumani Groundnut | வறுத்த சிறுமணி நாட்டு நிலக்கடலை | `fried-native-sirumani-groundnut.jpg` |

---

## 5. Technical Implementation & Deployment Steps

### Step 5.1: Bulk Cloudinary Upload
Once the client provides the photos adhering to the filenames listed above:
1. Log into your **Cloudinary Dashboard**.
2. Navigate to Media Library -> `yathu` -> `products/`.
3. Drag and drop all 85 images. Cloudinary will assign public IDs matching the filenames (e.g., `yathu/products/wood-pressed-grountnut-oil`).

### Step 5.2: Database Synchronization
Run the database seed command from the `backend/` workspace:
```bash
cd backend
npx prisma db seed
```

This populates each product's `thumbnailUrl` field automatically:
```typescript
thumbnailUrl: `https://res.cloudinary.com/yathu-arokiyagam/image/upload/v1/yathu/products/${prodSlug}.jpg`
```

### Step 5.3: Individual Image Updates (Admin CMS API)
For individual image changes or future updates, use the backend CMS route:
* **Endpoint**: `PATCH /api/v1/admin/cms/products/:id/image`
* **Headers**: `Authorization: Bearer <ADMIN_JWT>`
* **Body**: `multipart/form-data` with `image` file field.
