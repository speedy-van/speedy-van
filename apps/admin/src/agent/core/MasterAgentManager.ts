import { logger } from '../../lib/logger';
import { CustomerAgentManager } from './CustomerAgentManager';
import { DevelopmentAdminManager } from './DevelopmentAdminManager';

/**
 * Master Agent Manager - Coordinates between Customer Agent and Development Admin
 * Provides unified interface while maintaining separation of concerns
 */
export class MasterAgentManager {
  private logger: typeof logger;
  private isInitialized: boolean = false;
  private customerAgentManager: CustomerAgentManager;
  private developmentAdminManager: DevelopmentAdminManager;
  private systemStatus: 'initializing' | 'running' | 'error' | 'shutdown' = 'initializing';

  constructor() {
    this.logger = logger;
    this.customerAgentManager = new CustomerAgentManager();
    this.developmentAdminManager = new DevelopmentAdminManager();
  }

  /**
   * Initialize both agent systems
   */
  public async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing Master Agent Manager');
      this.systemStatus = 'initializing';

      // Initialize both systems in parallel
      await Promise.all([
        this.customerAgentManager.initialize(),
        this.developmentAdminManager.initialize()
      ]);

      this.isInitialized = true;
      this.systemStatus = 'running';
      this.logger.info('Master Agent Manager initialized successfully');
    } catch (error) {
      this.systemStatus = 'error';
      this.logger.error('Failed to initialize Master Agent Manager');
      throw error;
    }
  }

  /**
   * Route query to appropriate agent system
   */
  public async routeQuery(
    query: string,
    context: {
      type: 'customer' | 'development';
      sessionId?: string;
      language?: string;
      permissions?: string[];
    }
  ): Promise<any> {
    try {
      if (!this.isInitialized) {
        throw new Error('Master Agent Manager not initialized');
      }

      this.logger.info({ 
        queryType: context.type,
        sessionId: context.sessionId 
      }, 'Routing query to appropriate agent system');

      switch (context.type) {
        case 'customer':
          return await this.handleCustomerQuery(query, context);
        case 'development':
          return await this.handleDevelopmentQuery(query, context);
        default:
          throw new Error(`Unknown query type: ${context.type}`);
      }
    } catch (error) {
      this.logger.error({ error, context }, 'Query routing failed');
      throw error;
    }
  }

  /**
   * Handle customer queries
   */
  private async handleCustomerQuery(
    query: string,
    context: { sessionId?: string; language?: string }
  ): Promise<any> {
    try {
      let sessionId = context.sessionId;
      
      // Create new session if none exists
      if (!sessionId) {
        sessionId = this.customerAgentManager.createSession();
      }

      // Process query through customer agent
      const response = await this.customerAgentManager.processCustomerQuery(
        sessionId,
        query,
        context.language || 'en'
      );

      return {
        type: 'customer',
        sessionId,
        response,
        system: 'customer_agent'
      };
    } catch (error) {
      this.logger.error({ error, query }, 'Customer query handling failed');
      throw error;
    }
  }

  /**
   * Handle development queries
   */
  private async handleDevelopmentQuery(
    query: string,
    context: { sessionId?: string; permissions?: string[] }
  ): Promise<any> {
    try {
      let sessionId = context.sessionId;
      
      // Create new session if none exists
      if (!sessionId) {
        sessionId = this.developmentAdminManager.createSession(
          undefined,
          context.permissions
        );
      }

      // Process query through development admin
      const response = await this.developmentAdminManager.processDevelopmentQuery(
        sessionId,
        { query, language: 'en', context: {} },
      );

      return {
        type: 'development',
        sessionId,
        response,
        system: 'development_admin'
      };
    } catch (error) {
      this.logger.error({ error, query }, 'Development query handling failed');
      throw error;
    }
  }

  /**
   * Get system status and health
   */
  public async getSystemStatus(): Promise<{
    status: string;
    customerAgent: boolean;
    developmentAdmin: boolean;
    activeSessions: {
      customer: number;
      development: number;
    };
    uptime: number;
  }> {
    try {
      const customerHealth = await this.customerAgentManager.healthCheck();
      const developmentHealth = await this.developmentAdminManager.healthCheck();

      return {
        status: this.systemStatus,
        customerAgent: customerHealth,
        developmentAdmin: developmentHealth,
        activeSessions: {
          customer: this.customerAgentManager.getActiveSessionsCount(),
          development: this.developmentAdminManager.getActiveSessionsCount()
        },
        uptime: this.isInitialized ? Date.now() - (this as any).startTime : 0
      };
    } catch (error) {
      this.logger.error({ error }, 'Failed to get system status');
      throw error;
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
      if (!this.isInitialized) {
        throw new Error('Master Agent Manager not initialized');
      }

      return await this.developmentAdminManager.executeDevelopmentAction(
        sessionId,
        action,
        context
      );
    } catch (error) {
      this.logger.error({ error, sessionId, action }, 'Development action execution failed');
      throw error;
    }
  }

  /**
   * Update customer preferences
   */
  public updateCustomerPreferences(
    sessionId: string,
    preferences: any
  ): boolean {
    try {
      return this.customerAgentManager.updatePreferences(sessionId, preferences);
    } catch (error) {
      this.logger.error({ error, sessionId }, 'Failed to update customer preferences');
      return false;
    }
  }

  /**
   * Update development permissions
   */
  public updateDevelopmentPermissions(
    sessionId: string,
    permissions: string[]
  ): boolean {
    try {
      return this.developmentAdminManager.updatePermissions(sessionId, permissions);
    } catch (error) {
      this.logger.error({ error, sessionId }, 'Failed to update development permissions');
      return false;
    }
  }

  /**
   * End session
   */
  public endSession(
    type: 'customer' | 'development',
    sessionId: string
  ): boolean {
    try {
      switch (type) {
        case 'customer':
          return this.customerAgentManager.endSession(sessionId);
        case 'development':
          return this.developmentAdminManager.endSession(sessionId);
        default:
          return false;
      }
    } catch (error) {
      this.logger.error({ error, type, sessionId }, 'Failed to end session');
      return false;
    }
  }

  /**
   * Get customer agent manager
   */
  public getCustomerAgentManager(): CustomerAgentManager {
    return this.customerAgentManager;
  }

  /**
   * Get development admin manager
   */
  public getDevelopmentAdminManager(): DevelopmentAdminManager {
    return this.developmentAdminManager;
  }

  /**
   * Health check for master agent manager
   */
  public async healthCheck(): Promise<boolean> {
    try {
      const customerHealth = await this.customerAgentManager.healthCheck();
      const developmentHealth = await this.developmentAdminManager.healthCheck();
      
      return this.isInitialized && customerHealth && developmentHealth;
    } catch (error) {
      this.logger.error('Master Agent Manager health check failed');
      return false;
    }
  }

  /**
   * Cleanup all resources
   */
  public async cleanup(): Promise<void> {
    try {
      this.systemStatus = 'shutdown';
      this.isInitialized = false;

      // Cleanup both systems
      await Promise.all([
        this.customerAgentManager.cleanup(),
        this.developmentAdminManager.cleanup()
      ]);

      this.logger.info('Master Agent Manager cleanup completed');
    } catch (error) {
      this.logger.error('Master Agent Manager cleanup failed');
    }
  }

  /**
   * Emergency shutdown
   */
  public async emergencyShutdown(): Promise<void> {
    try {
      this.logger.warn('Emergency shutdown initiated');
      this.systemStatus = 'shutdown';
      
      // Force cleanup without waiting
      this.customerAgentManager.cleanup();
      this.developmentAdminManager.cleanup();
      
      this.logger.warn('Emergency shutdown completed');
    } catch (error) {
      this.logger.error({ error }, 'Emergency shutdown failed');
    }
  }
}
