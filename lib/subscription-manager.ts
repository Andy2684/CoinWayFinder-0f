import { database } from "./database"

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  interval: "month" | "year"
  features: string[]
  limits: {
    bots: number
    apiCalls: number
    portfolios: number
    alerts: number
  }
  stripeProductId?: string
  stripePriceId?: string
}

export interface SubscriptionStatus {
  plan: string
  status: "active" | "inactive" | "trial" | "cancelled" | "expired"
  startDate: Date
  endDate: Date
  trialUsed: boolean
  canUpgrade: boolean
}

export interface UsageLimits {
  bots: { used: number; limit: number; remaining: number }
  apiCalls: { used: number; limit: number; remaining: number }
  portfolios: { used: number; limit: number; remaining: number }
  alerts: { used: number; limit: number; remaining: number }
}

class SubscriptionManager {
  private plans: Record<string, SubscriptionPlan> = {
    free: {
      id: "free",
      name: "Free",
      price: 0,
      interval: "month",
      features: ["basic_dashboard", "market_data", "news"],
      limits: {
        bots: 1,
        apiCalls: 100,
        portfolios: 1,
        alerts: 5,
      },
    },
    starter: {
      id: "starter",
      name: "Starter",
      price: 29,
      interval: "month",
      features: ["basic_dashboard", "market_data", "news", "basic_bots", "portfolio_tracking"],
      limits: {
        bots: 3,
        apiCalls: 1000,
        portfolios: 3,
        alerts: 20,
      },
      stripePriceId: process.env.STRIPE_STARTER_PRICE_ID,
    },
    pro: {
      id: "pro",
      name: "Pro",
      price: 99,
      interval: "month",
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
      stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
    },
    enterprise: {
      id: "enterprise",
      name: "Enterprise",
      price: 299,
      interval: "month",
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
      stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    },
  }

  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
    const userSettings = await database.getUserSettings(userId)

    if (!userSettings) {
      return {
        plan: "free",
        status: "inactive",
        startDate: new Date(),
        endDate: new Date(),
        trialUsed: false,
        canUpgrade: true,
      }
    }

    const subscription = userSettings.subscription
    const now = new Date()
    const isExpired = subscription.endDate < now

    return {
      plan: subscription.plan,
      status: isExpired ? "expired" : (subscription.status as any),
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      trialUsed: subscription.trialUsed,
      canUpgrade: subscription.plan !== "enterprise",
    }
  }

  async checkAccess(userId: string, feature: string): Promise<boolean> {
    const status = await this.getSubscriptionStatus(userId)
    const plan = this.plans[status.plan]

    if (!plan) {
      return false
    }

    // Check if subscription is active
    if (status.status === "expired" || status.status === "cancelled") {
      return false
    }

    return plan.features.includes(feature)
  }

  async getRemainingLimits(userId: string): Promise<UsageLimits> {
    const [status, userSettings] = await Promise.all([
      this.getSubscriptionStatus(userId),
      database.getUserSettings(userId),
    ])

    const plan = this.plans[status.plan]
    const usage = userSettings?.usage || { bots: 0, apiCalls: 0, portfolios: 0, alerts: 0 }

    if (!plan) {
      return {
        bots: { used: 0, limit: 1, remaining: 1 },
        apiCalls: { used: 0, limit: 100, remaining: 100 },
        portfolios: { used: 0, limit: 1, remaining: 1 },
        alerts: { used: 0, limit: 5, remaining: 5 },
      }
    }

    return {
      bots: {
        used: usage.bots,
        limit: plan.limits.bots,
        remaining: plan.limits.bots === -1 ? -1 : Math.max(0, plan.limits.bots - usage.bots),
      },
      apiCalls: {
        used: usage.apiCalls,
        limit: plan.limits.apiCalls,
        remaining: plan.limits.apiCalls === -1 ? -1 : Math.max(0, plan.limits.apiCalls - usage.apiCalls),
      },
      portfolios: {
        used: usage.portfolios,
        limit: plan.limits.portfolios,
        remaining: plan.limits.portfolios === -1 ? -1 : Math.max(0, plan.limits.portfolios - usage.portfolios),
      },
      alerts: {
        used: usage.alerts,
        limit: plan.limits.alerts,
        remaining: plan.limits.alerts === -1 ? -1 : Math.max(0, plan.limits.alerts - usage.alerts),
      },
    }
  }

  async canCreateBot(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const limits = await this.getRemainingLimits(userId)

    if (limits.bots.remaining === 0) {
      return {
        allowed: false,
        reason: "Bot limit reached. Upgrade your plan to create more bots.",
      }
    }

    return { allowed: true }
  }

  async incrementUsage(userId: string, type: keyof UsageLimits): Promise<void> {
    const userSettings = await database.getUserSettings(userId)
    if (!userSettings) return

    const currentUsage = userSettings.usage || { bots: 0, apiCalls: 0, portfolios: 0, alerts: 0 }
    currentUsage[type] = (currentUsage[type] || 0) + 1

    await database.updateUserSettings(userId, { usage: currentUsage })
  }

  async decrementUsage(userId: string, type: keyof UsageLimits): Promise<void> {
    const userSettings = await database.getUserSettings(userId)
    if (!userSettings) return

    const currentUsage = userSettings.usage || { bots: 0, apiCalls: 0, portfolios: 0, alerts: 0 }
    currentUsage[type] = Math.max(0, (currentUsage[type] || 0) - 1)

    await database.updateUserSettings(userId, { usage: currentUsage })
  }

  async upgradePlan(userId: string, newPlan: string): Promise<{ success: boolean; message: string }> {
    const plan = this.plans[newPlan]
    if (!plan) {
      return { success: false, message: "Invalid plan" }
    }

    const userSettings = await database.getUserSettings(userId)
    if (!userSettings) {
      return { success: false, message: "User settings not found" }
    }

    const updatedSubscription = {
      ...userSettings.subscription,
      plan: newPlan,
      status: "active",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    }

    await database.updateUserSettings(userId, { subscription: updatedSubscription })

    return { success: true, message: `Successfully upgraded to ${plan.name} plan` }
  }

  async startTrial(userId: string): Promise<{ success: boolean; message: string }> {
    const userSettings = await database.getUserSettings(userId)
    if (!userSettings) {
      return { success: false, message: "User settings not found" }
    }

    if (userSettings.subscription.trialUsed) {
      return { success: false, message: "Trial already used" }
    }

    const updatedSubscription = {
      ...userSettings.subscription,
      status: "trial",
      startDate: new Date(),
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      trialUsed: true,
    }

    await database.updateUserSettings(userId, { subscription: updatedSubscription })

    return { success: true, message: "Trial started successfully" }
  }

  async cancelSubscription(userId: string): Promise<{ success: boolean; message: string }> {
    const userSettings = await database.getUserSettings(userId)
    if (!userSettings) {
      return { success: false, message: "User settings not found" }
    }

    const updatedSubscription = {
      ...userSettings.subscription,
      status: "cancelled",
    }

    await database.updateUserSettings(userId, { subscription: updatedSubscription })

    return { success: true, message: "Subscription cancelled successfully" }
  }

  getPlans(): Record<string, SubscriptionPlan> {
    return this.plans
  }

  getPlan(planId: string): SubscriptionPlan | null {
    return this.plans[planId] || null
  }

  async getTrialStatus(userId: string): Promise<{
    hasTrialAccess: boolean
    trialUsed: boolean
    trialEndsAt?: Date
    daysRemaining?: number
  }> {
    const status = await this.getSubscriptionStatus(userId)

    if (status.status === "trial") {
      const daysRemaining = Math.ceil((status.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      return {
        hasTrialAccess: true,
        trialUsed: status.trialUsed,
        trialEndsAt: status.endDate,
        daysRemaining: Math.max(0, daysRemaining),
      }
    }

    return {
      hasTrialAccess: false,
      trialUsed: status.trialUsed,
    }
  }
}

export const subscriptionManager = new SubscriptionManager()
