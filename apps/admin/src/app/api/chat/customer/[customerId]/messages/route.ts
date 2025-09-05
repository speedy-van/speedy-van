import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { customerId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.id !== params.customerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // هنا يمكنك إضافة منطق لجلب الرسائل من قاعدة البيانات
    // حالياً سنعيد مصفوفة فارغة
    const messages = [];

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching customer messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { customerId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.id !== params.customerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // هنا يمكنك إضافة منطق لحفظ الرسالة في قاعدة البيانات
    const message = {
      id: `msg_${Date.now()}`,
      content,
      senderId: 'user',
      senderName: session.user?.name || 'Customer',
      timestamp: new Date().toISOString(),
      customerId: params.customerId,
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

      await pusher.trigger(
        `customer-${params.customerId}`,
        'chat:new',
        message
      );
    } catch (pusherError) {
      console.error('Pusher error:', pusherError);
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error sending customer message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
