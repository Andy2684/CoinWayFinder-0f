import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser, getUserById } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Get current user from token
    const tokenPayload = await getCurrentUser()

    if (!tokenPayload) {
      return NextResponse.json(
        {
          success: false,
          error: "Not authenticated",
          message: "No valid authentication token found",
        },
        { status: 401 },
      )
    }

    // Get full user data
    const user = await getUserById(tokenPayload.userId)

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
    console.error("Auth check error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "An error occurred while checking authentication",
      },
      { status: 500 },
    )
  }
}
