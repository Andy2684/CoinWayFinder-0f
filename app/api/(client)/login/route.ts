import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

// Mock users for demo
const mockUsers = [
  {
    id: "1",
    email: "demo@coinwayfinder.com",
    password: "password",
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
    password: "admin123",
    firstName: "Admin",
    lastName: "User",
    username: "admin",
    role: "admin",
    plan: "enterprise",
    isVerified: true,
    permissions: {
      fullAccess: true,
      manageUsers: true,
      systemSettings: true,
      allExchanges: true,
      unlimitedBots: true,
      advancedAnalytics: true,
      prioritySupport: true,
    },
  },
]

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Find user
    const user = mockUsers.find((u) => u.email === email && u.password === password)

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" },
    )

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      token,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
