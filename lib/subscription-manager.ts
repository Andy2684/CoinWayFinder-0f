import { database } from "./database"
import { generateRandomString } from "./security"

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  currency: string
  interval: "month" | "year"
  features: string[]
  limits: {
    maxBots: number
    maxTrades: number
    apiCalls: number
    dataRetention: number // days
  }
}

export interface UserSubscription {
  id: string
  userId: string
  planId: string
  status: "active" | "cancelled" | "expired" | "trial"
  currentPeriodStart: Date
  currentPeriodEnd: Date
  trialEndsAt?: Date
  cancelAtPeriodEnd: boolean
  createdAt: Date
  updatedAt: Date
}

export interface UsageStats {
  userId: string
  period: string // YYYY-MM format
  botsCreated: number
  tradesExecuted: number
  apiCallsMade: number
  lastUpdated: Date
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    currency: "USD",
    interval: "month",
    features: ["1 Trading Bot", "Basic Strategies", "Email Support", "7-day Data Retention"],
    limits: {
      maxBots: 1,
      maxTrades: 100,
      apiCalls: 1000,
      dataRetention: 7,
    },
  },
  {
    id: "starter",
    name: "Starter",
    price: 29,
    currency: "USD",
    interval: "month",
    features: [
      "5 Trading Bots",
      "Advanced Strategies",
      "Priority Support",
      "30-day Data Retention",
      "Real-time Alerts",
    ],
    limits: {
      maxBots: 5,
      maxTrades: 1000,
      apiCalls: 10000,
      dataRetention: 30,
    },
  },
  {
    id: "pro",
    name: "Pro",
    price: 99,
    currency: "USD",
    interval: "month",
    features: [
      "Unlimited Trading Bots",
      "All Strategies",
      "24/7 Support",
      "90-day Data Retention",
      "Advanced Analytics",
      "Custom Indicators",
      "API Access",
    ],
    limits: {
      maxBots: -1, // unlimited
      maxTrades: -1, // unlimited
      apiCalls: 100000,
      dataRetention: 90,
    },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 299,
    currency: "USD",
    interval: "month",
    features: [
      "Everything in Pro",
      "White-label Solution",
      "Dedicated Support",
      "1-year Data Retention",
      "Custom Integrations",
      "SLA Guarantee",
    ],
    limits: {
      maxBots: -1, // unlimited
      maxTrades: -1, // unlimited
      apiCalls: -1, // unlimited
      dataRetention: 365,
    },
  },
]

class SubscriptionManager {
  private subscriptions: UserSubscription[] = []
  private usageStats: UsageStats[] = []

  constructor() {
    this.initializeDefaultSubscriptions()
  }

  private initializeDefaultSubscriptions() {
    // Create default subscription for demo user
    const defaultSubscription: UserSubscription = {
      id: generateRandomString(16),
      userId: "user_1",
      planId: "pro",
      status: "trial",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days trial
      cancelAtPeriodEnd: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.subscriptions.push(defaultSubscription)
  }

  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    return this.subscriptions.find((sub) => sub.userId === userId) || null
  }

  async createSubscription(userId: string, planId: string, trialDays?: number): Promise<UserSubscription> {
    const plan = this.getPlanById(planId)
    if (!plan) {
      throw new Error("Invalid plan ID")
    }

    const now = new Date()
    const subscription: UserSubscription = {
      id: generateRandomString(16),
      userId,
      planId,
      status: trialDays ? "trial" : "active",
      currentPeriodStart: now,
      currentPeriodEnd: new Date(now.getTime() + (plan.interval === "year" ? 365 : 30) * 24 * 60 * 60 * 1000),
      trialEndsAt: trialDays ? new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000) : undefined,
      cancelAtPeriodEnd: false,
      createdAt: now,
      updatedAt: now,
    }

    this.subscriptions.push(subscription)
    return subscription
  }

  async updateSubscription(
    subscriptionId: string,
    updates: Partial<UserSubscription>,
  ): Promise<UserSubscription | null> {
    const index = this.subscriptions.findIndex((sub) => sub.id === subscriptionId)
    if (index === -1) return null

    this.subscriptions[index] = {
      ...this.subscriptions[index],
      ...updates,
      updatedAt: new Date(),
    }

    return this.subscriptions[index]
  }

  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd = true): Promise<boolean> {
    const subscription = this.subscriptions.find((sub) => sub.id === subscriptionId)
    if (!subscription) return false

    subscription.cancelAtPeriodEnd = cancelAtPeriodEnd
    subscription.status = cancelAtPeriodEnd ? "active" : "cancelled"
    subscription.updatedAt = new Date()

    return true
  }

  async upgradeSubscription(userId: string, newPlanId: string): Promise<UserSubscription | null> {
    const subscription = await this.getUserSubscription(userId)
    if (!subscription) return null

    const newPlan = this.getPlanById(newPlanId)
    if (!newPlan) return null

    subscription.planId = newPlanId
    subscription.updatedAt = new Date()

    return subscription
  }

  getPlanById(planId: string): SubscriptionPlan | null {
    return SUBSCRIPTION_PLANS.find((plan) => plan.id === planId) || null
  }

  getAllPlans(): SubscriptionPlan[] {
    return SUBSCRIPTION_PLANS
  }

  async checkAccess(userId: string, resource: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId)
    if (!subscription) return false

    const plan = this.getPlanById(subscription.planId)
    if (!plan) return false

    // Check if subscription is active
    if (subscription.status === "expired" || subscription.status === "cancelled") {
      return false
    }

    // Check trial expiration
    if (subscription.status === "trial" && subscription.trialEndsAt) {
      if (new Date() > subscription.trialEndsAt) {
        subscription.status = "expired"
        return false
      }
    }

    // Check period expiration
    if (new Date() > subscription.currentPeriodEnd) {
      subscription.status = "expired"
      return false
    }

    return true
  }

  async checkLimits(
    userId: string,
    resource: "bots" | "trades" | "apiCalls",
  ): Promise<{
    allowed: boolean
    current: number
    limit: number
  }> {
    const subscription = await this.getUserSubscription(userId)
    if (!subscription) {
      return { allowed: false, current: 0, limit: 0 }
    }

    const plan = this.getPlanById(subscription.planId)
    if (!plan) {
      return { allowed: false, current: 0, limit: 0 }
    }

    let current = 0
    let limit = 0

    switch (resource) {
      case "bots":
        const userBots = await database.getBotsByUserId(userId)
        current = userBots.length
        limit = plan.limits.maxBots
        break

      case "trades":
        const userTrades = await database.getTradesByUserId(userId)
        current = userTrades.length
        limit = plan.limits.maxTrades
        break

      case "apiCalls":
        const usage = await this.getUsageStats(userId)
        current = usage.apiCallsMade
        limit = plan.limits.apiCalls
        break
    }

    const allowed = limit === -1 || current < limit

    return { allowed, current, limit }
  }

  async recordUsage(userId: string, type: "bot" | "trade" | "apiCall", count = 1): Promise<void> {
    const period = new Date().toISOString().slice(0, 7) // YYYY-MM format

    let usage = this.usageStats.find((u) => u.userId === userId && u.period === period)

    if (!usage) {
      usage = {
        userId,
        period,
        botsCreated: 0,
        tradesExecuted: 0,
        apiCallsMade: 0,
        lastUpdated: new Date(),
      }
      this.usageStats.push(usage)
    }

    switch (type) {
      case "bot":
        usage.botsCreated += count
        break
      case "trade":
        usage.tradesExecuted += count
        break
      case "apiCall":
        usage.apiCallsMade += count
        break
    }

    usage.lastUpdated = new Date()
  }

  async getUsageStats(userId: string, period?: string): Promise<UsageStats> {
    const targetPeriod = period || new Date().toISOString().slice(0, 7)

    const usage = this.usageStats.find((u) => u.userId === userId && u.period === targetPeriod)

    return (
      usage || {
        userId,
        period: targetPeriod,
        botsCreated: 0,
        tradesExecuted: 0,
        apiCallsMade: 0,
        lastUpdated: new Date(),
      }
    )
  }

  async startTrial(userId: string, planId: string, trialDays = 7): Promise<UserSubscription> {
    // Check if user already has a subscription
    const existingSubscription = await this.getUserSubscription(userId)
    if (existingSubscription) {
      throw new Error("User already has a subscription")
    }

    return this.createSubscription(userId, planId, trialDays)
  }

  async getSubscriptionStatus(userId: string): Promise<{
    hasActiveSubscription: boolean
    plan: SubscriptionPlan | null
    subscription: UserSubscription | null
    trialDaysLeft?: number
    daysUntilExpiry?: number
  }> {
    const subscription = await this.getUserSubscription(userId)
    if (!subscription) {
      return {
        hasActiveSubscription: false,
        plan: null,
        subscription: null,
      }
    }

    const plan = this.getPlanById(subscription.planId)
    const now = new Date()

    let trialDaysLeft: number | undefined
    let daysUntilExpiry: number | undefined

    if (subscription.status === "trial" && subscription.trialEndsAt) {
      const trialTimeLeft = subscription.trialEndsAt.getTime() - now.getTime()
      trialDaysLeft = Math.max(0, Math.ceil(trialTimeLeft / (24 * 60 * 60 * 1000)))
    }

    const expiryTimeLeft = subscription.currentPeriodEnd.getTime() - now.getTime()
    daysUntilExpiry = Math.max(0, Math.ceil(expiryTimeLeft / (24 * 60 * 60 * 1000)))

    const hasActiveSubscription =
      subscription.status === "active" || (subscription.status === "trial" && (trialDaysLeft || 0) > 0)

    return {
      hasActiveSubscription,
      plan,
      subscription,
      trialDaysLeft,
      daysUntilExpiry,
    }
  }
}

// Create and export subscription manager instance
export const subscriptionManager = new SubscriptionManager()
