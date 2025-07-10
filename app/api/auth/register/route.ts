import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import crypto from "crypto"

// Mock user database - replace with real database (MongoDB/Firebase)
const users: any[] = []
const pendingVerifications: any[] = []

// Mock email service - replace with real email service
const sendVerificationEmail = async (email: string, token: string) => {
  // In production, use services like SendGrid, Nodemailer, or AWS SES
  console.log(`Verification email sent to ${email}`)
  console.log(`Verification link: ${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify-email?token=${token}`)

  // For demo purposes, we'll just log the verification link
  // In production, you would send an actual email here
  return true
}

const calculateAge = (birthDate: string): number => {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, username, email, password, dateOfBirth } = await request.json()

    // Validation
    if (!firstName || !lastName || !username || !email || !password || !dateOfBirth) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Username validation
    if (username.length < 3) {
      return NextResponse.json({ error: "Username must be at least 3 characters long" }, { status: 400 })
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json(
        { error: "Username can only contain letters, numbers, and underscores" },
        { status: 400 },
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
    }

    // Password validation
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return NextResponse.json(
        {
          error: "Password must contain at least one uppercase letter, one lowercase letter, and one number",
        },
        { status: 400 },
      )
    }

    // Age validation
    const age = calculateAge(dateOfBirth)
    if (age < 18) {
      return NextResponse.json({ error: "You must be at least 18 years old to create an account" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = users.find((u) => u.email === email || u.username === username)
    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
      }
      if (existingUser.username === username) {
        return NextResponse.json({ error: "Username is already taken" }, { status: 409 })
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex")

    // Create user (but don't activate yet)
    const newUser = {
      id: Date.now().toString(),
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      dateOfBirth,
      isEmailVerified: false,
      isActive: false,
      plan: "free" as const,
      createdAt: new Date().toISOString(),
      verificationToken,
    }

    // Store user in pending verification
    pendingVerifications.push(newUser)

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken)
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError)
      return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Account created successfully! Please check your email to verify your account.",
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
