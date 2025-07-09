import Stripe from "stripe"

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is not set in environment variables")
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-06-20",
  typescript: true,
})

export const stripeConfig = {
  publishableKey: stripePublishableKey,
  secretKey: stripeSecretKey,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
}

// Stripe utility functions
export class StripeService {
  static async createCustomer(email: string, name?: string): Promise<Stripe.Customer> {
    return stripe.customers.create({
      email,
      name,
    })
  }

  static async createCheckoutSession(params: {
    customerId?: string
    customerEmail?: string
    priceId: string
    successUrl: string
    cancelUrl: string
    metadata?: Record<string, string>
  }): Promise<Stripe.Checkout.Session> {
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
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
      metadata: params.metadata,
    }

    if (params.customerId) {
      sessionParams.customer = params.customerId
    } else if (params.customerEmail) {
      sessionParams.customer_email = params.customerEmail
    }

    return stripe.checkout.sessions.create(sessionParams)
  }

  static async createPortalSession(customerId: string, returnUrl: string): Promise<Stripe.BillingPortal.Session> {
    return stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })
  }

  static async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return stripe.subscriptions.retrieve(subscriptionId)
  }

  static async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd = true): Promise<Stripe.Subscription> {
    if (cancelAtPeriodEnd) {
      return stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      })
    } else {
      return stripe.subscriptions.cancel(subscriptionId)
    }
  }

  static async reactivateSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    })
  }

  static async constructWebhookEvent(
    payload: string | Buffer,
    signature: string,
    webhookSecret: string,
  ): Promise<Stripe.Event> {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  }

  static async getCustomer(customerId: string): Promise<Stripe.Customer> {
    return stripe.customers.retrieve(customerId) as Promise<Stripe.Customer>
  }

  static async updateCustomer(customerId: string, params: Stripe.CustomerUpdateParams): Promise<Stripe.Customer> {
    return stripe.customers.update(customerId, params)
  }

  static async getInvoices(customerId: string, limit = 10): Promise<Stripe.Invoice[]> {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit,
    })
    return invoices.data
  }

  static async getPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    })
    return paymentMethods.data
  }

  static formatAmount(amount: number, currency = "usd"): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  }

  static formatDate(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleDateString()
  }
}

export default stripe
