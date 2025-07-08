import { NextResponse } from "next/server"
import { authManager } from "@/lib/auth"
import { database } from "@/lib/database"

export async function GET() {
  try {
    const user = await authManager.getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const stats = await database.getPortfolioStats(user.id)

    return NextResponse.json({
      success: true,
      ...stats,
    })
  } catch (error) {
    console.error("Get usage stats error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
