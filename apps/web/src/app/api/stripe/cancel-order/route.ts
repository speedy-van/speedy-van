import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, reason = 'Customer cancelled on Stripe page' } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    console.log('🚫 Order cancellation requested for session:', sessionId);

    // For now, we'll need to find the booking by other means
    // Since stripeSessionId is not in the current schema, we'll use a placeholder approach
    // In a real implementation, you'd need to add this field to the schema or use metadata
    
    // For now, return an error indicating this feature needs schema updates
    return NextResponse.json(
      { error: 'Session-based cancellation not yet implemented. Schema update required.' },
      { status: 501 }
    );

  } catch (error) {
    console.error('❌ Error cancelling order:', error);
    return NextResponse.json(
      { error: 'Failed to cancel order' },
      { status: 500 }
    );
  }
}
