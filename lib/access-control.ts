import { database } from "./database"

export interface AccessLevel {
  name: string
  features: string[]
  limits: {
    bots: number
    apiCalls: number
    portfolios: number
    alerts: number
  }
}

export interface UserAccess {
  userId: string
  subscription: string
  features: string[]
  limits: {
    bots: number
    apiCalls: number
    portfolios: number
    alerts: number
  }
  usage: {
    bots: number
    apiCalls: number
    portfolios: number
    alerts: number
  }
}

export class AccessControl {
  private static accessLevels: Record<string, AccessLevel> = {
    free: {
      name: "Free",
      features: ["basic_dashboard", "market_data", "news"],
      limits: {
        bots: 1,
        apiCalls: 100,
        portfolios: 1,
        alerts: 5,
      },
    },
    starter: {
      name: "Starter",
      features: ["basic_dashboard", "market_data", "news", "basic_bots", "portfolio_tracking"],
      limits: {
        bots: 3,
        apiCalls: 1000,
        portfolios: 3,
        alerts: 20,
      },
    },
    pro: {
      name: "Pro",
      features: [
        "basic_dashboard",
        "market_data",
        "news",
        "basic_bots",
        "advanced_bots",
        "portfolio_tracking",
        "whale_alerts",
        "ai_signals",
        "api_access",
      ],
      limits: {
        bots: 10,
        apiCalls: 10000,
        portfolios: 10,
        alerts: 100,
      },
    },
    enterprise: {
      name: "Enterprise",
      features: [
        "basic_dashboard",
        "market_data",
        "news",
        "basic_bots",
        "advanced_bots",
        "portfolio_tracking",
        "whale_alerts",
        "ai_signals",
        "api_access",
        "priority_support",
        "custom_strategies",
        "backtesting",
      ],
      limits: {
        bots: -1, // Unlimited
        apiCalls: -1, // Unlimited
        portfolios: -1, // Unlimited
        alerts: -1, // Unlimited
      },
    },
  }

  static async getUserAccess(userId: string): Promise<UserAccess> {
    const userSettings = await database.getUserSettings(userId)
    const subscription = userSettings?.subscription || "free"
    const accessLevel = this.accessLevels[subscription] || this.accessLevels.free

    // Get current usage
    const usage = await this.getCurrentUsage(userId)

    return {
      userId,
      subscription,
      features: accessLevel.features,
      limits: accessLevel.limits,
      usage,
    }
  }

  static async hasFeatureAccess(userId: string, feature: string): Promise<boolean> {
    const access = await this.getUserAccess(userId)
    return access.features.includes(feature)
  }

  static async canCreateBot(userId: string): Promise<boolean> {
    const access = await this.getUserAccess(userId)

    if (access.limits.bots === -1) return true // Unlimited

    return access.usage.bots < access.limits.bots
  }

  static async canMakeAPICall(userId: string): Promise<boolean> {
    const access = await this.getUserAccess(userId)

    if (access.limits.apiCalls === -1) return true // Unlimited

    return access.usage.apiCalls < access.limits.apiCalls
  }

  static async canCreatePortfolio(userId: string): Promise<boolean> {
    const access = await this.getUserAccess(userId)

    if (access.limits.portfolios === -1) return true // Unlimited

    return access.usage.portfolios < access.limits.portfolios
  }

  static async canCreateAlert(userId: string): Promise<boolean> {
    const access = await this.getUserAccess(userId)

    if (access.limits.alerts === -1) return true // Unlimited

    return access.usage.alerts < access.limits.alerts
  }

  static async incrementUsage(userId: string, type: "bots" | "apiCalls" | "portfolios" | "alerts"): Promise<void> {
    const userSettings = await database.getUserSettings(userId)
    if (!userSettings) return

    const currentUsage = userSettings.usage || { bots: 0, apiCalls: 0, portfolios: 0, alerts: 0 }
    currentUsage[type] = (currentUsage[type] || 0) + 1

    await database.updateUserSettings(userId, { usage: currentUsage })
  }

  static async resetMonthlyUsage(userId: string): Promise<void> {
    await database.updateUserSettings(userId, {
      usage: { bots: 0, apiCalls: 0, portfolios: 0, alerts: 0 },
    })
  }

  private static async getCurrentUsage(userId: string): Promise<UserAccess["usage"]> {
    const userSettings = await database.getUserSettings(userId)

    return (
      userSettings?.usage || {
        bots: 0,
        apiCalls: 0,
        portfolios: 0,
        alerts: 0,
      }
    )
  }

  static getAccessLevels(): Record<string, AccessLevel> {
    return this.accessLevels
  }

  static async getAccessSummary(userId: string): Promise<{
    subscription: string
    features: string[]
    limits: UserAccess["limits"]
    usage: UserAccess["usage"]
    percentUsed: Record<string, number>
  }> {
    const access = await this.getUserAccess(userId)

    const percentUsed: Record<string, number> = {}

    Object.keys(access.limits).forEach((key) => {
      const limit = access.limits[key as keyof typeof access.limits]
      const used = access.usage[key as keyof typeof access.usage]

      if (limit === -1) {
        percentUsed[key] = 0 // Unlimited
      } else {
        percentUsed[key] = limit > 0 ? (used / limit) * 100 : 0
      }
    })

    return {
      subscription: access.subscription,
      features: access.features,
      limits: access.limits,
      usage: access.usage,
      percentUsed,
    }
  }
}

export const accessControl = new AccessControl()
