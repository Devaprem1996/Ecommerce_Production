# AUTHENTICATION API ENDPOINTS

## 1. Customer Login
- **Endpoint**: `POST /api/auth/login`
- **Access**: Guest
- **Payload**:
  ```json
  {
    "email": "customer@example.com",
    "password": "strongPassword123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "cust-123",
      "name": "John Doe",
      "email": "customer@example.com",
      "role": "customer"
    }
  }
  ```

---

## 2. Request SMS OTP (For Registration / Number Verification)
- **Endpoint**: `POST /api/auth/otp/send`
- **Access**: Guest / User
- **Payload**:
  ```json
  {
    "mobile": "9876543210"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "OTP sent successfully to 9876543210."
  }
  ```

---

## 3. Verify OTP
- **Endpoint**: `POST /api/auth/otp/verify`
- **Access**: Guest / User
- **Payload**:
  ```json
  {
    "mobile": "9876543210",
    "otp": "123456"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "token": "jwt-token-if-login-completed",
    "message": "Mobile number successfully verified."
  }
  ```

---

## 4. Customer Registration
- **Endpoint**: `POST /api/auth/register`
- **Access**: Guest
- **Payload**:
  ```json
  {
    "name": "Jane Smith",
    "email": "jane@example.com",
    "mobile": "9998887776",
    "password": "securePassword456"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1Ni...",
    "user": {
      "id": "cust-124",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "customer"
    }
  }
  ```

---

## 5. Logout
- **Endpoint**: `POST /api/auth/logout`
- **Access**: Authenticated
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Session cookie cleared."
  }
  ```
