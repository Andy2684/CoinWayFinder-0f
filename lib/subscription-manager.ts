import { database } from "./database"
import { adminManager, type AdminSession } from "./admin"

export interface SubscriptionLimits {
  maxBots: number
  maxTrades: number
  aiAnalysis: boolean
  whaleTracking: boolean
  newsAlerts: boolean
  premiumStrategies: boolean
  apiAccess: boolean
  prioritySupport: boolean
}

export const SUBSCRIPTION_LIMITS: Record<string, SubscriptionLimits> = {
  free: {
    maxBots: 1,
    maxTrades: 10,
    aiAnalysis: false,
    whaleTracking: false,
    newsAlerts: false,
    premiumStrategies: false,
    apiAccess: false,
    prioritySupport: false,
  },
  basic: {
    maxBots: 3,
    maxTrades: 100,
    aiAnalysis: true,
    whaleTracking: false,
    newsAlerts: true,
    premiumStrategies: false,
    apiAccess: false,
    prioritySupport: false,
  },
  premium: {
    maxBots: 10,
    maxTrades: 1000,
    aiAnalysis: true,
    whaleTracking: true,
    newsAlerts: true,
    premiumStrategies: true,
    apiAccess: true,
    prioritySupport: true,
  },
  enterprise: {
    maxBots: -1, // unlimited
    maxTrades: -1, // unlimited
    aiAnalysis: true,
    whaleTracking: true,
    newsAlerts: true,
    premiumStrategies: true,
    apiAccess: true,
    prioritySupport: true,
  },
}

export const SUBSCRIPTION_PLANS = {
  free: {
    name: "Free",
    price: 0,
    interval: "month",
    features: ["1 Trading Bot", "10 Trades per month", "Basic Support", "Community Access"],
    limits: SUBSCRIPTION_LIMITS.free,
  },
  basic: {
    name: "Basic",
    price: 29,
    interval: "month",
    features: ["3 Trading Bots", "100 Trades per month", "AI Analysis", "News Alerts", "Email Support"],
    limits: SUBSCRIPTION_LIMITS.basic,
  },
  premium: {
    name: "Premium",
    price: 99,
    interval: "month",
    features: [
      "10 Trading Bots",
      "1,000 Trades per month",
      "AI Analysis",
      "Whale Tracking",
      "Premium Strategies",
      "API Access",
      "Priority Support",
    ],
    limits: SUBSCRIPTION_LIMITS.premium,
  },
  enterprise: {
    name: "Enterprise",
    price: 299,
    interval: "month",
    features: [
      "Unlimited Trading Bots",
      "Unlimited Trades",
      "All AI Features",
      "Custom Strategies",
      "Full API Access",
      "Dedicated Support",
      "White-label Options",
    ],
    limits: SUBSCRIPTION_LIMITS.enterprise,
  },
}

class SubscriptionManager {
  private static instance: SubscriptionManager

  static getInstance(): SubscriptionManager {
    if (!SubscriptionManager.instance) {
      SubscriptionManager.instance = new SubscriptionManager()
    }
    return SubscriptionManager.instance
  }

  async getUserLimits(userId: string, adminSession?: AdminSession | null): Promise<SubscriptionLimits> {
    // Admin bypass - unlimited access
    if (adminSession?.isAdmin && adminManager.bypassSubscriptionCheck(adminSession)) {
      return {
        maxBots: -1,
        maxTrades: -1,
        aiAnalysis: true,
        whaleTracking: true,
        newsAlerts: true,
        premiumStrategies: true,
        apiAccess: true,
        prioritySupport: true,
      }
    }

    try {
      const userSettings = await database.getUserSettings(userId)

      if (!userSettings) {
        return SUBSCRIPTION_LIMITS.free
      }

      const plan = userSettings.subscription.plan
      const status = userSettings.subscription.status

      // If subscription is expired or cancelled, downgrade to free
      if (status !== "active") {
        return SUBSCRIPTION_LIMITS.free
      }

      return SUBSCRIPTION_LIMITS[plan] || SUBSCRIPTION_LIMITS.free
    } catch (error) {
      console.error("Error getting user limits:", error)
      return SUBSCRIPTION_LIMITS.free
    }
  }

  async canCreateBot(userId: string, adminSession?: AdminSession | null): Promise<boolean> {
    // Admin bypass
    if (adminSession?.isAdmin && adminManager.bypassSubscriptionCheck(adminSession)) {
      return true
    }

    const limits = await this.getUserLimits(userId, adminSession)
    if (limits.maxBots === -1) return true // unlimited

    const userBots = await database.getUserBots(userId)
    return userBots.length < limits.maxBots
  }

  async canExecuteTrade(userId: string, adminSession?: AdminSession | null): Promise<boolean> {
    // Admin bypass
    if (adminSession?.isAdmin && adminManager.bypassSubscriptionCheck(adminSession)) {
      return true
    }

    const limits = await this.getUserLimits(userId, adminSession)
    if (limits.maxTrades === -1) return true // unlimited

    const userTrades = await database.getUserTrades(userId, limits.maxTrades + 1)
    return userTrades.length < limits.maxTrades
  }

  async hasFeatureAccess(
    userId: string,
    feature: keyof SubscriptionLimits,
    adminSession?: AdminSession | null,
  ): Promise<boolean> {
    // Admin bypass
    if (adminSession?.isAdmin && adminManager.bypassSubscriptionCheck(adminSession)) {
      return true
    }

    const limits = await this.getUserLimits(userId, adminSession)
    return limits[feature] === true
  }

  async checkSubscriptionExpiry(): Promise<void> {
    try {
      const expiredSubscriptions = await database.getExpiredSubscriptions()

      for (const userSettings of expiredSubscriptions) {
        // Update subscription status
        await database.updateSubscriptionStatus(userSettings.userId, "expired")

        // Don't stop running bots - let them finish gracefully
        // Only prevent new bot creation and modifications
        console.log(`Subscription expired for user: ${userSettings.userId} - graceful expiration applied`)
      }
    } catch (error) {
      console.error("Error checking subscription expiry:", error)
    }
  }

  async upgradeSubscription(userId: string, newPlan: string, durationMonths = 1): Promise<boolean> {
    try {
      const userSettings = await database.getUserSettings(userId)
      if (!userSettings) return false

      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + durationMonths)

      userSettings.subscription = {
        ...userSettings.subscription,
        plan: newPlan as any,
        status: "active",
        endDate,
      }

      await database.saveUserSettings(userSettings)
      return true
    } catch (error) {
      console.error("Error upgrading subscription:", error)
      return false
    }
  }

  // Graceful expiration check - allows existing operations to continue
  async isGracefullyExpired(userId: string): Promise<boolean> {
    try {
      const userSettings = await database.getUserSettings(userId)
      return userSettings?.subscription.status === "expired"
    } catch (error) {
      return false
    }
  }

  // Check if user can perform write operations (create/modify)
  async canPerformWriteOperations(userId: string, adminSession?: AdminSession | null): Promise<boolean> {
    // Admin bypass
    if (adminSession?.isAdmin && adminManager.bypassSubscriptionCheck(adminSession)) {
      return true
    }

    const isExpired = await this.isGracefullyExpired(userId)
    return !isExpired
  }
}

export const subscriptionManager = SubscriptionManager.getInstance()
