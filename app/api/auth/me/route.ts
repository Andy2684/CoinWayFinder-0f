import { NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"
import { database } from "@/lib/database"

export async function GET() {
  try {
    const user = await AuthService.getCurrentUser()

    if (!user) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    // Get user settings to include subscription info
    const userSettings = await database.getUserSettings(user.id)

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        subscription: userSettings?.subscription || null,
      },
    })
  } catch (error) {
    console.error("Get current user error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
