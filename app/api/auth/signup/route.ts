import { type NextRequest, NextResponse } from "next/server"
import { authService } from "@/lib/auth"
import { z } from "zod"

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  username: z.string().min(3, "Username must be at least 3 characters").optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, username } = signupSchema.parse(body)

    const result = await authService.signUp(email, password, username)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    const response = NextResponse.json({
      success: true,
      user: result.user,
      message: "Account created successfully",
    })

    // Set HTTP-only cookie
    response.cookies.set("auth-token", result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Signup error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
