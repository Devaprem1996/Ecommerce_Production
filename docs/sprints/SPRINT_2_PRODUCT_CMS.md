# Sprint 2: Product & Category CMS Documentation & Instructions

This document covers the architecture, files, endpoints, validation rules, and setup instructions implemented during **Sprint 2 (Product & Category CMS)** of the Ecommerce Production project.

---

## 1. Directory & File Registry

The following files and folders were created or modified during this sprint:

```
backend/
├── src/
│   ├── app.ts                       # [MODIFIED] Mounted cmsRouter under `/api/v1/cms`
│   ├── controllers/
│   │   └── cms.controller.ts        # [NEW] Handles requests for listing/managing categories, products, & variants
│   ├── routes/
│   │   └── cms.routes.ts            # [NEW] Connects endpoint URLs to validation schemas and controllers
│   ├── services/
│   │   └── cms.service.ts           # [NEW] Category/Product CRUD database transactions and filter querying
│   └── validations/
│       └── cms.validation.ts        # [NEW] Zod validation schemas for Category/Product CRUD and URL query filters
```

---

## 2. API Endpoint Specification

All CMS routes are prefix-mounted under `/api/v1/cms`.

### A. List Categories (Public)
* **Method**: `GET`
* **Path**: `/api/v1/cms/categories`
* **Access**: Public
* **Query Params**: `includeInactive` (boolean, optional, Admin only)
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Categories fetched successfully.",
    "data": {
      "categories": [
        {
          "id": "uuid-string",
          "nameEn": "Oils",
          "nameTa": "Oils",
          "slug": "oils",
          "sortOrder": 0,
          "isActive": true
        }
      ]
    }
  }
  ```

### B. List Products with Filter Query (Public)
* **Method**: `GET`
* **Path**: `/api/v1/cms/products`
* **Access**: Public
* **Query Params**:
  * `page` (number, default: 1)
  * `limit` (number, default: 20)
  * `search` (string, optional - searches names & brands)
  * `category` (string, optional - category slug or UUID)
  * `minPrice` (number, optional)
  * `maxPrice` (number, optional)
  * `sortBy` (`price` | `createdAt` | `nameEn`, default: `createdAt`)
  * `sortOrder` (`asc` | `desc`, default: `desc`)
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Products fetched successfully.",
    "data": {
      "products": [
        {
          "id": "uuid-string",
          "nameEn": "Castor Oil",
          "nameTa": "ஆமணக்கு எண்ணெய்",
          "slug": "castor-oil",
          "brand": "Yathu Arokiyagam",
          "variants": [
            {
              "id": "variant-uuid",
              "nameEn": "1L",
              "price": "380",
              "discountPrice": "361",
              "inventory": {
                "availableQuantity": 100
              }
            }
          ]
        }
      ],
      "pagination": {
        "total": 4,
        "page": 1,
        "limit": 2,
        "pages": 2
      }
    }
  }
  ```

### C. Get Product Detail by Slug (Public)
* **Method**: `GET`
* **Path**: `/api/v1/cms/products/:slug`
* **Access**: Public
* **Success Response (200 OK)**: Returns full details of the product, including its category and active variants with their stock inventories.

### D. Create Product (Admin Only)
* **Method**: `POST`
* **Path**: `/api/v1/cms/products`
* **Access**: Protected (JWT Bearer Token + Role: ADMIN)
* **Request Body**:
  ```json
  {
    "categoryId": "category-uuid",
    "nameEn": "Pure Honey",
    "nameTa": "தூய தேன்",
    "brand": "Yathu Arokiyagam",
    "descriptionEn": "100% natural organic honey.",
    "descriptionTa": "100% இயற்கை கரிம தேன்.",
    "variants": [
      {
        "nameEn": "500GM",
        "nameTa": "500GM",
        "sku": "YA-HONEY-500GM",
        "price": 250.00,
        "availableQuantity": 50
      }
    ]
  }
  ```

---

## 3. Setup & Verification Instructions

To test these endpoints:

### 1. Re-build the Backend
Ensure the TypeScript compiler outputs files correctly without any module resolution errors:
```bash
pnpm --filter ecommerce-backend build
```

### 2. Run the Server
```bash
pnpm --filter ecommerce-backend dev
```

### 3. Verify Endpoints via Curl
```bash
# Query all categories
curl.exe -s http://localhost:8080/api/v1/cms/categories

# Search products containing "Oil" in "Oils" category
curl.exe -s "http://localhost:8080/api/v1/cms/products?category=oils&search=Oil"
```
