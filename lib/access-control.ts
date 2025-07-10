import { subscriptionManager } from "./subscription-manager"
import { adminManager } from "./admin"

export interface Permission {
  resource: string
  action: string
  conditions?: Record<string, any>
}

export interface Role {
  name: string
  permissions: Permission[]
  inherits?: string[]
}

export interface AccessContext {
  userId: string
  userRole?: string
  subscription?: any
  isAdmin?: boolean
  resourceId?: string
  resourceType?: string
}

export const PERMISSIONS = {
  // Bot permissions
  BOT_CREATE: "bot:create",
  BOT_READ: "bot:read",
  BOT_UPDATE: "bot:update",
  BOT_DELETE: "bot:delete",
  BOT_START: "bot:start",
  BOT_STOP: "bot:stop",

  // Trade permissions
  TRADE_READ: "trade:read",
  TRADE_EXECUTE: "trade:execute",
  TRADE_CANCEL: "trade:cancel",

  // API permissions
  API_READ: "api:read",
  API_WRITE: "api:write",
  API_ADMIN: "api:admin",

  // Subscription permissions
  SUBSCRIPTION_READ: "subscription:read",
  SUBSCRIPTION_MANAGE: "subscription:manage",

  // Admin permissions
  ADMIN_USERS: "admin:users",
  ADMIN_SYSTEM: "admin:system",
  ADMIN_ANALYTICS: "admin:analytics",

  // Feature permissions
  FEATURE_ADVANCED_STRATEGIES: "feature:advanced_strategies",
  FEATURE_BACKTESTING: "feature:backtesting",
  FEATURE_WEBHOOKS: "feature:webhooks",
  FEATURE_TELEGRAM: "feature:telegram",
  FEATURE_CUSTOM_INDICATORS: "feature:custom_indicators",
} as const

export const ROLES: Record<string, Role> = {
  free: {
    name: "free",
    permissions: [
      { resource: "bot", action: "create" },
      { resource: "bot", action: "read" },
      { resource: "bot", action: "update" },
      { resource: "bot", action: "delete" },
      { resource: "trade", action: "read" },
      { resource: "subscription", action: "read" },
    ],
  },
  starter: {
    name: "starter",
    permissions: [
      { resource: "bot", action: "create" },
      { resource: "bot", action: "read" },
      { resource: "bot", action: "update" },
      { resource: "bot", action: "delete" },
      { resource: "bot", action: "start" },
      { resource: "bot", action: "stop" },
      { resource: "trade", action: "read" },
      { resource: "trade", action: "execute" },
      { resource: "api", action: "read" },
      { resource: "feature", action: "advanced_strategies" },
      { resource: "feature", action: "backtesting" },
      { resource: "feature", action: "telegram" },
      { resource: "subscription", action: "read" },
      { resource: "subscription", action: "manage" },
    ],
  },
  pro: {
    name: "pro",
    permissions: [
      { resource: "bot", action: "create" },
      { resource: "bot", action: "read" },
      { resource: "bot", action: "update" },
      { resource: "bot", action: "delete" },
      { resource: "bot", action: "start" },
      { resource: "bot", action: "stop" },
      { resource: "trade", action: "read" },
      { resource: "trade", action: "execute" },
      { resource: "trade", action: "cancel" },
      { resource: "api", action: "read" },
      { resource: "api", action: "write" },
      { resource: "feature", action: "advanced_strategies" },
      { resource: "feature", action: "backtesting" },
      { resource: "feature", action: "webhooks" },
      { resource: "feature", action: "telegram" },
      { resource: "feature", action: "custom_indicators" },
      { resource: "subscription", action: "read" },
      { resource: "subscription", action: "manage" },
    ],
  },
  enterprise: {
    name: "enterprise",
    permissions: [
      { resource: "*", action: "*" }, // Full access except admin
      { resource: "subscription", action: "read" },
      { resource: "subscription", action: "manage" },
    ],
  },
  admin: {
    name: "admin",
    permissions: [
      { resource: "*", action: "*" }, // Full system access
      { resource: "admin", action: "users" },
      { resource: "admin", action: "system" },
      { resource: "admin", action: "analytics" },
    ],
  },
}

export class AccessControl {
  async checkPermission(context: AccessContext, resource: string, action: string): Promise<boolean> {
    try {
      // Admin bypass
      if (context.isAdmin) {
        const admin = await adminManager.getCurrentAdmin()
        return !!admin
      }

      // Get user subscription
      const subscription = context.subscription || (await subscriptionManager.getUserSubscription(context.userId))
      if (!subscription) {
        return false
      }

      // Check subscription status
      if (subscription.status !== "active" && subscription.status !== "trialing") {
        return false
      }

      // Get role permissions
      const role = ROLES[subscription.plan]
      if (!role) {
        return false
      }

      // Check if permission exists in role
      return this.hasPermission(role, resource, action)
    } catch (error) {
      console.error("Error checking permission:", error)
      return false
    }
  }

  private hasPermission(role: Role, resource: string, action: string): boolean {
    return role.permissions.some((permission) => {
      // Wildcard permissions
      if (permission.resource === "*" && permission.action === "*") {
        return true
      }

      if (permission.resource === "*" && permission.action === action) {
        return true
      }

      if (permission.resource === resource && permission.action === "*") {
        return true
      }

      // Exact match
      return permission.resource === resource && permission.action === action
    })
  }

  async checkResourceOwnership(context: AccessContext, resourceType: string, resourceId: string): Promise<boolean> {
    try {
      // Admin bypass
      if (context.isAdmin) {
        return true
      }

      // Check if user owns the resource
      switch (resourceType) {
        case "bot":
          return this.checkBotOwnership(context.userId, resourceId)
        case "trade":
          return this.checkTradeOwnership(context.userId, resourceId)
        case "apiKey":
          return this.checkAPIKeyOwnership(context.userId, resourceId)
        default:
          return false
      }
    } catch (error) {
      console.error("Error checking resource ownership:", error)
      return false
    }
  }

  private async checkBotOwnership(userId: string, botId: string): Promise<boolean> {
    // This would check the database for bot ownership
    // For now, we'll return true as a placeholder
    return true
  }

  private async checkTradeOwnership(userId: string, tradeId: string): Promise<boolean> {
    // This would check the database for trade ownership
    // For now, we'll return true as a placeholder
    return true
  }

  private async checkAPIKeyOwnership(userId: string, keyId: string): Promise<boolean> {
    // This would check the database for API key ownership
    // For now, we'll return true as a placeholder
    return true
  }

  async checkRateLimit(context: AccessContext, resource: string, action: string): Promise<boolean> {
    try {
      const subscription = context.subscription || (await subscriptionManager.getUserSubscription(context.userId))
      if (!subscription) {
        return false
      }

      // Check subscription-based rate limits
      switch (resource) {
        case "api":
          return subscriptionManager.canMakeApiCall(context.userId)
        case "trade":
          return subscriptionManager.canExecuteTrade(context.userId)
        case "bot":
          if (action === "create") {
            return subscriptionManager.canCreateBot(context.userId)
          }
          return true
        default:
          return true
      }
    } catch (error) {
      console.error("Error checking rate limit:", error)
      return false
    }
  }

  async checkFeatureAccess(context: AccessContext, feature: string): Promise<boolean> {
    try {
      // Admin bypass
      if (context.isAdmin) {
        return true
      }

      return subscriptionManager.checkAccess(context.userId, feature)
    } catch (error) {
      console.error("Error checking feature access:", error)
      return false
    }
  }

  async getUserPermissions(context: AccessContext): Promise<string[]> {
    try {
      // Admin gets all permissions
      if (context.isAdmin) {
        return Object.values(PERMISSIONS)
      }

      const subscription = context.subscription || (await subscriptionManager.getUserSubscription(context.userId))
      if (!subscription) {
        return []
      }

      const role = ROLES[subscription.plan]
      if (!role) {
        return []
      }

      return role.permissions.map((p) => `${p.resource}:${p.action}`)
    } catch (error) {
      console.error("Error getting user permissions:", error)
      return []
    }
  }

  async canAccessResource(
    context: AccessContext,
    resource: string,
    action: string,
    resourceId?: string,
  ): Promise<boolean> {
    try {
      // Check basic permission
      const hasPermission = await this.checkPermission(context, resource, action)
      if (!hasPermission) {
        return false
      }

      // Check resource ownership if resourceId provided
      if (resourceId && !context.isAdmin) {
        const ownsResource = await this.checkResourceOwnership(context, resource, resourceId)
        if (!ownsResource) {
          return false
        }
      }

      // Check rate limits
      const withinRateLimit = await this.checkRateLimit(context, resource, action)
      if (!withinRateLimit) {
        return false
      }

      return true
    } catch (error) {
      console.error("Error checking resource access:", error)
      return false
    }
  }

  async getAccessibleResources(context: AccessContext, resourceType: string): Promise<string[]> {
    try {
      // This would return a list of resource IDs the user can access
      // For now, we'll return an empty array as a placeholder
      return []
    } catch (error) {
      console.error("Error getting accessible resources:", error)
      return []
    }
  }

  async logAccessAttempt(
    context: AccessContext,
    resource: string,
    action: string,
    allowed: boolean,
    reason?: string,
  ): Promise<void> {
    try {
      // Log access attempt for audit purposes
      console.log(`Access attempt: ${context.userId} -> ${resource}:${action} = ${allowed ? "ALLOWED" : "DENIED"}`, {
        reason,
        timestamp: new Date(),
      })
    } catch (error) {
      console.error("Error logging access attempt:", error)
    }
  }
}

export const accessControl = new AccessControl()

// Utility functions for common access checks
export async function requirePermission(context: AccessContext, resource: string, action: string): Promise<void> {
  const hasAccess = await accessControl.canAccessResource(context, resource, action)
  if (!hasAccess) {
    throw new Error(`Access denied: ${resource}:${action}`)
  }
}

export async function requireFeature(context: AccessContext, feature: string): Promise<void> {
  const hasAccess = await accessControl.checkFeatureAccess(context, feature)
  if (!hasAccess) {
    throw new Error(`Feature not available: ${feature}`)
  }
}

export async function requireOwnership(
  context: AccessContext,
  resourceType: string,
  resourceId: string,
): Promise<void> {
  const ownsResource = await accessControl.checkResourceOwnership(context, resourceType, resourceId)
  if (!ownsResource && !context.isAdmin) {
    throw new Error(`Resource not found or access denied: ${resourceType}:${resourceId}`)
  }
}

export async function requireAdmin(context: AccessContext): Promise<void> {
  if (!context.isAdmin) {
    const admin = await adminManager.getCurrentAdmin()
    if (!admin) {
      throw new Error("Admin access required")
    }
  }
}
