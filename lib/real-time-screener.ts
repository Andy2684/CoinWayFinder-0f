// Real-time cryptocurrency screening and analysis engine

import { marketDataManager } from "./market-data-ingestion"

export interface ScreeningCriteria {
  priceChange24h?: { min?: number; max?: number }
  volume24h?: { min?: number; max?: number }
  marketCap?: { min?: number; max?: number }
  price?: { min?: number; max?: number }
  rsi?: { min?: number; max?: number }
  macd?: { signal?: "bullish" | "bearish" | "neutral" }
  movingAverage?: { period: number; position: "above" | "below" }
  volatility?: { min?: number; max?: number }
  exchanges?: string[]
  symbols?: string[]
}

export interface ScreeningResult {
  symbol: string
  exchange: string
  price: number
  priceChange24h: number
  volume24h: number
  marketCap: number
  rsi: number
  macd: {
    value: number
    signal: number
    histogram: number
    trend: "bullish" | "bearish" | "neutral"
  }
  movingAverages: {
    ma20: number
    ma50: number
    ma200: number
  }
  volatility: number
  score: number
  alerts: string[]
  timestamp: number
}

export interface TechnicalIndicators {
  rsi: number
  macd: {
    value: number
    signal: number
    histogram: number
  }
  bollinger: {
    upper: number
    middle: number
    lower: number
  }
  stochastic: {
    k: number
    d: number
  }
  williams: number
  cci: number
  momentum: number
  roc: number
}

export class RealTimeScreener {
  private static instance: RealTimeScreener
  private subscribers: Map<string, ((results: ScreeningResult[]) => void)[]> = new Map()
  private screeningIntervals: Map<string, NodeJS.Timeout> = new Map()
  private priceHistory: Map<string, number[]> = new Map()
  private volumeHistory: Map<string, number[]> = new Map()

  static getInstance(): RealTimeScreener {
    if (!RealTimeScreener.instance) {
      RealTimeScreener.instance = new RealTimeScreener()
    }
    return RealTimeScreener.instance
  }

  // Start real-time screening with custom criteria
  startScreening(
    screenId: string,
    criteria: ScreeningCriteria,
    callback: (results: ScreeningResult[]) => void,
    intervalMs = 5000,
  ): void {
    // Stop existing screening if running
    this.stopScreening(screenId)

    // Add subscriber
    if (!this.subscribers.has(screenId)) {
      this.subscribers.set(screenId, [])
    }
    this.subscribers.get(screenId)!.push(callback)

    // Start screening interval
    const interval = setInterval(async () => {
      try {
        const results = await this.performScreening(criteria)
        const subscribers = this.subscribers.get(screenId)
        if (subscribers) {
          subscribers.forEach((cb) => cb(results))
        }
      } catch (error) {
        console.error(`Screening error for ${screenId}:`, error)
      }
    }, intervalMs)

    this.screeningIntervals.set(screenId, interval)
  }

  // Stop screening
  stopScreening(screenId: string): void {
    const interval = this.screeningIntervals.get(screenId)
    if (interval) {
      clearInterval(interval)
      this.screeningIntervals.delete(screenId)
    }
    this.subscribers.delete(screenId)
  }

  // Perform screening based on criteria
  private async performScreening(criteria: ScreeningCriteria): Promise<ScreeningResult[]> {
    const exchanges = criteria.exchanges || ["binance", "bybit", "coinbase"]
    const symbols = criteria.symbols || (await this.getPopularSymbols())
    const results: ScreeningResult[] = []

    for (const exchange of exchanges) {
      for (const symbol of symbols) {
        try {
          const marketData = await marketDataManager.getMarketData([symbol], exchange)
          if (marketData.length === 0) continue

          const data = marketData[0]
          const technicals = await this.calculateTechnicalIndicators(symbol, exchange)
          const marketCap = await this.estimateMarketCap(symbol, data.price)

          const result: ScreeningResult = {
            symbol,
            exchange,
            price: data.price,
            priceChange24h: data.changePercent,
            volume24h: data.volume,
            marketCap,
            rsi: technicals.rsi,
            macd: {
              value: technicals.macd.value,
              signal: technicals.macd.signal,
              histogram: technicals.macd.histogram,
              trend: this.getMacdTrend(technicals.macd),
            },
            movingAverages: {
              ma20: await this.calculateMA(symbol, exchange, 20),
              ma50: await this.calculateMA(symbol, exchange, 50),
              ma200: await this.calculateMA(symbol, exchange, 200),
            },
            volatility: await this.calculateVolatility(symbol, exchange),
            score: 0,
            alerts: [],
            timestamp: Date.now(),
          }

          // Apply screening criteria
          if (this.matchesCriteria(result, criteria)) {
            result.score = this.calculateScore(result, criteria)
            result.alerts = this.generateAlerts(result, criteria)
            results.push(result)
          }
        } catch (error) {
          console.error(`Error screening ${symbol} on ${exchange}:`, error)
        }
      }
    }

    // Sort by score (highest first)
    return results.sort((a, b) => b.score - a.score)
  }

  // Calculate technical indicators
  private async calculateTechnicalIndicators(symbol: string, exchange: string): Promise<TechnicalIndicators> {
    const prices = await this.getPriceHistory(symbol, exchange, 50)

    return {
      rsi: this.calculateRSI(prices),
      macd: this.calculateMACD(prices),
      bollinger: this.calculateBollingerBands(prices),
      stochastic: this.calculateStochastic(prices),
      williams: this.calculateWilliamsR(prices),
      cci: this.calculateCCI(prices),
      momentum: this.calculateMomentum(prices),
      roc: this.calculateROC(prices),
    }
  }

  // RSI Calculation
  private calculateRSI(prices: number[], period = 14): number {
    if (prices.length < period + 1) return 50

    const gains: number[] = []
    const losses: number[] = []

    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1]
      gains.push(change > 0 ? change : 0)
      losses.push(change < 0 ? Math.abs(change) : 0)
    }

    const avgGain = gains.slice(-period).reduce((sum, gain) => sum + gain, 0) / period
    const avgLoss = losses.slice(-period).reduce((sum, loss) => sum + loss, 0) / period

    if (avgLoss === 0) return 100
    const rs = avgGain / avgLoss
    return 100 - 100 / (1 + rs)
  }

  // MACD Calculation
  private calculateMACD(prices: number[]): { value: number; signal: number; histogram: number } {
    const ema12 = this.calculateEMA(prices, 12)
    const ema26 = this.calculateEMA(prices, 26)
    const macdLine = ema12 - ema26

    // For simplicity, using a basic signal calculation
    const signalLine = macdLine * 0.9 // Simplified signal line
    const histogram = macdLine - signalLine

    return {
      value: macdLine,
      signal: signalLine,
      histogram: histogram,
    }
  }

  // EMA Calculation
  private calculateEMA(prices: number[], period: number): number {
    if (prices.length === 0) return 0

    const multiplier = 2 / (period + 1)
    let ema = prices[0]

    for (let i = 1; i < prices.length; i++) {
      ema = prices[i] * multiplier + ema * (1 - multiplier)
    }

    return ema
  }

  // Bollinger Bands Calculation
  private calculateBollingerBands(prices: number[], period = 20): { upper: number; middle: number; lower: number } {
    const sma = prices.slice(-period).reduce((sum, price) => sum + price, 0) / period
    const variance = prices.slice(-period).reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period
    const stdDev = Math.sqrt(variance)

    return {
      upper: sma + stdDev * 2,
      middle: sma,
      lower: sma - stdDev * 2,
    }
  }

  // Stochastic Oscillator
  private calculateStochastic(prices: number[], period = 14): { k: number; d: number } {
    const recentPrices = prices.slice(-period)
    const high = Math.max(...recentPrices)
    const low = Math.min(...recentPrices)
    const current = prices[prices.length - 1]

    const k = ((current - low) / (high - low)) * 100
    const d = k * 0.9 // Simplified D calculation

    return { k, d }
  }

  // Williams %R
  private calculateWilliamsR(prices: number[], period = 14): number {
    const recentPrices = prices.slice(-period)
    const high = Math.max(...recentPrices)
    const low = Math.min(...recentPrices)
    const current = prices[prices.length - 1]

    return ((high - current) / (high - low)) * -100
  }

  // Commodity Channel Index
  private calculateCCI(prices: number[], period = 20): number {
    const sma = prices.slice(-period).reduce((sum, price) => sum + price, 0) / period
    const meanDeviation = prices.slice(-period).reduce((sum, price) => sum + Math.abs(price - sma), 0) / period
    const current = prices[prices.length - 1]

    return (current - sma) / (0.015 * meanDeviation)
  }

  // Momentum
  private calculateMomentum(prices: number[], period = 10): number {
    if (prices.length < period) return 0
    return prices[prices.length - 1] - prices[prices.length - 1 - period]
  }

  // Rate of Change
  private calculateROC(prices: number[], period = 12): number {
    if (prices.length < period) return 0
    const current = prices[prices.length - 1]
    const previous = prices[prices.length - 1 - period]
    return ((current - previous) / previous) * 100
  }

  // Moving Average calculation
  private async calculateMA(symbol: string, exchange: string, period: number): Promise<number> {
    const prices = await this.getPriceHistory(symbol, exchange, period)
    if (prices.length < period) return 0
    return prices.slice(-period).reduce((sum, price) => sum + price, 0) / period
  }

  // Volatility calculation
  private async calculateVolatility(symbol: string, exchange: string): Promise<number> {
    const prices = await this.getPriceHistory(symbol, exchange, 20)
    if (prices.length < 2) return 0

    const returns = []
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1])
    }

    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length
    return Math.sqrt(variance) * Math.sqrt(365) * 100 // Annualized volatility
  }

  // Get price history (mock implementation)
  private async getPriceHistory(symbol: string, exchange: string, periods: number): Promise<number[]> {
    const key = `${exchange}:${symbol}`

    if (!this.priceHistory.has(key)) {
      // Generate mock price history
      const basePrice = 100 + Math.random() * 50000
      const prices = []
      let currentPrice = basePrice

      for (let i = 0; i < periods; i++) {
        const change = (Math.random() - 0.5) * 0.05 // ±2.5% change
        currentPrice *= 1 + change
        prices.push(currentPrice)
      }

      this.priceHistory.set(key, prices)
    }

    return this.priceHistory.get(key)!
  }

  // Check if result matches criteria
  private matchesCriteria(result: ScreeningResult, criteria: ScreeningCriteria): boolean {
    if (criteria.priceChange24h) {
      if (criteria.priceChange24h.min !== undefined && result.priceChange24h < criteria.priceChange24h.min) return false
      if (criteria.priceChange24h.max !== undefined && result.priceChange24h > criteria.priceChange24h.max) return false
    }

    if (criteria.volume24h) {
      if (criteria.volume24h.min !== undefined && result.volume24h < criteria.volume24h.min) return false
      if (criteria.volume24h.max !== undefined && result.volume24h > criteria.volume24h.max) return false
    }

    if (criteria.marketCap) {
      if (criteria.marketCap.min !== undefined && result.marketCap < criteria.marketCap.min) return false
      if (criteria.marketCap.max !== undefined && result.marketCap > criteria.marketCap.max) return false
    }

    if (criteria.price) {
      if (criteria.price.min !== undefined && result.price < criteria.price.min) return false
      if (criteria.price.max !== undefined && result.price > criteria.price.max) return false
    }

    if (criteria.rsi) {
      if (criteria.rsi.min !== undefined && result.rsi < criteria.rsi.min) return false
      if (criteria.rsi.max !== undefined && result.rsi > criteria.rsi.max) return false
    }

    if (criteria.macd?.signal && result.macd.trend !== criteria.macd.signal) return false

    if (criteria.movingAverage) {
      const ma =
        criteria.movingAverage.period === 20
          ? result.movingAverages.ma20
          : criteria.movingAverage.period === 50
            ? result.movingAverages.ma50
            : result.movingAverages.ma200

      if (criteria.movingAverage.position === "above" && result.price <= ma) return false
      if (criteria.movingAverage.position === "below" && result.price >= ma) return false
    }

    if (criteria.volatility) {
      if (criteria.volatility.min !== undefined && result.volatility < criteria.volatility.min) return false
      if (criteria.volatility.max !== undefined && result.volatility > criteria.volatility.max) return false
    }

    return true
  }

  // Calculate screening score
  private calculateScore(result: ScreeningResult, criteria: ScreeningCriteria): number {
    let score = 0

    // Volume score (higher volume = higher score)
    score += Math.min(result.volume24h / 1000000, 10) // Max 10 points for volume

    // Price change score
    score += Math.abs(result.priceChange24h) / 2 // Max ~50 points for extreme moves

    // RSI score (extreme values get higher scores)
    if (result.rsi < 30 || result.rsi > 70) score += 15
    else if (result.rsi < 40 || result.rsi > 60) score += 5

    // MACD score
    if (result.macd.trend === "bullish") score += 10
    else if (result.macd.trend === "bearish") score += 8

    // Volatility score
    score += Math.min(result.volatility / 5, 15) // Max 15 points for volatility

    return Math.round(score)
  }

  // Generate alerts
  private generateAlerts(result: ScreeningResult, criteria: ScreeningCriteria): string[] {
    const alerts: string[] = []

    if (result.rsi < 30) alerts.push("Oversold condition (RSI < 30)")
    if (result.rsi > 70) alerts.push("Overbought condition (RSI > 70)")
    if (result.macd.trend === "bullish") alerts.push("MACD bullish crossover")
    if (result.macd.trend === "bearish") alerts.push("MACD bearish crossover")
    if (Math.abs(result.priceChange24h) > 10) alerts.push("High volatility (>10% change)")
    if (result.volume24h > 100000000) alerts.push("High volume activity")

    // Moving average alerts
    if (result.price > result.movingAverages.ma20) alerts.push("Price above MA20")
    if (result.price < result.movingAverages.ma20) alerts.push("Price below MA20")

    return alerts
  }

  // Get MACD trend
  private getMacdTrend(macd: { value: number; signal: number; histogram: number }): "bullish" | "bearish" | "neutral" {
    if (macd.histogram > 0 && macd.value > macd.signal) return "bullish"
    if (macd.histogram < 0 && macd.value < macd.signal) return "bearish"
    return "neutral"
  }

  // Estimate market cap (simplified)
  private async estimateMarketCap(symbol: string, price: number): Promise<number> {
    // Mock market cap calculation based on symbol
    const supplies: Record<string, number> = {
      BTCUSDT: 19700000,
      ETHUSDT: 120000000,
      BNBUSDT: 166000000,
      ADAUSDT: 35000000000,
      SOLUSDT: 400000000,
      DOTUSDT: 1100000000,
    }

    const supply = supplies[symbol] || 1000000000
    return price * supply
  }

  // Get popular symbols
  private async getPopularSymbols(): Promise<string[]> {
    return [
      "BTCUSDT",
      "ETHUSDT",
      "BNBUSDT",
      "ADAUSDT",
      "SOLUSDT",
      "DOTUSDT",
      "LINKUSDT",
      "AVAXUSDT",
      "MATICUSDT",
      "UNIUSDT",
      "LTCUSDT",
      "BCHUSDT",
      "XLMUSDT",
      "VETUSDT",
      "FILUSDT",
    ]
  }

  // Get all active screenings
  getActiveScreenings(): string[] {
    return Array.from(this.screeningIntervals.keys())
  }

  // Get screening statistics
  getScreeningStats(): { activeScreenings: number; totalSymbols: number; lastUpdate: number } {
    return {
      activeScreenings: this.screeningIntervals.size,
      totalSymbols: this.priceHistory.size,
      lastUpdate: Date.now(),
    }
  }
}

// Export singleton instance
export const realTimeScreener = RealTimeScreener.getInstance()
