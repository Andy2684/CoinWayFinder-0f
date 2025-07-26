import { type NextRequest, NextResponse } from "next/server"
import { authenticateUser, generateToken, getUserByEmail } from "@/lib/auth"
import { auditLogger } from "@/lib/audit-logger"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

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
    const body = await request.json()

    // Validate input
    const validationResult = loginSchema.safeParse(body)
    if (!validationResult.success) {
      await auditLogger.logLoginAttempt(
        null,
        body.email || "unknown",
        false,
        ipAddress,
        userAgent,
        "Invalid input validation",
      )

      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResult.error.errors,
        },
        { status: 400 },
      )
    }

    const { email, password } = validationResult.data

    // Check if user exists first (for logging purposes)
    const existingUser = await getUserByEmail(email)

    // Authenticate user
    const user = await authenticateUser(email, password)
    if (!user) {
      await auditLogger.logLoginAttempt(
        existingUser?.id || null,
        email,
        false,
        ipAddress,
        userAgent,
        "Invalid credentials",
      )

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
    const token = generateToken(user.id)

    // Log successful login
    await auditLogger.logLoginAttempt(user.id, email, true, ipAddress, userAgent)

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user,
    })

    // Set secure HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Login error:", error)

    await auditLogger.logLoginAttempt(
      null,
      "unknown",
      false,
      ipAddress,
      userAgent,
      `Server error: ${error instanceof Error ? error.message : "Unknown error"}`,
    )

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "An error occurred during login. Please try again.",
      },
      { status: 500 },
    )
  }
}
