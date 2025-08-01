import { type NextRequest, NextResponse } from "next/server"
import { createUser, getUserByEmail } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, password } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
    }

    // Validate password requirements
    const passwordRequirements = [
      { test: (p: string) => p.length >= 8, message: "Password must be at least 8 characters long" },
      { test: (p: string) => /[A-Z]/.test(p), message: "Password must contain at least one uppercase letter" },
      { test: (p: string) => /[a-z]/.test(p), message: "Password must contain at least one lowercase letter" },
      { test: (p: string) => /\d/.test(p), message: "Password must contain at least one number" },
      { test: (p: string) => /[!@#$%^&*]/.test(p), message: "Password must contain at least one special character" },
    ]

    for (const requirement of passwordRequirements) {
      if (!requirement.test(password)) {
        return NextResponse.json({ error: requirement.message }, { status: 400 })
      }
    }

    // Validate name lengths
    if (firstName.trim().length < 2) {
      return NextResponse.json({ error: "First name must be at least 2 characters long" }, { status: 400 })
    }

    if (lastName.trim().length < 2) {
      return NextResponse.json({ error: "Last name must be at least 2 characters long" }, { status: 400 })
    }

    // Try to connect to database with retry logic
    let dbConnection
    let retryCount = 0
    const maxRetries = 3

    while (retryCount < maxRetries) {
      try {
        dbConnection = await connectToDatabase()
        break
      } catch (error) {
        retryCount++
        console.error(`Database connection attempt ${retryCount} failed:`, error)

        if (retryCount === maxRetries) {
          console.error("Max database connection retries reached")
          return NextResponse.json({ error: "Unable to connect to database. Please try again later." }, { status: 503 })
        }

        // Wait before retrying (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retryCount) * 1000))
      }
    }

    // Check if user already exists
    try {
      const existingUser = await getUserByEmail(email.toLowerCase().trim())
      if (existingUser) {
        return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 })
      }
    } catch (error) {
      console.error("Error checking existing user:", error)
      return NextResponse.json({ error: "Unable to connect to database. Please try again later." }, { status: 503 })
    }

    // Create new user
    try {
      const newUser = await createUser({
        email: email.toLowerCase().trim(),
        username: `${firstName.trim()}_${lastName.trim()}_${Date.now()}`.toLowerCase(),
        password,
        profile: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        },
        isEmailVerified: false,
      })

      // Return success response (without sensitive data)
      return NextResponse.json(
        {
          success: true,
          message: "Account created successfully",
          user: {
            id: newUser.id,
            email: newUser.email,
            firstName: newUser.profile?.firstName,
            lastName: newUser.profile?.lastName,
            isEmailVerified: newUser.isEmailVerified,
          },
        },
        { status: 201 },
      )
    } catch (error) {
      console.error("Error creating user:", error)

      // Check if it's a duplicate key error (race condition)
      if (error instanceof Error && error.message.includes("duplicate key")) {
        return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 })
      }

      return NextResponse.json({ error: "Unable to connect to database. Please try again later." }, { status: 503 })
    }
  } catch (error) {
    console.error("Signup API error:", error)

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid request format" }, { status: 400 })
    }

    return NextResponse.json({ error: "Unable to connect to database. Please try again later." }, { status: 503 })
  }
}
