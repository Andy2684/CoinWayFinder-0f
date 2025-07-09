// Mock Stripe implementation for development
export interface StripePrice {
  id: string
  amount: number
  currency: string
  interval?: "month" | "year"
  product: string
}

export interface StripePlan {
  id: string
  name: string
  description: string
  price: StripePrice
  features: string[]
  limits: {
    bots: number
    trades: number
    apiCalls: number
    support: string
  }
  popular?: boolean
  metadata: Record<string, string>
}

export interface StripeAddOn {
  id: string
  name: string
  description: string
  price: StripePrice
  type: "monthly" | "one-time"
  category: string
}

export interface CheckoutSessionParams {
  priceId: string
  userId: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
  addOns?: string[]
}

export interface CheckoutSession {
  id: string
  url: string
  status: "open" | "complete" | "expired"
  customer: string
  amount_total: number
  currency: string
  metadata: Record<string, string>
  created: number
  expires_at: number
}

export interface WebhookEvent {
  id: string
  type: string
  data: {
    object: any
  }
  created: number
}

// Stripe Plans Configuration
export const STRIPE_PLANS: StripePlan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for beginners getting started with crypto trading",
    price: {
      id: "price_starter_monthly",
      amount: 2900, // $29.00
      currency: "usd",
      interval: "month",
      product: "prod_starter",
    },
    features: [
      "Up to 3 trading bots",
      "Basic strategies (DCA, Grid)",
      "Email support",
      "Basic analytics",
      "Mobile app access",
    ],
    limits: {
      bots: 3,
      trades: 1000,
      apiCalls: 10000,
      support: "email",
    },
    metadata: {
      tier: "starter",
      gracefulExpiration: "true",
    },
  },
  {
    id: "pro",
    name: "Pro",
    description: "Advanced features for serious traders",
    price: {
      id: "price_pro_monthly",
      amount: 7900, // $79.00
      currency: "usd",
      interval: "month",
      product: "prod_pro",
    },
    features: [
      "Up to 10 trading bots",
      "All strategies + AI signals",
      "Priority support",
      "Advanced analytics",
      "Backtesting",
      "Telegram notifications",
      "API access",
    ],
    limits: {
      bots: 10,
      trades: 10000,
      apiCalls: 100000,
      support: "priority",
    },
    popular: true,
    metadata: {
      tier: "pro",
      gracefulExpiration: "true",
    },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Unlimited access for professional traders",
    price: {
      id: "price_enterprise_monthly",
      amount: 19900, // $199.00
      currency: "usd",
      interval: "month",
      product: "prod_enterprise",
    },
    features: [
      "Unlimited trading bots",
      "Custom strategies",
      "24/7 phone support",
      "White-label options",
      "Dedicated account manager",
      "Custom integrations",
      "Advanced risk management",
    ],
    limits: {
      bots: -1, // unlimited
      trades: -1, // unlimited
      apiCalls: -1, // unlimited
      support: "phone",
    },
    metadata: {
      tier: "enterprise",
      gracefulExpiration: "true",
    },
  },
]

// Add-ons Configuration
export const ADD_ONS: StripeAddOn[] = [
  {
    id: "extra_bots",
    name: "Extra Bot Slots",
    description: "Add 5 additional bot slots to your plan",
    price: {
      id: "price_extra_bots",
      amount: 1500, // $15.00
      currency: "usd",
      interval: "month",
      product: "prod_extra_bots",
    },
    type: "monthly",
    category: "capacity",
  },
  {
    id: "backtesting",
    name: "Advanced Backtesting",
    description: "Historical strategy testing with detailed analytics",
    price: {
      id: "price_backtesting",
      amount: 2500, // $25.00
      currency: "usd",
      interval: "month",
      product: "prod_backtesting",
    },
    type: "monthly",
    category: "analytics",
  },
  {
    id: "whale_archive",
    name: "Whale Transaction Archive",
    description: "Access to 2-year whale transaction history",
    price: {
      id: "price_whale_archive",
      amount: 4999, // $49.99
      currency: "usd",
      product: "prod_whale_archive",
    },
    type: "one-time",
    category: "data",
  },
]

// Mock Stripe Class
class MockStripe {
  checkout = {
    sessions: {
      create: async (params: any): Promise<CheckoutSession> => {
        const sessionId = `cs_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        // Calculate total amount
        let totalAmount = 0
        const plan = STRIPE_PLANS.find((p) => p.price.id === params.line_items?.[0]?.price)
        if (plan) {
          totalAmount += plan.price.amount
        }

        // Add add-ons if any
        if (params.metadata?.addOns) {
          const addOnIds = params.metadata.addOns.split(",")
          for (const addOnId of addOnIds) {
            const addOn = ADD_ONS.find((a) => a.id === addOnId)
            if (addOn) {
              totalAmount += addOn.price.amount
            }
          }
        }

        const session: CheckoutSession = {
          id: sessionId,
          url: `https://checkout.stripe.com/pay/${sessionId}`,
          status: "open",
          customer: params.customer || `cus_mock_${Date.now()}`,
          amount_total: totalAmount,
          currency: "usd",
          metadata: params.metadata || {},
          created: Math.floor(Date.now() / 1000),
          expires_at: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
        }

        console.log(`🔄 Created mock Stripe checkout session: ${sessionId}`)
        return session
      },

      retrieve: async (sessionId: string): Promise<CheckoutSession> => {
        // Return mock session data
        return {
          id: sessionId,
          url: `https://checkout.stripe.com/pay/${sessionId}`,
          status: "complete",
          customer: `cus_mock_${Date.now()}`,
          amount_total: 7900, // Default to Pro plan
          currency: "usd",
          metadata: {},
          created: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
          expires_at: Math.floor(Date.now() / 1000) + 23 * 60 * 60, // 23 hours from now
        }
      },
    },
  }

  webhooks = {
    constructEvent: (payload: string, signature: string, secret: string): WebhookEvent => {
      // Mock webhook event construction
      return {
        id: `evt_mock_${Date.now()}`,
        type: "checkout.session.completed",
        data: {
          object: {
            id: `cs_mock_${Date.now()}`,
            status: "complete",
            customer: `cus_mock_${Date.now()}`,
            metadata: {},
          },
        },
        created: Math.floor(Date.now() / 1000),
      }
    },
  }

  customers = {
    create: async (params: any) => {
      return {
        id: `cus_mock_${Date.now()}`,
        email: params.email,
        name: params.name,
        created: Math.floor(Date.now() / 1000),
      }
    },

    retrieve: async (customerId: string) => {
      return {
        id: customerId,
        email: "customer@example.com",
        name: "Mock Customer",
        created: Math.floor(Date.now() / 1000) - 86400, // 1 day ago
      }
    },
  }

  subscriptions = {
    create: async (params: any) => {
      return {
        id: `sub_mock_${Date.now()}`,
        customer: params.customer,
        status: "active",
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
        items: {
          data: [
            {
              id: `si_mock_${Date.now()}`,
              price: {
                id: params.items[0].price,
                recurring: { interval: "month" },
              },
            },
          ],
        },
      }
    },

    retrieve: async (subscriptionId: string) => {
      return {
        id: subscriptionId,
        customer: `cus_mock_${Date.now()}`,
        status: "active",
        current_period_start: Math.floor(Date.now() / 1000) - 15 * 24 * 60 * 60, // 15 days ago
        current_period_end: Math.floor(Date.now() / 1000) + 15 * 24 * 60 * 60, // 15 days from now
      }
    },

    update: async (subscriptionId: string, params: any) => {
      return {
        id: subscriptionId,
        customer: `cus_mock_${Date.now()}`,
        status: params.cancel_at_period_end ? "canceled" : "active",
        current_period_start: Math.floor(Date.now() / 1000) - 15 * 24 * 60 * 60,
        current_period_end: Math.floor(Date.now() / 1000) + 15 * 24 * 60 * 60,
      }
    },

    cancel: async (subscriptionId: string) => {
      return {
        id: subscriptionId,
        customer: `cus_mock_${Date.now()}`,
        status: "canceled",
        canceled_at: Math.floor(Date.now() / 1000),
      }
    },
  }
}

// Export stripe instance
export const stripe = new MockStripe()

// Utility functions
export const getPlanById = (planId: string): StripePlan | undefined => {
  return STRIPE_PLANS.find((plan) => plan.id === planId)
}

export const getAddOnById = (addOnId: string): StripeAddOn | undefined => {
  return ADD_ONS.find((addOn) => addOn.id === addOnId)
}

export const calculateTotalPrice = (planId: string, addOnIds: string[] = []): number => {
  let total = 0

  const plan = getPlanById(planId)
  if (plan) {
    total += plan.price.amount
  }

  for (const addOnId of addOnIds) {
    const addOn = getAddOnById(addOnId)
    if (addOn) {
      total += addOn.price.amount
    }
  }

  return total
}

// Main checkout session creation function
export const createCheckoutSession = async (params: CheckoutSessionParams): Promise<CheckoutSession> => {
  const plan = getPlanById(params.priceId)
  if (!plan) {
    throw new Error(`Plan not found: ${params.priceId}`)
  }

  // Prepare line items
  const lineItems = [
    {
      price: plan.price.id,
      quantity: 1,
    },
  ]

  // Add add-ons if specified
  if (params.addOns && params.addOns.length > 0) {
    for (const addOnId of params.addOns) {
      const addOn = getAddOnById(addOnId)
      if (addOn) {
        lineItems.push({
          price: addOn.price.id,
          quantity: 1,
        })
      }
    }
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: lineItems,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      userId: params.userId,
      planId: params.priceId,
      addOns: params.addOns?.join(",") || "",
      ...params.metadata,
    },
    customer_email: undefined, // Will be filled by Stripe
    allow_promotion_codes: true,
    billing_address_collection: "required",
    payment_method_types: ["card"],
    subscription_data: {
      metadata: {
        userId: params.userId,
        planId: params.priceId,
      },
    },
  })

  console.log(`✅ Created checkout session for user ${params.userId}, plan ${params.priceId}`)
  return session
}

// Webhook handling
export const handleWebhookEvent = async (event: WebhookEvent): Promise<void> => {
  console.log(`🔔 Received webhook event: ${event.type}`)

  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as CheckoutSession
      console.log(`💳 Payment completed for session: ${session.id}`)

      // Here you would typically:
      // 1. Update user subscription in database
      // 2. Send confirmation email
      // 3. Activate premium features
      break

    case "customer.subscription.updated":
      console.log(`🔄 Subscription updated`)
      break

    case "customer.subscription.deleted":
      console.log(`❌ Subscription canceled`)
      break

    case "invoice.payment_failed":
      console.log(`⚠️ Payment failed`)
      break

    default:
      console.log(`❓ Unhandled event type: ${event.type}`)
  }
}

// Export default for compatibility
export default {
  stripe,
  STRIPE_PLANS,
  ADD_ONS,
  createCheckoutSession,
  getPlanById,
  getAddOnById,
  calculateTotalPrice,
  handleWebhookEvent,
}
