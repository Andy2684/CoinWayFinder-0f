import { type NextRequest, NextResponse } from "next/server";
import { emailService } from "@/lib/email-service";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { email, firstName } = await request.json();

    if (!email || !firstName) {
      return NextResponse.json(
        { error: "Email and firstName are required" },
        { status: 400 },
      );
    }

    // Generate test token
    const testToken = crypto.randomBytes(32).toString("hex");

    const emailSent = await emailService.sendPasswordResetEmail(
      email,
      testToken,
      firstName,
    );

    if (!emailSent) {
      return NextResponse.json(
        { error: "Failed to send reset email" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password reset email sent successfully!",
      testLink: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${testToken}`,
    });
  } catch (error) {
    console.error("Test reset email error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
