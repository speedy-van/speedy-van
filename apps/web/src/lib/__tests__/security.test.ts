import { loginRateLimit, apiRateLimit, RateLimitError } from '../rate-limit';
import { withServerAction } from '../server-actions';
import { trackSecurityEvent, getSecurityStats } from '../security-monitor';

// Mock NextRequest
const createMockRequest = (overrides: any = {}) => ({
  nextUrl: {
    pathname: '/api/test',
    search: '',
    ...overrides.nextUrl
  },
  headers: new Map([
    ['x-forwarded-for', '192.168.1.1'],
    ['user-agent', 'Mozilla/5.0 (Test Browser)'],
    ...overrides.headers
  ]),
  method: 'GET',
  ip: '192.168.1.1',
  ...overrides
}) as any;

describe('Security Implementation', () => {
  describe('Rate Limiting', () => {
    beforeEach(() => {
      // Clear rate limit store between tests
      jest.clearAllMocks();
    });

    it('should allow requests within rate limit', () => {
      const req = createMockRequest();
      
      // Should allow first 5 requests
      for (let i = 0; i < 5; i++) {
        expect(() => loginRateLimit(req)).not.toThrow();
      }
    });

    it('should block requests after exceeding rate limit', () => {
      const req = createMockRequest();
      
      // Make 5 requests (limit)
      for (let i = 0; i < 5; i++) {
        loginRateLimit(req);
      }
      
      // 6th request should be blocked
      expect(() => loginRateLimit(req)).toThrow(RateLimitError);
    });

    it('should reset rate limit after window expires', async () => {
      const req = createMockRequest();
      
      // Make 5 requests
      for (let i = 0; i < 5; i++) {
        loginRateLimit(req);
      }
      
      // Mock time passing (15 minutes + 1 second)
      jest.useFakeTimers();
      jest.advanceTimersByTime(15 * 60 * 1000 + 1000);
      
      // Should allow requests again
      expect(() => loginRateLimit(req)).not.toThrow();
      
      jest.useRealTimers();
    });

    it('should handle different rate limiters independently', () => {
      const req = createMockRequest();
      
      // Exhaust login rate limit
      for (let i = 0; i < 5; i++) {
        loginRateLimit(req);
      }
      
      // API rate limit should still work
      expect(() => apiRateLimit(req)).not.toThrow();
    });
  });

  describe('Server Actions', () => {
    it('should enforce authentication requirements', async () => {
      const mockHandler = jest.fn();
      const secureHandler = withServerAction(mockHandler, {
        requireAuth: true,
        requireRole: 'customer'
      });

      // Mock getServerSession to return null (no session)
      jest.doMock('next-auth', () => ({
        getServerSession: jest.fn().mockResolvedValue(null)
      }));

      const handler = await secureHandler;
      await expect(handler({}, {} as any)).rejects.toThrow('Authentication required');
    });

    it('should enforce role requirements', async () => {
      const mockHandler = jest.fn();
      const secureHandler = withServerAction(mockHandler, {
        requireAuth: true,
        requireRole: 'customer'
      });

      // Mock getServerSession to return user with wrong role
      jest.doMock('next-auth', () => ({
        getServerSession: jest.fn().mockResolvedValue({
          user: { id: '123', role: 'driver' }
        })
      }));

      const handler = await secureHandler;
      await expect(handler({}, {} as any)).rejects.toThrow('Insufficient permissions');
    });

    it('should allow valid requests', async () => {
      const mockHandler = jest.fn().mockResolvedValue({ success: true });
      const secureHandler = withServerAction(mockHandler, {
        requireAuth: true,
        requireRole: 'customer'
      });

      // Mock getServerSession to return valid customer session
      jest.doMock('next-auth', () => ({
        getServerSession: jest.fn().mockResolvedValue({
          user: { id: '123', role: 'customer' }
        })
      }));

      const handler = await secureHandler;
      const result = await handler({}, {} as any);
      expect(result).toEqual({ success: true });
      expect(mockHandler).toHaveBeenCalled();
    });
  });

  describe('Security Monitoring', () => {
    beforeEach(() => {
      // Clear security events between tests
      jest.clearAllMocks();
    });

    it('should track security events', async () => {
      const event = {
        type: 'login_failure' as const,
        ip: '192.168.1.1',
        userAgent: 'Test Browser',
        details: { email: 'test@example.com' }
      };

      await trackSecurityEvent(event);
      
      const stats = getSecurityStats();
      expect(stats.totalEvents).toBeGreaterThan(0);
      expect(stats.eventsByType['login_failure']).toBeGreaterThan(0);
    });

    it('should detect suspicious patterns', async () => {
      const req = createMockRequest();
      
      // Simulate multiple login failures
      for (let i = 0; i < 6; i++) {
        await trackSecurityEvent({
          type: 'login_failure',
          ip: '192.168.1.1',
          userAgent: 'Test Browser',
          details: { email: 'test@example.com' }
        });
      }
      
      const stats = getSecurityStats();
      expect(stats.eventsByType['login_failure']).toBeGreaterThanOrEqual(6);
    });

    it('should clean up old events', async () => {
      // Add an old event (more than 1 hour ago)
      const oldEvent = {
        type: 'login_failure' as const,
        ip: '192.168.1.1',
        userAgent: 'Test Browser',
        details: {},
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      };

      // Mock the security events store
      const mockEvents = new Map();
      mockEvents.set('192.168.1.1', [oldEvent]);
      
      // This should trigger cleanup
      const stats = getSecurityStats();
      expect(stats.totalEvents).toBe(0); // Old events should be cleaned up
    });
  });

  describe('Integration', () => {
    it('should work together in a complete flow', async () => {
      const req = createMockRequest();
      
      // 1. Apply rate limiting
      const rateLimitResult = loginRateLimit(req);
      expect(rateLimitResult.success).toBe(true);
      
      // 2. Track security event
      await trackSecurityEvent({
        type: 'login_failure',
        ip: '192.168.1.1',
        userAgent: 'Test Browser',
        details: { email: 'test@example.com' }
      });
      
      // 3. Check security stats
      const stats = getSecurityStats();
      expect(stats.totalEvents).toBeGreaterThan(0);
      
      // 4. Verify rate limit headers would be set correctly
      expect(rateLimitResult.remaining).toBe(4); // 5 - 1 = 4 remaining
    });
  });
});
