# OFFLINE PAGE (PWA)

## URL: Shown when user has no internet
## File: /public/offline.html (static, no Next.js)

## Design (Keep VERY simple — no JS dependencies)
┌─────────────────────────────────────────────────┐
│  [BRAND LOGO — embedded SVG]                   │
│                                                 │
│         📶  No Internet Connection             │
│                                                 │
│   Looks like you're offline.                   │
│   Please check your connection and try again.  │
│                                                 │
│   [🔄 Retry]                                   │
│                                                 │
│   You can still browse:                        │
│   • Pages you've visited before                │
│   • Your saved cart items                      │
│                                                 │
└─────────────────────────────────────────────────┘

## Rules
- Pure HTML + CSS only (no JS frameworks)
- Inline all styles (no external CSS files)
- Must work completely offline
- Service Worker serves this page when offline
- Retry button: window.location.reload()
- Logo: inline SVG (no image request)
- Colors: match brand colors (#2D6A4F)
