import { type NextRequest, NextResponse } from "next/server"
import { authService } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    const { admin, token } = await authService.adminSignIn(username, password)

    // Set HTTP-only cookie
    const cookieStore = await cookies()
    cookieStore.set("admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60, // 24 hours
    })

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
      },
      token,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Admin sign in failed" }, { status: 401 })
  }
}
