# Production Observability, Alerting & Zero-Downtime Operations Guide

This guide details how to configure real-time observability, instant mobile notifications (Telegram/Email), database resilience, and automated zero-downtime deployments on your Hostinger KVM VPS (2 vCPU, 8 GB RAM).

---

## 1. Real-Time Error Tracking with Sentry (Node.js Express + Prisma)

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

### Step 3: Configure Instant Sentry Alert Routing to Telegram or Email
1. In the Sentry dashboard, go to **Alerts** ➔ **Create Alert**.
2. Set condition: *"When an event is captured"* ➔ Filter: `level == error` or `environment == production`.
3. Under **Perform Actions**:
   - **Email:** Select *Send a notification to Issue Owners / Personal Email*.
   - **Telegram:** Use Sentry's native Telegram integration (*Settings ➔ Integrations ➔ Telegram*) or route Sentry Webhooks to your Telegram bot.

---

## 2. Instant Telegram Push Notifications Setup

### Step 1: Create Your Monitoring Bot with @BotFather
1. Open your Telegram app on mobile or desktop.
2. Search for `@BotFather` (verified checkmark).
3. Send `/newbot`.
4. Choose a friendly name (e.g., `Yathu VPS Alert Bot`).
5. Choose a username ending in `bot` (e.g., `yathu_vps_alert_bot`).
6. BotFather will provide an **HTTP API Bot Token** (e.g., `7123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ`). Save this token.

### Step 2: Get Your Personal Chat ID
1. In Telegram, search for `@userinfobot`.
2. Click **Start**.
3. It will immediately reply with your numeric **Id** (e.g., `123456789`).
4. **Important:** Send a test message (e.g., "Hello") to your new bot so it has permission to message you.

### Step 3: Add Credentials to `.env` on VPS
```bash
TELEGRAM_BOT_TOKEN="7123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
TELEGRAM_CHAT_ID="123456789"
```

---

## 3. Host Resource Monitoring (`monitor-resources.sh`)

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
*(If normal, outputs `Health Check OK`. You can lower the threshold to `10` temporarily to verify an instant Telegram ping on your phone).*

### Step 3: Configure Host Crontab
Open crontab:
```bash
crontab -e
```
Add the following line to run the monitor every 5 minutes:
```bash
*/5 * * * * /root/ecommerce-production/deploy/scripts/monitor-resources.sh >> /var/log/vps_monitor.log 2>&1
```

---

## 4. Automated Database Backups & Rolling Retention (`backup-db.sh`)

The script enforces a **7 Daily / 4 Weekly copies** rolling retention algorithm:
- Every night, creates a compressed `pg_dump` in `/var/backups/postgres/daily/`.
- Every Sunday, archives a snapshot in `/var/backups/postgres/weekly/`.
- Purges daily copies older than 7 days and weekly copies older than 28 days.
- Backs up the product image volume `yathu_media_uploads`.
- Sends an instant Telegram success/failure message with backup sizes and execution time.

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
```bash
0 2 * * * /root/ecommerce-production/deploy/scripts/backup-db.sh >> /var/log/db_backup.log 2>&1
```

---

## 5. Health & Readiness Observability Probes

The backend now exposes two distinct, standardized probes:

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

## 6. Uptime Kuma External Latency & Downtime Alerts

Uptime Kuma is containerized on port `3001` on your VPS.

1. Access `http://YOUR_VPS_IP:3001` and create your admin account.
2. Go to **Settings** ➔ **Notifications** ➔ **Setup Notification**:
   - Platform: **Telegram**
   - Bot Token: `<Your Bot Token>`
   - Chat ID: `<Your Chat ID>`
   - Click **Test** and **Save**.
3. Add **Monitor: Backend Readiness**:
   - Monitor Type: `HTTP(s)`
   - URL: `https://yathuarokiyagam.com/ready`
   - Heartbeat: `30 seconds`
   - Retries: `2`
   - Accepted Status Codes: `200`
   - Max Redirects: `5`
4. Add **Monitor: Storefront**:
   - URL: `https://yathuarokiyagam.com`
   - Heartbeat: `60 seconds`
   - Accepted Status Codes: `200`

---

## 7. Zero-Downtime GitHub Actions Deployment (`vps` branch)

The workflow file [.github/workflows/deploy.yml](file:///e:/ecommerce-production-VPS/.github/workflows/deploy.yml) automates zero-downtime rolling deploys:

### Workflow Secrets to Add in GitHub:
Go to your GitHub Repository ➔ **Settings** ➔ **Secrets and variables** ➔ **Actions**:
- `VPS_IP`: Your VPS public IP address.
- `VPS_SSH_PRIVATE_KEY`: Your OpenSSH private key used to connect to the VPS.
- `VPS_USER`: `root`

### Deployment Flow:
1. Whenever code is pushed to the `vps` branch, GitHub Actions builds the Backend and Frontend images remotely using Docker Buildx and pushes them to GitHub Container Registry (GHCR).
2. SSHs into the VPS and pulls the pre-built images (zero build load on VPS).
3. Executes `npx prisma migrate deploy` in a temporary container.
4. Starts the updated backend container and polls `/ready` until it returns HTTP 200.
5. Starts the updated frontend container and executes `nginx -s reload` with zero dropped user requests.
