# 04_NAMING_CONVENTIONS.md

# Engineering Naming Conventions

Version: 1.0

Status: Approved

---

## 1. File and Folder Naming
* **Folders**: Always use `kebab-case` (e.g., `user-profiles/`, `product-gallery/`).
* **Source Files**: 
  * Use `kebab-case` for standard utility or script files (e.g., `date-helper.ts`, `auth-middleware.ts`).
  * React UI Components must use `PascalCase` matching the component class name (e.g., `ProductCard.tsx`, `CartSummary.tsx`).

---

## 2. Code Identifiers
* **Classes & Interfaces**: Use `PascalCase` (e.g., `AuthService`, `OrderRepository`, `interface UserProfile`).
* **Variables & Functions**: Use `camelCase` (e.g., `const orderTotal = 0;`, `function getProductById() {}`).
* **Constants**: Use `UPPER_SNAKE_CASE` (e.g., `const MAX_CART_LIMIT = 10;`, `const DEFAULT_PAGE_LIMIT = 20;`).
* **Enums**: Use `PascalCase` for the Enum name, and `UPPERCASE` for keys (e.g., `enum OrderStatus { CONFIRMED, SHIPPED, DELIVERED }`).

---

## 3. Database Naming (PostgreSQL)
* **Tables**: Plural and `snake_case` (e.g., `users`, `order_items`, `user_profiles`).
* **Columns**: `snake_case` (e.g., `first_name`, `created_at`, `category_id`).
* **Indexes**: Preceded by table and column details (e.g., `idx_users_email`).
