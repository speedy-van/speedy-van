import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { enabled } = await request.json();

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        {
          error: 'Enabled status is required',
        },
        { status: 400 }
      );
    }

    // In a real application, you would store this in a configuration table
    // For now, we'll just return success
    // TODO: Implement configuration storage

    return NextResponse.json({
      success: true,
      message: `Auto-assignment ${enabled ? 'enabled' : 'disabled'}`,
      data: {
        enabled,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Auto-assign toggle error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In a real application, you would fetch this from a configuration table
    // For now, return default settings
    const config = {
      enabled: true,
      rules: {
        radius: 5000, // 5km
        vehicleType: 'any',
        capacity: 'any',
        loadLimit: 'any',
        rating: 4.0,
        maxJobs: 3,
      },
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error('Get auto-assign config error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
