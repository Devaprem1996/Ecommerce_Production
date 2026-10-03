# Application Build, Docker Operations & Debugging Guide

This guide is the authoritative reference for building, testing, deploying, and debugging the **Yathu Arokiyagam** production e-commerce stack across both **Local Simulation** and the **Hostinger KVM 2 VPS (2 vCPU, 8 GB RAM)**.

---

## 1. System Architecture & Environment Parity

The platform runs 5 containerized services connected via an internal Docker bridge network (`yathu_network`):

```
                        [ Internet / Client Browser ]
                                     │
                                     ▼
                ┌────────────────────────────────────────┐
                │   yathu_nginx (Reverse Proxy)          │
                │   Port 80 / 443 (Local: 8088 / 443)    │
                └───────┬────────────────────────┬───────┘
                        │                        │
       /api/auth/*, /api/pincode/*, /*           │ /api/v1/*, /api/*, /healthz, /ready
                        │                        │
                        ▼                        ▼
         ┌────────────────────────┐    ┌────────────────────────┐
         │ yathu_frontend         │    │ yathu_backend          │
         │ Next.js 16 (Port 3000) │    │ Express.js (Port 8080) │
         └────────────────────────┘    └───────────┬────────────┘
                                                   │
                                                   ▼
                                       ┌────────────────────────┐
                                       │ yathu_postgres         │
                                       │ PostgreSQL 16 (:5432)  │
                                       └────────────────────────┘

         ┌────────────────────────┐
         │ yathu_uptime_kuma      │  (Self-hosted monitoring on port 3001)
         └────────────────────────┘
```

### Local Simulation vs. Production VPS Comparison

| Feature | Local Simulation (`docker-compose.yml`) | Production VPS (`docker-compose.prod.yml`) |
| :--- | :--- | :--- |
| **HTTP Port** | `8088` (or custom `$NGINX_HTTP_PORT`) | Standard `80` |
| **HTTPS / SSL** | Optional / Self-signed | Let's Encrypt automated TLS via Certbot |
| **Domain** | `http://localhost:8088` | `https://yathuarokiyagam.com` |
| **Resource Limits** | Uncapped (uses host capacity) | Capped at **~6.4 GB RAM / 2 vCPU** (safety buffer) |
| **Next.js Auth Cookies** | HTTP-compatible (`Secure: false`) | HTTPS-enforced (`Secure: true`) |
| **Database Storage** | Docker Named Volume (`yathu_postgres_data`) | Docker Named Volume backed by NVMe SSD |
| **Observability** | Console logs + Uptime Kuma | Sentry Tracing + Telegram Alerts + Uptime Kuma |

---

## 2. Step-by-Step Application Build Guide

### A. Direct Host Builds (Without Docker, for fast local development)

#### 1. Backend (Node.js + TypeScript + Prisma)
```bash
cd backend

# 1. Install dependencies
npm ci || npm install

# 2. Generate Prisma Client (required whenever schema.prisma changes)
npx prisma generate

# 3. Compile TypeScript to dist/
npm run build

# 4. Start local development server with hot-reload
npm run dev
```

#### 2. Frontend (Next.js 16 App Router)
```bash
cd frontend

# 1. Install dependencies
npm ci || npm install

# 2. Build production assets & compile TypeScript
npm run build

# 3. Start local production runner
npm start
```

---

### B. Docker Compose Stack Builds

#### 1. Local Simulation Build & Launch
To build and start all 5 containers in the background:
```bash
cd deploy
docker compose up --build -d
```

To rebuild a single container after code edits without restarting the database:
```bash
# Rebuild only the frontend
docker compose up --build -d --force-recreate frontend

# Rebuild only the backend
docker compose up --build -d --force-recreate backend
```

#### 2. Production VPS Build & Launch
On the Hostinger VPS, use the hardened production compose manifest:
```bash
cd /root/ecommerce-production/deploy

# Pull latest prebuilt images from GitHub Container Registry (GHCR)
docker compose -f docker-compose.prod.yml pull

# Launch or rolling-reload stack
docker compose -f docker-compose.prod.yml up -d --remove-orphans
```

---

### C. Build Performance Optimizations & Caching Rules

1. **Direct Ownership in Dockerfiles (`COPY --chown=...`):**
   - **Do NOT** run `RUN chown -R expressjs:nodejs /app` on 50,000+ files. On Windows/WSL2 and Linux NVMe, recursive file chowning blocks build I/O for 15+ minutes.
   - **Always** use direct flag copy:
     ```dockerfile
     COPY --chown=nextjs:nodejs --from=builder /app/.next ./.next
     COPY --chown=expressjs:nodejs --from=builder /app/dist ./dist
     ```
2. **Multi-Stage Caching Order:**
   - First copy `package*.json` and run `npm ci`.
   - Then copy source code (`COPY . .`).
   - This prevents re-downloading `node_modules` when only application code changes.
3. **Bypassing Cache on Stale Builds:**
   If Next.js or Prisma changes are not reflecting in the container, force a clean build:
   ```bash
   docker compose build --no-cache frontend
   docker compose up -d --force-recreate frontend
   ```

---

## 3. VPS Readiness & Parity Verification Checklist

Before deploying any commit to the production VPS, verify these 6 architectural rules:

- [x] **Nginx API Route Separation:**
  - `/api/auth/` and `/api/pincode/` **must** route to `frontend_app` (Next.js App Router route handlers).
  - `/api/` and `/api/v1/` **must** route to `backend_api` (Express backend).
  - `/uploads/` **must** be served directly from static disk `/var/www/uploads/` by Nginx.
- [x] **Dynamic Cookie Security:**
  - Auth route cookies (`access_token`, `admin_access_token`) dynamically detect `https:` via `x-forwarded-proto`.
  - Works seamlessly on both local HTTP port `8088` and live production HTTPS.
- [x] **Database Pool Guard:**
  - `DATABASE_URL` specifies `connection_limit=20&pool_timeout=10` to avoid exhausting PostgreSQL connections under load.
- [x] **Health & Readiness Endpoints:**
  - `/healthz` responds in <5ms without touching PostgreSQL (liveness probe).
  - `/ready` executes `SELECT 1` with latency timing (<3000ms threshold) and reports memory usage (readiness probe).
- [x] **Graceful Shutdown & Signal Trapping:**
  - Express traps `SIGTERM` and `SIGINT`, closes HTTP socket pool, calls `disconnectDb()`, and has a 10s fallback watchdog timer.
- [x] **Resource Caps on 8GB RAM VPS:**
  - Docker service limits are capped at **6.4 GB total** in `docker-compose.prod.yml`, preserving 1.6 GB RAM for host OS, kernel buffers, SSH, and fail2ban.

---

## 4. Essential Docker Commands & Explanations

### A. Stack Lifecycle & Container Management

| Command | Explanation |
| :--- | :--- |
| `docker compose ps` | Displays the status, uptime, health status, and mapped ports for all services. |
| `docker compose up -d` | Starts all services in detached mode in the background. |
| `docker compose down` | Stops and removes containers and internal networks (named volumes remain preserved). |
| `docker compose restart <service>` | Restarts a specific service (e.g. `docker compose restart nginx`). |
| `docker compose stop <service>` | Gracefully stops a service without removing its container. |
| `docker compose start <service>` | Starts a previously stopped service. |

---

### B. Health, Resource & Live Metrics Monitoring

#### 1. Live Container Resource Usage
```bash
# View real-time CPU, RAM usage, memory limits, and network I/O
docker stats

# Get a single non-streaming snapshot (ideal for scripts)
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}"
```

#### 2. Service Healthcheck Status
```bash
# Inspect the last 5 healthcheck execution logs for the backend
docker inspect --format='{{json .State.Health}}' yathu_backend
```

---

### C. Live Logging & Real-Time Auditing

```bash
# Follow combined logs of all running services
docker compose logs -f

# Follow logs of a specific service with timestamps
docker compose logs -f -t backend

# Inspect the last 100 log lines of the frontend
docker logs --tail 100 -f yathu_frontend

# View logs generated within the last 15 minutes
docker logs --since 15m yathu_backend

# Search for specific errors in container logs
docker logs yathu_backend 2>&1 | grep -i "error"
```

---

### D. Interactive Shell & Database CLI Access

#### 1. Enter Container Shell
```bash
# Enter Express backend container (Alpine Linux shell)
docker exec -it yathu_backend sh

# Enter Next.js frontend container
docker exec -it yathu_frontend sh

# Enter Nginx proxy container
docker exec -it yathu_nginx sh
```

#### 2. PostgreSQL Direct Database Shell
```bash
# Connect directly to the production database via psql inside the container
docker exec -it yathu_postgres psql -U yathu_admin -d yathu_ecommerce

# Run a quick SQL query directly from host terminal
docker exec -i yathu_postgres psql -U yathu_admin -d yathu_ecommerce -c "SELECT email, role FROM users;"

# Check current active database connections
docker exec -i yathu_postgres psql -U yathu_admin -d yathu_ecommerce -c "SELECT count(*) FROM pg_stat_activity;"
```

---

## 5. Deep-Dive Debugging & Troubleshooting Playbook

### Scenario 1: Container Exited or Stuck in a Crash Loop (`Restarting`)

**Symptom:** `docker compose ps` shows `yathu_backend` or `yathu_frontend` in `Restarting (1)`.

**Diagnostic Steps:**
1. Check container exit code:
   ```bash
   docker inspect yathu_backend --format='ExitCode: {{.State.ExitCode}}, OOMKilled: {{.State.OOMKilled}}'
   ```
   - If `OOMKilled: true`: The container exceeded its memory limit. Increase the memory limit in `docker-compose.prod.yml` or optimize memory leaks.
   - If `ExitCode: 1`: An unhandled exception or missing environment variable caused the crash.
2. View the fatal stack trace:
   ```bash
   docker logs --tail 50 yathu_backend
   ```
3. Common culprit: Missing or malformed `DATABASE_URL` or missing JWT secret keys in `.env`.

---

### Scenario 2: Nginx Returns `502 Bad Gateway`

**Symptom:** Browser shows `502 Bad Gateway` when accessing `http://localhost:8088` or `https://yathuarokiyagam.com`.

**Diagnostic Steps:**
1. Verify if the upstream containers are running:
   ```bash
   docker compose ps
   ```
2. Test if the backend responds internally on port 8080:
   ```bash
   curl -I http://127.0.0.1:8080/ready
   ```
3. Test network connectivity from inside the Nginx container:
   ```bash
   docker exec yathu_nginx wget -qO- http://backend:8080/ready
   docker exec yathu_nginx wget -qO- http://frontend:3000/
   ```
4. If Nginx configuration has syntax errors:
   ```bash
   docker exec yathu_nginx nginx -t
   ```
5. Reload Nginx without downtime after fixing configuration:
   ```bash
   docker exec yathu_nginx nginx -s reload
   ```

---

### Scenario 3: Database Connection Refused or Connection Pool Exhaustion

**Symptom:** Backend logs show `PrismaClientInitializationError: Can't reach database server at postgres:5432`.

**Diagnostic Steps:**
1. Check if the database container is healthy:
   ```bash
   docker exec yathu_postgres pg_isready -U yathu_admin -d yathu_ecommerce
   ```
2. Inspect active connections:
   ```bash
   docker exec -i yathu_postgres psql -U yathu_admin -d yathu_ecommerce -c "
   SELECT state, count(*) FROM pg_stat_activity GROUP BY state;
   "
   ```
3. If PostgreSQL crashed due to disk space:
   ```bash
   df -h
   ```
4. Restart PostgreSQL and backend:
   ```bash
   docker compose restart postgres
   docker compose restart backend
   ```

---

### Scenario 4: Next.js Frontend Page Not Reflecting Updated Code

**Symptom:** You made edits in `frontend/src/app/...`, but the browser continues to serve the old page.

**Diagnostic Steps:**
1. Docker builder cached the build step. Rebuild with `--no-cache`:
   ```bash
   cd deploy
   docker compose build --no-cache frontend
   docker compose up -d --force-recreate frontend
   ```
2. Clear Next.js server build cache:
   ```bash
   docker exec -it yathu_frontend rm -rf .next/cache
   docker compose restart frontend
   ```
3. Force-refresh browser cache: `Ctrl + F5` (or `Cmd + Shift + R`).

---

### Scenario 5: Low Disk Space on VPS (`No space left on device`)

**Symptom:** Docker builds fail with `write /var/lib/docker/... no space left on device`.

**Diagnostic Steps:**
1. Check disk utilization:
   ```bash
   df -h /
   ```
2. View space consumed by Docker:
   ```bash
   docker system df
   ```
3. Clean dangling images, stopped containers, and build cache safely **without** deleting database volumes:
   ```bash
   # Remove unused build cache
   docker builder prune -f

   # Remove unused images (keeps images currently used by running containers)
   docker image prune -a -f

   # Comprehensive safe cleanup (preserves named volumes like yathu_postgres_data)
   docker system prune -f
   ```
   > [!CAUTION]
   > **NEVER** use `--volumes` flag in `docker system prune` on production VPS, as it will wipe unattached Docker volumes!

---

## 6. Zero-Downtime Deployment on VPS

GitHub Actions automatically handles zero-downtime deployment on push to `VPS-SETUP` or `vps`. 

To perform a manual zero-downtime deployment on the VPS:

```bash
# 1. SSH into VPS
ssh root@<VPS_IP>

# 2. Navigate to project deploy directory
cd /root/ecommerce-production/deploy

# 3. Pull latest code
git pull origin VPS-SETUP

# 4. Pull new container images from GHCR
docker compose -f docker-compose.prod.yml pull

# 5. Recreate backend container (Nginx automatically buffers requests during restart)
docker compose -f docker-compose.prod.yml up -d --no-deps backend

# 6. Verify backend readiness probe
until docker exec yathu_backend wget -qO- http://127.0.0.1:8080/ready; do
    echo "Waiting for backend readiness..."
    sleep 2
done

# 7. Recreate frontend container
docker compose -f docker-compose.prod.yml up -d --no-deps frontend

# 8. Reload Nginx configuration smoothly
docker exec yathu_nginx nginx -s reload

echo "Zero-downtime deployment finished successfully! 🎉"
```

---

## 7. Developer & DevOps Command Cheat Sheet

| Task | One-Liner Command |
| :--- | :--- |
| **Check container health** | `docker compose ps` |
| **View real-time resource usage** | `docker stats --no-stream` |
| **Live tail backend logs** | `docker logs -f --tail 50 yathu_backend` |
| **Live tail frontend logs** | `docker logs -f --tail 50 yathu_frontend` |
| **Test backend readiness** | `curl -i http://localhost:8088/ready` |
| **Test backend liveness** | `curl -i http://localhost:8088/healthz` |
| **Reload Nginx live** | `docker exec yathu_nginx nginx -s reload` |
| **Test Nginx syntax** | `docker exec yathu_nginx nginx -t` |
| **Enter Postgres shell** | `docker exec -it yathu_postgres psql -U yathu_admin -d yathu_ecommerce` |
| **Run manual DB backup** | `/root/ecommerce-production/deploy/scripts/backup-db.sh` |
| **Run host resource monitor** | `/root/ecommerce-production/deploy/scripts/monitor-resources.sh` |
| **Safe Docker cleanup** | `docker builder prune -f && docker image prune -f` |
| **Recreate single service** | `docker compose up -d --build --force-recreate <service_name>` |
