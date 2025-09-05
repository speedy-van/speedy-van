# Agent System Architecture

## Overview

The Speedy Van AI Agent System has been redesigned with a clear separation between **Customer Agent** and **Development Admin** systems for enhanced security, performance, and maintainability.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Master Agent Manager                     │
│                    (Orchestration Layer)                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
┌───────▼────────┐        ┌────────▼────────┐
│ Customer Agent │        │ Development     │
│   Manager      │        │   Admin         │
│                │        │   Manager       │
└────────────────┘        └─────────────────┘
        │                           │
        │                           │
┌───────▼────────┐        ┌────────▼────────┐
│ Customer       │        │ Developer       │
│ Assistant      │        │ Assistant       │
│                │        │                 │
└────────────────┘        └─────────────────┘
                                      │
                                      │
                        ┌─────────────┴─────────────┐
                        │                           │
                ┌───────▼────────┐        ┌────────▼────────┐
                │ Code Analyzer  │        │ Test Manager    │
                │                │        │                 │
                └────────────────┘        └─────────────────┘
                        │                           │
                ┌───────▼────────┐        ┌────────▼────────┐
                │ Code Generator │        │ Database        │
                │                │        │ Manager         │
                └────────────────┘        └─────────────────┘
```

## System Components

### 1. Master Agent Manager
- **Purpose**: Coordinates between Customer Agent and Development Admin
- **Responsibilities**: 
  - Query routing
  - System health monitoring
  - Resource management
  - Emergency shutdown

### 2. Customer Agent Manager
- **Purpose**: Manages customer-facing AI interactions
- **Features**:
  - Session management (30-minute timeout)
  - Customer preferences
  - Language support
  - Booking and pricing queries
  - Support interactions

### 3. Development Admin Manager
- **Purpose**: Manages development and administrative AI tools
- **Features**:
  - Code analysis and generation
  - Testing tools
  - Database management
  - File system operations
  - Deployment tools

## Security Model

### Customer Agent
- **Permissions**: Read-only access to customer data
- **Tools**: Limited to customer service functions
- **Session Timeout**: 30 minutes
- **Data Access**: Only customer-related information

### Development Admin
- **Permissions**: Read, Write, Execute based on role
- **Tools**: Full development toolset
- **Session Timeout**: 1 hour
- **Data Access**: Full system access with permission checks

## Session Management

### Customer Sessions
```typescript
interface CustomerContext {
  sessionId: string;
  customerId?: string;
  startTime: Date;
  lastActivity: Date;
  language: string;
  preferences: CustomerPreferences;
  history: InteractionHistory[];
  currentQuery: string | null;
}
```

### Development Sessions
```typescript
interface DeveloperContext {
  sessionId: string;
  developerId?: string;
  startTime: Date;
  lastActivity: Date;
  permissions: string[];
  currentProject: string | null;
  activeFiles: string[];
  developmentMode: 'development' | 'testing' | 'production';
  tools: ToolPermissions;
  history: DevelopmentHistory[];
}
```

## Usage Examples

### Customer Query
```typescript
import { MasterAgentManager } from '@/agent';

const masterManager = new MasterAgentManager();
await masterManager.initialize();

const response = await masterManager.routeQuery(
  "What's the price for moving from London to Manchester?",
  {
    type: 'customer',
    language: 'en'
  }
);
```

### Development Query
```typescript
const response = await masterManager.routeQuery(
  "Analyze the code quality in src/components/",
  {
    type: 'development',
    permissions: ['read', 'write']
  }
);
```

## Performance Benefits

1. **Parallel Processing**: Both systems can run independently
2. **Resource Isolation**: Customer queries don't impact development tools
3. **Scalability**: Each system can be scaled independently
4. **Memory Management**: Separate session pools prevent conflicts

## Monitoring and Health

### System Status
```typescript
const status = await masterManager.getSystemStatus();
// Returns:
// {
//   status: 'running',
//   customerAgent: true,
//   developmentAdmin: true,
//   activeSessions: { customer: 5, development: 2 },
//   uptime: 3600000
// }
```

### Health Checks
- Individual system health monitoring
- Automatic session cleanup
- Error logging and reporting
- Performance metrics collection

## Error Handling

### Customer Agent Errors
- Graceful fallback responses
- Support contact suggestions
- Session recovery mechanisms

### Development Admin Errors
- Permission validation
- Tool availability checks
- Detailed error logging
- Fallback to safe operations

## Future Enhancements

1. **Load Balancing**: Distribute queries across multiple instances
2. **Caching**: Implement response caching for common queries
3. **Analytics**: Enhanced usage tracking and performance metrics
4. **Plugin System**: Extensible tool architecture
5. **Multi-tenancy**: Support for multiple customer organizations

## Migration Notes

- Existing customer functionality remains unchanged
- Development tools are now properly isolated
- Session management is more robust
- Error handling is more comprehensive
- Performance monitoring is enhanced
