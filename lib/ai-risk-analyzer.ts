import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export interface RiskAnalysisInput {
  strategy: string
  symbol: string
  investment: number
  leverage?: number
  stopLoss: number
  takeProfit: number
  riskLevel: number
  parameters: Record<string, any>
  marketData?: {
    price: number
    volatility: number
    volume: number
    trend: string
  }
}

export interface RiskAnalysisResult {
  riskScore: number // 0-100
  riskLevel: "low" | "medium" | "high" | "extreme"
  warnings: string[]
  recommendations: string[]
  shouldBlock: boolean
  analysis: {
    strategyRisk: number
    marketRisk: number
    positionRisk: number
    leverageRisk: number
  }
}

export class AIRiskAnalyzer {
  private static instance: AIRiskAnalyzer

  static getInstance(): AIRiskAnalyzer {
    if (!AIRiskAnalyzer.instance) {
      AIRiskAnalyzer.instance = new AIRiskAnalyzer()
    }
    return AIRiskAnalyzer.instance
  }

  async analyzeRisk(input: RiskAnalysisInput): Promise<RiskAnalysisResult> {
    try {
      // Calculate base risk scores
      const strategyRisk = this.calculateStrategyRisk(input)
      const marketRisk = await this.calculateMarketRisk(input)
      const positionRisk = this.calculatePositionRisk(input)
      const leverageRisk = this.calculateLeverageRisk(input)

      // Get AI analysis
      const aiAnalysis = await this.getAIAnalysis(input)

      // Calculate overall risk score
      const riskScore = Math.min(
        100,
        Math.round(strategyRisk * 0.3 + marketRisk * 0.25 + positionRisk * 0.25 + leverageRisk * 0.2),
      )

      const riskLevel = this.getRiskLevel(riskScore)
      const shouldBlock = riskScore >= 80

      return {
        riskScore,
        riskLevel,
        warnings: aiAnalysis.warnings,
        recommendations: aiAnalysis.recommendations,
        shouldBlock,
        analysis: {
          strategyRisk,
          marketRisk,
          positionRisk,
          leverageRisk,
        },
      }
    } catch (error) {
      console.error("Risk analysis failed:", error)

      // Return conservative high-risk result on error
      return {
        riskScore: 85,
        riskLevel: "extreme",
        warnings: ["Risk analysis failed - proceeding with high caution"],
        recommendations: ["Reduce position size", "Use lower leverage", "Set tighter stop losses"],
        shouldBlock: true,
        analysis: {
          strategyRisk: 85,
          marketRisk: 85,
          positionRisk: 85,
          leverageRisk: 85,
        },
      }
    }
  }

  private calculateStrategyRisk(input: RiskAnalysisInput): number {
    const strategyRiskMap: Record<string, number> = {
      dca: 20,
      grid: 35,
      scalping: 65,
      "long-short": 75,
      "trend-following": 45,
      arbitrage: 30,
    }

    let baseRisk = strategyRiskMap[input.strategy] || 50

    // Adjust based on parameters
    if (input.strategy === "scalping") {
      const maxHoldTime = input.parameters.maxHoldTime || 30
      if (maxHoldTime < 5) baseRisk += 15
      if (maxHoldTime > 60) baseRisk -= 10
    }

    if (input.strategy === "grid") {
      const gridLevels = input.parameters.gridLevels || 10
      if (gridLevels > 20) baseRisk += 20
      if (gridLevels < 5) baseRisk -= 10
    }

    return Math.min(100, Math.max(0, baseRisk))
  }

  private async calculateMarketRisk(input: RiskAnalysisInput): number {
    let marketRisk = 40 // Base market risk

    if (input.marketData) {
      // High volatility increases risk
      if (input.marketData.volatility > 5) marketRisk += 25
      if (input.marketData.volatility > 10) marketRisk += 15

      // Low volume increases risk
      if (input.marketData.volume < 1000000) marketRisk += 20

      // Trending markets are generally safer
      if (input.marketData.trend === "strong_uptrend" || input.marketData.trend === "strong_downtrend") {
        marketRisk -= 10
      }
    }

    // Symbol-specific risk
    const highRiskSymbols = ["DOGE", "SHIB", "PEPE", "FLOKI"]
    const symbol = input.symbol.replace("USDT", "").replace("USD", "")

    if (highRiskSymbols.some((risky) => symbol.includes(risky))) {
      marketRisk += 30
    }

    return Math.min(100, Math.max(0, marketRisk))
  }

  private calculatePositionRisk(input: RiskAnalysisInput): number {
    let positionRisk = 20

    // Investment size risk
    if (input.investment > 10000) positionRisk += 30
    if (input.investment > 50000) positionRisk += 20
    if (input.investment < 100) positionRisk += 15 // Too small positions have execution risk

    // Stop loss risk
    if (input.stopLoss > 20) positionRisk += 25
    if (input.stopLoss < 2) positionRisk += 15

    // Take profit risk
    if (input.takeProfit > 50) positionRisk += 15
    if (input.takeProfit < 5) positionRisk += 10

    // Risk/reward ratio
    const riskRewardRatio = input.takeProfit / input.stopLoss
    if (riskRewardRatio < 1) positionRisk += 20
    if (riskRewardRatio > 3) positionRisk -= 10

    return Math.min(100, Math.max(0, positionRisk))
  }

  private calculateLeverageRisk(input: RiskAnalysisInput): number {
    const leverage = input.leverage || 1

    if (leverage === 1) return 0
    if (leverage <= 2) return 15
    if (leverage <= 5) return 35
    if (leverage <= 10) return 60
    if (leverage <= 20) return 80
    return 95 // Extreme leverage
  }

  private async getAIAnalysis(input: RiskAnalysisInput): Promise<{
    warnings: string[]
    recommendations: string[]
  }> {
    try {
      const prompt = `
        Analyze this crypto trading bot configuration for risks:
        
        Strategy: ${input.strategy}
        Symbol: ${input.symbol}
        Investment: $${input.investment}
        Leverage: ${input.leverage || 1}x
        Stop Loss: ${input.stopLoss}%
        Take Profit: ${input.takeProfit}%
        Risk Level: ${input.riskLevel}/10
        
        Market Data: ${input.marketData ? JSON.stringify(input.marketData) : "Not available"}
        Parameters: ${JSON.stringify(input.parameters)}
        
        Provide:
        1. Top 3 specific warnings about this configuration
        2. Top 3 actionable recommendations to reduce risk
        
        Format as JSON:
        {
          "warnings": ["warning1", "warning2", "warning3"],
          "recommendations": ["rec1", "rec2", "rec3"]
        }
      `

      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt,
        system:
          "You are a professional crypto trading risk analyst. Provide specific, actionable insights about trading bot configurations. Focus on practical risks and concrete recommendations.",
      })

      const analysis = JSON.parse(text)
      return {
        warnings: analysis.warnings || [],
        recommendations: analysis.recommendations || [],
      }
    } catch (error) {
      console.error("AI analysis failed:", error)
      return {
        warnings: ["Unable to perform AI risk analysis"],
        recommendations: [
          "Review configuration manually",
          "Start with smaller position size",
          "Use conservative settings",
        ],
      }
    }
  }

  private getRiskLevel(score: number): "low" | "medium" | "high" | "extreme" {
    if (score < 30) return "low"
    if (score < 50) return "medium"
    if (score < 80) return "high"
    return "extreme"
  }

  async getMarketSentiment(symbol: string): Promise<{
    sentiment: "bullish" | "bearish" | "neutral"
    confidence: number
    signals: string[]
  }> {
    try {
      const prompt = `
        Analyze the current market sentiment for ${symbol} cryptocurrency.
        Consider recent price action, volume, news, and technical indicators.
        
        Provide analysis as JSON:
        {
          "sentiment": "bullish|bearish|neutral",
          "confidence": 0.0-1.0,
          "signals": ["signal1", "signal2", "signal3"]
        }
      `

      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt,
        system: "You are a crypto market analyst. Provide current market sentiment analysis based on available data.",
      })

      return JSON.parse(text)
    } catch (error) {
      console.error("Market sentiment analysis failed:", error)
      return {
        sentiment: "neutral",
        confidence: 0.5,
        signals: ["Analysis unavailable"],
      }
    }
  }
}

export const aiRiskAnalyzer = AIRiskAnalyzer.getInstance()
