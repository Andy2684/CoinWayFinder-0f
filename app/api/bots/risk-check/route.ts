import { type NextRequest, NextResponse } from "next/server"
import { aiRiskAnalyzer, type RiskAnalysisInput } from "@/lib/ai-risk-analyzer"
import { subscriptionManager } from "@/lib/subscription-manager"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, botConfig } = body

    if (!userId || !botConfig) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user can perform risk analysis
    const plan = await subscriptionManager.getUserPlan(userId)
    if (!plan.features.aiRiskAnalysis) {
      return NextResponse.json({ error: "AI risk analysis not available in your plan" }, { status: 403 })
    }

    // Validate bot configuration against subscription limits
    const validation = await subscriptionManager.validateBotConfig(userId, botConfig)
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: "Configuration not allowed",
          details: validation.errors,
        },
        { status: 403 },
      )
    }

    // Prepare risk analysis input
    const riskInput: RiskAnalysisInput = {
      strategy: botConfig.strategy,
      symbol: botConfig.symbol,
      investment: botConfig.investment,
      leverage: botConfig.leverage,
      stopLoss: botConfig.stopLoss,
      takeProfit: botConfig.takeProfit,
      riskLevel: botConfig.riskLevel,
      parameters: botConfig.parameters || {},
    }

    // Get market data if available (simplified for demo)
    try {
      // In production, fetch real market data
      riskInput.marketData = {
        price: 50000, // Mock data
        volatility: Math.random() * 10,
        volume: Math.random() * 1000000,
        trend: ["uptrend", "downtrend", "sideways"][Math.floor(Math.random() * 3)],
      }
    } catch (error) {
      console.log("Could not fetch market data, proceeding without it")
    }

    // Perform AI risk analysis
    const riskAnalysis = await aiRiskAnalyzer.analyzeRisk(riskInput)

    return NextResponse.json({
      success: true,
      riskAnalysis,
    })
  } catch (error) {
    console.error("Risk check failed:", error)
    return NextResponse.json({ error: "Risk analysis failed" }, { status: 500 })
  }
}
