import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/database"
import { botScheduler } from "@/lib/bot-scheduler"

export async function POST(request: NextRequest, { params }: { params: { botId: string } }) {
  try {
    const { botId } = params
    const { userId } = await request.json()

    const { db } = await connectToDatabase()

    // Find the bot
    const bot = await db.collection("bots").findOne({
      _id: botId,
      userId,
    })

    if (!bot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 })
    }

    // Check if bot is already running
    if (bot.status === "running") {
      return NextResponse.json({ error: "Bot is already running" }, { status: 400 })
    }

    // Start the bot using the scheduler
    await botScheduler.startBot({
      botId: bot._id,
      userId: bot.userId,
      strategy: bot.strategy,
      config: bot.config,
      exchangeConfig: bot.exchangeConfig,
    })

    return NextResponse.json({
      success: true,
      message: "Bot started successfully",
      botId,
      status: "running",
    })
  } catch (error) {
    console.error("Failed to start bot:", error)
    return NextResponse.json({ error: "Failed to start bot" }, { status: 500 })
  }
}
