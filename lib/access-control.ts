import { subscriptionManager, SUBSCRIPTION_PLANS } from "./subscription-manager"
import { database } from "./database"
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
  subscription?: {
    plan: string
    status: string
  }
  isAdmin?: boolean
  resourceId?: string
  resourceOwnerId?: string
}

export interface AccessResult {
  allowed: boolean
  reason?: string
  upgradeRequired?: boolean
  suggestedPlan?: string
}

export class AccessControl {
  private roles: Map<string, Role> = new Map()

  constructor() {
    this.initializeDefaultRoles()
  }

  private initializeDefaultRoles() {
    // Define default roles
    const roles: Role[] = [
      {
        name: "free",
        permissions: [
          { resource: "bot", action: "create", conditions: { maxCount: 1 } },
          { resource: "bot", action: "read", conditions: { ownResource: true } },
          { resource: "bot", action: "update", conditions: { ownResource: true } },
          { resource: "bot", action: "delete", conditions: { ownResource: true } },
          { resource: "trade", action: "read", conditions: { ownResource: true } },
          { resource: "profile", action: "read", conditions: { ownResource: true } },
          { resource: "profile", action: "update", conditions: { ownResource: true } },
        ],
      },
      {
        name: "starter",
        permissions: [
          { resource: "bot", action: "create", conditions: { maxCount: 5 } },
          { resource: "bot", action: "read", conditions: { ownResource: true } },
          { resource: "bot", action: "update", conditions: { ownResource: true } },
          { resource: "bot", action: "delete", conditions: { ownResource: true } },
          { resource: "trade", action: "read", conditions: { ownResource: true } },
          { resource: "trade", action: "create", conditions: { maxPerDay: 100 } },
          { resource: "api", action: "access", conditions: { rateLimit: 1000 } },
          { resource: "profile", action: "read", conditions: { ownResource: true } },
          { resource: "profile", action: "update", conditions: { ownResource: true } },
          { resource: "webhook", action: "create", conditions: { maxCount: 3 } },
        ],
        inherits: ["free"],
      },
      {
        name: "pro",
        permissions: [
          { resource: "bot", action: "create", conditions: { maxCount: 20 } },
          { resource: "bot", action: "read", conditions: { ownResource: true } },
          { resource: "bot", action: "update", conditions: { ownResource: true } },
          { resource: "bot", action: "delete", conditions: { ownResource: true } },
          { resource: "trade", action: "read", conditions: { ownResource: true } },
          { resource: "trade", action: "create", conditions: { maxPerDay: 1000 } },
          { resource: "api", action: "access", conditions: { rateLimit: 10000 } },
          { resource: "profile", action: "read", conditions: { ownResource: true } },
          { resource: "profile", action: "update", conditions: { ownResource: true } },
          { resource: "webhook", action: "create", conditions: { maxCount: 10 } },
          { resource: "strategy", action: "custom" },
          { resource: "analytics", action: "advanced" },
        ],
        inherits: ["starter"],
      },
      {
        name: "enterprise",
        permissions: [
          { resource: "bot", action: "create", conditions: { maxCount: -1 } },
          { resource: "bot", action: "read", conditions: { ownResource: true } },
          { resource: "bot", action: "update", conditions: { ownResource: true } },
          { resource: "bot", action: "delete", conditions: { ownResource: true } },
          { resource: "trade", action: "read", conditions: { ownResource: true } },
          { resource: "trade", action: "create", conditions: { maxPerDay: -1 } },
          { resource: "api", action: "access", conditions: { rateLimit: -1 } },
          { resource: "profile", action: "read", conditions: { ownResource: true } },
          { resource: "profile", action: "update", conditions: { ownResource: true } },
          { resource: "webhook", action: "create", conditions: { maxCount: -1 } },
          { resource: "strategy", action: "custom" },
          { resource: "analytics", action: "advanced" },
          { resource: "support", action: "priority" },
          { resource: "whitelabel", action: "access" },
        ],
        inherits: ["pro"],
      },
      {
        name: "admin",
        permissions: [{ resource: "*", action: "*" }],
      },
    ]

    roles.forEach((role) => {
      this.roles.set(role.name, role)
    })
  }

  private getAllPermissions(roleName: string): Permission[] {
    const role = this.roles.get(roleName)
    if (!role) return []

    let permissions = [...role.permissions]

    // Add inherited permissions
    if (role.inherits) {
      for (const inheritedRole of role.inherits) {
        permissions = [...permissions, ...this.getAllPermissions(inheritedRole)]
      }
    }

    return permissions
  }

  async checkAccess(context: AccessContext, resource: string, action: string): Promise<boolean> {
    try {
      // Admin always has access
      if (context.isAdmin) {
        return true
      }

      // Check if user is admin
      const admin = await adminManager.getCurrentAdmin()
      if (admin) {
        return true
      }

      // Get user's subscription plan
      const subscription = await subscriptionManager.getUserSubscription(context.userId)
      if (!subscription) {
        return false
      }

      const userRole = subscription.plan
      const permissions = this.getAllPermissions(userRole)

      // Check for wildcard permissions (admin)
      const wildcardPermission = permissions.find((p) => p.resource === "*" && p.action === "*")
      if (wildcardPermission) {
        return true
      }

      // Find matching permission
      const permission = permissions.find(
        (p) => (p.resource === resource || p.resource === "*") && (p.action === action || p.action === "*"),
      )

      if (!permission) {
        return false
      }

      // Check conditions
      if (permission.conditions) {
        return this.checkConditions(context, permission.conditions, resource, action)
      }

      return true
    } catch (error) {
      console.error("Error checking access:", error)
      return false
    }
  }

  private async checkConditions(
    context: AccessContext,
    conditions: Record<string, any>,
    resource: string,
    action: string,
  ): Promise<boolean> {
    // Check ownership condition
    if (conditions.ownResource && context.resourceOwnerId !== context.userId) {
      return false
    }

    // Check max count conditions
    if (conditions.maxCount !== undefined && conditions.maxCount !== -1) {
      const currentCount = await this.getCurrentResourceCount(context.userId, resource)
      if (currentCount >= conditions.maxCount) {
        return false
      }
    }

    // Check daily limits
    if (conditions.maxPerDay !== undefined && conditions.maxPerDay !== -1) {
      const todayCount = await this.getTodayResourceCount(context.userId, resource)
      if (todayCount >= conditions.maxPerDay) {
        return false
      }
    }

    // Check rate limits
    if (conditions.rateLimit !== undefined && conditions.rateLimit !== -1) {
      const currentRate = await this.getCurrentRateUsage(context.userId)
      if (currentRate >= conditions.rateLimit) {
        return false
      }
    }

    return true
  }

  private async getCurrentResourceCount(userId: string, resource: string): Promise<number> {
    // This would query the database for current resource count
    // For now, return mock data
    switch (resource) {
      case "bot":
        return 0 // Would query bots collection
      case "webhook":
        return 0 // Would query webhooks collection
      default:
        return 0
    }
  }

  private async getTodayResourceCount(userId: string, resource: string): Promise<number> {
    // This would query the database for today's resource count
    // For now, return mock data
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    switch (resource) {
      case "trade":
        return 0 // Would query trades collection for today
      default:
        return 0
    }
  }

  private async getCurrentRateUsage(userId: string): Promise<number> {
    // This would query the database for current API usage
    // For now, return mock data
    return 0
  }

  async canCreateBot(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const context: AccessContext = { userId }
    const allowed = await this.checkAccess(context, "bot", "create")

    if (!allowed) {
      const subscription = await subscriptionManager.getUserSubscription(userId)
      const plan = subscription?.plan || "free"

      return {
        allowed: false,
        reason: `Your ${plan} plan doesn't allow creating more bots. Please upgrade your subscription.`,
      }
    }

    return { allowed: true }
  }

  async canExecuteTrade(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const context: AccessContext = { userId }
    const allowed = await this.checkAccess(context, "trade", "create")

    if (!allowed) {
      const subscription = await subscriptionManager.getUserSubscription(userId)
      const plan = subscription?.plan || "free"

      return {
        allowed: false,
        reason: `Your ${plan} plan doesn't allow more trades today. Please upgrade your subscription.`,
      }
    }

    return { allowed: true }
  }

  async canAccessAPI(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const context: AccessContext = { userId }
    const allowed = await this.checkAccess(context, "api", "access")

    if (!allowed) {
      return {
        allowed: false,
        reason: "API access is not available on your current plan. Please upgrade to access the API.",
      }
    }

    return { allowed: true }
  }

  async canUseAdvancedStrategies(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const context: AccessContext = { userId }
    const allowed = await this.checkAccess(context, "strategy", "advanced")

    if (!allowed) {
      return {
        allowed: false,
        reason: "Advanced strategies are not available on your current plan. Please upgrade to Pro or Enterprise.",
      }
    }

    return { allowed: true }
  }

  async canCreateCustomStrategy(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const context: AccessContext = { userId }
    const allowed = await this.checkAccess(context, "strategy", "custom")

    if (!allowed) {
      return {
        allowed: false,
        reason: "Custom strategies are only available on Pro and Enterprise plans.",
      }
    }

    return { allowed: true }
  }

  async canAccessAdvancedAnalytics(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const context: AccessContext = { userId }
    const allowed = await this.checkAccess(context, "analytics", "advanced")

    if (!allowed) {
      return {
        allowed: false,
        reason: "Advanced analytics are only available on Pro and Enterprise plans.",
      }
    }

    return { allowed: true }
  }

  async canCreateWebhook(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const context: AccessContext = { userId }
    const allowed = await this.checkAccess(context, "webhook", "create")

    if (!allowed) {
      const subscription = await subscriptionManager.getUserSubscription(userId)
      const plan = subscription?.plan || "free"

      return {
        allowed: false,
        reason: `Your ${plan} plan doesn't allow creating more webhooks. Please upgrade your subscription.`,
      }
    }

    return { allowed: true }
  }

  async getUserPermissions(userId: string): Promise<Permission[]> {
    try {
      const subscription = await subscriptionManager.getUserSubscription(userId)
      if (!subscription) {
        return this.getAllPermissions("free")
      }

      return this.getAllPermissions(subscription.plan)
    } catch (error) {
      console.error("Error getting user permissions:", error)
      return []
    }
  }

  async getUserLimits(userId: string): Promise<Record<string, any>> {
    try {
      const subscription = await subscriptionManager.getUserSubscription(userId)
      if (!subscription) {
        return {}
      }

      const permissions = this.getAllPermissions(subscription.plan)
      const limits: Record<string, any> = {}

      permissions.forEach((permission) => {
        if (permission.conditions) {
          Object.entries(permission.conditions).forEach(([key, value]) => {
            if (!limits[permission.resource]) {
              limits[permission.resource] = {}
            }
            limits[permission.resource][key] = value
          })
        }
      })

      return limits
    } catch (error) {
      console.error("Error getting user limits:", error)
      return {}
    }
  }

  addRole(role: Role): void {
    this.roles.set(role.name, role)
  }

  removeRole(roleName: string): void {
    this.roles.delete(roleName)
  }

  getRole(roleName: string): Role | undefined {
    return this.roles.get(roleName)
  }

  getAllRoles(): Role[] {
    return Array.from(this.roles.values())
  }

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
