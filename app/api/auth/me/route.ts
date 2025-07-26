import { type NextRequest, NextResponse } from "next/server"
import { verifyToken, getUserById } from "@/lib/auth"

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
          message: "Token is invalid or expired",
        },
        { status: 401 },
      )
    }

    // Get user data
    const user = await getUserById(decoded.userId)
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
      user,
    })
  } catch (error) {
    console.error("Auth verification error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "An error occurred during authentication verification",
      },
      { status: 500 },
    )
  }
}
