import { database } from "./database"

export const SUBSCRIPTION_PLANS = {
  free: {
    name: "Free",
    price: 0,
    features: {
      maxBots: 1,
      maxTrades: 10,
      exchanges: ["demo"],
      strategies: ["basic"],
      support: "community",
      analytics: false,
      webhooks: false,
      api: false,
    },
  },
  basic: {
    name: "Basic",
    price: 29,
    features: {
      maxBots: 3,
      maxTrades: 100,
      exchanges: ["binance", "coinbase"],
      strategies: ["basic", "dca"],
      support: "email",
      analytics: true,
      webhooks: false,
      api: false,
    },
  },
  premium: {
    name: "Premium",
    price: 79,
    features: {
      maxBots: 10,
      maxTrades: 1000,
      exchanges: ["binance", "coinbase", "kraken", "bybit"],
      strategies: ["basic", "dca", "grid", "scalping"],
      support: "priority",
      analytics: true,
      webhooks: true,
      api: true,
    },
  },
  enterprise: {
    name: "Enterprise",
    price: 199,
    features: {
      maxBots: -1, // unlimited
      maxTrades: -1, // unlimited
      exchanges: ["all"],
      strategies: ["all"],
      support: "dedicated",
      analytics: true,
      webhooks: true,
      api: true,
    },
  },
}

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS
export type SubscriptionStatus = "active" | "expired" | "cancelled" | "trialing"

interface SubscriptionInfo {
  plan: SubscriptionPlan
  status: SubscriptionStatus
  startDate?: Date
  endDate?: Date
  stripeCustomerId?: string
  stripeSubscriptionId?: string
}

class SubscriptionManager {
  async getUserSubscription(userId: string): Promise<SubscriptionInfo> {
    const settings = await database.getUserSettings(userId)

    if (!settings?.subscription) {
      return {
        plan: "free",
        status: "active",
      }
    }

    return settings.subscription
  }

  async checkAccess(userId: string, feature: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId)
    const plan = SUBSCRIPTION_PLANS[subscription.plan]

    // Check if subscription is active
    if (subscription.status !== "active" && subscription.status !== "trialing") {
      return subscription.plan === "free" // Free plan is always "active"
    }

    // Check trial status
    if (subscription.status === "trialing") {
      const trialStatus = await database.getTrialStatus(userId)
      if (!trialStatus.isActive) {
        // Trial expired, downgrade to free
        await this.updateSubscription(userId, {
          plan: "free",
          status: "active",
        })
        return this.checkFeatureAccess("free", feature)
      }
    }

    return this.checkFeatureAccess(subscription.plan, feature)
  }

  private checkFeatureAccess(plan: SubscriptionPlan, feature: string): boolean {
    const planFeatures = SUBSCRIPTION_PLANS[plan].features

    switch (feature) {
      case "create_bot":
        return true // All plans can create bots (limited by maxBots)
      case "advanced_strategies":
        return planFeatures.strategies.includes("grid") || planFeatures.strategies.includes("all")
      case "multiple_exchanges":
        return planFeatures.exchanges.length > 1 || planFeatures.exchanges.includes("all")
      case "analytics":
        return planFeatures.analytics
      case "webhooks":
        return planFeatures.webhooks
      case "api_access":
        return planFeatures.api
      case "priority_support":
        return planFeatures.support === "priority" || planFeatures.support === "dedicated"
      default:
        return true
    }
  }

  async canCreateBot(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const subscription = await this.getUserSubscription(userId)
    const plan = SUBSCRIPTION_PLANS[subscription.plan]

    if (plan.features.maxBots === -1) {
      return { allowed: true }
    }

    const userBots = await database.getUserBots(userId)
    const activeBots = userBots.filter((bot) => bot.status === "active")

    if (activeBots.length >= plan.features.maxBots) {
      return {
        allowed: false,
        reason: `You have reached the maximum number of bots (${plan.features.maxBots}) for your ${plan.name} plan.`,
      }
    }

    return { allowed: true }
  }

  async canUseExchange(userId: string, exchange: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId)
    const plan = SUBSCRIPTION_PLANS[subscription.plan]

    return plan.features.exchanges.includes(exchange) || plan.features.exchanges.includes("all")
  }

  async canUseStrategy(userId: string, strategy: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId)
    const plan = SUBSCRIPTION_PLANS[subscription.plan]

    return plan.features.strategies.includes(strategy) || plan.features.strategies.includes("all")
  }

  async updateSubscription(userId: string, subscription: Partial<SubscriptionInfo>): Promise<boolean> {
    const currentSettings = await database.getUserSettings(userId)
    const updatedSubscription = {
      ...currentSettings?.subscription,
      ...subscription,
    }

    return await database.updateSubscription(userId, updatedSubscription)
  }

  async cancelSubscription(userId: string): Promise<boolean> {
    return await this.updateSubscription(userId, {
      status: "cancelled",
    })
  }

  async reactivateSubscription(userId: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId)

    if (subscription.endDate && subscription.endDate > new Date()) {
      return await this.updateSubscription(userId, {
        status: "active",
      })
    }

    return false
  }

  async getUsageStats(userId: string): Promise<{
    bots: { current: number; limit: number }
    trades: { current: number; limit: number }
    features: string[]
  }> {
    const subscription = await this.getUserSubscription(userId)
    const plan = SUBSCRIPTION_PLANS[subscription.plan]

    const userBots = await database.getUserBots(userId)
    const userTrades = await database.getUserTrades(userId, 1000)

    return {
      bots: {
        current: userBots.filter((bot) => bot.status === "active").length,
        limit: plan.features.maxBots,
      },
      trades: {
        current: userTrades.length,
        limit: plan.features.maxTrades,
      },
      features: Object.keys(plan.features).filter((feature) => this.checkFeatureAccess(subscription.plan, feature)),
    }
  }

  async startTrial(userId: string): Promise<{ success: boolean; message: string }> {
    const trialStatus = await database.getTrialStatus(userId)

    if (trialStatus.hasUsed) {
      return {
        success: false,
        message: "You have already used your free trial.",
      }
    }

    const success = await database.startTrial(userId)

    if (success) {
      return {
        success: true,
        message: "Your 3-day premium trial has started!",
      }
    }

    return {
      success: false,
      message: "Failed to start trial. Please try again.",
    }
  }

  async getTrialStatus(userId: string): Promise<{
    available: boolean
    active: boolean
    daysRemaining: number
    endDate?: Date
  }> {
    const trialStatus = await database.getTrialStatus(userId)

    return {
      available: !trialStatus.hasUsed,
      active: trialStatus.isActive,
      daysRemaining: trialStatus.daysRemaining,
      endDate: trialStatus.endDate,
    }
  }
}

export const subscriptionManager = new SubscriptionManager()
