# SMS TEMPLATES

## Rules
- Max 160 characters per SMS (or it splits into multiple)
- Keep under 160 chars when possible
- Include order/reference number always
- Include brand name (sender ID)
- Register templates with DLT (India TRAI requirement)

## SMS List

### 1. OTP SMS
[Brand]: Your OTP is {OTP}. Valid for 10 minutes.
Do not share. -Team [Brand]
(62 chars — good)

### 2. ORDER CONFIRMED SMS
[Brand]: Order #{ORDER_ID} confirmed! 
Total: Rs.{AMOUNT}. 
Delivery in {DAYS} days. 
Track: {SHORT_URL}

### 3. ORDER SHIPPED SMS
[Brand]: Your order #{ORDER_ID} shipped via 
{COURIER}. Track: {TRACKING_URL}. 
Expected: {DATE}.

### 4. ORDER DELIVERED SMS
[Brand]: Order #{ORDER_ID} delivered! 
Happy? Rate us: {REVIEW_URL}
Shop again: {SHOP_URL}

### 5. ORDER CANCELLED SMS
[Brand]: Order #{ORDER_ID} cancelled. 
Refund of Rs.{AMOUNT} in 3-5 days. 
Help: {PHONE}

### 6. PAYMENT FAILED SMS
[Brand]: Payment failed for order #{ORDER_ID}. 
Retry: {RETRY_URL} 
Help: {PHONE}

### 7. RETURN APPROVED SMS
[Brand]: Return #{RETURN_ID} approved. 
Pickup scheduled for {DATE}. 
Refund within 5 days.

### 8. REFUND PROCESSED SMS
[Brand]: Refund of Rs.{AMOUNT} for 
order #{ORDER_ID} processed. 
Reflects in 3-5 business days.

### 9. LOW STOCK ALERT (Admin SMS)
[Brand Admin]: Product "{PRODUCT}" 
has only {QTY} units left. 
Update stock now.

## DLT Registration (India Requirement)
- Register all templates on DLT portal
- Get Template ID for each
- Use Template ID when sending via SMS API
- Required by TRAI for transactional SMS in India
