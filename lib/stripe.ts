import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set in environment variables")
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
  typescript: true,
})

export const STRIPE_PRICE_IDS = {
  basic_monthly: "price_basic_monthly",
  premium_monthly: "price_premium_monthly",
  enterprise_monthly: "price_enterprise_monthly",
  basic_yearly: "price_basic_yearly",
  premium_yearly: "price_premium_yearly",
  enterprise_yearly: "price_enterprise_yearly",
}

export const SUBSCRIPTION_PLANS = {
  free: {
    id: "free",
    name: "Free Trial",
    price: 0,
    interval: "month" as const,
    features: {
      maxBots: 2,
      strategies: ["Basic DCA", "Simple Grid"],
      exchanges: ["Binance"],
      aiRiskAnalysis: false,
      prioritySupport: false,
      advancedAnalytics: false,
      customStrategies: false,
      apiAccess: false,
    },
    limits: {
      maxInvestmentPerBot: 100,
      maxDailyTrades: 10,
      maxLeverage: 1,
    },
  },
  basic: {
    id: "basic",
    name: "Basic",
    price: 29,
    interval: "month" as const,
    stripePrice: STRIPE_PRICE_IDS.basic_monthly,
    features: {
      maxBots: 5,
      strategies: ["DCA", "Grid Trading", "Scalping"],
      exchanges: ["Binance", "Coinbase", "Kraken"],
      aiRiskAnalysis: true,
      prioritySupport: false,
      advancedAnalytics: true,
      customStrategies: false,
      apiAccess: false,
    },
    limits: {
      maxInvestmentPerBot: 1000,
      maxDailyTrades: 100,
      maxLeverage: 3,
    },
  },
  premium: {
    id: "premium",
    name: "Premium",
    price: 99,
    interval: "month" as const,
    stripePrice: STRIPE_PRICE_IDS.premium_monthly,
    features: {
      maxBots: 15,
      strategies: ["All Strategies", "AI Smart Bot"],
      exchanges: ["All Supported Exchanges"],
      aiRiskAnalysis: true,
      prioritySupport: true,
      advancedAnalytics: true,
      customStrategies: true,
      apiAccess: true,
    },
    limits: {
      maxInvestmentPerBot: 10000,
      maxDailyTrades: 1000,
      maxLeverage: 10,
    },
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    price: 299,
    interval: "month" as const,
    stripePrice: STRIPE_PRICE_IDS.enterprise_monthly,
    features: {
      maxBots: -1, // unlimited
      strategies: ["All Strategies", "Custom Development"],
      exchanges: ["All + Custom Integrations"],
      aiRiskAnalysis: true,
      prioritySupport: true,
      advancedAnalytics: true,
      customStrategies: true,
      apiAccess: true,
    },
    limits: {
      maxInvestmentPerBot: -1, // unlimited
      maxDailyTrades: -1, // unlimited
      maxLeverage: 20,
    },
  },
}
