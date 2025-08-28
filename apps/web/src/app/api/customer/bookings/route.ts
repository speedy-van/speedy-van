import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { 
  getCustomerBookings, 
  linkExistingBookingsToCustomer, 
  getCustomerBookingStats 
} from '@/lib/customer-bookings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
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

    // Get customer bookings
    const bookings = await getCustomerBookings(userId);

    return NextResponse.json({
      success: true,
      ...bookings
    });

  } catch (error) {
    console.error('❌ Error fetching customer bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Login required' },
        { status: 401 }
      );
    }

    const { action, data } = await request.json();
    const userId = session.user.id;

    switch (action) {
      case 'link_existing':
        // Link existing bookings when customer creates account
        const { email, phone } = data;
        const linkingResult = await linkExistingBookingsToCustomer(userId, email, phone);
        
        return NextResponse.json({
          success: true,
          ...linkingResult
        });

      case 'get_stats':
        // Get booking statistics
        const stats = await getCustomerBookingStats(userId);
        
        return NextResponse.json({
          success: true,
          stats
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('❌ Error processing customer booking action:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
