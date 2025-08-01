import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName } = body

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "All fields are required", success: false }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address", success: false }, { status: 400 })
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character",
          success: false,
        },
        { status: 400 },
      )
    }

    try {
      // Connect to database with retry logic
      const { db } = await connectToDatabase()
      const usersCollection = db.collection("users")

      // Check if user already exists
      const existingUser = await usersCollection.findOne({
        email: email.toLowerCase(),
      })

      if (existingUser) {
        return NextResponse.json(
          { error: "An account with this email already exists", success: false },
          { status: 409 },
        )
      }

      // Hash password
      const saltRounds = 12
      const hashedPassword = await bcrypt.hash(password, saltRounds)

      // Create user document
      const newUser = {
        email: email.toLowerCase(),
        password_hash: hashedPassword,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        username: `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${Date.now()}`,
        role: "user",
        subscription_status: "free",
        is_email_verified: false,
        profile_picture: null,
        phone: null,
        location: null,
        website: null,
        bio: null,
        preferences: {
          notifications: {
            email: true,
            push: true,
            sms: false,
            trading_alerts: true,
            news_updates: true,
            price_alerts: true,
          },
          trading: {
            default_exchange: "binance",
            risk_level: "medium",
            auto_trading: false,
            stop_loss_enabled: true,
            take_profit_enabled: true,
          },
          ui: {
            theme: "dark",
            language: "en",
            timezone: "UTC",
            currency: "USD",
          },
        },
        security: {
          two_factor_enabled: false,
          two_factor_secret: null,
          backup_codes: [],
          login_attempts: 0,
          locked_until: null,
          last_password_change: new Date(),
          security_questions: [],
        },
        activity: {
          last_login: new Date(),
          last_active: new Date(),
          login_count: 0,
          ip_addresses: [],
          devices: [],
        },
        trading_data: {
          total_trades: 0,
          total_pnl: 0,
          win_rate: 0,
          favorite_pairs: ["BTC/USDT", "ETH/USDT"],
          active_bots: [],
          portfolio_value: 0,
          risk_score: 50,
        },
        created_at: new Date(),
        updated_at: new Date(),
      }

      // Insert user into database
      const result = await usersCollection.insertOne(newUser)

      if (!result.insertedId) {
        throw new Error("Failed to create user account")
      }

      // Return success response (without sensitive data)
      return NextResponse.json({
        success: true,
        message: "Account created successfully",
        user: {
          id: result.insertedId.toString(),
          email: newUser.email,
          firstName: newUser.first_name,
          lastName: newUser.last_name,
          isEmailVerified: newUser.is_email_verified,
        },
      })
    } catch (dbError) {
      console.error("Database error during signup:", dbError)

      // Handle specific database connection errors
      if (dbError instanceof Error) {
        if (dbError.message.includes("EBADNAME") || dbError.message.includes("querySrv")) {
          return NextResponse.json(
            {
              error: "Unable to connect to database. Please try again later.",
              success: false,
            },
            { status: 503 },
          )
        }

        if (dbError.message.includes("timeout")) {
          return NextResponse.json(
            {
              error: "Database connection timeout. Please try again.",
              success: false,
            },
            { status: 504 },
          )
        }
      }

      return NextResponse.json(
        {
          error: "Database error occurred. Please try again later.",
          success: false,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Signup error:", error)

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid request format", success: false }, { status: 400 })
    }

    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again.", success: false },
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
