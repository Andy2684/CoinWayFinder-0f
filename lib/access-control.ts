import { subscriptionManager, SUBSCRIPTION_PLANS } from "./subscription-manager"
import { adminManager } from "./admin"

export interface AccessControlResult {
  allowed: boolean
  reason?: string
  upgradeRequired?: boolean
  requiredPlan?: string
}

export class AccessControl {
  async checkFeatureAccess(userId: string, feature: string): Promise<AccessControlResult> {
    // Check if user is admin (bypass all restrictions)
    const admin = await adminManager.getCurrentAdmin()
    if (admin && admin.userId === userId) {
      return { allowed: true }
    }

    // Check subscription access
    const hasAccess = await subscriptionManager.checkAccess(userId, feature)

    if (!hasAccess) {
      const subscription = await subscriptionManager.getUserSubscription(userId)
      const requiredPlan = this.getRequiredPlanForFeature(feature)

      return {
        allowed: false,
        reason: `This feature requires a ${requiredPlan} subscription or higher`,
        upgradeRequired: true,
        requiredPlan,
      }
    }

    return { allowed: true }
  }

  async checkBotCreation(userId: string): Promise<AccessControlResult> {
    // Check if user is admin
    const admin = await adminManager.getCurrentAdmin()
    if (admin && admin.userId === userId) {
      return { allowed: true }
    }

    const result = await subscriptionManager.canCreateBot(userId)

    if (!result.allowed) {
      return {
        allowed: false,
        reason: result.reason,
        upgradeRequired: true,
        requiredPlan: "basic",
      }
    }

    return { allowed: true }
  }

  async checkExchangeAccess(userId: string, exchange: string): Promise<AccessControlResult> {
    // Check if user is admin
    const admin = await adminManager.getCurrentAdmin()
    if (admin && admin.userId === userId) {
      return { allowed: true }
    }

    const hasAccess = await subscriptionManager.canUseExchange(userId, exchange)

    if (!hasAccess) {
      const requiredPlan = this.getRequiredPlanForExchange(exchange)

      return {
        allowed: false,
        reason: `Access to ${exchange} requires a ${requiredPlan} subscription or higher`,
        upgradeRequired: true,
        requiredPlan,
      }
    }

    return { allowed: true }
  }

  async checkStrategyAccess(userId: string, strategy: string): Promise<AccessControlResult> {
    // Check if user is admin
    const admin = await adminManager.getCurrentAdmin()
    if (admin && admin.userId === userId) {
      return { allowed: true }
    }

    const hasAccess = await subscriptionManager.canUseStrategy(userId, strategy)

    if (!hasAccess) {
      const requiredPlan = this.getRequiredPlanForStrategy(strategy)

      return {
        allowed: false,
        reason: `The ${strategy} strategy requires a ${requiredPlan} subscription or higher`,
        upgradeRequired: true,
        requiredPlan,
      }
    }

    return { allowed: true }
  }

  private getRequiredPlanForFeature(feature: string): string {
    switch (feature) {
      case "analytics":
        return "basic"
      case "webhooks":
      case "api_access":
        return "premium"
      case "advanced_strategies":
        return "premium"
      case "multiple_exchanges":
        return "basic"
      case "priority_support":
        return "premium"
      default:
        return "basic"
    }
  }

  private getRequiredPlanForExchange(exchange: string): string {
    const basicExchanges = ["binance", "coinbase"]
    const premiumExchanges = ["kraken", "bybit", "okx", "kucoin"]

    if (basicExchanges.includes(exchange)) {
      return "basic"
    } else if (premiumExchanges.includes(exchange)) {
      return "premium"
    } else {
      return "enterprise"
    }
  }

  private getRequiredPlanForStrategy(strategy: string): string {
    const basicStrategies = ["basic", "dca"]
    const premiumStrategies = ["grid", "scalping", "arbitrage"]
    const enterpriseStrategies = ["ml", "ai", "custom"]

    if (basicStrategies.includes(strategy)) {
      return "basic"
    } else if (premiumStrategies.includes(strategy)) {
      return "premium"
    } else if (enterpriseStrategies.includes(strategy)) {
      return "enterprise"
    } else {
      return "basic"
    }
  }

  async getUserPermissions(userId: string): Promise<{
    plan: string
    features: string[]
    limits: {
      maxBots: number
      maxTrades: number
      exchanges: string[]
      strategies: string[]
    }
  }> {
    const subscription = await subscriptionManager.getUserSubscription(userId)
    const planFeatures = SUBSCRIPTION_PLANS[subscription.plan].features

    return {
      plan: subscription.plan,
      features: Object.keys(planFeatures).filter(
        (feature) => planFeatures[feature as keyof typeof planFeatures] === true,
      ),
      limits: {
        maxBots: planFeatures.maxBots,
        maxTrades: planFeatures.maxTrades,
        exchanges: planFeatures.exchanges,
        strategies: planFeatures.strategies,
      },
    }
  }

  async checkRateLimit(userId: string, action: string): Promise<AccessControlResult> {
    // Simple rate limiting based on subscription plan
    const subscription = await subscriptionManager.getUserSubscription(userId)
    const plan = SUBSCRIPTION_PLANS[subscription.plan]

    // For now, just return allowed - in production, implement proper rate limiting
    return { allowed: true }
  }
}

export const accessControl = new AccessControl()
