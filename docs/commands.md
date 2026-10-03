# Yathu Arokiyagam - Operations & Command Reference

This document provides quick reference commands for running Docker, managing the database with Prisma, and debugging both locally and on the production VPS.

---

## 1. Prisma & PostgreSQL Database Management

### A. Run Prisma DB Push (Update Database Schema)

#### Option 1: Directly Inside the Running Docker Backend Container (Recommended)
This runs Prisma directly in the Docker network without needing Node.js or PostgreSQL drivers installed on your host machine:

```bash
# 1. Push schema.prisma changes to PostgreSQL
docker exec -it yathu_backend npx prisma db push

# 2. Regenerate Prisma Client inside the container
docker exec -it yathu_backend npx prisma generate

# 3. (Optional) Re-seed initial products, categories & admin user
docker exec -it yathu_backend npx ts-node prisma/seed.ts
```

#### Option 2: From Host Machine (Local Terminal / PowerShell)
If you are developing locally on your host machine with `DATABASE_URL` pointing to `localhost:5432`:

```bash
cd backend

# 1. Push schema directly to Docker PostgreSQL
npx prisma db push

# 2. Regenerate Prisma Client locally
npx prisma generate

# 3. Open Prisma Studio GUI in your browser (http://localhost:5555)
npx prisma studio
```

---

### B. Prisma Production Migrations & Status Checks

```bash
# Check if database schema is up-to-date with migrations
docker exec -it yathu_backend npx prisma migrate status

# Apply pending migrations safely on production VPS
docker exec -it yathu_backend npx prisma migrate deploy

# Create a new migration file after modifying schema.prisma
cd backend
npx prisma migrate dev --name describe_your_change
```

---

### C. Direct PostgreSQL CLI Verification (`psql`)

```bash
# 1. Open interactive PostgreSQL terminal
docker exec -it yathu_postgres psql -U yathu_admin -d yathu_ecommerce

# 2. Inspect a specific table schema (e.g. orders)
docker exec -i yathu_postgres psql -U yathu_admin -d yathu_ecommerce -c "\d orders"

# 3. View latest orders with courier tracking details
docker exec -i yathu_postgres psql -U yathu_admin -d yathu_ecommerce -c "
SELECT id, \"orderNumber\", status, \"courierPartner\", \"trackingNumber\" 
FROM orders ORDER BY \"createdAt\" DESC LIMIT 5;
"

# 4. View all registered users and roles
docker exec -i yathu_postgres psql -U yathu_admin -d yathu_ecommerce -c "
SELECT id, email, role, \"createdAt\" FROM users;
"
```

---

## 2. Docker Stack Management

### A. Building & Launching Containers

| Action | Command | Explanation |
| :--- | :--- | :--- |
| **Start Full Stack** | `docker compose up --build -d` | Builds and launches all 5 services in background. |
| **Rebuild Frontend Only** | `docker compose up --build -d --force-recreate frontend` | Recompiles Next.js without touching the database. |
| **Rebuild Backend Only** | `docker compose up --build -d --force-recreate backend` | Recompiles Express & Prisma without restarting other services. |
| **Stop Stack** | `docker compose down` | Safely stops containers (data volumes preserved). |
| **Restart a Service** | `docker compose restart <service_name>` | Restarts a single service (e.g. `docker compose restart nginx`). |
| **Production VPS Launch** | `docker compose -f docker-compose.prod.yml up -d` | Launches production stack with 6.4 GB RAM limit. |

---

### B. Health & Resource Monitoring

```bash
# 1. View status, uptime, healthchecks, and ports of all containers
docker compose ps

# 2. View real-time CPU and RAM utilization for all containers
docker stats

# 3. Snapshot resource usage without streaming
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"

# 4. Test backend readiness probe (checks PostgreSQL latency & memory)
curl -i http://localhost:8088/ready

# 5. Test backend liveness probe
curl -i http://localhost:8088/healthz
```

---

### C. Real-Time Logging & Debugging

```bash
# 1. Tail live backend logs (last 50 lines)
docker logs -f --tail 50 yathu_backend

# 2. Tail live frontend Next.js logs
docker logs -f --tail 50 yathu_frontend

# 3. Tail Nginx access and error logs
docker logs -f --tail 50 yathu_nginx

# 4. View logs from the last 15 minutes
docker logs --since 15m yathu_backend

# 5. Search for errors in container logs
docker logs yathu_backend 2>&1 | grep -i "error"
```

---

### D. Interactive Container Shell Access

```bash
# Backend container (Alpine shell)
docker exec -it yathu_backend sh

# Frontend container
docker exec -it yathu_frontend sh

# Nginx container
docker exec -it yathu_nginx sh
```

---

## 3. Top Troubleshooting Scenarios & Fixes

### 1. `502 Bad Gateway` from Nginx
- **Cause:** Upstream container (`yathu_backend` or `yathu_frontend`) is restarting or crashed.
- **Fix:** 
  ```bash
  docker compose ps
  docker exec yathu_nginx nginx -t
  docker exec yathu_nginx nginx -s reload
  ```

### 2. Container in Crash Loop (`CrashLoopBackOff` / `Restarting`)
- **Cause:** Exceeded RAM limit or fatal exception on startup.
- **Fix:**
  ```bash
  docker inspect yathu_backend --format='ExitCode: {{.State.ExitCode}}, OOMKilled: {{.State.OOMKilled}}'
  docker logs --tail 50 yathu_backend
  ```

### 3. Stale Frontend Cache / UI Changes Not Showing
- **Cause:** Docker build cache retained old `.next` layer.
- **Fix:**
  ```bash
  docker compose build --no-cache frontend
  docker compose up -d --force-recreate frontend
  ```

### 4. Low Disk Space on VPS (`No space left on device`)
- **Cause:** Accumulation of dangling Docker build images and layers.
- **Fix (Safe - preserves database volumes):**
  ```bash
  docker builder prune -f
  docker image prune -a -f
  docker system prune -f
  ```
  *(Never pass `--volumes` on production so database volumes remain untouched).*

---

## 4. Local Simulation URLs

- **Storefront Home:** [http://localhost:8088](http://localhost:8088)
- **Admin Dashboard:** [http://localhost:8088/admin](http://localhost:8088/admin)
  - **Email:** `admin@yathu.com`
  - **Password:** `admin123`
- **User Account Portal:** [http://localhost:8088/account](http://localhost:8088/account)
- **Backend Readiness Check:** [http://localhost:8088/ready](http://localhost:8088/ready)
- **Uptime Kuma Dashboard:** [http://localhost:3001](http://localhost:3001)
