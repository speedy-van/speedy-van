import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // For now, return empty conversations as chat system is not fully implemented
    // This is a placeholder for when chat functionality is added
    const conversations: any[] = [];

    return NextResponse.json({
      conversations,
      total: 0,
    });
  } catch (error) {
    console.error('Admin chat conversations GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
