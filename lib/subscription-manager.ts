export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  interval: "month" | "year"
  features: string[]
  limits: {
    bots: number
    trades: number
    apiCalls: number
  }
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    interval: "month",
    features: ["1 Trading Bot", "Basic Strategies", "Email Support", "Market Data Access"],
    limits: {
      bots: 1,
      trades: 100,
      apiCalls: 1000,
    },
  },
  {
    id: "starter",
    name: "Starter",
    price: 29,
    interval: "month",
    features: ["5 Trading Bots", "Advanced Strategies", "Priority Support", "Real-time Alerts", "Portfolio Analytics"],
    limits: {
      bots: 5,
      trades: 1000,
      apiCalls: 10000,
    },
  },
  {
    id: "pro",
    name: "Pro",
    price: 99,
    interval: "month",
    features: [
      "Unlimited Trading Bots",
      "All Strategies",
      "24/7 Support",
      "Advanced Analytics",
      "Custom Indicators",
      "API Access",
    ],
    limits: {
      bots: -1, // unlimited
      trades: -1,
      apiCalls: -1,
    },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 299,
    interval: "month",
    features: [
      "Everything in Pro",
      "Dedicated Support",
      "Custom Development",
      "White Label Options",
      "Advanced Security",
    ],
    limits: {
      bots: -1,
      trades: -1,
      apiCalls: -1,
    },
  },
]

export class SubscriptionManager {
  async getUserSubscription(userId: string): Promise<any> {
    // Mock implementation - in real app, fetch from database
    return {
      userId,
      plan: "free",
      status: "active",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }
  }

  async updateSubscription(userId: string, planId: string): Promise<any> {
    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId)
    if (!plan) {
      throw new Error("Invalid plan")
    }

    // Mock implementation
    return {
      userId,
      plan: planId,
      status: "active",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    }
  }

  async cancelSubscription(userId: string): Promise<boolean> {
    // Mock implementation
    return true
  }

  async checkUsageLimits(
    userId: string,
    resource: string,
  ): Promise<{ allowed: boolean; limit: number; current: number }> {
    const subscription = await this.getUserSubscription(userId)
    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === subscription.plan)

    if (!plan) {
      return { allowed: false, limit: 0, current: 0 }
    }

    // Mock current usage
    const currentUsage = {
      bots: 0,
      trades: 0,
      apiCalls: 0,
    }

    const limit = plan.limits[resource as keyof typeof plan.limits]
    const current = currentUsage[resource as keyof typeof currentUsage]

    return {
      allowed: limit === -1 || current < limit,
      limit,
      current,
    }
  }

  async incrementUsage(userId: string, resource: string, amount = 1): Promise<void> {
    // Mock implementation - in real app, update database
    console.log(`Incrementing ${resource} usage for user ${userId} by ${amount}`)
  }

  getPlanById(planId: string): SubscriptionPlan | undefined {
    return SUBSCRIPTION_PLANS.find((plan) => plan.id === planId)
  }

  getAllPlans(): SubscriptionPlan[] {
    return SUBSCRIPTION_PLANS
  }
}

export const subscriptionManager = new SubscriptionManager()
