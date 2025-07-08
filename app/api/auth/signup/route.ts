import { type NextRequest, NextResponse } from "next/server"
import { authManager } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: "Password must be at least 6 characters" }, { status: 400 })
    }

    const result = await authManager.signUp(email, password, name)

    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    // Generate token and set cookie
    const token = authManager.generateToken(email)
    const cookieStore = await cookies()

    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return NextResponse.json({
      success: true,
      user: result.user,
      message: "Account created successfully! 3-day free trial activated.",
    })
  } catch (error) {
    console.error("Signup API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
