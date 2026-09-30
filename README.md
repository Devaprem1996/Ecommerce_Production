# Yathu Arokiyagam (யது ஆரோக்கியகம்) - E-Commerce Platform

A full-stack, enterprise-grade e-commerce monorepo built with **Next.js 16 (App Router)** and a **Node.js Express & Prisma API**. Designed for scalable, zero-cold-start hosting with integrated bilingual support (English/Tamil), SMS OTP authentication, Razorpay payments, and an administrative control panel.

---

## Workspace Directory Structure

The repository is structured to separate runtime application code from operational infrastructure, documentation, and archived auxiliary data:

```
ecommerce-production/
├── frontend/               # Next.js 16 Storefront, Admin CMS & SSR API routes
├── backend/                # Express, TypeScript, and Prisma Database Engine
├── database/               # Database migration stubs & schema documentation
├── deploy/                 # Docker Compose, Nginx reverse proxy & VPS deploy guide
├── deployment/             # PM2 ecosystem configuration & automated DB backup scripts
├── diagram/                # Architecture diagrams, user flows & interactive HTML viewer
├── docs/                   # Full system architecture, API specifications & sprint plans
├── e2e/                    # Playwright end-to-end integration and smoke tests
├── scripts/                # Repository maintenance, image scraping & UI test runner
└── unused_files/           # Organized archive for non-runtime spreadsheets, scripts & assets
    ├── data_and_spreadsheets/  # Business spreadsheets, catalog lists & RACI matrices
    ├── generator_scripts/      # Python utility generators
    ├── draft_guides/           # Early research drafts and notes
    ├── design_references/      # UI design inspiration screenshots
    └── legacy_scripts/         # Deprecated automation scripts
```

---

## Core Applications

| Folder | Technology | Port | Description |
| :--- | :--- | :--- | :--- |
| [`frontend/`](file:///e:/Personal%20Projects/ecommerce-production/frontend) | Next.js 16, React 19, TailwindCSS, Zustand | `3000` | Customer-facing storefront and `/admin` operations console. |
| [`backend/`](file:///e:/Personal%20Projects/ecommerce-production/backend) | Express, Prisma ORM, PostgreSQL | `5000` | Core REST API for catalog, orders, payments, and users. |

---

## Getting Started

### Prerequisites
- **Node.js**: `v20+`
- **pnpm**: `v9+`
- **PostgreSQL**: Local instance or remote connection (e.g., Supabase / Neon / Hostinger)

### Installation
Install workspace dependencies across all packages:
```bash
pnpm install
```

### Running Locally
Run both frontend and backend concurrently:
```bash
pnpm dev
```
Or run individually:
```bash
# Frontend only
pnpm dev:frontend

# Backend only
pnpm dev:backend
```

### Building for Production
```bash
pnpm build
```

---

## Testing & Quality Assurance
- **Playwright E2E**: `pnpm exec playwright test`
- **Database Seed**: `cd backend && pnpm prisma db seed`
