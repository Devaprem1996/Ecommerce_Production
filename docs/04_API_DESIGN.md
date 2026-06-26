# 04_API_DESIGN.md

# Production API Design & Standards

Version: 1.0

Status: Approved

API Style: REST

Versioning: `/api/v1`

Response Format: JSON

Authentication: JWT + Refresh Token

---

# 1. API Design Principles

Every API must follow these rules:

* Use nouns, not verbs.
* Use plural resource names.
* Be stateless.
* Return consistent JSON.
* Validate every request.
* Never expose internal errors.
* Log every failure.
* Version every public API.

Example

Good

GET /api/v1/products

Bad

GET /api/v1/getProducts

---

# 2. API Naming Convention

Resources

/users

/products

/categories

/orders

/payments

/reviews

/wishlist

/cart

/auth

Use HTTP methods

GET

POST

PUT

PATCH

DELETE

---

# 3. Authentication

Public APIs

GET /products

GET /categories

GET /products/:id

Protected APIs

Cart

Orders

Wishlist

Reviews

Profile

Admin APIs

Product CRUD

Category CRUD

Dashboard

Reports

Users

Inventory

---

# 4. Standard Request Headers

Content-Type

application/json

Authorization

Bearer <access_token>

Accept

application/json

---

# 5. Standard Response Format

Success

{
"success": true,
"message": "Product created successfully.",
"data": {},
"timestamp": "...",
"requestId": "..."
}

Failure

{
"success": false,
"message": "Validation failed.",
"errors": [],
"timestamp": "...",
"requestId": "..."
}

---

# 6. HTTP Status Codes

200 OK

201 Created

204 No Content

400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

409 Conflict

422 Unprocessable Entity

429 Too Many Requests

500 Internal Server Error

---

# 7. Authentication APIs

POST /api/v1/auth/google

Purpose

Google OAuth login.

POST /api/v1/auth/logout

Purpose

Logout user.

POST /api/v1/auth/refresh

Purpose

Refresh access token.

GET /api/v1/auth/me

Purpose

Return logged-in user profile.

---

# 8. User APIs

GET /api/v1/users/me

PATCH /api/v1/users/me

GET /api/v1/users/addresses

POST /api/v1/users/addresses

PATCH /api/v1/users/addresses/:id

DELETE /api/v1/users/addresses/:id

---

# 9. Category APIs

GET /api/v1/categories

GET /api/v1/categories/:id

POST /api/v1/categories

PATCH /api/v1/categories/:id

DELETE /api/v1/categories/:id

---

# 10. Product APIs

GET /api/v1/products

GET /api/v1/products/:id

POST /api/v1/products

PATCH /api/v1/products/:id

DELETE /api/v1/products/:id

GET /api/v1/products/search

GET /api/v1/products/featured

GET /api/v1/products/latest

---

# 11. Cart APIs

GET /api/v1/cart

POST /api/v1/cart

PATCH /api/v1/cart/:id

DELETE /api/v1/cart/:id

DELETE /api/v1/cart

---

# 12. Wishlist APIs

GET /api/v1/wishlist

POST /api/v1/wishlist

DELETE /api/v1/wishlist/:productId

---

# 13. Checkout APIs

POST /api/v1/checkout/preview

POST /api/v1/checkout/confirm

---

# 14. Payment APIs

POST /api/v1/payments/create-order

POST /api/v1/payments/verify

POST /api/v1/payments/refund

POST /api/v1/payments/webhook

GET /api/v1/payments/:id

---

# 15. Order APIs

GET /api/v1/orders

GET /api/v1/orders/:id

PATCH /api/v1/orders/:id/cancel

PATCH /api/v1/orders/:id/status

---

# 16. Review APIs

GET /api/v1/products/:id/reviews

POST /api/v1/products/:id/reviews

PATCH /api/v1/reviews/:id

DELETE /api/v1/reviews/:id

---

# 17. Admin APIs

GET /api/v1/admin/dashboard

GET /api/v1/admin/users

PATCH /api/v1/admin/users/:id/status

GET /api/v1/admin/reports

GET /api/v1/admin/audit-logs

---

# 18. Pagination

Query Parameters

?page=1

?limit=20

Default

page=1

limit=20

Maximum

limit=100

Response

{
"data": [],
"pagination": {
"page": 1,
"limit": 20,
"totalItems": 250,
"totalPages": 13
}
}

---

# 19. Filtering

Examples

GET /products?category=mobiles

GET /products?brand=Apple

GET /products?minPrice=1000&maxPrice=5000

GET /products?rating=4

---

# 20. Sorting

Examples

?sort=price

?sort=-price

?sort=created_at

?sort=-rating

---

# 21. Validation Rules

Validate:

Request body

Route parameters

Query parameters

JWT

User role

Input length

File size

MIME type

---

# 22. Error Handling

Never return stack traces.

Return:

Error code

User-friendly message

Request ID

Timestamp

Log internally.

---

# 23. Security

HTTPS only

JWT Authentication

Refresh Tokens

Helmet

Rate Limiting

Input Validation

Parameterized Queries

Secure Cookies

CORS

CSRF protection (if applicable)

---

# 24. Performance

Enable response compression.

Use pagination.

Cache read-heavy endpoints.

Optimize database queries.

Avoid N+1 query problems.

---

# 25. API Documentation Rules

Every endpoint must document:

Purpose

Authentication

Request

Response

Validation

Status Codes

Errors

Examples

---

# 26. Definition of Done

The API design is complete only when:

✓ Every endpoint documented.

✓ Authentication defined.

✓ Validation rules documented.

✓ Response format standardized.

✓ Error handling standardized.

✓ Pagination, filtering, and sorting documented.

✓ Security requirements approved.

Status: Ready for Backend Implementation.
