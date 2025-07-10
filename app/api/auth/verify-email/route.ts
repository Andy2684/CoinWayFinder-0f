import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

// Mock databases - replace with real database
const users: any[] = []
const pendingVerifications: any[] = []

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Verification token is required" }, { status: 400 })
    }

    // Find user in pending verifications
    const userIndex = pendingVerifications.findIndex((u) => u.verificationToken === token)

    if (userIndex === -1) {
      return NextResponse.json({ error: "Invalid or expired verification token" }, { status: 400 })
    }

    const user = pendingVerifications[userIndex]

    // Check if token is not too old (24 hours)
    const tokenAge = Date.now() - new Date(user.createdAt).getTime()
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

    if (tokenAge > maxAge) {
      // Remove expired verification
      pendingVerifications.splice(userIndex, 1)
      return NextResponse.json({ error: "Verification token has expired" }, { status: 400 })
    }

    // Activate user
    const activatedUser = {
      ...user,
      isEmailVerified: true,
      isActive: true,
      verificationToken: null, // Remove token after verification
    }

    // Move user from pending to active users
    users.push(activatedUser)
    pendingVerifications.splice(userIndex, 1)

    // Generate JWT token for auto-login
    const authToken = jwt.sign(
      { userId: activatedUser.id, email: activatedUser.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" },
    )

    // Return user data (without password) and token
    const { password: _, verificationToken: __, ...userWithoutSensitiveData } = activatedUser

    return NextResponse.json({
      success: true,
      message: "Email verified successfully! You are now logged in.",
      token: authToken,
      user: userWithoutSensitiveData,
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

    // Find user in pending verifications
    const user = pendingVerifications.find((u) => u.email === email)

    if (!user) {
      return NextResponse.json({ error: "No pending verification found for this email" }, { status: 400 })
    }

    // Check if we can resend (limit to once every 5 minutes)
    const lastSent = user.lastVerificationSent || user.createdAt
    const timeSinceLastSent = Date.now() - new Date(lastSent).getTime()
    const minInterval = 5 * 60 * 1000 // 5 minutes

    if (timeSinceLastSent < minInterval) {
      const remainingTime = Math.ceil((minInterval - timeSinceLastSent) / 1000 / 60)
      return NextResponse.json(
        {
          error: `Please wait ${remainingTime} minutes before requesting another verification email`,
        },
        { status: 429 },
      )
    }

    // Update last sent time
    user.lastVerificationSent = new Date().toISOString()

    // Resend verification email (mock)
    console.log(`Verification email resent to ${email}`)
    console.log(
      `Verification link: ${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify-email?token=${user.verificationToken}`,
    )

    return NextResponse.json({
      success: true,
      message: "Verification email sent successfully!",
    })
  } catch (error) {
    console.error("Resend verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
