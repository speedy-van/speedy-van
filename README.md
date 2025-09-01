# Speedy Van Monorepo

Enterprise-grade delivery platform built with Next.js, Node.js, TypeScript, Prisma, and Chakra UI.

## 🚀 CI/CD Setup

This repository is configured with GitHub Actions for automated build and deployment to Render.

### GitHub Actions Workflows

1. **Build Workflow** (`.github/workflows/build.yml`)
   - Triggers on push to main and pull requests
   - Uses Node.js 20 and npm
   - Runs: install, prisma:generate, type-check, lint, test, build
   - Uploads build artifacts

2. **Deploy Workflow** (`.github/workflows/deploy.yml`)
   - Triggers after successful build
   - Deploys to Render using deploy hook
   - Requires `RENDER_DEPLOY_HOOK` secret

### Environment Setup

- **Node.js**: 20.x
- **Package Manager**: npm
- **Database**: PostgreSQL (Neon)
- **Deployment**: Render

### Required GitHub Secrets

- `RENDER_DEPLOY_HOOK`: Render deploy hook URL

## 🛠️ Development

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run development servers
npm run dev

# Run tests
npm run test

# Build applications
npm run build
```

## 📁 Project Structure

```
speedy-van/
├── apps/
│   ├── admin/          # Admin dashboard
│   ├── customer/       # Customer portal
│   ├── driver/         # Driver mobile app
│   └── web/           # Main web application
├── prisma/           # Database schema
└── .github/          # GitHub Actions workflows
```

## 🔧 Configuration

- **Next.js**: React framework
- **Prisma**: Database ORM
- **Chakra UI**: Component library
- **Stripe**: Payment processing
- **Mapbox**: Maps and geolocation

## 🚀 Deployment

The application is automatically deployed to Render when:
1. Code is pushed to the main branch
2. Build workflow passes successfully
3. Deploy workflow triggers Render deployment

## 📋 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run unit tests
- `npm run type-check` - Run TypeScript type checking
- `npm run prisma:generate` - Generate Prisma client
