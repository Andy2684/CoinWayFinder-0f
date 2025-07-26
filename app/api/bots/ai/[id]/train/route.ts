import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { getTradingBotById, updateBotStatus } from "@/lib/database"
import { AIBotTrainer } from "@/lib/ai-bot-trainer"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    const { historicalDataDays, learningRate, epochs, validationSplit } = await request.json()

    // Get bot details
    const bot = await getTradingBotById(params.id, decoded.userId)
    if (!bot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 })
    }

    // Update bot status to training
    await updateBotStatus(params.id, "training")

    // Start AI training
    const trainer = new AIBotTrainer()
    const trainingJob = await trainer.startTraining(params.id, {
      strategy: bot.strategy,
      symbol: bot.symbol,
      historicalDataDays: historicalDataDays || 30,
      learningRate: learningRate || 0.001,
      epochs: epochs || 100,
      validationSplit: validationSplit || 0.2,
    })

    return NextResponse.json({
      success: true,
      message: "AI training started",
      trainingJob: {
        id: trainingJob.id,
        status: trainingJob.status,
        progress: trainingJob.progress,
        estimatedCompletion: trainingJob.estimatedCompletion,
      },
    })
  } catch (error) {
    console.error("Start AI training error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
