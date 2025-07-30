import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { generateToken, validateEmail, authenticateUser } from "@/lib/auth"

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

    // Authenticate user
    const user = await authenticateUser(email, password)

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

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
