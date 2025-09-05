import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AgentRequestLog {
  requestId: string;
  message: string | null;
  tool: string | null;
  userId: string | null;
  sessionId: string | null;
  timestamp: Date;
}

export interface AgentResponseLog {
  requestId: string;
  response: string;
  toolExecuted: string | null;
  processingTime: number;
  success: boolean;
  error: string | null;
  timestamp: Date;
}

export async function logAgentRequest(log: AgentRequestLog): Promise<void> {
  try {
    // Store in database for audit trail
    await prisma.agentToolCall.create({
      data: {
        toolName: log.tool || 'chat',
        args: {
          requestId: log.requestId,
          message: log.message,
          userId: log.userId,
          sessionId: log.sessionId,
        },
        args: {
          ...log.args,
          type: 'request',
          timestamp: log.timestamp,
        },
      },
    });

    // Also log to console for development
    console.log('🤖 Agent Request:', {
      requestId: log.requestId,
      message: log.message?.substring(0, 100),
      tool: log.tool,
      userId: log.userId,
      timestamp: log.timestamp.toISOString(),
    });
  } catch (error) {
    console.error('Failed to log agent request:', error);
  }
}

export async function logAgentResponse(log: AgentResponseLog): Promise<void> {
  try {
    // Store in database for audit trail
    await prisma.agentToolCall.create({
      data: {
        toolName: log.toolExecuted || 'response',
        args: {
          requestId: log.requestId,
          processingTime: log.processingTime,
          success: log.success,
        },
        result: {
          response: log.response.substring(0, 500), // Limit response size
          toolExecuted: log.toolExecuted,
        },
        error: log.error,
        args: {
          ...log.args,
          type: 'response',
          timestamp: log.timestamp,
        },
      },
    });

    // Also log to console for development
    console.log('🤖 Agent Response:', {
      requestId: log.requestId,
      responseLength: log.response.length,
      toolExecuted: log.toolExecuted,
      processingTime: log.processingTime,
      success: log.success,
      timestamp: log.timestamp.toISOString(),
    });
  } catch (error) {
    console.error('Failed to log agent response:', error);
  }
}

export async function getAgentUsageStats(days: number = 30): Promise<{
  totalRequests: number;
  totalToolCalls: number;
  averageProcessingTime: number;
  topTools: Array<{ tool: string; count: number }>;
}> {
  try {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [totalRequests, totalToolCalls, processingTimes, toolUsage] = await Promise.all([
      prisma.agentToolCall.count({
        where: {
          createdAt: { gte: since },
          toolName: 'chat',
        },
      }),
      prisma.agentToolCall.count({
        where: {
          createdAt: { gte: since },
          toolName: { not: 'chat' },
        },
      }),
      prisma.agentToolCall.findMany({
        where: {
          createdAt: { gte: since },
          args: { path: ['processingTime'], not: null },
        },
        select: {
          args: true,
        },
      }),
      prisma.agentToolCall.groupBy({
        by: ['toolName'],
        where: {
          createdAt: { gte: since },
          toolName: { not: 'chat' },
        },
        _count: {
          toolName: true,
        },
        orderBy: {
          _count: {
            toolName: 'desc',
          },
        },
        take: 10,
      }),
    ]);

    const avgProcessingTime = processingTimes.length > 0
      ? processingTimes.reduce((sum, item) => sum + (item.args as any).processingTime || 0, 0) / processingTimes.length
      : 0;

    return {
      totalRequests,
      totalToolCalls,
      averageProcessingTime: Math.round(avgProcessingTime),
      topTools: toolUsage.map(item => ({
        tool: item.toolName,
        count: item._count.toolName,
      })),
    };
  } catch (error) {
    console.error('Failed to get agent usage stats:', error);
    return {
      totalRequests: 0,
      totalToolCalls: 0,
      averageProcessingTime: 0,
      topTools: [],
    };
  }
}
