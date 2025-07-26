import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectToDatabase } from "@/lib/mongodb"
import { generateToken } from "@/lib/auth"
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

    // Connect to MongoDB and get user
    const { db } = await connectToDatabase()
    const user = await db.collection("users").findOne({ email })

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
      await auditLogger.logLoginAttempt(user._id.toString(), email, false, ipAddress, userAgent, "Invalid password")

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
      await db.collection("users").updateOne({ _id: user._id }, { $set: { last_login: new Date() } })
    } catch (updateError) {
      console.error("Error updating last login:", updateError)
    }

    // Generate JWT token
    const token = generateToken({ userId: user._id.toString(), email: user.email })

    // Log successful login
    await auditLogger.logLoginAttempt(user._id.toString(), email, true, ipAddress, userAgent)

    // Create response with httpOnly cookie
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role || "user",
        subscriptionStatus: user.subscription_status || "free",
        isEmailVerified: user.is_email_verified || false,
        createdAt: user.created_at,
        updatedAt: user.updated_at || user.created_at,
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
