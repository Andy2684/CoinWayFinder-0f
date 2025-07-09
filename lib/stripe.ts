// Mock Stripe implementation for development
interface StripeSession {
  id: string
  url: string
  payment_status: string
  customer_email?: string
  amount_total: number
  currency: string
  metadata: Record<string, string>
}

interface StripePrice {
  id: string
  nickname: string
  unit_amount: number
  currency: string
  recurring?: {
    interval: string
    interval_count: number
  }
}

interface StripeProduct {
  id: string
  name: string
  description: string
  metadata: Record<string, string>
}

// Mock Stripe class
class MockStripe {
  checkout = {
    sessions: {
      create: async (params: any): Promise<StripeSession> => {
        // Mock session creation
        const sessionId = `cs_mock_${Date.now()}`
        return {
          id: sessionId,
          url: `https://checkout.stripe.com/pay/${sessionId}`,
          payment_status: "unpaid",
          amount_total: params.line_items[0]?.price_data?.unit_amount || 2999,
          currency: "usd",
          metadata: params.metadata || {},
        }
      },
      retrieve: async (sessionId: string): Promise<StripeSession> => {
        return {
          id: sessionId,
          url: `https://checkout.stripe.com/pay/${sessionId}`,
          payment_status: "paid",
          customer_email: "customer@example.com",
          amount_total: 2999,
          currency: "usd",
          metadata: {},
        }
      },
    },
  }

  prices = {
    list: async (): Promise<{ data: StripePrice[] }> => {
      return {
        data: [
          {
            id: "price_basic_monthly",
            nickname: "Basic Monthly",
            unit_amount: 2999,
            currency: "usd",
            recurring: {
              interval: "month",
              interval_count: 1,
            },
          },
          {
            id: "price_pro_monthly",
            nickname: "Pro Monthly",
            unit_amount: 9999,
            currency: "usd",
            recurring: {
              interval: "month",
              interval_count: 1,
            },
          },
          {
            id: "price_enterprise_monthly",
            nickname: "Enterprise Monthly",
            unit_amount: 29999,
            currency: "usd",
            recurring: {
              interval: "month",
              interval_count: 1,
            },
          },
        ],
      }
    },
  }

  products = {
    list: async (): Promise<{ data: StripeProduct[] }> => {
      return {
        data: [
          {
            id: "prod_basic",
            name: "Basic Plan",
            description: "Perfect for beginners",
            metadata: {
              maxBots: "3",
              maxTrades: "1000",
            },
          },
          {
            id: "prod_pro",
            name: "Pro Plan",
            description: "For serious traders",
            metadata: {
              maxBots: "10",
              maxTrades: "10000",
            },
          },
          {
            id: "prod_enterprise",
            name: "Enterprise Plan",
            description: "Unlimited trading power",
            metadata: {
              maxBots: "unlimited",
              maxTrades: "unlimited",
            },
          },
        ],
      }
    },
  }

  webhooks = {
    constructEvent: (payload: any, signature: string, secret: string) => {
      // Mock webhook event construction
      return {
        id: `evt_mock_${Date.now()}`,
        type: "checkout.session.completed",
        data: {
          object: {
            id: "cs_mock_session",
            payment_status: "paid",
            customer_email: "customer@example.com",
            metadata: {},
          },
        },
      }
    },
  }
}

// Create mock Stripe instance
export const stripe = new MockStripe()

// Stripe plans configuration
export const STRIPE_PLANS = {
  basic: {
    priceId: "price_basic_monthly",
    name: "Basic",
    price: 29.99,
    currency: "USD",
    interval: "month",
    features: ["Up to 3 trading bots", "1,000 trades per month", "Basic strategies", "Email support"],
    limits: {
      maxBots: 3,
      maxTrades: 1000,
    },
  },
  pro: {
    priceId: "price_pro_monthly",
    name: "Pro",
    price: 99.99,
    currency: "USD",
    interval: "month",
    features: [
      "Up to 10 trading bots",
      "10,000 trades per month",
      "Advanced strategies",
      "Priority support",
      "Risk management tools",
    ],
    limits: {
      maxBots: 10,
      maxTrades: 10000,
    },
  },
  enterprise: {
    priceId: "price_enterprise_monthly",
    name: "Enterprise",
    price: 299.99,
    currency: "USD",
    interval: "month",
    features: [
      "Unlimited trading bots",
      "Unlimited trades",
      "All strategies",
      "24/7 support",
      "Custom integrations",
      "Dedicated account manager",
    ],
    limits: {
      maxBots: -1, // -1 means unlimited
      maxTrades: -1,
    },
  },
}

// Add-ons configuration
export const ADD_ONS = {
  extra_bots: {
    priceId: "price_extra_bots",
    name: "Extra Bot Slots",
    price: 9.99,
    currency: "USD",
    description: "Add 5 more bot slots to your plan",
  },
  priority_support: {
    priceId: "price_priority_support",
    name: "Priority Support",
    price: 19.99,
    currency: "USD",
    description: "24/7 priority customer support",
  },
}

// Main function to create checkout session
export async function createCheckoutSession(params: {
  priceId: string
  successUrl: string
  cancelUrl: string
  customerEmail?: string
  metadata?: Record<string, string>
}): Promise<StripeSession> {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: params.priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      customer_email: params.customerEmail,
      metadata: params.metadata || {},
      allow_promotion_codes: true,
      billing_address_collection: "required",
      subscription_data: {
        metadata: params.metadata || {},
      },
    })

    return session
  } catch (error) {
    console.error("Error creating checkout session:", error)
    throw new Error("Failed to create checkout session")
  }
}

// Utility functions
export function getPlanByPriceId(priceId: string) {
  return Object.values(STRIPE_PLANS).find((plan) => plan.priceId === priceId)
}

export function formatPrice(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount)
}

export function validateWebhookSignature(payload: string, signature: string): boolean {
  // Mock validation - always return true for development
  return true
}

export async function retrieveSession(sessionId: string): Promise<StripeSession> {
  return await stripe.checkout.sessions.retrieve(sessionId)
}

// Export types
export type { StripeSession, StripePrice, StripeProduct }
