import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName } = body

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        {
          success: false,
          error: "All fields are required. Please fill in your first name, last name, email, and password.",
        },
        { status: 400 },
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: "Please enter a valid email address.",
        },
        { status: 400 },
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must be at least 8 characters long.",
        },
        { status: 400 },
      )
    }

    if (!/[A-Z]/.test(password)) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must contain at least one uppercase letter (A-Z).",
        },
        { status: 400 },
      )
    }

    if (!/[a-z]/.test(password)) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must contain at least one lowercase letter (a-z).",
        },
        { status: 400 },
      )
    }

    if (!/\d/.test(password)) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must contain at least one number (0-9).",
        },
        { status: 400 },
      )
    }

    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must contain at least one special character (!@#$%^&*).",
        },
        { status: 400 },
      )
    }

    // Validate name fields
    if (firstName.trim().length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: "First name must be at least 2 characters long.",
        },
        { status: 400 },
      )
    }

    if (lastName.trim().length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: "Last name must be at least 2 characters long.",
        },
        { status: 400 },
      )
    }

    // Connect to database
    let db
    try {
      db = await connectToDatabase()
    } catch (dbError) {
      console.error("Database connection error:", dbError)
      return NextResponse.json(
        {
          success: false,
          error: "Unable to connect to database. Please try again later.",
        },
        { status: 500 },
      )
    }

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({
      email: email.toLowerCase(),
    })

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "An account with this email already exists. Please try signing in instead.",
        },
        { status: 409 },
      )
    }

    // Hash password
    let hashedPassword
    try {
      hashedPassword = await bcrypt.hash(password, 12)
    } catch (hashError) {
      console.error("Password hashing error:", hashError)
      return NextResponse.json(
        {
          success: false,
          error: "Unable to process password. Please try again.",
        },
        { status: 500 },
      )
    }

    // Create user
    const user = {
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role: "user",
      status: "active",
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null,
      loginAttempts: 0,
      accountLocked: false,
      preferences: {
        notifications: {
          email: true,
          push: true,
          trading: true,
          news: true,
        },
        theme: "light",
        language: "en",
      },
      profile: {
        avatar: null,
        bio: "",
        tradingExperience: "beginner",
        riskTolerance: "medium",
      },
    }

    let result
    try {
      result = await db.collection("users").insertOne(user)
    } catch (insertError) {
      console.error("User creation error:", insertError)
      return NextResponse.json(
        {
          success: false,
          error: "Unable to create account. Please try again.",
        },
        { status: 500 },
      )
    }

    // Return success response (no dashboard redirect)
    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully! Welcome to CoinWayFinder!",
        redirect: "/thank-you", // Redirect to thank you page instead of dashboard
        user: {
          id: result.insertedId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          createdAt: user.createdAt,
          emailVerified: user.emailVerified,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Signup error:", error)

    // Handle different types of errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request format. Please try again.",
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred. Please try again later.",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: "Method not allowed. Please use POST to create an account.",
    },
    { status: 405 },
  )
}
