import { type NextRequest, NextResponse } from "next/server"
import { createUser, generateToken, validateEmail, validatePassword } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, username } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: "Password validation failed", details: passwordValidation.errors },
        { status: 400 },
      )
    }

    // Test database connection
    try {
      await connectToDatabase()
    } catch (dbError) {
      console.error("Database connection failed:", dbError)
      return NextResponse.json({ error: "Database connection failed. Please try again later." }, { status: 503 })
    }

    // Create user
    try {
      const user = await createUser({ email, password, username })

      // Generate JWT token
      const token = generateToken(user)

      // Create response
      const response = NextResponse.json({
        success: true,
        message: "Account created successfully",
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          created_at: user.created_at,
        },
      })

      // Set HTTP-only cookie
      response.cookies.set("auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      })

      return response
    } catch (createError: any) {
      if (createError.message === "User already exists") {
        return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 })
      }
      throw createError
    }
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "An unexpected error occurred. Please try again." }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}
