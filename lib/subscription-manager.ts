import { database, type UserSettings } from "./database"
import Stripe from "stripe"

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  interval: "month" | "year"
  features: string[]
  maxBots: number
  maxStrategies: string[]
  aiRiskAnalysis: boolean
  prioritySupport: boolean
  advancedAnalytics: boolean
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free Trial",
    price: 0,
    interval: "month",
    features: ["3-day free trial", "1 active bot", "DCA strategy only", "Basic analytics", "Email support"],
    maxBots: 1,
    maxStrategies: ["dca"],
    aiRiskAnalysis: false,
    prioritySupport: false,
    advancedAnalytics: false,
  },
  {
    id: "basic",
    name: "Basic",
    price: 29,
    interval: "month",
    features: [
      "3 active bots",
      "DCA + Scalping strategies",
      "Basic AI risk analysis",
      "Standard analytics",
      "Email support",
      "Telegram notifications",
    ],
    maxBots: 3,
    maxStrategies: ["dca", "scalping"],
    aiRiskAnalysis: true,
    prioritySupport: false,
    advancedAnalytics: false,
  },
  {
    id: "premium",
    name: "Premium",
    price: 79,
    interval: "month",
    features: [
      "10 active bots",
      "All strategies available",
      "Advanced AI risk analysis",
      "Advanced analytics & reports",
      "Priority support",
      "All notification types",
      "Custom strategy parameters",
    ],
    maxBots: 10,
    maxStrategies: ["dca", "scalping", "grid", "long-short", "trend-following", "arbitrage"],
    aiRiskAnalysis: true,
    prioritySupport: true,
    advancedAnalytics: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 199,
    interval: "month",
    features: [
      "Unlimited bots",
      "All strategies + custom",
      "Premium AI analysis",
      "White-label solution",
      "Dedicated support",
      "API access",
      "Custom integrations",
    ],
    maxBots: -1, // Unlimited
    maxStrategies: ["dca", "scalping", "grid", "long-short", "trend-following", "arbitrage"],
    aiRiskAnalysis: true,
    prioritySupport: true,
    advancedAnalytics: true,
  },
]

export class SubscriptionManager {
  private stripe: Stripe

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2023-10-16",
    })
  }

  async getUserSubscription(userId: string): Promise<UserSettings | null> {
    return database.getUserSettings(userId)
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
      const plan = subscriptionPlans.find((p) => p.id === planId)
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
      const userSettings = await this.getUserSubscription(userId)
      if (userSettings) {
        userSettings.subscription = {
          plan: planId as any,
          status: "active",
          startDate: new Date(),
          endDate: new Date(subscription.current_period_end * 1000),
          trialUsed: userSettings.subscription.trialUsed,
          trialEndDate: userSettings.subscription.trialEndDate,
        }
        await database.saveUserSettings(userSettings)
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

  async cancelSubscription(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const userSettings = await this.getUserSubscription(userId)
      if (!userSettings) {
        return { success: false, error: "User not found" }
      }

      // In production, you would cancel the Stripe subscription here
      // For demo, we'll just update the database
      userSettings.subscription.status = "cancelled"
      await database.saveUserSettings(userSettings)

      return { success: true }
    } catch (error: any) {
      console.error("Subscription cancellation failed:", error)
      return { success: false, error: error.message }
    }
  }

  async processReferral(
    userId: string,
    referralCode: string,
  ): Promise<{ success: boolean; bonusDays?: number; error?: string }> {
    try {
      // Find referrer
      const referrerSettings = await database.getUserSettings(referralCode)
      if (!referrerSettings) {
        return { success: false, error: "Invalid referral code" }
      }

      // Create new user with referral bonus
      const newUserSettings = await database.createUserWithTrial(userId, referrerSettings.userId)

      return {
        success: true,
        bonusDays: newUserSettings.referrals.bonusDays,
      }
    } catch (error: any) {
      console.error("Referral processing failed:", error)
      return { success: false, error: error.message }
    }
  }

  async checkSubscriptionAccess(userId: string, feature: string): Promise<boolean> {
    const userSettings = await this.getUserSubscription(userId)
    if (!userSettings) return false

    const plan = subscriptionPlans.find((p) => p.id === userSettings.subscription.plan)
    if (!plan) return false

    // Check if subscription is active
    if (userSettings.subscription.status !== "active") return false

    // Check if subscription has expired
    if (new Date() > userSettings.subscription.endDate) {
      // Update status to expired
      userSettings.subscription.status = "expired"
      await database.saveUserSettings(userSettings)
      return false
    }

    // Check feature access
    switch (feature) {
      case "ai_risk_analysis":
        return plan.aiRiskAnalysis
      case "priority_support":
        return plan.prioritySupport
      case "advanced_analytics":
        return plan.advancedAnalytics
      default:
        return true
    }
  }

  async checkBotLimit(userId: string): Promise<{ canCreate: boolean; currentCount: number; maxAllowed: number }> {
    const userSettings = await this.getUserSubscription(userId)
    if (!userSettings) {
      return { canCreate: false, currentCount: 0, maxAllowed: 0 }
    }

    const plan = subscriptionPlans.find((p) => p.id === userSettings.subscription.plan)
    if (!plan) {
      return { canCreate: false, currentCount: 0, maxAllowed: 0 }
    }

    const userBots = await database.getUserBots(userId)
    const currentCount = userBots.length

    const canCreate = plan.maxBots === -1 || currentCount < plan.maxBots

    return {
      canCreate,
      currentCount,
      maxAllowed: plan.maxBots,
    }
  }

  async checkStrategyAccess(userId: string, strategy: string): Promise<boolean> {
    const userSettings = await this.getUserSubscription(userId)
    if (!userSettings) return false

    const plan = subscriptionPlans.find((p) => p.id === userSettings.subscription.plan)
    if (!plan) return false

    return plan.maxStrategies.includes(strategy)
  }

  async createCryptoPayment(
    userId: string,
    planId: string,
  ): Promise<{
    success: boolean
    paymentUrl?: string
    paymentId?: string
    error?: string
  }> {
    try {
      const plan = subscriptionPlans.find((p) => p.id === planId)
      if (!plan || plan.id === "free") {
        return { success: false, error: "Invalid plan" }
      }

      // In production, integrate with Coinbase Commerce or similar
      // For demo, we'll simulate the payment process
      const paymentId = `crypto_${Date.now()}_${userId}`
      const paymentUrl = `https://commerce.coinbase.com/checkout/${paymentId}`

      return {
        success: true,
        paymentUrl,
        paymentId,
      }
    } catch (error: any) {
      console.error("Crypto payment creation failed:", error)
      return { success: false, error: error.message }
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
      const userSettings = await this.getUserSubscription(userId)

      if (userSettings) {
        userSettings.subscription.status = "active"
        userSettings.subscription.endDate = new Date(invoice.period_end * 1000)
        await database.saveUserSettings(userSettings)
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
      const userSettings = await this.getUserSubscription(userId)

      if (userSettings) {
        userSettings.subscription.status = "cancelled"
        await database.saveUserSettings(userSettings)
      }
    }
  }

  async getUsageStats(userId: string): Promise<{
    botsUsed: number
    botsLimit: number
    strategiesUsed: string[]
    strategiesAvailable: string[]
    subscriptionDaysLeft: number
  }> {
    const userSettings = await this.getUserSubscription(userId)
    if (!userSettings) {
      return {
        botsUsed: 0,
        botsLimit: 0,
        strategiesUsed: [],
        strategiesAvailable: [],
        subscriptionDaysLeft: 0,
      }
    }

    const plan = subscriptionPlans.find((p) => p.id === userSettings.subscription.plan)
    if (!plan) {
      return {
        botsUsed: 0,
        botsLimit: 0,
        strategiesUsed: [],
        strategiesAvailable: [],
        subscriptionDaysLeft: 0,
      }
    }

    const userBots = await database.getUserBots(userId)
    const strategiesUsed = [...new Set(userBots.map((bot) => bot.strategy))]

    const daysLeft = Math.max(
      0,
      Math.ceil((userSettings.subscription.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    )

    return {
      botsUsed: userBots.length,
      botsLimit: plan.maxBots,
      strategiesUsed,
      strategiesAvailable: plan.maxStrategies,
      subscriptionDaysLeft: daysLeft,
    }
  }
}

export const subscriptionManager = new SubscriptionManager()
