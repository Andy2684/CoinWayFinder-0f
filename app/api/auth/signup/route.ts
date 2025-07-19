import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"

// Mock database - replace with real database
const users: any[] = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName, username } = body

    // Validation
    if (!email || !password || !firstName || !lastName || !username) {
      return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = users.find((u) => u.email === email || u.username === username)
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User with this email or username already exists" },
        { status: 400 },
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const newUser = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      firstName,
      lastName,
      username,
      role: "user",
      plan: "free",
      isVerified: false,
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)

    // Don't create token or login automatically
    // Just return success for redirect to thank-you page
    return NextResponse.json({
      success: true,
      message: "Account created successfully",
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
