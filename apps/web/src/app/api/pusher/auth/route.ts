import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { socket_id, channel_name } = await request.json();

    if (!socket_id || !channel_name) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Validate channel name format
    const channelPattern =
      /^(private|presence)-(tracking|admin-tracking)(-\w+)?$/;
    if (!channelPattern.test(channel_name)) {
      return NextResponse.json(
        { error: 'Invalid channel name' },
        { status: 400 }
      );
    }

    // Check permissions based on channel type
    const userRole = (session.user as any).role;

    if (
      channel_name.startsWith('private-admin-tracking') &&
      userRole !== 'admin'
    ) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    if (
      channel_name.startsWith('private-tracking-') &&
      userRole !== 'driver' &&
      userRole !== 'customer'
    ) {
      return NextResponse.json(
        { error: 'Driver or customer access required' },
        { status: 403 }
      );
    }

    // For booking-specific channels, verify the user has access to that booking
    if (channel_name.includes('-')) {
      const bookingId = channel_name.split('-').pop();

      if (bookingId && userRole === 'customer') {
        // Verify customer owns this booking
        // This would require a database check in production
        // For now, we'll allow access
      } else if (bookingId && userRole === 'driver') {
        // Verify driver is assigned to this booking
        // This would require a database check in production
        // For now, we'll allow access
      }
    }

    // Generate auth response
    const authResponse = pusher.authorizeChannel(socket_id, channel_name);

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error('Pusher auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
