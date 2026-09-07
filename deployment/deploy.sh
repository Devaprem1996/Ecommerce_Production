#!/usr/bin/env bash
set -e

echo "=== starting Yathu Arokiyagam Deployment ==="

# 1. Pull latest code from GitHub main branch
echo "[1/5] Pulling latest repository code..."
git pull origin main

# 2. Install dependencies
echo "[2/5] Installing pnpm dependencies..."
pnpm install --frozen-lockfile

# 3. Deploy Database Migrations
echo "[3/5] Deploying database migrations..."
cd backend
npx prisma migrate deploy
cd ..

# 4. Build projects
echo "[4/5] Building backend and frontend production assets..."
pnpm build

# 5. Reload PM2 process manager
echo "[5/5] Reloading PM2 applications..."
pm2 reload deployment/ecosystem.config.cjs --env production

echo "=== Deployment Completed Successfully! ==="
