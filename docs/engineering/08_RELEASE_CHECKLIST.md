# 08_RELEASE_CHECKLIST.md

# Engineering Release Checklist

Version: 1.0

Status: Approved

---

Follow these steps before tagging and releasing a version to production:

## 1. Pre-Release Controls
* [ ] **Branch Sync**: Dev branch is fully integrated and tested.
* [ ] **Changelog**: Release changes are documented with semver tag changes (e.g., `v1.0.0`).
* [ ] **DB Backup**: Create a Neon PostgreSQL storage backup snapshot.

## 2. Environment Readiness
* [ ] **Secrets Verification**: Ensure Vercel and Railway environment configurations match keys from `.env.example`.
* [ ] **Migrations Preview**: Check proposed database schemas using `prisma migrate status` to prevent locking.

## 3. Post-Deployment Verification
* [ ] **Health Route**: Access `/api/v1/health` and verify HTTP 200 OK.
* [ ] **SSL Control**: Enforce HTTPS redirection checks across all domains.
* [ ] **Payment Sandbox**: Execute a Razorpay checkout using sandbox cards to verify order tracking.
