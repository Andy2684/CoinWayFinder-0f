import { subscriptionManager, SUBSCRIPTION_PLANS } from "./subscription-manager"
import { database } from "./database"

export interface AccessLevel {
  canCreateBots: boolean
  maxBots: number
  canUseAdvancedStrategies: boolean
  canAccessAPI: boolean
  canUseWhaleAlerts: boolean
  canUseAISignals: boolean
  canUsePrioritySupport: boolean
  canUseCustomStrategies: boolean
  canUseBacktesting: boolean
  maxAPICallsPerDay: number
  maxPortfolios: number
  maxAlerts: number
}

export interface FeatureAccess {
  feature: string
  hasAccess: boolean
  reason?: string
  upgradeRequired?: string
}

class AccessControl {
  async getUserAccessLevel(userId: string): Promise<AccessLevel> {
    const subscriptionStatus = await subscriptionManager.getSubscriptionStatus(userId)
    const plan = SUBSCRIPTION_PLANS[subscriptionStatus.plan as keyof typeof SUBSCRIPTION_PLANS]

    if (!plan) {
      return this.getFreeAccessLevel()
    }

    return {
      canCreateBots: true,
      maxBots: plan.limits.bots,
      canUseAdvancedStrategies: plan.limits.strategies.includes("advanced") || plan.limits.strategies.includes("all"),
      canAccessAPI: subscriptionStatus.plan !== "free",
      canUseWhaleAlerts: ["pro", "enterprise", "trial"].includes(subscriptionStatus.plan),
      canUseAISignals: ["pro", "enterprise", "trial"].includes(subscriptionStatus.plan),
      canUsePrioritySupport: ["starter", "pro", "enterprise", "trial"].includes(subscriptionStatus.plan),
      canUseCustomStrategies: ["pro", "enterprise", "trial"].includes(subscriptionStatus.plan),
      canUseBacktesting: ["enterprise", "trial"].includes(subscriptionStatus.plan),
      maxAPICallsPerDay: plan.limits.apiCalls,
      maxPortfolios: 10, // Default portfolio limit
      maxAlerts: 50, // Default alert limit
    }
  }

  private getFreeAccessLevel(): AccessLevel {
    return {
      canCreateBots: true,
      maxBots: 1,
      canUseAdvancedStrategies: false,
      canAccessAPI: false,
      canUseWhaleAlerts: false,
      canUseAISignals: false,
      canUsePrioritySupport: false,
      canUseCustomStrategies: false,
      canUseBacktesting: false,
      maxAPICallsPerDay: 100,
      maxPortfolios: 1,
      maxAlerts: 5,
    }
  }

  async checkFeatureAccess(userId: string, feature: string): Promise<FeatureAccess> {
    const accessLevel = await this.getUserAccessLevel(userId)
    const subscriptionStatus = await subscriptionManager.getSubscriptionStatus(userId)

    switch (feature) {
      case "create_bot":
        const userBots = await database.getUserBots(userId)
        const canCreate = accessLevel.maxBots === -1 || userBots.length < accessLevel.maxBots
        return {
          feature,
          hasAccess: canCreate,
          reason: canCreate ? undefined : `Bot limit reached (${accessLevel.maxBots})`,
          upgradeRequired: canCreate ? undefined : "starter",
        }

      case "advanced_strategies":
        return {
          feature,
          hasAccess: accessLevel.canUseAdvancedStrategies,
          reason: accessLevel.canUseAdvancedStrategies ? undefined : "Advanced strategies require a paid plan",
          upgradeRequired: accessLevel.canUseAdvancedStrategies ? undefined : "starter",
        }

      case "api_access":
        return {
          feature,
          hasAccess: accessLevel.canAccessAPI,
          reason: accessLevel.canAccessAPI ? undefined : "API access requires a paid plan",
          upgradeRequired: accessLevel.canAccessAPI ? undefined : "starter",
        }

      case "whale_alerts":
        return {
          feature,
          hasAccess: accessLevel.canUseWhaleAlerts,
          reason: accessLevel.canUseWhaleAlerts ? undefined : "Whale alerts require Pro plan or higher",
          upgradeRequired: accessLevel.canUseWhaleAlerts ? undefined : "pro",
        }

      case "ai_signals":
        return {
          feature,
          hasAccess: accessLevel.canUseAISignals,
          reason: accessLevel.canUseAISignals ? undefined : "AI signals require Pro plan or higher",
          upgradeRequired: accessLevel.canUseAISignals ? undefined : "pro",
        }

      case "priority_support":
        return {
          feature,
          hasAccess: accessLevel.canUsePrioritySupport,
          reason: accessLevel.canUsePrioritySupport ? undefined : "Priority support requires a paid plan",
          upgradeRequired: accessLevel.canUsePrioritySupport ? undefined : "starter",
        }

      case "custom_strategies":
        return {
          feature,
          hasAccess: accessLevel.canUseCustomStrategies,
          reason: accessLevel.canUseCustomStrategies ? undefined : "Custom strategies require Pro plan or higher",
          upgradeRequired: accessLevel.canUseCustomStrategies ? undefined : "pro",
        }

      case "backtesting":
        return {
          feature,
          hasAccess: accessLevel.canUseBacktesting,
          reason: accessLevel.canUseBacktesting ? undefined : "Backtesting requires Enterprise plan",
          upgradeRequired: accessLevel.canUseBacktesting ? undefined : "enterprise",
        }

      default:
        return {
          feature,
          hasAccess: false,
          reason: "Unknown feature",
        }
    }
  }

  async checkResourceAccess(userId: string, resourceType: string, resourceId?: string): Promise<FeatureAccess> {
    const subscriptionStatus = await subscriptionManager.getSubscriptionStatus(userId)

    switch (resourceType) {
      case "bot":
        if (resourceId) {
          const bot = await database.getBotById(resourceId)
          if (!bot) {
            return { feature: resourceType, hasAccess: false, reason: "Bot not found" }
          }
          if (bot.userId !== userId) {
            return { feature: resourceType, hasAccess: false, reason: "Access denied" }
          }
        }
        return { feature: resourceType, hasAccess: true }

      case "api_key":
        return this.checkFeatureAccess(userId, "api_access")

      case "portfolio":
        return { feature: resourceType, hasAccess: true }

      case "alerts":
        return { feature: resourceType, hasAccess: true }

      default:
        return { feature: resourceType, hasAccess: false, reason: "Unknown resource type" }
    }
  }

  async getUsageSummary(userId: string): Promise<{
    bots: { used: number; limit: number; percentage: number }
    apiCalls: { used: number; limit: number; percentage: number }
    portfolios: { used: number; limit: number; percentage: number }
    alerts: { used: number; limit: number; percentage: number }
  }> {
    const [accessLevel, userBots, userSettings] = await Promise.all([
      this.getUserAccessLevel(userId),
      database.getUserBots(userId),
      database.getUserSettings(userId),
    ])

    const calculatePercentage = (used: number, limit: number) => {
      if (limit === -1) return 0 // Unlimited
      return limit > 0 ? Math.round((used / limit) * 100) : 0
    }

    const botsUsed = userBots.length
    const apiCallsUsed = 0 // Would track from API usage logs
    const portfoliosUsed = 1 // Would track from user portfolios
    const alertsUsed = 0 // Would track from user alerts

    return {
      bots: {
        used: botsUsed,
        limit: accessLevel.maxBots,
        percentage: calculatePercentage(botsUsed, accessLevel.maxBots),
      },
      apiCalls: {
        used: apiCallsUsed,
        limit: accessLevel.maxAPICallsPerDay,
        percentage: calculatePercentage(apiCallsUsed, accessLevel.maxAPICallsPerDay),
      },
      portfolios: {
        used: portfoliosUsed,
        limit: accessLevel.maxPortfolios,
        percentage: calculatePercentage(portfoliosUsed, accessLevel.maxPortfolios),
      },
      alerts: {
        used: alertsUsed,
        limit: accessLevel.maxAlerts,
        percentage: calculatePercentage(alertsUsed, accessLevel.maxAlerts),
      },
    }
  }

  async canPerformAction(
    userId: string,
    action: string,
    context?: any,
  ): Promise<{
    allowed: boolean
    reason?: string
    upgradeRequired?: string
  }> {
    const accessLevel = await this.getUserAccessLevel(userId)

    switch (action) {
      case "create_bot":
        const userBots = await database.getUserBots(userId)
        if (accessLevel.maxBots !== -1 && userBots.length >= accessLevel.maxBots) {
          return {
            allowed: false,
            reason: `Bot limit reached (${accessLevel.maxBots})`,
            upgradeRequired: "starter",
          }
        }
        return { allowed: true }

      case "use_advanced_strategy":
        if (!accessLevel.canUseAdvancedStrategies) {
          return {
            allowed: false,
            reason: "Advanced strategies require a paid plan",
            upgradeRequired: "starter",
          }
        }
        return { allowed: true }

      case "make_api_call":
        if (!accessLevel.canAccessAPI) {
          return {
            allowed: false,
            reason: "API access requires a paid plan",
            upgradeRequired: "starter",
          }
        }
        // Additional API rate limiting would be checked here
        return { allowed: true }

      case "access_whale_alerts":
        if (!accessLevel.canUseWhaleAlerts) {
          return {
            allowed: false,
            reason: "Whale alerts require Pro plan or higher",
            upgradeRequired: "pro",
          }
        }
        return { allowed: true }

      case "access_ai_signals":
        if (!accessLevel.canUseAISignals) {
          return {
            allowed: false,
            reason: "AI signals require Pro plan or higher",
            upgradeRequired: "pro",
          }
        }
        return { allowed: true }

      case "use_custom_strategy":
        if (!accessLevel.canUseCustomStrategies) {
          return {
            allowed: false,
            reason: "Custom strategies require Pro plan or higher",
            upgradeRequired: "pro",
          }
        }
        return { allowed: true }

      case "access_backtesting":
        if (!accessLevel.canUseBacktesting) {
          return {
            allowed: false,
            reason: "Backtesting requires Enterprise plan",
            upgradeRequired: "enterprise",
          }
        }
        return { allowed: true }

      default:
        return { allowed: false, reason: "Unknown action" }
    }
  }

  async getUpgradeRecommendation(userId: string): Promise<{
    currentPlan: string
    recommendedPlan: string
    benefits: string[]
    blockedFeatures: string[]
  }> {
    const subscriptionStatus = await subscriptionManager.getSubscriptionStatus(userId)
    const accessLevel = await this.getUserAccessLevel(userId)

    const blockedFeatures: string[] = []
    const benefits: string[] = []

    if (!accessLevel.canUseAdvancedStrategies) {
      blockedFeatures.push("Advanced Trading Strategies")
    }
    if (!accessLevel.canAccessAPI) {
      blockedFeatures.push("API Access")
    }
    if (!accessLevel.canUseWhaleAlerts) {
      blockedFeatures.push("Whale Alerts")
    }
    if (!accessLevel.canUseAISignals) {
      blockedFeatures.push("AI Signals")
    }
    if (!accessLevel.canUseCustomStrategies) {
      blockedFeatures.push("Custom Strategies")
    }
    if (!accessLevel.canUseBacktesting) {
      blockedFeatures.push("Backtesting")
    }

    let recommendedPlan = "starter"
    if (subscriptionStatus.plan === "free") {
      recommendedPlan = "starter"
      benefits.push("5 Trading Bots", "Advanced Strategies", "Priority Support", "Unlimited API Calls")
    } else if (subscriptionStatus.plan === "starter") {
      recommendedPlan = "pro"
      benefits.push("Unlimited Bots", "AI Signals", "Whale Alerts", "Custom Strategies", "Advanced Analytics")
    } else if (subscriptionStatus.plan === "pro") {
      recommendedPlan = "enterprise"
      benefits.push("Dedicated Support", "Custom Integrations", "White-label Options", "Advanced Risk Management")
    }

    return {
      currentPlan: subscriptionStatus.plan,
      recommendedPlan,
      benefits,
      blockedFeatures,
    }
  }
}

export const accessControl = new AccessControl()
