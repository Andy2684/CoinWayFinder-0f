import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"

// Mock user storage - replace with real database
const mockUsers: any[] = []

// Helper function to calculate age
function calculateAge(birthDate: Date): number {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, username, email, password, dateOfBirth, acceptTerms } = await request.json()

    // Validation
    if (!firstName || !lastName || !username || !email || !password || !dateOfBirth) {
      return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 })
    }

    if (!acceptTerms) {
      return NextResponse.json({ success: false, error: "You must accept the terms and conditions" }, { status: 400 })
    }

    // Check if email already exists
    const existingUserByEmail = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (existingUserByEmail) {
      return NextResponse.json({ success: false, error: "Email already registered" }, { status: 409 })
    }

    // Check if username already exists
    const existingUserByUsername = mockUsers.find((u) => u.username.toLowerCase() === username.toLowerCase())
    if (existingUserByUsername) {
      return NextResponse.json({ success: false, error: "Username already taken" }, { status: 409 })
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters long" },
        { status: 400 },
      )
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must contain at least one uppercase letter, one lowercase letter, and one number",
        },
        { status: 400 },
      )
    }

    // Validate age
    const birthDate = new Date(dateOfBirth)
    const age = calculateAge(birthDate)
    if (age < 18) {
      return NextResponse.json(
        { success: false, error: "You must be at least 18 years old to register" },
        { status: 400 },
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user
    const newUser = {
      id: uuidv4(),
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      username: username.toLowerCase(),
      role: "user",
      plan: "starter",
      isVerified: false, // In real app, send verification email
      dateOfBirth,
      createdAt: new Date().toISOString(),
      preferences: {
        theme: "dark",
        notifications: true,
        twoFactor: false,
      },
    }

    // Add to mock database
    mockUsers.push(newUser)

    return NextResponse.json({
      success: true,
      message: "Account created successfully! Please check your email to verify your account.",
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
