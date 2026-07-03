# E-Commerce Platform Visual Workflows (IDE Preview)

This folder contains user experience and system flow diagrams. You can open any of the files in VS Code or Cursor and press **`Ctrl + Shift + V`** (or **`Cmd + Shift + V`** on macOS) to visualize them instantly.

The diagrams are split into two categories to suit different stakeholder needs:

---

## 1. Business Flows (Client & PM View)
*These flowcharts present high-level, business-oriented visual maps that focus on client UX logic, shopping cart decisions, address inputs, and admin panel pathways, with no technical/API terminology.*

*   👉 **[Customer Order & Checkout Journey](file:///c:/Users/user/Desktop/ecommerce-production/diagram/CUSTOMER_FLOW.md)**: Browsing, variant selections, pincode validation, promo codes, payments, and order tracking.
*   👉 **[Administrator Actions & Processing Control](file:///c:/Users/user/Desktop/ecommerce-production/diagram/ADMIN_FLOW.md)**: Admin auth gates, catalog CRUD management, coupon generations, and order fulfillment status pipelines.
*   👉 **[Guest Visitor Exploration Flow](file:///c:/Users/user/Desktop/ecommerce-production/diagram/GUEST_FLOW.md)**: Public storefront browsing, category filtering, search queries, translation toggles, and login intercept blocks.

---

## 2. Technical Flows (Developer Proof & Architecture View)
*These flowcharts map the exact developer implementation details, describing REST API paths, database table insertions, Prisma transactions, Sharp image compression, Cloudinary asset uploads, JWT rotation, and webhook cryptographic signature checks.*

*   ⚙️ **[Customer Technical Implementation](file:///c:/Users/user/Desktop/ecommerce-production/diagram/technical/CUSTOMER_FLOW.md)**: Endpoint listings (`POST /api/v1/cart`, `POST /api/v1/orders`), database locks, and payment hooks.
*   ⚙️ **[Admin Dashboard Backend logic](file:///c:/Users/user/Desktop/ecommerce-production/diagram/technical/ADMIN_FLOW.md)**: Admin token verifications, Image processing buffers, and database category insertions.
*   ⚙️ **[Guest Discovery and Session Sync](file:///c:/Users/user/Desktop/ecommerce-production/diagram/technical/GUEST_FLOW.md)**: Local Zustand state management, API routes queries, and user credentials migration checks.
