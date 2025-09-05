import { BaseAgent } from '../shared/base-agent';
import { ChatSession, AgentResponse, AgentConfig, AgentAction } from '../shared/types';
import { UserRole } from '@speedy-van/shared';

export class CustomerAgent extends BaseAgent {
  constructor() {
    const config: AgentConfig = {
      model: 'deepseek-chat',
      temperature: 0.7,
      maxTokens: 1000,
      systemPrompt: `You are a helpful customer service agent for Speedy Van, a delivery service company. 

Your role is to:
- Help customers with booking deliveries
- Provide quotes and pricing information
- Track existing deliveries
- Answer questions about services
- Resolve customer issues
- Escalate complex problems to human agents when needed

Guidelines:
- Be friendly, professional, and helpful
- Always prioritize customer satisfaction
- Provide accurate information about services and pricing
- If you cannot help with something, offer to escalate to a human agent
- Never share sensitive customer information
- Keep responses concise but informative
- Always confirm important details with customers

Available actions:
- Get pricing quotes
- Create new bookings
- Track existing deliveries
- Update booking details
- Cancel bookings (with proper authorization)
- Escalate to human support

Remember: You can only access information for the current customer and cannot perform administrative functions.`,
      capabilities: [
        {
          name: 'get_quote',
          description: 'Get pricing quote for delivery',
          parameters: {
            pickup_address: 'string',
            delivery_address: 'string',
            items: 'array',
            scheduled_date: 'string',
          },
        },
        {
          name: 'create_booking',
          description: 'Create new delivery booking',
          parameters: {
            quote_id: 'string',
            customer_details: 'object',
            payment_method: 'string',
          },
        },
        {
          name: 'track_delivery',
          description: 'Track existing delivery',
          parameters: {
            booking_id: 'string',
          },
        },
        {
          name: 'update_booking',
          description: 'Update booking details',
          parameters: {
            booking_id: 'string',
            updates: 'object',
          },
        },
        {
          name: 'cancel_booking',
          description: 'Cancel existing booking',
          parameters: {
            booking_id: 'string',
            reason: 'string',
          },
        },
      ],
      securityLevel: 'medium',
    };

    super(config);
  }

  protected getAgentType(): 'customer' | 'admin' {
    return 'customer';
  }

  protected async generateResponse(session: ChatSession): Promise<AgentResponse> {
    const lastMessage = session.messages[session.messages.length - 1];
    const messageContent = lastMessage.content.toLowerCase();

    // Analyze user intent
    const intent = this.analyzeIntent(messageContent);
    
    // Generate appropriate response based on intent
    switch (intent.type) {
      case 'get_quote':
        return this.handleQuoteRequest(intent.parameters);
      
      case 'create_booking':
        return this.handleBookingCreation(intent.parameters);
      
      case 'track_delivery':
        return this.handleDeliveryTracking(intent.parameters);
      
      case 'update_booking':
        return this.handleBookingUpdate(intent.parameters);
      
      case 'cancel_booking':
        return this.handleBookingCancellation(intent.parameters);
      
      case 'general_inquiry':
        return this.handleGeneralInquiry(messageContent);
      
      case 'complaint':
        return this.handleComplaint(messageContent);
      
      default:
        return this.handleUnknownIntent(messageContent);
    }
  }

  private analyzeIntent(message: string): { type: string; parameters: any } {
    // Simple intent recognition - in production, use more sophisticated NLP
    if (message.includes('quote') || message.includes('price') || message.includes('cost')) {
      return { type: 'get_quote', parameters: {} };
    }
    
    if (message.includes('book') || message.includes('schedule') || message.includes('order')) {
      return { type: 'create_booking', parameters: {} };
    }
    
    if (message.includes('track') || message.includes('status') || message.includes('where')) {
      return { type: 'track_delivery', parameters: {} };
    }
    
    if (message.includes('change') || message.includes('update') || message.includes('modify')) {
      return { type: 'update_booking', parameters: {} };
    }
    
    if (message.includes('cancel') || message.includes('refund')) {
      return { type: 'cancel_booking', parameters: {} };
    }
    
    if (message.includes('problem') || message.includes('issue') || message.includes('complaint')) {
      return { type: 'complaint', parameters: {} };
    }
    
    return { type: 'general_inquiry', parameters: {} };
  }

  private async handleQuoteRequest(parameters: any): Promise<AgentResponse> {
    return {
      message: `I'd be happy to help you get a quote for your delivery! To provide an accurate estimate, I'll need some information:

1. **Pickup address** - Where should we collect the items?
2. **Delivery address** - Where should we deliver them?
3. **Items to deliver** - What are you sending? (furniture, boxes, appliances, etc.)
4. **Preferred date and time** - When would you like the delivery?

Once you provide these details, I can give you an instant quote and help you book the delivery if you're satisfied with the price.`,
      actions: [
        {
          type: 'get_quote',
          parameters: {},
          description: 'Collect information for pricing quote',
        },
      ],
      suggestions: [
        'I need to move furniture from downtown to suburbs',
        'How much to deliver 5 boxes across town?',
        'Quote for same-day appliance delivery',
      ],
    };
  }

  private async handleBookingCreation(parameters: any): Promise<AgentResponse> {
    return {
      message: `Great! I can help you create a booking. Do you already have a quote, or would you like me to generate one first?

If you have a quote reference number, please share it and I'll proceed with the booking.

If you need a new quote, please provide:
- Pickup and delivery addresses
- Items to be delivered
- Preferred date and time

I'll also need to collect your contact information and payment details to complete the booking.`,
      actions: [
        {
          type: 'create_booking',
          parameters: {},
          description: 'Create new delivery booking',
        },
      ],
      suggestions: [
        'I have quote #QT123456',
        'I need a new quote first',
        'What payment methods do you accept?',
      ],
    };
  }

  private async handleDeliveryTracking(parameters: any): Promise<AgentResponse> {
    return {
      message: `I can help you track your delivery! Please provide one of the following:

- **Booking ID** (starts with BK...)
- **Tracking code** (sent via email/SMS)
- **Phone number** used for the booking

Once I have this information, I'll show you the current status and estimated delivery time.`,
      actions: [
        {
          type: 'track_delivery',
          parameters: {},
          description: 'Track existing delivery',
        },
      ],
      suggestions: [
        'My booking ID is BK123456',
        'Track using phone number',
        'I have a tracking code',
      ],
    };
  }

  private async handleBookingUpdate(parameters: any): Promise<AgentResponse> {
    return {
      message: `I can help you update your booking details. Please provide your booking ID and let me know what you'd like to change:

**Common updates:**
- Change delivery address
- Reschedule delivery time
- Add or remove items
- Update contact information

**Note:** Some changes may affect the pricing, and modifications might not be possible if your delivery is already in progress.`,
      actions: [
        {
          type: 'update_booking',
          parameters: {},
          description: 'Update booking details',
        },
      ],
      suggestions: [
        'Change delivery address for BK123456',
        'Reschedule my delivery to tomorrow',
        'Add more items to my booking',
      ],
    };
  }

  private async handleBookingCancellation(parameters: any): Promise<AgentResponse> {
    return {
      message: `I understand you need to cancel your booking. I can help with that, but I'll need:

1. **Booking ID** or tracking code
2. **Reason for cancellation** (optional, helps us improve)

**Important information:**
- Cancellations made 24+ hours before pickup: Full refund
- Cancellations made 2-24 hours before: 50% refund
- Cancellations less than 2 hours before: No refund
- If delivery is in progress: Cancellation may not be possible

Would you like to proceed with the cancellation?`,
      actions: [
        {
          type: 'cancel_booking',
          parameters: {},
          description: 'Cancel existing booking',
        },
      ],
      suggestions: [
        'Cancel booking BK123456',
        'What is your refund policy?',
        'I need to reschedule instead',
      ],
    };
  }

  private async handleGeneralInquiry(message: string): Promise<AgentResponse> {
    // Handle common questions
    if (message.includes('hours') || message.includes('open')) {
      return {
        message: `Our delivery services are available:
- **Monday to Friday:** 8:00 AM - 8:00 PM
- **Saturday:** 9:00 AM - 6:00 PM  
- **Sunday:** 10:00 AM - 4:00 PM

We also offer express and same-day delivery options with extended hours. Customer support is available 24/7 through this chat.`,
        suggestions: [
          'What areas do you serve?',
          'Do you deliver on holidays?',
          'How do I schedule a delivery?',
        ],
      };
    }

    if (message.includes('area') || message.includes('location') || message.includes('deliver')) {
      return {
        message: `We provide delivery services throughout the metropolitan area, including:
- City center and downtown
- All suburban areas within 50km
- Airport pickup and delivery
- Commercial and residential addresses

For deliveries outside our standard area, we offer special arrangements. Just provide the addresses and I'll check availability and pricing for you.`,
        suggestions: [
          'Check if you deliver to my area',
          'What about rural deliveries?',
          'Do you deliver to businesses?',
        ],
      };
    }

    return {
      message: `I'm here to help with all your delivery needs! I can assist you with:

📦 **Getting quotes** and booking deliveries
🚚 **Tracking** your existing deliveries  
📅 **Scheduling** and rescheduling deliveries
💰 **Pricing** information and payment options
❓ **General questions** about our services

What would you like help with today?`,
      suggestions: [
        'Get a delivery quote',
        'Track my delivery',
        'What items can you deliver?',
        'How much does delivery cost?',
      ],
    };
  }

  private async handleComplaint(message: string): Promise<AgentResponse> {
    return {
      message: `I'm sorry to hear you're experiencing an issue. I want to help resolve this for you as quickly as possible.

Please provide:
1. **Booking ID** (if applicable)
2. **Details of the issue** you're experiencing
3. **How you'd like us to resolve it**

For urgent issues or if you'd prefer to speak with a supervisor, I can escalate this to our customer care team immediately.`,
      actions: [
        {
          type: 'escalate',
          parameters: { reason: 'customer_complaint' },
          description: 'Escalate complaint to human agent',
        },
      ],
      suggestions: [
        'My delivery was damaged',
        'Driver was unprofessional',
        'I want to speak to a manager',
        'Request a refund',
      ],
      requiresEscalation: message.includes('manager') || message.includes('supervisor'),
    };
  }

  private async handleUnknownIntent(message: string): Promise<AgentResponse> {
    return {
      message: `I want to make sure I understand how to help you best. Could you please clarify what you need assistance with?

I can help you with:
- Getting delivery quotes
- Booking new deliveries  
- Tracking existing deliveries
- Updating or canceling bookings
- General questions about our services

Or if you'd prefer, I can connect you with a human agent who can assist you further.`,
      suggestions: [
        'I need a delivery quote',
        'Track my package',
        'Speak to a human agent',
        'What services do you offer?',
      ],
    };
  }

  protected validatePermissions(userId: string, action: string): boolean {
    // Customer agents can only perform customer-facing actions
    const allowedActions = [
      'get_quote',
      'create_booking',
      'track_delivery',
      'update_booking',
      'cancel_booking',
    ];

    return allowedActions.includes(action);
  }
}

