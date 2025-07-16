import { NextResponse } from "next/server"

export async function POST() {
  try {
    // In a real app with refresh tokens, you would blacklist the token here
    // For JWT tokens, we rely on client-side token removal
    return NextResponse.json({ success: true, message: "Logged out successfully" })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
