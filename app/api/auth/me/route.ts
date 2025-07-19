import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

// Mock database - replace with real database
const users: any[] = [
  {
    id: "1",
    email: "demo@coinwayfinder.com",
    firstName: "Demo",
    lastName: "User",
    username: "demouser",
    role: "user",
    plan: "pro",
    isVerified: true,
  },
  {
    id: "2",
    email: "admin@coinwayfinder.com",
    firstName: "Admin",
    lastName: "User",
    username: "admin",
    role: "admin",
    plan: "enterprise",
    isVerified: true,
  },
]

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret-key") as any

      // Find user
      const user = users.find((u) => u.id === decoded.userId)
      if (!user) {
        return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        user,
      })
    } catch (jwtError) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
