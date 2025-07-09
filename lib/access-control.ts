import { subscriptionManager } from "./subscription-manager"

export interface AccessControlContext {
  userId: string
  isAdmin?: boolean
  subscription?: {
    plan: string
    status: string
  }
}

export class AccessControl {
  static async checkFeatureAccess(
    context: AccessControlContext,
    feature: string,
  ): Promise<{ allowed: boolean; reason?: string }> {
    // Admin bypass
    if (context.isAdmin) {
      return { allowed: true }
    }

    try {
      const hasAccess = await subscriptionManager.checkAccess(context.userId, feature)

      if (!hasAccess) {
        return {
          allowed: false,
          reason: `Feature '${feature}' requires a higher subscription plan`,
        }
      }

      return { allowed: true }
    } catch (error) {
      console.error("Access control error:", error)
      return {
        allowed: false,
        reason: "Unable to verify access permissions",
      }
    }
  }

  static async checkBotLimit(
    context: AccessControlContext,
  ): Promise<{ allowed: boolean; reason?: string; remaining?: number }> {
    if (context.isAdmin) {
      return { allowed: true, remaining: -1 }
    }

    try {
      const limits = await subscriptionManager.getRemainingLimits(context.userId)

      if (limits.bots.remaining === 0) {
        return {
          allowed: false,
          reason: "Bot limit reached. Upgrade your plan to create more bots.",
          remaining: 0,
        }
      }

      return {
        allowed: true,
        remaining: limits.bots.remaining,
      }
    } catch (error) {
      console.error("Bot limit check error:", error)
      return {
        allowed: false,
        reason: "Unable to verify bot limits",
      }
    }
  }

  static async checkAPICallLimit(
    context: AccessControlContext,
  ): Promise<{ allowed: boolean; reason?: string; remaining?: number }> {
    if (context.isAdmin) {
      return { allowed: true, remaining: -1 }
    }

    try {
      const limits = await subscriptionManager.getRemainingLimits(context.userId)

      if (limits.apiCalls.remaining === 0) {
        return {
          allowed: false,
          reason: "API call limit reached. Upgrade your plan for more API calls.",
          remaining: 0,
        }
      }

      return {
        allowed: true,
        remaining: limits.apiCalls.remaining,
      }
    } catch (error) {
      console.error("API call limit check error:", error)
      return {
        allowed: false,
        reason: "Unable to verify API call limits",
      }
    }
  }

  static async checkResourceAccess(
    context: AccessControlContext,
    resourceType: "bot" | "trade" | "portfolio",
    resourceId: string,
  ): Promise<{ allowed: boolean; reason?: string }> {
    if (context.isAdmin) {
      return { allowed: true }
    }

    try {
      // Check if user owns the resource
      // This would typically involve database queries
      // For now, we'll implement basic ownership check

      switch (resourceType) {
        case "bot":
          // Check if user owns the bot
          // const bot = await database.getBotById(resourceId)
          // return { allowed: bot?.userId === context.userId }
          return { allowed: true } // Mock implementation

        case "trade":
          // Check if user owns the trade
          return { allowed: true } // Mock implementation

        case "portfolio":
          // Check if user owns the portfolio
          return { allowed: true } // Mock implementation

        default:
          return {
            allowed: false,
            reason: "Unknown resource type",
          }
      }
    } catch (error) {
      console.error("Resource access check error:", error)
      return {
        allowed: false,
        reason: "Unable to verify resource access",
      }
    }
  }

  static async getAccessSummary(context: AccessControlContext): Promise<{
    features: Record<string, boolean>
    limits: {
      bots: { used: number; limit: number; remaining: number }
      apiCalls: { used: number; limit: number; remaining: number }
    }
    subscription: {
      plan: string
      status: string
      canUpgrade: boolean
    }
  }> {
    try {
      if (context.isAdmin) {
        return {
          features: {
            unlimited_bots: true,
            advanced_strategies: true,
            api_access: true,
            priority_support: true,
            custom_strategies: true,
          },
          limits: {
            bots: { used: 0, limit: -1, remaining: -1 },
            apiCalls: { used: 0, limit: -1, remaining: -1 },
          },
          subscription: {
            plan: "admin",
            status: "active",
            canUpgrade: false,
          },
        }
      }

      const [subscriptionStatus, limits] = await Promise.all([
        subscriptionManager.getSubscriptionStatus(context.userId),
        subscriptionManager.getRemainingLimits(context.userId),
      ])

      const features = {
        unlimited_bots: await subscriptionManager.checkAccess(context.userId, "unlimited_bots"),
        advanced_strategies: await subscriptionManager.checkAccess(context.userId, "advanced_strategies"),
        api_access: await subscriptionManager.checkAccess(context.userId, "api_access"),
        priority_support: await subscriptionManager.checkAccess(context.userId, "priority_support"),
        custom_strategies: await subscriptionManager.checkAccess(context.userId, "custom_strategies"),
      }

      return {
        features,
        limits,
        subscription: {
          plan: subscriptionStatus.plan,
          status: subscriptionStatus.status,
          canUpgrade: subscriptionStatus.canUpgrade,
        },
      }
    } catch (error) {
      console.error("Get access summary error:", error)
      return {
        features: {},
        limits: {
          bots: { used: 0, limit: 1, remaining: 1 },
          apiCalls: { used: 0, limit: 100, remaining: 100 },
        },
        subscription: {
          plan: "free",
          status: "inactive",
          canUpgrade: true,
        },
      }
    }
  }
}

export const accessControl = new AccessControl()
