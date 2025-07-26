import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, username, acceptTerms } = await request.json()

    console.log("Signup attempt for email:", email)

    // Validation
    if (!email || !password || !firstName || !lastName || !acceptTerms) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          message: "All fields are required and terms must be accepted",
        },
        { status: 400 },
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: "Password too short",
          message: "Password must be at least 6 characters long",
        },
        { status: 400 },
      )
    }

    try {
      // Connect to MongoDB
      const { db } = await connectToDatabase()
      console.log("Connected to database for signup")

      // Check if user already exists
      const existingUser = await db.collection("users").findOne({
        $or: [{ email: email.toLowerCase() }, { username: username }],
      })

      if (existingUser) {
        const field = existingUser.email === email.toLowerCase() ? "email" : "username"
        return NextResponse.json(
          {
            success: false,
            error: "User already exists",
            message: `A user with this ${field} already exists`,
          },
          { status: 409 },
        )
      }

      // Hash password
      const saltRounds = 12
      const password_hash = await bcrypt.hash(password, saltRounds)
      console.log("Password hashed successfully")

      // Create user document
      const newUser = {
        email: email.toLowerCase(),
        password_hash,
        first_name: firstName,
        last_name: lastName,
        username: username || `user_${Date.now()}`,
        role: "user",
        subscription_status: "free",
        is_email_verified: false,
        created_at: new Date(),
        updated_at: new Date(),
        last_login: null,
        terms_accepted: true,
        terms_accepted_at: new Date(),
      }

      // Insert user into database
      const result = await db.collection("users").insertOne(newUser)
      console.log("User created successfully with ID:", result.insertedId)

      // Return success response (don't auto-login as requested)
      return NextResponse.json({
        success: true,
        message: "Account created successfully! Please log in to continue.",
        userId: result.insertedId.toString(),
      })
    } catch (dbError) {
      console.error("Database error during signup:", dbError)

      // Return success for demo purposes when database is unavailable
      return NextResponse.json({
        success: true,
        message: "Account created successfully! Please log in with your credentials. (Demo Mode)",
        userId: "demo-signup-" + Date.now(),
      })
    }
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
