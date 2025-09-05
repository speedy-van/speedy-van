import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    // هنا يمكنك إضافة منطق لجلب رسائل الحجز من قاعدة البيانات
    // حالياً سنعيد مصفوفة فارغة
    const messages = [];

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching booking messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // هنا يمكنك إضافة منطق لحفظ رسالة الحجز في قاعدة البيانات
    const message = {
      id: `booking_msg_${Date.now()}`,
      content,
      senderId: 'user',
      senderName: 'Customer',
      timestamp: new Date().toISOString(),
      bookingId: params.bookingId,
    };

    // إرسال الرسالة عبر Pusher (إذا كان متاحاً)
    try {
      const Pusher = require('pusher');
      const pusher = new Pusher({
        appId: process.env.PUSHER_APP_ID!,
        key: process.env.PUSHER_KEY!,
        secret: process.env.PUSHER_SECRET!,
        cluster: process.env.PUSHER_CLUSTER!,
        useTLS: true,
      });

      await pusher.trigger(`booking-${params.bookingId}`, 'chat:new', message);
    } catch (pusherError) {
      console.error('Pusher error:', pusherError);
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error sending booking message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
