import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { createUser, getUserByEmail, getUserByUsername } from "@/lib/database"
import { auditLogger } from "@/lib/audit-logger"

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")
  const remoteAddr = request.headers.get("x-vercel-forwarded-for")

  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }
  if (realIP) {
    return realIP
  }
  if (remoteAddr) {
    return remoteAddr
  }
  return "unknown"
}

export async function POST(request: NextRequest) {
  const ipAddress = getClientIP(request)
  const userAgent = request.headers.get("user-agent") || "unknown"

  try {
    const { email, password, firstName, lastName, username, acceptTerms } = await request.json()

    // Validation
    if (!email || !password || !firstName || !lastName) {
      await auditLogger.log({
        eventType: "signup_validation_failed",
        eventCategory: "user_management",
        eventDescription: "Signup failed - missing required fields",
        ipAddress,
        userAgent,
        riskLevel: "low",
        success: false,
        errorMessage: "Missing required fields",
        metadata: { email, hasPassword: !!password, firstName, lastName },
      })

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
      await auditLogger.log({
        eventType: "signup_terms_not_accepted",
        eventCategory: "user_management",
        eventDescription: "Signup failed - terms not accepted",
        ipAddress,
        userAgent,
        riskLevel: "low",
        success: false,
        errorMessage: "Terms and conditions not accepted",
        metadata: { email },
      })

      return NextResponse.json(
        {
          success: false,
          error: "Terms not accepted",
          message: "You must accept the terms and conditions",
        },
        { status: 400 },
      )
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      await auditLogger.log({
        eventType: "signup_email_exists",
        eventCategory: "user_management",
        eventDescription: `Signup failed - email already exists: ${email}`,
        ipAddress,
        userAgent,
        riskLevel: "medium",
        success: false,
        errorMessage: "Email already registered",
        metadata: { email },
      })

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
    if (username) {
      const existingUsername = await getUserByUsername(username)
      if (existingUsername) {
        await auditLogger.log({
          eventType: "signup_username_exists",
          eventCategory: "user_management",
          eventDescription: `Signup failed - username already exists: ${username}`,
          ipAddress,
          userAgent,
          riskLevel: "low",
          success: false,
          errorMessage: "Username already taken",
          metadata: { email, username },
        })

        return NextResponse.json(
          {
            success: false,
            error: "Username already exists",
            message: "This username is already taken",
          },
          { status: 409 },
        )
      }
    }

    // Hash password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Create user
    const newUser = await createUser({
      email,
      username: username || email.split("@")[0], // Use email prefix if no username provided
      passwordHash,
      firstName,
      lastName,
    })

    // Log successful signup
    await auditLogger.logSignup(newUser.id, email, ipAddress, userAgent)

    // Return success (don't auto-login as requested)
    return NextResponse.json({
      success: true,
      message: "Account created successfully! You can now log in.",
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
      },
    })
  } catch (error) {
    console.error("Signup error:", error)

    await auditLogger.log({
      eventType: "signup_server_error",
      eventCategory: "system",
      eventDescription: "Server error during user signup",
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
        message: "An error occurred during account creation",
      },
      { status: 500 },
    )
  }
}
