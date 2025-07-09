import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    await AuthService.clearUserCookie()

    return NextResponse.json({
      success: true,
      message: "Signed out successfully",
    })
  } catch (error) {
    console.error("Signout error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
