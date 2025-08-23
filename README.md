# Speedy Van Monorepo

Bootstrap skeleton for web app with Next.js (App Router), Prisma, and health/book routes.

## Getting Started

- Node: see `.nvmrc` (20.12.2)
- Package manager: pnpm (Corepack)

### Install

```
corepack enable
pnpm install --filter ./apps/web...
```

### Develop

```
cd apps/web
pnpm dev
```

### Health checks
- `/api/health` -> 200 JSON
- `/` redirects to `/book`

