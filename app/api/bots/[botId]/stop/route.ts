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

    // Stop the bot using the scheduler
    await botScheduler.stopBot(botId)

    return NextResponse.json({
      success: true,
      message: "Bot stopped successfully",
      botId,
      status: "stopped",
    })
  } catch (error) {
    console.error("Failed to stop bot:", error)
    return NextResponse.json({ error: "Failed to stop bot" }, { status: 500 })
  }
}
