import { TradeExecutionEngine, type TradeOrder, type RiskLimits } from "./trade-execution-engine"
import { getBotStrategy } from "./bot-strategies"
import { updateBotMetrics, createTradeRecord } from "./database"

export interface BotConfig {
  strategy: string
  config: any
  userId: string
  symbol: string
  exchange: string
}

export class BotExecutionEngine {
  private static instance: BotExecutionEngine
  private activeBots: Map<string, BotInstance> = new Map()
  private tradeEngine: TradeExecutionEngine

  private constructor() {
    const riskLimits: RiskLimits = {
      maxPositionSize: 10000,
      maxDailyLoss: 5000,
      maxOrderValue: 50000,
      allowedPairs: [],
      blockedPairs: [],
    }
    this.tradeEngine = new TradeExecutionEngine(riskLimits)
  }

  static getInstance(): BotExecutionEngine {
    if (!BotExecutionEngine.instance) {
      BotExecutionEngine.instance = new BotExecutionEngine()
    }
    return BotExecutionEngine.instance
  }

  async startBot(botId: string, config: BotConfig): Promise<void> {
    if (this.activeBots.has(botId)) {
      throw new Error("Bot is already running")
    }

    const strategy = getBotStrategy(config.strategy)
    if (!strategy) {
      throw new Error(`Unknown strategy: ${config.strategy}`)
    }

    const botInstance = new BotInstance(botId, config, this.tradeEngine)
    this.activeBots.set(botId, botInstance)

    await botInstance.start()
  }

  async stopBot(botId: string): Promise<void> {
    const botInstance = this.activeBots.get(botId)
    if (!botInstance) {
      throw new Error("Bot is not running")
    }

    await botInstance.stop()
    this.activeBots.delete(botId)
  }

  async pauseBot(botId: string): Promise<void> {
    const botInstance = this.activeBots.get(botId)
    if (!botInstance) {
      throw new Error("Bot is not running")
    }

    await botInstance.pause()
  }

  async resumeBot(botId: string): Promise<void> {
    const botInstance = this.activeBots.get(botId)
    if (!botInstance) {
      throw new Error("Bot is not running")
    }

    await botInstance.resume()
  }

  getBotStatus(botId: string): string {
    const botInstance = this.activeBots.get(botId)
    return botInstance ? botInstance.getStatus() : "stopped"
  }

  getActiveBots(): string[] {
    return Array.from(this.activeBots.keys())
  }
}

class BotInstance {
  private botId: string
  private config: BotConfig
  private tradeEngine: TradeExecutionEngine
  private status: "running" | "paused" | "stopped" = "stopped"
  private intervalId: NodeJS.Timeout | null = null
  private metrics = {
    totalTrades: 0,
    winningTrades: 0,
    totalPnl: 0,
    lastTradeTime: null as Date | null,
  }

  constructor(botId: string, config: BotConfig, tradeEngine: TradeExecutionEngine) {
    this.botId = botId
    this.config = config
    this.tradeEngine = tradeEngine
  }

  async start(): Promise<void> {
    this.status = "running"

    // Start the bot execution loop
    this.intervalId = setInterval(async () => {
      if (this.status === "running") {
        await this.executeStrategy()
      }
    }, this.getExecutionInterval())
  }

  async stop(): Promise<void> {
    this.status = "stopped"
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  async pause(): Promise<void> {
    this.status = "paused"
  }

  async resume(): Promise<void> {
    this.status = "running"
  }

  getStatus(): string {
    return this.status
  }

  private async executeStrategy(): Promise<void> {
    try {
      const signal = await this.generateTradingSignal()

      if (signal) {
        const order: TradeOrder = {
          id: `${this.botId}-${Date.now()}`,
          exchangeId: this.config.exchange,
          symbol: this.config.symbol,
          side: signal.side,
          type: signal.type || "market",
          amount: signal.amount,
          price: signal.price,
          strategy: this.config.strategy,
          maxRetries: 3,
          retryDelay: 1000,
        }

        const result = await this.tradeEngine.executeOrder(order)

        if (result.success) {
          await this.recordTrade(signal, result)
          await this.updateMetrics(signal, result)
        }
      }
    } catch (error) {
      console.error(`Bot ${this.botId} execution error:`, error)
    }
  }

  private async generateTradingSignal(): Promise<TradingSignal | null> {
    // This would implement the actual strategy logic
    // For now, return a mock signal based on strategy type

    switch (this.config.strategy) {
      case "dca":
        return this.generateDCASignal()
      case "grid":
        return this.generateGridSignal()
      case "scalping":
        return this.generateScalpingSignal()
      case "momentum":
        return this.generateMomentumSignal()
      default:
        return null
    }
  }

  private generateDCASignal(): TradingSignal | null {
    // DCA strategy: buy at regular intervals
    const config = this.config.config
    const amount = config.amount || 100

    return {
      side: "buy",
      type: "market",
      amount: amount,
      confidence: 0.8,
    }
  }

  private generateGridSignal(): TradingSignal | null {
    // Grid trading strategy implementation
    // This would analyze current price and place grid orders
    return null // Placeholder
  }

  private generateScalpingSignal(): TradingSignal | null {
    // Scalping strategy implementation
    // This would analyze short-term price movements
    return null // Placeholder
  }

  private generateMomentumSignal(): TradingSignal | null {
    // Momentum strategy implementation
    // This would analyze price trends and momentum indicators
    return null // Placeholder
  }

  private async recordTrade(signal: TradingSignal, result: any): Promise<void> {
    await createTradeRecord({
      userId: this.config.userId,
      botId: this.botId,
      symbol: this.config.symbol,
      type: signal.side,
      quantity: signal.amount,
      price: result.price || 0,
      exchange: this.config.exchange,
      orderId: result.orderId,
    })
  }

  private async updateMetrics(signal: TradingSignal, result: any): Promise<void> {
    this.metrics.totalTrades++
    this.metrics.lastTradeTime = new Date()

    // Update bot metrics in database
    await updateBotMetrics(this.botId, {
      totalTrades: this.metrics.totalTrades,
      lastTradeTime: this.metrics.lastTradeTime,
    })
  }

  private getExecutionInterval(): number {
    // Return execution interval based on strategy
    switch (this.config.strategy) {
      case "dca":
        return 60000 * 60 // 1 hour
      case "grid":
        return 60000 * 5 // 5 minutes
      case "scalping":
        return 1000 * 30 // 30 seconds
      case "momentum":
        return 60000 * 15 // 15 minutes
      default:
        return 60000 * 5 // 5 minutes
    }
  }
}

interface TradingSignal {
  side: "buy" | "sell"
  type?: "market" | "limit"
  amount: number
  price?: number
  confidence: number
}
