# PRODUCTS & CATALOG API ENDPOINTS

## 1. List Products
- **Endpoint**: `GET /api/products`
- **Access**: Guest
- **Query Parameters**:
  * `page` (integer, default `1`)
  * `limit` (integer, default `20`)
  * `category` (string slug)
  * `search` (string query)
  * `sort` (e.g. `price_asc` | `price_desc` | `rating` | `recent`)
  * `pincode` (6-digit validation filter)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "products": [
      {
        "id": "prod-1",
        "name": "Organic Red Rice",
        "price": 299,
        "originalPrice": 349,
        "stock": 45,
        "unit": "1 kg",
        "rating": 4.8,
        "images": ["/images/rice-1.jpg"]
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 8,
      "totalItems": 150
    }
  }
  ```

---

## 2. Get Product Detail
- **Endpoint**: `GET /api/products/{productId}`
- **Access**: Guest
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "product": {
      "id": "prod-1",
      "name": "Organic Red Rice",
      "description": "Premium quality organic red rice directly from local farmers.",
      "price": 299,
      "originalPrice": 349,
      "stock": 45,
      "unit": "1 kg",
      "rating": 4.8,
      "images": ["/images/rice-1.jpg", "/images/rice-2.jpg"],
      "certifications": ["Organic", "Lab Tested"],
      "variants": [
        { "id": "v-1", "weight": "1kg", "price": 299, "stock": 45 },
        { "id": "v-2", "weight": "5kg", "price": 1399, "stock": 10 }
      ]
    }
  }
  ```

---

## 3. List Categories
- **Endpoint**: `GET /api/categories`
- **Access**: Guest
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "categories": [
      {
        "id": "cat-1",
        "name": "Grains & Cereals",
        "slug": "grains-cereals",
        "subcategories": [
          { "id": "subcat-1", "name": "Rice", "slug": "rice" }
        ]
      }
    ]
  }
  ```

---

## 4. Post Product Review
- **Endpoint**: `POST /api/products/{productId}/reviews`
- **Access**: Authenticated Customer
- **Payload**:
  ```json
  {
    "rating": 5,
    "title": "Excellent Quality",
    "comment": "Tastes very fresh and healthy.",
    "images": ["base64-encoded-image-data-string"]
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Review submitted successfully and is pending moderation."
  }
  ```
