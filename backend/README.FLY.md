# Deploy the backend to Fly.io

The backend runs standalone on Fly.io; the Next.js frontend on Vercel talks to it via `NEXT_PUBLIC_API_URL`.

## 1. Prerequisites

- [Install `flyctl`](https://fly.io/docs/hands-on/install-flyctl/) and log in: `flyctl auth login`
- `flyctl` builds the Docker image on Fly's infra, so you do **not** need Docker locally.
- If `flyctl apps create` reports the account as "high risk", unlock it at https://fly.io/high-risk-unlock first.

## 2. Deploy

```bash
cd backend

# Create the app once (already done in this repo, skip if it exists)
flyctl apps create yathuiyarkaiyagam-backend-prod

# Set runtime secrets (use value for each; at minimum the ones below)
flyctl secrets set DATABASE_URL="<direct_url>" \
  DIRECT_URL="<direct_url>" \
  JWT_SECRET="<jwt_secret>" \
  REFRESH_TOKEN_SECRET="<refresh_secret>" \
  CLOUDINARY_URL="<cloudinary_url>" \
  FRONTEND_URL="https://yathuiyarkaiyagam.vercel.app" \
  RAZORPAY_KEY_ID="<key>" \
  RAZORPAY_KEY_SECRET="<secret>" \
  RAZORPAY_WEBHOOK_SECRET="<secret>" \
  GOOGLE_CLIENT_ID="<client_id>" \
  GOOGLE_CLIENT_SECRET="<client_secret>"

# Deploy (build happens remotely)
flyctl deploy
```

Notes

- Use Neon's **direct** (`*-pooler`-free) endpoint for `DATABASE_URL` — Fly VMs are long-running, and Prisma 5 works best with an un-pooled URL.
- `FRONTEND_URL` must be the real Vercel origin (no trailing slash) because the backend uses it as the CORS allowlist.
- Health check: `https://yathuiyarkaiyagam-backend-prod.fly.dev/api/v1/health`.
- Prisma on Debian 12: the image pins `PRISMA_QUERY_ENGINE_LIBRARY` to the `debian-openssl-3.0.x` engine (see `Dockerfile`).

## 4. Automated deploys (GitHub Actions)

A workflow (`.github/workflows/deploy-backend-fly.yml`) redeploys the backend to Fly whenever `backend/**` changes on `main`.

To enable it, add a repo secret `FLY_API_TOKEN`:

```bash
cd backend
# Create an org-scoped deploy token
flyctl tokens create deploy -o personal
```

Then in GitHub → Settings → Secrets and variables → Actions → New repository secret:
name `FLY_API_TOKEN`, value = the token from the command above.

## 5. Point the Vercel frontend at the backend

In the Vercel project (`ecommerce-production-ui`):

1. Project Settings → Environment Variables → add `NEXT_PUBLIC_API_URL=https://yathuiyarkaiyagam-backend-prod.fly.dev/api/v1`
   for Production (and Preview if desired).
2. Redeploy the frontend.

The frontend already proxies `/api/v1/*` to `NEXT_PUBLIC_API_URL` via `frontend/next.config.ts` rewrites, and `frontend/src/services/api-client.ts` reads the same variable, so no code changes are needed.