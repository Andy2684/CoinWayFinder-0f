import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

// Admin/Owner account - replace with your actual credentials
const adminUsers = [
  {
    id: "admin-001",
    email: "admin@coinwayfinder.com", // Change this to your email
    password: "$2a$12$LQv3c1yqBwlVHpPjrU3HvOAnqh9CX6oj6oIrklb3OqHJ7S1o.s1yW", // "AdminPass123!" - Change this
    firstName: "Admin",
    lastName: "User",
    username: "admin",
    dateOfBirth: "1990-01-01",
    isEmailVerified: true,
    isActive: true,
    role: "owner",
    plan: "enterprise" as const,
    permissions: [
      "full_access",
      "admin_panel",
      "user_management",
      "system_settings",
      "all_exchanges",
      "unlimited_bots",
      "advanced_analytics",
      "priority_support",
    ],
    createdAt: "2024-01-01T00:00:00Z",
  },
]

// Regular users database
const users: any[] = []

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Check admin users first
    const adminUser = adminUsers.find((u) => u.email === email)
    if (adminUser) {
      const isValidPassword = await bcrypt.compare(password, adminUser.password)
      if (!isValidPassword) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }

      // Generate JWT token for admin
      const token = jwt.sign(
        {
          userId: adminUser.id,
          email: adminUser.email,
          role: adminUser.role,
          permissions: adminUser.permissions,
        },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "30d" }, // Longer session for admin
      )

      const { password: _, ...userWithoutPassword } = adminUser

      return NextResponse.json({
        success: true,
        token,
        user: userWithoutPassword,
      })
    }

    // Check regular users
    const user = users.find((u) => u.email === email && u.isEmailVerified && u.isActive)
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials or account not verified" }, { status: 401 })
    }

    // Check password for regular users
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate JWT token for regular user
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role || "user",
        permissions: user.permissions || ["basic_access"],
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" },
    )

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      token,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
