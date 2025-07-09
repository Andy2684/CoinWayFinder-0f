import { database } from "./database"
import { subscriptionManager } from "./subscription-manager"

interface AccessRule {
  feature: string
  requiredPlans: string[]
  requiredPermissions?: string[]
  customCheck?: (userId: string, context?: any) => Promise<boolean>
}

interface AccessContext {
  userId: string
  userPlan?: string
  userPermissions?: string[]
  isAdmin?: boolean
}

class AccessControl {
  private rules: Map<string, AccessRule> = new Map()

  constructor() {
    this.initializeRules()
  }

  private initializeRules(): void {
    const rules: AccessRule[] = [
      {
        feature: "create_bot",
        requiredPlans: ["starter", "pro", "enterprise"],
        customCheck: async (userId: string) => {
          const stats = await database.getUserStats(userId)
          const subscription = await subscriptionManager.getUserSubscription(userId)
          const plan = subscriptionManager.getPlan(subscription?.plan || "free")

          if (!plan) return false

          // Check bot limit
          if (plan.limits.bots !== -1 && stats.totalBots >= plan.limits.bots) {
            return false
          }

          return true
        },
      },
      {
        feature: "advanced_strategies",
        requiredPlans: ["pro", "enterprise"],
      },
      {
        feature: "api_access",
        requiredPlans: ["pro", "enterprise"],
      },
      {
        feature: "telegram_notifications",
        requiredPlans: ["starter", "pro", "enterprise"],
      },
      {
        feature: "priority_support",
        requiredPlans: ["starter", "pro", "enterprise"],
      },
      {
        feature: "custom_indicators",
        requiredPlans: ["pro", "enterprise"],
      },
      {
        feature: "white_label",
        requiredPlans: ["enterprise"],
      },
      {
        feature: "unlimited_bots",
        requiredPlans: ["pro", "enterprise"],
      },
      {
        feature: "advanced_analytics",
        requiredPlans: ["pro", "enterprise"],
      },
      {
        feature: "multiple_exchanges",
        requiredPlans: ["starter", "pro", "enterprise"],
        customCheck: async (userId: string) => {
          const subscription = await subscriptionManager.getUserSubscription(userId)
          const plan = subscriptionManager.getPlan(subscription?.plan || "free")

          if (!plan) return false

          // Free plan only allows 1 exchange
          return plan.limits.exchanges !== 1
        },
      },
    ]

    rules.forEach((rule) => this.rules.set(rule.feature, rule))
  }

  async checkAccess(
    feature: string,
    context: AccessContext,
  ): Promise<{
    allowed: boolean
    reason?: string
    upgradeRequired?: boolean
    requiredPlans?: string[]
  }> {
    // Admin always has access
    if (context.isAdmin) {
      return { allowed: true }
    }

    const rule = this.rules.get(feature)
    if (!rule) {
      // If no rule exists, allow access
      return { allowed: true }
    }

    // Get user subscription
    const subscription = await subscriptionManager.getUserSubscription(context.userId)
    const currentPlan = subscription?.plan || "free"

    // Check if subscription is active
    if (subscription && subscription.status !== "active" && subscription.status !== "trial") {
      return {
        allowed: false,
        reason: "Subscription expired or cancelled",
        upgradeRequired: true,
        requiredPlans: rule.requiredPlans,
      }
    }

    // Check if current plan is in required plans
    if (!rule.requiredPlans.includes(currentPlan)) {
      return {
        allowed: false,
        reason: `Feature requires ${rule.requiredPlans.join(" or ")} plan`,
        upgradeRequired: true,
        requiredPlans: rule.requiredPlans,
      }
    }

    // Check permissions if required
    if (rule.requiredPermissions && context.userPermissions) {
      const hasPermission = rule.requiredPermissions.some((permission) => context.userPermissions!.includes(permission))

      if (!hasPermission) {
        return {
          allowed: false,
          reason: `Missing required permissions: ${rule.requiredPermissions.join(", ")}`,
          upgradeRequired: false,
        }
      }
    }

    // Run custom check if provided
    if (rule.customCheck) {
      const customResult = await rule.customCheck(context.userId)
      if (!customResult) {
        return {
          allowed: false,
          reason: "Custom access check failed",
          upgradeRequired: true,
          requiredPlans: rule.requiredPlans,
        }
      }
    }

    return { allowed: true }
  }

  async getUserFeatures(
    userId: string,
    isAdmin = false,
  ): Promise<{
    features: string[]
    plan: string
    limits: Record<string, number>
  }> {
    if (isAdmin) {
      return {
        features: Array.from(this.rules.keys()),
        plan: "admin",
        limits: {},
      }
    }

    const subscription = await subscriptionManager.getUserSubscription(userId)
    const plan = subscriptionManager.getPlan(subscription?.plan || "free")

    if (!plan) {
      return { features: [], plan: "free", limits: {} }
    }

    const availableFeatures: string[] = []

    for (const [feature, rule] of this.rules.entries()) {
      const access = await this.checkAccess(feature, { userId })
      if (access.allowed) {
        availableFeatures.push(feature)
      }
    }

    return {
      features: availableFeatures,
      plan: plan.id,
      limits: plan.limits,
    }
  }

  async canCreateBot(userId: string): Promise<{
    allowed: boolean
    reason?: string
    currentCount?: number
    limit?: number
  }> {
    const stats = await database.getUserStats(userId)
    const subscription = await subscriptionManager.getUserSubscription(userId)
    const plan = subscriptionManager.getPlan(subscription?.plan || "free")

    if (!plan) {
      return { allowed: false, reason: "Invalid subscription plan" }
    }

    // Check subscription status
    if (subscription && subscription.status !== "active" && subscription.status !== "trial") {
      return { allowed: false, reason: "Subscription expired or cancelled" }
    }

    // Check bot limit
    if (plan.limits.bots !== -1 && stats.totalBots >= plan.limits.bots) {
      return {
        allowed: false,
        reason: `Bot limit reached (${plan.limits.bots})`,
        currentCount: stats.totalBots,
        limit: plan.limits.bots,
      }
    }

    return {
      allowed: true,
      currentCount: stats.totalBots,
      limit: plan.limits.bots === -1 ? undefined : plan.limits.bots,
    }
  }

  async canUseExchange(
    userId: string,
    exchangeCount: number,
  ): Promise<{
    allowed: boolean
    reason?: string
    limit?: number
  }> {
    const subscription = await subscriptionManager.getUserSubscription(userId)
    const plan = subscriptionManager.getPlan(subscription?.plan || "free")

    if (!plan) {
      return { allowed: false, reason: "Invalid subscription plan" }
    }

    if (plan.limits.exchanges !== -1 && exchangeCount > plan.limits.exchanges) {
      return {
        allowed: false,
        reason: `Exchange limit reached (${plan.limits.exchanges})`,
        limit: plan.limits.exchanges,
      }
    }

    return {
      allowed: true,
      limit: plan.limits.exchanges === -1 ? undefined : plan.limits.exchanges,
    }
  }

  getFeatureList(): { feature: string; requiredPlans: string[] }[] {
    return Array.from(this.rules.entries()).map(([feature, rule]) => ({
      feature,
      requiredPlans: rule.requiredPlans,
    }))
  }
}

export const accessControl = new AccessControl()

// Helper functions for common access checks
export async function requireFeatureAccess(feature: string, userId: string, isAdmin = false): Promise<void> {
  const result = await accessControl.checkAccess(feature, { userId, isAdmin })

  if (!result.allowed) {
    const error = new Error(result.reason || "Access denied")
    ;(error as any).upgradeRequired = result.upgradeRequired
    ;(error as any).requiredPlans = result.requiredPlans
    throw error
  }
}

export async function checkBotCreationAccess(userId: string): Promise<{
  allowed: boolean
  reason?: string
  currentCount?: number
  limit?: number
}> {
  return accessControl.canCreateBot(userId)
}

export async function getUserAccessLevel(
  userId: string,
  isAdmin = false,
): Promise<{
  features: string[]
  plan: string
  limits: Record<string, number>
}> {
  return accessControl.getUserFeatures(userId, isAdmin)
}
