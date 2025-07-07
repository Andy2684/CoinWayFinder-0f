import { type NextRequest, NextResponse } from "next/server"
import { getBotManager } from "@/lib/bot-manager"

export async function POST(request: NextRequest, { params }: { params: { botId: string } }) {
  try {
    const userId = request.headers.get("x-user-id") || "demo-user"
    const botManager = getBotManager(userId)

    const success = await botManager.pauseBot(params.botId)

    return NextResponse.json({ success })
  } catch (error) {
    console.error("Failed to pause bot:", error)
    return NextResponse.json({ success: false, error: "Failed to pause bot" }, { status: 500 })
  }
}
