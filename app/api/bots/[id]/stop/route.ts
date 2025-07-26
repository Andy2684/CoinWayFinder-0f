import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { updateBotStatus } from "@/lib/database"
import { BotExecutionEngine } from "@/lib/bot-execution-engine"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    jwt.verify(token, JWT_SECRET) as { userId: string }

    // Update bot status to paused
    const updatedBot = await updateBotStatus(params.id, "paused")
    if (!updatedBot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 })
    }

    // Stop bot execution
    const executionEngine = BotExecutionEngine.getInstance()
    await executionEngine.stopBot(params.id)

    return NextResponse.json({
      success: true,
      message: "Bot stopped successfully",
      bot: {
        id: updatedBot.id,
        status: updatedBot.status,
        updatedAt: updatedBot.updated_at,
      },
    })
  } catch (error) {
    console.error("Stop bot error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
