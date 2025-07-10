import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { pendingUsers, users, verificationTokens } from "../register/route"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Verification token is required" }, { status: 400 })
    }

    // Check if token exists and is not expired
    const tokenData = verificationTokens[token]
    if (!tokenData) {
      return NextResponse.json({ error: "Invalid or expired verification token" }, { status: 400 })
    }

    if (new Date() > tokenData.expires) {
      delete verificationTokens[token]
      return NextResponse.json({ error: "Verification token has expired" }, { status: 400 })
    }

    // Find user in pending users
    const userIndex = pendingUsers.findIndex((u) => u.id === tokenData.userId)
    if (userIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Move user from pending to verified users
    const user = pendingUsers[userIndex]
    user.isEmailVerified = true
    user.isActive = true
    user.verifiedAt = new Date().toISOString()

    // Remove from pending and add to verified users
    pendingUsers.splice(userIndex, 1)
    users.push(user)

    // Clean up verification token
    delete verificationTokens[token]

    // Generate JWT token for auto-login
    const authToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" },
    )

    // Return user data (without password) and auth token
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      message: "Email verified successfully! You are now logged in.",
      token: authToken,
      user: userWithoutPassword,
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

    // Find user in pending users
    const user = pendingUsers.find((u) => u.email === email.toLowerCase())
    if (!user) {
      return NextResponse.json({ error: "No pending verification found for this email" }, { status: 404 })
    }

    // Check if user already has a recent verification token
    const existingToken = Object.entries(verificationTokens).find(
      ([_, data]) => data.userId === user.id && new Date() < data.expires,
    )

    if (existingToken) {
      const timeLeft = Math.ceil((existingToken[1].expires.getTime() - Date.now()) / (1000 * 60))
      return NextResponse.json(
        {
          error: `Please wait ${timeLeft} minutes before requesting another verification email`,
        },
        { status: 429 },
      )
    }

    // Generate new verification token
    const crypto = require("crypto")
    const verificationToken = crypto.randomBytes(32).toString("hex")
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Store verification token
    verificationTokens[verificationToken] = {
      userId: user.id,
      expires: tokenExpires,
    }

    // Send verification email
    const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/auth/verify-email?token=${verificationToken}`

    console.log(`
      📧 RESEND EMAIL VERIFICATION
      To: ${email}
      Subject: Verify your CoinWayFinder account
      
      Click here to verify your account: ${verificationLink}
      
      This link expires in 24 hours.
    `)

    return NextResponse.json({
      success: true,
      message: "Verification email sent! Please check your inbox.",
    })
  } catch (error) {
    console.error("Resend verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
