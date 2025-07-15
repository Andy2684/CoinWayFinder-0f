import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

// Mock users database - same as in other auth routes
const users = [
  {
    id: "1",
    email: "demo@coinwayfinder.com",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    firstName: "Demo",
    lastName: "User",
    username: "demo",
    role: "user",
    plan: "free",
    isVerified: true,
    permissions: {},
  },
  {
    id: "2",
    email: "admin@coinwayfinder.com",
    password: "$2a$10$8K1p/a9jNEFzfOOlGNNLSuA6YO/zJIWEjA8tGi3WCvDhcmKcKEHQS",
    firstName: "Admin",
    lastName: "User",
    username: "admin",
    role: "admin",
    plan: "enterprise",
    isVerified: true,
    permissions: {},
  },
]

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any

      // Find user by ID
      const user = users.find((u) => u.id === decoded.userId)
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      // Return user data without password
      const { password: _, ...userWithoutPassword } = user

      return NextResponse.json({
        success: true,
        user: userWithoutPassword,
      })
    } catch (jwtError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
