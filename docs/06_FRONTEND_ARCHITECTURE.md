    # 06_FRONTEND_ARCHITECTURE.md

# Production Frontend Architecture

Version: 1.0

Status: Approved

Framework: Next.js (App Router)

Language: TypeScript

Styling: Tailwind CSS

State Management: Zustand

Data Fetching: TanStack Query

Forms: React Hook Form + Zod

Icons: Lucide React

---

# 1. Purpose

This document defines the frontend architecture for the Ecommerce Platform.

Every frontend component, page, hook, and API call must follow this architecture.

---

# 2. Frontend Principles

Rule 1

Pages organize features.

Components display UI.

Rule 2

Business logic never belongs inside UI components.

Rule 3

API calls never happen directly inside components.

Rule 4

Shared components must remain reusable.

Rule 5

Every screen must support:

* Loading
* Error
* Empty
* Success

Rule 6

Never duplicate components.

Rule 7

Keep components small and focused.

---

# 3. Folder Structure

frontend/

src/

├── app/

├── components/

│   ├── common/

│   ├── layout/

│   ├── forms/

│   ├── ui/

│   └── features/

├── hooks/

├── services/

├── store/

├── lib/

├── providers/

├── types/

├── constants/

├── utils/

├── styles/

├── assets/

├── middleware.ts

└── tests/

---

# 4. App Router Structure

/

Home

/login

Profile

/products

/products/[slug]

/categories

/cart

/checkout

/orders

/orders/[id]

/wishlist

/admin

/admin/products

/admin/orders

/admin/users

/admin/reports

---

# 5. Component Categories

## UI Components

Reusable building blocks.

Examples

Button

Input

Modal

Badge

Card

Loader

Avatar

Table

Pagination

---

## Layout Components

Navbar

Sidebar

Footer

Breadcrumb

Header

---

## Feature Components

Product Card

Product Gallery

Cart Item

Order Summary

Checkout Form

Payment Card

Review List

Wishlist Item

---

# 6. State Management

Use Zustand for:

Authentication

Theme

Shopping Cart

Wishlist

User Preferences

Do not store server data in Zustand.

Use TanStack Query for server data.

---

# 7. API Layer

Never call fetch() directly inside components.

Structure

services/

auth.service.ts

product.service.ts

cart.service.ts

payment.service.ts

order.service.ts

review.service.ts

Each service is responsible for communicating with the backend.

---

# 8. Custom Hooks

Purpose

Encapsulate reusable logic.

Examples

useAuth()

useCart()

useProducts()

useOrders()

useWishlist()

useCheckout()

---

# 9. Authentication Flow

User visits protected page

↓

Check access token

↓

If expired

↓

Request refresh token

↓

Receive new access token

↓

Retry original request

↓

Continue

If refresh fails

↓

Redirect to Login

---

# 10. Protected Routes

Protected

/profile

/cart

/checkout

/orders

/wishlist

/admin

Public

/

/products

/categories

/login

---

# 11. Forms

All forms use

React Hook Form

Validation

Zod

Every form must validate:

Before submission

After server response

Display user-friendly messages

---

# 12. UI States

Every page supports

Loading

Error

Empty

Success

Example

Products Page

Loading → Skeleton Cards

Empty → "No products found."

Error → Retry button

Success → Product Grid

---

# 13. Error Handling

Display friendly messages.

Never expose backend stack traces.

Provide retry actions where appropriate.

Log unexpected client errors.

---

# 14. Loading Strategy

Skeleton loaders

Lazy loading

Dynamic imports

Route-level loading

Optimistic updates where appropriate

---

# 15. Design System

Colors

Typography

Spacing

Border Radius

Icons

Buttons

Inputs

Cards

Tables

Badges

Modals

All follow a shared design system.

No random styling.

---

# 16. Accessibility

Semantic HTML

Keyboard navigation

Accessible forms

Alt text for images

Visible focus indicators

ARIA attributes where required

---

# 17. Performance

Code splitting

Image optimization

Memoization when justified

Prefetch routes

Lazy load heavy components

Avoid unnecessary re-renders

---

# 18. Testing

Component Tests

Custom Hook Tests

Integration Tests

Accessibility Checks

End-to-End Tests

---

# 19. Code Review Checklist

Before merging:

□ Component has one responsibility

□ No duplicated UI

□ API logic separated

□ Proper loading state

□ Proper error state

□ Validation implemented

□ Accessibility considered

□ Tests added

□ Documentation updated

---

# 20. Definition of Done

Frontend architecture is complete only when:

✓ Folder structure approved

✓ Routing strategy approved

✓ Component hierarchy defined

✓ State management strategy defined

✓ API layer defined

✓ Authentication flow approved

✓ UI state strategy documented

✓ Accessibility standards documented

✓ Testing strategy defined

Status: Ready for Frontend Setup
