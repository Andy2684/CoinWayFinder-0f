// Mock Stripe Implementation for CoinWayFinder

// Stripe Plans Configuration
export const STRIPE_PLANS = {
  pro: {
    priceId: "price_pro_monthly",
    name: "Pro Plan",
    price: 29.99,
    interval: "month",
    features: ["Up to 5 bots", "Advanced strategies", "Email support"],
  },
  enterprise: {
    priceId: "price_enterprise_monthly",
    name: "Enterprise Plan",
    price: 99.99,
    interval: "month",
    features: ["Up to 50 bots", "All strategies", "Priority support", "Custom integrations"],
  },
}

export const ADD_ONS = {
  extra_bots: {
    priceId: "price_extra_bots",
    name: "Extra Bot Slots",
    price: 9.99,
    description: "Add 5 more bot slots to your plan",
  },
  premium_support: {
    priceId: "price_premium_support",
    name: "Premium Support",
    price: 19.99,
    description: "24/7 priority support with dedicated account manager",
  },
}

// Mock Stripe Types
interface StripeSession {
  id: string
  url: string
  payment_status: "paid" | "unpaid" | "no_payment_required"
  customer_email?: string
  metadata?: Record<string, string>
}

interface StripeCustomer {
  id: string
  email: string
  name?: string
  metadata?: Record<string, string>
}

interface StripeSubscription {
  id: string
  customer: string
  status: "active" | "canceled" | "incomplete" | "past_due"
  current_period_end: number
  items: {
    data: Array<{
      price: {
        id: string
        nickname?: string
      }
    }>
  }
}

// Mock Stripe Class
class MockStripe {
  checkout = {
    sessions: {
      create: async (params: {
        payment_method_types: string[]
        line_items: Array<{
          price: string
          quantity: number
        }>
        mode: "payment" | "subscription"
        success_url: string
        cancel_url: string
        customer_email?: string
        metadata?: Record<string, string>
      }): Promise<StripeSession> => {
        // Mock session creation
        const sessionId = `cs_mock_${Date.now()}`
        return {
          id: sessionId,
          url: `https://checkout.stripe.com/pay/${sessionId}`,
          payment_status: "unpaid",
          customer_email: params.customer_email,
          metadata: params.metadata,
        }
      },

      retrieve: async (sessionId: string): Promise<StripeSession> => {
        // Mock session retrieval
        return {
          id: sessionId,
          url: `https://checkout.stripe.com/pay/${sessionId}`,
          payment_status: "paid",
          customer_email: "user@example.com",
        }
      },
    },
  }

  customers = {
    create: async (params: {
      email: string
      name?: string
      metadata?: Record<string, string>
    }): Promise<StripeCustomer> => {
      return {
        id: `cus_mock_${Date.now()}`,
        email: params.email,
        name: params.name,
        metadata: params.metadata,
      }
    },

    retrieve: async (customerId: string): Promise<StripeCustomer> => {
      return {
        id: customerId,
        email: "user@example.com",
        name: "Mock Customer",
      }
    },
  }

  subscriptions = {
    create: async (params: {
      customer: string
      items: Array<{ price: string }>
      metadata?: Record<string, string>
    }): Promise<StripeSubscription> => {
      return {
        id: `sub_mock_${Date.now()}`,
        customer: params.customer,
        status: "active",
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days from now
        items: {
          data: params.items.map((item) => ({
            price: {
              id: item.price,
              nickname: STRIPE_PLANS.pro.name,
            },
          })),
        },
      }
    },

    retrieve: async (subscriptionId: string): Promise<StripeSubscription> => {
      return {
        id: subscriptionId,
        customer: "cus_mock_customer",
        status: "active",
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
        items: {
          data: [
            {
              price: {
                id: STRIPE_PLANS.pro.priceId,
                nickname: STRIPE_PLANS.pro.name,
              },
            },
          ],
        },
      }
    },

    cancel: async (subscriptionId: string): Promise<StripeSubscription> => {
      return {
        id: subscriptionId,
        customer: "cus_mock_customer",
        status: "canceled",
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
        items: {
          data: [
            {
              price: {
                id: STRIPE_PLANS.pro.priceId,
                nickname: STRIPE_PLANS.pro.name,
              },
            },
          ],
        },
      }
    },
  }

  webhooks = {
    constructEvent: (payload: string | Buffer, signature: string, secret: string) => {
      // Mock webhook event construction
      return {
        id: `evt_mock_${Date.now()}`,
        type: "checkout.session.completed",
        data: {
          object: {
            id: "cs_mock_session",
            payment_status: "paid",
            customer_email: "user@example.com",
            metadata: {},
          },
        },
      }
    },
  }
}

// Create mock Stripe instance
export const stripe = new MockStripe()

// Checkout Session Creation Function
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
      metadata: params.metadata,
    })

    return session
  } catch (error) {
    console.error("Error creating checkout session:", error)
    throw new Error("Failed to create checkout session")
  }
}

// Utility Functions
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function getPlanByPriceId(priceId: string) {
  return Object.values(STRIPE_PLANS).find((plan) => plan.priceId === priceId)
}

export function getAddOnByPriceId(priceId: string) {
  return Object.values(ADD_ONS).find((addon) => addon.priceId === priceId)
}

// Webhook signature verification (mock)
export function verifyWebhookSignature(payload: string | Buffer, signature: string, secret: string): boolean {
  // In a real implementation, this would verify the Stripe webhook signature
  // For mock purposes, we'll always return true
  return true
}

// Export default stripe instance
export default stripe
