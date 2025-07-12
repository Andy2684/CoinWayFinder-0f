import { type NextRequest, NextResponse } from "next/server";
import { emailService } from "@/lib/email-service";

export async function POST(request: NextRequest) {
  try {
    const { email, firstName } = await request.json();

    if (!email || !firstName) {
      return NextResponse.json(
        { error: "Email and firstName are required" },
        { status: 400 },
      );
    }

    const emailSent = await emailService.sendWelcomeEmail(email, firstName);

    if (!emailSent) {
      return NextResponse.json(
        { error: "Failed to send welcome email" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Welcome email sent successfully!",
    });
  } catch (error) {
    console.error("Test welcome email error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
