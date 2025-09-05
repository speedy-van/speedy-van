export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ChatSession {
  id: string;
  userId: string;
  agentType: 'customer' | 'admin';
  messages: ChatMessage[];
  status: 'active' | 'closed' | 'escalated';
  createdAt: Date;
  updatedAt: Date;
  context?: SessionContext;
}

export interface SessionContext {
  userRole: string;
  currentBooking?: string;
  previousBookings?: string[];
  userPreferences?: Record<string, any>;
  escalationReason?: string;
}

export interface AgentCapability {
  name: string;
  description: string;
  parameters?: Record<string, any>;
}

export interface AgentResponse {
  message: string;
  actions?: AgentAction[];
  suggestions?: string[];
  requiresEscalation?: boolean;
  confidence?: number;
}

export interface AgentAction {
  type: 'create_booking' | 'update_booking' | 'cancel_booking' | 'get_quote' | 'track_delivery' | 'escalate' | 
        'get_analytics' | 'manage_drivers' | 'handle_escalation' | 'generate_report' | 'system_status' | 'manage_users';
  parameters: Record<string, any>;
  description: string;
}

export interface AgentConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  capabilities?: AgentCapability[];
  securityLevel?: 'low' | 'medium' | 'high';
}

