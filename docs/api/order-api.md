# ORDERS & CHECKOUT API ENDPOINTS

## 1. Create Checkout Order
- **Endpoint**: `POST /api/orders`
- **Access**: Authenticated Customer
- **Payload**:
  ```json
  {
    "items": [
      { "productId": "prod-1", "quantity": 2, "variantId": "v-1" }
    ],
    "shippingAddressId": "addr-1",
    "paymentMethod": "online",
    "couponCode": "FRESH20"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "orderId": "AETH-98319",
    "amount": 798,
    "currency": "INR",
    "gatewayOrderId": "order_KspW8djs72h..."
  }
  ```

---

## 2. Get Order History
- **Endpoint**: `GET /api/orders`
- **Access**: Authenticated Customer
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "orders": [
      {
        "id": "AETH-98319",
        "date": "2026-07-01",
        "total": 798,
        "status": "processing",
        "paymentStatus": "paid"
      }
    ]
  }
  ```

---

## 3. Cancel Order
- **Endpoint**: `POST /api/orders/{orderId}/cancel`
- **Access**: Authenticated Customer (Allowed only if status is `pending`)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Order AETH-98319 has been cancelled. Refund initialized if paid."
  }
  ```

---

## 4. Request Return / Refund
- **Endpoint**: `POST /api/orders/{orderId}/refund`
- **Access**: Authenticated Customer (Allowed only within 7 days of delivery)
- **Payload**:
  ```json
  {
    "items": ["prod-1"],
    "reason": "Damaged product",
    "description": "The packaging was open upon receipt.",
    "refundMethod": "store_credit",
    "images": ["base64-encoded-image"]
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "requestId": "RET-2025-00456",
    "message": "Return request submitted successfully."
  }
  ```
