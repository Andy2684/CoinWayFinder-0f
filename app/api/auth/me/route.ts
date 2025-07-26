import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
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

    // Verify token
    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret-key")
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid token",
          message: "Authentication failed",
        },
        { status: 401 },
      )
    }

    const { userId, email } = decoded

    try {
      // Try to get user from MongoDB
      const { db } = await connectToDatabase()
      const user = await db.collection("users").findOne({ email: email.toLowerCase() })

      if (user) {
        return NextResponse.json({
          success: true,
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
      }
    } catch (dbError) {
      console.error("Database error in /me:", dbError)
    }

    // Check predefined demo users
    const predefinedDemoUsers = [
      {
        id: "demo-user-123",
        email: "demo@coinwayfinder.com",
        username: "demo_user",
        first_name: "Demo",
        last_name: "User",
        role: "user",
        subscription_status: "pro",
        is_email_verified: true,
        created_at: new Date(),
      },
      {
        id: "admin-demo-456",
        email: "admin@coinwayfinder.com",
        username: "admin_user",
        first_name: "Admin",
        last_name: "User",
        role: "admin",
        subscription_status: "enterprise",
        is_email_verified: true,
        created_at: new Date(),
      },
      {
        id: "test-user-789",
        email: "test@example.com",
        username: "test_user",
        first_name: "Test",
        last_name: "User",
        role: "user",
        subscription_status: "free",
        is_email_verified: true,
        created_at: new Date(),
      },
    ]

    const predefinedUser = predefinedDemoUsers.find((user) => user.email === email.toLowerCase())
    if (predefinedUser) {
      return NextResponse.json({
        success: true,
        user: {
          id: predefinedUser.id,
          email: predefinedUser.email,
          username: predefinedUser.username,
          firstName: predefinedUser.first_name,
          lastName: predefinedUser.last_name,
          role: predefinedUser.role,
          subscriptionStatus: predefinedUser.subscription_status,
          isEmailVerified: predefinedUser.is_email_verified,
          createdAt: predefinedUser.created_at,
          updatedAt: predefinedUser.created_at,
        },
      })
    }

    // Check dynamically created demo users
    if (global.demoUsers) {
      const demoUser = global.demoUsers.find((user: any) => user.email === email.toLowerCase())
      if (demoUser) {
        return NextResponse.json({
          success: true,
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
            updatedAt: demoUser.created_at,
          },
        })
      }
    }

    // User not found
    return NextResponse.json(
      {
        success: false,
        error: "User not found",
        message: "User account no longer exists",
      },
      { status: 404 },
    )
  } catch (error) {
    console.error("Auth check error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "An error occurred during authentication check",
      },
      { status: 500 },
    )
  }
}
