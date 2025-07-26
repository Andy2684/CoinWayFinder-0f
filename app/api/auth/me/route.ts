import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

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
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid token",
          message: "Authentication failed",
        },
        { status: 401 },
      )
    }

    try {
      // Get user from database
      const { db } = await connectToDatabase()
      const user = await db
        .collection("users")
        .findOne({ _id: new ObjectId(decoded.userId) }, { projection: { password_hash: 0 } })

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            error: "User not found",
            message: "User does not exist",
          },
          { status: 404 },
        )
      }

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
    } catch (dbError) {
      console.error("Database connection error:", dbError)

      // Fallback to demo user if database is unavailable
      if (decoded.userId === "demo-user-123") {
        return NextResponse.json({
          success: true,
          user: {
            id: "demo-user-123",
            email: "demo@coinwayfinder.com",
            username: "demo_user",
            firstName: "Demo",
            lastName: "User",
            role: "user",
            subscriptionStatus: "pro",
            isEmailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })
      }

      return NextResponse.json(
        {
          success: false,
          error: "Database error",
          message: "Unable to fetch user data",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Auth me error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "An error occurred while fetching user data",
      },
      { status: 500 },
    )
  }
}
