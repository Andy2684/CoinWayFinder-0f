import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { hashPassword } from "@/lib/auth"

// Password validation function
function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long")
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number")
  }

  if (!/[!@#$%^&*]/.test(password)) {
    errors.push("Password must contain at least one special character (!@#$%^&*)")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Email validation function
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, password } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Validate field lengths
    if (firstName.trim().length < 2) {
      return NextResponse.json({ error: "First name must be at least 2 characters long" }, { status: 400 })
    }

    if (lastName.trim().length < 2) {
      return NextResponse.json({ error: "Last name must be at least 2 characters long" }, { status: 400 })
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
    }

    // Validate password
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json({ error: passwordValidation.errors.join(". ") }, { status: 400 })
    }

    // Connect to database with retry logic
    let db
    let retryCount = 0
    const maxRetries = 3

    while (retryCount < maxRetries) {
      try {
        const connection = await connectToDatabase()
        db = connection.db
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

    if (!db) {
      return NextResponse.json({ error: "Unable to connect to database. Please try again later." }, { status: 503 })
    }

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({
      email: email.toLowerCase().trim(),
    })

    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 })
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user document
    const userData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      username: email.toLowerCase().trim().split("@")[0], // Generate username from email
      passwordHash,
      role: "user",
      plan: "free",
      isEmailVerified: false,
      profile: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        avatar: null,
        dateOfBirth: null,
      },
      settings: {
        notifications: true,
        theme: "dark",
        language: "en",
      },
      onboarding: {
        completed: false,
        currentStep: 0,
        completedSteps: [],
      },
      achievements: [],
      tradingPreferences: {
        riskTolerance: "medium",
        tradingExperience: "beginner",
        preferredAssets: [],
        maxInvestmentAmount: null,
      },
      created_at: new Date(),
      updated_at: new Date(),
    }

    // Insert user into database
    const result = await db.collection("users").insertOne(userData)

    if (!result.insertedId) {
      throw new Error("Failed to create user account")
    }

    // Return success response (without sensitive data)
    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        user: {
          id: result.insertedId.toString(),
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          username: userData.username,
          role: userData.role,
          plan: userData.plan,
          isEmailVerified: userData.isEmailVerified,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Signup error:", error)

    // Handle specific MongoDB errors
    if (error instanceof Error) {
      if (error.message.includes("EBADNAME") || error.message.includes("querySrv")) {
        return NextResponse.json({ error: "Unable to connect to database. Please try again later." }, { status: 503 })
      }

      if (error.message.includes("duplicate key")) {
        return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 })
      }
    }

    // Generic server error
    return NextResponse.json({ error: "An unexpected error occurred. Please try again later." }, { status: 500 })
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}
