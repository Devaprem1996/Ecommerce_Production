# ADMINISTRATIVE API ENDPOINTS

## 1. Update Order Status
- **Endpoint**: `PUT /api/admin/orders/{orderId}/status`
- **Access**: Admin Role
- **Payload**:
  ```json
  {
    "status": "shipped",
    "courier": "Delhivery",
    "trackingNumber": "DEL-9876543210"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Order status updated and notification dispatched."
  }
  ```

---

## 2. Add Catalog Product
- **Endpoint**: `POST /api/admin/products`
- **Access**: Admin Role
- **Payload**: Refer to Form schema in `docs/pages/29-admin-products.md`.
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "productId": "prod-151",
    "message": "Product created successfully."
  }
  ```

---

## 3. Moderate Customer Status
- **Endpoint**: `PUT /api/admin/customers/{customerId}/status`
- **Access**: Admin Role
- **Payload**:
  ```json
  {
    "status": "suspended",
    "reason": "Abusive feedback/spam activity."
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Customer account suspended."
  }
  ```

---

## 4. Create Coupon
- **Endpoint**: `POST /api/admin/coupons`
- **Access**: Admin Role
- **Payload**: Refer to parameters in `docs/pages/33-admin-coupons.md`.
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Coupon code created successfully."
  }
  ```
