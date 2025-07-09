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
  trial: {
    maxBots: 3,
    maxTrades: 50,
    aiAnalysis: true,
    whaleTracking: true,
    newsAlerts: true,
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
    trialDays: 0,
  },
  trial: {
    name: "3-Day Free Trial",
    price: 0,
    interval: "trial",
    features: ["3 Trading Bots", "50 Trades", "AI Analysis", "Whale Tracking", "News Alerts", "3 Days Free"],
    limits: SUBSCRIPTION_LIMITS.trial,
    trialDays: 3,
  },
  basic: {
    name: "Basic",
    price: 29,
    interval: "month",
    features: ["3 Trading Bots", "100 Trades per month", "AI Analysis", "News Alerts", "Email Support"],
    limits: SUBSCRIPTION_LIMITS.basic,
    trialDays: 3,
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
    trialDays: 3,
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
    trialDays: 3,
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

      // Check if user is in trial period
      if (status === "trial" && !this.isTrialExpired(userSettings)) {
        return SUBSCRIPTION_LIMITS.trial
      }

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

  async getUserPlan(userId: string): Promise<string> {
    try {
      const userSettings = await database.getUserSettings(userId)

      if (!userSettings) {
        return "free"
      }

      // Check if user is in trial period
      if (userSettings.subscription.status === "trial" && !this.isTrialExpired(userSettings)) {
        return "trial"
      }

      // If subscription is expired, return free
      if (userSettings.subscription.status !== "active") {
        return "free"
      }

      return userSettings.subscription.plan
    } catch (error) {
      console.error("Error getting user plan:", error)
      return "free"
    }
  }

  async getUsageStats(userId: string): Promise<any> {
    try {
      const userSettings = await database.getUserSettings(userId)
      const limits = await this.getUserLimits(userId)

      if (!userSettings) {
        return {
          botsCreated: 0,
          maxBots: limits.maxBots,
          tradesExecuted: 0,
          maxTrades: limits.maxTrades,
          aiAnalysisUsed: 0,
          maxAiAnalysis: limits.aiAnalysis ? 100 : 0,
        }
      }

      const userBots = await database.getUserBots(userId)
      const userTrades = await database.getUserTrades(userId, 1000)

      return {
        botsCreated: userBots.length,
        maxBots: limits.maxBots,
        tradesExecuted: userTrades.length,
        maxTrades: limits.maxTrades,
        aiAnalysisUsed: userSettings.usage?.aiAnalysisUsed || 0,
        maxAiAnalysis: limits.aiAnalysis ? 100 : 0,
      }
    } catch (error) {
      console.error("Error getting usage stats:", error)
      return {
        botsCreated: 0,
        maxBots: 1,
        tradesExecuted: 0,
        maxTrades: 10,
        aiAnalysisUsed: 0,
        maxAiAnalysis: 0,
      }
    }
  }

  async isTrialExpired(userSettings: any): Promise<boolean> {
    if (!userSettings.subscription.trialEndDate) {
      return false
    }

    return new Date() > new Date(userSettings.subscription.trialEndDate)
  }

  async startFreeTrial(userId: string): Promise<{ success: boolean; message: string; trialEndDate?: Date }> {
    try {
      const userSettings = await database.getUserSettings(userId)

      if (!userSettings) {
        return { success: false, message: "User not found" }
      }

      // Check if user has already used their trial
      if (userSettings.subscription.trialUsed) {
        return { success: false, message: "Free trial already used" }
      }

      // Calculate trial end date (3 days from now)
      const trialEndDate = new Date()
      trialEndDate.setDate(trialEndDate.getDate() + 3)

      // Update user subscription to trial
      userSettings.subscription = {
        ...userSettings.subscription,
        plan: "trial",
        status: "trial",
        startDate: new Date(),
        trialStartDate: new Date(),
        trialEndDate,
        trialUsed: true,
      }

      await database.saveUserSettings(userSettings)

      return {
        success: true,
        message: "Free trial started successfully",
        trialEndDate,
      }
    } catch (error) {
      console.error("Error starting free trial:", error)
      return { success: false, message: "Failed to start free trial" }
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
        // Check if it's a trial that expired
        if (userSettings.subscription.status === "trial" && this.isTrialExpired(userSettings)) {
          // Convert trial to free plan
          await database.updateSubscriptionStatus(userSettings.userId, "expired")
          console.log(`Trial expired for user: ${userSettings.userId} - converted to free plan`)
        } else {
          // Update subscription status
          await database.updateSubscriptionStatus(userSettings.userId, "expired")
          console.log(`Subscription expired for user: ${userSettings.userId} - graceful expiration applied`)
        }
      }
    } catch (error) {
      console.error("Error checking subscription expiry:", error)
    }
  }

  async upgradePlan(
    userId: string,
    newPlan: string,
    paymentMethodId?: string,
  ): Promise<{ success: boolean; message: string; checkoutUrl?: string }> {
    try {
      const userSettings = await database.getUserSettings(userId)
      if (!userSettings) {
        return { success: false, message: "User not found" }
      }

      // If upgrading from trial, mark trial as used
      if (userSettings.subscription.status === "trial") {
        userSettings.subscription.trialUsed = true
      }

      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + 1)

      userSettings.subscription = {
        ...userSettings.subscription,
        plan: newPlan as any,
        status: "active",
        endDate,
      }

      await database.saveUserSettings(userSettings)

      return {
        success: true,
        message: "Plan upgraded successfully",
      }
    } catch (error) {
      console.error("Error upgrading subscription:", error)
      return { success: false, message: "Failed to upgrade plan" }
    }
  }

  async cancelSubscription(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const userSettings = await database.getUserSettings(userId)
      if (!userSettings) {
        return { success: false, message: "User not found" }
      }

      userSettings.subscription.status = "cancelled"
      await database.saveUserSettings(userSettings)

      return { success: true, message: "Subscription cancelled successfully" }
    } catch (error) {
      console.error("Error cancelling subscription:", error)
      return { success: false, message: "Failed to cancel subscription" }
    }
  }

  async processReferral(userId: string, referralCode: string): Promise<{ success: boolean; message: string }> {
    try {
      // Mock referral processing
      return { success: true, message: "Referral processed successfully" }
    } catch (error) {
      console.error("Error processing referral:", error)
      return { success: false, message: "Failed to process referral" }
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

  // Get trial status for a user
  async getTrialStatus(userId: string): Promise<{
    hasTrialAvailable: boolean
    isInTrial: boolean
    trialDaysLeft: number
    trialEndDate?: Date
  }> {
    try {
      const userSettings = await database.getUserSettings(userId)

      if (!userSettings) {
        return {
          hasTrialAvailable: true,
          isInTrial: false,
          trialDaysLeft: 3,
        }
      }

      const hasTrialAvailable = !userSettings.subscription.trialUsed
      const isInTrial = userSettings.subscription.status === "trial" && !this.isTrialExpired(userSettings)

      let trialDaysLeft = 0
      let trialEndDate: Date | undefined

      if (isInTrial && userSettings.subscription.trialEndDate) {
        trialEndDate = new Date(userSettings.subscription.trialEndDate)
        const now = new Date()
        const timeDiff = trialEndDate.getTime() - now.getTime()
        trialDaysLeft = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)))
      } else if (hasTrialAvailable) {
        trialDaysLeft = 3
      }

      return {
        hasTrialAvailable,
        isInTrial,
        trialDaysLeft,
        trialEndDate,
      }
    } catch (error) {
      console.error("Error getting trial status:", error)
      return {
        hasTrialAvailable: true,
        isInTrial: false,
        trialDaysLeft: 3,
      }
    }
  }
}

export const subscriptionManager = SubscriptionManager.getInstance()
