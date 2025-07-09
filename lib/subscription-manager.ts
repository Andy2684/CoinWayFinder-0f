import { database } from "./database"
import { stripe } from "./stripe"

export const SUBSCRIPTION_PLANS = {
  free: {
    name: "Free",
    price: 0,
    priceId: null,
    features: ["1 Trading Bot", "Basic Strategies", "Email Support", "Limited API Calls (100/day)"],
    limits: {
      bots: 1,
      apiCalls: 100,
      strategies: ["basic"],
    },
  },
  trial: {
    name: "3-Day Free Trial",
    price: 0,
    priceId: null,
    features: [
      "Unlimited Trading Bots",
      "All Advanced Strategies",
      "Priority Support",
      "Unlimited API Calls",
      "Real-time Alerts",
      "Advanced Analytics",
    ],
    limits: {
      bots: -1, // unlimited
      apiCalls: -1, // unlimited
      strategies: ["all"],
    },
  },
  starter: {
    name: "Starter",
    price: 29,
    priceId: process.env.STRIPE_STARTER_PRICE_ID,
    features: ["5 Trading Bots", "Advanced Strategies", "Priority Support", "Unlimited API Calls", "Real-time Alerts"],
    limits: {
      bots: 5,
      apiCalls: -1, // unlimited
      strategies: ["basic", "advanced"],
    },
  },
  pro: {
    name: "Pro",
    price: 79,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: [
      "Unlimited Trading Bots",
      "All Strategies",
      "Priority Support",
      "Unlimited API Calls",
      "Real-time Alerts",
      "Advanced Analytics",
      "Custom Strategies",
    ],
    limits: {
      bots: -1, // unlimited
      apiCalls: -1, // unlimited
      strategies: ["all"],
    },
  },
  enterprise: {
    name: "Enterprise",
    price: 199,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    features: [
      "Everything in Pro",
      "Dedicated Support",
      "Custom Integrations",
      "White-label Options",
      "API Access",
      "Advanced Risk Management",
    ],
    limits: {
      bots: -1, // unlimited
      apiCalls: -1, // unlimited
      strategies: ["all"],
    },
  },
}

export interface SubscriptionStatus {
  plan: string
  status: "active" | "inactive" | "cancelled" | "past_due"
  endDate: Date
  isTrialActive: boolean
  trialEndDate?: Date
  canUpgrade: boolean
  features: string[]
  limits: {
    bots: number
    apiCalls: number
    strategies: string[]
  }
}

class SubscriptionManager {
  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
    const userSettings = await database.getUserSettings(userId)

    if (!userSettings) {
      // Default to free plan
      return {
        plan: "free",
        status: "inactive",
        endDate: new Date(),
        isTrialActive: false,
        canUpgrade: true,
        features: SUBSCRIPTION_PLANS.free.features,
        limits: SUBSCRIPTION_PLANS.free.limits,
      }
    }

    const { subscription, trial } = userSettings
    const now = new Date()

    // Check if trial is active and not expired
    const isTrialActive = trial.isActive && trial.endDate > now

    // If trial is active, use trial plan
    if (isTrialActive) {
      return {
        plan: "trial",
        status: "active",
        endDate: trial.endDate,
        isTrialActive: true,
        trialEndDate: trial.endDate,
        canUpgrade: true,
        features: SUBSCRIPTION_PLANS.trial.features,
        limits: SUBSCRIPTION_PLANS.trial.limits,
      }
    }

    // Check if paid subscription is active
    const isPaidActive = subscription.status === "active" && subscription.endDate > now

    if (isPaidActive && subscription.plan !== "free" && subscription.plan !== "trial") {
      const planConfig = SUBSCRIPTION_PLANS[subscription.plan as keyof typeof SUBSCRIPTION_PLANS]
      return {
        plan: subscription.plan,
        status: "active",
        endDate: subscription.endDate,
        isTrialActive: false,
        canUpgrade: subscription.plan !== "enterprise",
        features: planConfig?.features || [],
        limits: planConfig?.limits || SUBSCRIPTION_PLANS.free.limits,
      }
    }

    // Default to free plan
    return {
      plan: "free",
      status: "inactive",
      endDate: new Date(),
      isTrialActive: false,
      canUpgrade: true,
      features: SUBSCRIPTION_PLANS.free.features,
      limits: SUBSCRIPTION_PLANS.free.limits,
    }
  }

  async canStartTrial(userId: string): Promise<boolean> {
    const userSettings = await database.getUserSettings(userId)

    if (!userSettings) {
      return true // New user can start trial
    }

    // Check if user has already used their trial
    return !userSettings.trial.hasUsed
  }

  async startTrial(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const canStart = await this.canStartTrial(userId)

      if (!canStart) {
        return { success: false, message: "Trial has already been used" }
      }

      const success = await database.startTrial(userId)

      if (success) {
        return { success: true, message: "Trial started successfully" }
      } else {
        return { success: false, message: "Failed to start trial" }
      }
    } catch (error) {
      console.error("Start trial error:", error)
      return { success: false, message: "Failed to start trial" }
    }
  }

  async checkAndExpireTrials(): Promise<void> {
    try {
      // This would typically be run as a cron job
      // For now, we'll check when getting subscription status
      console.log("Checking for expired trials...")
    } catch (error) {
      console.error("Error checking expired trials:", error)
    }
  }

  async upgradeSubscription(
    userId: string,
    planId: string,
    stripeCustomerId?: string,
    stripeSubscriptionId?: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const plan = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS]

      if (!plan) {
        return { success: false, message: "Invalid plan selected" }
      }

      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + 1) // 1 month from now

      const subscription = {
        plan: planId,
        status: "active" as const,
        endDate,
        stripeCustomerId,
        stripeSubscriptionId,
      }

      const success = await database.updateSubscription(userId, subscription)

      if (success) {
        // End trial if active
        await database.endTrial(userId)
        return { success: true, message: "Subscription upgraded successfully" }
      } else {
        return { success: false, message: "Failed to upgrade subscription" }
      }
    } catch (error) {
      console.error("Upgrade subscription error:", error)
      return { success: false, message: "Failed to upgrade subscription" }
    }
  }

  async cancelSubscription(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const userSettings = await database.getUserSettings(userId)

      if (!userSettings) {
        return { success: false, message: "User settings not found" }
      }

      // Cancel with Stripe if there's a subscription ID
      if (userSettings.subscription.stripeSubscriptionId) {
        try {
          await stripe.subscriptions.cancel(userSettings.subscription.stripeSubscriptionId)
        } catch (stripeError) {
          console.error("Stripe cancellation error:", stripeError)
          // Continue with local cancellation even if Stripe fails
        }
      }

      const subscription = {
        plan: "free",
        status: "cancelled" as const,
        endDate: new Date(),
      }

      const success = await database.updateSubscription(userId, subscription)

      if (success) {
        return { success: true, message: "Subscription cancelled successfully" }
      } else {
        return { success: false, message: "Failed to cancel subscription" }
      }
    } catch (error) {
      console.error("Cancel subscription error:", error)
      return { success: false, message: "Failed to cancel subscription" }
    }
  }

  async checkAccess(userId: string, feature: string): Promise<boolean> {
    const status = await this.getSubscriptionStatus(userId)

    // Admin always has access
    if (status.plan === "admin") {
      return true
    }

    // Check specific feature access based on plan
    switch (feature) {
      case "unlimited_bots":
        return status.limits.bots === -1
      case "advanced_strategies":
        return status.limits.strategies.includes("advanced") || status.limits.strategies.includes("all")
      case "api_access":
        return status.plan !== "free"
      case "priority_support":
        return ["starter", "pro", "enterprise", "trial"].includes(status.plan)
      case "custom_strategies":
        return ["pro", "enterprise", "trial"].includes(status.plan)
      default:
        return status.status === "active"
    }
  }

  async getRemainingLimits(userId: string): Promise<{
    bots: { used: number; limit: number; remaining: number }
    apiCalls: { used: number; limit: number; remaining: number }
  }> {
    const [status, userSettings, userBots] = await Promise.all([
      this.getSubscriptionStatus(userId),
      database.getUserSettings(userId),
      database.getUserBots(userId),
    ])

    const botsUsed = userBots.length
    const botsLimit = status.limits.bots
    const botsRemaining = botsLimit === -1 ? -1 : Math.max(0, botsLimit - botsUsed)

    const apiCallsUsed = userSettings?.usage.apiCalls || 0
    const apiCallsLimit = status.limits.apiCalls
    const apiCallsRemaining = apiCallsLimit === -1 ? -1 : Math.max(0, apiCallsLimit - apiCallsUsed)

    return {
      bots: {
        used: botsUsed,
        limit: botsLimit,
        remaining: botsRemaining,
      },
      apiCalls: {
        used: apiCallsUsed,
        limit: apiCallsLimit,
        remaining: apiCallsRemaining,
      },
    }
  }
}

export const subscriptionManager = new SubscriptionManager()
