import Stripe from "stripe"
import { database } from "./database" // Assuming database is imported from another file

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

export async function createCheckoutSession({
  planId,
  userId,
  addOns = [],
  successUrl,
  cancelUrl,
}: {
  planId: string
  userId: string
  addOns?: string[]
  successUrl: string
  cancelUrl: string
}): Promise<Stripe.Checkout.Session> {
  try {
    // Get user details
    const user = await database.getUserById(userId)
    if (!user) {
      throw new Error("User not found")
    }

    // Get price ID based on plan
    const priceIds = {
      starter: process.env.STRIPE_STARTER_PRICE_ID,
      pro: process.env.STRIPE_PRO_PRICE_ID,
      enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    }

    const priceId = priceIds[planId as keyof typeof priceIds]
    if (!priceId) {
      throw new Error("Invalid plan ID")
    }

    // Create or retrieve customer
    let customer: Stripe.Customer
    const existingCustomers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    })

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0]
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        name: user.name || user.email,
        metadata: {
          userId: userId,
        },
      })
    }

    // Prepare line items
    const lineItems = [
      {
        price: priceId,
        quantity: 1,
      },
    ]

    // Add add-ons
    for (const addOn of addOns) {
      const addOnPriceId = process.env[`STRIPE_${addOn.toUpperCase()}_PRICE_ID`]
      if (addOnPriceId) {
        lineItems.push({
          price: addOnPriceId,
          quantity: 1,
        })
      }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: userId,
        planId: planId,
        addOns: addOns.join(","),
      },
      subscription_data: {
        metadata: {
          userId: userId,
          planId: planId,
        },
        trial_period_days: 7, // 7-day trial
      },
      allow_promotion_codes: true,
      billing_address_collection: "required",
      customer_update: {
        address: "auto",
        name: "auto",
      },
    })

    return session
  } catch (error) {
    console.error("Error creating checkout session:", error)
    throw new Error("Failed to create checkout session")
  }
}

// Create customer portal session
export async function createCustomerPortalSession(
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
    console.error("Error creating customer portal session:", error)
    throw new Error("Failed to create customer portal session")
  }
}

// Get subscription details
export async function getSubscriptionDetails(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["customer", "items.data.price.product"],
    })
    return subscription
  } catch (error) {
    console.error("Error retrieving subscription:", error)
    throw new Error("Failed to retrieve subscription")
  }
}

// Cancel subscription at period end
export async function cancelSubscriptionAtPeriodEnd(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    })
    return subscription
  } catch (error) {
    console.error("Error cancelling subscription:", error)
    throw new Error("Failed to cancel subscription")
  }
}

// Reactivate cancelled subscription
export async function reactivateSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    })
    return subscription
  } catch (error) {
    console.error("Error reactivating subscription:", error)
    throw new Error("Failed to reactivate subscription")
  }
}

// Update subscription plan
export async function updateSubscriptionPlan(subscriptionId: string, newPriceId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)

    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      proration_behavior: "create_prorations",
    })

    return updatedSubscription
  } catch (error) {
    console.error("Error updating subscription plan:", error)
    throw new Error("Failed to update subscription plan")
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
