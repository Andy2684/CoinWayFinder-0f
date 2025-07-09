import type { User, SubscriptionPlan, UserSettings } from "./database"

export interface TrialStatus {
  isEligible: boolean
  isActive: boolean
  daysRemaining: number
  startDate?: Date
  endDate?: Date
}

export class SubscriptionManager {
  private static instance: SubscriptionManager

  static getInstance(): SubscriptionManager {
    if (!SubscriptionManager.instance) {
      SubscriptionManager.instance = new SubscriptionManager()
    }
    return SubscriptionManager.instance
  }

  getSubscriptionLimits(plan: SubscriptionPlan) {
    const limits = {
      free: {
        maxBots: 1,
        maxTrades: 10,
        aiAnalysis: false,
        whaleTracking: false,
        advancedStrategies: false,
        prioritySupport: false,
      },
      trial: {
        maxBots: 3,
        maxTrades: 50,
        aiAnalysis: true,
        whaleTracking: true,
        advancedStrategies: true,
        prioritySupport: false,
      },
      basic: {
        maxBots: 3,
        maxTrades: 100,
        aiAnalysis: true,
        whaleTracking: false,
        advancedStrategies: false,
        prioritySupport: false,
      },
      pro: {
        maxBots: 10,
        maxTrades: 1000,
        aiAnalysis: true,
        whaleTracking: true,
        advancedStrategies: true,
        prioritySupport: true,
      },
      enterprise: {
        maxBots: -1, // unlimited
        maxTrades: -1, // unlimited
        aiAnalysis: true,
        whaleTracking: true,
        advancedStrategies: true,
        prioritySupport: true,
      },
    }

    return limits[plan] || limits.free
  }

  async startFreeTrial(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      // In a real app, this would update the database
      const trialStartDate = new Date()
      const trialEndDate = new Date()
      trialEndDate.setDate(trialStartDate.getDate() + 3)

      // Mock database update
      console.log(`Starting trial for user ${userId}`, {
        trialStartDate,
        trialEndDate,
      })

      return {
        success: true,
        message: "Free trial started successfully!",
      }
    } catch (error) {
      return {
        success: false,
        message: "Failed to start trial. Please try again.",
      }
    }
  }

  getTrialStatus(userSettings: UserSettings): TrialStatus {
    const now = new Date()

    // Check if user has already used their trial
    if (userSettings.trialUsed) {
      return {
        isEligible: false,
        isActive: false,
        daysRemaining: 0,
      }
    }

    // Check if trial is currently active
    if (userSettings.trialStartDate && userSettings.trialEndDate) {
      const startDate = new Date(userSettings.trialStartDate)
      const endDate = new Date(userSettings.trialEndDate)

      if (now >= startDate && now <= endDate) {
        const msRemaining = endDate.getTime() - now.getTime()
        const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24))

        return {
          isEligible: false,
          isActive: true,
          daysRemaining: Math.max(0, daysRemaining),
          startDate,
          endDate,
        }
      }
    }

    // User is eligible for trial
    return {
      isEligible: true,
      isActive: false,
      daysRemaining: 3,
    }
  }

  isTrialExpired(userSettings: UserSettings): boolean {
    if (!userSettings.trialStartDate || !userSettings.trialEndDate) {
      return false
    }

    const now = new Date()
    const endDate = new Date(userSettings.trialEndDate)

    return now > endDate
  }

  getUserEffectivePlan(user: User): SubscriptionPlan {
    const trialStatus = this.getTrialStatus(user.settings)

    if (trialStatus.isActive) {
      return "trial"
    }

    return user.subscription?.plan || "free"
  }

  canAccessFeature(user: User, feature: string): boolean {
    const effectivePlan = this.getUserEffectivePlan(user)
    const limits = this.getSubscriptionLimits(effectivePlan)

    switch (feature) {
      case "ai_analysis":
        return limits.aiAnalysis
      case "whale_tracking":
        return limits.whaleTracking
      case "advanced_strategies":
        return limits.advancedStrategies
      case "priority_support":
        return limits.prioritySupport
      default:
        return true
    }
  }

  getRemainingBots(user: User, currentBotCount: number): number {
    const effectivePlan = this.getUserEffectivePlan(user)
    const limits = this.getSubscriptionLimits(effectivePlan)

    if (limits.maxBots === -1) return -1 // unlimited
    return Math.max(0, limits.maxBots - currentBotCount)
  }

  getRemainingTrades(user: User, currentTradeCount: number): number {
    const effectivePlan = this.getUserEffectivePlan(user)
    const limits = this.getSubscriptionLimits(effectivePlan)

    if (limits.maxTrades === -1) return -1 // unlimited
    return Math.max(0, limits.maxTrades - currentTradeCount)
  }
}
