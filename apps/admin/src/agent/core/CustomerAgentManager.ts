import { AgentConfig, CustomerQuery, CustomerResponse, CustomerContext } from '../types';
import { logger } from '../../lib/logger';
import { CustomerAssistant } from './CustomerAssistant';

/**
 * Customer Agent Manager - Manages customer-facing AI agents
 * Separate from Development Admin for security and performance
 */
export class CustomerAgentManager {
  private logger: typeof logger;
  private isInitialized: boolean = false;
  private customerAssistant: CustomerAssistant;
  private activeSessions: Map<string, CustomerContext> = new Map();
  private sessionTimeout: number = 30 * 60 * 1000; // 30 minutes

  constructor() {
    this.logger = logger;
    this.customerAssistant = new CustomerAssistant();
  }

  /**
   * Initialize the customer agent manager
   */
  public async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing Customer Agent Manager');
      
      // Initialize customer assistant
      await this.customerAssistant.initialize();
      
      // Start session cleanup timer
      this.startSessionCleanup();
      
      this.isInitialized = true;
      this.logger.info('Customer Agent Manager initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Customer Agent Manager');
      throw error;
    }
  }

  /**
   * Create a new customer session
   */
  public createSession(customerId?: string): string {
    const sessionId = customerId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: CustomerContext = {
      sessionId,
      customerId,
      startTime: new Date(),
      lastActivity: new Date(),
      language: 'en',
      preferences: {
        language: 'en',
        theme: 'light',
        notifications: true
      },
      history: [],
      currentQuery: null
    };

    this.activeSessions.set(sessionId, session);
          this.logger.info({ sessionId }, 'Customer session created');
    
    return sessionId;
  }

  /**
   * Process customer query with session management
   */
  public async processCustomerQuery(
    sessionId: string,
    query: string,
    language: string = 'en'
  ): Promise<CustomerResponse> {
    try {
      if (!this.isInitialized) {
        throw new Error('Customer Agent Manager not initialized');
      }

      const session = this.activeSessions.get(sessionId);
      if (!session) {
        throw new Error('Invalid session ID');
      }

      // Update session activity
      session.lastActivity = new Date();
      session.currentQuery = query;
      session.language = language;

      // Process query through customer assistant
      const response = await this.customerAssistant.processQuery(query, language, session);

      // Update session history
      session.history.push({
        timestamp: new Date(),
        query,
        response: response.response,
        confidence: response.confidence
      });

      // Keep only last 50 interactions
      if (session.history.length > 50) {
        session.history = session.history.slice(-50);
      }

      this.logger.info({ 
        sessionId, 
        queryLength: query.length,
        responseLength: response.response.length 
      }, 'Customer query processed successfully');

      return response;
    } catch (error) {
      this.logger.error({ sessionId, error }, 'Customer query processing failed');
      
      return {
        response: `I apologize, but I encountered an error: ${error.message}`,
        confidence: 0,
        suggestions: ['Please try rephrasing your question', 'Contact support if the issue persists'],
        actions: [{
          type: 'contact',
          label: 'Contact Support',
          data: { email: 'support@speedy-van.co.uk', phone: '+44 7901846297' }
        }]
      };
    }
  }

  /**
   * Get customer session information
   */
  public getSession(sessionId: string): CustomerContext | null {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      // Update last activity
      session.lastActivity = new Date();
    }
    return session || null;
  }

  /**
   * Update customer preferences
   */
  public updatePreferences(sessionId: string, preferences: Partial<CustomerContext['preferences']>): boolean {
    const session = this.activeSessions.get(sessionId);
    if (!session) return false;

    session.preferences = { ...session.preferences, ...preferences };
    session.lastActivity = new Date();
    
          this.logger.info({ sessionId, preferences }, 'Customer preferences updated');
    return true;
  }

  /**
   * End customer session
   */
  public endSession(sessionId: string): boolean {
    const session = this.activeSessions.get(sessionId);
    if (!session) return false;

    // Log session summary
          this.logger.info({
        sessionId, 
        duration: Date.now() - session.startTime.getTime(),
        interactions: session.history.length 
      }, 'Customer session ended');

    this.activeSessions.delete(sessionId);
    return true;
  }

  /**
   * Get active sessions count
   */
  public getActiveSessionsCount(): number {
    return this.activeSessions.size;
  }

  /**
   * Health check for customer agent manager
   */
  public async healthCheck(): Promise<boolean> {
    try {
      return this.isInitialized && this.customerAssistant !== null;
    } catch (error) {
      this.logger.error('Customer Agent Manager health check failed');
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
      
      this.logger.info('Customer Agent Manager cleanup completed');
    } catch (error) {
      this.logger.error('Customer Agent Manager cleanup failed');
    }
  }

  /**
   * Start session cleanup timer
   */
  private startSessionCleanup(): void {
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 5 * 60 * 1000); // Check every 5 minutes
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
      this.logger.info({ cleanedCount }, 'Expired sessions cleaned up');
    }
  }

  /**
   * Get customer assistant instance
   */
  public getCustomerAssistant(): CustomerAssistant {
    return this.customerAssistant;
  }
}
