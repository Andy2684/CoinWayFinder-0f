import { NextResponse } from "next/server"
import { authManager } from "@/lib/auth"

export async function POST() {
  try {
    await authManager.disconnectExpiredUsers()

    return NextResponse.json({
      success: true,
      message: "Subscription check completed",
    })
  } catch (error) {
    console.error("Check subscriptions API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
