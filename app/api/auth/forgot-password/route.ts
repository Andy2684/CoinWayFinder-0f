import { type NextRequest, NextResponse } from "next/server";
import { emailService } from "@/lib/email-service";
import crypto from "crypto";

// In-memory storage for demo (use database in production)
const users: any[] = [];
const resetTokens: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find user by email
    const user = users.find((u) => u.email === email && u.isVerified);

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({
        message:
          "If an account with that email exists, we've sent a password reset link.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Remove any existing reset tokens for this user
    const existingTokenIndex = resetTokens.findIndex(
      (t) => t.userId === user.id,
    );
    if (existingTokenIndex > -1) {
      resetTokens.splice(existingTokenIndex, 1);
    }

    // Store reset token
    resetTokens.push({
      userId: user.id,
      email: user.email,
      token: resetToken,
      expiry: tokenExpiry,
      createdAt: new Date(),
    });

    // Send reset email
    const emailSent = await emailService.sendPasswordResetEmail(
      email,
      resetToken,
      user.firstName,
    );

    if (!emailSent) {
      // Remove token if email fails
      const tokenIndex = resetTokens.findIndex((t) => t.token === resetToken);
      if (tokenIndex > -1) resetTokens.splice(tokenIndex, 1);
      return NextResponse.json(
        { error: "Failed to send reset email" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message:
        "If an account with that email exists, we've sent a password reset link.",
      resetLink: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`, // For demo purposes
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
