import { subscriptionManager } from "./subscription-manager"

interface AccessRule {
  resource: string
  action: string
  requiredRole?: string
  requiredPlan?: string
  requiredPermission?: string
}

interface AccessContext {
  userId?: string
  userRole?: string
  userPlan?: string
  permissions?: string[]
  isAdmin?: boolean
}

class AccessControl {
  private rules: AccessRule[] = [
    // Bot management
    { resource: "bot", action: "create", requiredPlan: "starter" },
    { resource: "bot", action: "read", requiredPlan: "free" },
    { resource: "bot", action: "update", requiredPlan: "free" },
    { resource: "bot", action: "delete", requiredPlan: "free" },

    // Trading
    { resource: "trade", action: "execute", requiredPlan: "starter" },
    { resource: "trade", action: "read", requiredPlan: "free" },

    // Analytics
    { resource: "analytics", action: "basic", requiredPlan: "free" },
    { resource: "analytics", action: "advanced", requiredPlan: "pro" },

    // API access
    { resource: "api", action: "read", requiredPlan: "starter" },
    { resource: "api", action: "write", requiredPlan: "pro" },

    // Admin
    { resource: "admin", action: "*", requiredRole: "admin" },

    // Webhooks
    { resource: "webhook", action: "*", requiredPlan: "pro" },

    // Custom strategies
    { resource: "strategy", action: "custom", requiredPlan: "pro" },
    { resource: "strategy", action: "basic", requiredPlan: "free" },
  ]

  async checkAccess(resource: string, action: string, context: AccessContext): Promise<boolean> {
    try {
      // Admin bypass
      if (context.isAdmin) {
        return true
      }

      // Find applicable rule
      const rule = this.rules.find((r) => r.resource === resource && (r.action === action || r.action === "*"))

      if (!rule) {
        // No rule found, default to deny
        return false
      }

      // Check role requirement
      if (rule.requiredRole && context.userRole !== rule.requiredRole) {
        return false
      }

      // Check plan requirement
      if (rule.requiredPlan && context.userId) {
        const hasAccess = await subscriptionManager.checkAccess(context.userId, `${resource}_${action}`)
        if (!hasAccess) {
          return false
        }
      }

      // Check permission requirement
      if (rule.requiredPermission && context.permissions) {
        if (!context.permissions.includes(rule.requiredPermission)) {
          return false
        }
      }

      return true
    } catch (error) {
      console.error("Access check error:", error)
      return false
    }
  }

  async getUserContext(userId?: string, isAdmin?: boolean): Promise<AccessContext> {
    try {
      if (isAdmin) {
        return {
          userId,
          userRole: "admin",
          userPlan: "enterprise",
          permissions: ["*"],
          isAdmin: true,
        }
      }

      if (!userId) {
        return {
          userRole: "guest",
          userPlan: "free",
          permissions: [],
        }
      }

      const subscription = await subscriptionManager.getSubscriptionStatus(userId)

      return {
        userId,
        userRole: "user",
        userPlan: subscription.plan,
        permissions: ["read", "write"], // Would be fetched from user settings
        isAdmin: false,
      }
    } catch (error) {
      console.error("Get user context error:", error)
      return {
        userRole: "guest",
        userPlan: "free",
        permissions: [],
      }
    }
  }

  async requireAccess(resource: string, action: string, userId?: string, isAdmin?: boolean): Promise<void> {
    const context = await this.getUserContext(userId, isAdmin)
    const hasAccess = await this.checkAccess(resource, action, context)

    if (!hasAccess) {
      throw new Error(`Access denied: ${action} on ${resource}`)
    }
  }

  async canCreateBot(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    try {
      const context = await this.getUserContext(userId)
      const hasAccess = await this.checkAccess("bot", "create", context)

      if (!hasAccess) {
        return {
          allowed: false,
          reason: "Upgrade your plan to create more bots",
        }
      }

      // Check bot limits
      return await subscriptionManager.canCreateBot(userId)
    } catch (error) {
      console.error("Can create bot check error:", error)
      return {
        allowed: false,
        reason: "Failed to check bot creation permissions",
      }
    }
  }

  async canUseFeature(userId: string, feature: string): Promise<boolean> {
    try {
      const context = await this.getUserContext(userId)

      switch (feature) {
        case "advanced_analytics":
          return this.checkAccess("analytics", "advanced", context)
        case "custom_strategies":
          return this.checkAccess("strategy", "custom", context)
        case "webhooks":
          return this.checkAccess("webhook", "*", context)
        case "api_access":
          return this.checkAccess("api", "read", context)
        default:
          return false
      }
    } catch (error) {
      console.error("Can use feature check error:", error)
      return false
    }
  }

  addRule(rule: AccessRule): void {
    this.rules.push(rule)
  }

  removeRule(resource: string, action: string): void {
    this.rules = this.rules.filter((r) => !(r.resource === resource && r.action === action))
  }

  getRules(): AccessRule[] {
    return [...this.rules]
  }
}

export const accessControl = new AccessControl()

// Convenience functions
export async function requireAuth(userId?: string): Promise<void> {
  if (!userId) {
    throw new Error("Authentication required")
  }
}

export async function requireAdmin(isAdmin?: boolean): Promise<void> {
  if (!isAdmin) {
    throw new Error("Admin access required")
  }
}

export async function requirePlan(userId: string, requiredPlan: string): Promise<void> {
  const subscription = await subscriptionManager.getSubscriptionStatus(userId)
  const planHierarchy = ["free", "starter", "pro", "enterprise"]
  const userPlanIndex = planHierarchy.indexOf(subscription.plan)
  const requiredPlanIndex = planHierarchy.indexOf(requiredPlan)

  if (userPlanIndex < requiredPlanIndex) {
    throw new Error(`${requiredPlan} plan required`)
  }
}
