interface MarketData {
  symbol: string
  price: number
  change24h: number
  volume24h: number
  marketCap: number
  high24h: number
  low24h: number
  timestamp: number
}

interface TechnicalIndicators {
  rsi: number
  macd: {
    macd: number
    signal: number
    histogram: number
  }
  bollingerBands: {
    upper: number
    middle: number
    lower: number
  }
  stochastic: {
    k: number
    d: number
  }
  williamsR: number
  cci: number
  roc: number
  ma20: number
  ma50: number
  ma200: number
}

interface ScreenerResult {
  symbol: string
  exchange: string
  price: number
  change24h: number
  volume24h: number
  marketCap: number
  score: number
  indicators: TechnicalIndicators
  signals: string[]
  lastUpdate: number
}

interface ScreenerFilters {
  minPrice?: number
  maxPrice?: number
  minVolume?: number
  minMarketCap?: number
  maxMarketCap?: number
  exchanges?: string[]
  symbols?: string[]
  minRSI?: number
  maxRSI?: number
  minChange?: number
  maxChange?: number
}

class RealTimeScreener {
  private wsConnections: Map<string, WebSocket> = new Map()
  private marketData: Map<string, MarketData> = new Map()
  private indicators: Map<string, TechnicalIndicators> = new Map()
  private priceHistory: Map<string, number[]> = new Map()
  private isRunning = false
  private updateInterval: NodeJS.Timeout | null = null

  constructor() {
    this.initializeConnections()
  }

  private async initializeConnections() {
    const exchanges = ["binance", "bybit", "coinbase", "kraken"]

    for (const exchange of exchanges) {
      try {
        await this.connectToExchange(exchange)
      } catch (error) {
        console.error(`Failed to connect to ${exchange}:`, error)
      }
    }
  }

  private async connectToExchange(exchange: string) {
    const wsUrls = {
      binance: "wss://stream.binance.com:9443/ws/!ticker@arr",
      bybit: "wss://stream.bybit.com/v5/public/spot",
      coinbase: "wss://ws-feed.exchange.coinbase.com",
      kraken: "wss://ws.kraken.com",
    }

    const wsUrl = wsUrls[exchange as keyof typeof wsUrls]
    if (!wsUrl) return

    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      console.log(`Connected to ${exchange}`)
      this.setupExchangeSubscription(ws, exchange)
    }

    ws.onmessage = (event) => {
      this.handleMarketData(JSON.parse(event.data), exchange)
    }

    ws.onerror = (error) => {
      console.error(`${exchange} WebSocket error:`, error)
    }

    ws.onclose = () => {
      console.log(`${exchange} connection closed, reconnecting...`)
      setTimeout(() => this.connectToExchange(exchange), 5000)
    }

    this.wsConnections.set(exchange, ws)
  }

  private setupExchangeSubscription(ws: WebSocket, exchange: string) {
    const subscriptions = {
      binance: null, // Already subscribed to all tickers
      bybit: {
        op: "subscribe",
        args: ["tickers.spot"],
      },
      coinbase: {
        type: "subscribe",
        product_ids: ["BTC-USD", "ETH-USD", "ADA-USD", "DOT-USD"],
        channels: ["ticker"],
      },
      kraken: {
        event: "subscribe",
        pair: ["XBT/USD", "ETH/USD", "ADA/USD", "DOT/USD"],
        subscription: { name: "ticker" },
      },
    }

    const subscription = subscriptions[exchange as keyof typeof subscriptions]
    if (subscription) {
      ws.send(JSON.stringify(subscription))
    }
  }

  private handleMarketData(data: any, exchange: string) {
    try {
      const marketData = this.parseMarketData(data, exchange)
      if (marketData) {
        this.marketData.set(`${exchange}:${marketData.symbol}`, marketData)
        this.updatePriceHistory(marketData.symbol, marketData.price)
        this.calculateTechnicalIndicators(marketData.symbol)
      }
    } catch (error) {
      console.error(`Error handling market data from ${exchange}:`, error)
    }
  }

  private parseMarketData(data: any, exchange: string): MarketData | null {
    switch (exchange) {
      case "binance":
        if (Array.isArray(data)) {
          return data.map((ticker) => ({
            symbol: ticker.s,
            price: Number.parseFloat(ticker.c),
            change24h: Number.parseFloat(ticker.P),
            volume24h: Number.parseFloat(ticker.v),
            marketCap: 0, // Would need additional API call
            high24h: Number.parseFloat(ticker.h),
            low24h: Number.parseFloat(ticker.l),
            timestamp: Date.now(),
          }))[0]
        }
        break

      case "bybit":
        if (data.topic === "tickers.spot" && data.data) {
          return {
            symbol: data.data.symbol,
            price: Number.parseFloat(data.data.lastPrice),
            change24h: Number.parseFloat(data.data.price24hPcnt) * 100,
            volume24h: Number.parseFloat(data.data.volume24h),
            marketCap: 0,
            high24h: Number.parseFloat(data.data.highPrice24h),
            low24h: Number.parseFloat(data.data.lowPrice24h),
            timestamp: Date.now(),
          }
        }
        break

      case "coinbase":
        if (data.type === "ticker") {
          return {
            symbol: data.product_id,
            price: Number.parseFloat(data.price),
            change24h: Number.parseFloat(data.open_24h)
              ? ((Number.parseFloat(data.price) - Number.parseFloat(data.open_24h)) /
                  Number.parseFloat(data.open_24h)) *
                100
              : 0,
            volume24h: Number.parseFloat(data.volume_24h),
            marketCap: 0,
            high24h: Number.parseFloat(data.high_24h),
            low24h: Number.parseFloat(data.low_24h),
            timestamp: Date.now(),
          }
        }
        break

      case "kraken":
        if (data[1] && data[2] === "ticker") {
          const ticker = data[1]
          return {
            symbol: data[3],
            price: Number.parseFloat(ticker.c[0]),
            change24h: 0, // Would need calculation
            volume24h: Number.parseFloat(ticker.v[1]),
            marketCap: 0,
            high24h: Number.parseFloat(ticker.h[1]),
            low24h: Number.parseFloat(ticker.l[1]),
            timestamp: Date.now(),
          }
        }
        break
    }

    return null
  }

  private updatePriceHistory(symbol: string, price: number) {
    if (!this.priceHistory.has(symbol)) {
      this.priceHistory.set(symbol, [])
    }

    const history = this.priceHistory.get(symbol)!
    history.push(price)

    // Keep only last 200 prices for calculations
    if (history.length > 200) {
      history.shift()
    }
  }

  private calculateTechnicalIndicators(symbol: string) {
    const history = this.priceHistory.get(symbol)
    if (!history || history.length < 20) return

    const indicators: TechnicalIndicators = {
      rsi: this.calculateRSI(history),
      macd: this.calculateMACD(history),
      bollingerBands: this.calculateBollingerBands(history),
      stochastic: this.calculateStochastic(history),
      williamsR: this.calculateWilliamsR(history),
      cci: this.calculateCCI(history),
      roc: this.calculateROC(history),
      ma20: this.calculateMA(history, 20),
      ma50: this.calculateMA(history, 50),
      ma200: this.calculateMA(history, 200),
    }

    this.indicators.set(symbol, indicators)
  }

  private calculateRSI(prices: number[], period = 14): number {
    if (prices.length < period + 1) return 50

    let gains = 0
    let losses = 0

    for (let i = 1; i <= period; i++) {
      const change = prices[prices.length - i] - prices[prices.length - i - 1]
      if (change > 0) gains += change
      else losses -= change
    }

    const avgGain = gains / period
    const avgLoss = losses / period

    if (avgLoss === 0) return 100
    const rs = avgGain / avgLoss
    return 100 - 100 / (1 + rs)
  }

  private calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
    const ema12 = this.calculateEMA(prices, 12)
    const ema26 = this.calculateEMA(prices, 26)
    const macd = ema12 - ema26

    // For simplicity, using a basic signal calculation
    const signal = macd * 0.9 // Simplified signal line
    const histogram = macd - signal

    return { macd, signal, histogram }
  }

  private calculateEMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1] || 0

    const multiplier = 2 / (period + 1)
    let ema = prices[prices.length - period]

    for (let i = prices.length - period + 1; i < prices.length; i++) {
      ema = (prices[i] - ema) * multiplier + ema
    }

    return ema
  }

  private calculateBollingerBands(prices: number[], period = 20): { upper: number; middle: number; lower: number } {
    const ma = this.calculateMA(prices, period)
    const variance = this.calculateVariance(prices.slice(-period), ma)
    const stdDev = Math.sqrt(variance)

    return {
      upper: ma + stdDev * 2,
      middle: ma,
      lower: ma - stdDev * 2,
    }
  }

  private calculateMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1] || 0

    const slice = prices.slice(-period)
    return slice.reduce((sum, price) => sum + price, 0) / slice.length
  }

  private calculateVariance(prices: number[], mean: number): number {
    const squaredDiffs = prices.map((price) => Math.pow(price - mean, 2))
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / prices.length
  }

  private calculateStochastic(prices: number[], period = 14): { k: number; d: number } {
    if (prices.length < period) return { k: 50, d: 50 }

    const slice = prices.slice(-period)
    const high = Math.max(...slice)
    const low = Math.min(...slice)
    const current = prices[prices.length - 1]

    const k = ((current - low) / (high - low)) * 100
    const d = k * 0.9 // Simplified %D calculation

    return { k, d }
  }

  private calculateWilliamsR(prices: number[], period = 14): number {
    if (prices.length < period) return -50

    const slice = prices.slice(-period)
    const high = Math.max(...slice)
    const low = Math.min(...slice)
    const current = prices[prices.length - 1]

    return ((high - current) / (high - low)) * -100
  }

  private calculateCCI(prices: number[], period = 20): number {
    if (prices.length < period) return 0

    const ma = this.calculateMA(prices, period)
    const slice = prices.slice(-period)
    const meanDeviation = slice.reduce((sum, price) => sum + Math.abs(price - ma), 0) / period

    const current = prices[prices.length - 1]
    return (current - ma) / (0.015 * meanDeviation)
  }

  private calculateROC(prices: number[], period = 12): number {
    if (prices.length < period + 1) return 0

    const current = prices[prices.length - 1]
    const previous = prices[prices.length - period - 1]

    return ((current - previous) / previous) * 100
  }

  public async screen(filters: ScreenerFilters = {}): Promise<ScreenerResult[]> {
    const results: ScreenerResult[] = []

    for (const [key, marketData] of this.marketData.entries()) {
      const [exchange, symbol] = key.split(":")
      const indicators = this.indicators.get(symbol)

      if (!indicators) continue

      // Apply filters
      if (filters.minPrice && marketData.price < filters.minPrice) continue
      if (filters.maxPrice && marketData.price > filters.maxPrice) continue
      if (filters.minVolume && marketData.volume24h < filters.minVolume) continue
      if (filters.minMarketCap && marketData.marketCap < filters.minMarketCap) continue
      if (filters.maxMarketCap && marketData.marketCap > filters.maxMarketCap) continue
      if (filters.exchanges && !filters.exchanges.includes(exchange)) continue
      if (filters.symbols && !filters.symbols.includes(symbol)) continue
      if (filters.minRSI && indicators.rsi < filters.minRSI) continue
      if (filters.maxRSI && indicators.rsi > filters.maxRSI) continue
      if (filters.minChange && marketData.change24h < filters.minChange) continue
      if (filters.maxChange && marketData.change24h > filters.maxChange) continue

      const signals = this.generateSignals(marketData, indicators)
      const score = this.calculateScore(marketData, indicators, signals)

      results.push({
        symbol,
        exchange,
        price: marketData.price,
        change24h: marketData.change24h,
        volume24h: marketData.volume24h,
        marketCap: marketData.marketCap,
        score,
        indicators,
        signals,
        lastUpdate: marketData.timestamp,
      })
    }

    return results.sort((a, b) => b.score - a.score)
  }

  private generateSignals(marketData: MarketData, indicators: TechnicalIndicators): string[] {
    const signals: string[] = []

    // RSI signals
    if (indicators.rsi > 70) signals.push("RSI Overbought")
    if (indicators.rsi < 30) signals.push("RSI Oversold")

    // MACD signals
    if (indicators.macd.macd > indicators.macd.signal) signals.push("MACD Bullish")
    if (indicators.macd.macd < indicators.macd.signal) signals.push("MACD Bearish")

    // Bollinger Bands signals
    if (marketData.price > indicators.bollingerBands.upper) signals.push("Above Upper BB")
    if (marketData.price < indicators.bollingerBands.lower) signals.push("Below Lower BB")

    // Moving Average signals
    if (marketData.price > indicators.ma20) signals.push("Above MA20")
    if (marketData.price > indicators.ma50) signals.push("Above MA50")
    if (marketData.price > indicators.ma200) signals.push("Above MA200")

    // Volume signals
    if (marketData.volume24h > 1000000) signals.push("High Volume")

    // Price change signals
    if (marketData.change24h > 5) signals.push("Strong Bullish")
    if (marketData.change24h < -5) signals.push("Strong Bearish")

    return signals
  }

  private calculateScore(marketData: MarketData, indicators: TechnicalIndicators, signals: string[]): number {
    let score = 50 // Base score

    // RSI scoring
    if (indicators.rsi > 30 && indicators.rsi < 70) score += 10
    if (indicators.rsi < 30) score += 15 // Oversold opportunity
    if (indicators.rsi > 70) score -= 10 // Overbought risk

    // MACD scoring
    if (indicators.macd.macd > indicators.macd.signal) score += 10
    if (indicators.macd.histogram > 0) score += 5

    // Volume scoring
    if (marketData.volume24h > 1000000) score += 15
    if (marketData.volume24h > 10000000) score += 10

    // Price change scoring
    score += Math.min(Math.max(marketData.change24h, -20), 20)

    // Signal bonus
    score += signals.length * 2

    return Math.max(0, Math.min(100, score))
  }

  public getMarketData(symbol: string): MarketData | undefined {
    for (const [key, data] of this.marketData.entries()) {
      if (key.includes(symbol)) return data
    }
    return undefined
  }

  public getIndicators(symbol: string): TechnicalIndicators | undefined {
    return this.indicators.get(symbol)
  }

  public start() {
    if (this.isRunning) return

    this.isRunning = true
    this.updateInterval = setInterval(() => {
      // Periodic cleanup and maintenance
      this.cleanupOldData()
    }, 60000) // Every minute

    console.log("Real-time screener started")
  }

  public stop() {
    if (!this.isRunning) return

    this.isRunning = false
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }

    // Close WebSocket connections
    for (const ws of this.wsConnections.values()) {
      ws.close()
    }
    this.wsConnections.clear()

    console.log("Real-time screener stopped")
  }

  private cleanupOldData() {
    const now = Date.now()
    const maxAge = 5 * 60 * 1000 // 5 minutes

    for (const [key, data] of this.marketData.entries()) {
      if (now - data.timestamp > maxAge) {
        this.marketData.delete(key)
        const symbol = key.split(":")[1]
        this.indicators.delete(symbol)
        this.priceHistory.delete(symbol)
      }
    }
  }

  public getStats() {
    return {
      connectedExchanges: this.wsConnections.size,
      trackedSymbols: this.marketData.size,
      indicatorsCalculated: this.indicators.size,
      isRunning: this.isRunning,
      lastUpdate: Math.max(...Array.from(this.marketData.values()).map((d) => d.timestamp)),
    }
  }
}

export const realTimeScreener = new RealTimeScreener()
