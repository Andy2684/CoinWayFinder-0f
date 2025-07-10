import { type NextRequest, NextResponse } from "next/server"
import { authService } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { emailOrUsername, password } = body

    if (!emailOrUsername || !password) {
      return NextResponse.json({ error: "Email/username and password are required" }, { status: 400 })
    }

    const { user, token } = await authService.signIn(emailOrUsername, password)

    // Set HTTP-only cookie
    const cookieStore = await cookies()
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        subscription: user.subscription,
      },
      token,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Sign in failed" }, { status: 401 })
  }
}
