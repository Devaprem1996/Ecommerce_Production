# =================================================================
# PRODUCTION DOCKERFILE: E-COMMERCE BACKEND (EXPRESS + PRISMA)
# =================================================================

# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies required for bcrypt and native compilation
RUN apk add --no-cache python3 make g++ libc6-compat openssl

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (including devDependencies for TypeScript compilation)
RUN npm ci || npm install

# Generate Prisma Client
RUN npx prisma generate

# Copy source code and TypeScript config
COPY tsconfig.json ./
COPY src ./src/

# Compile TypeScript to JavaScript in /dist
RUN npm run build

# Stage 2: Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
RUN apk add --no-cache libc6-compat openssl

# Create non-root system user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressjs

# Prepare writable directories
RUN mkdir -p /var/www/uploads /app/logs && \
    chown -R expressjs:nodejs /var/www/uploads /app/logs

# Copy runtime assets and dependencies directly with proper ownership
COPY --chown=expressjs:nodejs --from=builder /app/package*.json ./
COPY --chown=expressjs:nodejs --from=builder /app/node_modules ./node_modules
COPY --chown=expressjs:nodejs --from=builder /app/dist ./dist
COPY --chown=expressjs:nodejs --from=builder /app/prisma ./prisma

USER expressjs

EXPOSE 8080

# Launch production server
CMD ["node", "dist/server.js"]
