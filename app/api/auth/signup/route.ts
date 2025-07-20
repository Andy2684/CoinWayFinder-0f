import { type NextRequest, NextResponse } from "next/server"

// Mock database - in production, use a real database
const users: any[] = [
  {
    id: "1",
    email: "demo@coinwayfinder.com",
    password: "password",
    firstName: "Demo",
    lastName: "User",
    username: "demo_user",
    role: "user",
    plan: "free",
    isVerified: true,
  },
  {
    id: "2",
    email: "admin@coinwayfinder.com",
    password: "AdminPass123!",
    firstName: "Admin",
    lastName: "User",
    username: "admin_user",
    role: "admin",
    plan: "enterprise",
    isVerified: true,
  },
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName } = body

    console.log("Signup attempt:", { email, firstName, lastName })

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        {
          success: false,
          error: "All fields are required",
          message: "Please fill in all required fields",
        },
        { status: 400 },
      )
    }

    // Check if user already exists
    const existingUser = users.find((u) => u.email === email)
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User already exists",
          message: "An account with this email already exists",
        },
        { status: 409 },
      )
    }

    // Create new user
    const newUser = {
      id: (users.length + 1).toString(),
      email,
      password, // In production, hash this password
      firstName,
      lastName,
      username: `${firstName.toLowerCase()}_${lastName.toLowerCase()}`,
      role: "user",
      plan: "free",
      isVerified: false,
      createdAt: new Date().toISOString(),
    }

    // Add to mock database
    users.push(newUser)

    // Return success without auto-login
    return NextResponse.json({
      success: true,
      message: "Account created successfully! You can now sign in.",
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "An error occurred during signup. Please try again.",
      },
      { status: 500 },
    )
  }
}
