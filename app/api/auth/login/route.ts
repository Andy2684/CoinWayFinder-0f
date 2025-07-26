import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getUserByEmail } from "@/lib/database"
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
      await auditLogger.logLoginAttempt(
        null,
        email || "unknown",
        false,
        ipAddress,
        userAgent,
        "Missing email or password",
      )

      return NextResponse.json(
        {
          success: false,
          error: "Missing credentials",
          message: "Email and password are required",
        },
        { status: 400 },
      )
    }

    // Get user from database
    const user = await getUserByEmail(email)

    if (!user) {
      await auditLogger.logLoginAttempt(null, email, false, ipAddress, userAgent, "User not found")

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
      await auditLogger.logLoginAttempt(user.id, email, false, ipAddress, userAgent, "Invalid password")

      return NextResponse.json(
        {
          success: false,
          error: "Invalid credentials",
          message: "Invalid email or password",
        },
        { status: 401 },
      )
    }

    // Generate JWT token
    const token = generateToken({ userId: user.id, email: user.email })

    // Log successful login
    await auditLogger.logLoginAttempt(user.id, email, true, ipAddress, userAgent)

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
        subscriptionStatus: "free", // Default for now
        isEmailVerified: user.is_email_verified,
        createdAt: user.created_at,
        updatedAt: user.created_at, // Using created_at as placeholder
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
