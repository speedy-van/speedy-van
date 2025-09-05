import jwt from 'jsonwebtoken';
import { createHash, randomBytes } from 'crypto';

export interface AuthContext {
  userId: string;
  role: 'customer' | 'admin' | 'driver';
  adminRole?: string;
  sessionId: string;
  permissions: string[];
  ipAddress?: string;
  userAgent?: string;
}

export interface AgentSession {
  id: string;
  userId: string;
  agentType: 'customer' | 'admin';
  createdAt: Date;
  lastActivity: Date;
  isActive: boolean;
  metadata: Record<string, any>;
}

// JWT utilities
export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
  private static readonly JWT_EXPIRES_IN = '24h';
  private static readonly REFRESH_TOKEN_EXPIRES_IN = '7d';

  static generateToken(payload: Partial<AuthContext>): string {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
      issuer: 'speedy-van-ai',
      audience: 'speedy-van-apps',
    });
  }

  static verifyToken(token: string): AuthContext | null {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as any;
      return {
        userId: decoded.userId,
        role: decoded.role,
        adminRole: decoded.adminRole,
        sessionId: decoded.sessionId,
        permissions: decoded.permissions || [],
        ipAddress: decoded.ipAddress,
        userAgent: decoded.userAgent,
      };
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  static generateRefreshToken(): string {
    return randomBytes(32).toString('hex');
  }

  static hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}

// Permission system
export class PermissionService {
  private static readonly CUSTOMER_PERMISSIONS = [
    'booking:create',
    'booking:read',
    'booking:update',
    'booking:cancel',
    'quote:request',
    'tracking:view',
    'profile:read',
    'profile:update',
    'address:manage',
    'contact:manage',
  ];

  private static readonly ADMIN_PERMISSIONS = [
    ...this.CUSTOMER_PERMISSIONS,
    'admin:dashboard',
    'admin:analytics',
    'admin:reports',
    'driver:manage',
    'booking:admin',
    'user:manage',
    'system:monitor',
    'escalation:handle',
    'pricing:manage',
  ];

  private static readonly SUPER_ADMIN_PERMISSIONS = [
    ...this.ADMIN_PERMISSIONS,
    'system:configure',
    'user:delete',
    'audit:access',
    'backup:manage',
  ];

  static getPermissions(role: string, adminRole?: string): string[] {
    switch (role) {
      case 'customer':
        return this.CUSTOMER_PERMISSIONS;
      case 'admin':
        if (adminRole === 'super_admin') {
          return this.SUPER_ADMIN_PERMISSIONS;
        }
        return this.ADMIN_PERMISSIONS;
      case 'driver':
        return [
          'booking:read',
          'booking:accept',
          'booking:complete',
          'tracking:update',
          'profile:read',
          'profile:update',
          'earnings:view',
        ];
      default:
        return [];
    }
  }

  static hasPermission(context: AuthContext, permission: string): boolean {
    return context.permissions.includes(permission);
  }

  static requirePermission(context: AuthContext, permission: string): void {
    if (!this.hasPermission(context, permission)) {
      throw new Error(`Insufficient permissions. Required: ${permission}`);
    }
  }
}

// Rate limiting
export class RateLimitService {
  private static readonly limits = new Map<string, { count: number; resetTime: number }>();
  
  private static readonly LIMITS = {
    customer: { requests: 100, window: 60000 }, // 100 requests per minute
    admin: { requests: 500, window: 60000 },    // 500 requests per minute
    anonymous: { requests: 10, window: 60000 }, // 10 requests per minute
  };

  static checkRateLimit(identifier: string, role: string = 'anonymous'): boolean {
    const now = Date.now();
    const limit = this.LIMITS[role as keyof typeof this.LIMITS] || this.LIMITS.anonymous;
    
    const current = this.limits.get(identifier);
    
    if (!current || now > current.resetTime) {
      this.limits.set(identifier, {
        count: 1,
        resetTime: now + limit.window,
      });
      return true;
    }
    
    if (current.count >= limit.requests) {
      return false;
    }
    
    current.count++;
    return true;
  }

  static getRemainingRequests(identifier: string, role: string = 'anonymous'): number {
    const limit = this.LIMITS[role as keyof typeof this.LIMITS] || this.LIMITS.anonymous;
    const current = this.limits.get(identifier);
    
    if (!current || Date.now() > current.resetTime) {
      return limit.requests;
    }
    
    return Math.max(0, limit.requests - current.count);
  }
}

// Security utilities
export class SecurityService {
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  static validateSessionId(sessionId: string): boolean {
    return /^[a-zA-Z0-9-_]{32,}$/.test(sessionId);
  }

  static generateSessionId(): string {
    return randomBytes(32).toString('base64url');
  }

  static hashSensitiveData(data: string): string {
    return createHash('sha256').update(data).digest('hex');
  }

  static isValidIPAddress(ip: string): boolean {
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }
}

// Audit logging for AI agent actions
export class AuditService {
  static async logAgentAction(context: {
    userId: string;
    agentType: 'customer' | 'admin';
    action: string;
    input: any;
    output: any;
    success: boolean;
    error?: string;
    duration: number;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    const logEntry = {
      timestamp: new Date().toISOString(),
      userId: context.userId,
      agentType: context.agentType,
      action: context.action,
      input: this.sanitizeLogData(context.input),
      output: this.sanitizeLogData(context.output),
      success: context.success,
      error: context.error,
      duration: context.duration,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    };

    // In production, this would write to a secure audit log
    console.log('[AUDIT]', JSON.stringify(logEntry));
  }

  private static sanitizeLogData(data: any): any {
    if (typeof data === 'string') {
      return SecurityService.sanitizeInput(data);
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeLogData(item));
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        // Don't log sensitive fields
        if (['password', 'token', 'secret', 'key'].some(sensitive => 
          key.toLowerCase().includes(sensitive))) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = this.sanitizeLogData(value);
        }
      }
      return sanitized;
    }
    
    return data;
  }
}

// Session management
export class SessionService {
  private static sessions = new Map<string, AgentSession>();

  static createSession(userId: string, agentType: 'customer' | 'admin'): AgentSession {
    const session: AgentSession = {
      id: SecurityService.generateSessionId(),
      userId,
      agentType,
      createdAt: new Date(),
      lastActivity: new Date(),
      isActive: true,
      metadata: {},
    };

    this.sessions.set(session.id, session);
    return session;
  }

  static getSession(sessionId: string): AgentSession | null {
    const session = this.sessions.get(sessionId);
    if (!session || !session.isActive) {
      return null;
    }

    // Update last activity
    session.lastActivity = new Date();
    return session;
  }

  static invalidateSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isActive = false;
    }
  }

  static cleanupExpiredSessions(): void {
    const now = new Date();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now.getTime() - session.lastActivity.getTime() > maxAge) {
        this.sessions.delete(sessionId);
      }
    }
  }
}

// Initialize cleanup interval
setInterval(() => {
  SessionService.cleanupExpiredSessions();
}, 60 * 60 * 1000); // Run every hour

