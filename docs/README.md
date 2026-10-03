# Project Documentation Index

This directory contains the authoritative documentation for the Yathu Arokiyagam production e-commerce application.

---

## 1. Production Deployment & Operations (Active)

| Document | Description |
| :--- | :--- |
| [observability_and_alerting_setup.md](observability_and_alerting_setup.md) | **Primary Production Manual:** Hostinger VPS setup, free domain DNS, Sentry error tracking, Telegram mobile alerts, backup cron, and zero-downtime GitHub Actions deploy. |
| [08_DEPLOYMENT_ARCHITECTURE.md](08_DEPLOYMENT_ARCHITECTURE.md) | Architectural specification for Docker Compose, Nginx reverse proxy, and zero-downtime rolling container deploys. |

---

## 2. Store Operations & Product Catalog Management

| Document | Description |
| :--- | :--- |
| [MASTER_SETUP_AND_PRODUCT_OPERATIONS_GUIDE.md](MASTER_SETUP_AND_PRODUCT_OPERATIONS_GUIDE.md) | Admin guide for managing products, categories, pricing, pincodes, shipping fees, and store operations. |
| [PRODUCT_IMAGE_ONBOARDING_GUIDE.md](PRODUCT_IMAGE_ONBOARDING_GUIDE.md) | Guidelines for product photography, aspect ratios (1:1), compression, and uploading to local VPS storage. |
| [excel_billing_columns.csv](excel_billing_columns.csv) | Master CSV specification schema for bulk billing and product inventory imports. |

---

## 3. Core Technical Architecture & Design Specs

| Document | Description |
| :--- | :--- |
| [00_PROJECT_RULES.md](00_PROJECT_RULES.md) | Core engineering rules and principles for development. |
| [01_PROJECT_PLAN.md](01_PROJECT_PLAN.md) | Complete project delivery plan and phase definitions. |
| [02_ARCHITECTURE.md](02_ARCHITECTURE.md) | System architecture overview (Next.js + Express + PostgreSQL + Nginx). |
| [03.5_DOMAIN_MODEL.md](03.5_DOMAIN_MODEL.md) | Business domain models, relationships, and state machines. |
| [03.6_FEATURE_SPECIFICATIONS.md](03.6_FEATURE_SPECIFICATIONS.md) | Detailed requirements for user accounts, checkout, payments, and admin. |
| [03_DATABASE_DESIGN.md](03_DATABASE_DESIGN.md) | PostgreSQL schema design, relations, and composite indexing strategy. |
| [04_API_DESIGN.md](04_API_DESIGN.md) | REST API specification, conventions, status codes, and error formatting. |
| [05_BACKEND_ARCHITECTURE.md](05_BACKEND_ARCHITECTURE.md) | Backend service layers, controllers, middlewares, and Prisma ORM design. |
| [06_FRONTEND_ARCHITECTURE.md](06_FRONTEND_ARCHITECTURE.md) | Next.js App Router, SSR/SSG patterns, Tailwind styling, and client state. |
| [07_SECURITY_ARCHITECTURE.md](07_SECURITY_ARCHITECTURE.md) | JWT authentication, CSRF/XSS defenses, Helmet security headers, and rate limiting. |
| [ECOMMERCE_BACKEND_PLAYBOOK.md](ECOMMERCE_BACKEND_PLAYBOOK.md) | Backend developer playbook for database migrations, logging, and error handling. |
| [ENGINEERING_STANDARDS.md](ENGINEERING_STANDARDS.md) | Code styling, TypeScript conventions, and git commit standards. |
