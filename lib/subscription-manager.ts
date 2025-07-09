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

        // Stop all running bots for expired users
        const stoppedBots = await database.stopUserBots(userSettings.userId, "Subscription expired")

        console.log(`Stopped ${stoppedBots} bots for expired user: ${userSettings.userId}`)
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
}

export const subscriptionManager = SubscriptionManager.getInstance()
