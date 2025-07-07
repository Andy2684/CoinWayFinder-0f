import type { ExchangeAPIClient, Ticker, OrderRequest, Kline } from "../exchange-api-client"
import { database, type TradeRecord } from "../database"

// Base Strategy Interface
export interface BaseStrategyConfig {
  symbol: string
  investment: number
  stopLoss: number
  takeProfit: number
  maxTrades: number
}

export abstract class BaseStrategy {
  protected client: ExchangeAPIClient
  protected botId: string
  protected userId: string
  protected isRunning = false
  protected config: BaseStrategyConfig

  constructor(client: ExchangeAPIClient, config: BaseStrategyConfig, botId: string, userId: string) {
    this.client = client
    this.config = config
    this.botId = botId
    this.userId = userId
  }

  abstract start(): Promise<void>
  abstract stop(): Promise<void>
  abstract getStats(): any

  protected async saveTrade(trade: Omit<TradeRecord, "_id" | "timestamp">): Promise<void> {
    await database.saveTrade({
      ...trade,
      timestamp: new Date(),
    })
  }
}

// DCA Strategy
export interface DCAConfig extends BaseStrategyConfig {
  interval: number // minutes
  amount: number // USD per purchase
  priceDeviation: number // percentage
}

export class DCAStrategy extends BaseStrategy {
  private config: DCAConfig
  private intervalId: NodeJS.Timeout | null = null
  private lastPrice = 0
  private totalInvested = 0
  private totalQuantity = 0
  private orderCount = 0

  constructor(client: ExchangeAPIClient, config: DCAConfig, botId: string, userId: string) {
    super(client, config, botId, userId)
    this.config = config
  }

  async start(): Promise<void> {
    if (this.isRunning) return

    this.isRunning = true
    console.log(`Starting DCA strategy for ${this.config.symbol}`)

    const ticker = await this.client.getTicker(this.config.symbol)
    this.lastPrice = ticker.price

    await this.executePurchase()

    this.intervalId = setInterval(
      async () => {
        if (this.isRunning) {
          await this.executePurchase()
        }
      },
      this.config.interval * 60 * 1000,
    )
  }

  async stop(): Promise<void> {
    this.isRunning = false
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  private async executePurchase(): Promise<void> {
    try {
      if (this.orderCount >= this.config.maxTrades) {
        await this.stop()
        return
      }

      const ticker = await this.client.getTicker(this.config.symbol)

      if (this.lastPrice > 0) {
        const priceChange = Math.abs((ticker.price - this.lastPrice) / this.lastPrice) * 100
        if (priceChange > this.config.priceDeviation) {
          console.log(`Price deviation too high (${priceChange.toFixed(2)}%), skipping purchase`)
          return
        }
      }

      const quantity = this.config.amount / ticker.price

      const order: OrderRequest = {
        symbol: this.config.symbol,
        side: "buy",
        type: "market",
        amount: quantity,
      }

      const result = await this.client.placeOrder(order)

      await this.saveTrade({
        botId: this.botId,
        userId: this.userId,
        orderId: result.orderId,
        symbol: this.config.symbol,
        side: "buy",
        type: "market",
        amount: quantity,
        price: result.price,
        fee: 0,
        status: result.status,
        exchange: "binance",
        strategy: "dca",
      })

      this.totalInvested += this.config.amount
      this.totalQuantity += quantity
      this.orderCount++
      this.lastPrice = ticker.price

      await this.checkExitConditions(ticker)
    } catch (error) {
      console.error("DCA purchase failed:", error)
    }
  }

  private async checkExitConditions(ticker: Ticker): Promise<void> {
    if (this.totalQuantity === 0) return

    const avgPrice = this.totalInvested / this.totalQuantity
    const currentValue = this.totalQuantity * ticker.price
    const profitLoss = ((currentValue - this.totalInvested) / this.totalInvested) * 100

    if (this.config.takeProfit && profitLoss >= this.config.takeProfit) {
      await this.sellAll(ticker, "take_profit")
    } else if (this.config.stopLoss && profitLoss <= -this.config.stopLoss) {
      await this.sellAll(ticker, "stop_loss")
    }
  }

  private async sellAll(ticker: Ticker, reason: string): Promise<void> {
    try {
      const order: OrderRequest = {
        symbol: this.config.symbol,
        side: "sell",
        type: "market",
        amount: this.totalQuantity,
      }

      const result = await this.client.placeOrder(order)
      const sellValue = this.totalQuantity * result.price
      const profit = sellValue - this.totalInvested

      await this.saveTrade({
        botId: this.botId,
        userId: this.userId,
        orderId: result.orderId,
        symbol: this.config.symbol,
        side: "sell",
        type: "market",
        amount: this.totalQuantity,
        price: result.price,
        fee: 0,
        profit,
        status: result.status,
        exchange: "binance",
        strategy: "dca",
      })

      this.totalInvested = 0
      this.totalQuantity = 0
      this.orderCount = 0
    } catch (error) {
      console.error("Sell all failed:", error)
    }
  }

  getStats() {
    return {
      totalInvested: this.totalInvested,
      totalQuantity: this.totalQuantity,
      orderCount: this.orderCount,
      avgPrice: this.totalQuantity > 0 ? this.totalInvested / this.totalQuantity : 0,
    }
  }
}

// Scalping Strategy
export interface ScalpingConfig extends BaseStrategyConfig {
  profitTarget: number
  maxHoldTime: number
  rsiPeriod: number
  rsiOverbought: number
  rsiOversold: number
}

export class ScalpingStrategy extends BaseStrategy {
  private config: ScalpingConfig
  private priceHistory: Array<{ price: number; timestamp: number }> = []
  private currentPosition: {
    side: "buy" | "sell" | null
    quantity: number
    entryPrice: number
    entryTime: number
    orderId?: string
  } = { side: null, quantity: 0, entryPrice: 0, entryTime: 0 }

  constructor(client: ExchangeAPIClient, config: ScalpingConfig, botId: string, userId: string) {
    super(client, config, botId, userId)
    this.config = config
  }

  async start(): Promise<void> {
    if (this.isRunning) return
    this.isRunning = true
    this.monitorPrice()
  }

  async stop(): Promise<void> {
    this.isRunning = false
    if (this.currentPosition.side) {
      await this.closePosition("strategy_stopped")
    }
  }

  private async monitorPrice(): Promise<void> {
    while (this.isRunning) {
      try {
        const ticker = await this.client.getTicker(this.config.symbol)

        this.priceHistory.push({
          price: ticker.price,
          timestamp: Date.now(),
        })

        if (this.priceHistory.length > 200) {
          this.priceHistory = this.priceHistory.slice(-200)
        }

        await this.checkSignals(ticker)

        if (this.currentPosition.side) {
          await this.managePosition(ticker)
        }

        await new Promise((resolve) => setTimeout(resolve, 5000))
      } catch (error) {
        console.error("Price monitoring error:", error)
        await new Promise((resolve) => setTimeout(resolve, 10000))
      }
    }
  }

  private async checkSignals(ticker: Ticker): Promise<void> {
    if (this.priceHistory.length < this.config.rsiPeriod || this.currentPosition.side) return

    const rsi = this.calculateRSI()

    if (rsi < this.config.rsiOversold) {
      await this.openPosition("buy", ticker)
    } else if (rsi > this.config.rsiOverbought) {
      await this.openPosition("sell", ticker)
    }
  }

  private async openPosition(side: "buy" | "sell", ticker: Ticker): Promise<void> {
    try {
      const quantity = this.config.investment / ticker.price

      const order: OrderRequest = {
        symbol: this.config.symbol,
        side,
        type: "market",
        amount: quantity,
      }

      const result = await this.client.placeOrder(order)

      this.currentPosition = {
        side,
        quantity,
        entryPrice: result.price,
        entryTime: Date.now(),
        orderId: result.orderId,
      }

      await this.saveTrade({
        botId: this.botId,
        userId: this.userId,
        orderId: result.orderId,
        symbol: this.config.symbol,
        side,
        type: "market",
        amount: quantity,
        price: result.price,
        fee: 0,
        status: result.status,
        exchange: "binance",
        strategy: "scalping",
      })
    } catch (error) {
      console.error("Failed to open position:", error)
    }
  }

  private async managePosition(ticker: Ticker): Promise<void> {
    if (!this.currentPosition.side) return

    const currentTime = Date.now()
    const holdTime = (currentTime - this.currentPosition.entryTime) / (1000 * 60)

    let profitPercent = 0
    if (this.currentPosition.side === "buy") {
      profitPercent = ((ticker.price - this.currentPosition.entryPrice) / this.currentPosition.entryPrice) * 100
    } else {
      profitPercent = ((this.currentPosition.entryPrice - ticker.price) / this.currentPosition.entryPrice) * 100
    }

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

      const result = await this.client.placeOrder(order)

      let profit = 0
      if (this.currentPosition.side === "buy") {
        profit = (result.price - this.currentPosition.entryPrice) * this.currentPosition.quantity
      } else {
        profit = (this.currentPosition.entryPrice - result.price) * this.currentPosition.quantity
      }

      await this.saveTrade({
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
        exchange: "binance",
        strategy: "scalping",
      })

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

  getStats() {
    return {
      isInPosition: this.currentPosition.side !== null,
      currentPosition: { ...this.currentPosition },
      priceHistoryLength: this.priceHistory.length,
    }
  }
}

// Grid Trading Strategy
export interface GridConfig extends BaseStrategyConfig {
  gridLevels: number
  gridSpacing: number // percentage
  upperLimit?: number
  lowerLimit?: number
}

export class GridStrategy extends BaseStrategy {
  private config: GridConfig
  private gridOrders: Array<{
    level: number
    price: number
    side: "buy" | "sell"
    orderId?: string
    filled: boolean
  }> = []
  private basePrice = 0

  constructor(client: ExchangeAPIClient, config: GridConfig, botId: string, userId: string) {
    super(client, config, botId, userId)
    this.config = config
  }

  async start(): Promise<void> {
    if (this.isRunning) return

    this.isRunning = true
    const ticker = await this.client.getTicker(this.config.symbol)
    this.basePrice = ticker.price

    await this.setupGrid()
    this.monitorGrid()
  }

  async stop(): Promise<void> {
    this.isRunning = false
    await this.cancelAllOrders()
  }

  private async setupGrid(): Promise<void> {
    const halfLevels = Math.floor(this.config.gridLevels / 2)

    // Create buy orders below current price
    for (let i = 1; i <= halfLevels; i++) {
      const price = this.basePrice * (1 - (this.config.gridSpacing / 100) * i)
      if (!this.config.lowerLimit || price >= this.config.lowerLimit) {
        this.gridOrders.push({
          level: -i,
          price,
          side: "buy",
          filled: false,
        })
      }
    }

    // Create sell orders above current price
    for (let i = 1; i <= halfLevels; i++) {
      const price = this.basePrice * (1 + (this.config.gridSpacing / 100) * i)
      if (!this.config.upperLimit || price <= this.config.upperLimit) {
        this.gridOrders.push({
          level: i,
          price,
          side: "sell",
          filled: false,
        })
      }
    }

    await this.placeGridOrders()
  }

  private async placeGridOrders(): Promise<void> {
    const orderAmount = this.config.investment / this.config.gridLevels

    for (const gridOrder of this.gridOrders) {
      if (gridOrder.filled || gridOrder.orderId) continue

      try {
        const quantity = orderAmount / gridOrder.price

        const order: OrderRequest = {
          symbol: this.config.symbol,
          side: gridOrder.side,
          type: "limit",
          amount: quantity,
          price: gridOrder.price,
        }

        const result = await this.client.placeOrder(order)
        gridOrder.orderId = result.orderId

        await this.saveTrade({
          botId: this.botId,
          userId: this.userId,
          orderId: result.orderId,
          symbol: this.config.symbol,
          side: gridOrder.side,
          type: "limit",
          amount: quantity,
          price: gridOrder.price,
          fee: 0,
          status: "pending",
          exchange: "binance",
          strategy: "grid",
        })
      } catch (error) {
        console.error(`Failed to place grid order at ${gridOrder.price}:`, error)
      }
    }
  }

  private async monitorGrid(): Promise<void> {
    while (this.isRunning) {
      try {
        await this.checkFilledOrders()
        await new Promise((resolve) => setTimeout(resolve, 10000))
      } catch (error) {
        console.error("Grid monitoring error:", error)
        await new Promise((resolve) => setTimeout(resolve, 30000))
      }
    }
  }

  private async checkFilledOrders(): Promise<void> {
    for (const gridOrder of this.gridOrders) {
      if (!gridOrder.orderId || gridOrder.filled) continue

      try {
        const orderStatus = await this.client.getOrderStatus(this.config.symbol, gridOrder.orderId)

        if (orderStatus.status === "filled") {
          gridOrder.filled = true

          // Place opposite order
          await this.placeOppositeOrder(gridOrder)
        }
      } catch (error) {
        console.error(`Failed to check order status for ${gridOrder.orderId}:`, error)
      }
    }
  }

  private async placeOppositeOrder(filledOrder: any): Promise<void> {
    try {
      const oppositeSide = filledOrder.side === "buy" ? "sell" : "buy"
      const oppositePrice =
        filledOrder.side === "buy"
          ? filledOrder.price * (1 + this.config.gridSpacing / 100)
          : filledOrder.price * (1 - this.config.gridSpacing / 100)

      const orderAmount = this.config.investment / this.config.gridLevels
      const quantity = orderAmount / oppositePrice

      const order: OrderRequest = {
        symbol: this.config.symbol,
        side: oppositeSide,
        type: "limit",
        amount: quantity,
        price: oppositePrice,
      }

      const result = await this.client.placeOrder(order)

      // Add new grid order
      this.gridOrders.push({
        level: -filledOrder.level,
        price: oppositePrice,
        side: oppositeSide,
        orderId: result.orderId,
        filled: false,
      })

      await this.saveTrade({
        botId: this.botId,
        userId: this.userId,
        orderId: result.orderId,
        symbol: this.config.symbol,
        side: oppositeSide,
        type: "limit",
        amount: quantity,
        price: oppositePrice,
        fee: 0,
        status: "pending",
        exchange: "binance",
        strategy: "grid",
      })
    } catch (error) {
      console.error("Failed to place opposite order:", error)
    }
  }

  private async cancelAllOrders(): Promise<void> {
    for (const gridOrder of this.gridOrders) {
      if (gridOrder.orderId && !gridOrder.filled) {
        try {
          await this.client.cancelOrder(this.config.symbol, gridOrder.orderId)
        } catch (error) {
          console.error(`Failed to cancel order ${gridOrder.orderId}:`, error)
        }
      }
    }
  }

  getStats() {
    const totalOrders = this.gridOrders.length
    const filledOrders = this.gridOrders.filter((order) => order.filled).length
    const pendingOrders = totalOrders - filledOrders

    return {
      totalOrders,
      filledOrders,
      pendingOrders,
      gridLevels: this.config.gridLevels,
      basePrice: this.basePrice,
    }
  }
}

// Long/Short AI Strategy
export interface LongShortConfig extends BaseStrategyConfig {
  leverage: number
  aiConfidenceThreshold: number
  positionSize: number
  riskPerTrade: number
}

export class LongShortStrategy extends BaseStrategy {
  private config: LongShortConfig
  private currentPosition: {
    side: "long" | "short" | null
    size: number
    entryPrice: number
    leverage: number
    timestamp: number
  } = { side: null, size: 0, entryPrice: 0, leverage: 1, timestamp: 0 }

  constructor(client: ExchangeAPIClient, config: LongShortConfig, botId: string, userId: string) {
    super(client, config, botId, userId)
    this.config = config
  }

  async start(): Promise<void> {
    if (this.isRunning) return
    this.isRunning = true
    this.monitorSignals()
  }

  async stop(): Promise<void> {
    this.isRunning = false
    if (this.currentPosition.side) {
      await this.closePosition("strategy_stopped")
    }
  }

  private async monitorSignals(): Promise<void> {
    while (this.isRunning) {
      try {
        if (!this.currentPosition.side) {
          await this.checkForEntry()
        } else {
          await this.managePosition()
        }

        await new Promise((resolve) => setTimeout(resolve, 30000)) // Check every 30 seconds
      } catch (error) {
        console.error("Signal monitoring error:", error)
        await new Promise((resolve) => setTimeout(resolve, 60000))
      }
    }
  }

  private async checkForEntry(): Promise<void> {
    // This would integrate with AI analysis
    // For now, using simplified logic
    const ticker = await this.client.getTicker(this.config.symbol)
    const klines = await this.client.getKlines(this.config.symbol, "1h", 50)

    const signal = this.analyzeMarket(ticker, klines)

    if (signal.confidence >= this.config.aiConfidenceThreshold) {
      await this.openPosition(signal.direction, ticker)
    }
  }

  private analyzeMarket(ticker: Ticker, klines: Kline[]): { direction: "long" | "short"; confidence: number } {
    // Simplified market analysis - in production, this would use AI
    const recentPrices = klines.slice(-10).map((k) => k.close)
    const avgPrice = recentPrices.reduce((sum, price) => sum + price, 0) / recentPrices.length

    const priceChange = (ticker.price - avgPrice) / avgPrice
    const confidence = Math.min(Math.abs(priceChange) * 100, 1)

    return {
      direction: priceChange > 0 ? "long" : "short",
      confidence,
    }
  }

  private async openPosition(direction: "long" | "short", ticker: Ticker): Promise<void> {
    try {
      const positionValue = this.config.investment * (this.config.positionSize / 100)
      const quantity = (positionValue * this.config.leverage) / ticker.price

      const order: OrderRequest = {
        symbol: this.config.symbol,
        side: direction === "long" ? "buy" : "sell",
        type: "market",
        amount: quantity,
      }

      const result = await this.client.placeOrder(order)

      this.currentPosition = {
        side: direction,
        size: quantity,
        entryPrice: result.price,
        leverage: this.config.leverage,
        timestamp: Date.now(),
      }

      await this.saveTrade({
        botId: this.botId,
        userId: this.userId,
        orderId: result.orderId,
        symbol: this.config.symbol,
        side: order.side,
        type: "market",
        amount: quantity,
        price: result.price,
        fee: 0,
        status: result.status,
        exchange: "binance",
        strategy: "long-short",
        metadata: { leverage: this.config.leverage, direction },
      })
    } catch (error) {
      console.error("Failed to open position:", error)
    }
  }

  private async managePosition(): Promise<void> {
    if (!this.currentPosition.side) return

    const ticker = await this.client.getTicker(this.config.symbol)
    let pnlPercent = 0

    if (this.currentPosition.side === "long") {
      pnlPercent = ((ticker.price - this.currentPosition.entryPrice) / this.currentPosition.entryPrice) * 100
    } else {
      pnlPercent = ((this.currentPosition.entryPrice - ticker.price) / this.currentPosition.entryPrice) * 100
    }

    pnlPercent *= this.currentPosition.leverage

    if (pnlPercent >= this.config.takeProfit) {
      await this.closePosition("take_profit")
    } else if (pnlPercent <= -this.config.stopLoss) {
      await this.closePosition("stop_loss")
    }
  }

  private async closePosition(reason: string): Promise<void> {
    if (!this.currentPosition.side) return

    try {
      const order: OrderRequest = {
        symbol: this.config.symbol,
        side: this.currentPosition.side === "long" ? "sell" : "buy",
        type: "market",
        amount: this.currentPosition.size,
      }

      const result = await this.client.placeOrder(order)

      let profit = 0
      if (this.currentPosition.side === "long") {
        profit = (result.price - this.currentPosition.entryPrice) * this.currentPosition.size
      } else {
        profit = (this.currentPosition.entryPrice - result.price) * this.currentPosition.size
      }

      profit *= this.currentPosition.leverage

      await this.saveTrade({
        botId: this.botId,
        userId: this.userId,
        orderId: result.orderId,
        symbol: this.config.symbol,
        side: order.side,
        type: "market",
        amount: this.currentPosition.size,
        price: result.price,
        fee: 0,
        profit,
        status: result.status,
        exchange: "binance",
        strategy: "long-short",
        metadata: { reason, leverage: this.currentPosition.leverage },
      })

      this.currentPosition = {
        side: null,
        size: 0,
        entryPrice: 0,
        leverage: 1,
        timestamp: 0,
      }
    } catch (error) {
      console.error("Failed to close position:", error)
    }
  }

  getStats() {
    return {
      hasPosition: this.currentPosition.side !== null,
      currentPosition: { ...this.currentPosition },
      leverage: this.config.leverage,
    }
  }
}

// Trend Following Strategy
export interface TrendFollowingConfig extends BaseStrategyConfig {
  fastMA: number
  slowMA: number
  atrPeriod: number
  atrMultiplier: number
}

export class TrendFollowingStrategy extends BaseStrategy {
  private config: TrendFollowingConfig
  private priceHistory: Kline[] = []
  private currentPosition: {
    side: "buy" | "sell" | null
    quantity: number
    entryPrice: number
    stopLoss: number
  } = { side: null, quantity: 0, entryPrice: 0, stopLoss: 0 }

  constructor(client: ExchangeAPIClient, config: TrendFollowingConfig, botId: string, userId: string) {
    super(client, config, botId, userId)
    this.config = config
  }

  async start(): Promise<void> {
    if (this.isRunning) return
    this.isRunning = true

    // Load initial price history
    this.priceHistory = await this.client.getKlines(this.config.symbol, "1h", 100)
    this.monitorTrend()
  }

  async stop(): Promise<void> {
    this.isRunning = false
    if (this.currentPosition.side) {
      await this.closePosition("strategy_stopped")
    }
  }

  private async monitorTrend(): Promise<void> {
    while (this.isRunning) {
      try {
        const newKlines = await this.client.getKlines(this.config.symbol, "1h", 1)
        if (newKlines.length > 0) {
          this.priceHistory.push(newKlines[0])
          this.priceHistory = this.priceHistory.slice(-100) // Keep last 100 candles
        }

        if (!this.currentPosition.side) {
          await this.checkForTrendEntry()
        } else {
          await this.manageTrendPosition()
        }

        await new Promise((resolve) => setTimeout(resolve, 60000)) // Check every minute
      } catch (error) {
        console.error("Trend monitoring error:", error)
        await new Promise((resolve) => setTimeout(resolve, 120000))
      }
    }
  }

  private async checkForTrendEntry(): Promise<void> {
    if (this.priceHistory.length < this.config.slowMA) return

    const fastMA = this.calculateMA(this.config.fastMA)
    const slowMA = this.calculateMA(this.config.slowMA)
    const atr = this.calculateATR()

    const currentPrice = this.priceHistory[this.priceHistory.length - 1].close

    // Bullish crossover
    if (fastMA > slowMA && this.priceHistory.length > 1) {
      const prevFastMA = this.calculateMA(this.config.fastMA, 1)
      const prevSlowMA = this.calculateMA(this.config.slowMA, 1)

      if (prevFastMA <= prevSlowMA) {
        await this.openTrendPosition("buy", currentPrice, atr)
      }
    }
    // Bearish crossover
    else if (fastMA < slowMA && this.priceHistory.length > 1) {
      const prevFastMA = this.calculateMA(this.config.fastMA, 1)
      const prevSlowMA = this.calculateMA(this.config.slowMA, 1)

      if (prevFastMA >= prevSlowMA) {
        await this.openTrendPosition("sell", currentPrice, atr)
      }
    }
  }

  private async openTrendPosition(side: "buy" | "sell", price: number, atr: number): Promise<void> {
    try {
      const quantity = this.config.investment / price
      const stopLoss =
        side === "buy" ? price - atr * this.config.atrMultiplier : price + atr * this.config.atrMultiplier

      const order: OrderRequest = {
        symbol: this.config.symbol,
        side,
        type: "market",
        amount: quantity,
      }

      const result = await this.client.placeOrder(order)

      this.currentPosition = {
        side,
        quantity,
        entryPrice: result.price,
        stopLoss,
      }

      await this.saveTrade({
        botId: this.botId,
        userId: this.userId,
        orderId: result.orderId,
        symbol: this.config.symbol,
        side,
        type: "market",
        amount: quantity,
        price: result.price,
        fee: 0,
        status: result.status,
        exchange: "binance",
        strategy: "trend-following",
        metadata: { stopLoss, atr },
      })
    } catch (error) {
      console.error("Failed to open trend position:", error)
    }
  }

  private async manageTrendPosition(): Promise<void> {
    if (!this.currentPosition.side) return

    const currentPrice = this.priceHistory[this.priceHistory.length - 1].close
    let shouldClose = false

    // Check stop loss
    if (this.currentPosition.side === "buy" && currentPrice <= this.currentPosition.stopLoss) {
      shouldClose = true
    } else if (this.currentPosition.side === "sell" && currentPrice >= this.currentPosition.stopLoss) {
      shouldClose = true
    }

    // Check trend reversal
    const fastMA = this.calculateMA(this.config.fastMA)
    const slowMA = this.calculateMA(this.config.slowMA)

    if (this.currentPosition.side === "buy" && fastMA < slowMA) {
      shouldClose = true
    } else if (this.currentPosition.side === "sell" && fastMA > slowMA) {
      shouldClose = true
    }

    if (shouldClose) {
      await this.closePosition("trend_reversal")
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

      const result = await this.client.placeOrder(order)

      let profit = 0
      if (this.currentPosition.side === "buy") {
        profit = (result.price - this.currentPosition.entryPrice) * this.currentPosition.quantity
      } else {
        profit = (this.currentPosition.entryPrice - result.price) * this.currentPosition.quantity
      }

      await this.saveTrade({
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
        exchange: "binance",
        strategy: "trend-following",
        metadata: { reason },
      })

      this.currentPosition = {
        side: null,
        quantity: 0,
        entryPrice: 0,
        stopLoss: 0,
      }
    } catch (error) {
      console.error("Failed to close trend position:", error)
    }
  }

  private calculateMA(period: number, offset = 0): number {
    const startIndex = this.priceHistory.length - period - offset
    const endIndex = this.priceHistory.length - offset

    if (startIndex < 0) return 0

    const prices = this.priceHistory.slice(startIndex, endIndex).map((k) => k.close)
    return prices.reduce((sum, price) => sum + price, 0) / prices.length
  }

  private calculateATR(): number {
    if (this.priceHistory.length < this.config.atrPeriod + 1) return 0

    const trueRanges: number[] = []

    for (let i = 1; i < this.priceHistory.length; i++) {
      const current = this.priceHistory[i]
      const previous = this.priceHistory[i - 1]

      const tr1 = current.high - current.low
      const tr2 = Math.abs(current.high - previous.close)
      const tr3 = Math.abs(current.low - previous.close)

      trueRanges.push(Math.max(tr1, tr2, tr3))
    }

    const recentTR = trueRanges.slice(-this.config.atrPeriod)
    return recentTR.reduce((sum, tr) => sum + tr, 0) / recentTR.length
  }

  getStats() {
    const fastMA = this.calculateMA(this.config.fastMA)
    const slowMA = this.calculateMA(this.config.slowMA)
    const atr = this.calculateATR()

    return {
      hasPosition: this.currentPosition.side !== null,
      currentPosition: { ...this.currentPosition },
      fastMA,
      slowMA,
      atr,
      trend: fastMA > slowMA ? "bullish" : "bearish",
    }
  }
}

// Arbitrage Strategy
export interface ArbitrageConfig extends BaseStrategyConfig {
  exchanges: string[]
  minProfitPercent: number
  maxSpread: number
  checkInterval: number
}

export class ArbitrageStrategy extends BaseStrategy {
  private config: ArbitrageConfig
  private exchangeClients: Map<string, ExchangeAPIClient> = new Map()
  private opportunities: Array<{
    buyExchange: string
    sellExchange: string
    buyPrice: number
    sellPrice: number
    profit: number
    timestamp: number
  }> = []

  constructor(client: ExchangeAPIClient, config: ArbitrageConfig, botId: string, userId: string) {
    super(client, config, botId, userId)
    this.config = config
  }

  async start(): Promise<void> {
    if (this.isRunning) return
    this.isRunning = true
    this.scanForOpportunities()
  }

  async stop(): Promise<void> {
    this.isRunning = false
  }

  private async scanForOpportunities(): Promise<void> {
    while (this.isRunning) {
      try {
        await this.findArbitrageOpportunities()
        await this.executeOpportunities()

        await new Promise((resolve) => setTimeout(resolve, this.config.checkInterval * 1000))
      } catch (error) {
        console.error("Arbitrage scanning error:", error)
        await new Promise((resolve) => setTimeout(resolve, 30000))
      }
    }
  }

  private async findArbitrageOpportunities(): Promise<void> {
    const prices: Map<string, { price: number; exchange: string }> = new Map()

    // Get prices from all exchanges (simplified - would need multiple exchange clients)
    try {
      const ticker = await this.client.getTicker(this.config.symbol)
      prices.set("binance", { price: ticker.price, exchange: "binance" })

      // In production, you would query multiple exchanges here
      // For demo, we'll simulate price differences
      const simulatedPrices = [
        { exchange: "bybit", price: ticker.price * (1 + Math.random() * 0.02 - 0.01) },
        { exchange: "kucoin", price: ticker.price * (1 + Math.random() * 0.02 - 0.01) },
      ]

      simulatedPrices.forEach(({ exchange, price }) => {
        prices.set(exchange, { price, exchange })
      })
    } catch (error) {
      console.error("Failed to get prices:", error)
      return
    }

    // Find arbitrage opportunities
    const priceArray = Array.from(prices.values())

    for (let i = 0; i < priceArray.length; i++) {
      for (let j = i + 1; j < priceArray.length; j++) {
        const price1 = priceArray[i]
        const price2 = priceArray[j]

        let buyExchange, sellExchange, buyPrice, sellPrice

        if (price1.price < price2.price) {
          buyExchange = price1.exchange
          sellExchange = price2.exchange
          buyPrice = price1.price
          sellPrice = price2.price
        } else {
          buyExchange = price2.exchange
          sellExchange = price1.exchange
          buyPrice = price2.price
          sellPrice = price1.price
        }

        const profitPercent = ((sellPrice - buyPrice) / buyPrice) * 100

        if (profitPercent >= this.config.minProfitPercent) {
          this.opportunities.push({
            buyExchange,
            sellExchange,
            buyPrice,
            sellPrice,
            profit: profitPercent,
            timestamp: Date.now(),
          })

          // Save opportunity to database
          await database.saveArbitrageOpportunity({
            symbol: this.config.symbol,
            buyExchange,
            sellExchange,
            buyPrice,
            sellPrice,
            profitPercent,
            volume: this.config.investment,
            status: "active",
          })
        }
      }
    }

    // Clean old opportunities
    this.opportunities = this.opportunities.filter(
      (opp) => Date.now() - opp.timestamp < 60000, // Keep for 1 minute
    )
  }

  private async executeOpportunities(): Promise<void> {
    for (const opportunity of this.opportunities) {
      if (opportunity.profit >= this.config.minProfitPercent) {
        await this.executeArbitrage(opportunity)
      }
    }
  }

  private async executeArbitrage(opportunity: any): Promise<void> {
    try {
      const quantity = this.config.investment / opportunity.buyPrice

      // In production, you would execute on both exchanges simultaneously
      // For demo, we'll simulate the trades

      console.log(
        `Executing arbitrage: Buy ${quantity} ${this.config.symbol} at ${opportunity.buyPrice} on ${opportunity.buyExchange}`,
      )
      console.log(`Sell ${quantity} ${this.config.symbol} at ${opportunity.sellPrice} on ${opportunity.sellExchange}`)

      const profit = (opportunity.sellPrice - opportunity.buyPrice) * quantity

      // Save simulated trades
      await this.saveTrade({
        botId: this.botId,
        userId: this.userId,
        orderId: `arb_buy_${Date.now()}`,
        symbol: this.config.symbol,
        side: "buy",
        type: "market",
        amount: quantity,
        price: opportunity.buyPrice,
        fee: 0,
        status: "filled",
        exchange: opportunity.buyExchange,
        strategy: "arbitrage",
        metadata: { arbitrageId: Date.now() },
      })

      await this.saveTrade({
        botId: this.botId,
        userId: this.userId,
        orderId: `arb_sell_${Date.now()}`,
        symbol: this.config.symbol,
        side: "sell",
        type: "market",
        amount: quantity,
        price: opportunity.sellPrice,
        fee: 0,
        profit,
        status: "filled",
        exchange: opportunity.sellExchange,
        strategy: "arbitrage",
        metadata: { arbitrageId: Date.now() },
      })

      // Remove executed opportunity
      const index = this.opportunities.indexOf(opportunity)
      if (index > -1) {
        this.opportunities.splice(index, 1)
      }
    } catch (error) {
      console.error("Failed to execute arbitrage:", error)
    }
  }

  getStats() {
    return {
      activeOpportunities: this.opportunities.length,
      opportunities: this.opportunities.map((opp) => ({
        ...opp,
        age: Date.now() - opp.timestamp,
      })),
      minProfitPercent: this.config.minProfitPercent,
    }
  }
}
