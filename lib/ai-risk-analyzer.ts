import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { UserBot } from "./database"
import type { Ticker, Kline } from "./exchange-api-client"

export interface RiskAnalysis {
  riskScore: number // 0-100
  riskLevel: "low" | "medium" | "high" | "extreme"
  warnings: string[]
  recommendations: string[]
  canStart: boolean
  requiresConfirmation: boolean
}

export interface MarketAnalysis {
  volatility: number
  trend: "bullish" | "bearish" | "sideways"
  volume: number
  support: number
  resistance: number
  rsi: number
  sentiment: "bullish" | "bearish" | "neutral"
  confidence: number
}

export class AIRiskAnalyzer {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || ""
  }

  async analyzeBotRisk(bot: UserBot, marketData: Ticker, historicalData: Kline[]): Promise<RiskAnalysis> {
    try {
      // Calculate market analysis
      const marketAnalysis = this.calculateMarketAnalysis(marketData, historicalData)

      // Prepare context for AI analysis
      const context = this.prepareAnalysisContext(bot, marketData, marketAnalysis)

      // Get AI analysis
      const aiAnalysis = await this.getAIAnalysis(context)

      // Calculate risk score
      const riskScore = this.calculateRiskScore(bot, marketAnalysis, aiAnalysis)

      // Generate warnings and recommendations
      const warnings = this.generateWarnings(bot, marketAnalysis, riskScore)
      const recommendations = this.generateRecommendations(bot, marketAnalysis, riskScore)

      // Determine risk level
      const riskLevel = this.determineRiskLevel(riskScore)

      return {
        riskScore,
        riskLevel,
        warnings,
        recommendations,
        canStart: riskScore < 80, // Block if risk > 80%
        requiresConfirmation: riskScore > 40, // Require confirmation if risk > 40%
      }
    } catch (error) {
      console.error("AI Risk Analysis failed:", error)

      // Fallback to basic analysis
      return this.basicRiskAnalysis(bot, marketData)
    }
  }

  private calculateMarketAnalysis(ticker: Ticker, klines: Kline[]): MarketAnalysis {
    if (klines.length < 14) {
      return {
        volatility: 0,
        trend: "sideways",
        volume: ticker.volume24h,
        support: ticker.low24h,
        resistance: ticker.high24h,
        rsi: 50,
        sentiment: "neutral",
        confidence: 0.3,
      }
    }

    // Calculate volatility (standard deviation of price changes)
    const priceChanges = klines.slice(1).map((kline, i) => (kline.close - klines[i].close) / klines[i].close)
    const avgChange = priceChanges.reduce((sum, change) => sum + change, 0) / priceChanges.length
    const variance =
      priceChanges.reduce((sum, change) => sum + Math.pow(change - avgChange, 2), 0) / priceChanges.length
    const volatility = Math.sqrt(variance) * 100

    // Calculate RSI
    const rsi = this.calculateRSI(klines)

    // Determine trend
    const recentPrices = klines.slice(-10).map((k) => k.close)
    const firstPrice = recentPrices[0]
    const lastPrice = recentPrices[recentPrices.length - 1]
    const trendChange = (lastPrice - firstPrice) / firstPrice

    let trend: "bullish" | "bearish" | "sideways" = "sideways"
    if (trendChange > 0.02) trend = "bullish"
    else if (trendChange < -0.02) trend = "bearish"

    // Calculate support and resistance
    const highs = klines.slice(-20).map((k) => k.high)
    const lows = klines.slice(-20).map((k) => k.low)
    const resistance = Math.max(...highs)
    const support = Math.min(...lows)

    // Determine sentiment based on multiple factors
    let sentiment: "bullish" | "bearish" | "neutral" = "neutral"
    let confidence = 0.5

    if (rsi > 70 && trend === "bullish") {
      sentiment = "bearish" // Overbought
      confidence = 0.7
    } else if (rsi < 30 && trend === "bearish") {
      sentiment = "bullish" // Oversold
      confidence = 0.7
    } else if (trend === "bullish" && rsi > 50) {
      sentiment = "bullish"
      confidence = 0.6
    } else if (trend === "bearish" && rsi < 50) {
      sentiment = "bearish"
      confidence = 0.6
    }

    return {
      volatility,
      trend,
      volume: ticker.volume24h,
      support,
      resistance,
      rsi,
      sentiment,
      confidence,
    }
  }

  private calculateRSI(klines: Kline[], period = 14): number {
    if (klines.length < period + 1) return 50

    const prices = klines.slice(-period - 1).map((k) => k.close)
    const gains: number[] = []
    const losses: number[] = []

    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1]
      gains.push(change > 0 ? change : 0)
      losses.push(change < 0 ? Math.abs(change) : 0)
    }

    const avgGain = gains.reduce((sum, gain) => sum + gain, 0) / gains.length
    const avgLoss = losses.reduce((sum, loss) => sum + loss, 0) / losses.length

    if (avgLoss === 0) return 100

    const rs = avgGain / avgLoss
    return 100 - 100 / (1 + rs)
  }

  private prepareAnalysisContext(bot: UserBot, ticker: Ticker, marketAnalysis: MarketAnalysis): string {
    return `
Analyze the trading bot risk for the following configuration:

Bot Details:
- Strategy: ${bot.strategy}
- Symbol: ${bot.symbol}
- Investment: $${bot.config.investment}
- Lot Size: ${bot.config.lotSize}
- Take Profit: ${bot.config.takeProfit}%
- Stop Loss: ${bot.config.stopLoss}%
- Risk Level Setting: ${bot.config.riskLevel}%

Market Conditions:
- Current Price: $${ticker.price}
- 24h Change: ${ticker.change24h}%
- 24h Volume: $${ticker.volume24h.toLocaleString()}
- Volatility: ${marketAnalysis.volatility.toFixed(2)}%
- Trend: ${marketAnalysis.trend}
- RSI: ${marketAnalysis.rsi.toFixed(1)}
- Market Sentiment: ${marketAnalysis.sentiment}

Strategy Parameters:
${JSON.stringify(bot.config.parameters, null, 2)}

Please analyze the risk factors and provide insights on:
1. Market volatility impact
2. Strategy suitability for current conditions
3. Position sizing appropriateness
4. Potential drawdown scenarios
5. Overall risk assessment
    `
  }

  private async getAIAnalysis(context: string): Promise<any> {
    try {
      const { text } = await generateText({
        model: openai("gpt-4"),
        prompt: `${context}

Provide a structured analysis in the following format:
- Risk Factors: List specific risks
- Market Suitability: How well the strategy fits current market
- Position Risk: Assessment of position sizing
- Recommendations: Specific actionable advice
- Overall Assessment: Summary with risk level (low/medium/high/extreme)`,
        maxTokens: 1000,
      })

      return { analysis: text }
    } catch (error) {
      console.error("AI analysis failed:", error)
      return { analysis: "AI analysis unavailable" }
    }
  }

  private calculateRiskScore(bot: UserBot, marketAnalysis: MarketAnalysis, aiAnalysis: any): number {
    let riskScore = 0

    // Base risk from strategy
    const strategyRisk = {
      dca: 20,
      scalping: 60,
      grid: 40,
      arbitrage: 30,
      "long-short": 70,
      "trend-following": 50,
    }
    riskScore += strategyRisk[bot.strategy as keyof typeof strategyRisk] || 40

    // Market volatility risk
    if (marketAnalysis.volatility > 5) riskScore += 15
    if (marketAnalysis.volatility > 10) riskScore += 15
    if (marketAnalysis.volatility > 20) riskScore += 20

    // Position size risk
    const positionRisk = (bot.config.investment / 10000) * 100 // Risk increases with position size
    riskScore += Math.min(positionRisk, 20)

    // Stop loss risk
    if (bot.config.stopLoss > 10) riskScore += 10
    if (bot.config.stopLoss > 20) riskScore += 15

    // Take profit risk (too high expectations)
    if (bot.config.takeProfit > 20) riskScore += 10

    // Market conditions risk
    if (marketAnalysis.rsi > 80 || marketAnalysis.rsi < 20) riskScore += 10
    if (marketAnalysis.sentiment === "bearish" && bot.strategy !== "short") riskScore += 15

    // User risk level setting
    riskScore += (bot.config.riskLevel - 50) * 0.3

    return Math.min(Math.max(riskScore, 0), 100)
  }

  private generateWarnings(bot: UserBot, marketAnalysis: MarketAnalysis, riskScore: number): string[] {
    const warnings: string[] = []

    if (riskScore > 70) {
      warnings.push("⚠️ EXTREME RISK: This configuration has very high risk of significant losses")
    }

    if (marketAnalysis.volatility > 15) {
      warnings.push(
        `⚠️ HIGH VOLATILITY: ${bot.symbol} is experiencing ${marketAnalysis.volatility.toFixed(1)}% volatility`,
      )
    }

    if (bot.config.stopLoss > 15) {
      warnings.push(`⚠️ LARGE STOP LOSS: ${bot.config.stopLoss}% stop loss may result in significant losses`)
    }

    if (bot.config.investment > 5000) {
      warnings.push("⚠️ LARGE POSITION: Consider starting with a smaller investment amount")
    }

    if (marketAnalysis.rsi > 75) {
      warnings.push(`⚠️ OVERBOUGHT MARKET: ${bot.symbol} RSI is ${marketAnalysis.rsi.toFixed(1)} (overbought)`)
    }

    if (marketAnalysis.rsi < 25) {
      warnings.push(`⚠️ OVERSOLD MARKET: ${bot.symbol} RSI is ${marketAnalysis.rsi.toFixed(1)} (oversold)`)
    }

    if (bot.strategy === "scalping" && marketAnalysis.volatility < 2) {
      warnings.push("⚠️ LOW VOLATILITY: Scalping strategy may not be effective in low volatility conditions")
    }

    if (bot.strategy === "dca" && marketAnalysis.trend === "bearish") {
      warnings.push("⚠️ BEARISH TREND: DCA strategy may face prolonged losses in bearish markets")
    }

    return warnings
  }

  private generateRecommendations(bot: UserBot, marketAnalysis: MarketAnalysis, riskScore: number): string[] {
    const recommendations: string[] = []

    if (riskScore > 60) {
      recommendations.push("💡 Consider reducing position size by 50%")
      recommendations.push("💡 Implement tighter stop-loss levels")
    }

    if (marketAnalysis.volatility > 10) {
      recommendations.push("💡 Use smaller lot sizes due to high volatility")
      recommendations.push("💡 Consider shorter time frames for entries/exits")
    }

    if (bot.config.stopLoss > 10) {
      recommendations.push(`💡 Consider reducing stop loss from ${bot.config.stopLoss}% to 5-8%`)
    }

    if (bot.strategy === "dca" && marketAnalysis.trend === "bearish") {
      recommendations.push("💡 Consider waiting for trend reversal or use shorter DCA intervals")
    }

    if (bot.strategy === "scalping" && marketAnalysis.volatility < 3) {
      recommendations.push("💡 Switch to trend-following strategy in low volatility conditions")
    }

    if (marketAnalysis.rsi > 70) {
      recommendations.push("💡 Wait for RSI to cool down before starting long positions")
    }

    if (marketAnalysis.rsi < 30) {
      recommendations.push("💡 Good opportunity for DCA or long strategies")
    }

    recommendations.push("💡 Start with paper trading to test strategy performance")
    recommendations.push("💡 Monitor bot performance closely for the first 24 hours")

    return recommendations
  }

  private determineRiskLevel(riskScore: number): "low" | "medium" | "high" | "extreme" {
    if (riskScore < 25) return "low"
    if (riskScore < 50) return "medium"
    if (riskScore < 75) return "high"
    return "extreme"
  }

  private basicRiskAnalysis(bot: UserBot, ticker: Ticker): RiskAnalysis {
    let riskScore = 30 // Base risk

    // Strategy-based risk
    if (bot.strategy === "scalping") riskScore += 30
    if (bot.strategy === "long-short") riskScore += 25

    // Position size risk
    if (bot.config.investment > 1000) riskScore += 15
    if (bot.config.investment > 5000) riskScore += 20

    // Market change risk
    if (Math.abs(ticker.change24h) > 10) riskScore += 20

    const riskLevel = this.determineRiskLevel(riskScore)

    return {
      riskScore,
      riskLevel,
      warnings: riskScore > 50 ? ["⚠️ High risk detected - proceed with caution"] : [],
      recommendations: ["💡 Monitor bot performance closely", "💡 Consider starting with smaller position"],
      canStart: riskScore < 80,
      requiresConfirmation: riskScore > 40,
    }
  }

  async analyzeMarketSentiment(
    symbol: string,
    timeframe = "1d",
  ): Promise<{
    sentiment: "bullish" | "bearish" | "neutral"
    confidence: number
    signals: string[]
    recommendations: string[]
  }> {
    try {
      const { text } = await generateText({
        model: openai("gpt-4"),
        prompt: `Analyze the current market sentiment for ${symbol} cryptocurrency.

Consider the following factors:
- Recent price action and trends
- Market volume and volatility
- Technical indicators (RSI, MACD, moving averages)
- Overall crypto market conditions
- News sentiment and social media buzz

Provide analysis in this format:
Sentiment: [bullish/bearish/neutral]
Confidence: [0-100]%
Key Signals: [list of technical/fundamental signals]
Recommendations: [actionable trading advice]`,
        maxTokens: 500,
      })

      // Parse AI response (simplified)
      const sentiment = text.toLowerCase().includes("bullish")
        ? "bullish"
        : text.toLowerCase().includes("bearish")
          ? "bearish"
          : "neutral"

      const confidenceMatch = text.match(/(\d+)%/)
      const confidence = confidenceMatch ? Number.parseInt(confidenceMatch[1]) : 50

      return {
        sentiment,
        confidence: confidence / 100,
        signals: ["Technical analysis completed", "Market sentiment analyzed"],
        recommendations: ["Monitor market conditions", "Use appropriate risk management"],
      }
    } catch (error) {
      console.error("Market sentiment analysis failed:", error)
      return {
        sentiment: "neutral",
        confidence: 0.3,
        signals: ["Analysis unavailable"],
        recommendations: ["Use caution in current market conditions"],
      }
    }
  }
}

export const aiRiskAnalyzer = new AIRiskAnalyzer()
