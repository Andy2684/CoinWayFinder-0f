import { database } from "./database"
import { stripe } from "./stripe"

interface SubscriptionPlan {
  id: string
  name: string
  price: number
  currency: string
  interval: "month" | "year"
  features: string[]
  limits: {
    bots: number
    apiCalls: number
    exchanges: number
    strategies: number
  }
  stripePriceId?: string
}

interface SubscriptionStatus {
  plan: string
  status: "active" | "cancelled" | "expired" | "trial"
  startDate: Date
  endDate?: Date
  cancelAtPeriodEnd?: boolean
  stripeSubscriptionId?: string
  stripeCustomerId?: string
}

class SubscriptionManager {
  private plans: Map<string, SubscriptionPlan> = new Map()

  constructor() {
    this.initializePlans()
  }

  private initializePlans(): void {
    const plans: SubscriptionPlan[] = [
      {
        id: "free",
        name: "Free",
        price: 0,
        currency: "USD",
        interval: "month",
        features: ["Basic trading bot", "Manual trading", "Basic analytics", "Email support"],
        limits: {
          bots: 1,
          apiCalls: 1000,
          exchanges: 1,
          strategies: 2,
        },
      },
      {
        id: "starter",
        name: "Starter",
        price: 29,
        currency: "USD",
        interval: "month",
        features: [
          "Up to 3 trading bots",
          "Advanced strategies",
          "Real-time analytics",
          "Priority support",
          "Telegram notifications",
        ],
        limits: {
          bots: 3,
          apiCalls: 10000,
          exchanges: 3,
          strategies: 5,
        },
        stripePriceId: process.env.STRIPE_STARTER_PRICE_ID,
      },
      {
        id: "pro",
        name: "Pro",
        price: 99,
        currency: "USD",
        interval: "month",
        features: [
          "Unlimited trading bots",
          "All strategies",
          "Advanced analytics",
          "Priority support",
          "All notifications",
          "API access",
          "Custom indicators",
        ],
        limits: {
          bots: -1, // unlimited
          apiCalls: 100000,
          exchanges: -1, // unlimited
          strategies: -1, // unlimited
        },
        stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
      },
      {
        id: "enterprise",
        name: "Enterprise",
        price: 299,
        currency: "USD",
        interval: "month",
        features: [
          "Everything in Pro",
          "White-label solution",
          "Dedicated support",
          "Custom integrations",
          "SLA guarantee",
          "Advanced reporting",
        ],
        limits: {
          bots: -1,
          apiCalls: -1,
          exchanges: -1,
          strategies: -1,
        },
        stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
      },
    ]

    plans.forEach((plan) => this.plans.set(plan.id, plan))
  }

  getPlans(): SubscriptionPlan[] {
    return Array.from(this.plans.values())
  }

  getPlan(planId: string): SubscriptionPlan | null {
    return this.plans.get(planId) || null
  }

  async getUserSubscription(userId: string): Promise<SubscriptionStatus | null> {
    const userSettings = await database.getUserSettings(userId)
    return userSettings?.subscription || null
  }

  async startTrial(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const userSettings = await database.getUserSettings(userId)

      if (userSettings?.trial?.hasUsed) {
        return { success: false, message: "Trial already used" }
      }

      const trialEndDate = new Date()
      trialEndDate.setDate(trialEndDate.getDate() + 14) // 14-day trial

      await database.updateUserSettings(userId, {
        subscription: {
          plan: "pro",
          status: "trial",
          startDate: new Date(),
          endDate: trialEndDate,
        },
        trial: {
          hasUsed: true,
          isActive: true,
          startDate: new Date(),
          endDate: trialEndDate,
        },
      })

      return { success: true, message: "Trial started successfully" }
    } catch (error) {
      console.error("Start trial error:", error)
      return { success: false, message: "Failed to start trial" }
    }
  }

  async createCheckoutSession(
    userId: string,
    planId: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<{ success: boolean; sessionId?: string; url?: string; message?: string }> {
    try {
      const plan = this.getPlan(planId)
      if (!plan || !plan.stripePriceId) {
        return { success: false, message: "Invalid plan" }
      }

      const user = await database.getUserById(userId)
      if (!user) {
        return { success: false, message: "User not found" }
      }

      const session = await stripe.checkout.sessions.create({
        customer_email: user.email,
        payment_method_types: ["card"],
        line_items: [
          {
            price: plan.stripePriceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId,
          planId,
        },
      })

      return {
        success: true,
        sessionId: session.id,
        url: session.url || undefined,
      }
    } catch (error) {
      console.error("Create checkout session error:", error)
      return { success: false, message: "Failed to create checkout session" }
    }
  }

  async handleStripeWebhook(event: any): Promise<void> {
    try {
      switch (event.type) {
        case "checkout.session.completed":
          await this.handleCheckoutCompleted(event.data.object)
          break
        case "customer.subscription.updated":
          await this.handleSubscriptionUpdated(event.data.object)
          break
        case "customer.subscription.deleted":
          await this.handleSubscriptionCancelled(event.data.object)
          break
        case "invoice.payment_succeeded":
          await this.handlePaymentSucceeded(event.data.object)
          break
        case "invoice.payment_failed":
          await this.handlePaymentFailed(event.data.object)
          break
        default:
          console.log(`Unhandled event type: ${event.type}`)
      }
    } catch (error) {
      console.error("Webhook handling error:", error)
      throw error
    }
  }

  private async handleCheckoutCompleted(session: any): Promise<void> {
    const { userId, planId } = session.metadata

    if (!userId || !planId) {
      console.error("Missing metadata in checkout session")
      return
    }

    const subscription = await stripe.subscriptions.retrieve(session.subscription)

    await database.updateUserSettings(userId, {
      subscription: {
        plan: planId,
        status: "active",
        startDate: new Date(),
        endDate: new Date(subscription.current_period_end * 1000),
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
      },
    })
  }

  private async handleSubscriptionUpdated(subscription: any): Promise<void> {
    const userSettings = await this.findUserByStripeSubscription(subscription.id)
    if (!userSettings) return

    const status = subscription.status === "active" ? "active" : "cancelled"

    await database.updateUserSettings(userSettings.userId, {
      subscription: {
        ...userSettings.subscription,
        status,
        endDate: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    })
  }

  private async handleSubscriptionCancelled(subscription: any): Promise<void> {
    const userSettings = await this.findUserByStripeSubscription(subscription.id)
    if (!userSettings) return

    await database.updateUserSettings(userSettings.userId, {
      subscription: {
        ...userSettings.subscription,
        status: "cancelled",
        endDate: new Date(subscription.current_period_end * 1000),
      },
    })
  }

  private async handlePaymentSucceeded(invoice: any): Promise<void> {
    // Handle successful payment - could send confirmation email, etc.
    console.log("Payment succeeded for invoice:", invoice.id)
  }

  private async handlePaymentFailed(invoice: any): Promise<void> {
    // Handle failed payment - could send notification, etc.
    console.log("Payment failed for invoice:", invoice.id)
  }

  private async findUserByStripeSubscription(subscriptionId: string): Promise<any> {
    // In a real implementation, you'd query the database
    // For now, return null as we don't have a proper database query
    return null
  }

  async cancelSubscription(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const userSettings = await database.getUserSettings(userId)
      if (!userSettings?.subscription?.stripeSubscriptionId) {
        return { success: false, message: "No active subscription found" }
      }

      await stripe.subscriptions.update(userSettings.subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      })

      await database.updateUserSettings(userId, {
        subscription: {
          ...userSettings.subscription,
          cancelAtPeriodEnd: true,
        },
      })

      return { success: true, message: "Subscription will be cancelled at the end of the billing period" }
    } catch (error) {
      console.error("Cancel subscription error:", error)
      return { success: false, message: "Failed to cancel subscription" }
    }
  }

  async reactivateSubscription(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const userSettings = await database.getUserSettings(userId)
      if (!userSettings?.subscription?.stripeSubscriptionId) {
        return { success: false, message: "No subscription found" }
      }

      await stripe.subscriptions.update(userSettings.subscription.stripeSubscriptionId, {
        cancel_at_period_end: false,
      })

      await database.updateUserSettings(userId, {
        subscription: {
          ...userSettings.subscription,
          status: "active",
          cancelAtPeriodEnd: false,
        },
      })

      return { success: true, message: "Subscription reactivated successfully" }
    } catch (error) {
      console.error("Reactivate subscription error:", error)
      return { success: false, message: "Failed to reactivate subscription" }
    }
  }

  async checkAccess(userId: string, feature: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId)
    if (!subscription) return false

    const plan = this.getPlan(subscription.plan)
    if (!plan) return false

    // Check if subscription is active
    if (subscription.status !== "active" && subscription.status !== "trial") {
      return false
    }

    // Check if subscription has expired
    if (subscription.endDate && subscription.endDate < new Date()) {
      return false
    }

    // For now, return true for all features if subscription is active
    // In a real implementation, you'd check specific feature access
    return true
  }

  async getUsageStats(userId: string): Promise<{
    botsUsed: number
    botsLimit: number
    apiCallsUsed: number
    apiCallsLimit: number
  }> {
    const subscription = await this.getUserSubscription(userId)
    const plan = subscription ? this.getPlan(subscription.plan) : this.getPlan("free")

    if (!plan) {
      return { botsUsed: 0, botsLimit: 1, apiCallsUsed: 0, apiCallsLimit: 1000 }
    }

    const userStats = await database.getUserStats(userId)

    return {
      botsUsed: userStats.totalBots,
      botsLimit: plan.limits.bots === -1 ? 999999 : plan.limits.bots,
      apiCallsUsed: 0, // Would track from API usage
      apiCallsLimit: plan.limits.apiCalls === -1 ? 999999 : plan.limits.apiCalls,
    }
  }
}

export const subscriptionManager = new SubscriptionManager()
