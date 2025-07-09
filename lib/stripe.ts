// Mock Stripe implementation for development
export interface StripePlan {
  id: string
  name: string
  price: number
  interval: "month" | "year"
  features: string[]
  limits: {
    bots: number
    apiCalls: number
    exchanges: number
  }
  popular?: boolean
}

export interface StripeAddOn {
  id: string
  name: string
  description: string
  price: number
  type: "monthly" | "one_time"
}

export interface StripeSession {
  id: string
  url: string
  payment_status: string
  customer_email?: string
  metadata?: Record<string, string>
}

export const STRIPE_PLANS: StripePlan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 29,
    interval: "month",
    features: ["Up to 3 trading bots", "Basic strategies", "1,000 API calls/month", "Email support"],
    limits: {
      bots: 3,
      apiCalls: 1000,
      exchanges: 2,
    },
  },
  {
    id: "pro",
    name: "Pro",
    price: 99,
    interval: "month",
    features: [
      "Up to 10 trading bots",
      "Advanced strategies",
      "10,000 API calls/month",
      "Priority support",
      "Backtesting",
      "Whale alerts",
    ],
    limits: {
      bots: 10,
      apiCalls: 10000,
      exchanges: 5,
    },
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 299,
    interval: "month",
    features: [
      "Unlimited trading bots",
      "Custom strategies",
      "Unlimited API calls",
      "24/7 support",
      "Advanced analytics",
      "Custom integrations",
    ],
    limits: {
      bots: -1, // unlimited
      apiCalls: -1, // unlimited
      exchanges: -1, // unlimited
    },
  },
]

export const ADD_ONS: StripeAddOn[] = [
  {
    id: "extra_bots",
    name: "Extra Bot Slots",
    description: "Add 5 more bot slots to your plan",
    price: 19,
    type: "monthly",
  },
  {
    id: "backtesting",
    name: "Advanced Backtesting",
    description: "Historical strategy testing",
    price: 49,
    type: "monthly",
  },
  {
    id: "whale_archive",
    name: "Whale Transaction Archive",
    description: "Access to historical whale data",
    price: 99,
    type: "one_time",
  },
]

// Mock Stripe class
class MockStripe {
  checkout = {
    sessions: {
      create: async (params: {
        payment_method_types: string[]
        line_items: Array<{
          price_data: {
            currency: string
            unit_amount: number
            product_data: {
              name: string
              description?: string
            }
            recurring?: {
              interval: "month" | "year"
            }
          }
          quantity: number
        }>
        mode: "payment" | "subscription"
        success_url: string
        cancel_url: string
        customer_email?: string
        metadata?: Record<string, string>
        subscription_data?: {
          metadata?: Record<string, string>
        }
      }): Promise<StripeSession> => {
        const sessionId = `cs_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        return {
          id: sessionId,
          url: `https://checkout.stripe.com/pay/${sessionId}`,
          payment_status: "unpaid",
          customer_email: params.customer_email,
          metadata: params.metadata || {},
        }
      },

      retrieve: async (sessionId: string): Promise<StripeSession> => {
        return {
          id: sessionId,
          url: `https://checkout.stripe.com/pay/${sessionId}`,
          payment_status: "paid",
          customer_email: "user@example.com",
          metadata: {
            userId: "mock_user_id",
            planId: "pro",
          },
        }
      },
    },
  }

  webhooks = {
    constructEvent: (payload: string, signature: string, secret: string) => {
      return {
        type: "checkout.session.completed",
        data: {
          object: {
            id: "cs_mock_session",
            payment_status: "paid",
            customer_email: "user@example.com",
            metadata: {
              userId: "mock_user_id",
              planId: "pro",
            },
          },
        },
      }
    },
  }
}

export const stripe = new MockStripe()

// Create Checkout Session Function - REQUIRED EXPORT
export async function createCheckoutSession({
  planId,
  userId,
  successUrl,
  cancelUrl,
  addOns = [],
}: {
  planId: string
  userId: string
  successUrl: string
  cancelUrl: string
  addOns?: string[]
}): Promise<StripeSession> {
  const plan = STRIPE_PLANS.find((p) => p.id === planId)

  if (!plan) {
    throw new Error(`Invalid plan ID: ${planId}`)
  }

  const lineItems = [
    {
      price_data: {
        currency: "usd",
        product_data: {
          name: plan.name,
          description: `CoinWayFinder ${plan.name} Plan - ${plan.features.slice(0, 2).join(", ")}`,
        },
        unit_amount: plan.price * 100, // Convert to cents
        recurring: {
          interval: plan.interval,
        },
      },
      quantity: 1,
    },
  ]

  // Add selected add-ons
  for (const addOnId of addOns) {
    const addOn = ADD_ONS.find((a) => a.id === addOnId)
    if (addOn) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: addOn.name,
            description: addOn.description,
          },
          unit_amount: addOn.price * 100, // Convert to cents
          recurring:
            addOn.type === "monthly"
              ? {
                  interval: "month",
                }
              : undefined,
        },
        quantity: 1,
      })
    }
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      planId,
      addOns: addOns.join(","),
    },
    subscription_data: {
      metadata: {
        userId,
        planId,
        addOns: addOns.join(","),
      },
    },
  })

  return session
}

// Additional utility functions
export function getPlanById(planId: string): StripePlan | undefined {
  return STRIPE_PLANS.find((plan) => plan.id === planId)
}

export function getAddOnById(addOnId: string): StripeAddOn | undefined {
  return ADD_ONS.find((addOn) => addOn.id === addOnId)
}

export function calculateTotalPrice(planId: string, addOnIds: string[] = []): number {
  const plan = getPlanById(planId)
  if (!plan) return 0

  let total = plan.price

  for (const addOnId of addOnIds) {
    const addOn = getAddOnById(addOnId)
    if (addOn) {
      total += addOn.price
    }
  }

  return total
}

// Export default for compatibility
export default stripe
