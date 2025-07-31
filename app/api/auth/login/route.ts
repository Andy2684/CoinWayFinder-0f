import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { generateToken, validateEmail } from "@/lib/auth"
import { getUserByEmail, verifyPassword, updateUserLastLogin } from "@/lib/user"
import { securityMonitor } from "@/lib/security-monitor"

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")
  const remoteAddr = request.headers.get("x-vercel-forwarded-for")

  if (forwarded) {
    const ip = forwarded.split(",")[0].trim()
    return ip !== "unknown" ? ip : "127.0.0.1"
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
  try {
    const body = await request.json()
    const { email, password } = body
    const clientIP = getClientIP(request)
    const userAgent = request.headers.get("user-agent") || "unknown"

    console.log("Login attempt for email:", email, "from IP:", clientIP)

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Test database connection
    try {
      await connectToDatabase()
    } catch (dbError) {
      console.error("Database connection failed:", dbError)
      return NextResponse.json({ error: "Database connection failed. Please try again later." }, { status: 503 })
    }

    // Get user and verify password
    const user = await getUserByEmail(email)

    if (!user || !(await verifyPassword(password, user.password))) {
      // Log failed login attempt
      await securityMonitor.logSecurityEvent({
        userId: email,
        ipAddress: clientIP,
        userAgent,
        eventType: "failed_login",
        timestamp: new Date(),
        details: {
          email,
          reason: "Invalid credentials",
        },
      })

      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Update last login
    await updateUserLastLogin(user.id)

    // Log successful login
    await securityMonitor.logSecurityEvent({
      userId: user.id,
      ipAddress: clientIP,
      userAgent,
      eventType: "login_attempt",
      timestamp: new Date(),
      details: {
        email: user.email,
        success: true,
      },
    })

    // Generate JWT token
    const token = generateToken(user)

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        last_login: user.last_login,
      },
    })

    // Set HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "An unexpected error occurred. Please try again." }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}
