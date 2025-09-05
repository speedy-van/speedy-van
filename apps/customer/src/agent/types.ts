import { z } from "zod";
import type { Logger } from "@/lib/logger";

// Core Agent Types
export enum AgentMode {
  CUSTOMER = 'customer',
  DEVELOPER = 'developer'
}

// Unified Tool System
export type Result<T> =
  | { ok: true; data: T; meta?: Record<string, unknown> }
  | { ok: false; error: ToolError };

export type ToolError = {
  code: "VALIDATION" | "TIMEOUT" | "RATE_LIMIT" | "DEPENDENCY" | "UNKNOWN";
  message: string;
  cause?: unknown;
  requestId?: string;
  timestamp: Date;
};

export type ToolContext = {
  logger: Logger;
  requestId: string;
  abortSignal?: AbortSignal;
  now?: () => number;
  userId?: string;
  sessionId?: string;
};

export interface Tool<I, O> {
  name: string;
  description: string;
  input: z.ZodType<I>;
  output: z.ZodType<O>;
  call(input: I, ctx: ToolContext): Promise<Result<O>>;
  healthCheck?(): Promise<boolean>;
  cleanup?(): Promise<void>;
}

// Tool Registry Type
export type ToolRegistryMap = Map<string, Tool<any, any>>;

// Tool Execution Result Type
export type ToolExecutionResultType = {
  toolName: string;
  input: unknown;
  output: unknown;
  duration: number;
  success: boolean;
  error?: ToolError;
  requestId: string;
  timestamp: Date;
};

export interface AgentConfig {
  mode: AgentMode;
  permissions: string[];
  tools: string[];
  ui: 'simple' | 'advanced';
  features: string[];
}

export interface AgentContext {
  userId?: string;
  role?: string;
  permissions?: string[];
  sessionId?: string;
  metadata?: Record<string, any>;
}

// Customer Assistant Types
export interface CustomerQuery {
  query: string;
  language: 'en' | 'ar';
  context?: CustomerContext;
}

export interface CustomerContext {
  // Legacy properties for backward compatibility
  userType?: 'guest' | 'customer' | 'driver';
  location?: string;
  serviceInterest?: string;
  // New properties for enhanced session management
  sessionId: string;
  customerId?: string;
  startTime: Date;
  lastActivity: Date;
  language: string;
  preferences: CustomerPreferences;
  history: InteractionHistory[];
  currentQuery: string | null;
}

export interface CustomerPreferences {
  language: string;
  theme: 'light' | 'dark';
  notifications: boolean;
}

export interface InteractionHistory {
  timestamp: Date;
  query: string;
  response: string;
  confidence: number;
}

export interface CustomerResponse {
  response: string;
  suggestions?: string[];
  actions?: CustomerAction[];
  confidence: number;
}

export interface CustomerAction {
  type: 'booking' | 'pricing' | 'info' | 'contact';
  label: string;
  data: any;
}

// Developer Assistant Types
export interface DeveloperQuery {
  query: string;
  language: 'en' | 'ar';
  context?: Partial<DeveloperContext>;
  filePath?: string;
  codeContext?: string;
}

export interface DeveloperContext {
  // Legacy properties for backward compatibility
  projectPath?: string;
  currentFile?: string;
  gitBranch?: string;
  environment?: 'development' | 'staging' | 'production';
  permissions: string[];
  // New properties for enhanced session management
  sessionId: string;
  developerId?: string;
  startTime: Date;
  lastActivity: Date;
  currentProject: string | null;
  activeFiles: string[];
  developmentMode: 'development' | 'testing' | 'production';
  tools: ToolPermissions;
  history: DevelopmentHistory[];
}

export interface ToolPermissions {
  codeAnalysis: boolean;
  codeGeneration: boolean;
  testing: boolean;
  database: boolean;
  deployment: boolean;
}

export interface DevelopmentHistory {
  timestamp: Date;
  query: string;
  response: string;
  toolsUsed: string[];
  confidence: number;
}

export interface DeveloperResponse {
  response: string;
  suggestions: CodeSuggestion[];
  actions: DeveloperAction[];
  confidence: number;
  executionTime: number;
  toolsUsed?: string[];
}

export interface CodeSuggestion {
  type: 'improvement' | 'security' | 'performance' | 'style' | 'bug';
  message: string;
  code?: string;
  filePath?: string;
  lineNumber?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  fix?: string;
}

export interface DeveloperAction {
  type: 'create' | 'modify' | 'delete' | 'refactor' | 'test' | 'deploy';
  label: string;
  description: string;
  data: any;
  executable: boolean;
}

// Live Code Analysis Types
export interface LiveCodeAnalysis {
  filePath: string;
  content: string;
  language: string;
  issues: CodeIssue[];
  suggestions: CodeSuggestion[];
  metrics: CodeMetrics;
  lastUpdated: Date;
}

export interface CodeIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  line: number;
  column: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  fix?: string;
}

export interface CodeMetrics {
  lines: number;
  complexity: number;
  maintainability: number;
  testCoverage?: number;
  lastCommit?: string;
}

export interface CodeQualityMetrics {
  complexity: number;
  maintainability: number;
  performance: number;
  security: number;
}

export interface CodeGenerationRequest {
  type: string;
  language: string;
  framework: string;
  features: string[];
  requirements: string;
  timestamp: Date;
}

export interface CodeGenerationResult {
  code: string;
  suggestions: CodeSuggestion[];
  metadata: Record<string, any>;
}

export interface TestResult {
  suiteName: string;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  timestamp: Date;
  details?: any;
}

export interface TestSuite {
  name: string;
  tests: TestResult[];
  coverage: number;
  lastRun: Date;
}

export interface TestCoverage {
  overallCoverage: number;
  fileCoverage: Map<string, number>;
  timestamp: Date;
  recommendations: string[];
}

export interface DatabaseOperation {
  type: string;
  query?: string;
  table?: string;
  operation: 'select' | 'insert' | 'update' | 'delete' | 'create' | 'alter' | 'drop';
  data?: any;
}

export interface DatabaseSchema {
  name: string;
  columns: Array<{
    name: string;
    type: string;
    nullable: boolean;
    primary?: boolean;
    unique?: boolean;
  }>;
  indexes: string[];
  rowCount: number;
}

export interface DatabaseMigration {
  id: string;
  name: string;
  applied: boolean;
  appliedAt?: Date;
  rollbackAvailable: boolean;
}

// File System Types
export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  modified?: Date;
  children?: FileNode[];
}

export interface ProjectStructure {
  root: FileNode;
  totalFiles: number;
  totalDirectories: number;
  languages: string[];
  lastModified: Date;
}

// Tool Execution Types
export interface ToolExecution {
  toolName: string;
  args: any;
  result?: any;
  error?: string;
  executionTime: number;
  timestamp: Date;
}

export interface ToolRegistry {
  name: string;
  description: string;
  parameters: Record<string, any>;
  mode: AgentMode;
  permissions: string[];
}

// Response Types
export interface AgentQuery {
  query: string;
  language: string;
  mode: AgentMode;
  context?: AgentContext;
}

export interface AgentResponse {
  response: string;
  toolExecuted?: boolean;
  confidence: number;
  suggestions?: any[];
  metadata?: Record<string, any>;
}

// RAG Types
export interface RAGChunk {
  id: number;
  docId: string;
  chunk: string;
  embedding: number[];
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface ToolExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTime: number;
}

// Logging Types
export interface AgentRequestLog {
  id: string;
  query: string;
  mode: AgentMode;
  language: string;
  userId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface AgentResponseLog {
  id: string;
  requestId: string;
  response: string;
  toolExecuted: boolean;
  confidence: number;
  processingTime: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Production Error Monitoring Types
export interface ProductionError {
  id: string;
  timestamp: Date;
  level: 'error' | 'warning' | 'info' | 'critical';
  category: 'database' | 'api' | 'frontend' | 'backend' | 'external' | 'performance' | 'security' | 'other';
  source: string; // service/module name
  message: string;
  stackTrace?: string;
  context: {
    url?: string;
    userId?: string;
    sessionId?: string;
    requestId?: string;
    userAgent?: string;
    ipAddress?: string;
    environment: 'production' | 'staging' | 'development';
    version: string;
    [key: string]: any;
  };
  metadata: {
    tags: string[];
    priority: 'low' | 'medium' | 'high' | 'urgent';
    assignee?: string;
    status: 'new' | 'investigating' | 'in_progress' | 'resolved' | 'closed';
    resolution?: string;
    resolvedAt?: Date;
    [key: string]: any;
  };
  impact: {
    affectedUsers?: number;
    downtime?: number; // in minutes
    severity: 'minor' | 'moderate' | 'major' | 'critical';
    businessImpact: 'low' | 'medium' | 'high' | 'critical';
  };
  relatedErrors?: string[]; // IDs of related errors
  createdAt: Date;
  updatedAt: Date;
}

export interface ErrorReport {
  id: string;
  title: string;
  summary: string;
  generatedAt: Date;
  period: {
    start: Date;
    end: Date;
  };
  errors: ProductionError[];
  statistics: {
    totalErrors: number;
    criticalErrors: number;
    resolvedErrors: number;
    averageResolutionTime: number; // in hours
    topCategories: Array<{ category: string; count: number }>;
    topSources: Array<{ source: string; count: number }>;
    trendAnalysis: Array<{ date: string; errorCount: number }>;
  };
  recommendations: Array<{
    priority: 'low' | 'medium' | 'high' | 'urgent';
    title: string;
    description: string;
    actionItems: string[];
    estimatedEffort: string;
    impact: string;
  }>;
  assignee?: string;
  status: 'draft' | 'reviewed' | 'approved' | 'in_progress';
  createdAt: Date;
  updatedAt: Date;
}

export interface ErrorFilter {
  level?: ProductionError['level'][];
  category?: ProductionError['category'][];
  source?: string[];
  priority?: ProductionError['metadata']['priority'][];
  status?: ProductionError['metadata']['status'][];
  dateRange?: {
    start: Date;
    end: Date;
  };
  assignee?: string;
  tags?: string[];
}

export interface ErrorAnalytics {
  totalErrors: number;
  errorRate: number; // errors per hour
  resolutionTime: {
    average: number;
    median: number;
    p95: number;
  };
  categoryDistribution: Array<{ category: string; count: number; percentage: number }>;
  sourceDistribution: Array<{ source: string; count: number; percentage: number }>;
  trendData: Array<{ timestamp: string; errorCount: number; resolutionCount: number }>;
  topIssues: Array<{ error: ProductionError; frequency: number; lastOccurrence: Date }>;
}

