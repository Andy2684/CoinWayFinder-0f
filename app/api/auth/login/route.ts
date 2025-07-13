import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

// Admin users with full access
const adminUsers = [
  {
    id: "admin-001",
    email: "admin@coinwayfinder.com",
    password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSforHgK", // AdminPass123!
    firstName: "Admin",
    lastName: "User",
    username: "admin",
    role: "owner",
    plan: "enterprise",
    isVerified: true,
    createdAt: new Date("2024-01-01"),
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

// Mock regular users database
const users: any[] = []

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Check admin users first
    const adminUser = adminUsers.find((user) => user.email === email)
    if (adminUser) {
      const isValidPassword = await bcrypt.compare(password, adminUser.password)
      if (isValidPassword) {
        const token = jwt.sign(
          {
            userId: adminUser.id,
            email: adminUser.email,
            role: adminUser.role,
            plan: adminUser.plan,
            permissions: adminUser.permissions,
          },
          process.env.JWT_SECRET || "your-secret-key",
          { expiresIn: "30d" }, // 30 days for admin
        )

        return NextResponse.json({
          success: true,
          token,
          user: {
            id: adminUser.id,
            email: adminUser.email,
            firstName: adminUser.firstName,
            lastName: adminUser.lastName,
            username: adminUser.username,
            role: adminUser.role,
            plan: adminUser.plan,
            isVerified: adminUser.isVerified,
            permissions: adminUser.permissions,
          },
        })
      }
    }

    // Check regular users
    const user = users.find((u) => u.email === email && u.isVerified)
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials or account not verified" }, { status: 401 })
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role || "user",
        plan: user.plan || "free",
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" },
    )

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        role: user.role || "user",
        plan: user.plan || "free",
        isVerified: user.isVerified,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
