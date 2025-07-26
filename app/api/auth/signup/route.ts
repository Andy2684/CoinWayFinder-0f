import { type NextRequest, NextResponse } from "next/server"
import { createUser, emailExists, usernameExists } from "@/lib/auth"
import { auditLogger } from "@/lib/audit-logger"
import { z } from "zod"

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string().optional(),
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
    const validationResult = signupSchema.safeParse(body)
    if (!validationResult.success) {
      await auditLogger.log({
        eventType: "signup_validation_failed",
        eventCategory: "authentication",
        eventDescription: "User signup failed validation",
        ipAddress,
        userAgent,
        riskLevel: "low",
        success: false,
        errorMessage: "Validation failed",
        metadata: {
          email: body.email || "unknown",
          errors: validationResult.error.errors,
        },
      })

      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResult.error.errors,
        },
        { status: 400 },
      )
    }

    const { email, password, firstName, lastName, username } = validationResult.data

    // Check if email already exists
    if (await emailExists(email)) {
      await auditLogger.log({
        eventType: "signup_email_exists",
        eventCategory: "authentication",
        eventDescription: `Signup attempt with existing email: ${email}`,
        ipAddress,
        userAgent,
        riskLevel: "medium",
        success: false,
        errorMessage: "Email already exists",
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
    if (username && (await usernameExists(username))) {
      await auditLogger.log({
        eventType: "signup_username_exists",
        eventCategory: "authentication",
        eventDescription: `Signup attempt with existing username: ${username}`,
        ipAddress,
        userAgent,
        riskLevel: "low",
        success: false,
        errorMessage: "Username already exists",
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

    // Create user
    const user = await createUser({
      email,
      password,
      firstName,
      lastName,
      username,
    })

    // Log successful signup
    await auditLogger.logSignup(user.id, email, ipAddress, userAgent)

    // Return success without auto-login (as requested)
    return NextResponse.json({
      success: true,
      message: "Account created successfully",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
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
      metadata: { email: "unknown" },
    })

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "An error occurred during account creation. Please try again.",
      },
      { status: 500 },
    )
  }
}
