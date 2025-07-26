import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "No token provided",
          message: "Authentication required",
        },
        { status: 401 },
      )
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret-key") as any

    // For demo purposes, return demo user data
    // In production, this would fetch from your database
    const demoUser = {
      id: decoded.userId,
      email: decoded.email,
      username: "demo_user",
      firstName: "Demo",
      lastName: "User",
      role: "user",
      subscriptionStatus: "pro",
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return NextResponse.json({
      success: true,
      user: demoUser,
    })
  } catch (error) {
    console.error("Auth verification error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Invalid token",
        message: "Authentication failed",
      },
      { status: 401 },
    )
  }
}
