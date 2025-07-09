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
      create: async (params: any) => {
        return {
          id: `cs_mock_${Date.now()}`,
          url: `https://checkout.stripe.com/pay/cs_mock_${Date.now()}`,
          payment_status: "unpaid",
          customer_email: params.customer_email,
          metadata: params.metadata || {},
        }
      },
      retrieve: async (sessionId: string) => {
        return {
          id: sessionId,
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
    constructEvent: (payload: any, signature: string, secret: string) => {
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
