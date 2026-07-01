# MAINTENANCE PAGE

## URL: All pages during maintenance
## File: /src/app/maintenance/page.tsx

## Trigger
- Set MAINTENANCE_MODE=true in environment
- Middleware checks this → redirect all to /maintenance
- EXCEPT: /admin/login and /admin/* (admin can still access)

## Design
┌─────────────────────────────────────────────────┐
│                                                 │
│  [LOGO — centered]                              │
│                                                 │
│      [Illustration — maintenance/tools]        │
│                                                 │
│   🔧 We're sprucing things up!                 │
│                                                 │
│   Our website is under maintenance.            │
│   We'll be back shortly with                   │
│   something even better!                       │
│                                                 │
│   Expected back by:                            │
│   ⏰ Today at 6:00 PM IST                      │
│                                                 │
│   [Countdown Timer: 2h 30m 15s]                │
│                                                 │
│   Stay updated:                                │
│   📘 [Facebook]  📸 [Instagram]  🐦 [Twitter]  │
│                                                 │
│   Need help? 📞 +91-XXXXXXXXXX                 │
│                                                 │
└─────────────────────────────────────────────────┘

## Features
- Countdown timer (from env variable: MAINTENANCE_END_TIME)
- Auto-refresh when timer hits 0
- Social media links so users can stay updated
- Contact number for urgent queries
- Admin bypass: /admin routes still work
