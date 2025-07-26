import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { sql } from "@/lib/database"
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
    const { email, password, firstName, lastName, username } = await request.json()

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          message: "Email and password are required",
        },
        { status: 400 },
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email format",
          message: "Please provide a valid email address",
        },
        { status: 400 },
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: "Weak password",
          message: "Password must be at least 8 characters long",
        },
        { status: 400 },
      )
    }

    // Check if user already exists
    const [existingUser] = await sql`
      SELECT id, email FROM users WHERE email = ${email}
    `

    if (existingUser) {
      try {
        await auditLogger.log({
          eventType: "signup_attempt_duplicate",
          eventCategory: "authentication",
          eventDescription: `Signup attempt with existing email: ${email}`,
          ipAddress,
          userAgent,
          riskLevel: "low",
          success: false,
          metadata: { email, reason: "email_exists" },
        })
      } catch (auditError) {
        console.error("Audit logging error:", auditError)
      }

      return NextResponse.json(
        {
          success: false,
          error: "User already exists",
          message: "An account with this email already exists",
        },
        { status: 409 },
      )
    }

    // Check if username is taken (if provided)
    if (username) {
      const [existingUsername] = await sql`
        SELECT id, username FROM users WHERE username = ${username}
      `

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
      ) VALUES (
        ${email}, 
        ${passwordHash}, 
        ${firstName || null}, 
        ${lastName || null}, 
        ${username || null},
        'user',
        'free',
        false
      )
      RETURNING id, email, first_name, last_name, username, role, subscription_status, is_email_verified, created_at
    `

    // Log successful signup
    try {
      await auditLogger.logSignup(newUser.id, email, ipAddress, userAgent)
    } catch (auditError) {
      console.error("Audit logging error:", auditError)
    }

    // Return success response WITHOUT auto-login (as requested)
    return NextResponse.json({
      success: true,
      message: "Account created successfully! Please log in to continue.",
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        username: newUser.username,
        role: newUser.role,
        subscriptionStatus: newUser.subscription_status,
        isEmailVerified: newUser.is_email_verified,
        createdAt: newUser.created_at,
      },
    })
  } catch (error) {
    console.error("Signup error:", error)

    try {
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
    } catch (auditError) {
      console.error("Audit logging error:", auditError)
    }

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
