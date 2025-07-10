import { tradingBotEngine, type TradingBotEngine } from "./trading-bot-engine"
import { database } from "./database"
import { subscriptionManager } from "./subscription-manager"

export class BotManager {
  private engine: TradingBotEngine

  constructor() {
    this.engine = tradingBotEngine
  }

  async createBot(userId: string, botConfig: any): Promise<any> {
    // Check subscription limits
    const limits = await subscriptionManager.checkUsageLimits(userId, "bots")
    if (!limits.allowed) {
      throw new Error("Bot limit exceeded for your subscription plan")
    }

    const bot = await this.engine.createBot(userId, botConfig)
    await subscriptionManager.incrementUsage(userId, "bots")

    return bot
  }

  async startBot(userId: string, botId: string): Promise<boolean> {
    const bot = await database.getBotById(botId)
    if (!bot || bot.userId !== userId) {
      throw new Error("Bot not found or access denied")
    }

    return await this.engine.startBot(botId)
  }

  async stopBot(userId: string, botId: string): Promise<boolean> {
    const bot = await database.getBotById(botId)
    if (!bot || bot.userId !== userId) {
      throw new Error("Bot not found or access denied")
    }

    return await this.engine.stopBot(botId)
  }

  async pauseBot(userId: string, botId: string): Promise<boolean> {
    const bot = await database.getBotById(botId)
    if (!bot || bot.userId !== userId) {
      throw new Error("Bot not found or access denied")
    }

    return await this.engine.pauseBot(botId)
  }

  async getUserBots(userId: string): Promise<any[]> {
    return await this.engine.getBotsByUser(userId)
  }

  async getBotPerformance(userId: string, botId: string): Promise<any> {
    const bot = await database.getBotById(botId)
    if (!bot || bot.userId !== userId) {
      throw new Error("Bot not found or access denied")
    }

    return await this.engine.getBotPerformance(botId)
  }

  async updateBot(userId: string, botId: string, updates: any): Promise<any> {
    const bot = await database.getBotById(botId)
    if (!bot || bot.userId !== userId) {
      throw new Error("Bot not found or access denied")
    }

    return await this.engine.updateBotConfig(botId, updates)
  }

  async deleteBot(userId: string, botId: string): Promise<boolean> {
    const bot = await database.getBotById(botId)
    if (!bot || bot.userId !== userId) {
      throw new Error("Bot not found or access denied")
    }

    const result = await this.engine.deleteBot(botId)
    if (result) {
      // Decrement usage count
      await subscriptionManager.incrementUsage(userId, "bots", -1)
    }

    return result
  }

  async getBotStats(userId: string): Promise<any> {
    const bots = await this.getUserBots(userId)
    const activeBots = bots.filter((bot) => bot.status === "active")

    let totalTrades = 0
    let totalPnL = 0

    for (const bot of bots) {
      const performance = await this.engine.getBotPerformance(bot.id)
      totalTrades += performance.totalTrades
      totalPnL += performance.totalPnL
    }

    return {
      totalBots: bots.length,
      activeBots: activeBots.length,
      totalTrades,
      totalPnL,
      averagePnL: bots.length > 0 ? totalPnL / bots.length : 0,
    }
  }
}

const botManager = new BotManager()

export function getBotManager(): BotManager {
  return botManager
}
