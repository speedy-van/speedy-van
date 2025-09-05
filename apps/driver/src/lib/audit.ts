import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export type AuditParams = {
  req?: Request;
  action: string;
  targetType: string;
  targetId?: string | null;
  before?: unknown;
  after?: unknown;
};

export async function logAudit({
  req,
  action,
  targetType,
  targetId,
  before,
  after,
}: AuditParams) {
  try {
    const session = await getServerSession(authOptions);
    const ip = req
      ? req.headers.get('x-forwarded-for') ||
        req.headers.get('x-real-ip') ||
        null
      : null;
    const userAgent = req ? req.headers.get('user-agent') || null : null;
    const actorId = (session?.user as any)?.id ?? 'anonymous';
    const actorRole =
      (session?.user as any)?.adminRole ||
      (session?.user as any)?.role ||
      'unknown';

    // Enhanced security event logging as per cursor_tasks section 11
    const isSecurityEvent = [
      'login_success',
      'login_failed',
      'logout',
      'password_reset_requested',
      'password_reset_completed',
      'password_changed',
      'email_verified',
      'two_factor_enabled',
      'two_factor_disabled',
      'session_created',
      'session_destroyed',
      'unauthorized_access',
      'rate_limit_exceeded',
      'suspicious_activity',
      'account_locked',
      'account_unlocked',
    ].includes(action);

    // Verify user exists in database before setting userId
    let userId = null;
    if (actorId !== 'anonymous') {
      try {
        const userExists = await prisma.user.findUnique({
          where: { id: actorId },
          select: { id: true },
        });
        if (userExists) {
          userId = actorId;
        } else {
          console.warn(
            `Audit log: User ${actorId} not found in database, using anonymous`
          );
        }
      } catch (userCheckError) {
        console.warn(
          `Audit log: Error checking user ${actorId}:`,
          userCheckError
        );
      }
    }

    await prisma.auditLog.create({
      data: {
        actorId,
        actorRole,
        action,
        targetType,
        targetId: targetId ?? null,
        before: before as any,
        after: after as any,
        ip: ip ?? undefined,
        userAgent: userAgent ?? undefined,
        userId: userId,
        details: isSecurityEvent
          ? {
              securityEvent: true,
              timestamp: new Date().toISOString(),
              riskLevel: getRiskLevel(action),
              ...(before as any),
              ...(after as any),
            }
          : undefined,
      },
    });

    // Log security events to console for monitoring
    if (isSecurityEvent) {
      console.log(
        `[SECURITY] ${action}: ${actorId} (${actorRole}) from ${ip} - ${targetType}${targetId ? `:${targetId}` : ''}`
      );
    }
  } catch (err) {
    // Do not throw from audit; it's best-effort
    console.error('audit_log_error', err);
  }
}

function getRiskLevel(action: string): 'low' | 'medium' | 'high' | 'critical' {
  const riskMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
    login_success: 'low',
    logout: 'low',
    email_verified: 'low',
    password_changed: 'medium',
    two_factor_enabled: 'medium',
    two_factor_disabled: 'medium',
    login_failed: 'medium',
    password_reset_requested: 'medium',
    password_reset_completed: 'medium',
    unauthorized_access: 'high',
    rate_limit_exceeded: 'high',
    suspicious_activity: 'high',
    account_locked: 'high',
    account_unlocked: 'medium',
    session_created: 'low',
    session_destroyed: 'low',
  };

  return riskMap[action] || 'low';
}

// Export aliases for backward compatibility
export const auditLog = logAudit;
export const createAuditLog = logAudit;
