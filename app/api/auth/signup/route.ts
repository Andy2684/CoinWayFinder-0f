import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { sql } from "@/lib/database"
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

    // Check if user already exists
    const [existingUser] = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUser) {
      await auditLogger.log({
        eventType: "signup_attempt_duplicate_email",
        eventCategory: "auth",
        eventDescription: `Signup attempt with existing email: ${email}`,
        ipAddress,
        userAgent,
        riskLevel: "medium",
        success: false,
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
      const [existingUsername] = await sql`
        SELECT id FROM users WHERE username = ${username}
      `

      if (existingUsername) {
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

    // Generate username if not provided
    const finalUsername = username || `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${Date.now()}`

    // Create user
    const [newUser] = await sql`
      INSERT INTO users (
        email, 
        password_hash, 
        first_name, 
        last_name, 
        username,
        role,
        subscription_status,
        is_email_verified
      )
      VALUES (
        ${email}, 
        ${passwordHash}, 
        ${firstName}, 
        ${lastName}, 
        ${finalUsername},
        'user',
        'free',
        false
      )
      RETURNING 
        id, 
        email, 
        first_name, 
        last_name, 
        username, 
        role, 
        subscription_status,
        is_email_verified,
        created_at
    `

    // Log successful signup
    await auditLogger.log({
      userId: newUser.id,
      eventType: "user_signup",
      eventCategory: "auth",
      eventDescription: `New user registered: ${email}`,
      ipAddress,
      userAgent,
      riskLevel: "low",
      success: true,
    })

    // Return success without auto-login (as requested)
    return NextResponse.json({
      success: true,
      message: "Account created successfully! You can now log in.",
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        username: newUser.username,
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
        message: "An error occurred during registration",
      },
      { status: 500 },
    )
  }
}
