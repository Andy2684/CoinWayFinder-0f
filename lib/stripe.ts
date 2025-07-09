import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set")
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
})

export const STRIPE_PLANS = {
  starter: {
    name: "Starter Plan",
    price: 2900, // $29.00 in cents
    interval: "month" as const,
    features: [
      "Up to 3 Active Bots (DCA, Scalping, Trend)",
      "AI Strategy Recommendations",
      "24h Signal Alerts via Telegram & Email",
      "Real-Time Whale Wallet Tracking",
      "Token Screener + Arbitrage Opportunities",
      "Full Crypto Analytics Dashboard",
      "Priority Support",
    ],
    limits: {
      maxBots: 3,
      maxDailyTrades: 100,
      maxInvestmentPerBot: 5000,
      aiRecommendations: true,
      whaleTracking: true,
      telegramAlerts: true,
      emailAlerts: true,
      arbitrageOpportunities: true,
      prioritySupport: true,
    },
    color: "blue",
    icon: "🔵",
  },
  pro: {
    name: "Pro Trader",
    price: 7900, // $79.00 in cents
    interval: "month" as const,
    features: [
      "Unlimited Bots (incl. Long/Short, Grid)",
      "Advanced AI Signal Customization",
      "Auto-Trading with Risk Guard",
      "All Exchanges Supported (Bybit, Binance, KuCoin, etc.)",
      "Telegram Bot + Dashboard Alerts",
      "Multi-language Interface",
      "CSV & PDF Reports + Invoice Downloads",
      "Early Beta Access to New Tools",
    ],
    limits: {
      maxBots: -1, // unlimited
      maxDailyTrades: -1, // unlimited
      maxInvestmentPerBot: 50000,
      aiRecommendations: true,
      whaleTracking: true,
      telegramAlerts: true,
      emailAlerts: true,
      arbitrageOpportunities: true,
      prioritySupport: true,
      advancedAI: true,
      autoTrading: true,
      allExchanges: true,
      reports: true,
      betaAccess: true,
    },
    color: "yellow",
    icon: "🟡",
    popular: true,
  },
  enterprise: {
    name: "Enterprise (Team & Funds)",
    price: 19900, // $199.00 in cents
    interval: "month" as const,
    features: [
      "Up to 5 Team Seats",
      "API Access + Webhooks",
      "Dedicated AI Risk Models",
      "Whale Wallet Analyzer PRO",
      "Portfolio Heatmaps, Alerts & Strategies",
      "1-on-1 Strategy Setup with CoinWayfinder Team",
      "Telegram Private Signal Feed",
      "SLA Uptime Guarantee",
    ],
    limits: {
      maxBots: -1, // unlimited
      maxDailyTrades: -1, // unlimited
      maxInvestmentPerBot: -1, // unlimited
      teamSeats: 5,
      apiAccess: true,
      webhooks: true,
      dedicatedAI: true,
      whaleAnalyzerPro: true,
      portfolioHeatmaps: true,
      personalSetup: true,
      privateSignals: true,
      slaGuarantee: true,
      aiRecommendations: true,
      whaleTracking: true,
      telegramAlerts: true,
      emailAlerts: true,
      arbitrageOpportunities: true,
      prioritySupport: true,
      advancedAI: true,
      autoTrading: true,
      allExchanges: true,
      reports: true,
      betaAccess: true,
    },
    color: "red",
    icon: "🔴",
  },
}

export const ADD_ONS = {
  extraBot: {
    name: "Extra Bot Slot",
    price: 500, // $5.00 in cents
    interval: "month" as const,
    description: "Add one additional bot slot to your plan",
  },
  backtesting: {
    name: "AI Strategy Backtesting Module",
    price: 900, // $9.00 in cents
    interval: "month" as const,
    description: "Test your strategies against historical data",
  },
  whaleArchive: {
    name: "Historical Whale Wallet Archive",
    price: 1400, // $14.00 in cents
    interval: "month" as const,
    description: "Access to historical whale transaction data",
  },
  customTelegram: {
    name: "Custom Telegram Bot Setup",
    price: 1900, // $19.00 in cents
    interval: "one_time" as const,
    description: "Personalized Telegram bot configuration",
  },
}

export async function createCheckoutSession({
  planId,
  userId,
  successUrl,
  cancelUrl,
  addOns = [],
}: {
  planId: keyof typeof STRIPE_PLANS
  userId: string
  successUrl: string
  cancelUrl: string
  addOns?: string[]
}) {
  const plan = STRIPE_PLANS[planId]

  if (!plan) {
    throw new Error(`Invalid plan ID: ${planId}`)
  }

  const lineItems = [
    {
      price_data: {
        currency: "usd",
        product_data: {
          name: plan.name,
          description: `CoinWayFinder ${plan.name} - ${plan.features.slice(0, 3).join(", ")}`,
        },
        unit_amount: plan.price,
        recurring: {
          interval: plan.interval,
        },
      },
      quantity: 1,
    },
  ]

  // Add selected add-ons
  for (const addOnId of addOns) {
    const addOn = ADD_ONS[addOnId as keyof typeof ADD_ONS]
    if (addOn) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: addOn.name,
            description: addOn.description,
          },
          unit_amount: addOn.price,
          recurring:
            addOn.interval === "one_time"
              ? undefined
              : {
                  interval: addOn.interval as "month",
                },
        },
        quantity: 1,
      })
    }
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      planId,
      addOns: addOns.join(","),
    },
    subscription_data: {
      metadata: {
        userId,
        planId,
        addOns: addOns.join(","),
      },
    },
  })

  return session
}
