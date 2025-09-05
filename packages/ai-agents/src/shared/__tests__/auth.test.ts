import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { 
  AuthService, 
  SecurityService, 
  RateLimiter,
  generateToken,
  verifyToken,
  hashPassword,
  verifyPassword 
} from '../auth';

describe('AI Agents Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('AuthService', () => {
    describe('generateToken', () => {
      it('should generate a valid JWT token', () => {
        const payload = { userId: 'test-user', role: 'customer' };
        const token = generateToken(payload);

        expect(typeof token).toBe('string');
        expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
      });

      it('should include expiration time', () => {
        const payload = { userId: 'test-user', role: 'customer' };
        const token = generateToken(payload, '1h');
        
        const decoded = verifyToken(token);
        expect(decoded.exp).toBeDefined();
        expect(decoded.exp).toBeGreaterThan(Date.now() / 1000);
      });
    });

    describe('verifyToken', () => {
      it('should verify a valid token', () => {
        const payload = { userId: 'test-user', role: 'customer' };
        const token = generateToken(payload);
        
        const decoded = verifyToken(token);
        expect(decoded.userId).toBe('test-user');
        expect(decoded.role).toBe('customer');
      });

      it('should throw error for invalid token', () => {
        expect(() => verifyToken('invalid-token')).toThrow();
      });

      it('should throw error for expired token', () => {
        const payload = { userId: 'test-user', role: 'customer' };
        const token = generateToken(payload, '-1h'); // Expired token
        
        expect(() => verifyToken(token)).toThrow();
      });
    });

    describe('hashPassword', () => {
      it('should hash password securely', async () => {
        const password = 'test-password-123';
        const hash = await hashPassword(password);

        expect(hash).toBeDefined();
        expect(hash).not.toBe(password);
        expect(hash.length).toBeGreaterThan(50); // bcrypt hashes are long
      });

      it('should generate different hashes for same password', async () => {
        const password = 'test-password-123';
        const hash1 = await hashPassword(password);
        const hash2 = await hashPassword(password);

        expect(hash1).not.toBe(hash2); // Salt makes each hash unique
      });
    });

    describe('verifyPassword', () => {
      it('should verify correct password', async () => {
        const password = 'test-password-123';
        const hash = await hashPassword(password);
        
        const isValid = await verifyPassword(password, hash);
        expect(isValid).toBe(true);
      });

      it('should reject incorrect password', async () => {
        const password = 'test-password-123';
        const wrongPassword = 'wrong-password';
        const hash = await hashPassword(password);
        
        const isValid = await verifyPassword(wrongPassword, hash);
        expect(isValid).toBe(false);
      });
    });
  });

  describe('SecurityService', () => {
    describe('sanitizeInput', () => {
      it('should remove script tags', () => {
        const input = 'Hello <script>alert("xss")</script> world';
        const sanitized = SecurityService.sanitizeInput(input);
        
        expect(sanitized).not.toContain('<script>');
        expect(sanitized).not.toContain('alert');
        expect(sanitized).toContain('Hello');
        expect(sanitized).toContain('world');
      });

      it('should remove SQL injection attempts', () => {
        const input = "'; DROP TABLE users; --";
        const sanitized = SecurityService.sanitizeInput(input);
        
        expect(sanitized).not.toContain('DROP TABLE');
        expect(sanitized).not.toContain('--');
      });

      it('should preserve safe content', () => {
        const input = 'Hello world! This is a safe message.';
        const sanitized = SecurityService.sanitizeInput(input);
        
        expect(sanitized).toBe(input);
      });
    });

    describe('detectSensitiveData', () => {
      it('should detect credit card numbers', () => {
        const text = 'My card number is 4532-1234-5678-9012';
        const hasSensitive = SecurityService.detectSensitiveData(text);
        
        expect(hasSensitive).toBe(true);
      });

      it('should detect social security numbers', () => {
        const text = 'SSN: 123-45-6789';
        const hasSensitive = SecurityService.detectSensitiveData(text);
        
        expect(hasSensitive).toBe(true);
      });

      it('should detect email addresses', () => {
        const text = 'Contact me at john.doe@example.com';
        const hasSensitive = SecurityService.detectSensitiveData(text);
        
        expect(hasSensitive).toBe(true);
      });

      it('should not flag safe content', () => {
        const text = 'This is a normal message about delivery.';
        const hasSensitive = SecurityService.detectSensitiveData(text);
        
        expect(hasSensitive).toBe(false);
      });
    });

    describe('redactSensitiveData', () => {
      it('should redact credit card numbers', () => {
        const text = 'Card: 4532-1234-5678-9012';
        const redacted = SecurityService.redactSensitiveData(text);
        
        expect(redacted).toContain('[REDACTED]');
        expect(redacted).not.toContain('4532-1234-5678-9012');
      });

      it('should redact multiple sensitive items', () => {
        const text = 'Card: 4532-1234-5678-9012, Email: john@example.com';
        const redacted = SecurityService.redactSensitiveData(text);
        
        expect(redacted.match(/\[REDACTED\]/g)).toHaveLength(2);
      });
    });
  });

  describe('RateLimiter', () => {
    let rateLimiter: RateLimiter;

    beforeEach(() => {
      rateLimiter = new RateLimiter(5, 60000); // 5 requests per minute
    });

    describe('checkLimit', () => {
      it('should allow requests within limit', () => {
        const key = 'test-user';
        
        for (let i = 0; i < 5; i++) {
          const allowed = rateLimiter.checkLimit(key);
          expect(allowed).toBe(true);
        }
      });

      it('should block requests exceeding limit', () => {
        const key = 'test-user';
        
        // Use up the limit
        for (let i = 0; i < 5; i++) {
          rateLimiter.checkLimit(key);
        }
        
        // Next request should be blocked
        const blocked = rateLimiter.checkLimit(key);
        expect(blocked).toBe(false);
      });

      it('should reset limit after window expires', async () => {
        const shortLimiter = new RateLimiter(1, 100); // 1 request per 100ms
        const key = 'test-user';
        
        // Use up the limit
        expect(shortLimiter.checkLimit(key)).toBe(true);
        expect(shortLimiter.checkLimit(key)).toBe(false);
        
        // Wait for window to expire
        await global.testUtils.waitFor(150);
        
        // Should be allowed again
        expect(shortLimiter.checkLimit(key)).toBe(true);
      });
    });

    describe('getRemainingRequests', () => {
      it('should return correct remaining count', () => {
        const key = 'test-user';
        
        expect(rateLimiter.getRemainingRequests(key)).toBe(5);
        
        rateLimiter.checkLimit(key);
        expect(rateLimiter.getRemainingRequests(key)).toBe(4);
        
        rateLimiter.checkLimit(key);
        expect(rateLimiter.getRemainingRequests(key)).toBe(3);
      });
    });

    describe('getResetTime', () => {
      it('should return reset time', () => {
        const key = 'test-user';
        
        rateLimiter.checkLimit(key);
        const resetTime = rateLimiter.getResetTime(key);
        
        expect(resetTime).toBeInstanceOf(Date);
        expect(resetTime.getTime()).toBeGreaterThan(Date.now());
      });
    });
  });
});

