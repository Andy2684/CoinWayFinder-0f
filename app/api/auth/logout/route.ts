import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("Logging out user...")

    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    })

    // Clear the auth cookie
    response.cookies.delete("auth-token")

    // Also set an expired cookie to ensure it's cleared
    response.cookies.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    })

    console.log("User logged out successfully")
    return response
  } catch (error) {
    console.error("Logout error:", error)

    // Even if there's an error, clear the cookie
    const response = NextResponse.json(
      {
        success: false,
        error: "Logout error",
        message: "An error occurred during logout",
      },
      { status: 500 },
    )

    response.cookies.delete("auth-token")
    return response
  }
}
