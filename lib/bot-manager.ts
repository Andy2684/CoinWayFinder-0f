import { createExchangeClient, type ExchangeAPIClient } from "./exchange-api-client"
import { database, type UserBot } from "./database"
import { DCAStrategy, type DCAConfig } from "./trading-strategies/dca-strategy"
import { ScalpingStrategy, type ScalpingConfig } from "./trading-strategies/scalping-strategy"

export interface BotManagerConfig {
  userId: string
}

export class BotManager {
  private userId: string
  private runningBots: Map<
    string,
    {
      client: ExchangeAPIClient
      strategy: DCAStrategy | ScalpingStrategy
      bot: UserBot
    }
  > = new Map()

  constructor(config: BotManagerConfig) {
    this.userId = config.userId
  }

  async startBot(botId: string): Promise<boolean> {
    try {
      // Get bot from database
      const bot = await database.getBot(botId, this.userId)
      if (!bot) {
        throw new Error("Bot not found")
      }

      if (this.runningBots.has(botId)) {
        console.log(`Bot ${botId} is already running`)
        return true
      }

      // Create exchange client
      const client = createExchangeClient(bot.exchange, {
        apiKey: bot.credentials.apiKey,
        secretKey: bot.credentials.secretKey,
        sandbox: process.env.NODE_ENV !== "production",
      })

      // Test connection
      const connectionTest = await client.testConnection()
      if (!connectionTest) {
        throw new Error("Failed to connect to exchange")
      }

      // Create strategy based on bot configuration
      let strategy: DCAStrategy | ScalpingStrategy

      switch (bot.strategy) {
        case "dca":
          const dcaConfig: DCAConfig = {
            symbol: bot.symbol,
            interval: this.parseInterval(bot.config.dcaInterval || "1h"),
            amount: bot.config.lotSize,
            priceDeviation: bot.config.parameters.priceDeviation || 5,
            maxOrders: bot.config.parameters.maxOrders || 10,
            stopLoss: bot.config.stopLoss,
            takeProfit: bot.config.takeProfit,
          }
          strategy = new DCAStrategy(client, dcaConfig, botId, this.userId)
          break

        case "scalping":
          const scalpingConfig: ScalpingConfig = {
            symbol: bot.symbol,
            quantity: bot.config.lotSize,
            profitTarget: bot.config.takeProfit,
            stopLoss: bot.config.stopLoss,
            maxHoldTime: bot.config.parameters.maxHoldTime || 30,
            rsiPeriod: bot.config.parameters.rsiPeriod || 14,
            rsiOverbought: bot.config.parameters.rsiOverbought || 70,
            rsiOversold: bot.config.parameters.rsiOversold || 30,
            macdFast: bot.config.parameters.macdFast || 12,
            macdSlow: bot.config.parameters.macdSlow || 26,
            macdSignal: bot.config.parameters.macdSignal || 9,
          }
          strategy = new ScalpingStrategy(client, scalpingConfig, botId, this.userId)
          break

        default:
          throw new Error(`Unsupported strategy: ${bot.strategy}`)
      }

      // Start the strategy
      await strategy.start()

      // Store running bot
      this.runningBots.set(botId, { client, strategy, bot })

      // Update bot status in database
      await database.updateBot(botId, this.userId, { status: "running" })

      console.log(`Bot ${bot.name} started successfully`)
      return true
    } catch (error) {
      console.error(`Failed to start bot ${botId}:`, error)

      // Update bot status to error
      await database.updateBot(botId, this.userId, { status: "error" })

      return false
    }
  }

  async stopBot(botId: string): Promise<boolean> {
    try {
      const runningBot = this.runningBots.get(botId)
      if (!runningBot) {
        console.log(`Bot ${botId} is not running`)
        return true
      }

      // Stop the strategy
      await runningBot.strategy.stop()

      // Remove from running bots
      this.runningBots.delete(botId)

      // Update bot status in database
      await database.updateBot(botId, this.userId, { status: "stopped" })

      console.log(`Bot ${botId} stopped successfully`)
      return true
    } catch (error) {
      console.error(`Failed to stop bot ${botId}:`, error)
      return false
    }
  }

  async pauseBot(botId: string): Promise<boolean> {
    try {
      const runningBot = this.runningBots.get(botId)
      if (!runningBot) {
        return false
      }

      // Stop the strategy but keep it in memory
      await runningBot.strategy.stop()

      // Update bot status in database
      await database.updateBot(botId, this.userId, { status: "paused" })

      console.log(`Bot ${botId} paused successfully`)
      return true
    } catch (error) {
      console.error(`Failed to pause bot ${botId}:`, error)
      return false
    }
  }

  async deleteBot(botId: string): Promise<boolean> {
    try {
      // Stop bot if running
      await this.stopBot(botId)

      // Delete from database
      const deleted = await database.deleteBot(botId, this.userId)

      if (deleted) {
        console.log(`Bot ${botId} deleted successfully`)
      }

      return deleted
    } catch (error) {
      console.error(`Failed to delete bot ${botId}:`, error)
      return false
    }
  }

  async createBot(config: {
    name: string
    exchange: string
    strategy: string
    symbol: string
    apiKey: string
    secretKey: string
    riskLevel: number
    lotSize: number
    takeProfit: number
    stopLoss: number
    dcaInterval?: string
    investment: number
    parameters: Record<string, any>
  }): Promise<string | null> {
    try {
      // Test exchange connection first
      const client = createExchangeClient(config.exchange, {
        apiKey: config.apiKey,
        secretKey: config.secretKey,
        sandbox: process.env.NODE_ENV !== "production",
      })

      const connectionTest = await client.testConnection()
      if (!connectionTest) {
        throw new Error("Invalid API credentials or exchange connection failed")
      }

      // Create bot in database
      const botId = await database.createBot({
        userId: this.userId,
        name: config.name,
        exchange: config.exchange,
        strategy: config.strategy,
        symbol: config.symbol,
        status: "stopped",
        config: {
          riskLevel: config.riskLevel,
          lotSize: config.lotSize,
          takeProfit: config.takeProfit,
          stopLoss: config.stopLoss,
          dcaInterval: config.dcaInterval,
          investment: config.investment,
          parameters: config.parameters,
        },
        credentials: {
          apiKey: config.apiKey,
          secretKey: config.secretKey,
          encrypted: false,
        },
        stats: {
          totalTrades: 0,
          winningTrades: 0,
          totalProfit: 0,
          totalLoss: 0,
          winRate: 0,
          createdAt: new Date(),
        },
      })

      console.log(`Bot ${config.name} created with ID: ${botId}`)
      return botId
    } catch (error) {
      console.error("Failed to create bot:", error)
      return null
    }
  }

  async getBotStats(botId: string): Promise<any> {
    const runningBot = this.runningBots.get(botId)
    if (!runningBot) {
      return null
    }

    // Get strategy-specific stats
    let strategyStats = {}
    if (runningBot.strategy instanceof DCAStrategy) {
      strategyStats = runningBot.strategy.getStats()
    } else if (runningBot.strategy instanceof ScalpingStrategy) {
      strategyStats = runningBot.strategy.getStats()
    }

    // Get performance stats from database
    const performanceStats = await database.getBotPerformance(botId)

    return {
      ...strategyStats,
      ...performanceStats,
      isRunning: true,
    }
  }

  async getAllBots(): Promise<UserBot[]> {
    return database.getUserBots(this.userId)
  }

  async getPortfolioStats(): Promise<any> {
    return database.getPortfolioStats(this.userId)
  }

  async emergencyStopAll(): Promise<void> {
    console.log("Emergency stop activated - stopping all bots")

    const stopPromises = Array.from(this.runningBots.keys()).map((botId) => this.stopBot(botId))
    await Promise.all(stopPromises)

    console.log("All bots stopped")
  }

  private parseInterval(interval: string): number {
    const unit = interval.slice(-1)
    const value = Number.parseInt(interval.slice(0, -1))

    switch (unit) {
      case "m":
        return value
      case "h":
        return value * 60
      case "d":
        return value * 60 * 24
      default:
        return 60 // Default to 1 hour
    }
  }

  getRunningBotsCount(): number {
    return this.runningBots.size
  }

  isRunning(botId: string): boolean {
    return this.runningBots.has(botId)
  }
}

// Global bot managers for different users
const botManagers: Map<string, BotManager> = new Map()

export function getBotManager(userId: string): BotManager {
  if (!botManagers.has(userId)) {
    botManagers.set(userId, new BotManager({ userId }))
  }
  return botManagers.get(userId)!
}
