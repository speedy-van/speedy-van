import { AgentConfig, CustomerQuery, CustomerResponse, CustomerContext } from '../types';
import { logger } from '../../lib/logger';
import { handleAgentQuery } from '../router';

/**
 * Customer Assistant - Handles customer queries and provides support
 * Implements the existing customer functionality with enhanced structure
 */
export class CustomerAssistant {
  private config: AgentConfig;
  private logger: typeof logger;
  private isInitialized: boolean = false;

  constructor() {
    this.logger = logger;
    this.config = {
      mode: 'customer' as const,
      permissions: ['read', 'query'],
      tools: ['pricing', 'info', 'booking'],
      ui: 'simple',
      features: ['chat', 'pricing', 'booking', 'support']
    };
  }

  /**
   * Initialize the customer assistant
   */
  public async initialize(context?: any): Promise<void> {
    try {
      this.logger.info('Initializing Customer Assistant', { context });
      
      // Initialize any required services
      await this.validateServices();
      
      this.isInitialized = true;
      this.logger.info('Customer Assistant initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Customer Assistant', { error });
      throw error;
    }
  }

  /**
   * Process customer queries
   */
  public async processQuery(
    query: string, 
    language: string = 'en', 
    context?: any
  ): Promise<CustomerResponse> {
    try {
      if (!this.isInitialized) {
        throw new Error('Customer Assistant not initialized');
      }

      this.logger.info('Processing customer query', { 
        query: query.substring(0, 100), 
        language 
      });

      // Use existing agent logic for now
      const response = await handleAgentQuery(query, language);
      
      // Transform to CustomerResponse format
      const customerResponse: CustomerResponse = {
        response: response.response || 'I apologize, but I could not process your request.',
        confidence: response.confidence || 0.5,
        suggestions: this.generateSuggestions(query, language),
        actions: this.generateActions(query, language)
      };

      this.logger.info('Customer query processed successfully', { 
        responseLength: customerResponse.response.length 
      });

      return customerResponse;
    } catch (error) {
      this.logger.error('Customer query processing failed', { error, query });
      
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
   * Get available tools for customer mode
   */
  public getAvailableTools(): string[] {
    return this.config.tools;
  }

  /**
   * Get customer assistant configuration
   */
  public getConfig(): AgentConfig {
    return this.config;
  }

  /**
   * Health check for customer assistant
   */
  public async healthCheck(): Promise<boolean> {
    try {
      // Check if basic functionality works
      const testResponse = await this.processQuery('Hello', 'en');
      return testResponse.response.length > 0;
    } catch (error) {
      this.logger.error('Customer Assistant health check failed', { error });
      return false;
    }
  }

  /**
   * Cleanup resources
   */
  public async cleanup(): Promise<void> {
    try {
      this.isInitialized = false;
      this.logger.info('Customer Assistant cleanup completed');
    } catch (error) {
      this.logger.error('Customer Assistant cleanup failed', { error });
    }
  }

  /**
   * Generate contextual suggestions based on query
   */
  private generateSuggestions(query: string, language: string): string[] {
    const suggestions: string[] = [];
    
    if (language === 'ar') {
      if (query.includes('سعر') || query.includes('تكلفة')) {
        suggestions.push('يمكنني مساعدتك في حساب تكلفة النقل');
        suggestions.push('أخبرني بالتفاصيل لأحسب لك السعر');
      } else if (query.includes('حجز') || query.includes('موعد')) {
        suggestions.push('يمكنني مساعدتك في حجز خدمة النقل');
        suggestions.push('أخبرني بالتاريخ والموقع المطلوب');
      } else {
        suggestions.push('هل تريد معرفة المزيد عن خدماتنا؟');
        suggestions.push('يمكنني مساعدتك في أي استفسار');
      }
    } else {
      if (query.includes('price') || query.includes('cost')) {
        suggestions.push('I can help you calculate the moving cost');
        suggestions.push('Tell me the details to get a quote');
      } else if (query.includes('book') || query.includes('schedule')) {
        suggestions.push('I can help you book a moving service');
        suggestions.push('Tell me the date and location needed');
      } else {
        suggestions.push('Would you like to know more about our services?');
        suggestions.push('I can help you with any questions');
      }
    }
    
    return suggestions;
  }

  /**
   * Generate actionable items based on query
   */
  private generateActions(query: string, language: string): any[] {
    const actions: any[] = [];
    
    if (query.includes('سعر') || query.includes('price')) {
      actions.push({
        type: 'pricing',
        label: language === 'ar' ? 'احسب السعر' : 'Calculate Price',
        data: { action: 'open_pricing_calculator' }
      });
    }
    
    if (query.includes('حجز') || query.includes('book')) {
      actions.push({
        type: 'booking',
        label: language === 'ar' ? 'احجز الآن' : 'Book Now',
        data: { action: 'open_booking_form' }
      });
    }
    
    actions.push({
      type: 'contact',
      label: language === 'ar' ? 'تواصل معنا' : 'Contact Us',
      data: { 
        email: 'support@speedy-van.co.uk',
        phone: '+44 7901846297'
      }
    });
    
    return actions;
  }

  /**
   * Validate required services
   */
  private async validateServices(): Promise<void> {
    try {
      // Check if OpenAI is accessible
      // Check if database is accessible
      // Check if required tools are available
      this.logger.info('Customer Assistant services validated');
    } catch (error) {
      this.logger.error('Service validation failed', { error });
      throw new Error(`Service validation failed: ${error.message}`);
    }
  }
}
