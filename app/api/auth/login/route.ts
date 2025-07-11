import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

// Mock user database - replace with real database
const users = [
  {
    id: "1",
    email: "admin@coinwayfinder.com",
    password: "$2a$12$LQv3c1yqBWVHxkd0LQ4YCOdHrADFeKuqNF8gYiBvSUedpQgKj9A2.", // AdminPass123!
    firstName: "Admin",
    lastName: "User",
    username: "admin",
    role: "owner",
    plan: "enterprise",
    isEmailVerified: true,
    isActive: true,
    dateOfBirth: "1990-01-01",
    createdAt: "2024-01-01T00:00:00Z",
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
  {
    id: "2",
    email: "user@example.com",
    password: "$2a$12$LQv3c1yqBWVHxkd0LQ4YCOdHrADFeKuqNF8gYiBvSUedpQgKj9A2.", // UserPass123!
    firstName: "John",
    lastName: "Doe",
    username: "johndoe",
    role: "user",
    plan: "free",
    isEmailVerified: true,
    isActive: true,
    dateOfBirth: "1995-05-15",
    createdAt: "2024-01-15T00:00:00Z",
  },
]

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Find user
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json({ error: "Account is deactivated" }, { status: 401 })
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return NextResponse.json({ error: "Please verify your email before logging in" }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate JWT token
    const tokenExpiry = user.role === "owner" ? "30d" : "7d" // Owner gets longer sessions
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: tokenExpiry },
    )

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      token,
      user: userWithoutPassword,
      message: "Login successful",
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
