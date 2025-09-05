# Multi-stage Dockerfile for Speedy Van monorepo
FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm@8.15.1

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY turbo.json ./

# Copy package.json files for all packages and apps
COPY packages/*/package.json ./packages/*/
COPY apps/*/package.json ./apps/*/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
RUN pnpm run prisma:generate

# Build stage
FROM base AS builder

# Build all packages and apps
RUN pnpm run build

# Production stage for web app
FROM node:18-alpine AS web-runner

WORKDIR /app

# Copy built application
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/package.json ./apps/web/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3000

CMD ["pnpm", "start", "--filter=web"]

# Production stage for customer app
FROM node:18-alpine AS customer-runner

WORKDIR /app

# Copy built application
COPY --from=builder /app/apps/customer/.next ./apps/customer/.next
COPY --from=builder /app/apps/customer/public ./apps/customer/public
COPY --from=builder /app/apps/customer/package.json ./apps/customer/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3001

CMD ["pnpm", "start", "--filter=customer"]

# Production stage for admin app
FROM node:18-alpine AS admin-runner

WORKDIR /app

# Copy built application
COPY --from=builder /app/apps/admin/.next ./apps/admin/.next
COPY --from=builder /app/apps/admin/public ./apps/admin/public
COPY --from=builder /app/apps/admin/package.json ./apps/admin/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3002

CMD ["pnpm", "start", "--filter=admin"]

# Production stage for driver app
FROM node:18-alpine AS driver-runner

WORKDIR /app

# Copy built application
COPY --from=builder /app/apps/driver/.next ./apps/driver/.next
COPY --from=builder /app/apps/driver/public ./apps/driver/public
COPY --from=builder /app/apps/driver/package.json ./apps/driver/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3003

CMD ["pnpm", "start", "--filter=driver"]

