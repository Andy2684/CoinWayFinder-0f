import { type NextRequest, NextResponse } from "next/server";
import { emailService } from "@/lib/email-service";
import crypto from "crypto";

// In-memory storage for demo (use database in production)
const users: any[] = [];
const pendingUsers: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      username,
      dateOfBirth,
      acceptTerms,
    } = await request.json();

    if (
      !email ||
      !password ||
      !firstName ||
      !lastName ||
      !username ||
      !dateOfBirth ||
      !acceptTerms
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = users.find(
      (u) => u.email === email || u.username === username,
    );
    const existingPendingUser = pendingUsers.find(
      (u) => u.email === email || u.username === username,
    );

    if (existingUser || existingPendingUser) {
      return NextResponse.json(
        { error: "User with this email or username already exists" },
        { status: 409 },
      );
    }

    // Validate age (must be 18+)
    const birthDate = new Date(dateOfBirth);
    const eighteenYearsAgo = new Date();
    eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);

    if (birthDate > eighteenYearsAgo) {
      return NextResponse.json(
        { error: "You must be at least 18 years old" },
        { status: 400 },
      );
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create pending user
    const pendingUser = {
      id: Date.now().toString(),
      email,
      password, // In production, hash this password
      firstName,
      lastName,
      username,
      dateOfBirth,
      role: "user",
      plan: "free",
      isVerified: false,
      verificationToken,
      tokenExpiry,
      createdAt: new Date(),
    };

    pendingUsers.push(pendingUser);

    // Send verification email
    const emailSent = await emailService.sendVerificationEmail(
      email,
      verificationToken,
      firstName,
    );

    if (!emailSent) {
      // Remove from pending users if email fails
      const index = pendingUsers.findIndex((u) => u.email === email);
      if (index > -1) pendingUsers.splice(index, 1);
      return NextResponse.json(
        { error: "Failed to send verification email" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Registration successful! Please check your email to verify your account.",
      email: email,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
