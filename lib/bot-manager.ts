import { tradingBotEngine, type TradingBotEngine } from "./trading-bot-engine"
import { database } from "./database"
import { subscriptionManager } from "./subscription-manager"
import { securityMonitor, SecurityEventType, SecuritySeverity } from "./security-monitor"

export interface BotManagerConfig {
  maxBotsPerUser: number
  defaultRiskLevel: "low" | "medium" | "high"
  enableRiskChecks: boolean
  enablePerformanceTracking: boolean
}

export interface BotCreationRequest {
  userId: string
  name: string
  strategy: string
  symbol: string
  amount: number
  riskLevel: "low" | "medium" | "high"
  stopLoss?: number
  takeProfit?: number
  maxTrades?: number
  parameters?: Record<string, any>
}

export interface BotUpdateRequest {
  name?: string
  status?: "active" | "paused" | "stopped"
  config?: Record<string, any>
  riskLevel?: "low" | "medium" | "high"
}

class BotManager {
  private engine: TradingBotEngine
  private config: BotManagerConfig

  constructor(config?: Partial<BotManagerConfig>) {
    this.engine = tradingBotEngine
    this.config = {
      maxBotsPerUser: 10,
      defaultRiskLevel: "medium",
      enableRiskChecks: true,
      enablePerformanceTracking: true,
      ...config,
    }
  }

  async createBot(request: BotCreationRequest): Promise<string> {
    try {
      // Validate user permissions
      const hasAccess = await subscriptionManager.checkAccess(request.userId, "trading")
      if (!hasAccess) {
        throw new Error("Insufficient subscription permissions")
      }

      // Check bot limits
      const limits = await subscriptionManager.checkLimits(request.userId, "bots")
      if (!limits.allowed) {
        throw new Error(`Bot limit reached. Current: ${limits.current}, Limit: ${limits.limit}`)
      }

      // Validate request
      this.validateBotCreationRequest(request)

      // Perform risk assessment
      if (this.config.enableRiskChecks) {
        await this.performRiskAssessment(request)
      }

      // Create bot configuration
      const botConfig = {
        symbol: request.symbol,
        strategy: request.strategy,
        amount: request.amount,
        stopLoss: request.stopLoss,
        takeProfit: request.takeProfit,
        maxTrades: request.maxTrades,
        riskLevel: request.riskLevel || this.config.defaultRiskLevel,
        parameters: request.parameters || {},
      }

      // Create bot using trading engine
      const botId = await this.engine.createBot(request.userId, botConfig)

      // Update bot name if provided
      if (request.name) {
        await database.updateBot(botId, { name: request.name })
      }

      // Log security event
      securityMonitor.logEvent(
        SecurityEventType.ADMIN_ACTION,
        SecuritySeverity.LOW,
        `Bot created: ${request.name || botId}`,
        {
          userId: request.userId,
          botId,
          strategy: request.strategy,
          symbol: request.symbol,
        },
      )

      return botId
    } catch (error) {
      // Log error
      securityMonitor.logEvent(
        SecurityEventType.SYSTEM_ERROR,
        SecuritySeverity.MEDIUM,
        `Bot creation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        {
          userId: request.userId,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      )

      throw error
    }
  }

  private validateBotCreationRequest(request: BotCreationRequest): void {
    if (!request.userId) {
      throw new Error("User ID is required")
    }

    if (!request.strategy) {
      throw new Error("Strategy is required")
    }

    if (!request.symbol) {
      throw new Error("Symbol is required")
    }

    if (!request.amount || request.amount <= 0) {
      throw new Error("Amount must be greater than 0")
    }

    if (request.stopLoss && (request.stopLoss <= 0 || request.stopLoss >= 1)) {
      throw new Error("Stop loss must be between 0 and 1")
    }

    if (request.takeProfit && (request.takeProfit <= 0 || request.takeProfit >= 1)) {
      throw new Error("Take profit must be between 0 and 1")
    }

    const validStrategies = ["scalping", "dca", "momentum", "arbitrage", "grid"]
    if (!validStrategies.includes(request.strategy)) {
      throw new Error(`Invalid strategy. Must be one of: ${validStrategies.join(", ")}`)
    }

    const validRiskLevels = ["low", "medium", "high"]
    if (request.riskLevel && !validRiskLevels.includes(request.riskLevel)) {
      throw new Error(`Invalid risk level. Must be one of: ${validRiskLevels.join(", ")}`)
    }
  }

  private async performRiskAssessment(request: BotCreationRequest): Promise<void> {
    // Get user's existing bots
    const userBots = await database.getBotsByUserId(request.userId)
    const activeBots = userBots.filter((bot) => bot.status === "active")

    // Check for excessive risk
    if (request.riskLevel === "high" && activeBots.length >= 3) {
      throw new Error("Too many high-risk bots. Please reduce risk or stop some bots.")
    }

    // Check for duplicate strategies on same symbol
    const duplicateStrategy = activeBots.find(
      (bot) => bot.strategy === request.strategy && bot.config.symbol === request.symbol,
    )

    if (duplicateStrategy) {
      securityMonitor.logEvent(
        SecurityEventType.SUSPICIOUS_ACTIVITY,
        SecuritySeverity.LOW,
        `Duplicate strategy detected: ${request.strategy} on ${request.symbol}`,
        {
          userId: request.userId,
          strategy: request.strategy,
          symbol: request.symbol,
        },
      )
    }

    // Check amount limits based on risk level
    const maxAmounts = {
      low: 100,
      medium: 500,
      high: 1000,
    }

    const maxAmount = maxAmounts[request.riskLevel || "medium"]
    if (request.amount > maxAmount) {
      throw new Error(`Amount too high for ${request.riskLevel} risk level. Max: ${maxAmount}`)
    }
  }

  async updateBot(botId: string, userId: string, updates: BotUpdateRequest): Promise<boolean> {
    try {
      // Verify bot ownership
      const bot = await database.getBotById(botId)
      if (!bot) {
        throw new Error("Bot not found")
      }

      if (bot.userId !== userId) {
        securityMonitor.logEvent(
          SecurityEventType.UNAUTHORIZED_ACCESS,
          SecuritySeverity.HIGH,
          `Unauthorized bot update attempt`,
          {
            userId,
            botId,
            actualOwnerId: bot.userId,
          },
        )
        throw new Error("Unauthorized: Bot does not belong to user")
      }

      // Validate updates
      if (updates.status && !["active", "paused", "stopped"].includes(updates.status)) {
        throw new Error("Invalid status")
      }

      // Apply updates
      const updateData: any = {}

      if (updates.name) {
        updateData.name = updates.name
      }

      if (updates.config) {
        updateData.config = { ...bot.config, ...updates.config }
      }

      if (updates.status) {
        updateData.status = updates.status

        // Use trading engine methods for status changes
        switch (updates.status) {
          case "active":
            await this.engine.startBot(botId)
            break
          case "paused":
            await this.engine.pauseBot(botId)
            break
          case "stopped":
            await this.engine.stopBot(botId)
            break
        }
      }

      if (Object.keys(updateData).length > 0) {
        await database.updateBot(botId, updateData)
      }

      // Log update
      securityMonitor.logEvent(SecurityEventType.ADMIN_ACTION, SecuritySeverity.LOW, `Bot updated: ${botId}`, {
        userId,
        botId,
        updates: Object.keys(updates),
      })

      return true
    } catch (error) {
      securityMonitor.logEvent(
        SecurityEventType.SYSTEM_ERROR,
        SecuritySeverity.MEDIUM,
        `Bot update failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        {
          userId,
          botId,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      )

      throw error
    }
  }

  async deleteBot(botId: string, userId: string): Promise<boolean> {
    try {
      // Verify bot ownership
      const bot = await database.getBotById(botId)
      if (!bot) {
        throw new Error("Bot not found")
      }

      if (bot.userId !== userId) {
        securityMonitor.logEvent(
          SecurityEventType.UNAUTHORIZED_ACCESS,
          SecuritySeverity.HIGH,
          `Unauthorized bot deletion attempt`,
          {
            userId,
            botId,
            actualOwnerId: bot.userId,
          },
        )
        throw new Error("Unauthorized: Bot does not belong to user")
      }

      // Delete using trading engine
      const success = await this.engine.deleteBot(botId)

      if (success) {
        securityMonitor.logEvent(SecurityEventType.ADMIN_ACTION, SecuritySeverity.LOW, `Bot deleted: ${botId}`, {
          userId,
          botId,
          botName: bot.name,
        })
      }

      return success
    } catch (error) {
      securityMonitor.logEvent(
        SecurityEventType.SYSTEM_ERROR,
        SecuritySeverity.MEDIUM,
        `Bot deletion failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        {
          userId,
          botId,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      )

      throw error
    }
  }

  async getUserBots(userId: string): Promise<any[]> {
    try {
      const bots = await this.engine.getUserBots(userId)

      // Add performance data if enabled
      if (this.config.enablePerformanceTracking) {
        for (const bot of bots) {
          const performance = await this.engine.getBotPerformance(bot.id)
          if (performance) {
            bot.performance = performance
          }
        }
      }

      return bots
    } catch (error) {
      securityMonitor.logEvent(
        SecurityEventType.SYSTEM_ERROR,
        SecuritySeverity.LOW,
        `Failed to get user bots: ${error instanceof Error ? error.message : "Unknown error"}`,
        {
          userId,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      )

      throw error
    }
  }

  async getBotDetails(botId: string, userId: string): Promise<any> {
    try {
      const bot = await database.getBotById(botId)
      if (!bot) {
        throw new Error("Bot not found")
      }

      if (bot.userId !== userId) {
        securityMonitor.logEvent(
          SecurityEventType.UNAUTHORIZED_ACCESS,
          SecuritySeverity.MEDIUM,
          `Unauthorized bot access attempt`,
          {
            userId,
            botId,
            actualOwnerId: bot.userId,
          },
        )
        throw new Error("Unauthorized: Bot does not belong to user")
      }

      // Get additional data
      const performance = await this.engine.getBotPerformance(botId)
      const trades = await database.getTradesByBotId(botId)
      const signals = await this.engine.getActiveSignals(botId)

      return {
        ...bot,
        performance,
        trades: trades.slice(-10), // Last 10 trades
        activeSignals: signals,
      }
    } catch (error) {
      securityMonitor.logEvent(
        SecurityEventType.SYSTEM_ERROR,
        SecuritySeverity.LOW,
        `Failed to get bot details: ${error instanceof Error ? error.message : "Unknown error"}`,
        {
          userId,
          botId,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      )

      throw error
    }
  }

  async getAvailableStrategies(): Promise<string[]> {
    return ["scalping", "dca", "momentum", "arbitrage", "grid"]
  }

  async getAvailableSymbols(): Promise<string[]> {
    const marketData = await this.engine.getMarketData()
    return marketData.map((data) => data.symbol)
  }

  async getBotStatistics(userId: string): Promise<{
    totalBots: number
    activeBots: number
    pausedBots: number
    stoppedBots: number
    totalTrades: number
    totalPnL: number
    averageWinRate: number
  }> {
    try {
      const bots = await this.getUserBots(userId)
      const trades = await database.getTradesByUserId(userId)

      const stats = {
        totalBots: bots.length,
        activeBots: bots.filter((b) => b.status === "active").length,
        pausedBots: bots.filter((b) => b.status === "paused").length,
        stoppedBots: bots.filter((b) => b.status === "stopped").length,
        totalTrades: trades.length,
        totalPnL: bots.reduce((sum, bot) => sum + (bot.performance?.totalPnL || 0), 0),
        averageWinRate:
          bots.length > 0 ? bots.reduce((sum, bot) => sum + (bot.performance?.winRate || 0), 0) / bots.length : 0,
      }

      return stats
    } catch (error) {
      securityMonitor.logEvent(
        SecurityEventType.SYSTEM_ERROR,
        SecuritySeverity.LOW,
        `Failed to get bot statistics: ${error instanceof Error ? error.message : "Unknown error"}`,
        {
          userId,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      )

      throw error
    }
  }
}

// Create and export bot manager instance
const botManager = new BotManager()

export function getBotManager(): BotManager {
  return botManager
}

export { BotManager }
