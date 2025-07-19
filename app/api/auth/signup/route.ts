import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

// Mock user database - replace with real database
const users: any[] = []

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, acceptTerms } = await request.json()

    if (!name || !email || !password || !acceptTerms) {
      return NextResponse.json({ error: "All fields are required and terms must be accepted" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = users.find((u) => u.email === email)
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email,
      firstName: name.split(" ")[0] || name,
      lastName: name.split(" ").slice(1).join(" ") || "",
      password: hashedPassword,
      plan: "free" as const,
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)

    // Generate JWT token
    const token = jwt.sign({ userId: newUser.id, email: newUser.email }, process.env.JWT_SECRET || "your-secret-key", {
      expiresIn: "7d",
    })

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json({
      success: true,
      token,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
