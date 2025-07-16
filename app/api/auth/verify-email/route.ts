import { type NextRequest, NextResponse } from "next/server"

// Mock pending users database
const pendingUsers: any[] = []
const users: any[] = []

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ success: false, error: "Verification token is required" }, { status: 400 })
    }

    // Find pending user with this token
    const pendingUserIndex = pendingUsers.findIndex(
      (user) => user.verificationToken === token && new Date() < new Date(user.tokenExpiry),
    )

    if (pendingUserIndex === -1) {
      return NextResponse.json({ success: false, error: "Invalid or expired verification token" }, { status: 400 })
    }

    // Move user from pending to verified users
    const user = pendingUsers[pendingUserIndex]
    user.isVerified = true
    user.verificationToken = null
    user.tokenExpiry = null

    users.push(user)
    pendingUsers.splice(pendingUserIndex, 1)

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
    })
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
