# Speedy Van AI Agent System

## Overview

The Speedy Van AI Agent System is a sophisticated, dual-mode artificial intelligence platform that provides intelligent assistance for both customers and developers. Built with cutting-edge AI technology, it combines Retrieval-Augmented Generation (RAG), advanced language models, and custom tools to deliver exceptional user experiences.

## Architecture

### Core Components

```
src/agent/
├── core/                    # Core Agent Classes
│   ├── AgentManager.ts      # Main orchestrator and mode switcher
│   ├── CustomerAssistant.ts # Customer service AI logic
│   └── DeveloperAssistant.ts # Development tools AI logic
├── tools/                   # AI Tools and Functions
│   ├── pricing.ts           # Business logic tools
│   └── developer/           # Development-specific tools
│       └── FileSystemManager.ts
├── router.ts                # Request routing and processing
├── types.ts                 # TypeScript type definitions
└── README.md                # This documentation
```

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Input    │───▶│  AgentManager   │───▶│  OpenAI GPT-4   │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ Mode Detection  │
                       │                 │
                       └─────────────────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
        ┌─────────────────┐    ┌─────────────────┐
        │CustomerAssistant│    │DeveloperAssistant│
        │                 │    │                 │
        └─────────────────┘    └─────────────────┘
                    │                       │
                    ▼                       ▼
        ┌─────────────────┐    ┌─────────────────┐
        │ Customer Tools  │    │ Developer Tools │
        │                 │    │                 │
        └─────────────────┘    └─────────────────┘
```

## Dual-Mode Operation

### Customer Mode

**Purpose**: Provide intelligent customer service and support

**Capabilities**:
- Natural language conversation processing
- Multi-language support (Arabic/English)
- Context-aware responses
- Automated action execution
- Intelligent suggestion generation
- Service booking and inquiry handling

**Use Cases**:
- Customer inquiries and support
- Service booking assistance
- Payment processing help
- Status tracking and updates
- General information requests

### Developer Mode

**Purpose**: Provide advanced development tools and AI assistance

**Capabilities**:
- Live code analysis and review
- File system management
- Code generation and refactoring
- Testing and debugging assistance
- Database management tools
- Project structure analysis

**Use Cases**:
- Code review and improvement
- Project file management
- Development workflow automation
- Testing and quality assurance
- Database operations and migrations

## Core Classes

### AgentManager

The central orchestrator that manages the entire AI agent system.

## Production Error Monitoring

The Speedy Van AI Agent System now includes a comprehensive Production Error Monitoring system that automatically collects, analyzes, and reports errors from production environments.

### Key Features
- **Automatic Error Collection**: Middleware-based error capture from Next.js applications
- **Real-time Monitoring**: Live error tracking with immediate alerts for critical issues
- **Comprehensive Analytics**: Detailed error statistics, trends, and patterns
- **AI-Powered Reports**: Automated report generation with actionable recommendations
- **Status Management**: Full error lifecycle tracking from detection to resolution

### Components
- **ErrorMonitoringService**: Core service for error management and analytics
- **ErrorCollectionMiddleware**: Next.js middleware for automatic error capture
- **ProductionErrorDashboard**: Comprehensive monitoring interface
- **API Endpoints**: RESTful APIs for error management and reporting

### Access
The Production Error Monitoring system is accessible at `/error-monitoring` and provides:
- Real-time error monitoring
- Advanced filtering and search
- Trend analysis and reporting
- Developer assignment and status tracking
- Export and integration capabilities

For detailed documentation, see: `src/components/ProductionErrorMonitoring/README.md`

**Key Features**:
- **Singleton Pattern**: Ensures single instance across application
- **Mode Switching**: Seamless transition between Customer and Developer modes
- **Request Routing**: Intelligent routing based on query content and context
- **Tool Management**: Dynamic tool loading and execution
- **Performance Monitoring**: Built-in metrics and logging

**Usage**:
```typescript
import { AgentManager } from '@/agent/core/AgentManager';

// Get singleton instance
const agentManager = AgentManager.getInstance();

// Switch to developer mode
agentManager.switchMode(AgentMode.DEVELOPER, {
  projectPath: process.cwd(),
  environment: 'development',
  permissions: ['read', 'write', 'execute', 'admin']
});

// Handle queries
const response = await agentManager.handleQuery(
  "Analyze this code for performance issues",
  'en',
  { filePath: '/src/components/Example.tsx' }
);
```

**Methods**:
- `getInstance()`: Get singleton instance
- `switchMode(mode, context)`: Switch between modes
- `handleQuery(query, language, context)`: Process user queries
- `getTools()`: Get available tools for current mode
- `getHealth()`: System health check
- `cleanup()`: Resource cleanup

### CustomerAssistant

Specialized AI assistant for customer service operations.

**Key Features**:
- **Conversation Management**: Maintains context and history
- **Multi-language Processing**: Arabic and English support
- **Intent Recognition**: Understands customer needs and requests
- **Action Automation**: Executes customer service tasks
- **Personalization**: Tailors responses to customer preferences

**Usage**:
```typescript
import { CustomerAssistant } from '@/agent/core/CustomerAssistant';

const customerAssistant = new CustomerAssistant();
await customerAssistant.initialize();

const response = await customerAssistant.processQuery(
  "I need to book a delivery service",
  'en',
  { customerId: 'customer123', sessionId: 'session456' }
);
```

**Methods**:
- `initialize(context)`: Initialize with customer context
- `processQuery(query, language, context)`: Process customer queries
- `getSuggestions(context)`: Generate contextual suggestions
- `executeAction(action, context)`: Execute customer service actions
- `getHealth()`: Health check and status

### DeveloperAssistant

Advanced AI assistant for development and coding tasks.

**Key Features**:
- **Code Analysis**: Live code review and improvement suggestions
- **File Management**: Advanced file system operations
- **Development Tools**: Integrated testing, debugging, and database tools
- **Project Intelligence**: Understanding of project structure and context
- **AI-Powered Suggestions**: Intelligent code improvements and refactoring

**Usage**:
```typescript
import { DeveloperAssistant } from '@/agent/core/DeveloperAssistant';

const developerAssistant = new DeveloperAssistant();
await developerAssistant.initialize({
  projectPath: process.cwd(),
  environment: 'development'
});

const analysis = await developerAssistant.getLiveCodeAnalysis(
  '/src/components/Example.tsx'
);
```

**Methods**:
- `initialize(context)`: Initialize with development context
- `processQuery(query, language, context)`: Process development queries
- `getLiveCodeAnalysis(filePath)`: Analyze code in real-time
- `getProjectStructure()`: Get project file structure
- `getTools()`: Get available development tools

## AI Tools System

### Tool Architecture

Tools are modular functions that the AI can call to perform specific tasks.

**Tool Structure**:
```typescript
interface Tool {
  name: string;
  description: string;
  parameters: ZodSchema;
  execute: (args: any) => Promise<any>;
}
```

### Available Tools

#### Business Tools

**Pricing Tool** (`pricing.ts`):
- Calculates service prices based on items and distance
- Supports multiple service types
- Handles discounts and special offers

**Usage**:
```typescript
const pricingResult = await agentManager.executeTool('pricing', {
  serviceType: 'delivery',
  items: [{ id: 'item1', name: 'Package', weight: 5 }],
  distance: 25,
  urgency: 'standard'
});
```

#### Development Tools

**FileSystemManager** (`developer/FileSystemManager.ts`):
- File and directory operations
- Project structure analysis
- File content reading and writing
- File watching and change detection

**Usage**:
```typescript
const fileSystem = agentManager.getFileSystemManager();
const structure = await fileSystem.getProjectStructure();
const content = await fileSystem.readFile('/src/components/Example.tsx');
```

### Custom Tool Development

Creating new tools for the AI agent:

```typescript
import { z } from 'zod';
import { Tool } from '../types';

export const customTool: Tool = {
  name: 'custom_tool',
  description: 'A custom tool for specific functionality',
  parameters: z.object({
    input: z.string(),
    options: z.object({
      format: z.enum(['json', 'xml', 'csv']).optional()
    }).optional()
  }),
  execute: async (args) => {
    // Tool implementation
    const { input, options } = args;
    
    // Process input
    const result = await processInput(input, options);
    
    return {
      success: true,
      result,
      timestamp: new Date().toISOString()
    };
  }
};

// Register tool with AgentManager
agentManager.registerTool(customTool);
```

## RAG System (Retrieval-Augmented Generation)

### Overview

The RAG system enhances AI responses by providing relevant context from a knowledge base.

### Components

1. **Document Processing**: Chunks documents into manageable pieces
2. **Embedding Generation**: Creates vector representations of text
3. **Vector Storage**: Stores embeddings in PostgreSQL with pgvector
4. **Similarity Search**: Finds relevant documents for queries
5. **Context Formation**: Combines retrieved documents with user queries

### Database Schema

```sql
-- Document chunks with embeddings
CREATE TABLE rag_chunks (
  id BIGSERIAL PRIMARY KEY,
  doc_id VARCHAR(255) NOT NULL,
  chunk TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tool execution logging
CREATE TABLE agent_tool_calls (
  id BIGSERIAL PRIMARY KEY,
  tool_name VARCHAR(255) NOT NULL,
  args JSONB NOT NULL,
  result JSONB,
  error TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### RAG Workflow

```
1. User Query → 2. Query Embedding → 3. Similarity Search → 4. Context Retrieval
                                                                    ↓
6. Response Generation ← 5. Context + Query → OpenAI API
```

### Usage

```typescript
// Build knowledge base
await agentManager.buildKnowledgeBase([
  '/docs/service-guide.md',
  '/docs/pricing-policy.md',
  '/docs/faq.md'
]);

// Query with RAG enhancement
const response = await agentManager.handleQuery(
  "What are your delivery rates?",
  'en',
  { useRAG: true }
);
```

## Configuration

### Environment Variables

```bash
# DeepSeek Configuration
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_MAX_TOKENS=4000

# Database Configuration
DATABASE_URL=postgresql://user:password@host:port/database

# Agent Configuration
AGENT_LOG_LEVEL=info
AGENT_MAX_CONVERSATION_LENGTH=50
AGENT_RESPONSE_TIMEOUT=30000
```

### Agent Configuration

```typescript
interface AgentConfig {
  deepseek: {
    apiKey: string;
    model: string;
    maxTokens: number;
    temperature: number;
  };
  database: {
    url: string;
    maxConnections: number;
  };
  agent: {
    logLevel: string;
    maxConversationLength: number;
    responseTimeout: number;
    enableRAG: boolean;
    enableToolExecution: boolean;
  };
  modes: {
    customer: CustomerModeConfig;
    developer: DeveloperModeConfig;
  };
}
```

## Performance & Monitoring

### Performance Metrics

- **Response Time**: Time from query to response
- **Token Usage**: DeepSeek API token consumption
- **Tool Execution Time**: Time spent executing tools
- **Memory Usage**: System memory consumption
- **Database Query Performance**: Vector search and retrieval times

### Monitoring

```typescript
// Performance monitoring
const metrics = await agentManager.getPerformanceMetrics();

// Health check
const health = await agentManager.getHealth();

// System status
const status = await agentManager.getSystemStatus();
```

### Logging

Comprehensive logging system for debugging and monitoring:

```typescript
// Log levels: debug, info, warn, error
agentManager.log('info', 'Customer query processed', {
  query: userQuery,
  responseTime: responseTime,
  tokensUsed: tokensUsed
});

// Tool execution logging
agentManager.logToolExecution('pricing', args, result, executionTime);
```

## Security

### Data Protection

- **Input Validation**: All inputs validated with Zod schemas
- **SQL Injection Prevention**: Parameterized queries and Prisma ORM
- **API Key Security**: Environment variable protection
- **Access Control**: Role-based permissions and context validation

### Privacy Compliance

- **Data Encryption**: Sensitive data encrypted at rest
- **Audit Logging**: All operations logged for compliance
- **Data Retention**: Configurable data retention policies
- **GDPR Compliance**: Right to be forgotten and data portability

## Testing

### Test Commands

```bash
# Run all agent tests
pnpm test:agent

# Run specific test suites
pnpm test:agent --testPathPattern="AgentManager"
pnpm test:agent --testPathPattern="CustomerAssistant"
pnpm test:agent --testPathPattern="DeveloperAssistant"

# Run tests with coverage
pnpm test:agent --coverage

# Run integration tests
pnpm test:agent:integration
```

### Test Structure

```
__tests__/agent/
├── unit/                    # Unit tests
│   ├── AgentManager.test.ts
│   ├── CustomerAssistant.test.ts
│   └── DeveloperAssistant.test.ts
├── integration/             # Integration tests
│   ├── RAG.test.ts
│   ├── ToolExecution.test.ts
│   └── ModeSwitching.test.ts
└── fixtures/                # Test data and mocks
    ├── mockQueries.ts
    ├── mockResponses.ts
    └── mockTools.ts
```

### Testing Patterns

- **Unit Tests**: Individual class and method testing
- **Integration Tests**: End-to-end workflow testing
- **Mock Testing**: OpenAI API and external service mocking
- **Performance Testing**: Response time and resource usage testing
- **Security Testing**: Input validation and access control testing

## Deployment

### Production Setup

1. **Environment Configuration**:
   ```bash
   NODE_ENV=production
   DEEPSEEK_API_KEY=production_key
   DATABASE_URL=production_database_url
   ```

2. **Database Migration**:
   ```bash
   pnpm prisma migrate deploy
   pnpm prisma generate
   ```

3. **Knowledge Base Building**:
   ```bash
   pnpm rag:build
   ```

4. **Health Check**:
   ```bash
   curl /api/agent/health
   ```

### Scaling Considerations

- **Database Connection Pooling**: Optimize PostgreSQL connections
- **Caching**: Implement Redis for frequently accessed data
- **Load Balancing**: Distribute requests across multiple instances
- **Monitoring**: Implement comprehensive monitoring and alerting

## Troubleshooting

### Common Issues

1. **DeepSeek API Errors**:
   - Check API key validity
   - Verify rate limits and quotas
   - Check network connectivity

2. **Database Connection Issues**:
   - Verify DATABASE_URL format
   - Check PostgreSQL service status
   - Verify pgvector extension installation

3. **Tool Execution Failures**:
   - Check tool parameter validation
   - Verify file system permissions
   - Review error logs for specific failures

4. **Performance Issues**:
   - Monitor response times
   - Check database query performance
   - Review DeepSeek API usage patterns

### Debug Mode

Enable debug mode for detailed logging:

```typescript
// Enable debug logging
process.env.AGENT_LOG_LEVEL = 'debug';

// Debug mode in AgentManager
agentManager.setDebugMode(true);
```

### Error Handling

Comprehensive error handling and recovery:

```typescript
try {
  const response = await agentManager.handleQuery(query, language, context);
  return response;
} catch (error) {
  // Log error
  agentManager.log('error', 'Query processing failed', { error, query });
  
  // Return fallback response
  return {
    success: false,
    error: 'Service temporarily unavailable',
    fallback: true
  };
}
```

## Roadmap

### Phase 1: Core Platform ✅
- [x] Dual-mode AI agent system
- [x] Basic RAG implementation
- [x] Core tool system
- [x] Customer and Developer assistants

### Phase 2: Advanced Features 🚧
- [ ] Enhanced RAG with multiple knowledge sources
- [ ] Advanced tool development framework
- [ ] Real-time collaboration features
- [ ] Advanced language processing

### Phase 3: Enterprise Features 📋
- [ ] Multi-tenant support
- [ ] Advanced security and compliance
- [ ] Performance optimization
- [ ] Advanced monitoring and analytics

### Phase 4: AI Enhancement 📋
- [ ] Custom AI model training
- [ ] Advanced reasoning capabilities
- [ ] Predictive analytics
- [ ] Autonomous decision making

## Contributing

### Development Guidelines

1. **Code Quality**: Follow TypeScript best practices
2. **Testing**: Add comprehensive tests for new features
3. **Documentation**: Update documentation for all changes
4. **Security**: Follow security best practices
5. **Performance**: Consider performance impact of changes

### Tool Development

When creating new tools:

1. **Follow the Tool interface** exactly
2. **Use Zod for parameter validation**
3. **Implement proper error handling**
4. **Add comprehensive logging**
5. **Include unit tests**
6. **Update documentation**

### Code Review Process

- [ ] Code follows project patterns and conventions
- [ ] TypeScript types are properly defined
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] Security considerations are addressed
- [ ] Performance impact is evaluated

## Support

For technical support and questions:

- **Email**: support@speedy-van.co.uk
- **Phone**: +44 7901846297
- **Documentation**: [AI Agent Guide](https://docs.speedy-van.com/ai-agent)
- **Issues**: [GitHub Issues](https://github.com/speedy-van/web/issues)
- **Discord**: [Developer Community](https://discord.gg/speedy-van)

## License

This project is proprietary software owned by Speedy Van Ltd. All rights reserved.

---

**Built with ❤️ by the Speedy Van Development Team**

*Empowering businesses with intelligent AI assistance for customers and developers.*
