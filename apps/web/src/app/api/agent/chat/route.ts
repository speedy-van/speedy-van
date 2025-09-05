import { NextRequest, NextResponse } from 'next/server';
import { handleAgentQuery } from '@/agent/router';
import { logAgentRequest } from '@/lib/logging/agent';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();
    
    // Parse request body
    const body = await request.json();
    const { message, tool, userId, sessionId } = body;

    // Validate required fields
    if (!message && !tool) {
      return NextResponse.json(
        { error: 'Message or tool parameter is required' },
        { status: 400 }
      );
    }

    // Log the request
    await logAgentRequest({
      requestId,
      message: message || null,
      tool: tool || null,
      userId: userId || null,
      sessionId: sessionId || null,
      timestamp: new Date(),
    });

    // Process the agent query
    const result = await handleAgentQuery({ 
      message: message || '', 
      tool: tool || null,
      userId,
      sessionId,
    });

    const processingTime = Date.now() - startTime;

    // Log successful response
    console.log(`Agent request processed in ${processingTime}ms`, {
      requestId,
      message: message?.substring(0, 100),
      tool,
      processingTime,
    });

    return NextResponse.json({
      success: true,
      data: result,
      metadata: {
        requestId,
        processingTime,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Agent API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Speedy Van AI Agent is running',
    version: '1.0.0',
    capabilities: [
      'RAG-powered responses',
      'Tool execution',
      'Bilingual support (Arabic/English)',
      'Real-time information retrieval',
    ],
    endpoints: {
      chat: 'POST /api/agent/chat',
    },
  });
}
