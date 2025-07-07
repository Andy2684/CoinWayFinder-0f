import { database } from "./database"
import Stripe from "stripe"

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  interval: "month" | "year"
  features: {
    maxBots: number
    strategies: string[]
    exchanges: string[]
    aiRiskAnalysis: boolean
    prioritySupport: boolean
    advancedAnalytics: boolean
    customStrategies: boolean
    apiAccess: boolean
  }
  limits: {
    maxInvestmentPerBot: number
    maxDailyTrades: number
    maxLeverage: number
  }
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  free: {
    id: "free",
    name: "Free Trial",
    price: 0,
    interval: "month",
    features: {
      maxBots: 1,
      strategies: ["dca"],
      exchanges: ["binance"],
      aiRiskAnalysis: true,
      prioritySupport: false,
      advancedAnalytics: false,
      customStrategies: false,
      apiAccess: false,
    },
    limits: {
      maxInvestmentPerBot: 100,
      maxDailyTrades: 10,
      maxLeverage: 1,
    },
  },
  basic: {
    id: "basic",
    name: "Basic",
    price: 29,
    interval: "month",
    features: {
      maxBots: 3,
      strategies: ["dca", "grid", "scalping"],
      exchanges: ["binance", "bybit"],
      aiRiskAnalysis: true,
      prioritySupport: false,
      advancedAnalytics: true,
      customStrategies: false,
      apiAccess: false,
    },
    limits: {
      maxInvestmentPerBot: 1000,
      maxDailyTrades: 50,
      maxLeverage: 3,
    },
  },
  premium: {
    id: "premium",
    name: "Premium",
    price: 79,
    interval: "month",
    features: {
      maxBots: 10,
      strategies: ["dca", "grid", "scalping", "long-short", "trend-following"],
      exchanges: ["binance", "bybit", "kucoin", "okx"],
      aiRiskAnalysis: true,
      prioritySupport: true,
      advancedAnalytics: true,
      customStrategies: true,
      apiAccess: true,
    },
    limits: {
      maxInvestmentPerBot: 10000,
      maxDailyTrades: 200,
      maxLeverage: 10,
    },
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    price: 199,
    interval: "month",
    features: {
      maxBots: -1, // Unlimited
      strategies: ["dca", "grid", "scalping", "long-short", "trend-following", "arbitrage"],
      exchanges: ["binance", "bybit", "kucoin", "okx", "coinbase", "bitget", "gateio"],
      aiRiskAnalysis: true,
      prioritySupport: true,
      advancedAnalytics: true,
      customStrategies: true,
      apiAccess: true,
    },
    limits: {
      maxInvestmentPerBot: -1, // Unlimited
      maxDailyTrades: -1, // Unlimited
      maxLeverage: 20,
    },
  },
}

export class SubscriptionManager {
  private static instance: SubscriptionManager
  private stripe: Stripe

  static getInstance(): SubscriptionManager {
    if (!SubscriptionManager.instance) {
      SubscriptionManager.instance = new SubscriptionManager()
    }
    return SubscriptionManager.instance
  }

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2023-10-16",
    })
  }

  async getUserPlan(userId: string): Promise<SubscriptionPlan> {
    const settings = await database.getUserSettings(userId)

    if (!settings) {
      return SUBSCRIPTION_PLANS.free
    }

    const planId = settings.subscription.plan
    return SUBSCRIPTION_PLANS[planId] || SUBSCRIPTION_PLANS.free
  }

  async canCreateBot(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const plan = await this.getUserPlan(userId)
    const userBots = await database.getUserBots(userId)

    if (plan.features.maxBots !== -1 && userBots.length >= plan.features.maxBots) {
      return {
        allowed: false,
        reason: `You've reached the maximum number of bots (${plan.features.maxBots}) for your ${plan.name} plan`,
      }
    }

    return { allowed: true }
  }

  async canUseStrategy(userId: string, strategy: string): Promise<{ allowed: boolean; reason?: string }> {
    const plan = await this.getUserPlan(userId)

    if (!plan.features.strategies.includes(strategy)) {
      return {
        allowed: false,
        reason: `The ${strategy} strategy is not available in your ${plan.name} plan`,
      }
    }

    return { allowed: true }
  }

  async canUseExchange(userId: string, exchange: string): Promise<{ allowed: boolean; reason?: string }> {
    const plan = await this.getUserPlan(userId)

    if (!plan.features.exchanges.includes(exchange)) {
      return {
        allowed: false,
        reason: `The ${exchange} exchange is not available in your ${plan.name} plan`,
      }
    }

    return { allowed: true }
  }

  async validateBotConfig(
    userId: string,
    config: {
      investment: number
      leverage?: number
      strategy: string
      exchange: string
    },
  ): Promise<{ valid: boolean; errors: string[] }> {
    const plan = await this.getUserPlan(userId)
    const errors: string[] = []

    // Check investment limit
    if (plan.limits.maxInvestmentPerBot !== -1 && config.investment > plan.limits.maxInvestmentPerBot) {
      errors.push(`Investment amount exceeds limit of $${plan.limits.maxInvestmentPerBot} for your ${plan.name} plan`)
    }

    // Check leverage limit
    if (config.leverage && plan.limits.maxLeverage !== -1 && config.leverage > plan.limits.maxLeverage) {
      errors.push(`Leverage exceeds limit of ${plan.limits.maxLeverage}x for your ${plan.name} plan`)
    }

    // Check strategy availability
    const strategyCheck = await this.canUseStrategy(userId, config.strategy)
    if (!strategyCheck.allowed) {
      errors.push(strategyCheck.reason!)
    }

    // Check exchange availability
    const exchangeCheck = await this.canUseExchange(userId, config.exchange)
    if (!exchangeCheck.allowed) {
      errors.push(exchangeCheck.reason!)
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  async isTrialExpired(userId: string): Promise<boolean> {
    const settings = await database.getUserSettings(userId)

    if (!settings || !settings.subscription.trialEndDate) {
      return false
    }

    return new Date() > settings.subscription.trialEndDate
  }

  async getUsageStats(userId: string): Promise<{
    botsUsed: number
    botsLimit: number
    dailyTrades: number
    dailyTradesLimit: number
    planName: string
  }> {
    const plan = await this.getUserPlan(userId)
    const userBots = await database.getUserBots(userId)

    // Get today's trades
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayTrades = await database.getUserTrades(userId, 1000)
    const dailyTrades = todayTrades.filter((trade) => trade.timestamp >= today).length

    return {
      botsUsed: userBots.length,
      botsLimit: plan.features.maxBots,
      dailyTrades,
      dailyTradesLimit: plan.limits.maxDailyTrades,
      planName: plan.name,
    }
  }

  async upgradePlan(
    userId: string,
    newPlanId: string,
    paymentMethodId?: string,
  ): Promise<{
    success: boolean
    error?: string
    subscriptionId?: string
  }> {
    try {
      const newPlan = SUBSCRIPTION_PLANS[newPlanId]
      if (!newPlan) {
        return { success: false, error: "Invalid plan selected" }
      }

      // In production, integrate with Stripe here
      const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Update user settings
      const settings = await database.getUserSettings(userId)
      if (settings) {
        const endDate = new Date()
        endDate.setMonth(endDate.getMonth() + (newPlan.interval === "year" ? 12 : 1))

        settings.subscription = {
          plan: newPlanId,
          status: "active",
          startDate: new Date(),
          endDate,
          trialUsed: settings.subscription.trialUsed,
          trialEndDate: settings.subscription.trialEndDate,
        }

        await database.saveUserSettings(settings)
      }

      return {
        success: true,
        subscriptionId,
      }
    } catch (error) {
      console.error("Plan upgrade failed:", error)
      return {
        success: false,
        error: "Failed to upgrade plan. Please try again.",
      }
    }
  }

  async cancelSubscription(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const settings = await database.getUserSettings(userId)
      if (settings) {
        settings.subscription.status = "cancelled"
        await database.saveUserSettings(settings)
      }

      return { success: true }
    } catch (error) {
      console.error("Subscription cancellation failed:", error)
      return {
        success: false,
        error: "Failed to cancel subscription. Please contact support.",
      }
    }
  }

  async processReferral(
    userId: string,
    referralCode: string,
  ): Promise<{
    success: boolean
    bonusDays?: number
    error?: string
  }> {
    try {
      // Find referrer by referral code
      const referrerSettings = await database.getUserSettings(referralCode) // This would need a different query
      if (!referrerSettings) {
        return { success: false, error: "Invalid referral code" }
      }

      // Add bonus days to new user
      const userSettings = await database.getUserSettings(userId)
      if (userSettings) {
        const bonusDays = 5
        const newEndDate = new Date(userSettings.subscription.endDate)
        newEndDate.setDate(newEndDate.getDate() + bonusDays)

        userSettings.subscription.endDate = newEndDate
        userSettings.referrals.referredBy = referrerSettings.userId
        userSettings.referrals.bonusDays += bonusDays

        await database.saveUserSettings(userSettings)

        return { success: true, bonusDays }
      }

      return { success: false, error: "User not found" }
    } catch (error) {
      console.error("Referral processing failed:", error)
      return {
        success: false,
        error: "Failed to process referral",
      }
    }
  }

  async createSubscription(
    userId: string,
    planId: string,
    paymentMethodId: string,
  ): Promise<{
    success: boolean
    subscriptionId?: string
    clientSecret?: string
    error?: string
  }> {
    try {
      const plan = SUBSCRIPTION_PLANS[planId]
      if (!plan || plan.id === "free") {
        return { success: false, error: "Invalid plan" }
      }

      // Create Stripe customer
      const customer = await this.stripe.customers.create({
        metadata: { userId },
      })

      // Attach payment method
      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customer.id,
      })

      // Create subscription
      const subscription = await this.stripe.subscriptions.create({
        customer: customer.id,
        items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: plan.name,
              },
              unit_amount: plan.price * 100, // Convert to cents
              recurring: {
                interval: plan.interval,
              },
            },
          },
        ],
        default_payment_method: paymentMethodId,
        expand: ["latest_invoice.payment_intent"],
      })

      // Update user subscription in database
      const settings = await database.getUserSettings(userId)
      if (settings) {
        settings.subscription = {
          plan: planId,
          status: "active",
          startDate: new Date(),
          endDate: new Date(subscription.current_period_end * 1000),
          trialUsed: settings.subscription.trialUsed,
          trialEndDate: settings.subscription.trialEndDate,
        }
        await database.saveUserSettings(settings)
      }

      return {
        success: true,
        subscriptionId: subscription.id,
      }
    } catch (error: any) {
      console.error("Subscription creation failed:", error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  async handleWebhook(event: any): Promise<void> {
    try {
      switch (event.type) {
        case "invoice.payment_succeeded":
          await this.handlePaymentSuccess(event.data.object)
          break
        case "invoice.payment_failed":
          await this.handlePaymentFailed(event.data.object)
          break
        case "customer.subscription.deleted":
          await this.handleSubscriptionCancelled(event.data.object)
          break
        default:
          console.log(`Unhandled event type: ${event.type}`)
      }
    } catch (error) {
      console.error("Webhook handling failed:", error)
    }
  }

  private async handlePaymentSuccess(invoice: any): Promise<void> {
    // Update user subscription status
    const customerId = invoice.customer
    const customer = await this.stripe.customers.retrieve(customerId)

    if (customer && !customer.deleted && customer.metadata?.userId) {
      const userId = customer.metadata.userId
      const settings = await database.getUserSettings(userId)

      if (settings) {
        settings.subscription.status = "active"
        settings.subscription.endDate = new Date(invoice.period_end * 1000)
        await database.saveUserSettings(settings)
      }
    }
  }

  private async handlePaymentFailed(invoice: any): Promise<void> {
    // Handle failed payment - maybe send notification
    console.log("Payment failed for invoice:", invoice.id)
  }

  private async handleSubscriptionCancelled(subscription: any): Promise<void> {
    const customerId = subscription.customer
    const customer = await this.stripe.customers.retrieve(customerId)

    if (customer && !customer.deleted && customer.metadata?.userId) {
      const userId = customer.metadata.userId
      const settings = await database.getUserSettings(userId)

      if (settings) {
        settings.subscription.status = "cancelled"
        await database.saveUserSettings(settings)
      }
    }
  }
}

export const subscriptionManager = SubscriptionManager.getInstance()
