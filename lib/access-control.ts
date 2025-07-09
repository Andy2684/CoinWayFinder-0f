import { subscriptionManager, SUBSCRIPTION_PLANS } from "./subscription-manager"
import { database } from "./database"

export interface AccessResult {
  allowed: boolean
  reason?: string
  upgradeRequired?: boolean
  suggestedPlan?: string
}

export class AccessControl {
  async canAccessFeature(userId: string, feature: string): Promise<AccessResult> {
    try {
      const hasAccess = await subscriptionManager.hasAccess(userId, feature as any)

      if (hasAccess) {
        return { allowed: true }
      }

      // Find the minimum plan that supports this feature
      const suggestedPlan = this.findMinimumPlanForFeature(feature)

      return {
        allowed: false,
        reason: `This feature requires a ${suggestedPlan} subscription or higher`,
        upgradeRequired: true,
        suggestedPlan,
      }
    } catch (error) {
      console.error("Access control error:", error)
      return {
        allowed: false,
        reason: "Unable to verify access permissions",
      }
    }
  }

  async canCreateBot(userId: string): Promise<AccessResult> {
    try {
      const result = await subscriptionManager.canCreateBot(userId)

      if (result.allowed) {
        return { allowed: true }
      }

      return {
        allowed: false,
        reason: result.reason,
        upgradeRequired: true,
        suggestedPlan: "pro",
      }
    } catch (error) {
      console.error("Bot creation access error:", error)
      return {
        allowed: false,
        reason: "Unable to verify bot creation permissions",
      }
    }
  }

  async canExecuteTrade(userId: string): Promise<AccessResult> {
    try {
      const result = await subscriptionManager.canExecuteTrade(userId)

      if (result.allowed) {
        return { allowed: true }
      }

      return {
        allowed: false,
        reason: result.reason,
        upgradeRequired: true,
        suggestedPlan: "pro",
      }
    } catch (error) {
      console.error("Trade execution access error:", error)
      return {
        allowed: false,
        reason: "Unable to verify trade execution permissions",
      }
    }
  }

  async canAccessApi(userId: string): Promise<AccessResult> {
    return this.canAccessFeature(userId, "apiAccess")
  }

  async canUseAdvancedStrategies(userId: string): Promise<AccessResult> {
    return this.canAccessFeature(userId, "advancedStrategies")
  }

  async canUseWebhooks(userId: string): Promise<AccessResult> {
    return this.canAccessFeature(userId, "webhooks")
  }

  async canAccessPrioritySupport(userId: string): Promise<AccessResult> {
    return this.canAccessFeature(userId, "prioritySupport")
  }

  async getUserLimits(userId: string): Promise<{
    bots: { current: number; limit: number }
    trades: { current: number; limit: number }
    features: any
  } | null> {
    try {
      return await subscriptionManager.getUsageStats(userId)
    } catch (error) {
      console.error("Get user limits error:", error)
      return null
    }
  }

  async checkResourceAccess(userId: string, resourceType: string, resourceId: string): Promise<AccessResult> {
    try {
      switch (resourceType) {
        case "bot":
          const bot = await database.getBotById(resourceId)
          if (!bot) {
            return { allowed: false, reason: "Bot not found" }
          }
          if (bot.userId !== userId) {
            return { allowed: false, reason: "You don't have access to this bot" }
          }
          return { allowed: true }

        case "trade":
          const trades = await database.getTradesByUserId(userId)
          const trade = trades.find((t) => t._id?.toString() === resourceId)
          if (!trade) {
            return { allowed: false, reason: "Trade not found or access denied" }
          }
          return { allowed: true }

        default:
          return { allowed: false, reason: "Unknown resource type" }
      }
    } catch (error) {
      console.error("Resource access error:", error)
      return { allowed: false, reason: "Unable to verify resource access" }
    }
  }

  async isTrialActive(userId: string): Promise<boolean> {
    try {
      const subscription = await subscriptionManager.getUserSubscription(userId)
      if (!subscription || !subscription.trialEndsAt) {
        return false
      }
      return new Date() < subscription.trialEndsAt
    } catch (error) {
      console.error("Trial check error:", error)
      return false
    }
  }

  async getTrialDaysRemaining(userId: string): Promise<number> {
    try {
      const subscription = await subscriptionManager.getUserSubscription(userId)
      if (!subscription || !subscription.trialEndsAt) {
        return 0
      }

      const now = new Date()
      const trialEnd = subscription.trialEndsAt

      if (now >= trialEnd) {
        return 0
      }

      const diffTime = trialEnd.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      return Math.max(0, diffDays)
    } catch (error) {
      console.error("Trial days calculation error:", error)
      return 0
    }
  }

  async requiresUpgrade(
    userId: string,
    feature: string,
  ): Promise<{
    required: boolean
    currentPlan: string
    suggestedPlan: string
    message: string
  }> {
    try {
      const subscription = await subscriptionManager.getUserSubscription(userId)
      const currentPlan = subscription?.plan || "free"

      const hasAccess = await subscriptionManager.hasAccess(userId, feature as any)

      if (hasAccess) {
        return {
          required: false,
          currentPlan,
          suggestedPlan: currentPlan,
          message: "Feature is available with your current plan",
        }
      }

      const suggestedPlan = this.findMinimumPlanForFeature(feature)

      return {
        required: true,
        currentPlan,
        suggestedPlan,
        message: `Upgrade to ${suggestedPlan} to access this feature`,
      }
    } catch (error) {
      console.error("Upgrade requirement check error:", error)
      return {
        required: true,
        currentPlan: "unknown",
        suggestedPlan: "pro",
        message: "Unable to verify feature access",
      }
    }
  }

  private findMinimumPlanForFeature(feature: string): string {
    const plans = Object.entries(SUBSCRIPTION_PLANS)

    for (const [planId, plan] of plans) {
      if (plan.features[feature as keyof typeof plan.features]) {
        return plan.name.toLowerCase()
      }
    }

    return "pro" // Default fallback
  }

  async validateBotOperation(userId: string, botId: string, operation: string): Promise<AccessResult> {
    try {
      // Check if user owns the bot
      const resourceAccess = await this.checkResourceAccess(userId, "bot", botId)
      if (!resourceAccess.allowed) {
        return resourceAccess
      }

      // Check operation-specific permissions
      switch (operation) {
        case "start":
        case "pause":
        case "stop":
          return { allowed: true }

        case "modify":
          return await this.canAccessFeature(userId, "advancedStrategies")

        default:
          return { allowed: false, reason: "Unknown operation" }
      }
    } catch (error) {
      console.error("Bot operation validation error:", error)
      return { allowed: false, reason: "Unable to validate bot operation" }
    }
  }

  async getAccessSummary(userId: string): Promise<{
    subscription: any
    limits: any
    features: { [key: string]: boolean }
    trial: { active: boolean; daysRemaining: number }
  }> {
    try {
      const subscription = await subscriptionManager.getUserSubscription(userId)
      const limits = await this.getUserLimits(userId)
      const trialActive = await this.isTrialActive(userId)
      const trialDaysRemaining = await this.getTrialDaysRemaining(userId)

      const features = {
        apiAccess: await subscriptionManager.hasAccess(userId, "apiAccess"),
        advancedStrategies: await subscriptionManager.hasAccess(userId, "advancedStrategies"),
        webhooks: await subscriptionManager.hasAccess(userId, "webhooks"),
        prioritySupport: await subscriptionManager.hasAccess(userId, "prioritySupport"),
      }

      return {
        subscription,
        limits,
        features,
        trial: {
          active: trialActive,
          daysRemaining: trialDaysRemaining,
        },
      }
    } catch (error) {
      console.error("Access summary error:", error)
      throw error
    }
  }
}

export const accessControl = new AccessControl()

// Middleware for checking feature access
export function requireFeatureAccess(feature: string) {
  return (handler: any) => async (req: any, user: any) => {
    const access = await accessControl.canAccessFeature(user.id, feature)

    if (!access.allowed) {
      return new Response(
        JSON.stringify({
          error: "Feature access denied",
          reason: access.reason,
          upgradeRequired: access.upgradeRequired,
          suggestedPlan: access.suggestedPlan,
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    return handler(req, user)
  }
}

// Middleware for checking resource ownership
export function requireResourceAccess(resourceType: string, resourceIdParam = "id") {
  return (handler: any) => async (req: any, user: any) => {
    const resourceId = req.params?.[resourceIdParam] || req.query?.[resourceIdParam]

    if (!resourceId) {
      return new Response(JSON.stringify({ error: "Resource ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const access = await accessControl.checkResourceAccess(user.id, resourceType, resourceId)

    if (!access.allowed) {
      return new Response(JSON.stringify({ error: "Resource access denied", reason: access.reason }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      })
    }

    return handler(req, user)
  }
}
