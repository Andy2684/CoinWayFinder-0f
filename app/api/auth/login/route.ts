import { type NextRequest, NextResponse } from "next/server"

// Mock database - in production, use a real database
const users: any[] = [
  {
    id: "1",
    email: "demo@coinwayfinder.com",
    password: "password", // Plain text for demo - in production use hashed passwords
    firstName: "Demo",
    lastName: "User",
    username: "demo_user",
    role: "user",
    plan: "free",
    isVerified: true,
  },
  {
    id: "2",
    email: "admin@coinwayfinder.com",
    password: "AdminPass123!", // Plain text for demo
    firstName: "Admin",
    lastName: "User",
    username: "admin_user",
    role: "admin",
    plan: "enterprise",
    isVerified: true,
  },
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log("Login attempt:", { email, password })

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Email and password are required",
          message: "Email and password are required",
        },
        { status: 400 },
      )
    }

    // Find user
    const user = users.find((u) => u.email === email)
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password",
          message: "Invalid email or password",
        },
        { status: 401 },
      )
    }

    // Check password (plain text comparison for demo)
    if (user.password !== password) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password",
          message: "Invalid email or password",
        },
        { status: 401 },
      )
    }

    // Generate simple token (in production, use proper JWT)
    const token = `token_${user.id}_${Date.now()}`

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      token,
      user: userWithoutPassword,
      message: "Login successful",
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "An error occurred during login. Please try again.",
      },
      { status: 500 },
    )
  }
}
