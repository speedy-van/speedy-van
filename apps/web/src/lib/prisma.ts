/**
 * Prisma client configuration for Speedy Van
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Force set DATABASE_URL to Neon database URL
const NEON_DATABASE_URL = 'postgresql://neondb_owner:npg_qNFE0IHpk1vT@ep-dry-glitter-aftvvy9d-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

// Always use the Neon database URL
process.env.DATABASE_URL = NEON_DATABASE_URL;

// Debug logging for environment variables
console.log('🔍 Prisma Database Configuration:');
console.log('  - Forced DATABASE_URL to Neon database');
console.log('  - URL starts with:', NEON_DATABASE_URL.substring(0, 20) + '...');

// Clear any existing Prisma client to force recreation
if (globalForPrisma.prisma) {
  console.log('  - Clearing existing Prisma client');
  globalForPrisma.prisma = undefined;
}

// Create Prisma client with explicit database URL
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: NEON_DATABASE_URL,
    },
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;