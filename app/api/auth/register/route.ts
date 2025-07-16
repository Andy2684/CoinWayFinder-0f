import { type NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Mock users database - replace with real database
const users: any[] = [
  {
    id: '1',
    email: 'demo@coinwayfinder.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    firstName: 'Demo',
    lastName: 'User',
    username: 'demo',
    role: 'user',
    plan: 'free',
    isVerified: true,
    permissions: {},
  },
]

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
    const {
      firstName,
      lastName,
      username,
      email,
      password,
      confirmPassword,
      dateOfBirth,
      acceptTerms,
    } = await request.json()

    // Validation
    if (
      !firstName ||
      !lastName ||
      !username ||
      !email ||
      !password ||
      !confirmPassword ||
      !dateOfBirth
    ) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (!acceptTerms) {
      return NextResponse.json(
        { success: false, error: 'You must accept the terms and conditions' },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ success: false, error: 'Passwords do not match' }, { status: 400 })
    }

    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Password must be at least 6 characters with uppercase, lowercase, and number',
        },
        { status: 400 }
      )
    }

    // Username validation
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Username must be 3-20 characters, alphanumeric and underscore only',
        },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Age validation
    const birthDate = new Date(dateOfBirth)
    const age = calculateAge(birthDate)
    if (age < 18) {
      return NextResponse.json(
        { success: false, error: 'You must be at least 18 years old to register' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = users.find((u) => u.email === email || u.username === username)

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email or username already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create new user
    const newUser = {
      id: (users.length + 1).toString(),
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      dateOfBirth: birthDate,
      role: 'user',
      plan: 'free',
      isVerified: false,
      createdAt: new Date(),
      acceptedTerms: true,
      permissions: {
        fullAccess: false,
        manageUsers: false,
        systemSettings: false,
        allExchanges: false,
        unlimitedBots: false,
        advancedAnalytics: false,
        prioritySupport: false,
      },
    }

    users.push(newUser)

    // Generate JWT token for immediate login (optional)
    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    // Return user data without password
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      token,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
