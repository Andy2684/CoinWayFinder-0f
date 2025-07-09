// Mock Stripe implementation for development
export interface StripeCustomer {
  id: string
  email: string
  name: string
  created: number
}

export interface StripeSubscription {
  id: string
  customer: string
  status: "active" | "canceled" | "incomplete" | "past_due"
  current_period_start: number
  current_period_end: number
  plan: {
    id: string
    amount: number
    currency: string
    interval: "month" | "year"
  }
}

export interface StripeCheckoutSession {
  id: string
  url: string
  customer: string
  subscription: string
  payment_status: "paid" | "unpaid"
  status: "complete" | "expired" | "open"
}

// Mock data
const mockCustomers: StripeCustomer[] = [
  {
    id: "cus_mock_1",
    email: "premium@example.com",
    name: "Premium User",
    created: Date.now(),
  },
]

const mockSubscriptions: StripeSubscription[] = [
  {
    id: "sub_mock_1",
    customer: "cus_mock_1",
    status: "active",
    current_period_start: Date.now(),
    current_period_end: Date.now() + 30 * 24 * 60 * 60 * 1000,
    plan: {
      id: "price_premium_monthly",
      amount: 2999,
      currency: "usd",
      interval: "month",
    },
  },
]

const mockSessions: StripeCheckoutSession[] = []

// Pricing configuration
export const STRIPE_PLANS = {
  basic: {
    monthly: {
      priceId: "price_basic_monthly",
      amount: 999,
      currency: "usd",
    },
    yearly: {
      priceId: "price_basic_yearly",
      amount: 9999,
      currency: "usd",
    },
  },
  premium: {
    monthly: {
      priceId: "price_premium_monthly",
      amount: 2999,
      currency: "usd",
    },
    yearly: {
      priceId: "price_premium_yearly",
      amount: 29999,
      currency: "usd",
    },
  },
}

// Mock Stripe class
class MockStripe {
  customers = {
    create: async (params: { email: string; name?: string }): Promise<StripeCustomer> => {
      const customer: StripeCustomer = {
        id: `cus_mock_${Date.now()}`,
        email: params.email,
        name: params.name || "",
        created: Date.now(),
      }
      mockCustomers.push(customer)
      return customer
    },

    retrieve: async (customerId: string): Promise<StripeCustomer | null> => {
      return mockCustomers.find((c) => c.id === customerId) || null
    },

    list: async (params?: { email?: string }): Promise<{ data: StripeCustomer[] }> => {
      let customers = mockCustomers
      if (params?.email) {
        customers = customers.filter((c) => c.email === params.email)
      }
      return { data: customers }
    },
  }

  subscriptions = {
    create: async (params: {
      customer: string
      items: Array<{ price: string }>
      payment_behavior?: string
      expand?: string[]
    }): Promise<StripeSubscription> => {
      const priceId = params.items[0].price
      const plan = this.findPlanByPriceId(priceId)

      const subscription: StripeSubscription = {
        id: `sub_mock_${Date.now()}`,
        customer: params.customer,
        status: "active",
        current_period_start: Date.now(),
        current_period_end: Date.now() + (plan.interval === "year" ? 365 : 30) * 24 * 60 * 60 * 1000,
        plan: {
          id: priceId,
          amount: plan.amount,
          currency: plan.currency,
          interval: plan.interval,
        },
      }
      mockSubscriptions.push(subscription)
      return subscription
    },

    retrieve: async (subscriptionId: string): Promise<StripeSubscription | null> => {
      return mockSubscriptions.find((s) => s.id === subscriptionId) || null
    },

    update: async (subscriptionId: string, params: Partial<StripeSubscription>): Promise<StripeSubscription | null> => {
      const index = mockSubscriptions.findIndex((s) => s.id === subscriptionId)
      if (index === -1) return null

      mockSubscriptions[index] = { ...mockSubscriptions[index], ...params }
      return mockSubscriptions[index]
    },

    cancel: async (subscriptionId: string): Promise<StripeSubscription | null> => {
      const index = mockSubscriptions.findIndex((s) => s.id === subscriptionId)
      if (index === -1) return null

      mockSubscriptions[index].status = "canceled"
      return mockSubscriptions[index]
    },

    list: async (params?: { customer?: string }): Promise<{ data: StripeSubscription[] }> => {
      let subscriptions = mockSubscriptions
      if (params?.customer) {
        subscriptions = subscriptions.filter((s) => s.customer === params.customer)
      }
      return { data: subscriptions }
    },
  }

  checkout = {
    sessions: {
      create: async (params: {
        customer?: string
        customer_email?: string
        line_items: Array<{ price: string; quantity: number }>
        mode: "subscription" | "payment"
        success_url: string
        cancel_url: string
        metadata?: Record<string, string>
      }): Promise<StripeCheckoutSession> => {
        const session: StripeCheckoutSession = {
          id: `cs_mock_${Date.now()}`,
          url: `https://checkout.stripe.com/pay/cs_mock_${Date.now()}`,
          customer: params.customer || `cus_mock_${Date.now()}`,
          subscription: `sub_mock_${Date.now()}`,
          payment_status: "unpaid",
          status: "open",
        }
        mockSessions.push(session)
        return session
      },

      retrieve: async (sessionId: string): Promise<StripeCheckoutSession | null> => {
        return mockSessions.find((s) => s.id === sessionId) || null
      },
    },
  }

  webhookEndpoints = {
    create: async (params: { url: string; enabled_events: string[] }) => {
      return {
        id: `we_mock_${Date.now()}`,
        url: params.url,
        enabled_events: params.enabled_events,
        status: "enabled",
      }
    },
  }

  private findPlanByPriceId(priceId: string) {
    for (const [planName, plan] of Object.entries(STRIPE_PLANS)) {
      if (plan.monthly.priceId === priceId) {
        return { ...plan.monthly, interval: "month" as const }
      }
      if (plan.yearly.priceId === priceId) {
        return { ...plan.yearly, interval: "year" as const }
      }
    }
    // Default fallback
    return {
      amount: 999,
      currency: "usd",
      interval: "month" as const,
    }
  }
}

// Export mock Stripe instance
export const stripe = new MockStripe()

// Webhook signature verification (mock)
export function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  // In a real implementation, this would verify the Stripe webhook signature
  // For mock purposes, we'll just return true
  return true
}

// Construct webhook event (mock)
export function constructWebhookEvent(payload: string, signature: string, secret: string) {
  // Mock webhook event
  return {
    id: `evt_mock_${Date.now()}`,
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_mock_123",
        customer: "cus_mock_123",
        subscription: "sub_mock_123",
        payment_status: "paid",
        status: "complete",
      },
    },
    created: Date.now(),
  }
}

// Helper functions
export async function createCustomer(email: string, name?: string): Promise<StripeCustomer> {
  return stripe.customers.create({ email, name })
}

export async function createCheckoutSession(params: {
  customerId?: string
  customerEmail?: string
  priceId: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}): Promise<StripeCheckoutSession> {
  return stripe.checkout.sessions.create({
    customer: params.customerId,
    customer_email: params.customerEmail,
    line_items: [{ price: params.priceId, quantity: 1 }],
    mode: "subscription",
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: params.metadata,
  })
}

export async function getCustomerSubscriptions(customerId: string): Promise<StripeSubscription[]> {
  const result = await stripe.subscriptions.list({ customer: customerId })
  return result.data
}

export async function cancelSubscription(subscriptionId: string): Promise<StripeSubscription | null> {
  return stripe.subscriptions.cancel(subscriptionId)
}

export function formatPrice(amount: number, currency = "usd"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100)
}

export function getPlanDisplayName(planId: string): string {
  const planNames: Record<string, string> = {
    price_basic_monthly: "Basic Monthly",
    price_basic_yearly: "Basic Yearly",
    price_premium_monthly: "Premium Monthly",
    price_premium_yearly: "Premium Yearly",
  }
  return planNames[planId] || "Unknown Plan"
}
