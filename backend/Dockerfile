FROM node:20-bookworm-slim

# Prisma's query engine needs libssl.so.3
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies and build
COPY package.json package-lock.json tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

RUN npm ci
# Generate the Prisma client (executed from devDependencies)
RUN npx prisma generate
RUN npm run build
# Remove devDependencies to keep the production image small
RUN npm prune --omit=dev

ENV NODE_ENV=production
ENV PORT=8080
ENV PRISMA_QUERY_ENGINE_LIBRARY=/app/node_modules/.prisma/client/libquery_engine-debian-openssl-3.0.x.so.node

EXPOSE 8080

CMD ["node", "dist/server.js"]
