# Production Observability, Alerting & Zero-Downtime Operations Guide

This guide details how to configure real-time observability, instant mobile notifications (Telegram/Email), database resilience, and automated zero-downtime deployments on your Hostinger KVM VPS (2 vCPU, 8 GB RAM).

---

## Table of Contents
1. [Local PC Pre-Flight Testing (Verify Before Deploying)](#1-local-pc-pre-flight-testing-verify-before-deploying)
2. [Hostinger Free Domain & DNS Setup](#2-hostinger-free-domain--dns-setup)
3. [Real-Time Error Tracking with Sentry (Express + Prisma)](#3-real-time-error-tracking-with-sentry-express--prisma)
4. [Instant Telegram Push Notifications Setup](#4-instant-telegram-push-notifications-setup)
5. [Host Resource Monitoring (`monitor-resources.sh`)](#5-host-resource-monitoring-monitor-resourcessh)
6. [Automated Database Backups & Rolling Retention (`backup-db.sh`)](#6-automated-database-backups--rolling-retention-backup-dbsh)
7. [Health & Readiness Observability Probes](#7-health--readiness-observability-probes)
8. [Uptime Kuma External Ping & Downtime Alerts](#8-uptime-kuma-external-ping--downtime-alerts)
9. [Zero-Downtime GitHub Actions Deployment (`VPS-SETUP` branch)](#9-zero-downtime-github-actions-deployment-vps-setup-branch)

---

## 1. Local PC Pre-Flight Testing (Verify Before Deploying)

Before pushing to the VPS, test the entire Docker stack (including Nginx and health probes) locally on your Windows PC:

```powershell
# 1. Start full Docker simulation on PC
pnpm run sim:start

# 2. Verify all probes in PowerShell or browser
curl http://localhost/healthz
curl http://localhost/ready

# 3. Check container logs
pnpm run sim:logs

# 4. Stop simulation when done
pnpm run sim:stop
```

---

## 2. Hostinger Free Domain & DNS Setup

### Step 1: Claim Free Domain Voucher in Hostinger
1. In [Hostinger hPanel](https://hpanel.hostinger.com/), click the **Claim Domain** banner.
2. Choose your domain name (e.g. `yathuarokiyagam.com`), select `.com`, and complete free registration.
3. Click the ICANN email verification link sent to your inbox.

### Step 2: Configure DNS Records to Point to VPS
In Hostinger hPanel ➔ **Domains** ➔ **Manage** ➔ **DNS / Nameservers**:

| Type | Name | Value (Points to) | TTL | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `@` | `YOUR_VPS_IP` (e.g. `194.163.xxx.xxx`) | `300` | Points root domain to VPS |
| **A** | `www` | `YOUR_VPS_IP` (e.g. `194.163.xxx.xxx`) | `300` | Points www subdomain to VPS |

Verify DNS propagation on your PC:
```powershell
nslookup yathuarokiyagam.com
```

---

## 3. Real-Time Error Tracking with Sentry (Express + Prisma)

### Step 1: Create a Free Sentry Account & Project
1. Go to [sentry.io](https://sentry.io) and create an account.
2. Click **Create Project** ➔ Select **Node.js** ➔ **Express**.
3. Name your project (e.g. `yathu-ecommerce-backend`).
4. Copy your **Sentry DSN** (format: `https://<public_key>@o<org_id>.ingest.sentry.io/<project_id>`).

### Step 2: Configure Environment Variable
In your production `.env` file on the VPS:
```bash
SENTRY_DSN="https://your_sentry_dsn_key@o0.ingest.sentry.io/0000000"
SENTRY_ENVIRONMENT="production"
SENTRY_TRACES_SAMPLE_RATE="0.2"
```

### Step 3: Configure Sentry Alert Routing to Telegram / Email
1. In Sentry, go to **Alerts** ➔ **Create Alert**.
2. Set condition: *"When an event is captured"* ➔ Filter: `level == error` or `environment == production`.
3. Under **Perform Actions**:
   - **Email:** Select *Send a notification to Issue Owners / Personal Email*.
   - **Telegram:** Use Sentry's native Telegram integration (*Settings ➔ Integrations ➔ Telegram*).

---

## 4. Instant Telegram Push Notifications Setup

### Step 1: Create Your Monitoring Bot with @BotFather
1. In Telegram, search for `@BotFather`.
2. Send `/newbot`.
3. Name your bot (e.g., `Yathu VPS Alert Bot`) and username (e.g., `yathu_vps_alert_bot`).
4. Copy the **HTTP API Bot Token** (e.g., `7123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ`).

### Step 2: Get Your Personal Chat ID
1. Search for `@userinfobot` in Telegram and click **Start**.
2. Copy your numeric **Id** (e.g., `123456789`).
3. **Important:** Send a test message (e.g., "Hello") to your new bot.

### Step 3: Add Credentials to `.env` on VPS
```bash
TELEGRAM_BOT_TOKEN="7123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
TELEGRAM_CHAT_ID="123456789"
```

---

## 5. Host Resource Monitoring (`monitor-resources.sh`)

The script checks:
- **RAM usage > 85%**
- **Disk usage > 85%**
- **Docker container crash loops or abnormal exits**

### Step 1: Make Script Executable
```bash
chmod +x /root/ecommerce-production/deploy/scripts/monitor-resources.sh
```

### Step 2: Test the Alert Manually
```bash
/root/ecommerce-production/deploy/scripts/monitor-resources.sh
```
*(If normal, outputs `Health Check OK`. You can lower the threshold to `10` temporarily to test the Telegram ping).*

### Step 3: Configure Host Crontab
Open crontab on VPS:
```bash
crontab -e
```
Add:
```cron
*/5 * * * * /root/ecommerce-production/deploy/scripts/monitor-resources.sh >> /var/log/vps_monitor.log 2>&1
```

---

## 6. Automated Database Backups & Rolling Retention (`backup-db.sh`)

Enforces a **7 Daily / 4 Weekly copies** rolling retention policy:
- Nightly compressed `pg_dump` saved to `/var/backups/postgres/daily/`.
- Weekly Sunday snapshot saved to `/var/backups/postgres/weekly/`.
- Auto-purges daily copies older than 7 days and weekly copies older than 28 days.
- Backs up uploaded product media from `yathu_media_uploads`.
- Sends instant Telegram success/failure message with backup sizes.

### Step 1: Make Script Executable
```bash
chmod +x /root/ecommerce-production/deploy/scripts/backup-db.sh
```

### Step 2: Configure Nightly Cron Job at 2:00 AM UTC
Open crontab:
```bash
crontab -e
```
Add:
```cron
0 2 * * * /root/ecommerce-production/deploy/scripts/backup-db.sh >> /var/log/db_backup.log 2>&1
```

---

## 7. Health & Readiness Observability Probes

| Probe | Endpoint | Method | Purpose | Overhead |
| :--- | :--- | :--- | :--- | :--- |
| **Liveness** | `/healthz` | `GET` | Event loop & process health check | **Zero DB overhead** (< 1ms) |
| **Readiness** | `/ready` | `GET` | PostgreSQL connectivity, query latency, pool responsiveness | Lightweight query (`SELECT 1`, < 5ms) |

### Test Probes Locally or on VPS:
```bash
# Liveness
curl -i http://localhost:8080/healthz

# Readiness
curl -i http://localhost:8080/ready
```

**Expected `/ready` Response (HTTP 200):**
```json
{
  "status": "ready",
  "database": "connected",
  "latencyMs": 3,
  "memoryUsageMB": 82,
  "timestamp": "2026-10-03T11:00:00.000Z"
}
```

---

## 8. Uptime Kuma External Ping & Downtime Alerts

Uptime Kuma is containerized on port `3001` on your VPS.

1. Access `http://YOUR_VPS_IP:3001` and create your admin account.
2. Go to **Settings** ➔ **Notifications** ➔ **Setup Notification**:
   - Platform: **Telegram**
   - Bot Token: `<Your Bot Token>`
   - Chat ID: `<Your Chat ID>`
   - Click **Test** and **Save**.
3. Add **Monitor 1: Backend Readiness**:
   - URL: `https://yathuarokiyagam.com/ready`
   - Heartbeat: `30 seconds`
   - Accepted Status Codes: `200`
4. Add **Monitor 2: Storefront**:
   - URL: `https://yathuarokiyagam.com`
   - Heartbeat: `60 seconds`
   - Accepted Status Codes: `200`

---

## 9. Zero-Downtime GitHub Actions Deployment (`VPS-SETUP` branch)

The workflow file [.github/workflows/deploy.yml](file:///e:/ecommerce-production-VPS/.github/workflows/deploy.yml) automates zero-downtime rolling deploys:

### Workflow Secrets to Add in GitHub:
Go to your GitHub Repository ➔ **Settings** ➔ **Secrets and variables** ➔ **Actions**:
- `VPS_IP`: Your Hostinger VPS public IP.
- `VPS_USER`: `root`
- `VPS_SSH_PRIVATE_KEY`: Your OpenSSH private key used to connect to the VPS.

### Deployment Flow:
1. Whenever code is pushed to **`VPS-SETUP`** (or `vps`):
   ```bash
   git push origin VPS-SETUP
   ```
2. GitHub Actions builds the Backend and Frontend images remotely using Docker Buildx and pushes them to GitHub Container Registry (GHCR).
3. SSHs into the VPS and pulls the pre-built images (zero build load on VPS).
4. Executes `npx prisma migrate deploy` in a temporary container.
5. Starts the updated backend container and polls `/ready` until it returns HTTP 200.
6. Starts the updated frontend container and executes `docker exec yathu_nginx nginx -s reload` with zero dropped user checkouts.
