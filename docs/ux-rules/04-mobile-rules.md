# Mobile & Touch-Friendly UX Rules

This guide outlines engineering standards for designing and implementing responsive, touch-friendly interfaces across the Aether Organic storefront and Admin Dashboard.

---

## 📐 1. Viewport & Breakpoints Strategy

We follow a **mobile-first** responsive design flow using Tailwind's default breakpoints:
*   `sm`: `640px` (Small tablets / larger phones)
*   `md`: `768px` (Tablets / split-screen viewports)
*   `lg`: `1024px` (Laptops / smaller desktop screens)
*   `xl`: `1280px` (Standard desktop viewports)

### Layout Wrapping Rules
1.  **Header Actions**: On desktops, actions are inline. On viewports below `md`, wrap actions vertically or stack them using `flex flex-col w-full gap-2` to ensure easy accessibility.
2.  **Grid Systems**: KPI and metrics grids must scale progressively:
    -   Mobile: 1 column (`grid-cols-1`)
    -   Tablet: 2 columns (`sm:grid-cols-2`)
    -   Laptops+: 4 columns (`lg:grid-cols-4`)

---

## 👆 2. Touch Target Sizing (WCAG 2.1 Compliance)

Accidental taps are a primary source of user frustration on mobile devices.
*   **Minimum Target Sizing**: All interactive components (buttons, links, icon triggers, checkboxes, options) must maintain a minimum touch target size of **`44x44px`**.
*   **Paddings over Margins**: Extend click target areas using CSS padding rather than margin:
    ```tsx
    // Bad - hard to tap
    <button className="m-2"><Edit className="w-4 h-4" /></button>

    // Good - spacious tap target
    <button className="p-3 hover:bg-neutral-100"><Edit className="w-4 h-4" /></button>
    ```
*   **No Hover-Only Triggers**: Any action that requires hovering (e.g. "hover to reveal edit/delete buttons") is unusable on mobile. Ensure all interactive links remain visible or are nested under an explicit tap-to-reveal menu trigger (three dots menu) on viewports below `lg`.

---

## 📱 3. Responsive Data Tables

Standard table grids overflow and warp on smaller screens. 
*   **Desktop view**: Render standard HTML `<table>` elements with sorting indicators and inline action controls.
*   **Mobile view (`max-width: 767px`)**:
    -   Hide the table (`hidden md:table`).
    -   Render a list of stackable card blocks (`block md:hidden`).
    -   Render details vertically with text labels and buttons spanning the full width of the card.

---

## ⌨️ 4. Form Fields & Keyboard Ergonomics

### Prevention of iOS Auto-Zoom
iOS Safari automatically zooms the screen whenever a user focuses on a text input styled with a font size smaller than `16px`. This disrupts page layout and alignment.
*   **Enforcement rule**: Define all text inputs, select dropdowns, and textareas with a base font size of `16px` on mobile, scaling down to desktop size `12px` or `14px` on wider screens.
*   **CSS Class Pattern**: `text-base md:text-xs` or `text-base md:text-sm`.

### Virtual Keyboard Layouts
Ensure the virtual keyboard corresponds to the expected data input:
*   `type="email"` for email address inputs (adds `@` and `.com` keys).
*   `type="tel"` and `pattern="[0-9]*"` for mobile numbers and OTP pins (forces numeric keypad).
*   `inputMode="numeric"` for raw number fields like postal pincodes.

---

## ⚡ 5. Interactive States & Micro-Animations

*   **Pulsing Elements**: Use subtle pulsing animations for active indicators (e.g., active courier transit location points).
*   **Active Feedback**: Add visual feedback on touch down (e.g., scale-down effect on active buttons `active:scale-95`).
