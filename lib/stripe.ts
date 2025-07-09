import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export interface CheckoutSessionData {
  priceId: string
  userId: string
  userEmail: string
  successUrl: string
  cancelUrl: string
  trialDays?: number
}

export async function createCheckoutSession(data: CheckoutSessionData): Promise<Stripe.Checkout.Session> {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: data.priceId,
        quantity: 1,
      },
    ],
    customer_email: data.userEmail,
    metadata: {
      userId: data.userId,
    },
    subscription_data: data.trialDays
      ? {
          trial_period_days: data.trialDays,
        }
      : undefined,
    success_url: data.successUrl,
    cancel_url: data.cancelUrl,
  })

  return session
}

export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string,
): Promise<Stripe.BillingPortal.Session> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session
}

export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
  try {
    return await stripe.subscriptions.retrieve(subscriptionId)
  } catch (error) {
    console.error("Error retrieving subscription:", error)
    return null
  }
}

export async function cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.cancel(subscriptionId)
}

export async function updateSubscription(
  subscriptionId: string,
  updates: Stripe.SubscriptionUpdateParams,
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.update(subscriptionId, updates)
}

export async function createCustomer(email: string, name?: string): Promise<Stripe.Customer> {
  return await stripe.customers.create({
    email,
    name,
  })
}

export async function getCustomer(customerId: string): Promise<Stripe.Customer | null> {
  try {
    const customer = await stripe.customers.retrieve(customerId)
    return customer as Stripe.Customer
  } catch (error) {
    console.error("Error retrieving customer:", error)
    return null
  }
}

export async function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  secret: string,
): Promise<Stripe.Event> {
  return stripe.webhooks.constructEvent(payload, signature, secret)
}

export { stripe }
