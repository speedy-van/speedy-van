import { AgentConfig, DeveloperQuery, DeveloperResponse, DeveloperContext } from '../types';
import { logger } from '../../lib/logger';
import { DeveloperAssistant } from './DeveloperAssistant';
import { CodeAnalyzer } from '../tools/developer/CodeAnalyzer';
import { CodeGenerator } from '../tools/developer/CodeGenerator';
import { TestManager } from '../tools/developer/TestManager';
import { DatabaseManager } from '../tools/developer/DatabaseManager';

/**
 * Development Admin Manager - Manages development and administrative AI agents
 * Separate from Customer Agent for security and specialized functionality
 */
export class DevelopmentAdminManager {
  private logger: typeof logger;
  private isInitialized: boolean = false;
  private developerAssistant: DeveloperAssistant;
  private codeAnalyzer: CodeAnalyzer;
  private codeGenerator: CodeGenerator;
  private testManager: TestManager;
  private databaseManager: DatabaseManager;
  private activeSessions: Map<string, DeveloperContext> = new Map();
  private sessionTimeout: number = 60 * 60 * 1000; // 1 hour for dev sessions

  constructor() {
    this.logger = logger;
    this.developerAssistant = new DeveloperAssistant();
    this.codeAnalyzer = new CodeAnalyzer();
    this.codeGenerator = new CodeGenerator();
    this.testManager = new TestManager();
    this.databaseManager = new DatabaseManager();
  }

  /**
   * Initialize the development admin manager
   */
  public async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing Development Admin Manager');
      
      // Initialize all development tools
      await Promise.all([
        this.developerAssistant.initialize(),
        this.codeAnalyzer.initialize(),
        this.codeGenerator.initialize(),
        this.testManager.initialize(),
        this.databaseManager.initialize()
      ]);
      
      // Start session cleanup timer
      this.startSessionCleanup();
      
      this.isInitialized = true;
      this.logger.info('Development Admin Manager initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Development Admin Manager');
      throw error;
    }
  }

  /**
   * Create a new development session
   */
  public createSession(developerId?: string, permissions?: string[]): string {
    const sessionId = developerId || `dev_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: DeveloperContext = {
      sessionId,
      developerId,
      startTime: new Date(),
      lastActivity: new Date(),
      permissions: permissions || ['read', 'write', 'execute'],
      currentProject: null,
      activeFiles: [],
      developmentMode: 'development',
      tools: {
        codeAnalysis: true,
        codeGeneration: true,
        testing: true,
        database: true,
        deployment: true
      },
      history: []
    };

    this.activeSessions.set(sessionId, session);
          this.logger.info({ sessionId, permissions }, 'Development session created');
    
    return sessionId;
  }

  /**
   * Process development query with session management
   */
  public async processDevelopmentQuery(
    sessionId: string,
    query: DeveloperQuery
  ): Promise<DeveloperResponse> {
    try {
      if (!this.isInitialized) {
        throw new Error('Development Admin Manager not initialized');
      }

      const session = this.activeSessions.get(sessionId);
      if (!session) {
        throw new Error('Invalid development session ID');
      }

      // Update session activity
      session.lastActivity = new Date();
      session.currentProject = (query.context as any)?.project || session.currentProject;

      // Process query through developer assistant
      const response = await this.developerAssistant.processQuery(query.query, 'en', session);

      // Update session history
      session.history.push({
        timestamp: new Date(),
        query: query.query,
        response: response.response,
        toolsUsed: response.toolsUsed || [],
        confidence: response.confidence
      });

      // Keep only last 100 interactions
      if (session.history.length > 100) {
        session.history = session.history.slice(-100);
      }

            this.logger.info({
        sessionId, 
        queryLength: query.query.length,
        responseLength: response.response.length,
        toolsUsed: response.toolsUsed?.length || 0
      }, 'Development query processed successfully');

      return response;
    } catch (error) {
      this.logger.error({ sessionId, error }, 'Development query processing failed');
      
      return {
        response: `Development query processing failed: ${error.message}`,
        confidence: 0,
        suggestions: [],
        toolsUsed: [],
        actions: [{
          type: 'test',
          label: 'Contact Development Support',
          description: 'Contact development support for assistance',
          data: { email: 'dev-support@speedy-van.co.uk', priority: 'high' },
          executable: false
        }],
        executionTime: 0
      };
    }
  }

  /**
   * Execute development action
   */
  public async executeDevelopmentAction(
    sessionId: string,
    action: string,
    context: any
  ): Promise<any> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        throw new Error('Invalid development session ID');
      }

      // Check permissions
      if (!this.hasPermission(session, action)) {
        throw new Error(`Insufficient permissions for action: ${action}`);
      }

      // Update session activity
      session.lastActivity = new Date();

      let result: any;

      switch (action) {
        case 'code_analysis':
          result = await this.codeAnalyzer.analyzeCode(context);
          break;
        case 'code_generation':
          result = await this.codeGenerator.generateCode(context);
          break;
        case 'run_tests':
          result = await this.testManager.runTests(context);
          break;
        case 'database_query':
          result = await this.databaseManager.executeQuery(context);
          break;
        default:
          throw new Error(`Unknown development action: ${action}`);
      }

      this.logger.info({ 
        sessionId, 
        action, 
        resultType: typeof result 
      }, 'Development action executed successfully');

      return result;
    } catch (error) {
      this.logger.error({ sessionId, action, error }, 'Development action execution failed');
      throw error;
    }
  }

  /**
   * Get development session information
   */
  public getSession(sessionId: string): DeveloperContext | null {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      // Update last activity
      session.lastActivity = new Date();
    }
    return session || null;
  }

  /**
   * Update development session permissions
   */
  public updatePermissions(sessionId: string, permissions: string[]): boolean {
    const session = this.activeSessions.get(sessionId);
    if (!session) return false;

    session.permissions = permissions;
    session.lastActivity = new Date();
    
          this.logger.info({ sessionId, permissions }, 'Development session permissions updated');
    return true;
  }

  /**
   * End development session
   */
  public endSession(sessionId: string): boolean {
    const session = this.activeSessions.get(sessionId);
    if (!session) return false;

    // Log session summary
          this.logger.info({
        sessionId, 
        duration: Date.now() - session.startTime.getTime(),
        interactions: session.history.length,
        toolsUsed: session.history.reduce((acc, h) => acc + (h.toolsUsed?.length || 0), 0)
      }, 'Development session ended');

    this.activeSessions.delete(sessionId);
    return true;
  }

  /**
   * Get active development sessions count
   */
  public getActiveSessionsCount(): number {
    return this.activeSessions.size;
  }

  /**
   * Check if session has permission for action
   */
  private hasPermission(session: DeveloperContext, action: string): boolean {
    const requiredPermissions: Record<string, string[]> = {
      'code_analysis': ['read'],
      'code_generation': ['read', 'write'],
      'run_tests': ['read', 'execute'],
      'database_query': ['read'],
      'database_modify': ['read', 'write'],
      'deployment': ['read', 'write', 'execute']
    };

    const required = requiredPermissions[action] || ['read'];
    return required.every(perm => session.permissions.includes(perm));
  }

  /**
   * Health check for development admin manager
   */
  public async healthCheck(): Promise<boolean> {
    try {
      const checks = await Promise.all([
        this.developerAssistant.healthCheck(),
        this.codeAnalyzer.healthCheck(),
        this.codeGenerator.healthCheck(),
        this.testManager.healthCheck(),
        this.databaseManager.healthCheck()
      ]);

      return this.isInitialized && checks.every(check => check === true);
    } catch (error) {
      this.logger.error('Development Admin Manager health check failed');
      return false;
    }
  }

  /**
   * Cleanup resources
   */
  public async cleanup(): Promise<void> {
    try {
      this.isInitialized = false;
      
      // End all active sessions
      for (const sessionId of this.activeSessions.keys()) {
        this.endSession(sessionId);
      }

      // Cleanup all tools
      await Promise.all([
        this.developerAssistant.cleanup(),
        this.codeAnalyzer.cleanup(),
        this.codeGenerator.cleanup(),
        this.testManager.cleanup(),
        this.databaseManager.cleanup()
      ]);
      
      this.logger.info('Development Admin Manager cleanup completed');
    } catch (error) {
      this.logger.error('Development Admin Manager cleanup failed');
    }
  }

  /**
   * Start session cleanup timer
   */
  private startSessionCleanup(): void {
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 10 * 60 * 1000); // Check every 10 minutes
  }

  /**
   * Cleanup expired sessions
   */
  private cleanupExpiredSessions(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (now - session.lastActivity.getTime() > this.sessionTimeout) {
        this.endSession(sessionId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.info({ cleanedCount }, 'Expired development sessions cleaned up');
    }
  }

  /**
   * Get development tools
   */
  public getTools() {
    return {
      developerAssistant: this.developerAssistant,
      codeAnalyzer: this.codeAnalyzer,
      codeGenerator: this.codeGenerator,
      testManager: this.testManager,
      databaseManager: this.databaseManager
    };
  }
}
