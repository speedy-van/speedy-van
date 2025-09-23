import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const conversationId = params.id;

    // For now, return empty messages as chat system is not fully implemented
    // This is a placeholder for when chat functionality is added
    const messages: any[] = [];

    return NextResponse.json({
      messages,
      total: 0,
    });
  } catch (error) {
    console.error('Admin chat messages GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const conversationId = params.id;
    const { message } = await request.json();

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // For now, return a mock response as chat system is not fully implemented
    // This is a placeholder for when chat functionality is added
    const newMessage = {
      id: `msg_${Date.now()}`,
      senderId: authResult.id,
      senderName: authResult.name,
      senderRole: 'admin',
      message: message.trim(),
      timestamp: new Date().toISOString(),
      read: false,
    };

    return NextResponse.json({
      message: newMessage,
      success: true,
    });
  } catch (error) {
    console.error('Admin chat send message error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
