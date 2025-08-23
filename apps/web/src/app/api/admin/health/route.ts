import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { systemMonitor } from "@/lib/system-monitor";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const healthData = await getSystemHealth();
    return NextResponse.json(healthData);
  } catch (error) {
    console.error("Error fetching health data:", error);
    return NextResponse.json(
      { error: "Failed to fetch health data" },
      { status: 500 }
    );
  }
}

async function getSystemHealth() {
  const startTime = Date.now();
  
  // Run all health checks using the system monitor
  const healthResults = await systemMonitor.runHealthChecks();
  const systemMetrics = await systemMonitor.getSystemMetrics();
  const recentIncidents = systemMonitor.getRecentIncidents(10);

  // Build services object from health check results
  const services: any = {};
  for (const [service, result] of healthResults) {
    services[service] = {
      status: result.status,
      responseTime: `${result.responseTime}ms`,
      lastHeartbeat: result.timestamp.toISOString(),
      ...result.details
    };
  }

  // Determine overall status
  const serviceStatuses = Array.from(healthResults.values()).map(r => r.status);
  const overallStatus = serviceStatuses.includes("error") ? "error" :
                       serviceStatuses.includes("warning") ? "warning" : "healthy";

  return {
    overall: overallStatus,
    uptime: "99.98%",
    lastCheck: new Date().toISOString(),
    responseTime: Date.now() - startTime,
    services,
    recentIncidents: recentIncidents.map(incident => ({
      id: incident.id,
      service: incident.service,
      severity: incident.severity,
      message: incident.message,
      timestamp: incident.timestamp.toISOString(),
      resolved: incident.resolved
    })),
    performanceMetrics: {
      avgResponseTime: `${systemMetrics.performance.avgResponseTime}ms`,
      requestsPerSecond: systemMetrics.performance.requestsPerSecond,
      errorRate: `${systemMetrics.performance.errorRate.toFixed(1)}%`,
      activeUsers: systemMetrics.performance.activeUsers
    }
  };
}
