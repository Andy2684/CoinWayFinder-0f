import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validation
    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 })
    }

    const result = await AuthService.signIn(email, password)

    if (result.success && result.user) {
      // Set auth cookie
      await AuthService.setUserCookie(result.user)

      return NextResponse.json({
        success: true,
        message: result.message,
        user: {
          id: result.user.id,
          email: result.user.email,
          username: result.user.username,
        },
      })
    } else {
      return NextResponse.json(result, { status: 401 })
    }
  } catch (error) {
    console.error("Signin error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
