import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { createAIBot, getAIBotsByUser } from "@/lib/database"
import { AIBotTrainer } from "@/lib/ai-bot-trainer"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    const aiBots = await getAIBotsByUser(decoded.userId)

    return NextResponse.json({
      success: true,
      bots: aiBots.map((bot) => ({
        id: bot.id,
        name: bot.name,
        strategy: bot.strategy,
        status: bot.status,
        pnl: Number.parseFloat(bot.pnl || "0"),
        trades: bot.trades_count,
        winRate: Number.parseFloat(bot.win_rate || "0"),
        aiMetrics: {
          confidence: Number.parseFloat(bot.ai_confidence || "0"),
          learningProgress: Number.parseFloat(bot.learning_progress || "0"),
          adaptationRate: Number.parseFloat(bot.adaptation_rate || "0"),
          predictionAccuracy: Number.parseFloat(bot.prediction_accuracy || "0"),
        },
        createdAt: bot.created_at,
      })),
    })
  } catch (error) {
    console.error("Get AI bots error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    const { name, strategy, symbol, exchange, config, aiConfig } = await request.json()

    if (!name || !strategy || !symbol || !exchange) {
      return NextResponse.json(
        { success: false, error: "Name, strategy, symbol, and exchange are required" },
        { status: 400 },
      )
    }

    const bot = await createAIBot({
      name,
      strategy,
      symbol,
      exchange,
      config: config || {},
      aiConfig: aiConfig || {},
      createdBy: decoded.userId,
    })

    // Start AI training if specified
    if (aiConfig?.startTraining) {
      const trainer = new AIBotTrainer()
      await trainer.startTraining(bot.id, {
        strategy,
        symbol,
        historicalDataDays: aiConfig.historicalDataDays || 30,
        learningRate: aiConfig.learningRate || 0.001,
        epochs: aiConfig.epochs || 100,
      })
    }

    return NextResponse.json({
      success: true,
      bot: {
        id: bot.id,
        name: bot.name,
        strategy: bot.strategy,
        status: bot.status,
        pnl: Number.parseFloat(bot.pnl || "0"),
        trades: bot.trades_count,
        winRate: Number.parseFloat(bot.win_rate || "0"),
        aiMetrics: {
          confidence: Number.parseFloat(bot.ai_confidence || "0"),
          learningProgress: Number.parseFloat(bot.learning_progress || "0"),
          adaptationRate: Number.parseFloat(bot.adaptation_rate || "0"),
          predictionAccuracy: Number.parseFloat(bot.prediction_accuracy || "0"),
        },
        createdAt: bot.created_at,
      },
    })
  } catch (error) {
    console.error("Create AI bot error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
