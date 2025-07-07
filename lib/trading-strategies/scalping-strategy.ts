import type { ExchangeAPIClient, Ticker, OrderRequest } from "../exchange-api-client"
import { database, type TradeRecord } from "../database"

export interface ScalpingConfig {
  symbol: string
  quantity: number
  profitTarget: number // percentage
  stopLoss: number // percentage
  maxHoldTime: number // minutes
  rsiPeriod: number
  rsiOverbought: number
  rsiOversold: number
  macdFast: number
  macdSlow: number
  macdSignal: number
}

interface PriceData {
  price: number
  timestamp: number
}

export class ScalpingStrategy {
  private client: ExchangeAPIClient
  private config: ScalpingConfig
  private botId: string
  private userId: string
  private isRunning = false
  private priceHistory: PriceData[] = []
  private currentPosition: {
    side: "buy" | "sell" | null
    quantity: number
    entryPrice: number
    entryTime: number
    orderId?: string
  } = {
    side: null,
    quantity: 0,
    entryPrice: 0,
    entryTime: 0,
  }

  constructor(client: ExchangeAPIClient, config: ScalpingConfig, botId: string, userId: string) {
    this.client = client
    this.config = config
    this.botId = botId
    this.userId = userId
  }

  async start(): Promise<void> {
    if (this.isRunning) return

    this.isRunning = true
    console.log(`Starting Scalping strategy for ${this.config.symbol}`)

    // Start price monitoring
    this.monitorPrice()
  }

  async stop(): Promise<void> {
    this.isRunning = false

    // Close any open positions
    if (this.currentPosition.side) {
      await this.closePosition("strategy_stopped")
    }

    console.log(`Stopped Scalping strategy for ${this.config.symbol}`)
  }

  private async monitorPrice(): Promise<void> {
    while (this.isRunning) {
      try {
        const ticker = await this.client.getTicker(this.config.symbol)

        // Add to price history
        this.priceHistory.push({
          price: ticker.price,
          timestamp: Date.now(),
        })

        // Keep only recent data (last 200 points)
        if (this.priceHistory.length > 200) {
          this.priceHistory = this.priceHistory.slice(-200)
        }

        // Check for trading signals
        await this.checkSignals(ticker)

        // Check position management
        if (this.currentPosition.side) {
          await this.managePosition(ticker)
        }

        // Wait 5 seconds before next check
        await new Promise((resolve) => setTimeout(resolve, 5000))
      } catch (error) {
        console.error("Price monitoring error:", error)
        await new Promise((resolve) => setTimeout(resolve, 10000))
      }
    }
  }

  private async checkSignals(ticker: Ticker): Promise<void> {
    if (this.priceHistory.length < Math.max(this.config.rsiPeriod, this.config.macdSlow)) {
      return // Not enough data
    }

    if (this.currentPosition.side) {
      return // Already in position
    }

    const rsi = this.calculateRSI()
    const macd = this.calculateMACD()

    console.log(`RSI: ${rsi.toFixed(2)}, MACD: ${macd.macd.toFixed(4)}, Signal: ${macd.signal.toFixed(4)}`)

    // Buy signal: RSI oversold and MACD bullish crossover
    if (rsi < this.config.rsiOversold && macd.macd > macd.signal && macd.histogram > 0) {
      await this.openPosition("buy", ticker)
    }
    // Sell signal: RSI overbought and MACD bearish crossover
    else if (rsi > this.config.rsiOverbought && macd.macd < macd.signal && macd.histogram < 0) {
      await this.openPosition("sell", ticker)
    }
  }

  private async openPosition(side: "buy" | "sell", ticker: Ticker): Promise<void> {
    try {
      const order: OrderRequest = {
        symbol: this.config.symbol,
        side,
        type: "market",
        amount: this.config.quantity,
      }

      console.log(`Opening ${side} position: ${this.config.quantity} ${this.config.symbol} at $${ticker.price}`)

      const result = await this.client.placeOrder(order)

      this.currentPosition = {
        side,
        quantity: this.config.quantity,
        entryPrice: result.price,
        entryTime: Date.now(),
        orderId: result.orderId,
      }

      // Save trade record
      const trade: Omit<TradeRecord, "_id"> = {
        botId: this.botId,
        userId: this.userId,
        orderId: result.orderId,
        symbol: this.config.symbol,
        side,
        type: "market",
        amount: this.config.quantity,
        price: result.price,
        fee: 0,
        status: result.status,
        timestamp: new Date(),
        exchange: "binance",
      }

      await database.saveTrade(trade)

      console.log(`Position opened: ${side} ${this.config.quantity} at $${result.price}`)
    } catch (error) {
      console.error("Failed to open position:", error)
    }
  }

  private async managePosition(ticker: Ticker): Promise<void> {
    if (!this.currentPosition.side) return

    const currentTime = Date.now()
    const holdTime = (currentTime - this.currentPosition.entryTime) / (1000 * 60) // minutes

    let profitPercent = 0
    if (this.currentPosition.side === "buy") {
      profitPercent = ((ticker.price - this.currentPosition.entryPrice) / this.currentPosition.entryPrice) * 100
    } else {
      profitPercent = ((this.currentPosition.entryPrice - ticker.price) / this.currentPosition.entryPrice) * 100
    }

    console.log(`Position P&L: ${profitPercent.toFixed(2)}%, Hold time: ${holdTime.toFixed(1)}m`)

    // Check exit conditions
    if (profitPercent >= this.config.profitTarget) {
      await this.closePosition("take_profit")
    } else if (profitPercent <= -this.config.stopLoss) {
      await this.closePosition("stop_loss")
    } else if (holdTime >= this.config.maxHoldTime) {
      await this.closePosition("max_hold_time")
    }
  }

  private async closePosition(reason: string): Promise<void> {
    if (!this.currentPosition.side) return

    try {
      const oppositeSide = this.currentPosition.side === "buy" ? "sell" : "buy"

      const order: OrderRequest = {
        symbol: this.config.symbol,
        side: oppositeSide,
        type: "market",
        amount: this.currentPosition.quantity,
      }

      console.log(`Closing position due to ${reason}: ${oppositeSide} ${this.currentPosition.quantity}`)

      const result = await this.client.placeOrder(order)

      // Calculate profit
      let profit = 0
      if (this.currentPosition.side === "buy") {
        profit = (result.price - this.currentPosition.entryPrice) * this.currentPosition.quantity
      } else {
        profit = (this.currentPosition.entryPrice - result.price) * this.currentPosition.quantity
      }

      // Save trade record
      const trade: Omit<TradeRecord, "_id"> = {
        botId: this.botId,
        userId: this.userId,
        orderId: result.orderId,
        symbol: this.config.symbol,
        side: oppositeSide,
        type: "market",
        amount: this.currentPosition.quantity,
        price: result.price,
        fee: 0,
        profit,
        status: result.status,
        timestamp: new Date(),
        exchange: "binance",
      }

      await database.saveTrade(trade)

      console.log(
        `Position closed. Profit: $${profit.toFixed(2)} (${((profit / (this.currentPosition.entryPrice * this.currentPosition.quantity)) * 100).toFixed(2)}%)`,
      )

      // Reset position
      this.currentPosition = {
        side: null,
        quantity: 0,
        entryPrice: 0,
        entryTime: 0,
      }
    } catch (error) {
      console.error("Failed to close position:", error)
    }
  }

  private calculateRSI(): number {
    if (this.priceHistory.length < this.config.rsiPeriod + 1) return 50

    const prices = this.priceHistory.slice(-this.config.rsiPeriod - 1).map((p) => p.price)
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

  private calculateMACD(): { macd: number; signal: number; histogram: number } {
    if (this.priceHistory.length < this.config.macdSlow) {
      return { macd: 0, signal: 0, histogram: 0 }
    }

    const prices = this.priceHistory.map((p) => p.price)

    const emaFast = this.calculateEMA(prices, this.config.macdFast)
    const emaSlow = this.calculateEMA(prices, this.config.macdSlow)
    const macd = emaFast - emaSlow

    // For simplicity, using SMA instead of EMA for signal line
    const macdHistory = [macd] // In real implementation, maintain MACD history
    const signal = macd // Simplified - should be EMA of MACD line

    return {
      macd,
      signal,
      histogram: macd - signal,
    }
  }

  private calculateEMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1]

    const multiplier = 2 / (period + 1)
    let ema = prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period

    for (let i = period; i < prices.length; i++) {
      ema = prices[i] * multiplier + ema * (1 - multiplier)
    }

    return ema
  }

  getStats(): {
    isInPosition: boolean
    currentPosition: typeof this.currentPosition
    priceHistoryLength: number
  } {
    return {
      isInPosition: this.currentPosition.side !== null,
      currentPosition: { ...this.currentPosition },
      priceHistoryLength: this.priceHistory.length,
    }
  }
}
