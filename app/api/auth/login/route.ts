import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 })
    }

    // Find user by email
    const user = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1)

    if (!user.length) {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 })
    }

    const foundUser = user[0]

    // Check if user is active
    if (!foundUser.isActive) {
      return NextResponse.json({ success: false, error: "Account is deactivated" }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, foundUser.passwordHash)

    if (!isValidPassword) {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 })
    }

    // Update last login
    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, foundUser.id))

    // Generate JWT token
    const token = jwt.sign(
      { userId: foundUser.id, email: foundUser.email, role: foundUser.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" },
    )

    // Remove password from user object
    const { passwordHash: _, ...userWithoutPassword } = foundUser

    return NextResponse.json({
      success: true,
      token,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
