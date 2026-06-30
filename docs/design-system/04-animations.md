# ANIMATION SYSTEM

## Libraries
- Framer Motion : Component animations, page transitions
- AOS           : Scroll-triggered reveals
- GSAP          : Advanced scroll effects (parallax)
- Lottie        : Loading animations (JSON files)

## Animation Tokens
| Name      | Duration | Easing                              |
|-----------|----------|-------------------------------------|
| fast      | 150ms    | ease-out                            |
| normal    | 300ms    | ease-out                            |
| slow      | 600ms    | cubic-bezier(0.25, 0.46, 0.45, 0.94)|
| bounce    | 500ms    | cubic-bezier(0.68,-0.55,0.265,1.55) |
| parallax  | N/A      | Linear (scroll-driven)              |

## Component Animations

### Hero Banner
- Ken Burns on images: scale 1.0 → 1.1 → 1.0, 15s infinite
- Text reveal: stagger children, fadeUp 600ms
- Slide transition: 600ms between slides
- Auto-play: 5 seconds

### Product Cards
- Hover lift: translateY(-8px), 300ms ease-out
- Shadow: shadow-card → shadow-card-hover
- Image zoom: scale(1.05), 300ms
- Quick View overlay: opacity 0 → 1, 200ms

### Add to Cart
- Button ripple on click
- Cart badge: bounce animation
- Toast notification: slideInRight + fadeIn

### Scroll Reveals (AOS)
- Section headings : fade-up, 600ms, offset 100
- Product grid     : fade-up, stagger 100ms each card
- Category cards   : fade-up, stagger 100ms
- Stats numbers    : count-up when in viewport
- Testimonials     : fade-left / fade-right alternate

### Page Transitions
- Enter: fadeUp 400ms
- Exit:  fadeOut 200ms

### Micro-interactions
- Wishlist heart: scale bounce + color fill
- Star rating hover: gold wash left to right
- Quantity change: number slide up/down
- Form input focus: border color 200ms
- Language toggle: content fade 150ms
- Back to top: fade in on scroll > 300px

## Accessibility
ALWAYS include:
```css
@media (prefers-reduced-motion: reduce) {
  /* disable all animations */
  /* keep only opacity transitions at 0.01ms */
}
```
