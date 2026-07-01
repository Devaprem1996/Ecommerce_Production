# AGENT MASTER RULES — E-Commerce Website

## AGENT BEHAVIOR RULES

### RULE 1: ALWAYS READ BEFORE BUILDING
- Read ALL files in /docs folder, including /docs/auth/ and /docs/pages/, before writing any code
- Read design-system/ before building any component
- Read ux-rules/ before building any page
- Read features/ before implementing any feature

### RULE 2: TECH STACK (NEVER DEVIATE)
- Framework    : Next.js 14+ (App Router)
- Styling      : Tailwind CSS 3.4+
- Components   : ShadCN/UI as base
- Animations   : Framer Motion
- Icons        : Lucide React
- Language     : TypeScript
- State        : Zustand
- Forms        : React Hook Form + Zod

### RULE 3: DESIGN TOKENS (ALWAYS USE THESE)
- Primary Color     : #2D6A4F
- Primary Dark      : #1B4332
- Primary Light     : #52B788
- Secondary Gold    : #E09F3E
- Secondary Orange  : #F77F00
- Body Font         : Inter
- Heading Font      : Playfair Display
- Tamil Font        : Noto Sans Tamil
- Base Spacing      : 8px grid system
- Border Radius     : 8px (cards), 12px (feature), full (badges)

### RULE 4: RESPONSIVE FIRST
- ALWAYS build Mobile First
- Breakpoints: 375px | 576px | 768px | 992px | 1200px
- Test every component at ALL breakpoints
- Mobile Bottom Nav for 5 main items
- Touch targets minimum 44x44px

### RULE 5: PERFORMANCE RULES
- ALL images must be Next.js <Image> component
- ALL images: WebP format, lazy loading
- Use dynamic imports for heavy components
- Skeleton loaders for ALL data-fetching components
- No layout shift (CLS < 0.1)

### RULE 6: ANIMATION RULES
- Use Framer Motion for component animations
- Use AOS for scroll-triggered animations
- Ken Burns effect on hero images
- Stagger animations on card grids
- Hover: translateY(-8px) + shadow increase on cards
- Duration: 300ms interactions, 600ms reveals
- ALWAYS add prefers-reduced-motion support

### RULE 7: ACCESSIBILITY
- WCAG 2.1 AA minimum
- All images need alt text
- All buttons need aria-label if icon only
- Color contrast minimum 4.5:1
- Keyboard navigable

### RULE 8: BILINGUAL SUPPORT
- Use react-i18next for translations
- Language files: /locales/en.json and /locales/ta.json
- Language toggle in top bar and mobile menu
- Tamil font: Noto Sans Tamil
- Switch without page reload

### RULE 9: CODE QUALITY
- TypeScript strict mode
- Component folders: component/index.tsx + component.types.ts
- No inline styles (use Tailwind only)
- Extract repeated patterns to components
- Add JSDoc comments on complex functions

### RULE 10: FILE NAMING
- Components : PascalCase (ProductCard.tsx)
- Pages      : kebab-case (product-detail/page.tsx)
- Hooks      : camelCase with use prefix (useCart.ts)
- Utils      : camelCase (formatPrice.ts)
- Types      : PascalCase with Type suffix (ProductType.ts)

## AUTH RULES (ADD TO MASTER RULES)

### RULE 11: AUTHENTICATION RULES
- Customer login  : OTP ONLY (mobile number)
- Admin login     : Email + Password ONLY
- NO password for customers (OTP is the password)
- Token storage   : httpOnly cookies ONLY (never localStorage)
- Auth state      : Zustand authStore
- Route protection: Next.js middleware.ts

### RULE 12: PROTECTED ROUTES
Customer protected (/account/*):
  → No token → redirect /login?redirect=[path]
  → Has token → allow access

Admin protected (/admin/* except /admin/login):
  → No admin token → redirect /admin/login
  → Has admin token → allow access
  → Has CUSTOMER token → redirect to / (not admin)

Already logged in:
  → Visits /login or /register → redirect /account
  → Admin visits /admin/login → redirect /admin/dashboard

### RULE 13: AUTH PAGES STYLING
- Login/Register pages: centered card layout
- White card on light background
- Same brand colors (Primary Green)
- Mobile full-width card (no padding on small screens)
- Logo prominently at top
- Back to home link at bottom

### RULE 14: FORM SECURITY
- All auth forms: CSRF protection
- Rate limiting on OTP send (max 3 per hour per number)
- Rate limiting on admin login (max 5 per 15 minutes)
- Input sanitization on all fields
- No sensitive data in URL params
