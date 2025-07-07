import { type NextRequest, NextResponse } from "next/server"
import { botScheduler } from "@/lib/bot-scheduler"

export async function POST(request: NextRequest, { params }: { params: { botId: string } }) {
  try {
    const userId = request.headers.get("x-user-id") || "demo-user"

    // Use scheduler instead of direct bot manager
    await botScheduler.scheduleBot(params.botId, userId, "stop")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to stop bot:", error)
    return NextResponse.json({ success: false, error: "Failed to stop bot" }, { status: 500 })
  }
}
