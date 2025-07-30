import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectToDatabase } from "@/lib/mongodb"
import { sendWelcomeEmail } from "@/lib/email"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, username, acceptTerms } = await request.json()

    console.log("Signup attempt for email:", email)

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        {
          success: false,
          error: "All required fields must be provided",
        },
        { status: 400 },
      )
    }

    if (!acceptTerms) {
      return NextResponse.json(
        {
          success: false,
          error: "You must accept the terms and conditions",
        },
        { status: 400 },
      )
    }

    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must be at least 6 characters with uppercase, lowercase, and number",
        },
        { status: 400 },
      )
    }

    // Username validation (if provided)
    if (username) {
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
      if (!usernameRegex.test(username)) {
        return NextResponse.json(
          {
            success: false,
            error: "Username must be 3-20 characters, alphanumeric and underscore only",
          },
          { status: 400 },
        )
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: "Please enter a valid email address",
        },
        { status: 400 },
      )
    }

    const normalizedEmail = email.toLowerCase().trim()
    const normalizedUsername = username ? username.toLowerCase().trim() : null

    try {
      // Try MongoDB first
      const { db } = await connectToDatabase()
      console.log("Connected to database for signup")

      // Check if user already exists
      const existingUser = await db.collection("users").findOne({
        $or: [{ email: normalizedEmail }, ...(normalizedUsername ? [{ username: normalizedUsername }] : [])],
      })

      if (existingUser) {
        if (existingUser.email === normalizedEmail) {
          return NextResponse.json(
            {
              success: false,
              error: "User with this email already exists",
            },
            { status: 409 },
          )
        }
        if (existingUser.username === normalizedUsername) {
          return NextResponse.json(
            {
              success: false,
              error: "Username is already taken",
            },
            { status: 409 },
          )
        }
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12)

      // Create new user
      const newUser = {
        email: normalizedEmail,
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        username: normalizedUsername,
        role: "user",
        subscription_status: "free",
        is_email_verified: false,
        created_at: new Date(),
        updated_at: new Date(),
        last_login: null,
      }

      const insertResult = await db.collection("users").insertOne(newUser)
      console.log("User created with ID:", insertResult.insertedId)

      // Send welcome email
      console.log("Sending welcome email to:", normalizedEmail)
      try {
        const emailResult = await sendWelcomeEmail(normalizedEmail, firstName)
        console.log("Welcome email result:", emailResult)

        if (!emailResult.success) {
          console.error("Failed to send welcome email:", emailResult.error)
          // Don't fail the signup if email fails, just log it
        }
      } catch (emailError) {
        console.error("Welcome email error:", emailError)
        // Don't fail the signup if email fails
      }

      return NextResponse.json({
        success: true,
        message: "Account created successfully! Please check your email for a welcome message.",
        user: {
          id: insertResult.insertedId.toString(),
          email: normalizedEmail,
          firstName: firstName,
          lastName: lastName,
          username: normalizedUsername,
          role: "user",
          subscriptionStatus: "free",
          isEmailVerified: false,
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
              error: "User with this email already exists",
            },
            { status: 409 },
          )
        }
        if (existingDemoUser.username === normalizedUsername) {
          return NextResponse.json(
            {
              success: false,
              error: "Username is already taken",
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
        first_name: firstName,
        last_name: lastName,
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
      console.log("Sending welcome email to demo user:", normalizedEmail)
      try {
        const emailResult = await sendWelcomeEmail(normalizedEmail, firstName)
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
          firstName: firstName,
          lastName: lastName,
          username: normalizedUsername,
          role: "user",
          subscriptionStatus: "free",
          isEmailVerified: false,
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
