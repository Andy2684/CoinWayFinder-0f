import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { emailService } from "@/lib/email-service"

// Import the users arrays (in production, use database)
const users: any[] = []
const pendingUsers: any[] = []

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Verification token is required" }, { status: 400 })
    }

    // Find user with this token
    const userIndex = pendingUsers.findIndex(
      (user) => user.verificationToken === token && user.tokenExpiry > new Date(),
    )

    if (userIndex === -1) {
      return NextResponse.json({ error: "Invalid or expired verification token" }, { status: 400 })
    }

    // Move user from pending to active users
    const user = pendingUsers[userIndex]
    user.isVerified = true
    user.verificationToken = null
    user.tokenExpiry = null
    user.verifiedAt = new Date()

    users.push(user)
    pendingUsers.splice(userIndex, 1)

    // Send welcome email
    await emailService.sendWelcomeEmail(user.email, user.firstName)

    // Generate JWT token for auto-login
    const authToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        plan: user.plan,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" },
    )

    return NextResponse.json({
      success: true,
      message: "Email verified successfully! You are now logged in.",
      token: authToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        role: user.role,
        plan: user.plan,
        isVerified: user.isVerified,
      },
    })
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Find pending user
    const user = pendingUsers.find((u) => u.email === email)
    if (!user) {
      return NextResponse.json({ error: "No pending verification found for this email" }, { status: 404 })
    }

    // Check rate limiting (prevent spam)
    const lastResent = user.lastResent || new Date(0)
    const timeSinceLastResent = Date.now() - lastResent.getTime()
    if (timeSinceLastResent < 60000) {
      // 1 minute
      return NextResponse.json({ error: "Please wait before requesting another verification email" }, { status: 429 })
    }

    // Update last resent time
    user.lastResent = new Date()

    // Resend verification email
    const emailSent = await emailService.sendVerificationEmail(user.email, user.verificationToken, user.firstName)

    if (!emailSent) {
      return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Verification email resent successfully!",
    })
  } catch (error) {
    console.error("Resend verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
