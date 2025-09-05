import { SecureBaseAgent } from '../shared/secure-base-agent';
import { AgentConfig, AgentResponse, AgentAction, ChatSession } from '../shared/types';

export class SecureCustomerAgent extends SecureBaseAgent {
  constructor(config?: Partial<AgentConfig>) {
    const defaultConfig: AgentConfig = {
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 1000,
      systemPrompt: `You are a secure customer service AI assistant for Speedy Van, a delivery service company.

SECURITY REQUIREMENTS:
- Only assist authenticated customers with their own bookings
- Never access or reveal information about other customers
- Validate all inputs and sanitize outputs
- Log all interactions for audit purposes
- Escalate suspicious activities immediately

Your role is to:
1. Help customers create and manage delivery bookings
2. Provide quotes for delivery services
3. Track existing deliveries
4. Answer questions about services and pricing
5. Handle customer complaints and feedback professionally
6. Escalate complex issues to human agents when necessary

Guidelines:
- Always be polite, professional, and helpful
- Provide accurate information about services and pricing
- Protect customer privacy and data at all times
- Never make promises about delivery times without checking availability
- Escalate to human agents for complex complaints or technical issues
- Always verify customer identity before accessing booking information
- Never process sensitive payment information directly

Available services:
- Same-day delivery within city limits
- Next-day delivery for longer distances
- Express delivery (2-4 hours)
- Scheduled delivery for specific time slots
- Large item delivery with specialized vehicles`,
      ...config,
    };

    super(defaultConfig);
  }

  getAgentType(): 'customer' | 'admin' {
    return 'customer';
  }

  isAuthorizedRole(role: string): boolean {
    return role === 'customer';
  }

  getSystemPrompt(): string {
    return this.config.systemPrompt;
  }

  getAvailableActions(): AgentAction[] {
    return [
      {
        type: 'create_booking',
        parameters: {
          pickup_address: 'string',
          delivery_address: 'string',
          item_description: 'string',
          preferred_time: 'string',
          special_instructions: 'string',
        },
        description: 'Create a new delivery booking',
      },
      {
        type: 'get_quote',
        parameters: {
          pickup_postcode: 'string',
          delivery_postcode: 'string',
          item_size: 'string',
          service_type: 'string',
        },
        description: 'Get a price quote for delivery',
      },
      {
        type: 'track_delivery',
        parameters: {
          booking_id: 'string',
        },
        description: 'Track the status of an existing delivery',
      },
      {
        type: 'update_booking',
        parameters: {
          booking_id: 'string',
          changes: 'object',
        },
        description: 'Update details of an existing booking',
      },
      {
        type: 'cancel_booking',
        parameters: {
          booking_id: 'string',
          reason: 'string',
        },
        description: 'Cancel an existing booking',
      },
      {
        type: 'escalate',
        parameters: {
          issue_type: 'string',
          description: 'string',
          priority: 'string',
        },
        description: 'Escalate issue to human customer service',
      },
    ];
  }

  protected async generateSecureResponse(
    session: ChatSession,
    metadata?: Record<string, any>
  ): Promise<AgentResponse> {
    const context = this.requireAuth();
    const lastMessage = session.messages[session.messages.length - 1];
    
    if (!lastMessage || lastMessage.role !== 'user') {
      return {
        message: 'Hello! I\'m here to help you with your delivery needs. How can I assist you today?',
        actions: [],
        confidence: 1.0,
      };
    }

    const userMessage = lastMessage.content.toLowerCase();

    // Intent detection with security validation
    if (this.detectBookingIntent(userMessage)) {
      this.checkPermission('booking:create');
      return this.handleBookingIntent(userMessage, session);
    }

    if (this.detectQuoteIntent(userMessage)) {
      this.checkPermission('quote:request');
      return this.handleQuoteIntent(userMessage, session);
    }

    if (this.detectTrackingIntent(userMessage)) {
      this.checkPermission('tracking:view');
      return this.handleTrackingIntent(userMessage, session);
    }

    if (this.detectComplaintIntent(userMessage)) {
      return this.handleComplaintIntent(userMessage, session);
    }

    if (this.detectUpdateIntent(userMessage)) {
      this.checkPermission('booking:update');
      return this.handleUpdateIntent(userMessage, session);
    }

    if (this.detectCancelIntent(userMessage)) {
      this.checkPermission('booking:cancel');
      return this.handleCancelIntent(userMessage, session);
    }

    // Default response
    return {
      message: 'I understand you need help with our delivery services. I can help you with:\n\n' +
               '• Creating new bookings\n' +
               '• Getting price quotes\n' +
               '• Tracking existing deliveries\n' +
               '• Updating or cancelling bookings\n' +
               '• Answering questions about our services\n\n' +
               'What would you like to do?',
      actions: this.suggestSecureActions('general_help'),
      confidence: 0.8,
    };
  }

  private detectBookingIntent(message: string): boolean {
    const bookingKeywords = ['book', 'delivery', 'send', 'pickup', 'deliver', 'schedule'];
    return bookingKeywords.some(keyword => message.includes(keyword));
  }

  private detectQuoteIntent(message: string): boolean {
    const quoteKeywords = ['quote', 'price', 'cost', 'how much', 'estimate'];
    return quoteKeywords.some(keyword => message.includes(keyword));
  }

  private detectTrackingIntent(message: string): boolean {
    const trackingKeywords = ['track', 'status', 'where is', 'delivery status', 'progress'];
    return trackingKeywords.some(keyword => message.includes(keyword));
  }

  private detectComplaintIntent(message: string): boolean {
    const complaintKeywords = ['problem', 'issue', 'complaint', 'wrong', 'late', 'damaged', 'missing'];
    return complaintKeywords.some(keyword => message.includes(keyword));
  }

  private detectUpdateIntent(message: string): boolean {
    const updateKeywords = ['change', 'update', 'modify', 'reschedule', 'edit'];
    return updateKeywords.some(keyword => message.includes(keyword));
  }

  private detectCancelIntent(message: string): boolean {
    const cancelKeywords = ['cancel', 'refund', 'delete', 'remove'];
    return cancelKeywords.some(keyword => message.includes(keyword));
  }

  private async handleBookingIntent(message: string, session: ChatSession): Promise<AgentResponse> {
    return {
      message: 'I\'d be happy to help you create a new booking! To get started, I\'ll need some information:\n\n' +
               '• Pickup address\n' +
               '• Delivery address\n' +
               '• Description of items to be delivered\n' +
               '• Preferred delivery time\n' +
               '• Any special instructions\n\n' +
               'You can provide this information now, or I can guide you through it step by step.',
      actions: [
        {
          type: 'create_booking',
          parameters: {},
          description: 'Start the booking process',
        },
        {
          type: 'get_quote',
          parameters: {},
          description: 'Get a price estimate first',
        },
      ],
      confidence: 0.9,
    };
  }

  private async handleQuoteIntent(message: string, session: ChatSession): Promise<AgentResponse> {
    return {
      message: 'I can provide you with a price quote for your delivery. I\'ll need:\n\n' +
               '• Pickup postcode\n' +
               '• Delivery postcode\n' +
               '• Size/type of items (small, medium, large, or extra large)\n' +
               '• Service type (same-day, next-day, or express)\n\n' +
               'Please provide these details and I\'ll calculate an estimate for you.',
      actions: [
        {
          type: 'get_quote',
          parameters: {},
          description: 'Calculate delivery quote',
        },
      ],
      confidence: 0.9,
    };
  }

  private async handleTrackingIntent(message: string, session: ChatSession): Promise<AgentResponse> {
    return {
      message: 'I can help you track your delivery. Please provide your booking reference number or order ID, ' +
               'and I\'ll get the latest status for you.\n\n' +
               'Note: I can only access tracking information for deliveries associated with your account.',
      actions: [
        {
          type: 'track_delivery',
          parameters: {},
          description: 'Track delivery status',
        },
      ],
      confidence: 0.9,
    };
  }

  private async handleUpdateIntent(message: string, session: ChatSession): Promise<AgentResponse> {
    return {
      message: 'I can help you update your booking details. Please provide your booking ID and let me know what you\'d like to change:\n\n' +
               '• Delivery address\n' +
               '• Delivery time\n' +
               '• Contact information\n' +
               '• Special instructions\n\n' +
               'Note: Some changes may affect pricing, and modifications may not be possible if your delivery is already in progress.',
      actions: [
        {
          type: 'update_booking',
          parameters: {},
          description: 'Update booking details',
        },
      ],
      confidence: 0.9,
    };
  }

  private async handleCancelIntent(message: string, session: ChatSession): Promise<AgentResponse> {
    return {
      message: 'I can help you cancel your booking. Please provide your booking ID and I\'ll check the cancellation policy for your specific booking.\n\n' +
               'Cancellation terms:\n' +
               '• 24+ hours before pickup: Full refund\n' +
               '• 2-24 hours before: Partial refund may apply\n' +
               '• Less than 2 hours: Cancellation fees may apply\n\n' +
               'Would you like me to proceed with checking your booking?',
      actions: [
        {
          type: 'cancel_booking',
          parameters: {},
          description: 'Cancel existing booking',
        },
      ],
      confidence: 0.9,
    };
  }

  private async handleComplaintIntent(message: string, session: ChatSession): Promise<AgentResponse> {
    return {
      message: 'I\'m sorry to hear you\'re experiencing an issue. I want to help resolve this for you. ' +
               'Could you please provide more details about the problem? This will help me understand ' +
               'how best to assist you or connect you with the right person to help.\n\n' +
               'For urgent issues, I can immediately escalate your case to our customer service team.',
      actions: [
        {
          type: 'escalate',
          parameters: {
            issue_type: 'complaint',
            priority: 'normal',
          },
          description: 'Escalate to customer service team',
        },
      ],
      confidence: 0.8,
      requiresEscalation: true,
    };
  }

  // Override to provide customer-specific validation
  protected validatePermissions(userId: string, action: string): boolean {
    const context = this.requireAuth();
    
    // Ensure user can only access their own data
    if (context.userId !== userId) {
      this.logSecurityEvent('unauthorized_access_attempt', { 
        authenticatedUser: context.userId, 
        requestedUser: userId, 
        action 
      });
      return false;
    }

    // Additional customer-specific validation
    const customerAllowedActions = [
      'create_booking',
      'get_quote', 
      'track_delivery',
      'update_booking',
      'cancel_booking',
      'escalate'
    ];

    if (!customerAllowedActions.includes(action)) {
      this.logSecurityEvent('unauthorized_action_attempt', {
        userId: context.userId,
        action,
        allowedActions: customerAllowedActions
      });
      return false;
    }

    return super.validateAction({ type: action });
  }

  // Customer-specific security checks
  protected async validateBookingAccess(bookingId: string): Promise<boolean> {
    const context = this.requireAuth();
    
    // In production, this would check database to ensure booking belongs to user
    // For now, we'll simulate this check
    console.log(`Validating booking access: ${bookingId} for user: ${context.userId}`);
    
    // Placeholder validation - in production, query database
    return true;
  }

  protected sanitizeCustomerData(data: any): any {
    // Remove sensitive fields that customers shouldn't see
    const sensitiveFields = ['internal_notes', 'driver_phone', 'admin_comments', 'cost_breakdown'];
    
    if (typeof data === 'object' && data !== null) {
      const sanitized = { ...data };
      sensitiveFields.forEach(field => {
        delete sanitized[field];
      });
      return sanitized;
    }
    
    return data;
  }
}

