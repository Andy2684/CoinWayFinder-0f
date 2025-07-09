export interface AccessLevel {
  name: string
  features: string[]
  limits: {
    maxBots: number
    maxAPIKeys: number
    maxRequestsPerMinute: number
    maxRequestsPerDay: number
  }
}

export const ACCESS_LEVELS: Record<string, AccessLevel> = {
  free: {
    name: "Free",
    features: ["basic_dashboard", "market_data", "news_feed"],
    limits: {
      maxBots: 1,
      maxAPIKeys: 1,
      maxRequestsPerMinute: 10,
      maxRequestsPerDay: 100,
    },
  },
  trial: {
    name: "Trial",
    features: [
      "basic_dashboard",
      "market_data",
      "news_feed",
      "bot_creation",
      "basic_strategies",
      "telegram_alerts",
      "api_access",
    ],
    limits: {
      maxBots: 3,
      maxAPIKeys: 2,
      maxRequestsPerMinute: 30,
      maxRequestsPerDay: 500,
    },
  },
  starter: {
    name: "Starter",
    features: [
      "basic_dashboard",
      "market_data",
      "news_feed",
      "bot_creation",
      "basic_strategies",
      "telegram_alerts",
      "api_access",
      "portfolio_tracking",
    ],
    limits: {
      maxBots: 5,
      maxAPIKeys: 3,
      maxRequestsPerMinute: 60,
      maxRequestsPerDay: 2000,
    },
  },
  pro: {
    name: "Pro",
    features: [
      "basic_dashboard",
      "market_data",
      "news_feed",
      "bot_creation",
      "basic_strategies",
      "advanced_strategies",
      "telegram_alerts",
      "api_access",
      "portfolio_tracking",
      "whale_alerts",
      "ai_signals",
      "backtesting",
    ],
    limits: {
      maxBots: 20,
      maxAPIKeys: 10,
      maxRequestsPerMinute: 200,
      maxRequestsPerDay: 10000,
    },
  },
  enterprise: {
    name: "Enterprise",
    features: [
      "basic_dashboard",
      "market_data",
      "news_feed",
      "bot_creation",
      "basic_strategies",
      "advanced_strategies",
      "custom_strategies",
      "telegram_alerts",
      "api_access",
      "portfolio_tracking",
      "whale_alerts",
      "ai_signals",
      "backtesting",
      "priority_support",
      "custom_integrations",
    ],
    limits: {
      maxBots: -1, // Unlimited
      maxAPIKeys: -1, // Unlimited
      maxRequestsPerMinute: 1000,
      maxRequestsPerDay: 50000,
    },
  },
}

export class AccessControl {
  static hasFeatureAccess(userPlan: string, feature: string): boolean {
    const accessLevel = ACCESS_LEVELS[userPlan]
    if (!accessLevel) {
      return false
    }

    return accessLevel.features.includes(feature)
  }

  static checkLimit(userPlan: string, limitType: keyof AccessLevel["limits"], currentValue: number): boolean {
    const accessLevel = ACCESS_LEVELS[userPlan]
    if (!accessLevel) {
      return false
    }

    const limit = accessLevel.limits[limitType]
    if (limit === -1) {
      return true // Unlimited
    }

    return currentValue < limit
  }

  static getFeatureList(userPlan: string): string[] {
    const accessLevel = ACCESS_LEVELS[userPlan]
    return accessLevel ? accessLevel.features : []
  }

  static getLimits(userPlan: string): AccessLevel["limits"] | null {
    const accessLevel = ACCESS_LEVELS[userPlan]
    return accessLevel ? accessLevel.limits : null
  }

  static canUpgrade(currentPlan: string, targetPlan: string): boolean {
    const planHierarchy = ["free", "trial", "starter", "pro", "enterprise"]
    const currentIndex = planHierarchy.indexOf(currentPlan)
    const targetIndex = planHierarchy.indexOf(targetPlan)

    return targetIndex > currentIndex
  }

  static getUpgradeOptions(currentPlan: string): string[] {
    const planHierarchy = ["free", "trial", "starter", "pro", "enterprise"]
    const currentIndex = planHierarchy.indexOf(currentPlan)

    if (currentIndex === -1) {
      return []
    }

    return planHierarchy.slice(currentIndex + 1)
  }

  static validateBotCreation(
    userPlan: string,
    currentBotCount: number,
  ): {
    allowed: boolean
    reason?: string
    upgradeRequired?: boolean
  } {
    if (!this.hasFeatureAccess(userPlan, "bot_creation")) {
      return {
        allowed: false,
        reason: "Bot creation not available in your current plan",
        upgradeRequired: true,
      }
    }

    if (!this.checkLimit(userPlan, "maxBots", currentBotCount)) {
      const limits = this.getLimits(userPlan)
      return {
        allowed: false,
        reason: `You have reached the maximum number of bots (${limits?.maxBots}) for your plan`,
        upgradeRequired: true,
      }
    }

    return { allowed: true }
  }

  static validateAPIKeyCreation(
    userPlan: string,
    currentKeyCount: number,
  ): {
    allowed: boolean
    reason?: string
    upgradeRequired?: boolean
  } {
    if (!this.hasFeatureAccess(userPlan, "api_access")) {
      return {
        allowed: false,
        reason: "API access not available in your current plan",
        upgradeRequired: true,
      }
    }

    if (!this.checkLimit(userPlan, "maxAPIKeys", currentKeyCount)) {
      const limits = this.getLimits(userPlan)
      return {
        allowed: false,
        reason: `You have reached the maximum number of API keys (${limits?.maxAPIKeys}) for your plan`,
        upgradeRequired: true,
      }
    }

    return { allowed: true }
  }

  static getTrialFeatures(): string[] {
    return ACCESS_LEVELS.trial.features
  }

  static isTrialFeature(feature: string): boolean {
    return this.getTrialFeatures().includes(feature)
  }
}

export const accessControl = new AccessControl()
