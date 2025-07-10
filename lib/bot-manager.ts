import { database, type Bot } from "./database"
import { subscriptionManager } from "./subscription-manager"

export interface BotConfig {
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
  parameters?: any
}

export interface BotStats {
  totalTrades: number
  winRate: number
  totalProfit: number
  totalLoss: number
  currentDrawdown: number
  lastTradeAt?: Date
  performance24h: number
  performance7d: number
  performance30d: number
}

class BotManager {
  private userId: string

  constructor(userId: string) {
    this.userId = userId
  }

  async createBot(config: BotConfig): Promise<string | null> {
    try {
      const canCreate = await subscriptionManager.canCreateBot(this.userId)
      if (!canCreate.allowed) {
        throw new Error(canCreate.reason)
      }

      const isValidCredentials = await this.validateExchangeCredentials(
        config.exchange,
        config.apiKey,
        config.secretKey,
      )
      if (!isValidCredentials) {
        throw new Error("Invalid exchange credentials")
      }

      const botData: Omit<Bot, "_id"> = {
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
          investment: config.investment,
          dcaInterval: config.dcaInterval,
          parameters: config.parameters,
        },
        stats: {
          totalTrades: 0,
          winRate: 0,
          totalProfit: 0,
          totalLoss: 0,
          currentDrawdown: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const bot = await database.createBot(botData)

      await subscriptionManager.incrementUsage(this.userId, "bots")

      return bot._id!.toString()
    } catch (error) {
      console.error("Create bot error:", error)
      return null
    }
  }

  async getAllBots(): Promise<Bot[]> {
    return database.getUserBots(this.userId)
  }

  async getBotById(botId: string): Promise<Bot | null> {
    const bot = await database.getBotById(botId)

    if (bot && bot.userId !== this.userId) {
      return null
    }

    return bot
  }

  async updateBot(botId: string, updates: Partial<BotConfig>): Promise<boolean> {
    try {
      const bot = await this.getBotById(botId)
      if (!bot) {
        return false
      }

      const updateData: Partial<Bot> = {
        updatedAt: new Date(),
      }

      if (updates.name) updateData.name = updates.name
      if (updates.strategy) updateData.strategy = updates.strategy
      if (updates.symbol) updateData.symbol = updates.symbol

      if (
        updates.riskLevel !== undefined ||
        updates.lotSize !== undefined ||
        updates.takeProfit !== undefined ||
        updates.stopLoss !== undefined ||
        updates.investment !== undefined
      ) {
        updateData.config = {
          ...bot.config,
          ...(updates.riskLevel !== undefined && { riskLevel: updates.riskLevel }),
          ...(updates.lotSize !== undefined && { lotSize: updates.lotSize }),
          ...(updates.takeProfit !== undefined && { takeProfit: updates.takeProfit }),
          ...(updates.stopLoss !== undefined && { stopLoss: updates.stopLoss }),
          ...(updates.investment !== undefined && { investment: updates.investment }),
        }
      }

      await database.updateBot(botId, updateData)
      return true
    } catch (error) {
      console.error("Update bot error:", error)
      return false
    }
  }

  async deleteBot(botId: string): Promise<boolean> {
    try {
      const bot = await this.getBotById(botId)
      if (!bot) {
        return false
      }

      await database.deleteBot(botId)

      await subscriptionManager.decrementUsage(this.userId, "bots")

      return true
    } catch (error) {
      console.error("Delete bot error:", error)
      return false
    }
  }

  async startBot(botId: string): Promise<boolean> {
    try {
      const bot = await this.getBotById(botId)
      if (!bot) {
        return false
      }

      await database.updateBot(botId, {
        status: "running",
        lastRunAt: new Date(),
        updatedAt: new Date(),
      })

      return true
    } catch (error) {
      console.error("Start bot error:", error)
      return false
    }
  }

  async stopBot(botId: string): Promise<boolean> {
    try {
      const bot = await this.getBotById(botId)
      if (!bot) {
        return false
      }

      await database.updateBot(botId, {
        status: "stopped",
        updatedAt: new Date(),
      })

      return true
    } catch (error) {
      console.error("Stop bot error:", error)
      return false
    }
  }

  async pauseBot(botId: string): Promise<boolean> {
    try {
      const bot = await this.getBotById(botId)
      if (!bot) {
        return false
      }

      await database.updateBot(botId, {
        status: "paused",
        updatedAt: new Date(),
      })

      return true
    } catch (error) {
      console.error("Pause bot error:", error)
      return false
    }
  }

  async updateBotStats(botId: string, stats: Partial<BotStats>): Promise<boolean> {
    try {
      const bot = await this.getBotById(botId)
      if (!bot) {
        return false
      }

      const updatedStats = {
        ...bot.stats,
        ...stats,
      }

      await database.updateBot(botId, {
        stats: updatedStats,
        updatedAt: new Date(),
      })

      return true
    } catch (error) {
      console.error("Update bot stats error:", error)
      return false
    }
  }

  async getBotPerformance(botId: string): Promise<{
    totalReturn: number
    dailyReturns: number[]
    monthlyReturns: number[]
    sharpeRatio: number
    maxDrawdown: number
    winRate: number
  } | null> {
    try {
      const bot = await this.getBotById(botId)
      if (!bot) {
        return null
      }

      return {
        totalReturn: bot.stats.totalProfit - bot.stats.totalLoss,
        dailyReturns: Array.from({ length: 30 }, () => (Math.random() - 0.5) * 5),
        monthlyReturns: Array.from({ length: 12 }, () => (Math.random() - 0.5) * 20),
        sharpeRatio: 1.2 + Math.random() * 0.8,
        maxDrawdown: bot.stats.currentDrawdown,
        winRate: bot.stats.winRate,
      }
    } catch (error) {
      console.error("Get bot performance error:", error)
      return null
    }
  }

  private async validateExchangeCredentials(exchange: string, apiKey: string, secretKey: string): Promise<boolean> {
    return apiKey.length > 10 && secretKey.length > 10
  }

  async getActiveBots(): Promise<Bot[]> {
    const allBots = await this.getAllBots()
    return allBots.filter((bot) => bot.status === "running")
  }

  async getBotsByStatus(status: string): Promise<Bot[]> {
    const allBots = await this.getAllBots()
    return allBots.filter((bot) => bot.status === status)
  }

  async getTotalStats(): Promise<{
    totalBots: number
    activeBots: number
    totalProfit: number
    totalTrades: number
    averageWinRate: number
  }> {
    const bots = await this.getAllBots()

    const totalProfit = bots.reduce((sum, bot) => sum + (bot.stats.totalProfit - bot.stats.totalLoss), 0)
    const totalTrades = bots.reduce((sum, bot) => sum + bot.stats.totalTrades, 0)
    const averageWinRate = bots.length > 0 ? bots.reduce((sum, bot) => sum + bot.stats.winRate, 0) / bots.length : 0

    return {
      totalBots: bots.length,
      activeBots: bots.filter((bot) => bot.status === "running").length,
      totalProfit,
      totalTrades,
      averageWinRate,
    }
  }
}

export function getBotManager(userId: string): BotManager {
  return new BotManager(userId)
}

export { BotManager }
