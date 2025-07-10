import { type NextRequest, NextResponse } from "next/server"
import { authService } from "@/lib/auth"
import { database } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const user = await authService.getCurrentUser()

    if (!user) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    // Get additional user data
    const userSettings = await database.getUserSettings(user.userId)

    return NextResponse.json({
      success: true,
      user: {
        id: user.userId,
        email: user.email,
        username: user.username,
        subscription: userSettings?.subscription || {
          plan: "free",
          status: "inactive",
        },
      },
    })
  } catch (error) {
    console.error("Get current user error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
