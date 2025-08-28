import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { linkSpecificBooking } from '@/lib/customer-bookings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Login required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const bookingId = params.id;

    // Link the specific booking
    const result = await linkSpecificBooking(userId, bookingId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message
      });
    } else {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('❌ Error linking booking:', error);
    return NextResponse.json(
      { error: 'Failed to link booking' },
      { status: 500 }
    );
  }
}
