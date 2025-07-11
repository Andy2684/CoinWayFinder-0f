import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

// Mock user database - replace with real database
const users: any[] = []

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, username, email, password, dateOfBirth, acceptTerms } = await request.json()

    // Validate required fields
    if (!firstName || !lastName || !username || !email || !password || !dateOfBirth) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (!acceptTerms) {
      return NextResponse.json({ error: "You must accept the terms and conditions" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters with uppercase, lowercase, and number" },
        { status: 400 },
      )
    }

    // Validate age (must be 18+)
    const birthDate = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    if (age < 18) {
      return NextResponse.json({ error: "You must be at least 18 years old" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() || u.username.toLowerCase() === username.toLowerCase(),
    )

    if (existingUser) {
      if (existingUser.email.toLowerCase() === email.toLowerCase()) {
        return NextResponse.json({ error: "Email already registered" }, { status: 409 })
      }
      if (existingUser.username.toLowerCase() === username.toLowerCase()) {
        return NextResponse.json({ error: "Username already taken" }, { status: 409 })
      }
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      firstName,
      lastName,
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      dateOfBirth,
      role: "user",
      plan: "free",
      isEmailVerified: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      emailVerificationToken: jwt.sign({ email: email.toLowerCase() }, process.env.JWT_SECRET || "your-secret-key", {
        expiresIn: "24h",
      }),
    }

    // Add user to mock database
    users.push(newUser)

    // In a real app, you would send an email verification here
    console.log(`Email verification link: /auth/verify-email?token=${newUser.emailVerificationToken}`)

    return NextResponse.json({
      success: true,
      message: "Registration successful. Please check your email to verify your account.",
      userId: newUser.id,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
