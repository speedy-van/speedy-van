import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { unifiedEmailService } from '@/lib/email/UnifiedEmailService';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    console.log('📧 Customer password reset request for:', email);

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    // Find customer user
    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        role: 'customer',
      },
    });

    if (!user) {
      console.log('❌ Customer not found for password reset:', email);
      // For security, we don't reveal if the email exists or not
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, you will receive reset instructions.',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Send reset email
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/customer/reset?token=${resetToken}`;

    await unifiedEmailService.sendCustomerPasswordReset({
      email: user.email,
      resetUrl,
      customerName: user.name || 'Valued Customer',
    });

    console.log('✅ Password reset email sent to:', email);

    return NextResponse.json({
      success: true,
      message: 'Password reset instructions have been sent to your email.',
    });

  } catch (error) {
    console.error('❌ Customer password reset error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
