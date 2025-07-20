import { type NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

// Mock database - in production, use a real database
const users: any[] = [
  {
    id: "1",
    email: "demo@coinwayfinder.com",
    password: "password",
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
    password: "AdminPass123!",
    firstName: "Admin",
    lastName: "User",
    username: "admin_user",
    role: "admin",
    plan: "enterprise",
    isVerified: true,
  },
]

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          error: "No token provided",
          message: "Authentication required",
        },
        { status: 401 },
      )
    }

    const token = authHeader.substring(7) // Remove "Bearer " prefix

    // Simple token validation (in production, use proper JWT verification)
    if (!token.startsWith("token_")) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid token",
          message: "Invalid authentication token",
        },
        { status: 401 },
      )
    }

    // Extract user ID from token
    const userId = token.split("_")[1]
    const user = users.find((u) => u.id === userId)

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
          message: "User not found",
        },
        { status: 404 },
      )
    }

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "An error occurred during authentication check",
      },
      { status: 500 },
    )
  }
}
