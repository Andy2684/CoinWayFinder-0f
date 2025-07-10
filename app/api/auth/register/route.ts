import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import crypto from "crypto"

// Store pending registrations (users who haven't verified email yet)
const pendingUsers: any[] = []

// Store verified users
const users: any[] = []

// Email verification tokens
const verificationTokens: { [key: string]: { userId: string; expires: Date } } = {}

function calculateAge(dateOfBirth: string): number {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
  return usernameRegex.test(username)
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function isStrongPassword(password: string): boolean {
  const minLength = 6
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)

  return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers
}

async function sendVerificationEmail(email: string, token: string) {
  // In production, integrate with SendGrid, Nodemailer, or AWS SES
  const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/auth/verify-email?token=${token}`

  console.log(`
    📧 EMAIL VERIFICATION
    To: ${email}
    Subject: Verify your CoinWayFinder account
    
    Click here to verify your account: ${verificationLink}
    
    This link expires in 24 hours.
  `)

  // Simulate email sending delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return { success: true }
}

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, username, email, password, dateOfBirth, acceptTerms } = await request.json()

    // Validation
    if (!firstName || !lastName || !username || !email || !password || !dateOfBirth || !acceptTerms) {
      return NextResponse.json(
        {
          error: "All fields are required and terms must be accepted",
        },
        { status: 400 },
      )
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
    }

    // Validate username
    if (!isValidUsername(username)) {
      return NextResponse.json(
        {
          error: "Username must be 3-20 characters long and contain only letters, numbers, and underscores",
        },
        { status: 400 },
      )
    }

    // Validate password strength
    if (!isStrongPassword(password)) {
      return NextResponse.json(
        {
          error: "Password must be at least 6 characters long and contain uppercase, lowercase, and numbers",
        },
        { status: 400 },
      )
    }

    // Validate age (must be 18+)
    const age = calculateAge(dateOfBirth)
    if (age < 18) {
      return NextResponse.json(
        {
          error: "You must be at least 18 years old to create an account",
        },
        { status: 400 },
      )
    }

    // Check if user already exists (in both pending and verified users)
    const existingUser = [...pendingUsers, ...users].find((u) => u.email === email || u.username === username)

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 })
      } else {
        return NextResponse.json({ error: "This username is already taken" }, { status: 409 })
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex")
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create new user (pending verification)
    const newUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      dateOfBirth,
      isEmailVerified: false,
      isActive: false,
      role: "user",
      plan: "free" as const,
      permissions: ["basic_access"],
      createdAt: new Date().toISOString(),
    }

    // Store in pending users
    pendingUsers.push(newUser)

    // Store verification token
    verificationTokens[verificationToken] = {
      userId: newUser.id,
      expires: tokenExpires,
    }

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken)
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError)
      // Don't fail registration if email fails, but log it
    }

    return NextResponse.json({
      success: true,
      message: "Registration successful! Please check your email to verify your account.",
      requiresVerification: true,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Export the arrays so other routes can access them
export { pendingUsers, users, verificationTokens }
