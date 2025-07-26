import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

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
  return "127.0.0.1"
}

export async function POST(request: NextRequest) {
  const ipAddress = getClientIP(request)
  const userAgent = request.headers.get("user-agent") || ""

  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing credentials",
          message: "Email and password are required",
        },
        { status: 400 },
      )
    }

    // For demo purposes, use hardcoded credentials
    // In production, this would connect to your actual database
    const demoUser = {
      id: "demo-user-123",
      email: "demo@coinwayfinder.com",
      password_hash: await bcrypt.hash("password", 12), // "password"
      username: "demo_user",
      first_name: "Demo",
      last_name: "User",
      role: "user",
      subscription_status: "pro",
      is_email_verified: true,
      created_at: new Date(),
      last_login: new Date(),
    }

    // Check if credentials match demo user
    if (email === demoUser.email) {
      const isValidPassword = await bcrypt.compare(password, demoUser.password_hash)

      if (isValidPassword) {
        // Generate JWT token
        const token = jwt.sign(
          {
            userId: demoUser.id,
            email: demoUser.email,
          },
          process.env.JWT_SECRET || "fallback-secret-key",
          { expiresIn: "7d" },
        )

        // Create response
        const response = NextResponse.json({
          success: true,
          message: "Login successful",
          user: {
            id: demoUser.id,
            email: demoUser.email,
            username: demoUser.username,
            firstName: demoUser.first_name,
            lastName: demoUser.last_name,
            role: demoUser.role,
            subscriptionStatus: demoUser.subscription_status,
            isEmailVerified: demoUser.is_email_verified,
            createdAt: demoUser.created_at,
            updatedAt: demoUser.last_login,
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
      }
    }

    // Invalid credentials
    return NextResponse.json(
      {
        success: false,
        error: "Invalid credentials",
        message: "Invalid email or password",
      },
      { status: 401 },
    )
  } catch (error) {
    console.error("Login error:", error)

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
