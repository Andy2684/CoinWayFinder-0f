import { type NextRequest, NextResponse } from "next/server"
import { userService } from "@/lib/user"
import { securityMonitor } from "@/lib/security-monitor"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    // Find user
    const user = await userService.findByEmail(email)

    if (!user || !user.isActive) {
      // Record failed attempt
      await securityMonitor.recordLoginAttempt({
        email,
        ipAddress,
        userAgent,
        success: false,
        timestamp: new Date(),
      })

      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await userService.verifyPassword(user, password)

    if (!isValidPassword) {
      // Record failed attempt
      await securityMonitor.recordLoginAttempt({
        email,
        ipAddress,
        userAgent,
        success: false,
        timestamp: new Date(),
      })

      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return NextResponse.json({ error: "Please verify your email before logging in" }, { status: 401 })
    }

    // Record successful attempt
    await securityMonitor.recordLoginAttempt({
      email,
      ipAddress,
      userAgent,
      success: true,
      timestamp: new Date(),
    })

    // Update last login
    await userService.updateLastLogin(user.id)

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" },
    )

    // Create response
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })

    // Set HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
