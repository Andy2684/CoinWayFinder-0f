import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

// Mock user database - replace with real database
const users: any[] = []

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Verification token is required" }, { status: 400 })
    }

    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any

      // Find user by email
      const user = users.find((u) => u.email === decoded.email)
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      // Check if already verified
      if (user.isEmailVerified) {
        return NextResponse.json({ error: "Email already verified" }, { status: 400 })
      }

      // Verify the email
      user.isEmailVerified = true
      user.emailVerificationToken = null

      return NextResponse.json({
        success: true,
        message: "Email verified successfully. You can now log in.",
      })
    } catch (jwtError) {
      return NextResponse.json({ error: "Invalid or expired verification token" }, { status: 400 })
    }
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

    // Find user
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return NextResponse.json({ error: "Email already verified" }, { status: 400 })
    }

    // Generate new verification token
    const newToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET || "your-secret-key", {
      expiresIn: "24h",
    })

    user.emailVerificationToken = newToken

    // In a real app, you would send an email here
    console.log(`New email verification link: /auth/verify-email?token=${newToken}`)

    return NextResponse.json({
      success: true,
      message: "Verification email sent successfully.",
    })
  } catch (error) {
    console.error("Resend verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
