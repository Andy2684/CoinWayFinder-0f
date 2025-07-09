import { database } from "./database"
import { subscriptionManager } from "./subscription-manager"

export interface AccessCheck {
  hasAccess: boolean
  plan: string
  status: string
  message: string
  limits?: any
}

export class AccessControl {
  static async checkUserAccess(userId: string): Promise<AccessCheck> {
    try {
      const userSettings = await database.getUserSettings(userId)

      if (!userSettings) {
        return {
          hasAccess: false,
          plan: "free",
          status: "inactive",
          message: "No subscription found. Please upgrade to access premium features.",
        }
      }

      const isActive = userSettings.subscription.status === "active"
      const hasValidEndDate = new Date() < new Date(userSettings.subscription.endDate)
      const hasAccess = isActive && hasValidEndDate

      if (!hasAccess) {
        await database.stopUserBots(userId, "Subscription expired or inactive")
      }

      const limits = await subscriptionManager.getUserLimits(userId)

      return {
        hasAccess,
        plan: userSettings.subscription.plan,
        status: userSettings.subscription.status,
        message: hasAccess
          ? "Access granted"
          : "Subscription required. Please upgrade to continue using premium features.",
        limits,
      }
    } catch (error) {
      console.error("Access check failed:", error)
      return {
        hasAccess: false,
        plan: "free",
        status: "error",
        message: "Unable to verify access. Please try again.",
      }
    }
  }

  static async requireAccess(userId: string, feature?: string): Promise<boolean> {
    const access = await this.checkUserAccess(userId)

    if (!access.hasAccess) {
      throw new Error(`Access denied: ${access.message}`)
    }

    return true
  }

  static async canCreateBot(userId: string): Promise<{ allowed: boolean; message: string }> {
    const access = await this.checkUserAccess(userId)

    if (!access.hasAccess) {
      return {
        allowed: false,
        message: "Premium subscription required to create trading bots.",
      }
    }

    const canCreate = await subscriptionManager.canCreateBot(userId)

    return {
      allowed: canCreate,
      message: canCreate ? "Bot creation allowed" : "Bot limit reached for your current plan. Please upgrade.",
    }
  }

  static async canExecuteTrade(userId: string): Promise<{ allowed: boolean; message: string }> {
    const access = await this.checkUserAccess(userId)

    if (!access.hasAccess) {
      return {
        allowed: false,
        message: "Premium subscription required to execute trades.",
      }
    }

    const canTrade = await subscriptionManager.canExecuteTrade(userId)

    return {
      allowed: canTrade,
      message: canTrade ? "Trade execution allowed" : "Trade limit reached for your current plan. Please upgrade.",
    }
  }
}
