import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { logAudit } from '@/lib/audit';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
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
    await logAudit({
      action: 'password_reset_requested',
      targetType: 'auth',
      targetId: user.id,
      before: null,
      after: { email: user.email },
    });

    // TODO: Send email with reset link
    // The reset link would be: /auth/reset?token=${resetToken}
    // For now, we'll just return success
    // In production, you'd integrate with an email service like SendGrid, AWS SES, etc.

    return NextResponse.json({
      success: true,
      message:
        'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
