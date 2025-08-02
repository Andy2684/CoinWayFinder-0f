import { type NextRequest, NextResponse } from "next/server"
import { createUser, getUserByEmail } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, username, password } = await request.json()

    // Validate input
    if (!email || !username || !password) {
      return NextResponse.json({ error: "Email, username, and password are required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
    }

    // Validate password requirements
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 })
    }

    if (!/[A-Z]/.test(password)) {
      return NextResponse.json({ error: "Password must contain at least one uppercase letter" }, { status: 400 })
    }

    if (!/[a-z]/.test(password)) {
      return NextResponse.json({ error: "Password must contain at least one lowercase letter" }, { status: 400 })
    }

    if (!/\d/.test(password)) {
      return NextResponse.json({ error: "Password must contain at least one number" }, { status: 400 })
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return NextResponse.json({ error: "Password must contain at least one special character" }, { status: 400 })
    }

    // Validate username
    if (username.length < 3) {
      return NextResponse.json({ error: "Username must be at least 3 characters long" }, { status: 400 })
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json(
        { error: "Username can only contain letters, numbers, and underscores" },
        { status: 400 },
      )
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 })
    }

    // Create user
    const user = await createUser({
      email,
      username,
      password,
      isEmailVerified: false,
    })

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Signup error:", error)

    // Handle specific database connection errors
    if (error instanceof Error) {
      if (
        error.message.includes("Unable to connect to database") ||
        error.message.includes("EBADNAME") ||
        error.message.includes("getaddrinfo ENOTFOUND")
      ) {
        return NextResponse.json({ error: "Unable to connect to database. Please try again later." }, { status: 503 })
      }

      if (error.message.includes("duplicate key") || error.message.includes("E11000")) {
        return NextResponse.json({ error: "An account with this email or username already exists" }, { status: 409 })
      }
    }

    return NextResponse.json({ error: "Internal server error. Please try again later." }, { status: 500 })
  }
}
