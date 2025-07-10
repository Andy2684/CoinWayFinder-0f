import { apiKeyManager } from "./api-key-manager"
import { authService } from "./auth"

export interface Permission {
  resource: string
  action: string
  conditions?: Record<string, any>
}

export interface Role {
  name: string
  permissions: Permission[]
  subscriptionRequired?: string[]
}

export interface AccessContext {
  userId?: string
  userRole?: string
  subscription?: {
    plan: string
    status: string
    features: string[]
  }
  apiKey?: {
    id: string
    permissions: string[]
  }
}

export class AccessControl {
  private roles: Map<string, Role> = new Map()

  constructor() {
    this.initializeRoles()
  }

  private initializeRoles() {
    // Define system roles
    this.roles.set("admin", {
      name: "admin",
      permissions: [
        { resource: "*", action: "*" }, // Admin has all permissions
      ],
    })

    this.roles.set("user", {
      name: "user",
      permissions: [
        { resource: "profile", action: "read" },
        { resource: "profile", action: "update" },
        { resource: "bots", action: "read" },
        { resource: "bots", action: "create", conditions: { limit: 1 } },
        { resource: "trades", action: "read" },
        { resource: "api-keys", action: "read" },
        { resource: "api-keys", action: "create", conditions: { limit: 2 } },
      ],
      subscriptionRequired: ["free"],
    })

    this.roles.set("starter", {
      name: "starter",
      permissions: [
        { resource: "profile", action: "*" },
        { resource: "bots", action: "*", conditions: { limit: 3 } },
        { resource: "trades", action: "*" },
        { resource: "api-keys", action: "*", conditions: { limit: 5 } },
        { resource: "integrations", action: "read" },
        { resource: "integrations", action: "create", conditions: { limit: 2 } },
        { resource: "news", action: "read" },
        { resource: "alerts", action: "*", conditions: { limit: 10 } },
      ],
      subscriptionRequired: ["starter", "pro", "enterprise"],
    })

    this.roles.set("pro", {
      name: "pro",
      permissions: [
        { resource: "profile", action: "*" },
        { resource: "bots", action: "*", conditions: { limit: 10 } },
        { resource: "trades", action: "*" },
        { resource: "api-keys", action: "*", conditions: { limit: 10 } },
        { resource: "integrations", action: "*" },
        { resource: "news", action: "*" },
        { resource: "alerts", action: "*", conditions: { limit: 50 } },
        { resource: "analytics", action: "*" },
        { resource: "backtesting", action: "*" },
        { resource: "ai-signals", action: "read" },
      ],
      subscriptionRequired: ["pro", "enterprise"],
    })

    this.roles.set("enterprise", {
      name: "enterprise",
      permissions: [
        { resource: "*", action: "*" }, // Enterprise has all user permissions
      ],
      subscriptionRequired: ["enterprise"],
    })
  }

  async checkPermission(
    context: AccessContext,
    resource: string,
    action: string,
    resourceData?: any,
  ): Promise<{ allowed: boolean; reason?: string }> {
    try {
      // Admin always has access
      if (context.userRole === "admin") {
        return { allowed: true }
      }

      // Get user role based on subscription
      const userRole = this.getUserRole(context)
      const role = this.roles.get(userRole)

      if (!role) {
        return { allowed: false, reason: "Invalid user role" }
      }

      // Check subscription requirements
      if (role.subscriptionRequired && context.subscription) {
        if (!role.subscriptionRequired.includes(context.subscription.plan)) {
          return { allowed: false, reason: "Subscription upgrade required" }
        }

        if (context.subscription.status !== "active") {
          return { allowed: false, reason: "Active subscription required" }
        }
      }

      // Check permissions
      for (const permission of role.permissions) {
        if (this.matchesPermission(permission, resource, action)) {
          // Check conditions if any
          if (permission.conditions) {
            const conditionCheck = await this.checkConditions(permission.conditions, context, resource, resourceData)
            if (!conditionCheck.allowed) {
              return conditionCheck
            }
          }
          return { allowed: true }
        }
      }

      return { allowed: false, reason: "Permission denied" }
    } catch (error) {
      console.error("Error checking permission:", error)
      return { allowed: false, reason: "Permission check failed" }
    }
  }

  private getUserRole(context: AccessContext): string {
    if (context.userRole === "admin") return "admin"

    if (context.subscription) {
      switch (context.subscription.plan) {
        case "enterprise":
          return "enterprise"
        case "pro":
          return "pro"
        case "starter":
          return "starter"
        default:
          return "user"
      }
    }

    return "user"
  }

  private matchesPermission(permission: Permission, resource: string, action: string): boolean {
    const resourceMatch = permission.resource === "*" || permission.resource === resource
    const actionMatch = permission.action === "*" || permission.action === action
    return resourceMatch && actionMatch
  }

  private async checkConditions(
    conditions: Record<string, any>,
    context: AccessContext,
    resource: string,
    resourceData?: any,
  ): Promise<{ allowed: boolean; reason?: string }> {
    // Check limit conditions
    if (conditions.limit !== undefined) {
      const currentCount = await this.getCurrentResourceCount(context.userId!, resource)
      if (currentCount >= conditions.limit) {
        return { allowed: false, reason: `${resource} limit exceeded (${conditions.limit})` }
      }
    }

    // Check ownership conditions
    if (conditions.owner && resourceData) {
      if (resourceData.userId !== context.userId) {
        return { allowed: false, reason: "Resource access denied - not owner" }
      }
    }

    // Check feature conditions
    if (conditions.features && context.subscription) {
      for (const feature of conditions.features) {
        if (!context.subscription.features.includes(feature)) {
          return { allowed: false, reason: `Feature not available: ${feature}` }
        }
      }
    }

    return { allowed: true }
  }

  private async getCurrentResourceCount(userId: string, resource: string): Promise<number> {
    // This would query the database to get current resource count
    // For now, return mock data
    const mockCounts: Record<string, number> = {
      bots: 2,
      "api-keys": 1,
      integrations: 1,
      alerts: 5,
    }

    return mockCounts[resource] || 0
  }

  async checkApiKeyPermission(
    apiKey: string,
    resource: string,
    action: string,
  ): Promise<{ allowed: boolean; reason?: string; keyId?: string }> {
    try {
      const keyData = await apiKeyManager.validateApiKey(apiKey)
      if (!keyData) {
        return { allowed: false, reason: "Invalid API key" }
      }

      // Check rate limits
      const rateLimitCheck = await apiKeyManager.checkRateLimit(keyData)
      if (!rateLimitCheck.allowed) {
        return { allowed: false, reason: "Rate limit exceeded" }
      }

      // Check permissions
      const permissionString = `${resource}:${action}`
      if (keyData.permissions.includes("*") || keyData.permissions.includes(permissionString)) {
        return { allowed: true, keyId: keyData.id }
      }

      return { allowed: false, reason: "API key lacks required permissions" }
    } catch (error) {
      console.error("Error checking API key permission:", error)
      return { allowed: false, reason: "Permission check failed" }
    }
  }

  async getAccessContext(request: Request): Promise<AccessContext> {
    const context: AccessContext = {}

    try {
      // Check for API key in headers
      const apiKey = request.headers.get("x-api-key") || request.headers.get("authorization")?.replace("Bearer ", "")
      if (apiKey) {
        const keyData = await apiKeyManager.validateApiKey(apiKey)
        if (keyData) {
          context.apiKey = {
            id: keyData.id,
            permissions: keyData.permissions,
          }
          // Get user context from API key
          const user = await authService.getUserById(keyData.userId)
          if (user) {
            context.userId = user.id
            context.userRole = user.role
            context.subscription = user.subscription
          }
        }
      } else {
        // Check for user session
        const user = await authService.getCurrentUser(request)
        if (user) {
          context.userId = user.id
          context.userRole = user.role
          context.subscription = user.subscription
        }
      }
    } catch (error) {
      console.error("Error getting access context:", error)
    }

    return context
  }

  getRolePermissions(roleName: string): Permission[] {
    const role = this.roles.get(roleName)
    return role ? role.permissions : []
  }

  getAvailableRoles(): string[] {
    return Array.from(this.roles.keys())
  }

  getSubscriptionFeatures(plan: string): string[] {
    const features: Record<string, string[]> = {
      free: ["basic-trading", "1-bot", "basic-alerts"],
      starter: ["advanced-trading", "3-bots", "email-alerts", "basic-analytics"],
      pro: ["premium-trading", "10-bots", "sms-alerts", "advanced-analytics", "backtesting", "ai-signals"],
      enterprise: ["unlimited-bots", "priority-support", "custom-strategies", "api-access", "white-label"],
    }

    return features[plan] || []
  }
}

export const accessControl = new AccessControl()
