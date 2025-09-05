import { chatLLM } from './llm';
import { embed } from './rag/embedder';
import { topKFromDB } from './rag/retriever';
import { toolPricing } from './tools/pricing';
import { toolBookingStatus } from './tools/bookings';
import { toolPaymentStatus } from './tools/payments';
import { toolNotify } from './tools/notify';
import { withPerformance, withRequestId, logToolExecution, logError } from '@/lib/logger';
import { logAgentResponse } from '@/lib/logging/agent';
import { retryWithProtection, CircuitBreaker, RateLimiter } from '@/lib/retry';
import { env } from '@/config/env';
import type { AgentQuery, AgentResponse, ToolRegistry, RAGChunk, Tool, ToolContext, Result, ToolError } from './types';

const SYSTEM_PROMPT = `
You are Speedy Van's internal AI Agent, a sophisticated assistant designed to help users with logistics and moving services.

CORE RESPONSIBILITIES:
- Provide accurate information about Speedy Van services, policies, and procedures
- Execute tools when needed to fetch real-time data
- Maintain bilingual support (Arabic first, then English when user speaks Arabic)
- Always cite sources when providing information from documents

RESPONSE GUIDELINES:
- Be concise and professional
- When answering from docs, cite with (Doc:<basename>)
- If Arabic is detected, respond in Arabic first, then provide English summary
- Prefer executing tools for factual answers/actions
- If uncertain, ask for clarification rather than guessing

AVAILABLE TOOLS:
- pricing.calculate: Get real-time pricing for moving services
- booking.status: Check current booking status and details
- payment.status: Verify payment status and history
- notify.send: Send notifications to users or drivers

TOOL EXECUTION FORMAT:
If a tool is needed, respond with exactly: TOOL:<name>::<json_args>
Otherwise, provide a direct answer based on context and knowledge.
`;

// Circuit breakers for critical services
const circuitBreakers = {
  pricing: new CircuitBreaker(3, 30000), // 3 failures, 30s reset
  payments: new CircuitBreaker(2, 60000), // 2 failures, 60s reset
  bookings: new CircuitBreaker(5, 30000), // 5 failures, 30s reset
  notifications: new CircuitBreaker(10, 15000), // 10 failures, 15s reset
};

// Rate limiters for external APIs
const rateLimiters = {
  pricing: new RateLimiter(20, 1000), // 20 requests per second
  payments: new RateLimiter(10, 1000), // 10 requests per second
  bookings: new RateLimiter(30, 1000), // 30 requests per second
  notifications: new RateLimiter(50, 1000), // 50 requests per second
};

const TOOL_REGISTRY: ToolRegistry = {
  'pricing.calculate': {
    description: 'Calculate pricing for moving services based on items, distance, and service type',
    parameters: { items: 'array', distanceKm: 'number', serviceType: 'string', datetimeISO: 'string' },
    execute: async (args: any) => {
      return retryWithProtection(
        () => toolPricing(args),
        {
          timeoutMs: 10000,
          circuitBreaker: circuitBreakers.pricing,
          rateLimiter: rateLimiters.pricing,
          retryOptions: { retries: 2, baseMs: 500 }
        }
      );
    },
  },
  'booking.status': {
    description: 'Check the current status and details of a specific booking',
    parameters: { bookingId: 'string' },
    execute: async (args: any) => {
      return retryWithProtection(
        () => toolBookingStatus(args),
        {
          timeoutMs: 8000,
          circuitBreaker: circuitBreakers.bookings,
          rateLimiter: rateLimiters.bookings,
          retryOptions: { retries: 1, baseMs: 300 }
        }
      );
    },
  },
  'payment.status': {
    description: 'Verify payment status and transaction history',
    parameters: { paymentIntentId: 'string' },
    execute: async (args: any) => {
      return retryWithProtection(
        () => toolPaymentStatus(args),
        {
          timeoutMs: 12000,
          circuitBreaker: circuitBreakers.payments,
          rateLimiter: rateLimiters.payments,
          retryOptions: { retries: 3, baseMs: 1000 }
        }
      );
    },
  },
  'notify.send': {
    description: 'Send notifications to users or drivers via various channels',
    parameters: { channel: 'string', event: 'string', payload: 'object' },
    execute: async (args: any) => {
      return retryWithProtection(
        () => toolNotify(args),
        {
          timeoutMs: 5000,
          circuitBreaker: circuitBreakers.notifications,
          rateLimiter: rateLimiters.notifications,
          retryOptions: { retries: 1, baseMs: 200 }
        }
      );
    },
  },
};

// Intent classification with simple rules
function classifyIntent(query: string): { intent: string; confidence: number; tool?: string } {
  const q = query.toLowerCase();
  const keywords = {
    pricing: ['price', 'cost', 'سعر', 'تكلفة', 'estimate', 'quote', 'pricing'],
    booking: ['book', 'reserve', 'حجز', 'حجز', 'schedule', 'appointment', 'booking'],
    payment: ['pay', 'payment', 'دفع', 'invoice', 'billing', 'transaction'],
    notification: ['notify', 'alert', 'إشعار', 'message', 'sms', 'email'],
    status: ['status', 'check', 'حالة', 'track', 'progress', 'update'],
    help: ['help', 'support', 'مساعدة', 'guide', 'how', 'what'],
    general: ['hello', 'hi', 'مرحبا', 'thanks', 'thank you', 'goodbye']
  };

  let bestMatch = { intent: 'general', confidence: 0.5, tool: undefined };
  
  for (const [intent, words] of Object.entries(keywords)) {
    const matches = words.filter(word => q.includes(word)).length;
    const confidence = matches / words.length;
    
    if (confidence > bestMatch.confidence) {
      bestMatch = { intent, confidence, tool: intent === 'general' ? undefined : intent };
    }
  }

  return bestMatch;
}

export async function handleAgentQuery(input: AgentQuery): Promise<AgentResponse> {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  const log = withRequestId(requestId);
  
  let toolExecuted: string | null = null;
  let response: string;

  try {
    log.info({ message: input.message, tool: input.tool }, "Processing agent query");
    
    // 1) Intent classification for smart routing
    const intent = classifyIntent(input.message);
    log.info({ intent: intent.intent, confidence: intent.confidence }, "Intent classified");
    
    // 2) Direct tool call if specified
    if (input.tool && TOOL_REGISTRY[input.tool]) {
      const tool = TOOL_REGISTRY[input.tool];
      log.info({ toolName: input.tool }, "Executing direct tool call");
      
      const toolStartTime = Date.now();
      const result = await tool.execute(input);
      const toolDuration = Date.now() - toolStartTime;
      
      logToolExecution(
        input.tool,
        input,
        result,
        toolDuration,
        true,
        requestId
      );
      
      toolExecuted = input.tool;
      response = JSON.stringify(result, null, 2);
    } else {
      // 3) Smart tool selection based on intent
      let selectedTool: any = null;
      
      if (intent.tool && intent.confidence > 0.3) {
        const toolMap: Record<string, string> = {
          'pricing': 'pricing.calculate',
          'booking': 'booking.status',
          'payment': 'payment.status',
          'notification': 'notify.send'
        };
        
        const toolName = toolMap[intent.tool];
        if (toolName && TOOL_REGISTRY[toolName]) {
          selectedTool = TOOL_REGISTRY[toolName];
          log.info({ intent: intent.intent, toolName }, "Auto-selected tool based on intent");
        }
      }
      
      // 4) Execute selected tool or fallback to RAG
      if (selectedTool) {
        const toolStartTime = Date.now();
        const result = await selectedTool.execute({ query: input.message, ...input });
        const toolDuration = Date.now() - toolStartTime;
        
        logToolExecution(
          selectedTool.description,
          { query: input.message, ...input },
          result,
          toolDuration,
          true,
          requestId
        );
        
        toolExecuted = selectedTool.description;
        response = JSON.stringify(result, null, 2);
      } else {
        // 5) RAG retrieval process as fallback
        log.info({ intent: intent.intent }, "No tool match, using RAG fallback");
        
        const [queryVec] = await embed([input.message]);
        const hits = await topKFromDB(queryVec, 5);
        
        // Context formulation
        const context = hits
          .map((hit: RAGChunk) => `[# ${hit.docId.split('/').pop()}]\n${hit.chunk}`)
          .join('\n---\n\n');

        // LLM interaction with routing
        const userPrompt = `
User Query: ${input.message}

Retrieved Context (Top-5 Most Relevant Documents):
${context}

Available Tools:
${Object.entries(TOOL_REGISTRY)
  .map(([name, tool]) => `- ${name}: ${tool.description}`)
  .join('\n')}

Instructions:
If a tool is needed to fulfill the user's request, respond with exactly:
TOOL:<tool_name>::<json_arguments>

Otherwise, provide a comprehensive answer based on the context and your knowledge.
Always cite sources when using retrieved information.
`;

        response = await chatLLM(SYSTEM_PROMPT, [
          { role: 'user', content: userPrompt }
        ]);

        // Tool execution if LLM requests it
        const toolMatch = response.match(/^TOOL:([a-zA-Z0-9\.\-_]+)::(.+)/);
        if (toolMatch) {
          const [, toolName, jsonArgs] = toolMatch;
          const tool = TOOL_REGISTRY[toolName];
          
          if (tool) {
            try {
              const args = JSON.parse(jsonArgs);
              const result = await tool.execute(args);
              toolExecuted = toolName;
              response = JSON.stringify(result, null, 2);
            } catch (error) {
              response = `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
            }
          } else {
            response = `Tool not found: ${toolName}`;
          }
        }
      }
    }

    const processingTime = Date.now() - startTime;

    // Log the response
    await logAgentResponse({
      requestId,
      response,
      toolExecuted,
      processingTime,
      success: true,
      error: null,
      timestamp: new Date(),
    });

    log.info({ 
      processingTime, 
      intent: intent.intent, 
      confidence: intent.confidence,
      hasTool: !!toolExecuted 
    }, "Query processed successfully");

    return {
      text: response,
      toolExecuted,
      confidence: toolExecuted ? 0.95 : 0.85,
    };

  } catch (error) {
    const processingTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    response = `I apologize, but I encountered an error: ${errorMessage}`;

    logError(error, { 
      message: input.message, 
      tool: input.tool, 
      processingTime,
      intent: classifyIntent(input.message)
    }, requestId);

    // Log the response
    await logAgentResponse({
      requestId,
      response,
      toolExecuted,
      processingTime,
      success: false,
      error: errorMessage,
      timestamp: new Date(),
    });

    return {
      text: response,
      toolExecuted,
      confidence: 0.0,
    };
  }
}


