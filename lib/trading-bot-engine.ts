import { database } from "./database"
import { subscriptionManager } from "./subscription-manager"
import { generateRandomString } from "./security"

export interface TradingSignal {
  id: string
  symbol: string
  action: "buy" | "sell" | "hold"
  price: number
  confidence: number
  timestamp: Date
  strategy: string
  metadata?: Record<string, any>
}

export interface MarketData {
  symbol: string
  price: number
  volume: number
  change24h: number
  timestamp: Date
  high24h: number
  low24h: number
}

export interface BotConfig {
  symbol: string
  strategy: string
  amount: number
  stopLoss?: number
  takeProfit?: number
  maxTrades?: number
  riskLevel: "low" | "medium" | "high"
  parameters: Record<string, any>
}

export interface BotPerformance {
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  totalPnL: number
  averagePnL: number
  maxDrawdown: number
  sharpeRatio: number
  lastUpdated: Date
}

class TradingBotEngine {
  private marketData: Map<string, MarketData> = new Map()
  private activeSignals: TradingSignal[] = []
  private isRunning = false

  constructor() {
    this.initializeMarketData()
  }

  private initializeMarketData() {
    // Initialize with some mock market data
    const symbols = ["BTC/USDT", "ETH/USDT", "ADA/USDT", "DOT/USDT", "LINK/USDT"]

    symbols.forEach((symbol) => {
      const basePrice = Math.random() * 50000 + 1000 // Random price between 1000-51000
      this.marketData.set(symbol, {
        symbol,
        price: basePrice,
        volume: Math.random() * 1000000,
        change24h: (Math.random() - 0.5) * 20, // -10% to +10%
        timestamp: new Date(),
        high24h: basePrice * (1 + Math.random() * 0.1),
        low24h: basePrice * (1 - Math.random() * 0.1),
      })
    })

    // Update market data every 5 seconds
    setInterval(() => {
      this.updateMarketData()
    }, 5000)
  }

  private updateMarketData() {
    this.marketData.forEach((data, symbol) => {
      // Simulate price movement
      const change = (Math.random() - 0.5) * 0.02 // -1% to +1%
      const newPrice = data.price * (1 + change)

      this.marketData.set(symbol, {
        ...data,
        price: newPrice,
        change24h: data.change24h + change * 100,
        timestamp: new Date(),
        high24h: Math.max(data.high24h, newPrice),
        low24h: Math.min(data.low24h, newPrice),
      })
    })
  }

  async createBot(userId: string, config: BotConfig): Promise<string> {
    // Check subscription limits
    const limits = await subscriptionManager.checkLimits(userId, "bots")
    if (!limits.allowed) {
      throw new Error(`Bot limit reached. Current: ${limits.current}, Limit: ${limits.limit}`)
    }

    // Validate config
    if (!config.symbol || !config.strategy || !config.amount) {
      throw new Error("Invalid bot configuration")
    }

    // Create bot in database
    const bot = await database.createBot({
      userId,
      name: `${config.strategy} Bot - ${config.symbol}`,
      strategy: config.strategy,
      status: "stopped",
      config: config,
      performance: {
        totalTrades: 0,
        winRate: 0,
        totalPnL: 0,
      },
    })

    // Record usage
    await subscriptionManager.recordUsage(userId, "bot")

    return bot.id
  }

  async startBot(botId: string): Promise<boolean> {
    const bot = await database.getBotById(botId)
    if (!bot) {
      throw new Error("Bot not found")
    }

    // Check if user has access
    const hasAccess = await subscriptionManager.checkAccess(bot.userId, "trading")
    if (!hasAccess) {
      throw new Error("Subscription expired or insufficient permissions")
    }

    // Update bot status
    await database.updateBot(botId, { status: "active" })

    // Start generating signals for this bot
    this.generateSignalsForBot(bot)

    return true
  }

  async stopBot(botId: string): Promise<boolean> {
    const bot = await database.getBotById(botId)
    if (!bot) {
      throw new Error("Bot not found")
    }

    await database.updateBot(botId, { status: "stopped" })
    return true
  }

  async pauseBot(botId: string): Promise<boolean> {
    const bot = await database.getBotById(botId)
    if (!bot) {
      throw new Error("Bot not found")
    }

    await database.updateBot(botId, { status: "paused" })
    return true
  }

  private async generateSignalsForBot(bot: any) {
    const marketData = this.marketData.get(bot.config.symbol)
    if (!marketData) return

    // Simple strategy implementation
    let signal: TradingSignal | null = null

    switch (bot.strategy) {
      case "scalping":
        signal = this.generateScalpingSignal(bot, marketData)
        break
      case "dca":
        signal = this.generateDCASignal(bot, marketData)
        break
      case "momentum":
        signal = this.generateMomentumSignal(bot, marketData)
        break
      default:
        signal = this.generateRandomSignal(bot, marketData)
    }

    if (signal && signal.action !== "hold") {
      this.activeSignals.push(signal)
      await this.executeTrade(bot, signal)
    }
  }

  private generateScalpingSignal(bot: any, marketData: MarketData): TradingSignal {
    // Simple scalping logic - buy on dips, sell on peaks
    const priceChange = Math.random() - 0.5
    const action = priceChange > 0.01 ? "sell" : priceChange < -0.01 ? "buy" : "hold"

    return {
      id: generateRandomString(16),
      symbol: bot.config.symbol,
      action,
      price: marketData.price,
      confidence: Math.random() * 0.4 + 0.6, // 60-100% confidence
      timestamp: new Date(),
      strategy: "scalping",
      metadata: {
        priceChange,
        botId: bot.id,
      },
    }
  }

  private generateDCASignal(bot: any, marketData: MarketData): TradingSignal {
    // Dollar Cost Averaging - regular buys regardless of price
    return {
      id: generateRandomString(16),
      symbol: bot.config.symbol,
      action: "buy",
      price: marketData.price,
      confidence: 0.8,
      timestamp: new Date(),
      strategy: "dca",
      metadata: {
        botId: bot.id,
      },
    }
  }

  private generateMomentumSignal(bot: any, marketData: MarketData): TradingSignal {
    // Momentum strategy - follow the trend
    const action = marketData.change24h > 2 ? "buy" : marketData.change24h < -2 ? "sell" : "hold"

    return {
      id: generateRandomString(16),
      symbol: bot.config.symbol,
      action,
      price: marketData.price,
      confidence: Math.abs(marketData.change24h) / 10, // Higher confidence with bigger moves
      timestamp: new Date(),
      strategy: "momentum",
      metadata: {
        change24h: marketData.change24h,
        botId: bot.id,
      },
    }
  }

  private generateRandomSignal(bot: any, marketData: MarketData): TradingSignal {
    const actions: ("buy" | "sell" | "hold")[] = ["buy", "sell", "hold"]
    const action = actions[Math.floor(Math.random() * actions.length)]

    return {
      id: generateRandomString(16),
      symbol: bot.config.symbol,
      action,
      price: marketData.price,
      confidence: Math.random(),
      timestamp: new Date(),
      strategy: bot.strategy,
      metadata: {
        botId: bot.id,
      },
    }
  }

  private async executeTrade(bot: any, signal: TradingSignal) {
    // Check trade limits
    const limits = await subscriptionManager.checkLimits(bot.userId, "trades")
    if (!limits.allowed) {
      console.log(`Trade limit reached for user ${bot.userId}`)
      return
    }

    // Create trade record
    const trade = await database.createTrade({
      botId: bot.id,
      userId: bot.userId,
      symbol: signal.symbol,
      side: signal.action,
      amount: bot.config.amount,
      price: signal.price,
      status: "filled", // Simulate immediate fill
      filledAt: new Date(),
    })

    // Record usage
    await subscriptionManager.recordUsage(bot.userId, "trade")

    // Update bot performance
    await this.updateBotPerformance(bot.id)

    console.log(`Trade executed: ${signal.action} ${bot.config.amount} ${signal.symbol} at ${signal.price}`)
  }

  private async updateBotPerformance(botId: string) {
    const bot = await database.getBotById(botId)
    if (!bot) return

    const trades = await database.getTradesByBotId(botId)
    const filledTrades = trades.filter((t) => t.status === "filled")

    if (filledTrades.length === 0) return

    // Calculate basic performance metrics
    let totalPnL = 0
    let winningTrades = 0

    // Simple P&L calculation (this would be more complex in reality)
    for (let i = 1; i < filledTrades.length; i++) {
      const prevTrade = filledTrades[i - 1]
      const currentTrade = filledTrades[i]

      if (prevTrade.side === "buy" && currentTrade.side === "sell") {
        const pnl = (currentTrade.price - prevTrade.price) * prevTrade.amount
        totalPnL += pnl
        if (pnl > 0) winningTrades++
      }
    }

    const performance: Partial<typeof bot.performance> = {
      totalTrades: filledTrades.length,
      winRate: filledTrades.length > 0 ? winningTrades / filledTrades.length : 0,
      totalPnL,
    }

    await database.updateBot(botId, { performance })
  }

  async getBotPerformance(botId: string): Promise<BotPerformance | null> {
    const bot = await database.getBotById(botId)
    if (!bot || !bot.performance) return null

    return {
      totalTrades: bot.performance.totalTrades,
      winningTrades: Math.floor(bot.performance.totalTrades * bot.performance.winRate),
      losingTrades: bot.performance.totalTrades - Math.floor(bot.performance.totalTrades * bot.performance.winRate),
      winRate: bot.performance.winRate,
      totalPnL: bot.performance.totalPnL,
      averagePnL: bot.performance.totalTrades > 0 ? bot.performance.totalPnL / bot.performance.totalTrades : 0,
      maxDrawdown: bot.performance.totalPnL * -0.1, // Mock value
      sharpeRatio: Math.random() * 2, // Mock value
      lastUpdated: new Date(),
    }
  }

  async getMarketData(symbol?: string): Promise<MarketData[]> {
    if (symbol) {
      const data = this.marketData.get(symbol)
      return data ? [data] : []
    }

    return Array.from(this.marketData.values())
  }

  async getActiveSignals(botId?: string): Promise<TradingSignal[]> {
    if (botId) {
      return this.activeSignals.filter((signal) => signal.metadata?.botId === botId)
    }

    return this.activeSignals
  }

  async getUserBots(userId: string): Promise<any[]> {
    return database.getBotsByUserId(userId)
  }

  async deleteBot(botId: string): Promise<boolean> {
    // Stop bot first
    await this.stopBot(botId)

    // Delete from database
    return database.deleteBot(botId)
  }

  start() {
    if (this.isRunning) return

    this.isRunning = true
    console.log("Trading bot engine started")

    // Run bot logic every 10 seconds
    setInterval(async () => {
      const activeBots = await database.getAllBots()
      const runningBots = activeBots.filter((bot) => bot.status === "active")

      for (const bot of runningBots) {
        try {
          await this.generateSignalsForBot(bot)
        } catch (error) {
          console.error(`Error processing bot ${bot.id}:`, error)
        }
      }
    }, 10000)
  }

  stop() {
    this.isRunning = false
    console.log("Trading bot engine stopped")
  }
}

// Create and export trading bot engine instance
export const tradingBotEngine = new TradingBotEngine()

// Export the class as well
export { TradingBotEngine }

// Auto-start the engine
tradingBotEngine.start()
