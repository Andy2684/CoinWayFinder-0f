import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import crypto from "crypto"

// Mock databases
const users: any[] = []
const pendingUsers: any[] = []

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
    const { firstName, lastName, username, email, password, confirmPassword, dateOfBirth, acceptTerms } =
      await request.json()

    // Validation
    if (!firstName || !lastName || !username || !email || !password || !confirmPassword || !dateOfBirth) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (!acceptTerms) {
      return NextResponse.json({ error: "You must accept the terms and conditions" }, { status: 400 })
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 })
    }

    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters with uppercase, lowercase, and number" },
        { status: 400 },
      )
    }

    // Username validation
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { error: "Username must be 3-20 characters, alphanumeric and underscore only" },
        { status: 400 },
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
    }

    // Age validation
    const birthDate = new Date(dateOfBirth)
    const age = calculateAge(birthDate)
    if (age < 18) {
      return NextResponse.json({ error: "You must be at least 18 years old to register" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = users.find((u) => u.email === email || u.username === username)
    const existingPendingUser = pendingUsers.find((u) => u.email === email || u.username === username)

    if (existingUser || existingPendingUser) {
      return NextResponse.json({ error: "User with this email or username already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex")
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create pending user
    const newUser = {
      id: crypto.randomUUID(),
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      dateOfBirth: birthDate,
      role: "user",
      plan: "free",
      isVerified: false,
      verificationToken,
      tokenExpiry,
      createdAt: new Date(),
      acceptedTerms: true,
    }

    pendingUsers.push(newUser)

    // In production, send verification email here
    console.log(
      `Verification link: ${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/auth/verify-email?token=${verificationToken}`,
    )

    return NextResponse.json({
      success: true,
      message: "Registration successful! Please check your email to verify your account.",
      userId: newUser.id,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Export the users arrays for other routes to access
export { users, pendingUsers }
