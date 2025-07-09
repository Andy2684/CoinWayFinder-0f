import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set")
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
})

export const STRIPE_PLANS = {
  basic: {
    priceId: "price_basic_monthly",
    yearlyPriceId: "price_basic_yearly",
    name: "Basic",
    price: 29,
    yearlyPrice: 290,
    trialDays: 3,
    features: ["3 Trading Bots", "100 Trades/Month", "AI Market Analysis", "Basic Strategies", "Email Support"],
  },
  pro: {
    priceId: "price_pro_monthly",
    yearlyPriceId: "price_pro_yearly",
    name: "Pro",
    price: 99,
    yearlyPrice: 990,
    trialDays: 3,
    features: [
      "10 Trading Bots",
      "1,000 Trades/Month",
      "Advanced AI Analysis",
      "Whale Tracking",
      "All Strategies",
      "Priority Support",
    ],
  },
  enterprise: {
    priceId: "price_enterprise_monthly",
    yearlyPriceId: "price_enterprise_yearly",
    name: "Enterprise",
    price: 299,
    yearlyPrice: 2990,
    trialDays: 3,
    features: [
      "Unlimited Bots",
      "Unlimited Trades",
      "Custom AI Models",
      "Advanced Analytics",
      "White-label Options",
      "Dedicated Support",
    ],
  },
}

export async function createSubscriptionCheckout(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  trialDays?: number,
) {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: trialDays
      ? {
          trial_period_days: trialDays,
        }
      : undefined,
  })

  return session
}

export async function createTrialCheckout(customerId: string, priceId: string, successUrl: string, cancelUrl: string) {
  return createSubscriptionCheckout(customerId, priceId, successUrl, cancelUrl, 3)
}

export async function createCustomer(email: string, name: string) {
  const customer = await stripe.customers.create({
    email,
    name,
  })

  return customer
}

export async function getSubscription(subscriptionId: string) {
  return await stripe.subscriptions.retrieve(subscriptionId)
}

export async function cancelSubscription(subscriptionId: string) {
  return await stripe.subscriptions.cancel(subscriptionId)
}

export async function updateSubscription(subscriptionId: string, priceId: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  return await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: priceId,
      },
    ],
  })
}
