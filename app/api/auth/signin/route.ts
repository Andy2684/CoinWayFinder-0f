import { type NextRequest, NextResponse } from "next/server"
import { authManager } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 })
    }

    const result = await authManager.signIn(email, password)

    if (!result.success) {
      return NextResponse.json(result, { status: 401 })
    }

    // Set auth cookie
    const cookieStore = await cookies()
    cookieStore.set("auth-token", result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return NextResponse.json({
      success: true,
      user: result.user,
      message: "Signed in successfully!",
    })
  } catch (error) {
    console.error("Signin API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
