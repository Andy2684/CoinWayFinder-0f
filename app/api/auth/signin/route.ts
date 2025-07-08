import { type NextRequest, NextResponse } from "next/server"
import { AuthManager } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validation
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Authenticate user
    const { user, token } = await AuthManager.authenticateUser(email, password)

    // Set cookie
    const response = NextResponse.json({
      success: true,
      user,
      message: "Signed in successfully",
    })

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error: any) {
    console.error("Signin error:", error)
    return NextResponse.json({ error: error.message || "Failed to sign in" }, { status: 401 })
  }
}
