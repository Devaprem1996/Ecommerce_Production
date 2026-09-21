# Self-Hosting & VPS Production Deployment Guide
**Target Platform:** Hostinger KVM VPS (Ubuntu 24.04 LTS)  
**Architecture:** Docker Compose (Nginx + Next.js + Express.js + PostgreSQL 16 + Uptime Kuma)  
**Local Simulation:** Compatible with Windows Docker Desktop / Linux / macOS  

---

## Table of Contents
1. [Architecture & Design Decisions](#1-architecture--design-decisions)
2. [Phase 1: Local PC Simulation (Hands-On Proof)](#2-phase-1-local-pc-simulation-hands-on-proof)
3. [Phase 2: Choosing & Ordering the Hostinger VPS](#3-phase-2-choosing--ordering-the-hostinger-vps)
4. [Phase 3: One-Click Hostinger VPS Setup & Hardening](#4-phase-3-one-click-hostinger-vps-setup--hardening)
5. [Phase 4: Production Deployment on VPS](#5-phase-4-production-deployment-on-vps)
6. [Phase 5: Domain Name & Free SSL Setup (Let's Encrypt)](#6-phase-5-domain-name--free-ssl-setup-lets-encrypt)
7. [Phase 6: Monitoring & Alert System Setup (Uptime Kuma)](#7-phase-6-monitoring--alert-system-setup-uptime-kuma)
8. [Phase 7: Automated Database Backups & Disaster Recovery](#8-phase-7-automated-database-backups--disaster-recovery)
9. [Phase 8: Daily Maintenance & Zero-Downtime Updates Cheatsheet](#9-phase-8-daily-maintenance--zero-downtime-updates-cheatsheet)

---

## 1. Architecture & Design Decisions

### Why Self-Hosting over Third-Party Cloud (Fly.io, Neon, Cloudinary)?
| Component | Third-Party Cloud Issues | Self-Hosted VPS Advantage |
| :--- | :--- | :--- |
| **Database** | Neon serverless cold-starts cause 10-30s delay on first request; connection pooling limits. | Native PostgreSQL 16 on NVMe storage: **<5ms query latency**, zero cold starts, zero usage fees. |
| **Media / Images** | Cloudinary free tier bandwidth/storage caps; expensive billing tiers once exceeded. | Nginx serves static images directly from Docker volume `/var/www/uploads/` with 30-day immutable caching. |
| **Backend & Frontend** | Vercel / Fly.io egress bandwidth fees and monthly micro-billing. | Predictable flat-rate VPS billing (~$6 - $12/month) with unmetered or high-bandwidth allocation. |
| **Monitoring** | Paid SaaS monitoring tools ($15-$50/month). | Self-hosted **Uptime Kuma**: 50MB RAM footprint, instant Telegram/Discord/Email push notifications. |

### Visual Architecture
```
                        Internet / Client Browser
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │     Hostinger VPS / Local    │
                    │   NGINX Reverse Proxy (:80)  │
                    └──────────────┬───────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         │ /                       │ /api/v1/                │ /uploads/
         ▼                         ▼                         ▼
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ Next.js Frontend │     │ Express Backend  │     │ Direct NVMe Disk │
│  Container :3000 │     │ Container :8080  │     │ Static Media     │
└──────────────────┘     └─────────┬────────┘     └──────────────────┘
                                   │ Internal Network
                                   ▼
                         ┌──────────────────┐
                         │  PostgreSQL 16   │
                         │ Container :5432  │
                         └──────────────────┘

* Sidecar Container: Uptime Kuma (:3001) - monitors Web & API 24/7
```

---

## 2. Phase 1: Local PC Simulation (Hands-On Proof)

Before ordering or touching a VPS, you can simulate the entire production stack directly on your local computer using **Docker Desktop**.

### Prerequisites
- Docker Desktop installed and running on your Windows PC.
- No changes will be made to your main branch codebase (`frontend/` and `backend/` stay untouched).

### Step-by-Step Simulation Instructions

#### Step 1: Open Terminal in the `deploy/` Directory
```powershell
cd "e:\Personal Projects\ecommerce-production\deploy"
```

#### Step 2: Create Local Environment File
Copy `.env.example` to `.env`:
```powershell
cp .env.example .env
```
> [!NOTE]
> The default values in `.env.example` are pre-configured out-of-the-box for local testing with `POSTGRES_DB=yathu_ecommerce`, `POSTGRES_USER=yathu_admin`, `POSTGRES_PASSWORD=yathu_secure_pass_2026`, and `http://localhost`.

#### Step 3: Build & Launch the Entire Stack
Run this command from inside the `deploy/` folder:
```powershell
docker compose up -d --build
```
*What happens:*
- Docker creates an isolated private bridge network `yathu_network`.
- PostgreSQL 16 spins up with an NVMe-backed volume.
- The Backend Docker container compiles TypeScript, runs Prisma generation, and connects to the containerized PostgreSQL.
- The Frontend Docker container runs `npm run build` and starts the optimized Next.js server.
- Nginx binds to port 80 and begins reverse proxying traffic.
- Uptime Kuma launches on port 3001.

#### Step 4: Run Initial Database Migration
Once the containers are up, apply the Prisma schema to create all tables inside the Dockerized PostgreSQL:
```powershell
docker exec -it yathu_backend npx prisma db push
```
*(Optional) Seed initial dummy categories, products, or admin account:*
```powershell
docker exec -it yathu_backend npm run seed
```

#### Step 5: Verify Everything in Your Browser
Open your browser and test these addresses:
1. **Storefront & Admin Web App:** [http://localhost](http://localhost)  
   *(Notice that you do NOT need `:3000` because Nginx handles port 80).*
2. **Backend API Health Check:** [http://localhost/api/v1/health](http://localhost/api/v1/health)  
   *(Should return `{"status":"ok"}` or `{ "service": "ecommerce-api", "status": "healthy" }`).*
3. **Uptime Kuma Dashboard:** [http://localhost:3001](http://localhost:3001)  
   *(Create your local admin account and add a test monitor for `http://backend:8080/api/v1/health`).*

#### Step 6: Stopping or Cleaning Up Simulation
- **Stop containers (preserve database data):**
  ```powershell
  docker compose stop
  ```
- **Restart containers:**
  ```powershell
  docker compose start
  ```
- **Destroy containers completely:**
  ```powershell
  docker compose down
  ```
  *(To also wipe database data volume, add `-v`: `docker compose down -v`).*

---

## 3. Phase 2: Choosing & Ordering the Hostinger VPS

When you are ready to launch for your client on Hostinger:

### 1. Recommended Plan:
- **KVM 2 VPS** (Recommended starting plan):
  - **2 vCPU Cores**
  - **8 GB RAM** (Plenty of headroom for Node.js, Next.js, PostgreSQL, and Nginx)
  - **100 GB NVMe Storage** (Ultra-fast database queries and media storage)
  - Cost: Approx. ₹499 - ₹699 / month (~$6 - $8 USD)
- **KVM 4 VPS** (If expecting >50,000 monthly active users):
  - 4 vCPU Cores / 16 GB RAM / 200 GB NVMe

### 2. Location & Operating System Selection:
- **Server Location:** Choose **India (Mumbai)** or **Singapore** for minimal ping (<25ms) to Indian shoppers.
- **Operating System:** Select **Ubuntu 24.04 64-bit** (Plain OS, without pre-installed panels like cPanel/CyberPanel, so Docker has 100% control of ports 80/443).

---

## 4. Phase 3: One-Click Hostinger VPS Setup & Hardening

Once Hostinger provides your VPS IP address (e.g., `194.163.xxx.xxx`) and root password:

### Step 1: Connect via SSH from your PC terminal
```bash
ssh root@YOUR_VPS_IP
```

### Step 2: Run the Automated Setup Script
Copy and execute our pre-made setup script directly on the VPS:
```bash
# Download or paste the setup script:
curl -sSL https://raw.githubusercontent.com/YOUR_GITHUB_REPO/main/deploy/scripts/setup-vps.sh -o setup-vps.sh
chmod +x setup-vps.sh
sudo ./setup-vps.sh
```
*(Alternatively, you can copy `deploy/scripts/setup-vps.sh` from your local machine to the VPS using `scp`).*

### What this script automatically configures:
1. **System Updates:** Upgrades all Ubuntu core packages and security patches.
2. **2GB Swap Memory:** Guarantees no Out-Of-Memory (OOM) crashes during high traffic or Next.js builds.
3. **Official Docker & Docker Compose Engine:** Installs Docker CE and Compose plugin.
4. **UFW Firewall:** Closes all ports except `22` (SSH), `80` (HTTP), `443` (HTTPS), and `3001` (Uptime Kuma).
5. **Fail2ban:** Automatically bans IP addresses attempting brute-force SSH logins.
6. **Automated Backup Cron:** Schedules `/var/backups/postgres` daily database backups at 2:00 AM.

---

## 5. Phase 4: Production Deployment on VPS

### Step 1: Clone Your Repository on the VPS
```bash
cd /root
git clone https://github.com/YOUR_GITHUB_USERNAME/ecommerce-production.git
cd /root/ecommerce-production/deploy
```

### Step 2: Create the Production Environment File
```bash
cp .env.example .env
nano .env
```
Fill in the real production credentials:
- `DOMAIN_NAME`: `yourdomain.com` (e.g., `yathuarokiyagam.com`)
- `POSTGRES_PASSWORD`: Use a strong 32+ character random string.
- `JWT_SECRET` & `REFRESH_TOKEN_SECRET`: Generate random 64-character hex keys.
- `FAST2SMS_API_KEY`: Client's production Fast2SMS key.
- `GMAIL_USER` & `GMAIL_APP_PASSWORD`: Client's notification email and 16-character Google App Password.
- `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`: Client's live Razorpay production keys.
- `FRONTEND_URL`: `https://yourdomain.com`
- `NEXT_PUBLIC_API_URL`: `https://yourdomain.com/api/v1`

Save with `Ctrl + O`, then `Enter`, then exit with `Ctrl + X`.

### Step 3: Launch Containers
```bash
docker compose up -d --build
```

### Step 4: Run Initial Database Migration
```bash
docker exec -it yathu_backend npx prisma db push
```
*(Optionally seed admin user):*
```bash
docker exec -it yathu_backend npm run seed
```

---

## 6. Phase 5: Domain Name & Free SSL Setup (Let's Encrypt)

### Step 1: Configure DNS A-Records
Go to your domain provider (Hostinger DNS, GoDaddy, Cloudflare, or Namecheap) and create:
- **Type:** `A` | **Name:** `@` | **Value:** `YOUR_VPS_IP` | **TTL:** 300
- **Type:** `A` | **Name:** `www` | **Value:** `YOUR_VPS_IP` | **TTL:** 300

Wait 5-10 minutes for DNS propagation. Verify by running on your computer:
```bash
ping yourdomain.com
```
It should return `YOUR_VPS_IP`.

### Step 2: Issue SSL Certificate with Certbot
Inside the VPS, run Certbot via Docker to obtain a 100% free Let's Encrypt SSL certificate:
```bash
docker run -it --rm --name certbot \
  -v yathu_certbot_conf:/etc/letsencrypt \
  -v yathu_certbot_www:/var/www/certbot \
  certbot/certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email your_email@domain.com \
  --agree-tos --no-eff-email \
  -d yourdomain.com -d www.yourdomain.com
```

### Step 3: Activate Production SSL in Nginx
1. Open `deploy/nginx/conf.d/production-ssl.conf.example`:
   ```bash
   cd /root/ecommerce-production/deploy/nginx/conf.d
   cp production-ssl.conf.example production-ssl.conf
   ```
2. Edit `production-ssl.conf` to replace `yourdomain.com` with your real domain:
   ```bash
   sed -i 's/yourdomain.com/yathuarokiyagam.com/g' production-ssl.conf
   ```
3. Remove the HTTP-only simulation configuration:
   ```bash
   rm local-simulation.conf
   ```
4. Reload Nginx without downtime:
   ```bash
   docker exec yathu_nginx nginx -s reload
   ```

Now your site is live with a padlock at **`https://yourdomain.com`**!

---

## 7. Phase 6: Monitoring & Alert System Setup (Uptime Kuma)

Uptime Kuma is already running on port `3001`.

### Step 1: Access the Dashboard
Open your browser to:
```
http://YOUR_VPS_IP:3001
```
*(Create your master username and password).*

### Step 2: Add Monitoring Checks
Click **Add New Monitor**:
1. **Monitor 1: Web Storefront**
   - **Monitor Type:** `HTTP(s)`
   - **Friendly Name:** `Storefront (Next.js)`
   - **URL:** `https://yourdomain.com`
   - **Heartbeat Interval:** `60 seconds`
   - Click **Save**.

2. **Monitor 2: Backend API Health**
   - **Monitor Type:** `HTTP(s)`
   - **Friendly Name:** `API Health Check (Express)`
   - **URL:** `https://yourdomain.com/api/v1/health`
   - **Heartbeat Interval:** `30 seconds`
   - **Accepted Status Codes:** `200`
   - Click **Save**.

3. **Monitor 3: SSL Expiry Checker**
   - Uptime Kuma automatically tracks and notifies you 14 days and 7 days before SSL certificates expire.

### Step 3: Setup Instant Telegram Push Alerts (Free)
1. Open Telegram and search for `@BotFather`.
2. Send `/newbot`, give it a name (e.g. `YathuMonitoringBot`), and copy the **HTTP API Bot Token**.
3. Search for `@userinfobot` in Telegram to get your personal **Chat ID**.
4. In Uptime Kuma Dashboard:
   - Go to **Settings** > **Notifications** > **Setup Notification**.
   - Select **Telegram**.
   - Paste **Bot Token** and **Chat ID**.
   - Click **Test** (You will immediately get a ping on your phone!).
   - Toggle **Default enabled** and save.

*Whenever your server, database, or API goes down, you receive an instant message on Telegram within 30 seconds.*

---

## 8. Phase 7: Automated Database Backups & Disaster Recovery

### Automatic Backups
The `setup-vps.sh` script automatically sets up a daily cron job at 2:00 AM that runs:
`/root/ecommerce-production/deploy/scripts/backup-db.sh`

- Backups are compressed with gzip (`.sql.gz`) and stored in `/var/backups/postgres/`.
- Backups older than **14 days** are automatically deleted to prevent disk space exhaustion.

### Manual On-Demand Backup
To trigger a backup anytime before making major changes:
```bash
/root/ecommerce-production/deploy/scripts/backup-db.sh
```

### Downloading a Backup to Your Local PC
From PowerShell on your local Windows PC:
```powershell
scp root@YOUR_VPS_IP:/var/backups/postgres/db_backup_yathu_ecommerce_*.sql.gz .
```

### Restoring a Backup (Disaster Recovery in 30 Seconds)
If someone accidentally drops a table or corrupts data:
```bash
/root/ecommerce-production/deploy/scripts/restore-db.sh /var/backups/postgres/db_backup_yathu_ecommerce_20260921_020000.sql.gz
```
The script will ask for confirmation, wipe corrupted tables, and restore the snapshot cleanly.

---

## 9. Phase 8: Daily Maintenance & Zero-Downtime Updates Cheatsheet

### 1. Pushing New Features / Updating Code from GitHub
When you have updated code on your main branch and want to deploy without downtime:
```bash
cd /root/ecommerce-production
git pull origin main
cd deploy
docker compose up -d --build --no-deps frontend backend
```
*Docker will build the new images in the background and hot-swap the containers in 1-2 seconds.*

### 2. Viewing Live Logs
- **All services:**
  ```bash
  docker compose logs -f
  ```
- **Backend API logs only:**
  ```bash
  docker compose logs -f backend
  ```
- **Nginx Access & Error logs:**
  ```bash
  docker compose logs -f nginx
  ```

### 3. Checking Resource Usage (RAM & CPU)
```bash
docker stats
```
*(Shows real-time CPU %, RAM usage, and network I/O for each container).*

### 4. Cleaning Up Unused Docker Build Cache
Once a month, free up unused Docker layers:
```bash
docker system prune -af --volumes=false
```
*(Leaves your active database and media volumes completely safe).*
