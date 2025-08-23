import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { NextRequest } from "next/server";
import { prisma } from '@/lib/prisma';

export interface ServerActionContext {
  session: any;
  userId: string;
  userRole: string;
  ip: string;
  userAgent: string;
}

export interface ServerActionOptions {
  requireAuth?: boolean;
  requireRole?: "admin" | "driver" | "customer";
  requireAdminRole?: Array<"superadmin" | "ops" | "support" | "reviewer" | "finance" | "read_only">;
  auditAction?: string;
  auditTargetType?: string;
  rateLimit?: boolean;
}

/**
 * Wrapper for server actions that enforces security and permissions
 * as specified in cursor_tasks section 11
 */
export async function withServerAction<T>(
  handler: (context: ServerActionContext, data: T) => Promise<any>,
  options: ServerActionOptions = {}
) {
  return async (data: T, req?: NextRequest) => {
    try {
      // Get session and verify authentication
      const session = await getServerSession(authOptions);
      
      if (options.requireAuth !== false && !session?.user) {
        throw new Error("Authentication required");
      }
      
      if (session?.user) {
        const userRole = (session.user as any).role;
        const adminRole = (session.user as any).adminRole;
        
        // Verify role requirements
        if (options.requireRole && userRole !== options.requireRole) {
          await logAudit({
            action: "unauthorized_access",
            targetType: "server_action",
            targetId: null,
            before: { requiredRole: options.requireRole, actualRole: userRole },
            after: null
          });
          throw new Error("Insufficient permissions");
        }
        
        // Verify admin role requirements
        if (options.requireAdminRole && options.requireAdminRole.length > 0) {
          if (userRole !== "admin" || !adminRole || !options.requireAdminRole.includes(adminRole)) {
            await logAudit({
              action: "unauthorized_admin_access",
              targetType: "server_action",
              targetId: null,
              before: { 
                requiredAdminRoles: options.requireAdminRole, 
                actualRole: userRole, 
                actualAdminRole: adminRole 
              },
              after: null
            });
            throw new Error("Insufficient admin permissions");
          }
        }
      }
      
      // Get request metadata for audit logging
      const ip = req ? (req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown") : "unknown";
      const userAgent = req ? (req.headers.get("user-agent") || "unknown") : "unknown";
      
      const context: ServerActionContext = {
        session,
        userId: session?.user?.id || "anonymous",
        userRole: (session?.user as any)?.role || "anonymous",
        ip,
        userAgent
      };
      
      // Execute the handler
      const result = await handler(context, data);
      
      // Log successful action if audit is enabled
      if (options.auditAction && options.auditTargetType) {
        await logAudit({
          action: options.auditAction,
          targetType: options.auditTargetType,
          targetId: result?.id || null,
          before: null,
          after: { success: true, data: result }
        });
      }
      
      return result;
      
    } catch (error) {
      // Log failed action
      if (options.auditAction && options.auditTargetType) {
        await logAudit({
          action: `${options.auditAction}_failed`,
          targetType: options.auditTargetType,
          targetId: null,
          before: { error: error instanceof Error ? error.message : "Unknown error" },
          after: null
        });
      }
      
      throw error;
    }
  };
}

/**
 * Utility to verify user owns a resource
 */
export async function verifyResourceOwnership(
  resourceUserId: string,
  context: ServerActionContext
): Promise<boolean> {
  // Admins can access any resource
  if (context.userRole === "admin") {
    return true;
  }
  
  // Users can only access their own resources
  return context.userId === resourceUserId;
}

/**
 * Utility to verify user has access to a booking
 */
export async function verifyBookingAccess(
  bookingId: string,
  context: ServerActionContext
): Promise<boolean> {
  // This would typically check the booking's customerId against the user's ID
  // For now, we'll implement a basic check - in production, you'd query the database
  if (context.userRole === "admin") {
    return true;
  }
  
  // For customers, verify they own the booking
  if (context.userRole === "customer") {
    const booking = await prisma.booking.findUnique({ 
      where: { id: bookingId },
      select: { customerId: true }
    });
    return booking?.customerId === context.userId;
  }
  
  return false;
}

/**
 * Utility to sanitize and validate input data
 */
export function sanitizeInput<T>(data: any, schema?: any): T {
  // Basic sanitization - in production, use a proper validation library like Zod
  if (typeof data === "string") {
    return data.trim() as T;
  }
  
  if (typeof data === "object" && data !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === "string") {
        sanitized[key] = value.trim();
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized as T;
  }
  
  return data as T;
}
