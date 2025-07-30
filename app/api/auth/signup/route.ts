import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectToDatabase } from "@/lib/mongodb"
import { sendWelcomeEmail } from "@/lib/email"
import { emailExists, usernameExists } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName, username, acceptTerms } = body

    console.log("Signup attempt for email:", email)

    // Comprehensive validation
    const errors: string[] = []

    if (!email || typeof email !== "string") {
      errors.push("Email is required")
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        errors.push("Please enter a valid email address")
      }
    }

    if (!password || typeof password !== "string") {
      errors.push("Password is required")
    } else {
      if (password.length < 8) {
        errors.push("Password must be at least 8 characters long")
      }
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
      if (!passwordRegex.test(password)) {
        errors.push("Password must contain at least one uppercase letter, one lowercase letter, and one number")
      }
    }

    if (!firstName || typeof firstName !== "string" || firstName.trim().length === 0) {
      errors.push("First name is required")
    }

    if (!lastName || typeof lastName !== "string" || lastName.trim().length === 0) {
      errors.push("Last name is required")
    }

    if (username && typeof username === "string") {
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
      if (!usernameRegex.test(username)) {
        errors.push("Username must be 3-20 characters, alphanumeric and underscore only")
      }
    }

    if (!acceptTerms) {
      errors.push("You must accept the terms and conditions")
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          message: errors.join(". "),
          errors: errors,
        },
        { status: 400 },
      )
    }

    const normalizedEmail = email.toLowerCase().trim()
    const normalizedUsername = username ? username.toLowerCase().trim() : null

    try {
      // Check for existing users
      const [emailTaken, usernameTaken] = await Promise.all([
        emailExists(normalizedEmail),
        normalizedUsername ? usernameExists(normalizedUsername) : Promise.resolve(false),
      ])

      if (emailTaken) {
        return NextResponse.json(
          {
            success: false,
            error: "Email already exists",
            message: "An account with this email address already exists",
          },
          { status: 409 },
        )
      }

      if (usernameTaken) {
        return NextResponse.json(
          {
            success: false,
            error: "Username taken",
            message: "This username is already taken",
          },
          { status: 409 },
        )
      }

      // Try MongoDB first
      const { db } = await connectToDatabase()
      console.log("Connected to database for signup")

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12)

      // Create new user
      const newUser = {
        email: normalizedEmail,
        password_hash: passwordHash,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        username: normalizedUsername,
        role: "user",
        subscription_status: "free",
        is_email_verified: false,
        security: {
          two_factor_enabled: false,
          login_attempts: 0,
          last_password_change: new Date(),
        },
        preferences: {
          notifications: {
            email: true,
            push: true,
            trading_alerts: true,
            news_updates: true,
            price_alerts: true,
          },
          trading: {
            default_exchange: "binance",
            risk_level: "medium",
            auto_trading: false,
          },
          ui: {
            theme: "dark",
            language: "en",
            currency: "USD",
          },
        },
        created_at: new Date(),
        updated_at: new Date(),
        last_login: null,
      }

      const insertResult = await db.collection("users").insertOne(newUser)
      console.log("User created with ID:", insertResult.insertedId)

      // Send welcome email (don't fail signup if email fails)
      try {
        console.log("Sending welcome email to:", normalizedEmail)
        const emailResult = await sendWelcomeEmail(normalizedEmail, firstName.trim())
        console.log("Welcome email result:", emailResult)
      } catch (emailError) {
        console.error("Welcome email error:", emailError)
        // Continue with successful signup even if email fails
      }

      return NextResponse.json({
        success: true,
        message: "Account created successfully! Please check your email for a welcome message.",
        user: {
          id: insertResult.insertedId.toString(),
          email: normalizedEmail,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          username: normalizedUsername,
          role: "user",
          subscriptionStatus: "free",
          isEmailVerified: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      })
    } catch (dbError) {
      console.error("Database error during signup:", dbError)

      // Fallback to demo user creation
      console.log("Creating demo user as fallback")

      // Initialize global demo users array if it doesn't exist
      if (!global.demoUsers) {
        global.demoUsers = []
      }

      // Check if demo user already exists
      const existingDemoUser = global.demoUsers.find(
        (user: any) => user.email === normalizedEmail || (normalizedUsername && user.username === normalizedUsername),
      )

      if (existingDemoUser) {
        if (existingDemoUser.email === normalizedEmail) {
          return NextResponse.json(
            {
              success: false,
              error: "Email already exists",
              message: "An account with this email address already exists",
            },
            { status: 409 },
          )
        }
        if (existingDemoUser.username === normalizedUsername) {
          return NextResponse.json(
            {
              success: false,
              error: "Username taken",
              message: "This username is already taken",
            },
            { status: 409 },
          )
        }
      }

      // Hash password for demo user
      const passwordHash = await bcrypt.hash(password, 12)

      // Create demo user
      const demoUser = {
        id: `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        email: normalizedEmail,
        password_hash: passwordHash,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        username: normalizedUsername,
        role: "user",
        subscription_status: "free",
        is_email_verified: false,
        created_at: new Date(),
        updated_at: new Date(),
      }

      global.demoUsers.push(demoUser)
      console.log("Demo user created:", demoUser.id)

      // Send welcome email for demo user
      try {
        console.log("Sending welcome email to demo user:", normalizedEmail)
        const emailResult = await sendWelcomeEmail(normalizedEmail, firstName.trim())
        console.log("Demo user welcome email result:", emailResult)
      } catch (emailError) {
        console.error("Demo user welcome email error:", emailError)
      }

      return NextResponse.json({
        success: true,
        message: "Account created successfully! (Demo Mode) Please check your email for a welcome message.",
        user: {
          id: demoUser.id,
          email: normalizedEmail,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          username: normalizedUsername,
          role: "user",
          subscriptionStatus: "free",
          isEmailVerified: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      })
    }
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
