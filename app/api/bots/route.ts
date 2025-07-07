import { type NextRequest, NextResponse } from "next/server"
import { getBotManager } from "@/lib/bot-manager"

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "demo-user"
    const botManager = getBotManager(userId)

    const bots = await botManager.getAllBots()

    return NextResponse.json({ success: true, bots })
  } catch (error) {
    console.error("Failed to get bots:", error)
    return NextResponse.json({ success: false, error: "Failed to get bots" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "demo-user"
    const botManager = getBotManager(userId)

    const body = await request.json()
    const {
      name,
      exchange,
      strategy,
      symbol,
      apiKey,
      secretKey,
      riskLevel,
      lotSize,
      takeProfit,
      stopLoss,
      dcaInterval,
      investment,
      parameters,
    } = body

    // Validate required fields
    if (!name || !exchange || !strategy || !symbol || !apiKey || !secretKey) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const botId = await botManager.createBot({
      name,
      exchange,
      strategy,
      symbol,
      apiKey,
      secretKey,
      riskLevel: riskLevel || 50,
      lotSize: lotSize || 0.001,
      takeProfit: takeProfit || 5,
      stopLoss: stopLoss || 3,
      dcaInterval: dcaInterval || "1h",
      investment: investment || 100,
      parameters: parameters || {},
    })

    if (!botId) {
      return NextResponse.json({ success: false, error: "Failed to create bot" }, { status: 500 })
    }

    return NextResponse.json({ success: true, botId })
  } catch (error) {
    console.error("Failed to create bot:", error)
    return NextResponse.json({ success: false, error: "Failed to create bot" }, { status: 500 })
  }
}
