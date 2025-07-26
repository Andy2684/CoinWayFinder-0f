import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { sql } from "@/lib/database"

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
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid token",
          message: "Authentication failed",
        },
        { status: 401 },
      )
    }

    // Get user from database with safe column access
    const [user] = await sql`
      SELECT 
        id, 
        email, 
        first_name, 
        last_name, 
        username, 
        COALESCE(role, 'user') as role, 
        COALESCE(subscription_status, 'free') as subscription_status,
        COALESCE(is_email_verified, false) as is_email_verified,
        last_login,
        created_at, 
        COALESCE(updated_at, created_at) as updated_at
      FROM users 
      WHERE id = ${decoded.userId}
    `

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
          message: "User account no longer exists",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        subscriptionStatus: user.subscription_status,
        isEmailVerified: user.is_email_verified,
        lastLogin: user.last_login,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    })
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
