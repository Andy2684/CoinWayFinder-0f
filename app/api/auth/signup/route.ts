import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectToDatabase } from "@/lib/mongodb"
import { auditLogger } from "@/lib/audit-logger"

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")
  const remoteAddr = request.headers.get("x-vercel-forwarded-for")

  if (forwarded) {
    const ip = forwarded.split(",")[0].trim()
    return ip !== "unknown" ? ip : ""
  }
  if (realIP && realIP !== "unknown") {
    return realIP
  }
  if (remoteAddr && remoteAddr !== "unknown") {
    return remoteAddr
  }
  return ""
}

export async function POST(request: NextRequest) {
  const ipAddress = getClientIP(request)
  const userAgent = request.headers.get("user-agent") || ""

  try {
    const { email, password, firstName, lastName, username, acceptTerms } = await request.json()

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      await auditLogger.logSignupAttempt(
        null,
        email || "unknown",
        false,
        ipAddress,
        userAgent,
        "Missing required fields",
      )

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
      await auditLogger.logSignupAttempt(null, email, false, ipAddress, userAgent, "Terms not accepted")

      return NextResponse.json(
        {
          success: false,
          error: "Terms not accepted",
          message: "You must accept the terms and conditions",
        },
        { status: 400 },
      )
    }

    // Connect to MongoDB
    const { db } = await connectToDatabase()

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email })

    if (existingUser) {
      await auditLogger.logSignupAttempt(null, email, false, ipAddress, userAgent, "Email already exists")

      return NextResponse.json(
        {
          success: false,
          error: "Email already exists",
          message: "An account with this email already exists",
        },
        { status: 409 },
      )
    }

    // Check if username is taken (if provided)
    if (username) {
      const existingUsername = await db.collection("users").findOne({ username })
      if (existingUsername) {
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

    // Hash password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Generate username if not provided
    const finalUsername = username || `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${Date.now()}`

    // Create user document
    const newUser = {
      email,
      password_hash: passwordHash,
      first_name: firstName,
      last_name: lastName,
      username: finalUsername,
      role: "user",
      subscription_status: "free",
      is_email_verified: false,
      created_at: new Date(),
      updated_at: new Date(),
    }

    // Insert user into MongoDB
    const result = await db.collection("users").insertOne(newUser)

    // Log successful signup
    await auditLogger.logSignupAttempt(result.insertedId.toString(), email, true, ipAddress, userAgent)

    // Return success without auto-login (as requested)
    return NextResponse.json({
      success: true,
      message: "Account created successfully! Please log in to continue.",
      user: {
        id: result.insertedId.toString(),
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        username: newUser.username,
        createdAt: newUser.created_at,
      },
    })
  } catch (error) {
    console.error("Signup error:", error)

    await auditLogger.log({
      eventType: "signup_server_error",
      eventCategory: "system",
      eventDescription: "Server error during signup attempt",
      ipAddress,
      userAgent,
      riskLevel: "high",
      success: false,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    })

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "An error occurred during signup",
      },
      { status: 500 },
    )
  }
}
