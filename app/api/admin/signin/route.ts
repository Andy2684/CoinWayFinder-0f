import { type NextRequest, NextResponse } from "next/server"
import { authService } from "@/lib/auth"
import { z } from "zod"

const adminSigninSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = adminSigninSchema.parse(body)

    const result = await authService.adminSignIn(username, password)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 401 })
    }

    const response = NextResponse.json({
      success: true,
      admin: result.admin,
      message: "Admin signed in successfully",
    })

    // Set HTTP-only cookie for admin
    response.cookies.set("admin-token", result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 4 * 60 * 60, // 4 hours
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Admin signin error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
