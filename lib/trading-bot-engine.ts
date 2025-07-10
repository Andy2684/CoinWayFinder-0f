import { generateRandomString } from "./security"

export interface TradingBot {
  id: string
  name: string
  strategy: string
  pair: string
  status: "running" | "paused" | "stopped" | "error"
  config: BotConfig
  stats: BotStats
  createdAt: Date
  lastUpdate: Date
}

export interface BotConfig {
  investment: number
  riskLevel: number
  stopLoss: number
  takeProfit: number
  maxTrades: number
  strategy: string
  parameters: Record<string, any>
}

export interface BotStats {
  totalTrades: number
  winningTrades: number
  losingTrades: number
  totalProfit: number
  totalLoss: number
  winRate: number
  currentDrawdown: number
  maxDrawdown: number
  sharpeRatio: number
  lastTradeTime?: Date
}

export interface Trade {
  id: string
  botId: string
  symbol: string
  side: "buy" | "sell"
  amount: number
  price: number
  timestamp: Date
  profit?: number
  status: "pending" | "filled" | "cancelled" | "failed"
}

export interface MarketDataPoint {
  symbol: string
  price: number
  volume: number
  timestamp: Date
}

export abstract class TradingStrategy {
  protected bot: TradingBot
  protected marketData: Map<string, MarketDataPoint> = new Map()
  protected trades: Trade[] = []
  protected positions: Map<string, number> = new Map()

  constructor(bot: TradingBot) {
    this.bot = bot
  }

  abstract shouldBuy(marketData: MarketDataPoint): boolean
  abstract shouldSell(marketData: MarketDataPoint): boolean
  abstract calculateOrderSize(marketData: MarketDataPoint): number
  abstract getName(): string

  onMarketData(data: MarketDataPoint): void {
    this.marketData.set(data.symbol, data)
    this.evaluateSignals(data)
  }

  private evaluateSignals(data: MarketDataPoint): void {
    if (this.bot.status !== "running") return

    try {
      if (this.shouldBuy(data)) {
        this.executeBuyOrder(data)
      } else if (this.shouldSell(data)) {
        this.executeSellOrder(data)
      }
    } catch (error) {
      console.error(`Strategy error for bot ${this.bot.id}:`, error)
      this.bot.status = "error"
    }
  }

  private async executeBuyOrder(data: MarketDataPoint): Promise<void> {
    const orderSize = this.calculateOrderSize(data)
    if (orderSize <= 0) return

    const trade: Trade = {
      id: generateRandomString(16),
      botId: this.bot.id,
      symbol: data.symbol,
      side: "buy",
      amount: orderSize,
      price: data.price,
      timestamp: new Date(),
      status: "pending",
    }

    this.trades.push(trade)
    this.updateBotStats()
  }

  private async executeSellOrder(data: MarketDataPoint): Promise<void> {
    const position = this.positions.get(data.symbol) || 0
    if (position <= 0) return

    const trade: Trade = {
      id: generateRandomString(16),
      botId: this.bot.id,
      symbol: data.symbol,
      side: "sell",
      amount: position,
      price: data.price,
      timestamp: new Date(),
      status: "pending",
    }

    this.trades.push(trade)
    this.positions.set(data.symbol, 0)
    this.updateBotStats()
  }

  private updateBotStats(): void {
    const stats = this.calculateStats()
    this.bot.stats = stats
    this.bot.lastUpdate = new Date()
  }

  private calculateStats(): BotStats {
    const filledTrades = this.trades.filter((t) => t.status === "filled")
    const winningTrades = filledTrades.filter((t) => (t.profit || 0) > 0)
    const losingTrades = filledTrades.filter((t) => (t.profit || 0) < 0)

    const totalProfit = filledTrades.reduce((sum, t) => sum + Math.max(t.profit || 0, 0), 0)
    const totalLoss = filledTrades.reduce((sum, t) => sum + Math.min(t.profit || 0, 0), 0)

    return {
      totalTrades: filledTrades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      totalProfit,
      totalLoss,
      winRate: filledTrades.length > 0 ? (winningTrades.length / filledTrades.length) * 100 : 0,
      currentDrawdown: 0,
      maxDrawdown: 0,
      sharpeRatio: 0,
      lastTradeTime: filledTrades[filledTrades.length - 1]?.timestamp,
    }
  }

  getTrades(): Trade[] {
    return this.trades
  }

  getPositions(): Map<string, number> {
    return this.positions
  }
}

export class DCAStrategy extends TradingStrategy {
  private lastBuyTime: Date = new Date(0)
  private buyInterval: number
  private buyAmount: number
  private priceDeviation: number

  constructor(bot: TradingBot) {
    super(bot)
    this.buyInterval = bot.config.parameters.interval === "daily" ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000
    this.buyAmount = bot.config.parameters.amount || 50
    this.priceDeviation = bot.config.parameters.priceDeviation || 5
  }

  getName(): string {
    return "DCA (Dollar Cost Averaging)"
  }

  shouldBuy(marketData: MarketDataPoint): boolean {
    const now = new Date()
    const timeSinceLastBuy = now.getTime() - this.lastBuyTime.getTime()

    if (timeSinceLastBuy < this.buyInterval) return false

    const previousData = this.marketData.get(marketData.symbol)
    if (previousData) {
      const priceChange = Math.abs((marketData.price - previousData.price) / previousData.price) * 100
      if (priceChange > this.priceDeviation) return false
    }

    this.lastBuyTime = now
    return true
  }

  shouldSell(marketData: MarketDataPoint): boolean {
    const position = this.positions.get(marketData.symbol) || 0
    if (position <= 0) return false

    const avgBuyPrice = this.calculateAverageBuyPrice(marketData.symbol)
    const profitPercent = ((marketData.price - avgBuyPrice) / avgBuyPrice) * 100

    return profitPercent >= this.bot.config.takeProfit || profitPercent <= -this.bot.config.stopLoss
  }

  calculateOrderSize(marketData: MarketDataPoint): number {
    return this.buyAmount / marketData.price
  }

  private calculateAverageBuyPrice(symbol: string): number {
    const buyTrades = this.trades.filter((t) => t.symbol === symbol && t.side === "buy" && t.status === "filled")
    if (buyTrades.length === 0) return 0

    const totalValue = buyTrades.reduce((sum, t) => sum + t.amount * t.price, 0)
    const totalAmount = buyTrades.reduce((sum, t) => sum + t.amount, 0)

    return totalValue / totalAmount
  }
}

export class TradingBotEngine {
  private bots: Map<string, TradingBot> = new Map()
  private strategies: Map<string, TradingStrategy> = new Map()
  private marketDataUnsubscribers: Map<string, () => void> = new Map()

  constructor() {
    // Initialize the engine
  }

  createBot(config: {
    name: string
    strategy: string
    pair: string
    investment: number
    riskLevel: number
    stopLoss: number
    takeProfit: number
    maxTrades: number
    parameters: Record<string, any>
  }): TradingBot {
    const bot: TradingBot = {
      id: generateRandomString(16),
      name: config.name,
      strategy: config.strategy,
      pair: config.pair,
      status: "stopped",
      config: {
        investment: config.investment,
        riskLevel: config.riskLevel,
        stopLoss: config.stopLoss,
        takeProfit: config.takeProfit,
        maxTrades: config.maxTrades,
        strategy: config.strategy,
        parameters: config.parameters,
      },
      stats: {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        totalProfit: 0,
        totalLoss: 0,
        winRate: 0,
        currentDrawdown: 0,
        maxDrawdown: 0,
        sharpeRatio: 0,
      },
      createdAt: new Date(),
      lastUpdate: new Date(),
    }

    this.bots.set(bot.id, bot)
    this.createStrategy(bot)

    return bot
  }

  private createStrategy(bot: TradingBot): void {
    let strategy: TradingStrategy

    switch (bot.strategy) {
      case "dca":
        strategy = new DCAStrategy(bot)
        break
      default:
        strategy = new DCAStrategy(bot)
    }

    this.strategies.set(bot.id, strategy)
  }

  startBot(botId: string): boolean {
    const bot = this.bots.get(botId)
    if (!bot) return false

    bot.status = "running"
    console.log(`Bot ${bot.name} started for ${bot.pair}`)
    return true
  }

  stopBot(botId: string): boolean {
    const bot = this.bots.get(botId)
    if (!bot) return false

    bot.status = "stopped"

    const unsubscribe = this.marketDataUnsubscribers.get(botId)
    if (unsubscribe) {
      unsubscribe()
      this.marketDataUnsubscribers.delete(botId)
    }

    console.log(`Bot ${bot.name} stopped`)
    return true
  }

  pauseBot(botId: string): boolean {
    const bot = this.bots.get(botId)
    if (!bot) return false

    bot.status = "paused"
    console.log(`Bot ${bot.name} paused`)
    return true
  }

  deleteBot(botId: string): boolean {
    const bot = this.bots.get(botId)
    if (!bot) return false

    this.stopBot(botId)
    this.bots.delete(botId)
    this.strategies.delete(botId)

    console.log(`Bot ${bot.name} deleted`)
    return true
  }

  getBot(botId: string): TradingBot | undefined {
    return this.bots.get(botId)
  }

  getAllBots(): TradingBot[] {
    return Array.from(this.bots.values())
  }

  getBotTrades(botId: string): Trade[] {
    const strategy = this.strategies.get(botId)
    return strategy ? strategy.getTrades() : []
  }

  getBotPositions(botId: string): Map<string, number> {
    const strategy = this.strategies.get(botId)
    return strategy ? strategy.getPositions() : new Map()
  }

  getPortfolioStats(): {
    totalBots: number
    runningBots: number
    totalProfit: number
    totalTrades: number
    avgWinRate: number
  } {
    const bots = Array.from(this.bots.values())
    const runningBots = bots.filter((b) => b.status === "running").length
    const totalProfit = bots.reduce((sum, b) => sum + b.stats.totalProfit - Math.abs(b.stats.totalLoss), 0)
    const totalTrades = bots.reduce((sum, b) => sum + b.stats.totalTrades, 0)
    const avgWinRate = bots.length > 0 ? bots.reduce((sum, b) => sum + b.stats.winRate, 0) / bots.length : 0

    return {
      totalBots: bots.length,
      runningBots,
      totalProfit,
      totalTrades,
      avgWinRate,
    }
  }

  emergencyStopAll(): void {
    this.bots.forEach((bot, botId) => {
      if (bot.status === "running") {
        this.stopBot(botId)
      }
    })

    console.log("Emergency stop activated - all bots stopped")
  }
}

// Singleton instance
export const tradingBotEngine = new TradingBotEngine()
