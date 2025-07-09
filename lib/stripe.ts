import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set")
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
})

export const STRIPE_PLANS = {
  basic: {
    name: "Basic Plan",
    price: 2900, // $29.00 in cents
    interval: "month" as const,
    features: ["5 Trading Bots", "100 Trades/Month", "All Strategies", "Email Support", "Basic Analytics"],
    limits: {
      maxBots: 5,
      maxDailyTrades: 100,
      maxInvestmentPerBot: 5000,
    },
  },
  premium: {
    name: "Premium Plan",
    price: 4900, // $49.00 in cents
    interval: "month" as const,
    features: [
      "15 Trading Bots",
      "500 Trades/Month",
      "AI Risk Analysis",
      "Priority Support",
      "Advanced Analytics",
      "Custom Strategies",
    ],
    limits: {
      maxBots: 15,
      maxDailyTrades: 500,
      maxInvestmentPerBot: 25000,
    },
  },
  enterprise: {
    name: "Enterprise Plan",
    price: 9900, // $99.00 in cents
    interval: "month" as const,
    features: [
      "Unlimited Bots",
      "Unlimited Trades",
      "White-label Solution",
      "24/7 Phone Support",
      "Custom Development",
      "API Access",
    ],
    limits: {
      maxBots: -1, // unlimited
      maxDailyTrades: -1, // unlimited
      maxInvestmentPerBot: -1, // unlimited
    },
  },
}

export async function createCheckoutSession({
  planId,
  userId,
  successUrl,
  cancelUrl,
}: {
  planId: keyof typeof STRIPE_PLANS
  userId: string
  successUrl: string
  cancelUrl: string
}) {
  const plan = STRIPE_PLANS[planId]

  if (!plan) {
    throw new Error(`Invalid plan ID: ${planId}`)
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: plan.name,
            description: `CoinWayFinder ${plan.name} - ${plan.features.join(", ")}`,
          },
          unit_amount: plan.price,
          recurring: {
            interval: plan.interval,
          },
        },
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

  return session
}
