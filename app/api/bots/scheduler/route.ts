import { type NextRequest, NextResponse } from "next/server"
import { botScheduler } from "@/lib/bot-scheduler"
import { connectToDatabase } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { action, botId, userId } = await request.json()

    const { db } = await connectToDatabase()
    const bot = await db.collection("bots").findOne({ _id: botId, userId })

    if (!bot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 })
    }

    switch (action) {
      case "start":
        await botScheduler.startBot({
          botId: bot._id,
          userId: bot.userId,
          strategy: bot.strategy,
          config: bot.config,
          exchangeConfig: bot.exchangeConfig,
        })
        break

      case "stop":
        await botScheduler.stopBot(botId)
        break

      case "pause":
        await botScheduler.pauseBot(botId)
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({ success: true, action, botId })
  } catch (error) {
    console.error("Scheduler API error:", error)
    return NextResponse.json({ error: "Failed to process scheduler action" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const stats = await botScheduler.getQueueStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Failed to get queue stats:", error)
    return NextResponse.json({ error: "Failed to get queue stats" }, { status: 500 })
  }
}
