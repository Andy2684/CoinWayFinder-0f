export const SUBSCRIPTION_PLANS = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    features: {
      maxBots: 1,
      maxTrades: 10,
      apiAccess: false,
      advancedStrategies: false,
      prioritySupport: false,
      webhooks: false,
    },
  },
  starter: {
    id: "starter",
    name: "Starter",
    price: 29,
    stripeId: process.env.STRIPE_STARTER_PRICE_ID,
    features: {
      maxBots: 3,
      maxTrades: 100,
      apiAccess: true,
      advancedStrategies: false,
      prioritySupport: false,
      webhooks: true,
    },
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 99,
    stripeId: process.env.STRIPE_PRO_PRICE_ID,
    features: {
      maxBots: 10,
      maxTrades: 1000,
      apiAccess: true,
      advancedStrategies: true,
      prioritySupport: true,
      webhooks: true,
    },
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    price: 299,
    stripeId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    features: {
      maxBots: -1, // unlimited
      maxTrades: -1, // unlimited
      apiAccess: true,
      advancedStrategies: true,
      prioritySupport: true,
      webhooks: true,
    },
  },
} as const

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS
export type PlanFeatures = (typeof SUBSCRIPTION_PLANS)[SubscriptionPlan]["features"]

import { database } from "./database"

export class SubscriptionManager {
  async getUserSubscription(userId: string) {
    const settings = await database.getUserSettings(userId)
    if (!settings) {
      return null
    }
    return settings.subscription
  }

  async hasAccess(userId: string, feature: keyof PlanFeatures): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId)
    if (!subscription) {
      return false
    }

    const plan = SUBSCRIPTION_PLANS[subscription.plan]
    if (!plan) {
      return false
    }

    // Check if subscription is active
    if (subscription.status !== "active") {
      return false
    }

    // Check trial period
    if (subscription.trialEndsAt && new Date() > subscription.trialEndsAt) {
      if (!subscription.currentPeriodEnd || new Date() > subscription.currentPeriodEnd) {
        return false
      }
    }

    return plan.features[feature] === true
  }

  async canCreateBot(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const subscription = await this.getUserSubscription(userId)
    if (!subscription) {
      return { allowed: false, reason: "No subscription found" }
    }

    const plan = SUBSCRIPTION_PLANS[subscription.plan]
    const currentBots = await database.getBotsByUserId(userId)

    if (plan.features.maxBots === -1) {
      return { allowed: true }
    }

    if (currentBots.length >= plan.features.maxBots) {
      return {
        allowed: false,
        reason: `You've reached the maximum number of bots (${plan.features.maxBots}) for your ${plan.name} plan`,
      }
    }

    return { allowed: true }
  }

  async canExecuteTrade(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const subscription = await this.getUserSubscription(userId)
    if (!subscription) {
      return { allowed: false, reason: "No subscription found" }
    }

    const plan = SUBSCRIPTION_PLANS[subscription.plan]
    const currentTrades = await database.getTradesByUserId(userId)

    if (plan.features.maxTrades === -1) {
      return { allowed: true }
    }

    // Count trades in current month
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthlyTrades = currentTrades.filter((trade) => trade.timestamp >= startOfMonth)

    if (monthlyTrades.length >= plan.features.maxTrades) {
      return {
        allowed: false,
        reason: `You've reached the monthly trade limit (${plan.features.maxTrades}) for your ${plan.name} plan`,
      }
    }

    return { allowed: true }
  }

  async upgradePlan(userId: string, newPlan: SubscriptionPlan): Promise<boolean> {
    try {
      await database.updateUserSettings(userId, {
        subscription: {
          plan: newPlan,
          status: "active",
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      })
      return true
    } catch (error) {
      console.error("Failed to upgrade plan:", error)
      return false
    }
  }

  async cancelSubscription(userId: string): Promise<boolean> {
    try {
      await database.updateUserSettings(userId, {
        subscription: {
          plan: "free",
          status: "cancelled",
        },
      })
      return true
    } catch (error) {
      console.error("Failed to cancel subscription:", error)
      return false
    }
  }

  async startTrial(userId: string): Promise<boolean> {
    try {
      const trialEndsAt = new Date()
      trialEndsAt.setDate(trialEndsAt.getDate() + 7) // 7-day trial

      await database.updateUserSettings(userId, {
        subscription: {
          plan: "starter",
          status: "active",
          trialEndsAt,
        },
      })
      return true
    } catch (error) {
      console.error("Failed to start trial:", error)
      return false
    }
  }

  async getUsageStats(userId: string) {
    const subscription = await this.getUserSubscription(userId)
    if (!subscription) {
      return null
    }

    const plan = SUBSCRIPTION_PLANS[subscription.plan]
    const bots = await database.getBotsByUserId(userId)
    const trades = await database.getTradesByUserId(userId)

    // Count trades in current month
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthlyTrades = trades.filter((trade) => trade.timestamp >= startOfMonth)

    return {
      plan: subscription.plan,
      bots: {
        current: bots.length,
        limit: plan.features.maxBots,
      },
      trades: {
        current: monthlyTrades.length,
        limit: plan.features.maxTrades,
      },
      features: plan.features,
    }
  }

  getPlanByStripeId(stripeId: string): SubscriptionPlan | null {
    for (const [key, plan] of Object.entries(SUBSCRIPTION_PLANS)) {
      if (plan.stripeId === stripeId) {
        return key as SubscriptionPlan
      }
    }
    return null
  }
}

export const subscriptionManager = new SubscriptionManager()
