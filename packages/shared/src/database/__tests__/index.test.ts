import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { 
  prisma, 
  withTransaction, 
  withPagination, 
  buildSearchQuery,
  auditLog,
  softDelete,
  healthCheck 
} from '../index';

// Mock Prisma client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => global.testUtils.mockPrismaClient),
}));

describe('Database Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('prisma client', () => {
    it('should be defined', () => {
      expect(prisma).toBeDefined();
    });

    it('should have required methods', () => {
      expect(prisma.$connect).toBeDefined();
      expect(prisma.$disconnect).toBeDefined();
      expect(prisma.$transaction).toBeDefined();
    });
  });

  describe('withTransaction', () => {
    it('should execute callback within transaction', async () => {
      const mockCallback = jest.fn().mockResolvedValue('test-result');
      const mockTransaction = jest.fn().mockImplementation(callback => callback(prisma));
      
      prisma.$transaction = mockTransaction;

      const result = await withTransaction(mockCallback);

      expect(mockTransaction).toHaveBeenCalledWith(mockCallback);
      expect(mockCallback).toHaveBeenCalledWith(prisma);
      expect(result).toBe('test-result');
    });

    it('should handle transaction errors', async () => {
      const mockError = new Error('Transaction failed');
      const mockCallback = jest.fn().mockRejectedValue(mockError);
      const mockTransaction = jest.fn().mockImplementation(callback => callback(prisma));
      
      prisma.$transaction = mockTransaction;

      await expect(withTransaction(mockCallback)).rejects.toThrow('Transaction failed');
    });
  });

  describe('withPagination', () => {
    it('should return paginated results with default values', () => {
      const result = withPagination();

      expect(result).toEqual({
        skip: 0,
        take: 10,
      });
    });

    it('should calculate skip and take correctly', () => {
      const result = withPagination(3, 25);

      expect(result).toEqual({
        skip: 50, // (3 - 1) * 25
        take: 25,
      });
    });

    it('should handle edge cases', () => {
      // Page 0 should be treated as page 1
      const result1 = withPagination(0, 10);
      expect(result1.skip).toBe(0);

      // Negative page should be treated as page 1
      const result2 = withPagination(-1, 10);
      expect(result2.skip).toBe(0);

      // Large page size should be capped
      const result3 = withPagination(1, 1000);
      expect(result3.take).toBe(100); // Max page size
    });
  });

  describe('buildSearchQuery', () => {
    it('should build search query for single field', () => {
      const result = buildSearchQuery('john', ['name']);

      expect(result).toEqual({
        OR: [
          {
            name: {
              contains: 'john',
              mode: 'insensitive',
            },
          },
        ],
      });
    });

    it('should build search query for multiple fields', () => {
      const result = buildSearchQuery('john doe', ['name', 'email']);

      expect(result).toEqual({
        OR: [
          {
            name: {
              contains: 'john doe',
              mode: 'insensitive',
            },
          },
          {
            email: {
              contains: 'john doe',
              mode: 'insensitive',
            },
          },
        ],
      });
    });

    it('should return empty object for empty search term', () => {
      const result = buildSearchQuery('', ['name']);
      expect(result).toEqual({});
    });

    it('should return empty object for empty fields array', () => {
      const result = buildSearchQuery('john', []);
      expect(result).toEqual({});
    });
  });

  describe('auditLog', () => {
    it('should log audit information', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await auditLog('user-123', 'CREATE_BOOKING', 'booking-456', { amount: 100 });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[AUDIT]'),
        expect.objectContaining({
          userId: 'user-123',
          action: 'CREATE_BOOKING',
          resourceId: 'booking-456',
          metadata: { amount: 100 },
        })
      );

      consoleSpy.mockRestore();
    });

    it('should handle missing optional parameters', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await auditLog('user-123', 'LOGIN');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[AUDIT]'),
        expect.objectContaining({
          userId: 'user-123',
          action: 'LOGIN',
          resourceId: undefined,
          metadata: undefined,
        })
      );

      consoleSpy.mockRestore();
    });
  });

  describe('softDelete', () => {
    it('should perform soft delete by setting deletedAt', async () => {
      const mockUpdate = jest.fn().mockResolvedValue({ id: 'test-id', deletedAt: new Date() });
      
      const result = await softDelete(mockUpdate, 'test-id');

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: { deletedAt: expect.any(Date) },
      });
      expect(result).toEqual({ id: 'test-id', deletedAt: expect.any(Date) });
    });

    it('should handle soft delete errors', async () => {
      const mockUpdate = jest.fn().mockRejectedValue(new Error('Update failed'));
      
      await expect(softDelete(mockUpdate, 'test-id')).rejects.toThrow('Update failed');
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status when database is accessible', async () => {
      const mockQuery = jest.fn().mockResolvedValue([{ result: 1 }]);
      prisma.$queryRaw = mockQuery;

      const result = await healthCheck();

      expect(result).toEqual({
        status: 'healthy',
        timestamp: expect.any(Date),
        latency: expect.any(Number),
      });
      expect(mockQuery).toHaveBeenCalledWith(expect.anything());
    });

    it('should return unhealthy status when database is not accessible', async () => {
      const mockQuery = jest.fn().mockRejectedValue(new Error('Connection failed'));
      prisma.$queryRaw = mockQuery;

      const result = await healthCheck();

      expect(result).toEqual({
        status: 'unhealthy',
        timestamp: expect.any(Date),
        error: 'Connection failed',
      });
    });
  });
});

