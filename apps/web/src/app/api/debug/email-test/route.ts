import { NextRequest, NextResponse } from 'next/server';
import { unifiedEmailService } from '@/lib/email/UnifiedEmailService';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    console.log('📧 Testing unified email service...');

    // Use unified email service for testing
    const result = await unifiedEmailService.sendNotificationEmail({
      email,
      customerName: 'Test User',
      templateId: 'email-test',
      testMessage: 'This is a test email to verify the unified email service is working correctly.',
      sentAt: new Date().toISOString(),
      bookingReference: 'TEST-' + Date.now()
    });

    console.log('📧 Email test result:', result);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully via unified service',
        messageId: result.messageId,
        provider: result.provider,
        sentTo: email,
        sentAt: new Date().toISOString()
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Email test failed',
        details: result
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Email test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Email test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
