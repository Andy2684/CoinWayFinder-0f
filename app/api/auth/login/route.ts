import { type NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Mock users database - same as in register route
const users = [
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
    permissions: {
      fullAccess: false,
      manageUsers: false,
      systemSettings: false,
      allExchanges: false,
      unlimitedBots: false,
      advancedAnalytics: false,
      prioritySupport: false,
    },
  },
  {
    id: '2',
    email: 'admin@coinwayfinder.com',
    password: '$2a$10$8K1p/a9jNEFzfOOlGNNLSuA6YO/zJIWEjA8tGi3WCvDhcmKcKEHQS', // AdminPass123!
    firstName: 'Admin',
    lastName: 'User',
    username: 'admin',
    role: 'admin',
    plan: 'enterprise',
    isVerified: true,
    permissions: {
      fullAccess: true,
      manageUsers: true,
      systemSettings: true,
      allExchanges: true,
      unlimitedBots: true,
      advancedAnalytics: true,
      prioritySupport: true,
    },
  },
]

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = users.find((u) => u.email === email)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      token,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
