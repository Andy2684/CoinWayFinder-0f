import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser, getUserById } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    console.log("Getting current user...")

    const tokenPayload = await getCurrentUser()

    if (!tokenPayload) {
      console.log("No valid token found")
      return NextResponse.json(
        {
          success: false,
          error: "Not authenticated",
          message: "Please log in to access this resource",
        },
        { status: 401 },
      )
    }

    console.log("Token payload:", { userId: tokenPayload.userId, email: tokenPayload.email })

    // Get full user data from database
    const user = await getUserById(tokenPayload.userId)

    if (!user) {
      console.log("User not found in database:", tokenPayload.userId)

      // Clear invalid cookie
      const response = NextResponse.json(
        {
          success: false,
          error: "User not found",
          message: "User account no longer exists",
        },
        { status: 404 },
      )

      response.cookies.delete("auth-token")
      return response
    }

    console.log("User found:", { id: user.id, email: user.email })

    return NextResponse.json({
      success: true,
      user: user,
    })
  } catch (error) {
    console.error("Error in /api/auth/me:", error)

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
