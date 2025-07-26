import { type NextRequest, NextResponse } from "next/server"
import { createUser, emailExists, usernameExists } from "@/lib/auth"

interface SignupRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  username?: string
  acceptTerms: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body: SignupRequest = await request.json()
    const { email, password, firstName, lastName, username, acceptTerms } = body

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          message: "Email, password, first name, and last name are required",
        },
        { status: 400 },
      )
    }

    if (!acceptTerms) {
      return NextResponse.json(
        {
          success: false,
          error: "Terms not accepted",
          message: "You must accept the terms and conditions",
        },
        { status: 400 },
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email",
          message: "Please enter a valid email address",
        },
        { status: 400 },
      )
    }

    // Password validation
    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: "Password too short",
          message: "Password must be at least 8 characters long",
        },
        { status: 400 },
      )
    }

    // Check if email already exists
    if (await emailExists(email)) {
      return NextResponse.json(
        {
          success: false,
          error: "Email already exists",
          message: "An account with this email already exists",
        },
        { status: 409 },
      )
    }

    // Check if username already exists (if provided)
    if (username && (await usernameExists(username))) {
      return NextResponse.json(
        {
          success: false,
          error: "Username already exists",
          message: "This username is already taken",
        },
        { status: 409 },
      )
    }

    // Create user
    const user = await createUser({
      email,
      password,
      firstName,
      lastName,
      username,
    })

    return NextResponse.json({
      success: true,
      message: "Account created successfully! Please log in to continue.",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
      },
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "An error occurred during registration. Please try again.",
      },
      { status: 500 },
    )
  }
}
