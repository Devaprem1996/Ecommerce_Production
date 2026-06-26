# 08_DEPLOYMENT_ARCHITECTURE.md

# Production Deployment Architecture

Version: 1.0

Status: Approved

---

## 1. Platform Topology

The application uses a serverless and containerized deployment infrastructure to ensure automatic scaling, easy monitoring, and cost efficiency.

```
       [ Client Browser ]
         │          │
 (HTTPS) │          │ (HTTPS)
         ▼          ▼
   [ Vercel ]   [ Railway ]
   (Next.js)   (Express Server)
                    │
                    │ (TCP/SSL)
                    ▼
          [ Neon PostgreSQL ]
```

### A. Frontend: Vercel
* Hosts the client Next.js application.
* Standard CDN caching, edge routing, and asset optimization.
* Continuous Integration: Auto-builds and deploys from the GitHub repository `main` branch.

### B. Backend: Railway
* Hosts the containerized Express Node.js application.
* Configured using a dynamic health-check route `/api/v1/health` to confirm server readiness before routing traffic.
* Automatically redeploys on new changes merged into the GitHub repository `main` branch.

### C. Database: Neon PostgreSQL
* A serverless, autoscaling PostgreSQL provider.
* Automatically scales computing resources up/down according to traffic volume.

---

## 2. Environment Variables Configuration

The following variables must be configured on their respective platforms.

### A. Backend Variables (Railway)
| Variable Name | Description | Example |
|---|---|---|
| `PORT` | Local network binding port | `8080` |
| `NODE_ENV` | Application runtime environment | `production` |
| `DATABASE_URL` | Transaction pooled database connection | `postgresql://user:pass@neon-pool/...` |
| `DIRECT_URL` | Direct connection (required for Prisma migrations) | `postgresql://user:pass@neon-direct/...` |
| `JWT_SECRET` | Secret key used to sign Access Tokens | `[High Entropy Random String]` |
| `REFRESH_TOKEN_SECRET` | Secret key used to sign Refresh Tokens | `[High Entropy Random String]` |
| `FRONTEND_URL` | Restricts CORS to the frontend domain | `https://my-ecommerce-store.vercel.app` |
| `GOOGLE_CLIENT_ID` | Google Console OAuth Client ID | `oauth-client-id-xyz.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google Console OAuth Secret key | `oauth-secret-key-abc` |
| `RAZORPAY_KEY_ID` | Razorpay account key ID | `rzp_live_key_xyz` |
| `RAZORPAY_KEY_SECRET` | Razorpay account key secret | `razorpay_secret_abc` |
| `RAZORPAY_WEBHOOK_SECRET`| Razorpay custom webhook security token | `webhook_secret_123` |
| `CLOUDINARY_URL` | Cloudinary credentials connection string | `cloudinary://key:secret@cloud_name` |

### B. Frontend Variables (Vercel)
| Variable Name | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | API base path URL for HTTP/fetch services | `https://my-api-server.railway.app/api/v1` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID`| Google OAuth identifier | `oauth-client-id-xyz.apps.googleusercontent.com` |

---

## 3. Build & Deployment Lifecycle

### A. Database Migrations Orchestration
To prevent schema discrepancies between code and the database during deployments:
1. Enforce database migrations *prior* to starting the runtime application.
2. In Railway, specify the start command as:
   ```bash
   npx prisma migrate deploy && node dist/server.js
   ```
* **Rule**: Never run `npx prisma db push` in production. Always utilize migration tracking files (`prisma migrate deploy`) to maintain version consistency.

### B. Health Verification
* The Express server must expose a public `/api/v1/health` endpoint.
* The route must execute a fast `SELECT 1` query via Prisma to confirm database connectivity.
* Railway uses this route for continuous health monitoring. If the route returns a status code other than `200 OK`, Railway rolls back the deployment automatically to prevent downtime.
