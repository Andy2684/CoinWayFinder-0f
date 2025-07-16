import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { createUser, getUserByEmail, getUserByUsername } from "@/lib/database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, username, dateOfBirth, acceptTerms } = await request.json()

    // Validation
    if (!email || !password || !firstName || !lastName || !username) {
      return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 })
    }

    if (!acceptTerms) {
      return NextResponse.json({ success: false, error: "You must accept the terms and conditions" }, { status: 400 })
    }

    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters with uppercase, lowercase, and number" },
        { status: 400 },
      )
    }

    // Username validation
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { success: false, error: "Username must be 3-20 characters, alphanumeric and underscore only" },
        { status: 400 },
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, error: "Please enter a valid email address" }, { status: 400 })
    }

    // Age validation
    if (dateOfBirth) {
      const birthDate = new Date(dateOfBirth)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }

      if (age < 18) {
        return NextResponse.json(
          { success: false, error: "You must be at least 18 years old to register" },
          { status: 400 },
        )
      }
    }

    // Check if user already exists
    const existingUserByEmail = await getUserByEmail(email.toLowerCase())
    const existingUserByUsername = await getUserByUsername(username.toLowerCase())

    if (existingUserByEmail) {
      return NextResponse.json({ success: false, error: "User with this email already exists" }, { status: 409 })
    }

    if (existingUserByUsername) {
      return NextResponse.json({ success: false, error: "Username is already taken" }, { status: 409 })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create new user in database
    const newUser = await createUser({
      email: email.toLowerCase(),
      passwordHash,
      firstName,
      lastName,
      username: username.toLowerCase(),
      role: "user",
      plan: "starter",
    })

    // Generate JWT token
    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: "7d" })

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        username: newUser.username,
        role: newUser.role,
        plan: newUser.plan,
        isVerified: newUser.is_verified,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
