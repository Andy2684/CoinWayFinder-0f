// Mock Stripe implementation for development
export interface StripeSession {
  id: string
  url: string
  status: "open" | "complete" | "expired"
  customer_email?: string
  amount_total?: number
  currency?: string
}

export interface StripePrice {
  id: string
  unit_amount: number
  currency: string
  recurring?: {
    interval: "month" | "year"
  }
}

export class MockStripe {
  static async createCheckoutSession(params: {
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
    mode: "payment" | "subscription"
    success_url: string
    cancel_url: string
    customer_email?: string
  }): Promise<StripeSession> {
    const sessionId = `cs_mock_${Date.now()}`

    return {
      id: sessionId,
      url: `https://checkout.stripe.com/pay/${sessionId}`,
      status: "open",
      customer_email: params.customer_email,
      amount_total: params.price_data.unit_amount,
      currency: params.price_data.currency,
    }
  }

  static async retrieveSession(sessionId: string): Promise<StripeSession | null> {
    // Mock session retrieval
    if (sessionId.startsWith("cs_mock_")) {
      return {
        id: sessionId,
        url: `https://checkout.stripe.com/pay/${sessionId}`,
        status: "complete",
        customer_email: "user@example.com",
        amount_total: 2999,
        currency: "usd",
      }
    }
    return null
  }

  static async constructEvent(payload: string, signature: string, secret: string) {
    // Mock webhook event construction
    return {
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_mock_" + Date.now(),
          customer_email: "user@example.com",
          subscription: "sub_mock_" + Date.now(),
          amount_total: 2999,
          currency: "usd",
        },
      },
    }
  }
}

// Export as default for compatibility
export default MockStripe

// Named exports for specific functions
export const createCheckoutSession = MockStripe.createCheckoutSession
export const retrieveSession = MockStripe.retrieveSession
export const constructEvent = MockStripe.constructEvent
