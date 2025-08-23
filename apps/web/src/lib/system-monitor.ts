import { logAudit } from "./audit";
import { prisma } from "@/lib/prisma";

export interface SystemMetrics {
  database: {
    status: 'healthy' | 'warning' | 'error';
    responseTime: number;
    connections: number;
    maxConnections: number;
    lastHeartbeat: Date;
  };
  performance: {
    avgResponseTime: number;
    requestsPerSecond: number;
    errorRate: number;
    activeUsers: number;
  };
  incidents: Array<{
    id: string;
    service: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    timestamp: Date;
    resolved: boolean;
  }>;
}

export interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'warning' | 'error';
  responseTime: number;
  details: any;
  timestamp: Date;
}

class SystemMonitor {
  private static instance: SystemMonitor;
  private healthChecks: Map<string, () => Promise<HealthCheckResult>>;
  private metrics: SystemMetrics;
  private isMonitoring: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.healthChecks = new Map();
    this.metrics = {
      database: {
        status: 'healthy',
        responseTime: 0,
        connections: 0,
        maxConnections: 100,
        lastHeartbeat: new Date()
      },
      performance: {
        avgResponseTime: 0,
        requestsPerSecond: 0,
        errorRate: 0,
        activeUsers: 0
      },
      incidents: []
    };

    this.initializeHealthChecks();
  }

  static getInstance(): SystemMonitor {
    if (!SystemMonitor.instance) {
      SystemMonitor.instance = new SystemMonitor();
    }
    return SystemMonitor.instance;
  }

  private initializeHealthChecks() {
    // Database health check
    this.healthChecks.set('database', async (): Promise<HealthCheckResult> => {
      const startTime = Date.now();
      try {
        await prisma.$queryRaw`SELECT 1`;
        const responseTime = Date.now() - startTime;
        
        // Get connection info
        const result = await prisma.$queryRaw`SELECT count(*) as connections FROM pg_stat_activity WHERE state = 'active'`;
        const connections = (result as any)[0]?.connections || 0;
        
        const status = responseTime > 1000 ? 'warning' : 
                      responseTime > 5000 ? 'error' : 'healthy';
        
        return {
          service: 'database',
          status,
          responseTime,
          details: { connections, maxConnections: 100 },
          timestamp: new Date()
        };
      } catch (error) {
        return {
          service: 'database',
          status: 'error',
          responseTime: Date.now() - startTime,
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
          timestamp: new Date()
        };
      }
    });

    // Cache health check (mock)
    this.healthChecks.set('cache', async (): Promise<HealthCheckResult> => {
      const startTime = Date.now();
      // Simulate cache check
      await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
      const responseTime = Date.now() - startTime;
      
      return {
        service: 'cache',
        status: 'healthy',
        responseTime,
        details: { 
          memoryUsage: '65%',
          hitRate: '94%'
        },
        timestamp: new Date()
      };
    });

    // Queue health check (mock)
    this.healthChecks.set('queue', async (): Promise<HealthCheckResult> => {
      const startTime = Date.now();
      // Simulate queue check
      await new Promise(resolve => setTimeout(resolve, Math.random() * 20));
      const responseTime = Date.now() - startTime;
      
      const depth = Math.floor(Math.random() * 2000);
      const status = depth > 1500 ? 'warning' : 
                    depth > 2000 ? 'error' : 'healthy';
      
      return {
        service: 'queue',
        status,
        responseTime,
        details: { 
          depth,
          maxDepth: 1000,
          processingRate: '150 jobs/min'
        },
        timestamp: new Date()
      };
    });

    // Webhooks health check (mock)
    this.healthChecks.set('webhooks', async (): Promise<HealthCheckResult> => {
      const startTime = Date.now();
      // Simulate webhook check
      await new Promise(resolve => setTimeout(resolve, Math.random() * 15));
      const responseTime = Date.now() - startTime;
      
      return {
        service: 'webhooks',
        status: 'healthy',
        responseTime,
        details: { 
          successRate: '99.2%',
          pendingWebhooks: 3
        },
        timestamp: new Date()
      };
    });

    // Pusher health check (mock)
    this.healthChecks.set('pusher', async (): Promise<HealthCheckResult> => {
      const startTime = Date.now();
      // Simulate Pusher check
      await new Promise(resolve => setTimeout(resolve, Math.random() * 25));
      const responseTime = Date.now() - startTime;
      
      return {
        service: 'pusher',
        status: 'healthy',
        responseTime,
        details: { 
          connections: 1250,
          channels: 45
        },
        timestamp: new Date()
      };
    });

    // Stripe health check (mock)
    this.healthChecks.set('stripe', async (): Promise<HealthCheckResult> => {
      const startTime = Date.now();
      // Simulate Stripe API check
      await new Promise(resolve => setTimeout(resolve, Math.random() * 50 + 100));
      const responseTime = Date.now() - startTime;
      
      const status = responseTime > 300 ? 'warning' : 
                    responseTime > 1000 ? 'error' : 'healthy';
      
      return {
        service: 'stripe',
        status,
        responseTime,
        details: { 
          apiLatency: `${responseTime}ms`,
          webhookSuccess: '99.8%'
        },
        timestamp: new Date()
      };
    });
  }

  async runHealthChecks(): Promise<Map<string, HealthCheckResult>> {
    const results = new Map<string, HealthCheckResult>();
    
    for (const [service, healthCheck] of this.healthChecks) {
      try {
        const result = await healthCheck();
        results.set(service, result);
        
        // Update metrics
        this.updateMetrics(service, result);
        
        // Log incidents if status is not healthy
        if (result.status !== 'healthy') {
          await this.logIncident(service, result);
        }
      } catch (error) {
        const errorResult: HealthCheckResult = {
          service,
          status: 'error',
          responseTime: 0,
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
          timestamp: new Date()
        };
        results.set(service, errorResult);
        await this.logIncident(service, errorResult);
      }
    }
    
    return results;
  }

  private updateMetrics(service: string, result: HealthCheckResult) {
    if (service === 'database') {
      this.metrics.database = {
        status: result.status,
        responseTime: result.responseTime,
        connections: result.details.connections || 0,
        maxConnections: result.details.maxConnections || 100,
        lastHeartbeat: result.timestamp
      };
    }
  }

  private async logIncident(service: string, result: HealthCheckResult) {
    const incident = {
      id: `incident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      service,
      severity: result.status === 'error' ? 'error' : 'warning' as const,
      message: `${service} health check failed: ${result.responseTime}ms response time`,
      timestamp: result.timestamp,
      resolved: false
    };

    this.metrics.incidents.unshift(incident as any);
    
    // Keep only last 50 incidents
    if (this.metrics.incidents.length > 50) {
      this.metrics.incidents = this.metrics.incidents.slice(0, 50);
    }

    // Log to audit trail
    await logAudit({
      action: `health_check_${result.status}`,
      targetType: 'system_monitor',
      targetId: service,
      before: { status: 'healthy' },
      after: { status: result.status, responseTime: result.responseTime }
    });
  }

  async getSystemMetrics(): Promise<SystemMetrics> {
    // Calculate performance metrics from recent audit logs
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentLogs = await prisma.auditLog.findMany({
      where: {
        createdAt: { gte: oneHourAgo }
      },
      orderBy: { createdAt: 'desc' }
    });

    const totalRequests = recentLogs.length;
    const errorLogs = recentLogs.filter(log => 
      log.action.includes('error') || log.action.includes('failed')
    );
    const errorRate = totalRequests > 0 ? (errorLogs.length / totalRequests * 100) : 0;

    this.metrics.performance = {
      avgResponseTime: 245, // Mock data - in production, calculate from actual response times
      requestsPerSecond: Math.round(totalRequests / 3600),
      errorRate,
      activeUsers: 450 // Mock data
    };

    return this.metrics;
  }

  startMonitoring(intervalMs: number = 30000) {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.runHealthChecks();
      } catch (error) {
        console.error('System monitoring error:', error);
      }
    }, intervalMs);

    console.log(`System monitoring started with ${intervalMs}ms interval`);
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log('System monitoring stopped');
  }

  async getServiceStatus(service: string): Promise<HealthCheckResult | null> {
    const healthCheck = this.healthChecks.get(service);
    if (!healthCheck) {
      return null;
    }

    return await healthCheck();
  }

  async getAllServiceStatuses(): Promise<Map<string, HealthCheckResult>> {
    return await this.runHealthChecks();
  }

  getRecentIncidents(limit: number = 10) {
    return this.metrics.incidents.slice(0, limit);
  }

  async resolveIncident(incidentId: string) {
    const incident = this.metrics.incidents.find(i => i.id === incidentId);
    if (incident) {
      incident.resolved = true;
      
      await logAudit({
        action: 'incident_resolved',
        targetType: 'system_monitor',
        targetId: incidentId,
        before: { resolved: false },
        after: { resolved: true }
      });
    }
  }

  async clearOldIncidents(olderThanHours: number = 24) {
    const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    this.metrics.incidents = this.metrics.incidents.filter(
      incident => incident.timestamp > cutoff
    );
  }
}

export const systemMonitor = SystemMonitor.getInstance();

// Auto-start monitoring in production
if (process.env.NODE_ENV === 'production') {
  systemMonitor.startMonitoring();
}

export default systemMonitor;
