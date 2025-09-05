import { BaseAgent } from '../shared/base-agent';
import { ChatSession, AgentResponse, AgentConfig } from '../shared/types';
import { UserRole } from '@speedy-van/shared';

export class AdminAgent extends BaseAgent {
  constructor() {
    const config: AgentConfig = {
      model: 'deepseek-chat',
      temperature: 0.3, // Lower temperature for more precise admin responses
      maxTokens: 1500,
      systemPrompt: `You are an AI assistant for Speedy Van administrators and staff members. 

Your role is to:
- Help with operational tasks and system management
- Provide business analytics and reporting insights
- Assist with driver management and scheduling
- Help resolve escalated customer issues
- Support administrative workflows
- Provide system status and performance information

Guidelines:
- Be professional and precise in your responses
- Prioritize data accuracy and system security
- Only provide information appropriate to the user's role level
- Escalate sensitive operations to senior administrators
- Always verify user permissions before performing actions
- Maintain confidentiality of customer and business data

Available actions:
- View system analytics and reports
- Manage driver assignments and schedules
- Access customer support escalations
- Generate operational reports
- Monitor system performance
- Manage user accounts and permissions

Security Level: HIGH - All actions are logged and monitored.`,
      capabilities: [
        {
          name: 'get_analytics',
          description: 'Retrieve business analytics and KPIs',
          parameters: {
            metric_type: 'string',
            date_range: 'string',
            filters: 'object',
          },
        },
        {
          name: 'manage_drivers',
          description: 'View and manage driver information',
          parameters: {
            action: 'string',
            driver_id: 'string',
            updates: 'object',
          },
        },
        {
          name: 'handle_escalation',
          description: 'Process customer escalations',
          parameters: {
            escalation_id: 'string',
            action: 'string',
            notes: 'string',
          },
        },
        {
          name: 'generate_report',
          description: 'Generate operational reports',
          parameters: {
            report_type: 'string',
            parameters: 'object',
          },
        },
        {
          name: 'system_status',
          description: 'Check system health and performance',
          parameters: {
            component: 'string',
          },
        },
      ],
      securityLevel: 'high',
    };

    super(config);
  }

  protected getAgentType(): 'customer' | 'admin' {
    return 'admin';
  }

  protected async generateResponse(session: ChatSession): Promise<AgentResponse> {
    const lastMessage = session.messages[session.messages.length - 1];
    const messageContent = lastMessage.content.toLowerCase();

    // Verify admin permissions
    if (!this.verifyAdminAccess(session)) {
      return {
        message: 'Access denied. This assistant is only available to authorized administrators.',
        requiresEscalation: true,
      };
    }

    // Analyze admin intent
    const intent = this.analyzeAdminIntent(messageContent);
    
    // Generate appropriate response based on intent
    switch (intent.type) {
      case 'analytics':
        return this.handleAnalyticsRequest(intent.parameters);
      
      case 'driver_management':
        return this.handleDriverManagement(intent.parameters);
      
      case 'escalation_handling':
        return this.handleEscalationRequest(intent.parameters);
      
      case 'reporting':
        return this.handleReportGeneration(intent.parameters);
      
      case 'system_status':
        return this.handleSystemStatusRequest(intent.parameters);
      
      case 'user_management':
        return this.handleUserManagement(intent.parameters);
      
      case 'operational_query':
        return this.handleOperationalQuery(messageContent);
      
      default:
        return this.handleAdminGeneralInquiry(messageContent);
    }
  }

  private verifyAdminAccess(session: ChatSession): boolean {
    // In production, verify against actual user roles and permissions
    const userRole = session.context?.userRole;
    return userRole === UserRole.ADMIN || userRole === 'ADMIN';
  }

  private analyzeAdminIntent(message: string): { type: string; parameters: any } {
    if (message.includes('analytics') || message.includes('metrics') || message.includes('kpi')) {
      return { type: 'analytics', parameters: {} };
    }
    
    if (message.includes('driver') || message.includes('assignment') || message.includes('schedule')) {
      return { type: 'driver_management', parameters: {} };
    }
    
    if (message.includes('escalation') || message.includes('complaint') || message.includes('issue')) {
      return { type: 'escalation_handling', parameters: {} };
    }
    
    if (message.includes('report') || message.includes('export') || message.includes('summary')) {
      return { type: 'reporting', parameters: {} };
    }
    
    if (message.includes('system') || message.includes('status') || message.includes('health')) {
      return { type: 'system_status', parameters: {} };
    }
    
    if (message.includes('user') || message.includes('account') || message.includes('permission')) {
      return { type: 'user_management', parameters: {} };
    }
    
    return { type: 'operational_query', parameters: {} };
  }

  private async handleAnalyticsRequest(parameters: any): Promise<AgentResponse> {
    return {
      message: `I can help you access business analytics and performance metrics. What specific data would you like to see?

**Available Analytics:**
📊 **Revenue & Financial**
- Daily/weekly/monthly revenue
- Profit margins by service type
- Payment method analysis

📦 **Operational Metrics**
- Delivery completion rates
- Average delivery times
- Customer satisfaction scores

🚚 **Driver Performance**
- Driver efficiency ratings
- Route optimization metrics
- Vehicle utilization rates

👥 **Customer Analytics**
- New customer acquisition
- Customer retention rates
- Service usage patterns

Please specify the metric type and date range you need.`,
      actions: [
        {
          type: 'get_analytics',
          parameters: {},
          description: 'Retrieve specific analytics data',
        },
      ],
      suggestions: [
        'Show revenue for last 30 days',
        'Driver performance this week',
        'Customer satisfaction trends',
        'Delivery completion rates',
      ],
    };
  }

  private async handleDriverManagement(parameters: any): Promise<AgentResponse> {
    return {
      message: `I can assist with driver management tasks. What would you like to do?

**Driver Management Options:**
👤 **Driver Information**
- View driver profiles and status
- Check availability and schedules
- Review performance ratings

📅 **Scheduling & Assignments**
- Assign deliveries to drivers
- Manage driver schedules
- Handle shift changes

📊 **Performance Monitoring**
- Track delivery metrics
- Monitor customer feedback
- Identify training needs

⚠️ **Issue Resolution**
- Handle driver-related escalations
- Manage disciplinary actions
- Process driver requests

Please specify the driver ID or action you need to perform.`,
      actions: [
        {
          type: 'manage_drivers',
          parameters: {},
          description: 'Perform driver management action',
        },
      ],
      suggestions: [
        'Show available drivers',
        'Assign delivery to driver DRV123',
        'Check driver performance metrics',
        'Handle driver complaint',
      ],
    };
  }

  private async handleEscalationRequest(parameters: any): Promise<AgentResponse> {
    return {
      message: `I can help you manage customer escalations and support issues. What do you need assistance with?

**Escalation Management:**
🔥 **Active Escalations**
- View pending escalations
- Prioritize by severity
- Assign to team members

📋 **Case Processing**
- Review escalation details
- Add resolution notes
- Update case status

💬 **Customer Communication**
- Draft response messages
- Schedule follow-up calls
- Send resolution updates

📊 **Escalation Analytics**
- Track resolution times
- Identify common issues
- Monitor team performance

Please provide the escalation ID or specify what you'd like to review.`,
      actions: [
        {
          type: 'handle_escalation',
          parameters: {},
          description: 'Process customer escalation',
        },
      ],
      suggestions: [
        'Show pending escalations',
        'Review escalation ESC123',
        'Escalation trends this month',
        'Assign escalation to team member',
      ],
    };
  }

  private async handleReportGeneration(parameters: any): Promise<AgentResponse> {
    return {
      message: `I can generate various operational reports for you. Which report would you like to create?

**Available Reports:**
📈 **Business Reports**
- Revenue and financial summaries
- Customer acquisition reports
- Service performance analysis

🚚 **Operations Reports**
- Delivery performance metrics
- Driver productivity reports
- Route efficiency analysis

👥 **Customer Reports**
- Customer satisfaction surveys
- Booking trends and patterns
- Support ticket summaries

📊 **Executive Dashboards**
- KPI summaries
- Trend analysis
- Comparative reports

Please specify the report type, date range, and any filters you need.`,
      actions: [
        {
          type: 'generate_report',
          parameters: {},
          description: 'Generate operational report',
        },
      ],
      suggestions: [
        'Monthly revenue report',
        'Driver performance summary',
        'Customer satisfaction report',
        'Executive dashboard for Q4',
      ],
    };
  }

  private async handleSystemStatusRequest(parameters: any): Promise<AgentResponse> {
    return {
      message: `I can provide system health and performance information. What would you like to check?

**System Components:**
🖥️ **Application Status**
- Web application health
- API response times
- Database performance

🚚 **Operational Systems**
- GPS tracking system
- Payment processing
- Notification services

📊 **Infrastructure**
- Server performance
- Network connectivity
- Storage utilization

⚠️ **Alerts & Issues**
- Active system alerts
- Recent error logs
- Performance warnings

Which component would you like me to check?`,
      actions: [
        {
          type: 'system_status',
          parameters: {},
          description: 'Check system component status',
        },
      ],
      suggestions: [
        'Overall system health',
        'Check payment system',
        'API performance metrics',
        'Recent error logs',
      ],
    };
  }

  private async handleUserManagement(parameters: any): Promise<AgentResponse> {
    return {
      message: `I can assist with user account management. What do you need help with?

**User Management Tasks:**
👤 **Account Administration**
- Create new user accounts
- Update user information
- Reset passwords

🔐 **Permissions & Roles**
- Assign user roles
- Modify permissions
- Review access levels

📊 **User Analytics**
- Active user statistics
- Login activity reports
- Permission audit logs

⚠️ **Security Actions**
- Suspend/activate accounts
- Review security incidents
- Manage access violations

Please specify the user ID or action you need to perform.`,
      actions: [
        {
          type: 'manage_users',
          parameters: {},
          description: 'Perform user management action',
        },
      ],
      suggestions: [
        'Create new admin account',
        'Reset password for user123',
        'Review user permissions',
        'Show active user sessions',
      ],
    };
  }

  private async handleOperationalQuery(message: string): Promise<AgentResponse> {
    if (message.includes('booking') || message.includes('order')) {
      return {
        message: `I can help you with booking-related operations:

- **Search bookings** by ID, customer, or date range
- **Modify booking details** (address, time, items)
- **Process cancellations** and refunds
- **Handle booking issues** and exceptions
- **Generate booking reports** and analytics

What specific booking operation do you need assistance with?`,
        suggestions: [
          'Search bookings for today',
          'Modify booking BK123456',
          'Process refund request',
          'Show booking statistics',
        ],
      };
    }

    return this.handleAdminGeneralInquiry(message);
  }

  private async handleAdminGeneralInquiry(message: string): Promise<AgentResponse> {
    return {
      message: `Welcome to the Speedy Van Admin Assistant! I'm here to help you with administrative tasks and operations.

**What I can help you with:**
📊 **Analytics & Reporting** - Business metrics, KPIs, and custom reports
🚚 **Driver Management** - Scheduling, assignments, and performance monitoring  
🔥 **Escalation Handling** - Customer issues and support case management
⚙️ **System Monitoring** - Health checks and performance metrics
👥 **User Management** - Account administration and permissions

**Quick Actions:**
- "Show today's analytics"
- "Check system status"
- "Review pending escalations"
- "Generate weekly report"

What would you like assistance with today?`,
      suggestions: [
        'Show system dashboard',
        'Review today\'s performance',
        'Check pending escalations',
        'Generate monthly report',
      ],
    };
  }

  protected validatePermissions(userId: string, action: string): boolean {
    // Admin agents have broader permissions but still need validation
    const restrictedActions = [
      'delete_user',
      'modify_system_config',
      'access_financial_data',
    ];

    // In production, check against actual user permissions
    return !restrictedActions.includes(action);
  }

  protected logInteraction(
    sessionId: string,
    userId: string,
    message: string,
    response: AgentResponse
  ): void {
    // Enhanced logging for admin interactions
    console.log(`[ADMIN_AGENT] Session: ${sessionId}, Admin: ${userId}`);
    console.log(`Query: ${message}`);
    console.log(`Response: ${response.message}`);
    
    if (response.actions?.length) {
      console.log(`Admin Actions: ${response.actions.map(a => a.type).join(', ')}`);
    }
    
    // Log to audit trail for compliance
    this.logToAuditTrail(userId, message, response);
  }

  private logToAuditTrail(userId: string, query: string, response: AgentResponse): void {
    // In production, log to secure audit system
    const auditEntry = {
      timestamp: new Date().toISOString(),
      userId,
      agentType: 'admin',
      query: query.substring(0, 100), // Truncate for security
      actions: response.actions?.map(a => a.type) || [],
      requiresEscalation: response.requiresEscalation || false,
    };
    
    console.log('[AUDIT]', JSON.stringify(auditEntry));
  }
}

