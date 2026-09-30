#!/usr/bin/env bash
set -euo pipefail

if [ -z "${VERCEL_TOKEN:-}" ]; then
  echo "ERROR: set VERCEL_TOKEN environment variable (from Vercel dashboard)"
  exit 1
fi

cd frontend
pnpm install --frozen-lockfile
pnpm dlx vercel@latest --prod --token "$VERCEL_TOKEN" --confirm
