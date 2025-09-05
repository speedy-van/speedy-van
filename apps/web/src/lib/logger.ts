import pino from "pino";
import { env } from "@/config/env";

// Base logger configuration with fallback for Next.js
const loggerConfig = {
  level: env.LOG_LEVEL || "info",
  base: { 
    service: "speedy-van-agent",
    version: (typeof process !== 'undefined' && process.env?.npm_package_version) || "1.0.0",
    environment: env.NODE_ENV || "development"
  },
  redact: { 
    paths: [
      "req.headers.authorization", 
      "req.headers.cookie",
      "DEEPSEEK_API_KEY",
      "STRIPE_SECRET_KEY",
      "JWT_SECRET",
      "password",
      "token",
      "secret"
    ], 
    remove: true 
  },
  transport: process.env.NODE_ENV === "development" && typeof window !== 'undefined'
    ? { target: "pino-pretty", options: { colorize: true } } 
    : undefined,
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label }),
    log: (object) => object,
  },
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
};

// Add worker thread fallback for Next.js
if (typeof window === 'undefined' && (process.env?.NODE_ENV === 'development' || !process.env?.NODE_ENV)) {
  loggerConfig.transport = undefined;
}

export const logger = pino(loggerConfig);

// Request-scoped logger with requestId
export function withRequestId(requestId: string, additionalContext: Record<string, unknown> = {}) {
  return logger.child({ 
    requestId, 
    ...additionalContext 
  });
}

// Tool-scoped logger
export function withTool(toolName: string, requestId?: string) {
  const context: Record<string, unknown> = { tool: toolName };
  if (requestId) context.requestId = requestId;
  return logger.child(context);
}

// Intent-scoped logger
export function withIntent(intent: string, requestId?: string) {
  const context: Record<string, unknown> = { intent };
  if (requestId) context.requestId = requestId;
  return logger.child(context);
}

// Performance logging helper
export function withPerformance<T>(
  operation: string,
  fn: () => Promise<T>,
  context: Record<string, unknown> = {}
): Promise<T> {
  const startTime = Date.now();
  const log = logger.child({ operation, ...context });
  
  log.info({ operation }, "Operation started");
  
  return fn()
    .then((result) => {
      const duration = Date.now() - startTime;
      log.info({ operation, duration, success: true }, "Operation completed successfully");
      return result;
    })
    .catch((error) => {
      const duration = Date.now() - startTime;
      log.error({ operation, duration, success: false, error }, "Operation failed");
      throw error;
    });
}

// Error logging with context
export function logError(
  error: Error | unknown,
  context: Record<string, unknown> = {},
  requestId?: string
) {
  const log = requestId ? withRequestId(requestId) : logger;
  
  if (error instanceof Error) {
    log.error({
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause,
      },
      ...context
    }, "Error occurred");
  } else {
    log.error({ error, ...context }, "Unknown error occurred");
  }
}

// Metrics logging helper
export function logMetric(
  metric: string,
  value: number,
  tags: Record<string, string> = {},
  requestId?: string
) {
  const log = requestId ? withRequestId(requestId) : logger;
  log.info({ metric, value, tags, type: "metric" }, "Metric recorded");
}

// Health check logging
export function logHealthCheck(
  component: string,
  status: "healthy" | "degraded" | "unhealthy",
  details: Record<string, unknown> = {},
  requestId?: string
) {
  const log = requestId ? withRequestId(requestId) : logger;
  log.info({ component, status, details, type: "health_check" }, "Health check completed");
}

// Rate limiting logging
export function logRateLimit(
  key: string,
  limit: number,
  remaining: number,
  resetTime: number,
  requestId?: string
) {
  const log = requestId ? withRequestId(requestId) : logger;
  log.info({ 
    key, 
    limit, 
    remaining, 
    resetTime, 
    type: "rate_limit" 
  }, "Rate limit status");
}

// Tool execution logging
export function logToolExecution(
  toolName: string,
  input: unknown,
  output: unknown,
  duration: number,
  success: boolean,
  requestId?: string
) {
  const log = requestId ? withRequestId(requestId) : logger;
  log.info({
    toolName,
    input: JSON.stringify(input),
    output: JSON.stringify(output),
    duration,
    success,
    type: "tool_execution"
  }, "Tool execution completed");
}

// RAG operation logging
export function logRAGOperation(
  operation: "query" | "index" | "embed" | "retrieve",
  query?: string,
  results?: number,
  duration?: number,
  requestId?: string
) {
  const log = requestId ? withRequestId(requestId) : logger;
  log.info({
    operation,
    query,
    results,
    duration,
    type: "rag_operation"
  }, "RAG operation completed");
}

// Export types for external use
export type Logger = typeof logger;
export type RequestLogger = ReturnType<typeof withRequestId>;
export type ToolLogger = ReturnType<typeof withTool>;
export type IntentLogger = ReturnType<typeof withIntent>;
