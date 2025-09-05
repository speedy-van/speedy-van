import { AgentMode, AgentConfig, AgentContext } from '../types';
import { CustomerAssistant } from './CustomerAssistant';
import { DeveloperAssistant } from './DeveloperAssistant';
import { logger } from '../../lib/logger';

/**
 * Core Agent Manager - Handles routing between Customer and Developer modes
 * Implements Factory Pattern and Strategy Pattern for clean separation of concerns
 */
export class AgentManager {
  private static instance: AgentManager;
  private customerAssistant: CustomerAssistant;
  private developerAssistant: DeveloperAssistant;
  private logger: typeof logger;
  private currentMode: AgentMode = AgentMode.CUSTOMER;

  private constructor() {
    this.logger = logger;
    this.customerAssistant = new CustomerAssistant();
    this.developerAssistant = new DeveloperAssistant();
  }

  /**
   * Singleton pattern for global agent management
   */
  public static getInstance(): AgentManager {
    if (!AgentManager.instance) {
      AgentManager.instance = new AgentManager();
    }
    return AgentManager.instance;
  }

  /**
   * Switch between customer and developer modes
   */
  public switchMode(mode: AgentMode, context?: AgentContext): void {
    try {
      this.currentMode = mode;
      this.logger.info(`Agent mode switched to: ${mode}`, { context });
      
      // Initialize the appropriate assistant
      if (mode === AgentMode.DEVELOPER) {
        this.developerAssistant.initialize(context);
      } else {
        this.customerAssistant.initialize(context);
      }
    } catch (error) {
      this.logger.error('Failed to switch agent mode', { error, mode, context });
      throw new Error(`Mode switch failed: ${error.message}`);
    }
  }

  /**
   * Get current agent mode
   */
  public getCurrentMode(): AgentMode {
    return this.currentMode;
  }

  /**
   * Route query to appropriate assistant based on current mode
   */
  public async handleQuery(
    query: string, 
    language: string = 'en', 
    context?: AgentContext
  ): Promise<any> {
    try {
      this.logger.info('Processing query', { 
        query: query.substring(0, 100), 
        mode: this.currentMode, 
        language 
      });

      let response;
      
      if (this.currentMode === AgentMode.DEVELOPER) {
        response = await this.developerAssistant.processQuery(query, language, context);
      } else {
        response = await this.customerAssistant.processQuery(query, language, context);
      }

      this.logger.info('Query processed successfully', { 
        mode: this.currentMode, 
        responseLength: JSON.stringify(response).length 
      });

      return response;
    } catch (error) {
      this.logger.error('Query processing failed', { error, query, mode: this.currentMode });
      throw error;
    }
  }

  /**
   * Get available tools for current mode
   */
  public getAvailableTools(): string[] {
    if (this.currentMode === AgentMode.DEVELOPER) {
      return this.developerAssistant.getAvailableTools();
    }
    return this.customerAssistant.getAvailableTools();
  }

  /**
   * Get agent configuration for current mode
   */
  public getAgentConfig(): AgentConfig {
    if (this.currentMode === AgentMode.DEVELOPER) {
      return this.developerAssistant.getConfig();
    }
    return this.customerAssistant.getConfig();
  }

  /**
   * Health check for the agent system
   */
  public async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    mode: AgentMode;
    customerAssistant: boolean;
    developerAssistant: boolean;
    timestamp: Date;
  }> {
    try {
      const customerHealth = await this.customerAssistant.healthCheck();
      const developerHealth = await this.developerAssistant.healthCheck();
      
      const status = customerHealth && developerHealth ? 'healthy' : 'degraded';
      
      return {
        status,
        mode: this.currentMode,
        customerAssistant: customerHealth,
        developerAssistant: developerHealth,
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error('Health check failed', { error });
      return {
        status: 'unhealthy',
        mode: this.currentMode,
        customerAssistant: false,
        developerAssistant: false,
        timestamp: new Date()
      };
    }
  }

  /**
   * Get developer assistant instance
   */
  public get devAssistant(): DeveloperAssistant {
    return this.developerAssistant;
  }

  /**
   * Cleanup resources
   */
  public async cleanup(): Promise<void> {
    try {
      await this.customerAssistant.cleanup();
      await this.developerAssistant.cleanup();
      this.logger.info('Agent manager cleanup completed');
    } catch (error) {
      this.logger.error('Agent manager cleanup failed', { error });
    }
  }
}
