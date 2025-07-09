import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set")
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
  typescript: true,
})

export const STRIPE_PLANS = {
  basic: {
    name: "Basic Plan",
    price: 2900, // $29.00 in cents
    interval: "month",
    features: ["3 Trading Bots", "100 Trades/Month", "AI Analysis", "News Alerts", "Email Support"],
  },
  premium: {
    name: "Premium Plan",
    price: 4900, // $49.00 in cents
    interval: "month",
    features: [
      "10 Trading Bots",
      "1,000 Trades/Month",
      "AI Analysis",
      "Whale Tracking",
      "News Alerts",
      "Premium Strategies",
      "API Access",
      "Priority Support",
    ],
  },
  enterprise: {
    name: "Enterprise Plan",
    price: 9900, // $99.00 in cents
    interval: "month",
    features: [
      "Unlimited Trading Bots",
      "Unlimited Trades",
      "AI Analysis",
      "Whale Tracking",
      "News Alerts",
      "Premium Strategies",
      "API Access",
      "Priority Support",
      "Custom Integrations",
    ],
  },
}

export async function createStripeCustomer(email: string, name: string) {
  return await stripe.customers.create({
    email,
    name,
  })
}

export async function createCheckoutSession({
  customerId,
  priceId,
  userId,
  planId,
  successUrl,
  cancelUrl,
}: {
  customerId: string
  priceId: string
  userId: string
  planId: string
  successUrl: string
  cancelUrl: string
}) {
  return await stripe.checkout.sessions.create({
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
    metadata: {
      userId,
      planId,
    },
    subscription_data: {
      metadata: {
        userId,
        planId,
      },
    },
  })
}
