import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export { stripe }

export interface CheckoutSessionData {
  priceId: string
  userId: string
  userEmail: string
  successUrl: string
  cancelUrl: string
  planName?: string
}

export async function createCheckoutSession(data: CheckoutSessionData): Promise<Stripe.Checkout.Session> {
  try {
    // Create or retrieve customer
    let customer: Stripe.Customer

    const existingCustomers = await stripe.customers.list({
      email: data.userEmail,
      limit: 1,
    })

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0]
    } else {
      customer = await stripe.customers.create({
        email: data.userEmail,
        metadata: {
          userId: data.userId,
        },
      })
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ["card"],
      line_items: [
        {
          price: data.priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: data.successUrl,
      cancel_url: data.cancelUrl,
      metadata: {
        userId: data.userId,
        planName: data.planName || "",
      },
      subscription_data: {
        metadata: {
          userId: data.userId,
        },
      },
    })

    return session
  } catch (error) {
    console.error("Error creating checkout session:", error)
    throw new Error("Failed to create checkout session")
  }
}

export async function retrieveCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "customer"],
    })
    return session
  } catch (error) {
    console.error("Error retrieving checkout session:", error)
    throw new Error("Failed to retrieve checkout session")
  }
}

export async function createPortalSession(
  customerId: string,
  returnUrl: string,
): Promise<Stripe.BillingPortal.Session> {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })
    return session
  } catch (error) {
    console.error("Error creating portal session:", error)
    throw new Error("Failed to create portal session")
  }
}

export async function cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId)
    return subscription
  } catch (error) {
    console.error("Error cancelling subscription:", error)
    throw new Error("Failed to cancel subscription")
  }
}

export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    return subscription
  } catch (error) {
    console.error("Error retrieving subscription:", error)
    throw new Error("Failed to retrieve subscription")
  }
}

export async function updateSubscription(
  subscriptionId: string,
  updates: Stripe.SubscriptionUpdateParams,
): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, updates)
    return subscription
  } catch (error) {
    console.error("Error updating subscription:", error)
    throw new Error("Failed to update subscription")
  }
}

export async function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  secret: string,
): Promise<Stripe.Event> {
  try {
    const event = stripe.webhooks.constructEvent(payload, signature, secret)
    return event
  } catch (error) {
    console.error("Error constructing webhook event:", error)
    throw new Error("Failed to construct webhook event")
  }
}

// Helper function to format price for display
export function formatPrice(amount: number, currency = "usd"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100)
}

// Helper function to get price from Stripe
export async function getPrice(priceId: string): Promise<Stripe.Price> {
  try {
    const price = await stripe.prices.retrieve(priceId)
    return price
  } catch (error) {
    console.error("Error retrieving price:", error)
    throw new Error("Failed to retrieve price")
  }
}

// Helper function to list all prices for a product
export async function listPrices(productId?: string): Promise<Stripe.Price[]> {
  try {
    const prices = await stripe.prices.list({
      product: productId,
      active: true,
    })
    return prices.data
  } catch (error) {
    console.error("Error listing prices:", error)
    throw new Error("Failed to list prices")
  }
}
