import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, customerName, customerEmail } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // هنا يمكنك إضافة منطق لحفظ رسالة الزائر في قاعدة البيانات
    const message = {
      id: `guest_msg_${Date.now()}`,
      content,
      senderId: 'user',
      senderName: customerName || 'Guest',
      timestamp: new Date().toISOString(),
      customerEmail: customerEmail || null,
      isGuestMessage: true
    };

    // إرسال الرسالة عبر Pusher (إذا كان متاحاً)
    try {
      const Pusher = require('pusher');
      const pusher = new Pusher({
        appId: process.env.PUSHER_APP_ID!,
        key: process.env.PUSHER_KEY!,
        secret: process.env.PUSHER_SECRET!,
        cluster: process.env.PUSHER_CLUSTER!,
        useTLS: true
      });

      await pusher.trigger('guest-chat', 'chat:new', message);
    } catch (pusherError) {
      console.error('Pusher error:', pusherError);
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error sending guest message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
