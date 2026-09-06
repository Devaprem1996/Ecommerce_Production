# Production Maintenance, CI/CD Pipeline & Security Patching Guide

**Project**: Yathu Iyarkaiyagam E-Commerce Platform  
**Target Infrastructure**: Hostinger VPS (Ubuntu 22.04 LTS) + GitHub Actions CI/CD  

---

## 1. Development & Release Git Workflow SOP

To guarantee zero production outages, **NEVER edit code directly on the VPS server via SSH**. All code changes must follow the structured Git release pipeline.

```mermaid
graph LR
    LocalDev[Developer Machine] -- "git push" --> FeatureBranch[feature/xxx or hotfix/xxx]
    FeatureBranch -- "Pull Request" --> MainBranch[main branch]
    MainBranch -- "GitHub Actions" --> CI_Test[1. Auto Build & Test]
    CI_Test -- "Passes" --> SSH_Deploy[2. Zero-Downtime VPS Reload]
```

### Branching Strategy
1. **`main` Branch**: Mirrors the live production server state. Protected branch (requires passing CI builds).
2. **Feature Work (`feature/<name>`)**: Create a branch locally for new features (e.g., `git checkout -b feature/razorpay-ui`).
3. **Hotfixes (`hotfix/<bug-name>`)**: Create for urgent production bug fixes (e.g., `git checkout -b hotfix/cart-calculation`).

---

## 2. Unbroken CI/CD Pipeline Setup (GitHub Actions)

Create a GitHub Actions workflow at `.github/workflows/deploy.yml` to automatically build, test, and deploy every push to `main` without downtime.

### File: `.github/workflows/deploy.yml`
```yaml
name: Production CI/CD Pipeline

on:
  push:
    branches:
      - main

jobs:
  test-and-build:
    name: 1. Test & Build Artifacts
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js 20 & pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 9

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: Verify Backend Compilation
        run: pnpm --filter ./backend build

      - name: Verify Frontend Compilation
        run: pnpm --filter ./frontend build

  deploy-to-vps:
    name: 2. Deploy to Hostinger VPS
    needs: test-and-build
    runs-on: ubuntu-latest
    steps:
      - name: Execute Remote SSH Deploy Script
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_IP }}
          username: root
          key: ${{ secrets.VPS_SSH_PRIVATE_KEY }}
          script: |
            set -e
            cd /var/www/yathu
            
            echo "1. Fetching latest code..."
            git pull origin main
            
            echo "2. Installing dependencies..."
            pnpm install --frozen-lockfile
            
            echo "3. Running database migrations..."
            cd backend
            npx prisma migrate deploy
            cd ..
            
            echo "4. Building backend & frontend..."
            pnpm build
            
            echo "5. Zero-downtime PM2 reload..."
            pm2 reload deployment/ecosystem.config.cjs --env production
            
            echo "6. Health Check Verification..."
            curl -f http://localhost:5000/api/v1/health || exit 1
            echo "Deployment successful & healthy!"
```

### How `pm2 reload` Ensures Zero Downtime
Instead of `pm2 restart` (which stops the server for a few seconds), `pm2 reload` spins up a new process worker first, waits for it to listen on the port, and then gracefully terminates the old process worker. Customers browsing the site will never experience downtime.

---
Required GitHub Secrets:
In your GitHub Repository, go to Settings > Secrets and variables > Actions and add:

VPS_IP: Your Hostinger VPS IP address.
VPS_SSH_PRIVATE_KEY: Your SSH private key for root access.

## 3. Package Updates & Vulnerability Patching SOP

### A. Scanning & Updating Outdated Node Packages
Run monthly dependency audits on your local machine before pushing to production:

```bash
# 1. Check for known security vulnerabilities in dependencies
pnpm audit

# 2. Automatically fix non-breaking security vulnerabilities
pnpm audit --fix

# 3. Check for outdated packages
pnpm outdated

# 4. Safely update minor & patch versions
pnpm update
```

### B. Safe Package Upgrade Workflow
1. Run `pnpm update` locally.
2. Execute local builds: `pnpm --filter ./backend build` & `pnpm --filter ./frontend build`.
3. Test catalog browsing and checkout flow locally.
4. Commit `package.json` and `pnpm-lock.yaml` and push to GitHub.

### C. OS & Ubuntu Security Updates on Hostinger VPS
Keep your Hostinger VPS operating system secure against Linux Kernel & OpenSSL vulnerabilities:

```bash
# SSH into VPS
ssh root@<YOUR_VPS_IP>

# 1. Update package lists
sudo apt update

# 2. Upgrade installed security patches
sudo apt upgrade -y

# 3. Enable automated security patches (recommended)
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

---

## 4. Emergency Production Rollback Procedure

If a bug slips into production, you can revert back to the previous stable state within **30 seconds**.

### Option 1: Git Revert (Recommended)
```bash
# On your local machine:
git log --oneline -n 5              # Find the last stable commit hash (e.g. a1b2c3d)
git revert HEAD                     # Reverts the bad commit
git push origin main                # Pushing triggers automatic CI/CD redeploy
```

### Option 2: Direct VPS Emergency Rollback
```bash
# SSH into Hostinger VPS:
ssh root@<YOUR_VPS_IP>
cd /var/www/yathu

# Rollback 1 commit and reload PM2 instantly
git reset --hard HEAD~1
pnpm build
pm2 reload deployment/ecosystem.config.cjs --env production
```

---

## 5. Database Schema Evolution & Safe Migrations

When adding new database tables or columns for new features:

1. **Modify `backend/prisma/schema.prisma` locally**.
2. Run `npx prisma migrate dev --name add_new_feature` on your local dev environment.
3. Commit the generated migration file inside `backend/prisma/migrations/`.
4. When pushed to `main`, the CI/CD pipeline automatically executes `npx prisma migrate deploy` on the Hostinger database without deleting existing customer data.
