import { subscriptionManager, SUBSCRIPTION_PLANS } from "./subscription-manager"
import { adminManager } from "./admin"

export interface AccessLevel {
  canCreateBots: boolean
  maxBots: number
  canUseAdvancedStrategies: boolean
  canAccessAPI: boolean
  canUseRealTimeData: boolean
  canUseCustomStrategies: boolean
  canAccessAnalytics: boolean
  canUsePrioritySupport: boolean
  apiCallsPerDay: number
  features: string[]
}

export interface FeatureAccess {
  feature: string
  hasAccess: boolean
  reason?: string
  upgradeRequired?: string
}

class AccessControl {
  async getUserAccessLevel(userId: string): Promise<AccessLevel> {
    try {
      const subscriptionStatus = await subscriptionManager.getSubscriptionStatus(userId)
      const plan = SUBSCRIPTION_PLANS[subscriptionStatus.plan as keyof typeof SUBSCRIPTION_PLANS]

      if (!plan) {
        return this.getFreeAccessLevel()
      }

      return {
        canCreateBots: plan.limits.bots > 0 || plan.limits.bots === -1,
        maxBots: plan.limits.bots === -1 ? 999 : plan.limits.bots,
        canUseAdvancedStrategies: plan.limits.strategies.includes("advanced") || plan.limits.strategies.includes("all"),
        canAccessAPI: subscriptionStatus.plan !== "free",
        canUseRealTimeData: subscriptionStatus.plan !== "free",
        canUseCustomStrategies: ["pro", "enterprise", "trial"].includes(subscriptionStatus.plan),
        canAccessAnalytics: subscriptionStatus.plan !== "free",
        canUsePrioritySupport: ["starter", "pro", "enterprise", "trial"].includes(subscriptionStatus.plan),
        apiCallsPerDay: plan.limits.apiCalls === -1 ? 999999 : plan.limits.apiCalls,
        features: plan.features,
      }
    } catch (error) {
      console.error("Error getting user access level:", error)
      return this.getFreeAccessLevel()
    }
  }

  private getFreeAccessLevel(): AccessLevel {
    return {
      canCreateBots: true,
      maxBots: 1,
      canUseAdvancedStrategies: false,
      canAccessAPI: false,
      canUseRealTimeData: false,
      canUseCustomStrategies: false,
      canAccessAnalytics: false,
      canUsePrioritySupport: false,
      apiCallsPerDay: 100,
      features: SUBSCRIPTION_PLANS.free.features,
    }
  }

  async checkFeatureAccess(userId: string, feature: string): Promise<FeatureAccess> {
    try {
      // Check if user is admin
      const adminSession = await adminManager.getCurrentAdmin()
      if (adminSession?.userId === userId) {
        return { feature, hasAccess: true, reason: "Admin access" }
      }

      const accessLevel = await this.getUserAccessLevel(userId)
      const subscriptionStatus = await subscriptionManager.getSubscriptionStatus(userId)

      switch (feature) {
        case "create_bot":
          if (!accessLevel.canCreateBots) {
            return {
              feature,
              hasAccess: false,
              reason: "Bot creation not allowed",
              upgradeRequired: "starter",
            }
          }
          return { feature, hasAccess: true }

        case "advanced_strategies":
          if (!accessLevel.canUseAdvancedStrategies) {
            return {
              feature,
              hasAccess: false,
              reason: "Advanced strategies require subscription",
              upgradeRequired: "starter",
            }
          }
          return { feature, hasAccess: true }

        case "api_access":
          if (!accessLevel.canAccessAPI) {
            return {
              feature,
              hasAccess: false,
              reason: "API access requires subscription",
              upgradeRequired: "starter",
            }
          }
          return { feature, hasAccess: true }

        case "real_time_data":
          if (!accessLevel.canUseRealTimeData) {
            return {
              feature,
              hasAccess: false,
              reason: "Real-time data requires subscription",
              upgradeRequired: "starter",
            }
          }
          return { feature, hasAccess: true }

        case "custom_strategies":
          if (!accessLevel.canUseCustomStrategies) {
            return {
              feature,
              hasAccess: false,
              reason: "Custom strategies require Pro plan",
              upgradeRequired: "pro",
            }
          }
          return { feature, hasAccess: true }

        case "analytics":
          if (!accessLevel.canAccessAnalytics) {
            return {
              feature,
              hasAccess: false,
              reason: "Analytics require subscription",
              upgradeRequired: "starter",
            }
          }
          return { feature, hasAccess: true }

        case "priority_support":
          if (!accessLevel.canUsePrioritySupport) {
            return {
              feature,
              hasAccess: false,
              reason: "Priority support requires subscription",
              upgradeRequired: "starter",
            }
          }
          return { feature, hasAccess: true }

        case "unlimited_bots":
          if (accessLevel.maxBots < 999) {
            return {
              feature,
              hasAccess: false,
              reason: `Limited to ${accessLevel.maxBots} bots`,
              upgradeRequired: "pro",
            }
          }
          return { feature, hasAccess: true }

        default:
          return { feature, hasAccess: true }
      }
    } catch (error) {
      console.error("Error checking feature access:", error)
      return {
        feature,
        hasAccess: false,
        reason: "Error checking access",
      }
    }
  }

  async checkBotCreationLimit(userId: string): Promise<{
    canCreate: boolean
    currentCount: number
    maxAllowed: number
    reason?: string
  }> {
    try {
      const accessLevel = await this.getUserAccessLevel(userId)
      // In a real implementation, get actual bot count from database
      const currentCount = 0 // Mock current count

      if (currentCount >= accessLevel.maxBots) {
        return {
          canCreate: false,
          currentCount,
          maxAllowed: accessLevel.maxBots,
          reason: `You have reached the maximum number of bots (${accessLevel.maxBots}) for your plan`,
        }
      }

      return {
        canCreate: true,
        currentCount,
        maxAllowed: accessLevel.maxBots,
      }
    } catch (error) {
      console.error("Error checking bot creation limit:", error)
      return {
        canCreate: false,
        currentCount: 0,
        maxAllowed: 0,
        reason: "Error checking limits",
      }
    }
  }

  async checkAPICallLimit(userId: string): Promise<{
    canMakeCall: boolean
    callsUsedToday: number
    dailyLimit: number
    reason?: string
  }> {
    try {
      const accessLevel = await this.getUserAccessLevel(userId)
      // In a real implementation, get actual API call count from database/cache
      const callsUsedToday = 0 // Mock current usage

      if (callsUsedToday >= accessLevel.apiCallsPerDay) {
        return {
          canMakeCall: false,
          callsUsedToday,
          dailyLimit: accessLevel.apiCallsPerDay,
          reason: `You have reached your daily API call limit (${accessLevel.apiCallsPerDay})`,
        }
      }

      return {
        canMakeCall: true,
        callsUsedToday,
        dailyLimit: accessLevel.apiCallsPerDay,
      }
    } catch (error) {
      console.error("Error checking API call limit:", error)
      return {
        canMakeCall: false,
        callsUsedToday: 0,
        dailyLimit: 0,
        reason: "Error checking limits",
      }
    }
  }

  async getUpgradeRecommendation(
    userId: string,
    desiredFeature: string,
  ): Promise<{
    currentPlan: string
    recommendedPlan: string
    benefits: string[]
    price: number
  }> {
    try {
      const subscriptionStatus = await subscriptionManager.getSubscriptionStatus(userId)
      const currentPlan = subscriptionStatus.plan

      let recommendedPlan = "starter"
      let benefits: string[] = []
      let price = 29

      switch (desiredFeature) {
        case "unlimited_bots":
        case "custom_strategies":
          recommendedPlan = "pro"
          benefits = [
            "Unlimited trading bots",
            "All strategies including custom ones",
            "Advanced analytics",
            "Priority support",
          ]
          price = 79
          break

        case "advanced_strategies":
        case "api_access":
        case "real_time_data":
          recommendedPlan = "starter"
          benefits = ["5 trading bots", "Advanced strategies", "API access", "Real-time data", "Priority support"]
          price = 29
          break

        case "enterprise_features":
          recommendedPlan = "enterprise"
          benefits = [
            "Everything in Pro",
            "Dedicated support",
            "Custom integrations",
            "White-label options",
            "Advanced risk management",
          ]
          price = 199
          break

        default:
          recommendedPlan = "starter"
          benefits = ["5 trading bots", "Advanced strategies", "API access", "Real-time data"]
          price = 29
      }

      return {
        currentPlan,
        recommendedPlan,
        benefits,
        price,
      }
    } catch (error) {
      console.error("Error getting upgrade recommendation:", error)
      return {
        currentPlan: "free",
        recommendedPlan: "starter",
        benefits: [],
        price: 29,
      }
    }
  }

  async logFeatureUsage(userId: string, feature: string, success: boolean): Promise<void> {
    try {
      // In a real implementation, log to database for analytics
      console.log(`Feature usage: ${userId} - ${feature} - ${success ? "success" : "blocked"}`)
    } catch (error) {
      console.error("Error logging feature usage:", error)
    }
  }
}

export const accessControl = new AccessControl()
