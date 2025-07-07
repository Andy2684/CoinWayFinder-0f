import { type NextRequest, NextResponse } from "next/server"
import { getBotManager } from "@/lib/bot-manager"

export async function GET(request: NextRequest, { params }: { params: { botId: string } }) {
  try {
    const userId = request.headers.get("x-user-id") || "demo-user"
    const botManager = getBotManager(userId)

    const stats = await botManager.getBotStats(params.botId)

    return NextResponse.json({ success: true, stats })
  } catch (error) {
    console.error("Failed to get bot stats:", error)
    return NextResponse.json({ success: false, error: "Failed to get bot stats" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { botId: string } }) {
  try {
    const userId = request.headers.get("x-user-id") || "demo-user"
    const botManager = getBotManager(userId)

    const success = await botManager.deleteBot(params.botId)

    return NextResponse.json({ success })
  } catch (error) {
    console.error("Failed to delete bot:", error)
    return NextResponse.json({ success: false, error: "Failed to delete bot" }, { status: 500 })
  }
}
