# HOME PAGE SPECIFICATION

## Page Goal
Convert visitors into buyers. Show trust, products, and value immediately.

## Sections (Top to Bottom)

### 1. ANNOUNCEMENT BAR
- Height: 36px desktop / 32px mobile
- BG: #1B4332 (Primary Dark)
- Text: White, 12px, Inter
- Content: "Free Delivery on ₹499+ | 📞 +91-XXX | EN | தமிழ்"
- Dismissible: Yes (X button, sessionStorage)
- Animation: None (keep it simple)

### 2. NAVBAR
- See: docs/design-system/05-components.md → Navbar
- Sticky: Yes
- Transparent on hero, white on scroll

### 3. HERO BANNER
- Type: Full-width carousel, 3 slides minimum
- Height: 80vh desktop / 60vh tablet / 50vh mobile
- Each slide:
  - Background image (Ken Burns zoom animation)
  - Dark overlay gradient (bottom to top)
  - Left-aligned content block
  - Heading: Playfair Display, 48px desktop / 28px mobile
  - Subheading: Inter, 18px desktop / 14px mobile
  - 2 buttons: Primary CTA + Ghost CTA
- Controls: Dots bottom-center, Arrows (hidden mobile)
- Auto-play: 5s, pause on hover
- Swipe: enabled on touch devices

### 4. TRUST BAR
- 4 items horizontal (2x2 grid on mobile)
- Icons: Lucide icons
- Items: 🚛 Free Delivery | 🌱 100% Organic | 💯 Lab Tested | 🔒 Secure Pay
- BG: #F0FFF4 (lightest green)
- Animation: fade-up on scroll

### 5. CATEGORY SECTION
- Heading: "Shop by Category" — centered
- Layout: 5-6 cards in a row (desktop), horizontal scroll (mobile)
- Each card: circular image + category name + item count
- Hover: lift + scale image
- Click: goes to /shop?category=xxx

### 6. BEST SELLERS
- Heading: "Best Sellers" (left) + "View All →" link (right)
- Layout: 4 cards per row desktop / 2 per row mobile
- Show: 8 products
- Use: ProductCard component
- Animation: stagger fade-up

### 7. PROMO BANNER
- Full width, 300px height
- BG: gradient or parallax image
- Content: Offer text + coupon code + CTA
- Parallax: subtle (desktop only)
- Mobile: static image, no parallax

### 8. NEW ARRIVALS
- Same layout as Best Sellers
- Carousel/swipeable on mobile
- Show: 8 products

### 9. WHY CHOOSE US
- 4 feature blocks in grid
- Each: icon + title + short description
- BG: white
- Animation: stagger fade-up

### 10. TESTIMONIALS
- Carousel, auto-play 4s
- Each: stars + quote + avatar + name + location + "Verified Buyer"
- Touch swipeable
- BG: #F8F9FA

### 11. BLOG PREVIEW
- 3 blog cards horizontal
- Horizontal scroll on mobile
- Each: image + date + title + excerpt + Read More

### 12. NEWSLETTER
- Full width section
- BG: Primary Green gradient
- Email input + Subscribe button
- Privacy text below

### 13. FOOTER
- BG: #1B4332
- 4 columns desktop / accordion mobile
- Logo + About | Quick Links | Customer | Social

## FLOATING ELEMENTS
- WhatsApp Chat button: bottom-right, always visible
- Back to Top button: bottom-right, appears after 300px scroll
- Mobile Bottom Nav: 5 items (Home/Shop/Search/Wishlist/Account)
