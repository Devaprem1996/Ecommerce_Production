# 08_DEPLOYMENT_ARCHITECTURE.md

# Production Deployment Architecture

Version: 2.0 (Hostinger KVM VPS + Docker Compose)  
Status: Approved  

---

## 1. Platform Topology

The application uses an isolated, self-hosted Docker Compose architecture hosted on a single **Hostinger KVM 2 VPS (2 vCPU, 8 GB RAM, 100 GB NVMe Storage, Ubuntu 24.04 LTS)**.

```
                            Internet / Shopper Browser
                                       │
                                       ▼ (Port 80 / 443 HTTPS)
                        ┌──────────────────────────────┐
                        │   Hostinger KVM 2 VPS        │
                        │   NGINX Reverse Proxy        │
                        └──────────────┬───────────────┘
                                       │
             ┌─────────────────────────┼─────────────────────────┐
             │ /                       │ /api/                   │ /uploads/
             ▼                         ▼                         ▼
    ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
    │ Next.js Frontend │     │ Express Backend  │     │ Direct NVMe Disk │
    │ Container :3000  │     │ Container :8080  │     │ Static Media     │
    └──────────────────┘     └─────────┬────────┘     └──────────────────┘
                                       │ Internal Network
                                       ▼
                             ┌──────────────────┐
                             │  PostgreSQL 16   │
                             │ Container :5432  │
                             └──────────────────┘

* Sidecar Container: Uptime Kuma (:3001) - 24/7 internal & external ping monitor
* Background Scripts: monitor-resources.sh & backup-db.sh with Telegram notifications
```

### A. Reverse Proxy: NGINX (Alpine Container)
* Handles TLS/SSL termination with Let's Encrypt certificates.
* Directly serves uploaded product photos from `/var/www/uploads/` with 30-day immutable caching (bypassing Node.js runtime).
* Proxies dynamic `/api/` REST requests to Express (`:8080`) with `X-Forwarded-For` and `X-Real-IP`.
* Proxies frontend HTML/SSR requests to Next.js (`:3000`).
* Routes `/healthz` and `/ready` probes directly to the backend.

### B. Frontend: Next.js (Node.js 20 Alpine)
* Multi-stage production container with standalone output.
* Internal API communication routes through Docker network `http://backend:8080/api/v1`.
* Strict memory limit: 2048 MB, reservation: 512 MB, CPU: 0.8 vCPU.

### C. Backend: Express.js + Prisma ORM (Node.js 20 Alpine)
* Sentry Node SDK (`instrument.ts`) preloaded for performance tracing and crash interception.
* Graceful shutdown: drains open HTTP sockets, flushes Sentry events, and calls `prisma.$disconnect()`.
* Strict memory limit: 1536 MB, reservation: 256 MB, CPU: 1.0 vCPU.

### D. Database: PostgreSQL 16 (Alpine Container)
* Persistent data stored in isolated Docker named volume `yathu_postgres_data`.
* Runs directly on NVMe SSD (<5ms query response, zero cold starts).
* Strict memory limit: 2048 MB, reservation: 512 MB, CPU: 1.0 vCPU.

---

## 2. Production Environment Variables Configuration

Configured in `/root/ecommerce-production/deploy/.env`:

| Variable Name | Description | Example / Recommendation |
|---|---|---|
| `PORT` | Backend network listening port | `8080` |
| `NODE_ENV` | Application environment | `production` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@postgres:5432/yathu_ecommerce?sslmode=disable&connection_limit=20&pool_timeout=10` |
| `DIRECT_URL` | Direct connection for migrations | `postgresql://user:pass@postgres:5432/yathu_ecommerce?sslmode=disable&connection_limit=20&pool_timeout=10` |
| `JWT_SECRET` | Secret key used to sign Access Tokens | `[64-character high entropy hex string]` |
| `REFRESH_TOKEN_SECRET` | Secret key used to sign Refresh Tokens | `[64-character high entropy hex string]` |
| `FRONTEND_URL` | Restricts CORS to the production domain | `https://yathuarokiyagam.com` |
| `RAZORPAY_KEY_ID` | Razorpay Live API key ID | `rzp_live_...` |
| `RAZORPAY_KEY_SECRET` | Razorpay Live API secret | `[Secret Key]` |
| `RAZORPAY_WEBHOOK_SECRET`| Cryptographic webhook signature verification | `[Webhook Secret]` |
| `FAST2SMS_API_KEY` | Fast2SMS production API key | `[SMS API Key]` |
| `GMAIL_USER` / `GMAIL_APP_PASSWORD` | Transactional email sender | `email@domain.com` / App Password |
| `SENTRY_DSN` | Centralized crash and error reporting | `https://key@o0.ingest.sentry.io/0000000` |
| `SENTRY_ENVIRONMENT` | Sentry release tag | `production` |
| `TELEGRAM_BOT_TOKEN` | Bot token for instant mobile alerts | `1234567890:ABCdefGHI...` |
| `TELEGRAM_CHAT_ID` | Personal chat ID for mobile push | `123456789` |

---

## 3. Observability & Health Probes

The backend exposes two dedicated low-overhead probes:

1. **Liveness Probe (`GET /healthz`):**
   * Confirms Node.js event loop is alive without querying the database.
   * Zero database overhead (< 1ms). Used by container liveness monitors.

2. **Readiness Probe (`GET /ready`):**
   * Executes a fast `SELECT 1` query to test database connectivity and connection pool responsiveness.
   * Threshold: Latency must be `< 3000ms`.
   * Returns `HTTP 200` when ready, or `HTTP 503` if shutting down or database is unreachable.

---

## 4. Zero-Downtime Deployment Lifecycle

Deployments are automated through [.github/workflows/deploy.yml](file:///e:/ecommerce-production-VPS/.github/workflows/deploy.yml) on push to the **`VPS-SETUP`** (or `vps`) branch:

1. **Remote Build & Push (GitHub Actions):**
   * GitHub Actions compiles and pushes Backend and Frontend container images to **GitHub Container Registry (GHCR)**.
   * No compilation happens on the VPS, preventing CPU and RAM spikes.

2. **Rolling Update via SSH:**
   * VPS pulls prebuilt images from GHCR: `docker compose -f docker-compose.prod.yml pull`.
   * Applies schema migrations in a temporary container: `npx prisma migrate deploy`.
   * Hot-swaps the backend container: `docker compose up -d --no-deps backend`.
   * Polls `/ready` until it returns `HTTP 200`.
   * Hot-swaps the frontend container: `docker compose up -d --no-deps frontend`.
   * Reloads Nginx reverse proxy: `docker exec yathu_nginx nginx -s reload`.
   * Prunes dangling images: `docker image prune -f`.
