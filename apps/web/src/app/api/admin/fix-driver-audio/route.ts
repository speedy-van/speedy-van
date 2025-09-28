// Fix driver audio notifications - comprehensive solution
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@speedy-van/shared';
import Pusher from 'pusher';

// Initialize Pusher
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(request: NextRequest) {
  try {
    const { action, driverId } = await request.json();

    switch (action) {
      case 'test-audio':
        return testAudioNotification(driverId);
      case 'check-config':
        return checkNotificationConfig();
      case 'send-test-job':
        return sendTestJobNotification(driverId);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Audio notification fix error:', error);
    return NextResponse.json(
      { error: 'Failed to fix audio notifications' },
      { status: 500 }
    );
  }
}

async function testAudioNotification(driverId: string) {
  try {
    console.log(`🔊 Testing audio notification for driver: ${driverId}`);

    // Send test notification via Pusher
    await pusher.trigger(`driver-${driverId}`, 'test-audio', {
      type: 'test-audio',
      title: '🔊 اختبار الإشعارات الصوتية',
      message: 'هذا اختبار للتأكد من عمل الأصوات',
      timestamp: new Date().toISOString(),
      data: {
        testId: Date.now(),
        audioFile: '/audio/job-notification.m4a',
        volume: 0.8,
      }
    });

    // Also create database notification
    await prisma.driverNotification.create({
      data: {
        driverId,
        type: 'job_update',
        title: '🔊 اختبار الإشعارات الصوتية',
        message: 'تم إرسال اختبار للأصوات - يجب أن تسمع صوتاً الآن',
        read: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Test audio notification sent',
      channel: `driver-${driverId}`,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Test audio notification failed:', error);
    return NextResponse.json(
      { error: 'Failed to send test notification' },
      { status: 500 }
    );
  }
}

async function checkNotificationConfig() {
  try {
    const config = {
      pusher: {
        appId: !!process.env.PUSHER_APP_ID,
        key: !!process.env.PUSHER_KEY,
        secret: !!process.env.PUSHER_SECRET,
        cluster: process.env.PUSHER_CLUSTER,
        publicKey: !!process.env.NEXT_PUBLIC_PUSHER_KEY,
        publicCluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      },
      audio: {
        filePath: '/audio/job-notification.m4a',
        expectedLocation: 'apps/web/public/audio/job-notification.m4a',
      },
      recommendations: [],
    };

    // Check configuration issues
    if (!config.pusher.appId) config.recommendations.push('Missing PUSHER_APP_ID');
    if (!config.pusher.key) config.recommendations.push('Missing PUSHER_KEY');
    if (!config.pusher.secret) config.recommendations.push('Missing PUSHER_SECRET');
    if (!config.pusher.cluster) config.recommendations.push('Missing PUSHER_CLUSTER');
    if (!config.pusher.publicKey) config.recommendations.push('Missing NEXT_PUBLIC_PUSHER_KEY');

    return NextResponse.json({
      success: true,
      config,
      isConfigured: config.recommendations.length === 0,
    });

  } catch (error) {
    console.error('❌ Config check failed:', error);
    return NextResponse.json(
      { error: 'Failed to check configuration' },
      { status: 500 }
    );
  }
}

async function sendTestJobNotification(driverId: string) {
  try {
    console.log(`🚚 Sending test job notification to driver: ${driverId}`);

    const testJobData = {
      id: `test-job-${Date.now()}`,
      bookingReference: 'TEST-JOB',
      customerName: 'عميل تجريبي',
      customerPhone: '+44 1234 567890',
      pickupAddress: {
        label: 'تجربة - موقع الاستلام',
        postcode: 'SW1A 1AA',
        lat: 51.5014,
        lng: -0.1419,
      },
      dropoffAddress: {
        label: 'تجربة - موقع التسليم',
        postcode: 'SW1A 2AA',
        lat: 51.5074,
        lng: -0.1278,
      },
      scheduledDate: new Date().toISOString(),
      timeSlot: 'الآن',
      estimatedDuration: 30,
      distance: 2.5,
      totalAmount: 2500, // £25.00 in pence
      driverEarnings: 2125, // £21.25 in pence
      items: [
        { name: 'صندوق تجريبي', quantity: 1 }
      ],
    };

    // Send via Pusher with audio trigger
    await pusher.trigger(`driver-${driverId}`, 'new-job', {
      type: 'new-job',
      title: '🚚 وظيفة جديدة متاحة!',
      message: `تجربة - موقع الاستلام → تجربة - موقع التسليم | £21.25`,
      urgent: false,
      requiresInteraction: true,
      data: testJobData,
      audio: {
        play: true,
        sound: 'job-notification',
        volume: 0.8,
        filePath: '/audio/job-notification.m4a',
      },
      timestamp: new Date().toISOString(),
    });

    // Create database notification
    await prisma.driverNotification.create({
      data: {
        driverId,
        type: 'job_offer',
        title: '🚚 وظيفة تجريبية جديدة',
        message: `تجربة الإشعارات - يجب أن تسمع صوتاً وترى إشعار متصفح`,
        read: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Test job notification sent with audio',
      jobData: testJobData,
      channel: `driver-${driverId}`,
    });

  } catch (error) {
    console.error('❌ Test job notification failed:', error);
    return NextResponse.json(
      { error: 'Failed to send test job notification' },
      { status: 500 }
    );
  }
}