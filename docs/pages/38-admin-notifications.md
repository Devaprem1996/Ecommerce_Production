# ADMIN — NOTIFICATION MANAGER

## URL: /admin/notifications

## Purpose
Allows administrators to broadcast custom promotional/alert messages, select target segments (all users, specific categories, or single profiles), choose channel mediums, and review delivery telemetry metrics.

## Form Layout & Sections

### 1. COMPOSER CAMPAIGN PANEL
- Fields:
  * **Campaign Title**: Public identifier.
  * **Target Audience**: Dropdown selecting segments:
    * `All Registered Customers` | `Guest Checkouts` | `Highly Active Buyers` | `Single Phone/Email`.
  * **Channels**: Multiselect checkboxes:
    * `[ ] Web Push` | `[ ] Transactional SMS` | `[ ] Email Newsletter`.
  * **Message Content**: Multi-line Text Area (includes DLT length count constraints warning for SMS).

### 2. SYSTEM & INVENTORY ALERTS
- Configure email alerts for admin personnel when events are triggered:
  * `[x] Notify on Stock <= 10 units`.
  * `[x] Notify on New Return/Refund Request`.
  * `[ ] Notify on Guest Checkout Abandonment (2 hours)`.
  * Email recipient lists input field.

### 3. BROADCAST HISTORY LOG
- Grid showing past campaigns:
  * Date, Campaign Title, Target Count, Channel (SMS/Email), Open/Read Rate percentage, status (Completed / Scheduled).
