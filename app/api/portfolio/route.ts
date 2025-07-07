import { type NextRequest, NextResponse } from "next/server"
import { getBotManager } from "@/lib/bot-manager"

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "demo-user"
    const botManager = getBotManager(userId)

    const stats = await botManager.getPortfolioStats()

    return NextResponse.json({ success: true, stats })
  } catch (error) {
    console.error("Failed to get portfolio stats:", error)
    return NextResponse.json({ success: false, error: "Failed to get portfolio stats" }, { status: 500 })
  }
}
