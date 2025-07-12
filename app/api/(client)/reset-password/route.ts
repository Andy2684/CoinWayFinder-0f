import { type NextRequest, NextResponse } from "next/server"

// In-memory storage for demo (use database in production)
const users: any[] = []
const resetTokens: any[] = []

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 })
    }

    // Find and validate reset token
    const tokenIndex = resetTokens.findIndex((t) => t.token === token && t.expiry > new Date())

    if (tokenIndex === -1) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 })
    }

    const resetTokenData = resetTokens[tokenIndex]

    // Find user
    const userIndex = users.findIndex((u) => u.id === resetTokenData.userId)
    if (userIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update password (in production, hash the password)
    users[userIndex].password = password
    users[userIndex].passwordUpdatedAt = new Date()

    // Remove used reset token
    resetTokens.splice(tokenIndex, 1)

    return NextResponse.json({
      message: "Password has been reset successfully",
    })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
