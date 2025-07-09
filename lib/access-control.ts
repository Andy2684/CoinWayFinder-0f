import { subscriptionManager } from "./subscription-manager"
import type { AdminSession } from "./admin"

export interface AccessControlContext {
  userId: string
  adminSession?: AdminSession | null
  userPlan?: string
  isAdmin?: boolean
}

export class AccessControl {
  static async checkFeatureAccess(
    context: AccessControlContext,
    feature: string,
  ): Promise<{ hasAccess: boolean; reason?: string }> {
    // Admin always has access
    if (context.adminSession?.isAdmin) {
      return { hasAccess: true }
    }

    try {
      const hasAccess = await subscriptionManager.checkAccess(context.userId, feature)

      if (!hasAccess) {
        const subscriptionStatus = await subscriptionManager.getSubscriptionStatus(context.userId)
        return {
          hasAccess: false,
          reason: `This feature requires ${this.getRequiredPlanForFeature(feature)} plan. Current plan: ${subscriptionStatus.plan}`,
        }
      }

      return { hasAccess: true }
    } catch (error) {
      console.error("Access control error:", error)
      return { hasAccess: false, reason: "Unable to verify access" }
    }
  }

  static async checkResourceLimit(
    context: AccessControlContext,
    resource: "bots" | "apiCalls",
  ): Promise<{ canCreate: boolean; limit: number; used: number; remaining: number }> {
    // Admin bypass
    if (context.adminSession?.isAdmin) {
      return { canCreate: true, limit: -1, used: 0, remaining: -1 }
    }

    try {
      const limits = await subscriptionManager.getRemainingLimits(context.userId)
      const resourceLimit = limits[resource]

      return {
        canCreate: resourceLimit.remaining > 0 || resourceLimit.remaining === -1,
        limit: resourceLimit.limit,
        used: resourceLimit.used,
        remaining: resourceLimit.remaining,
      }
    } catch (error) {
      console.error("Resource limit check error:", error)
      return { canCreate: false, limit: 0, used: 0, remaining: 0 }
    }
  }

  static getRequiredPlanForFeature(feature: string): string {
    const featurePlanMap: Record<string, string> = {
      unlimited_bots: "Pro",
      advanced_strategies: "Starter",
      api_access: "Starter",
      priority_support: "Starter",
      custom_strategies: "Pro",
      white_label: "Enterprise",
      dedicated_support: "Enterprise",
    }

    return featurePlanMap[feature] || "Starter"
  }

  static async canPerformAction(
    context: AccessControlContext,
    action: string,
    resource?: string,
  ): Promise<{ allowed: boolean; reason?: string }> {
    // Admin can perform all actions
    if (context.adminSession?.isAdmin) {
      return { allowed: true }
    }

    // Check specific action permissions
    switch (action) {
      case "create_bot":
        const botLimit = await this.checkResourceLimit(context, "bots")
        return {
          allowed: botLimit.canCreate,
          reason: botLimit.canCreate ? undefined : `Bot limit reached (${botLimit.used}/${botLimit.limit})`,
        }

      case "use_api":
        const apiLimit = await this.checkResourceLimit(context, "apiCalls")
        return {
          allowed: apiLimit.canCreate,
          reason: apiLimit.canCreate ? undefined : `API call limit reached (${apiLimit.used}/${apiLimit.limit})`,
        }

      case "access_advanced_features":
        return await this.checkFeatureAccess(context, "advanced_strategies")

      case "priority_support":
        return await this.checkFeatureAccess(context, "priority_support")

      default:
        return { allowed: true }
    }
  }

  static async getAccessSummary(context: AccessControlContext): Promise<{
    plan: string
    features: Record<string, boolean>
    limits: {
      bots: { used: number; limit: number; remaining: number }
      apiCalls: { used: number; limit: number; remaining: number }
    }
    isAdmin: boolean
  }> {
    try {
      // Admin summary
      if (context.adminSession?.isAdmin) {
        return {
          plan: "Admin",
          features: {
            unlimited_bots: true,
            advanced_strategies: true,
            api_access: true,
            priority_support: true,
            custom_strategies: true,
            white_label: true,
            dedicated_support: true,
          },
          limits: {
            bots: { used: 0, limit: -1, remaining: -1 },
            apiCalls: { used: 0, limit: -1, remaining: -1 },
          },
          isAdmin: true,
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
        white_label: false, // Enterprise only
        dedicated_support: subscriptionStatus.plan === "enterprise",
      }

      return {
        plan: subscriptionStatus.plan,
        features,
        limits,
        isAdmin: false,
      }
    } catch (error) {
      console.error("Access summary error:", error)
      return {
        plan: "free",
        features: {},
        limits: {
          bots: { used: 0, limit: 1, remaining: 1 },
          apiCalls: { used: 0, limit: 100, remaining: 100 },
        },
        isAdmin: false,
      }
    }
  }
}

export const accessControl = AccessControl
