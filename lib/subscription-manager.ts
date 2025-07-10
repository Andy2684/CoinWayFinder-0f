import { database } from "./database"

const stripe = {
  customers: {
    create: async (data: any) => ({ id: `cus_${Date.now()}` }),
  },
  subscriptions: {
    create: async (data: any) => ({
      id: `sub_${Date.now()}`,
      latest_invoice: { payment_intent: { client_secret: `pi_${Date.now()}_secret` } },
    }),
    retrieve: async (id: string) => ({ items: { data: [{ id: `si_${Date.now()}` }] } }),
    update: async (id: string, data: any) => ({ id }),
    cancel: async (id: string) => ({ id }),
  },
}

export const SUBSCRIPTION_PLANS = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    interval: null,
    features: {
      maxBots: 1,
      maxTrades: 10,
      basicStrategies: true,
      advancedStrategies: false,
      apiAccess: false,
      prioritySupport: false,
      customIndicators: false,
      backtesting: false,
      webhooks: false,
      telegramAlerts: false,
    },
    limits: {
      apiCallsPerDay: 100,
      tradesPerDay: 10,
      botsPerUser: 1,
    },
  },
  starter: {
    id: "starter",
    name: "Starter",
    price: 29,
    interval: "month",
    stripeProductId: process.env.STRIPE_STARTER_PRICE_ID,
    features: {
      maxBots: 5,
      maxTrades: 100,
      basicStrategies: true,
      advancedStrategies: true,
      apiAccess: true,
      prioritySupport: false,
      customIndicators: false,
      backtesting: true,
      webhooks: false,
      telegramAlerts: true,
    },
    limits: {
      apiCallsPerDay: 1000,
      tradesPerDay: 100,
      botsPerUser: 5,
    },
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 99,
    interval: "month",
    stripeProductId: process.env.STRIPE_PRO_PRICE_ID,
    features: {
      maxBots: 20,
      maxTrades: 1000,
      basicStrategies: true,
      advancedStrategies: true,
      apiAccess: true,
      prioritySupport: true,
      customIndicators: true,
      backtesting: true,
      webhooks: true,
      telegramAlerts: true,
    },
    limits: {
      apiCallsPerDay: 10000,
      tradesPerDay: 1000,
      botsPerUser: 20,
    },
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    price: 299,
    interval: "month",
    stripeProductId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    features: {
      maxBots: -1, // unlimited
      maxTrades: -1, // unlimited
      basicStrategies: true,
      advancedStrategies: true,
      apiAccess: true,
      prioritySupport: true,
      customIndicators: true,
      backtesting: true,
      webhooks: true,
      telegramAlerts: true,
    },
    limits: {
      apiCallsPerDay: -1, // unlimited
      tradesPerDay: -1, // unlimited
      botsPerUser: -1, // unlimited
    },
  },
}

export interface SubscriptionStatus {
  plan: keyof typeof SUBSCRIPTION_PLANS
  status: "active" | "inactive" | "cancelled" | "past_due" | "trialing"
  trialEndsAt?: Date
  currentPeriodEnd?: Date
  stripeCustomerId?: string
  stripeSubscriptionId?: string
}

export class SubscriptionManager {
  private db: any

  constructor() {
    this.initializeDatabase()
  }

  private async initializeDatabase() {
    this.db = database
  }

  async getUserSubscription(userId: string): Promise<SubscriptionStatus | null> {
    const user = await database.getUserById(userId)
    if (!user) {
      return null
    }

    return (
      user.subscription || {
        plan: "free",
        status: "active",
      }
    )
  }

  async updateUserSubscription(userId: string, subscription: Partial<SubscriptionStatus>): Promise<boolean> {
    const result = await database.updateUser(userId, {
      subscription: { ...subscription },
    })
    return !!result
  }

  async checkAccess(userId: string, feature: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId)
    if (!subscription) {
      return false
    }

    if (subscription.status !== "active" && subscription.status !== "trialing") {
      return false
    }

    if (subscription.status === "trialing" && subscription.trialEndsAt) {
      if (new Date() > subscription.trialEndsAt) {
        return false
      }
    }

    if (subscription.currentPeriodEnd && new Date() > subscription.currentPeriodEnd) {
      return false
    }

    const plan = SUBSCRIPTION_PLANS[subscription.plan]
    if (!plan) {
      return false
    }

    return (plan.features as any)[feature] === true
  }

  async checkLimit(userId: string, limitType: string, currentUsage: number): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId)
    if (!subscription) {
      return false
    }

    const plan = SUBSCRIPTION_PLANS[subscription.plan]
    if (!plan) {
      return false
    }

    const limit = (plan.limits as any)[limitType]

    if (limit === -1) {
      return true
    }

    return currentUsage < limit
  }

  async startTrial(userId: string, planId: keyof typeof SUBSCRIPTION_PLANS = "starter"): Promise<boolean> {
    const user = await database.getUserById(userId)
    if (!user) {
      return false
    }

    if (user.subscription?.trialEndsAt) {
      return false
    }

    const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    const result = await database.updateUser(userId, {
      subscription: {
        plan: planId,
        status: "trialing",
        trialEndsAt,
        currentPeriodEnd: trialEndsAt,
      },
    })

    return !!result
  }

  async createStripeCustomer(userId: string, email: string): Promise<string> {
    const customer = await stripe.customers.create({
      email,
      metadata: { userId },
    })

    await database.updateUser(userId, {
      subscription: {
        stripeCustomerId: customer.id,
      },
    })

    return customer.id
  }

  async createSubscription(
    userId: string,
    planId: keyof typeof SUBSCRIPTION_PLANS,
    stripeCustomerId?: string,
  ): Promise<{ subscriptionId: string; clientSecret: string }> {
    const plan = SUBSCRIPTION_PLANS[planId]
    if (!plan || !plan.stripeProductId) {
      throw new Error("Invalid plan")
    }

    if (!stripeCustomerId) {
      const user = await database.getUserById(userId)
      if (!user) {
        throw new Error("User not found")
      }

      stripeCustomerId = user.subscription?.stripeCustomerId
      if (!stripeCustomerId) {
        stripeCustomerId = await this.createStripeCustomer(userId, user.email)
      }
    }

    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: plan.stripeProductId }],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
      metadata: { userId, planId },
    })

    await this.updateUserSubscription(userId, {
      plan: planId,
      status: "inactive",
      stripeCustomerId,
      stripeSubscriptionId: subscription.id,
    })

    const invoice = subscription.latest_invoice as any
    const paymentIntent = invoice.payment_intent

    return {
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret,
    }
  }

  async cancelSubscription(userId: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId)
    if (!subscription || !subscription.stripeSubscriptionId) {
      return false
    }

    try {
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId)
      await this.updateUserSubscription(userId, { status: "cancelled" })
      return true
    } catch (error) {
      console.error("Error cancelling subscription:", error)
      return false
    }
  }

  async upgradeSubscription(userId: string, newPlanId: keyof typeof SUBSCRIPTION_PLANS): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId)
    if (!subscription || !subscription.stripeSubscriptionId) {
      return false
    }

    const newPlan = SUBSCRIPTION_PLANS[newPlanId]
    if (!newPlan || !newPlan.stripeProductId) {
      return false
    }

    try {
      const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId)

      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        items: [
          {
            id: stripeSubscription.items.data[0].id,
            price: newPlan.stripeProductId,
          },
        ],
        proration_behavior: "create_prorations",
      })

      await this.updateUserSubscription(userId, { plan: newPlanId })
      return true
    } catch (error) {
      console.error("Error upgrading subscription:", error)
      return false
    }
  }

  async getUsageStats(userId: string): Promise<any> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const bots = await database.getBotsByUserId(userId)
    const trades = await database.getTradesByUserId(userId)
    const todayTrades = trades.filter((t) => t.createdAt >= today)

    const subscription = await this.getUserSubscription(userId)
    const plan = subscription ? SUBSCRIPTION_PLANS[subscription.plan] : SUBSCRIPTION_PLANS.free

    return {
      current: {
        bots: bots.length,
        tradesPerDay: todayTrades.length,
        apiCallsPerDay: 0, // Mock value
      },
      limits: plan.limits,
      features: plan.features,
    }
  }

  async isFeatureEnabled(userId: string, feature: string): Promise<boolean> {
    return this.checkAccess(userId, feature)
  }

  async canCreateBot(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const usage = await this.getUsageStats(userId)
    const limit = usage.limits.botsPerUser

    if (limit === -1) return { allowed: true }

    if (usage.current.bots < limit) {
      return { allowed: true }
    } else {
      return { allowed: false, reason: `Bot limit reached (${limit})` }
    }
  }

  async canExecuteTrade(userId: string): Promise<boolean> {
    const usage = await this.getUsageStats(userId)
    const limit = usage.limits.tradesPerDay

    if (limit === -1) return true
    return usage.current.tradesPerDay < limit
  }

  async canMakeApiCall(userId: string): Promise<boolean> {
    const usage = await this.getUsageStats(userId)
    const limit = usage.limits.apiCallsPerDay

    if (limit === -1) return true
    return usage.current.apiCallsPerDay < limit
  }

  async incrementUsage(userId: string, type: string): Promise<void> {
    // Mock implementation - in real app would track usage
    console.log(`Incrementing ${type} usage for user ${userId}`)
  }

  async decrementUsage(userId: string, type: string): Promise<void> {
    // Mock implementation - in real app would track usage
    console.log(`Decrementing ${type} usage for user ${userId}`)
  }
}

export const subscriptionManager = new SubscriptionManager()
