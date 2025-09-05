import { PrismaClient } from '@prisma/client';

// Global database client instance
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// Create a singleton Prisma client
export const prisma = globalThis.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

// Database connection utilities
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected successfully');
  } catch (error) {
    console.error('❌ Database disconnection failed:', error);
    throw error;
  }
}

// Health check utility
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Transaction utilities
export async function withTransaction<T>(
  callback: (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'>) => Promise<T>
): Promise<T> {
  return prisma.$transaction(callback);
}

// Soft delete utilities
export async function softDelete(
  model: string,
  id: string,
  userId?: string
): Promise<void> {
  const updateData: any = {
    deletedAt: new Date(),
  };

  if (userId) {
    updateData.deletedBy = userId;
  }

  await (prisma as any)[model].update({
    where: { id },
    data: updateData,
  });
}

// Audit logging utility
export async function createAuditLog(data: {
  actorId: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId?: string;
  before?: any;
  after?: any;
  ip?: string;
  userAgent?: string;
  details?: any;
}): Promise<void> {
  await prisma.auditLog.create({
    data,
  });
}

// Pagination utilities
export interface PaginationOptions {
  page: number;
  limit: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export async function paginate<T>(
  model: any,
  options: PaginationOptions,
  where?: any
): Promise<PaginatedResult<T>> {
  const { page, limit, orderBy } = options;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    model.findMany({
      where,
      skip,
      take: limit,
      orderBy,
    }),
    model.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

// Search utilities
export function buildSearchQuery(
  searchTerm: string,
  fields: string[]
): any {
  if (!searchTerm) return {};

  return {
    OR: fields.map(field => ({
      [field]: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    })),
  };
}

// Date range utilities
export function buildDateRangeQuery(
  field: string,
  startDate?: Date,
  endDate?: Date
): any {
  const query: any = {};

  if (startDate || endDate) {
    query[field] = {};
    if (startDate) query[field].gte = startDate;
    if (endDate) query[field].lte = endDate;
  }

  return query;
}

// Re-export Prisma types with namespace to avoid conflicts
export type { PrismaClient } from '@prisma/client';
export type {
  User as PrismaUser,
  Driver as PrismaDriver,
  Booking as PrismaBooking,
  Address as PrismaAddress,
  Contact as PrismaContact,
  Assignment as PrismaAssignment,
} from '@prisma/client';

// Export the client as default
export default prisma;

