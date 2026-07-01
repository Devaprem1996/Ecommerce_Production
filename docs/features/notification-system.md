# NOTIFICATION SYSTEM ARCHITECTURE

## Communication Channels
1. **SMS**: Handled via MSG91 (India) or Twilio. Used for OTPs, order placement confirmations, and shipping alerts.
2. **Email**: Managed via SMTP relay or Amazon SES. Delivers invoices, password reset links, and marketing campaigns.
3. **Web Push**: In-app notifications using Service Workers for instant order updates on active browser tabs.

## Preference Control (User Settings)
Customers manage their opt-in settings from `/account/notifications`. The preferences object structure:
```json
{
  "orderUpdates": { "sms": true, "email": true },
  "marketing": { "sms": false, "email": false, "newsletter": false }
}
```

## System Trigger Map
- **OTP Request** &rarr; Dispatches SMS instantly.
- **Order Placed** &rarr; Sends confirmation Email + SMS.
- **Status Change (Shipped)** &rarr; Sends tracking link via SMS.
- **Password Reset** &rarr; Dispatches token link via secure Email.
