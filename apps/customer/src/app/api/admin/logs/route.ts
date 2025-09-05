import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'audit'; // audit, system, error
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get('limit') || '50'))
  );
  const search = searchParams.get('search') || '';
  const level = searchParams.get('level') || '';
  const service = searchParams.get('service') || '';
  const action = searchParams.get('action') || '';
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';

  const skip = (page - 1) * limit;

  try {
    let logs: any[] = [];
    let total = 0;

    if (type === 'audit') {
      // Get audit logs
      const where: any = {};

      if (search) {
        where.OR = [
          { actorId: { contains: search, mode: 'insensitive' } },
          { action: { contains: search, mode: 'insensitive' } },
          { targetType: { contains: search, mode: 'insensitive' } },
          { targetId: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (action) {
        where.action = { contains: action, mode: 'insensitive' };
      }

      if (from || to) {
        where.createdAt = {};
        if (from) where.createdAt.gte = new Date(from);
        if (to) where.createdAt.lte = new Date(to);
      }

      const [auditLogs, auditCount] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        }),
        prisma.auditLog.count({ where }),
      ]);

      logs = auditLogs.map(log => ({
        id: log.id,
        timestamp: log.createdAt,
        actor: log.user?.email || log.actorId,
        actorRole: log.actorRole,
        action: log.action,
        entity: log.targetType,
        entityId: log.targetId,
        ip: log.ip,
        userAgent: log.userAgent,
        before: log.before,
        after: log.after,
        details: log.details,
      }));

      total = auditCount;
    } else if (type === 'system') {
      // Mock system logs - in production, these would come from a logging service
      logs = [
        {
          id: 1,
          timestamp: new Date(),
          level: 'info',
          service: 'api',
          message: 'API server started successfully',
          details: 'Server listening on port 3000',
        },
        {
          id: 2,
          timestamp: new Date(Date.now() - 60000),
          level: 'warning',
          service: 'database',
          message: 'High connection pool usage',
          details: 'Connection pool at 85% capacity',
        },
      ];
      total = logs.length;
    } else if (type === 'error') {
      // Mock error logs - in production, these would come from error tracking service
      logs = [
        {
          id: 1,
          timestamp: new Date(),
          service: 'api',
          error: "TypeError: Cannot read property 'status' of undefined",
          stack: 'at processOrder (/app/orders.js:45:12)',
          occurrences: 3,
        },
      ];
      total = logs.length;
    }

    // Get stats
    const stats = await getLogStats();

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats,
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}

async function getLogStats() {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [totalLogs, errorsToday, warningsToday] = await Promise.all([
    prisma.auditLog.count({
      where: { createdAt: { gte: oneDayAgo } },
    }),
    prisma.auditLog.count({
      where: {
        createdAt: { gte: oneDayAgo },
        action: { contains: 'error' },
      },
    }),
    prisma.auditLog.count({
      where: {
        createdAt: { gte: oneDayAgo },
        action: { contains: 'warning' },
      },
    }),
  ]);

  return {
    totalLogs,
    errorsToday,
    warningsToday,
    avgResponseTime: '245ms', // Mock data
  };
}
