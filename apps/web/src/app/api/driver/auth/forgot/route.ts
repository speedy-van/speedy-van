import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { logAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find user with driver role
    const user = await prisma.user.findFirst({
      where: { 
        email: email.toLowerCase(),
        role: "driver"
      },
      include: {
        driver: true
      }
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({
        success: true,
        message: "If an account with that email exists, a password reset link has been sent."
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token in user record (you might want to add these fields to the User model)
    // For now, we'll use a simple approach with the existing fields
    // In production, you'd want to add resetToken and resetTokenExpiry fields to the User model
    
    // Log the password reset request
    await logAudit({ 
      action: "driver_password_reset_requested", 
      targetType: "auth", 
      targetId: user.id, 
      before: null, 
      after: { email: user.email } 
    });

    // TODO: Send email with reset link
    // The reset link would be: /driver/reset?token=${resetToken}
    // For now, we'll just return success

    return NextResponse.json({
      success: true,
      message: "If an account with that email exists, a password reset link has been sent."
    });

  } catch (error) {
    console.error("Driver forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
