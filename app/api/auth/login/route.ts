import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { sql } from "@/lib/database"
import { generateToken } from "@/lib/auth"
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
    const { email, password } = await request.json()

    if (!email || !password) {
      try {
        await auditLogger.logLoginAttempt(
          null,
          email || "unknown",
          false,
          ipAddress,
          userAgent,
          "Missing email or password",
        )
      } catch (auditError) {
        console.error("Audit logging error:", auditError)
      }

      return NextResponse.json(
        {
          success: false,
          error: "Missing credentials",
          message: "Email and password are required",
        },
        { status: 400 },
      )
    }

    // Get user from database with safe column access
    const [user] = await sql`
      SELECT 
        id, 
        email, 
        password_hash,
        first_name, 
        last_name, 
        username, 
        COALESCE(role, 'user') as role, 
        COALESCE(subscription_status, 'free') as subscription_status,
        COALESCE(is_email_verified, false) as is_email_verified,
        last_login,
        created_at, 
        COALESCE(updated_at, created_at) as updated_at
      FROM users 
      WHERE email = ${email}
    `

    if (!user) {
      try {
        await auditLogger.logLoginAttempt(null, email, false, ipAddress, userAgent, "User not found")
      } catch (auditError) {
        console.error("Audit logging error:", auditError)
      }

      return NextResponse.json(
        {
          success: false,
          error: "Invalid credentials",
          message: "Invalid email or password",
        },
        { status: 401 },
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)

    if (!isValidPassword) {
      try {
        await auditLogger.logLoginAttempt(user.id, email, false, ipAddress, userAgent, "Invalid password")
      } catch (auditError) {
        console.error("Audit logging error:", auditError)
      }

      return NextResponse.json(
        {
          success: false,
          error: "Invalid credentials",
          message: "Invalid email or password",
        },
        { status: 401 },
      )
    }

    // Update last login timestamp
    try {
      await sql`
        UPDATE users 
        SET last_login = CURRENT_TIMESTAMP 
        WHERE id = ${user.id}
      `
    } catch (updateError) {
      console.error("Error updating last login:", updateError)
    }

    // Generate JWT token
    const token = generateToken({ userId: user.id, email: user.email })

    // Log successful login
    try {
      await auditLogger.logLoginAttempt(user.id, email, true, ipAddress, userAgent)
    } catch (auditError) {
      console.error("Audit logging error:", auditError)
    }

    // Create response with httpOnly cookie
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        subscriptionStatus: user.subscription_status,
        isEmailVerified: user.is_email_verified,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    })

    // Set httpOnly cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Login error:", error)

    try {
      await auditLogger.log({
        eventType: "login_server_error",
        eventCategory: "system",
        eventDescription: "Server error during login attempt",
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
        message: "An error occurred during login",
      },
      { status: 500 },
    )
  }
}
