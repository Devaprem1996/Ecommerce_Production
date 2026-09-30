if (-not $env:VERCEL_TOKEN) {
  Write-Error "Set VERCEL_TOKEN environment variable (from Vercel dashboard)"
  exit 1
}

Set-Location -Path "frontend"
pnpm install --frozen-lockfile
pnpm dlx vercel@latest --prod --token $env:VERCEL_TOKEN --confirm
