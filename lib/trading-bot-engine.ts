import { database } from "./database"

export interface TradingBot {
  id: string
  userId: string
  name: string
  strategy: string
  status: "active" | "inactive" | "paused"
  config: any
  performance: {
    totalTrades: number
    winRate: number
    totalPnL: number
  }
  createdAt: Date
  updatedAt: Date
}

export class TradingBotEngine {
  private bots = new Map<string, TradingBot>()
  private intervals = new Map<string, NodeJS.Timeout>()

  async createBot(userId: string, botConfig: any): Promise<TradingBot> {
    const bot = await database.createBot(userId, {
      name: botConfig.name,
      strategy: botConfig.strategy,
      config: botConfig,
      performance: {
        totalTrades: 0,
        winRate: 0,
        totalPnL: 0,
      },
    })

    this.bots.set(bot.id, bot)
    return bot
  }

  async startBot(botId: string): Promise<boolean> {
    const bot = await database.getBotById(botId)
    if (!bot) return false

    // Update bot status
    await database.updateBot(botId, { status: "active" })

    // Start trading logic
    const interval = setInterval(() => {
      this.executeTradingLogic(botId)
    }, 60000) // Execute every minute

    this.intervals.set(botId, interval)
    return true
  }

  async stopBot(botId: string): Promise<boolean> {
    const bot = await database.getBotById(botId)
    if (!bot) return false

    // Update bot status
    await database.updateBot(botId, { status: "inactive" })

    // Stop trading logic
    const interval = this.intervals.get(botId)
    if (interval) {
      clearInterval(interval)
      this.intervals.delete(botId)
    }

    return true
  }

  async pauseBot(botId: string): Promise<boolean> {
    const bot = await database.getBotById(botId)
    if (!bot) return false

    await database.updateBot(botId, { status: "paused" })

    const interval = this.intervals.get(botId)
    if (interval) {
      clearInterval(interval)
      this.intervals.delete(botId)
    }

    return true
  }

  async getBotsByUser(userId: string): Promise<TradingBot[]> {
    return await database.getBotsByUserId(userId)
  }

  async getBotPerformance(botId: string): Promise<any> {
    const trades = await database.getTradesByBotId(botId)

    const totalTrades = trades.length
    const winningTrades = trades.filter((trade) => trade.pnl > 0).length
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0
    const totalPnL = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0)

    return {
      totalTrades,
      winRate,
      totalPnL,
      trades: trades.slice(-10), // Last 10 trades
    }
  }

  private async executeTradingLogic(botId: string): Promise<void> {
    try {
      const bot = await database.getBotById(botId)
      if (!bot || bot.status !== "active") return

      // Mock trading logic
      const shouldTrade = Math.random() > 0.8 // 20% chance to trade

      if (shouldTrade) {
        const trade = {
          botId,
          userId: bot.userId,
          symbol: "BTC/USDT",
          side: Math.random() > 0.5 ? "buy" : "sell",
          amount: 0.001,
          price: 50000 + (Math.random() - 0.5) * 1000,
          pnl: (Math.random() - 0.5) * 100,
          status: "completed",
        }

        await database.createTrade(trade)
        console.log(`Bot ${botId} executed trade:`, trade)
      }
    } catch (error) {
      console.error(`Error executing trading logic for bot ${botId}:`, error)
    }
  }

  async updateBotConfig(botId: string, config: any): Promise<boolean> {
    const bot = await database.updateBot(botId, { config })
    return !!bot
  }

  async deleteBot(botId: string): Promise<boolean> {
    // Stop bot if running
    await this.stopBot(botId)

    // Delete from database
    return await database.deleteBot(botId)
  }

  // Get all active bots for monitoring
  async getActiveBots(): Promise<TradingBot[]> {
    const allBots = []
    for (const bot of this.bots.values()) {
      if (bot.status === "active") {
        allBots.push(bot)
      }
    }
    return allBots
  }
}

export const tradingBotEngine = new TradingBotEngine()
