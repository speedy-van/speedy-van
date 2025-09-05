import { ChatMessage, ChatSession, AgentResponse, AgentConfig, SessionContext } from './types';
import { createApiResponse } from '@speedy-van/utils';

export abstract class BaseAgent {
  protected config: AgentConfig;
  protected sessions: Map<string, ChatSession> = new Map();

  constructor(config: AgentConfig) {
    this.config = config;
  }

  /**
   * Process a user message and generate a response
   */
  async processMessage(
    sessionId: string,
    message: string,
    userId: string,
    context?: SessionContext
  ): Promise<AgentResponse> {
    try {
      // Get or create session
      let session = this.sessions.get(sessionId);
      if (!session) {
        session = this.createSession(sessionId, userId, context);
        this.sessions.set(sessionId, session);
      }

      // Add user message to session
      const userMessage: ChatMessage = {
        id: this.generateMessageId(),
        role: 'user',
        content: message,
        timestamp: new Date(),
      };
      session.messages.push(userMessage);

      // Generate response
      const response = await this.generateResponse(session);

      // Add assistant message to session
      const assistantMessage: ChatMessage = {
        id: this.generateMessageId(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        metadata: {
          actions: response.actions,
          confidence: response.confidence,
        },
      };
      session.messages.push(assistantMessage);

      // Update session
      session.updatedAt = new Date();
      if (response.requiresEscalation) {
        session.status = 'escalated';
      }

      return response;
    } catch (error) {
      console.error('Error processing message:', error);
      return {
        message: 'I apologize, but I encountered an error. Please try again or contact support.',
        requiresEscalation: true,
      };
    }
  }

  /**
   * Get chat session
   */
  getSession(sessionId: string): ChatSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Close chat session
   */
  closeSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = 'closed';
      session.updatedAt = new Date();
    }
  }

  /**
   * Get session history
   */
  getSessionHistory(sessionId: string): ChatMessage[] {
    const session = this.sessions.get(sessionId);
    return session ? session.messages : [];
  }

  /**
   * Abstract method to generate response - must be implemented by subclasses
   */
  protected abstract generateResponse(session: ChatSession): Promise<AgentResponse>;

  /**
   * Create a new chat session
   */
  protected createSession(sessionId: string, userId: string, context?: SessionContext): ChatSession {
    return {
      id: sessionId,
      userId,
      agentType: this.getAgentType(),
      messages: [],
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      context,
    };
  }

  /**
   * Get agent type - must be implemented by subclasses
   */
  protected abstract getAgentType(): 'customer' | 'admin';

  /**
   * Generate unique message ID
   */
  protected generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Build conversation context for AI model
   */
  protected buildConversationContext(session: ChatSession): string {
    const systemPrompt = this.config.systemPrompt;
    const conversationHistory = session.messages
      .slice(-10) // Keep last 10 messages for context
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    let context = systemPrompt;
    
    if (session.context) {
      context += `\n\nUser Context:\n`;
      context += `- Role: ${session.context.userRole}\n`;
      
      if (session.context.currentBooking) {
        context += `- Current Booking: ${session.context.currentBooking}\n`;
      }
      
      if (session.context.previousBookings?.length) {
        context += `- Previous Bookings: ${session.context.previousBookings.join(', ')}\n`;
      }
    }

    context += `\n\nConversation History:\n${conversationHistory}`;
    
    return context;
  }

  /**
   * Validate user permissions for actions
   */
  protected validatePermissions(userId: string, action: string): boolean {
    // Base implementation - override in subclasses for specific permissions
    return true;
  }

  /**
   * Log agent interaction for monitoring
   */
  protected logInteraction(
    sessionId: string,
    userId: string,
    message: string,
    response: AgentResponse
  ): void {
    console.log(`[${this.getAgentType().toUpperCase()}_AGENT] Session: ${sessionId}, User: ${userId}`);
    console.log(`User: ${message}`);
    console.log(`Agent: ${response.message}`);
    
    if (response.actions?.length) {
      console.log(`Actions: ${response.actions.map(a => a.type).join(', ')}`);
    }
    
    if (response.requiresEscalation) {
      console.log('ESCALATION REQUIRED');
    }
  }

  /**
   * Sanitize user input
   */
  protected sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }

  /**
   * Check if message contains sensitive information
   */
  protected containsSensitiveInfo(message: string): boolean {
    const sensitivePatterns = [
      /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, // Credit card
      /\b\d{3}[\s-]?\d{2}[\s-]?\d{4}\b/, // SSN
      /password|pwd|pass/i,
    ];

    return sensitivePatterns.some(pattern => pattern.test(message));
  }
}

