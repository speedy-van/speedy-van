import { SecureBaseAgent } from '../shared/secure-base-agent';
import { AgentConfig, AgentResponse, AgentAction, ChatSession } from '../shared/types';

export class SecureAdminAgent extends SecureBaseAgent {
  constructor(config?: Partial<AgentConfig>) {
    const defaultConfig: AgentConfig = {
      model: 'gpt-4',
      temperature: 0.3, // Lower temperature for more consistent admin responses
      maxTokens: 1500,
      systemPrompt: `You are a secure administrative AI assistant for Speedy Van delivery service management.

SECURITY REQUIREMENTS:
- Only assist authenticated admin users with appropriate permissions
- Validate all administrative actions against user permissions
- Log all administrative activities for audit purposes
- Never expose sensitive system information
- Escalate suspicious activities immediately

Your role is to:
1. Provide business analytics and reporting
2. Manage driver operations and assignments
3. Handle escalated customer issues
4. Monitor system performance and status
5. Assist with user management tasks
6. Generate administrative reports

Administrative capabilities:
- View and analyze business metrics
- Manage driver schedules and assignments
- Handle customer escalations and complaints
- Monitor delivery operations in real-time
- Generate reports for management
- Manage user accounts and permissions
- System health monitoring

Guidelines:
- Always verify admin permissions before performing actions
- Provide accurate, data-driven insights
- Maintain professional communication
- Protect sensitive business and customer information
- Escalate system-critical issues immediately
- Document all administrative decisions

Security protocols:
- All actions are logged and audited
- Sensitive data is protected and access-controlled
- Multi-factor authentication required for critical operations
- Regular security reviews and compliance checks`,
      ...config,
    };

    super(defaultConfig);
  }

  getAgentType(): 'customer' | 'admin' {
    return 'admin';
  }

  isAuthorizedRole(role: string): boolean {
    return role === 'admin';
  }

  getSystemPrompt(): string {
    return this.config.systemPrompt;
  }

  getAvailableActions(): AgentAction[] {
    return [
      {
        type: 'get_analytics',
        parameters: {
          metric_type: 'string',
          date_range: 'string',
          filters: 'object',
        },
        description: 'Get business analytics and metrics',
      },
      {
        type: 'manage_drivers',
        parameters: {
          action: 'string',
          driver_id: 'string',
          data: 'object',
        },
        description: 'Manage driver operations and assignments',
      },
      {
        type: 'handle_escalation',
        parameters: {
          escalation_id: 'string',
          action: 'string',
          notes: 'string',
        },
        description: 'Handle escalated customer issues',
      },
      {
        type: 'generate_report',
        parameters: {
          report_type: 'string',
          parameters: 'object',
          format: 'string',
        },
        description: 'Generate administrative reports',
      },
      {
        type: 'system_status',
        parameters: {
          component: 'string',
        },
        description: 'Check system status and health',
      },
      {
        type: 'manage_users',
        parameters: {
          action: 'string',
          user_id: 'string',
          data: 'object',
        },
        description: 'Manage user accounts and permissions',
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
        message: 'Hello! I\'m your administrative assistant. I can help you with analytics, driver management, escalations, reports, and system monitoring. What would you like to do?',
        actions: this.suggestSecureActions('admin_welcome'),
        confidence: 1.0,
      };
    }

    const userMessage = lastMessage.content.toLowerCase();

    // Intent detection with admin-specific security validation
    if (this.detectAnalyticsIntent(userMessage)) {
      this.checkPermission('admin:analytics');
      return this.handleAnalyticsIntent(userMessage, session);
    }

    if (this.detectDriverManagementIntent(userMessage)) {
      this.checkPermission('driver:manage');
      return this.handleDriverManagementIntent(userMessage, session);
    }

    if (this.detectEscalationIntent(userMessage)) {
      this.checkPermission('escalation:handle');
      return this.handleEscalationIntent(userMessage, session);
    }

    if (this.detectReportIntent(userMessage)) {
      this.checkPermission('admin:reports');
      return this.handleReportIntent(userMessage, session);
    }

    if (this.detectSystemStatusIntent(userMessage)) {
      this.checkPermission('system:monitor');
      return this.handleSystemStatusIntent(userMessage, session);
    }

    if (this.detectUserManagementIntent(userMessage)) {
      this.checkPermission('user:manage');
      return this.handleUserManagementIntent(userMessage, session);
    }

    // Default admin response
    return {
      message: 'I can help you with various administrative tasks:\n\n' +
               '📊 **Analytics & Reports** - Business metrics, performance data\n' +
               '🚚 **Driver Management** - Schedules, assignments, performance\n' +
               '🆘 **Escalation Handling** - Customer issues, complaints\n' +
               '📋 **System Monitoring** - Health checks, status reports\n' +
               '👥 **User Management** - Account administration\n\n' +
               'What would you like to work on?',
      actions: this.suggestSecureActions('admin_general'),
      confidence: 0.8,
    };
  }

  private detectAnalyticsIntent(message: string): boolean {
    const analyticsKeywords = ['analytics', 'metrics', 'data', 'performance', 'stats', 'dashboard', 'kpi'];
    return analyticsKeywords.some(keyword => message.includes(keyword));
  }

  private detectDriverManagementIntent(message: string): boolean {
    const driverKeywords = ['driver', 'assignment', 'schedule', 'route', 'vehicle', 'dispatch'];
    return driverKeywords.some(keyword => message.includes(keyword));
  }

  private detectEscalationIntent(message: string): boolean {
    const escalationKeywords = ['escalation', 'complaint', 'issue', 'problem', 'customer service'];
    return escalationKeywords.some(keyword => message.includes(keyword));
  }

  private detectReportIntent(message: string): boolean {
    const reportKeywords = ['report', 'export', 'summary', 'analysis', 'breakdown'];
    return reportKeywords.some(keyword => message.includes(keyword));
  }

  private detectSystemStatusIntent(message: string): boolean {
    const statusKeywords = ['status', 'health', 'system', 'uptime', 'monitoring', 'alerts'];
    return statusKeywords.some(keyword => message.includes(keyword));
  }

  private detectUserManagementIntent(message: string): boolean {
    const userKeywords = ['user', 'account', 'permission', 'access', 'role', 'admin'];
    return userKeywords.some(keyword => message.includes(keyword));
  }

  private async handleAnalyticsIntent(message: string, session: ChatSession): Promise<AgentResponse> {
    return {
      message: 'I can provide you with various analytics and business metrics:\n\n' +
               '📈 **Performance Metrics**\n' +
               '• Delivery completion rates\n' +
               '• Average delivery times\n' +
               '• Customer satisfaction scores\n' +
               '• Revenue and growth trends\n\n' +
               '🚚 **Operational Data**\n' +
               '• Driver performance statistics\n' +
               '• Route efficiency analysis\n' +
               '• Vehicle utilization rates\n' +
               '• Peak time analysis\n\n' +
               'What specific metrics would you like to see?',
      actions: [
        {
          type: 'get_analytics',
          parameters: {
            metric_type: 'performance',
            date_range: 'last_30_days',
          },
          description: 'Get performance analytics',
        },
      ],
      confidence: 0.9,
    };
  }

  private async handleDriverManagementIntent(message: string, session: ChatSession): Promise<AgentResponse> {
    return {
      message: 'I can help you manage driver operations:\n\n' +
               '👨‍💼 **Driver Administration**\n' +
               '• View driver profiles and performance\n' +
               '• Manage schedules and availability\n' +
               '• Assign deliveries and routes\n' +
               '• Handle driver applications\n\n' +
               '📊 **Performance Monitoring**\n' +
               '• Track completion rates\n' +
               '• Monitor customer ratings\n' +
               '• Review delivery times\n' +
               '• Identify training needs\n\n' +
               'What driver management task would you like to perform?',
      actions: [
        {
          type: 'manage_drivers',
          parameters: {
            action: 'list_active',
          },
          description: 'View active drivers',
        },
      ],
      confidence: 0.9,
    };
  }

  private async handleEscalationIntent(message: string, session: ChatSession): Promise<AgentResponse> {
    return {
      message: 'I can help you handle customer escalations and issues:\n\n' +
               '🆘 **Escalation Management**\n' +
               '• Review pending escalations\n' +
               '• Assign to appropriate team members\n' +
               '• Track resolution progress\n' +
               '• Communicate with customers\n\n' +
               '📋 **Issue Categories**\n' +
               '• Delivery delays or failures\n' +
               '• Damaged or lost items\n' +
               '• Service complaints\n' +
               '• Billing disputes\n\n' +
               'Would you like to see pending escalations or handle a specific case?',
      actions: [
        {
          type: 'handle_escalation',
          parameters: {
            action: 'list_pending',
          },
          description: 'View pending escalations',
        },
      ],
      confidence: 0.9,
    };
  }

  private async handleReportIntent(message: string, session: ChatSession): Promise<AgentResponse> {
    return {
      message: 'I can generate various administrative reports:\n\n' +
               '📊 **Business Reports**\n' +
               '• Daily/weekly/monthly summaries\n' +
               '• Revenue and profit analysis\n' +
               '• Customer acquisition reports\n' +
               '• Market trend analysis\n\n' +
               '🚚 **Operational Reports**\n' +
               '• Driver performance summaries\n' +
               '• Delivery efficiency reports\n' +
               '• Route optimization analysis\n' +
               '• Vehicle maintenance schedules\n\n' +
               'What type of report would you like me to generate?',
      actions: [
        {
          type: 'generate_report',
          parameters: {
            report_type: 'business_summary',
            format: 'pdf',
          },
          description: 'Generate business summary report',
        },
      ],
      confidence: 0.9,
    };
  }

  private async handleSystemStatusIntent(message: string, session: ChatSession): Promise<AgentResponse> {
    return {
      message: 'I can provide system status and health monitoring:\n\n' +
               '🖥️ **System Health**\n' +
               '• Application uptime and performance\n' +
               '• Database connectivity and response times\n' +
               '• API endpoint status\n' +
               '• Server resource utilization\n\n' +
               '⚠️ **Alerts & Monitoring**\n' +
               '• Active system alerts\n' +
               '• Performance degradation warnings\n' +
               '• Scheduled maintenance windows\n' +
               '• Error rate monitoring\n\n' +
               'Which system component would you like to check?',
      actions: [
        {
          type: 'system_status',
          parameters: {
            component: 'all',
          },
          description: 'Check overall system status',
        },
      ],
      confidence: 0.9,
    };
  }

  private async handleUserManagementIntent(message: string, session: ChatSession): Promise<AgentResponse> {
    return {
      message: 'I can help you manage user accounts and permissions:\n\n' +
               '👥 **User Administration**\n' +
               '• Create and manage user accounts\n' +
               '• Assign roles and permissions\n' +
               '• Reset passwords and access\n' +
               '• Deactivate or suspend accounts\n\n' +
               '🔐 **Security Management**\n' +
               '• Review access logs\n' +
               '• Monitor login activities\n' +
               '• Manage two-factor authentication\n' +
               '• Audit permission changes\n\n' +
               'What user management task would you like to perform?',
      actions: [
        {
          type: 'manage_users',
          parameters: {
            action: 'list_users',
          },
          description: 'View user accounts',
        },
      ],
      confidence: 0.9,
    };
  }

  // Override to provide admin-specific validation
  protected validatePermissions(userId: string, action: string): boolean {
    const context = this.requireAuth();
    
    // Ensure user is authenticated admin
    if (context.role !== 'admin') {
      this.logSecurityEvent('unauthorized_admin_access', { 
        userId: context.userId, 
        role: context.role,
        attemptedAction: action
      });
      return false;
    }

    // Check admin-specific permissions
    const requiredPermission = this.getActionPermission(action);
    if (requiredPermission && !context.permissions.includes(requiredPermission)) {
      this.logSecurityEvent('insufficient_admin_permissions', {
        userId: context.userId,
        action,
        requiredPermission,
        userPermissions: context.permissions
      });
      return false;
    }

    return super.validateAction({ type: action });
  }

  // Admin-specific security checks
  protected async validateAdminOperation(operation: string, targetId?: string): Promise<boolean> {
    const context = this.requireAuth();
    
    // Log all admin operations for audit
    await this.logAdminOperation(operation, targetId);
    
    // Additional validation for sensitive operations
    const sensitiveOperations = ['delete_user', 'modify_permissions', 'system_shutdown'];
    if (sensitiveOperations.includes(operation)) {
      // In production, this might require additional authentication
      console.log(`Sensitive admin operation: ${operation} by ${context.userId}`);
    }
    
    return true;
  }

  private async logAdminOperation(operation: string, targetId?: string): Promise<void> {
    const context = this.requireAuth();
    
    console.log(`[ADMIN_AUDIT] User: ${context.userId}, Operation: ${operation}, Target: ${targetId || 'N/A'}, Time: ${new Date().toISOString()}`);
    
    // In production, this would write to a secure audit database
  }

  protected sanitizeAdminData(data: any): any {
    // Remove highly sensitive fields that even admins shouldn't see in chat
    const superSensitiveFields = ['encryption_keys', 'database_passwords', 'api_secrets'];
    
    if (typeof data === 'object' && data !== null) {
      const sanitized = { ...data };
      superSensitiveFields.forEach(field => {
        if (sanitized[field]) {
          sanitized[field] = '[CLASSIFIED]';
        }
      });
      return sanitized;
    }
    
    return data;
  }
}

