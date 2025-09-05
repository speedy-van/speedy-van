import { NextRequest, NextResponse } from 'next/server';
import { handleAgentQuery } from '@/agent/router';
import { AgentQuery, AgentContext } from '@/agent/types';

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId, customerId, context } = await request.json();

    if (!message || !sessionId || !customerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // إعداد سياق AI Agent للعملاء
    const agentContext: AgentContext = {
      userId: customerId,
      sessionId,
      mode: 'customer',
      permissions: ['read', 'write'],
      context: context || 'customer_chat',
      metadata: {
        source: 'customer_chat',
        sessionId,
        timestamp: new Date().toISOString(),
      },
    };

    // إعداد استعلام AI Agent
    const agentQuery: AgentQuery = {
      message: message.trim(),
      language: 'ar', // اللغة العربية للعملاء
      context: agentContext,
    };

    // معالجة الرسالة مع AI Agent
    const response = await handleAgentQuery(agentQuery);

    return NextResponse.json({
      success: true,
      response: response.response,
      metadata: {
        toolUsed: response.toolUsed,
        confidence: response.metadata?.confidence || 0.8,
        processingTime: response.metadata?.processingTime || 0,
        tokensUsed: response.metadata?.tokensUsed || 0,
      },
    });

  } catch (error) {
    console.error('AI Agent Chat Error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to process message with AI Agent',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
