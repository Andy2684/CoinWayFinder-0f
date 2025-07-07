import { type NextRequest, NextResponse } from "next/server"
import { botScheduler } from "@/lib/bot-scheduler"

export async function POST(request: NextRequest) {
  try {
    const { action, botId, userId } = await request.json()

    if (!action || !botId || !userId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    if (action === "start" || action === "stop") {
      await botScheduler.scheduleBot(botId, userId, action)
      return NextResponse.json({
        success: true,
        message: `Bot ${action}ed successfully`,
      })
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Scheduler API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const stats = await botScheduler.getQueueStats()
    return NextResponse.json({ success: true, stats })
  } catch (error) {
    console.error("Failed to get queue stats:", error)
    return NextResponse.json({ success: false, error: "Failed to get queue stats" }, { status: 500 })
  }
}
