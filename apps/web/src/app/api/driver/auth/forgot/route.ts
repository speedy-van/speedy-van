import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { logAudit } from '@/lib/audit';
import { prisma } from '@/lib/prisma';
import { unifiedEmailService } from '@/lib/email/UnifiedEmailService';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find user with driver role
    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        role: 'driver',
      },
      include: {
        driver: true,
      },
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({
        success: true,
        message:
          'If an account with that email exists, a password reset link has been sent.',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token in user record
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Log the password reset request
    await logAudit(user.id, 'driver_password_reset_requested', user.id, { targetType: 'auth', before: null, after: { email: user.email, resetToken } });

    // Send password reset email via ZeptoMail
    try {
      const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://speedy-van.co.uk'}/driver/reset?token=${resetToken}`;
      
      await unifiedEmailService.sendCustomerPasswordReset({
        driverName: user.name || 'Driver',
        email: user.email,
        resetToken,
        resetUrl,
      });
      console.log('✅ Driver password reset email sent successfully');
    } catch (emailError) {
      console.error('⚠️ Failed to send driver password reset email:', emailError);
      // Don't fail the request if email fails - token is still stored
    }

    return NextResponse.json({
      success: true,
      message:
        'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Driver forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
