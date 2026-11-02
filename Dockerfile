# Multi-stage production Dockerfile for UML Flow
FROM oven/bun:alpine AS base
WORKDIR /app

# Stage 1: Install dependencies and build frontend
FROM base AS builder
COPY package.json bun.lock* ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/backend/package.json ./packages/backend/
COPY packages/frontend/package.json ./packages/frontend/

RUN bun install --frozen-lockfile || bun install

COPY packages ./packages
RUN bun run build

# Stage 2: Runtime image
FROM oven/bun:alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package.json ./
COPY packages/shared ./packages/shared
COPY packages/backend ./packages/backend
COPY --from=builder /app/packages/frontend/dist ./packages/frontend/dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["bun", "run", "packages/backend/src/index.ts"]

