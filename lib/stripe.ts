import Stripe from "stripe"

// Initialize Stripe with the secret key
const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY ||
    "sk_test_51Rj1tARG8pNq5FjpZxVCMfptuZ1SLQo3PsmtmtPs4LwdBv3KlBBD24FHJfKnnarcKBDRl7LTcjdTBKMtYKp6JDbU00gnNTd0Bq",
  {
    apiVersion: "2023-08-16",
  },
)

// Pricing configuration with trial support
export const STRIPE_PLANS = {
  basic: {
    monthly: {
      priceId: "price_basic_monthly",
      amount: 2900, // $29.00
      currency: "usd",
      interval: "month",
      name: "Basic Monthly",
      features: ["Up to 3 bots", "100 trades/month", "AI Analysis", "Email support"],
      trialDays: 3,
    },
    yearly: {
      priceId: "price_basic_yearly",
      amount: 29000, // $290.00 (save $58)
      currency: "usd",
      interval: "year",
      name: "Basic Yearly",
      features: ["Up to 3 bots", "100 trades/month", "AI Analysis", "Email support", "2 months free"],
      trialDays: 3,
    },
  },
  premium: {
    monthly: {
      priceId: "price_premium_monthly",
      amount: 9900, // $99.00
      currency: "usd",
      interval: "month",
      name: "Premium Monthly",
      features: ["Up to 10 bots", "1,000 trades/month", "Advanced AI", "Whale tracking", "Priority support"],
      trialDays: 3,
    },
    yearly: {
      priceId: "price_premium_yearly",
      amount: 99000, // $990.00 (save $198)
      currency: "usd",
      interval: "year",
      name: "Premium Yearly",
      features: [
        "Up to 10 bots",
        "1,000 trades/month",
        "Advanced AI",
        "Whale tracking",
        "Priority support",
        "2 months free",
      ],
      trialDays: 3,
    },
  },
  enterprise: {
    monthly: {
      priceId: "price_enterprise_monthly",
      amount: 29900, // $299.00
      currency: "usd",
      interval: "month",
      name: "Enterprise Monthly",
      features: [
        "Unlimited bots",
        "Unlimited trades",
        "All AI features",
        "Custom strategies",
        "24/7 support",
        "API access",
      ],
      trialDays: 3,
    },
    yearly: {
      priceId: "price_enterprise_yearly",
      amount: 299000, // $2,990.00 (save $598)
      currency: "usd",
      interval: "year",
      name: "Enterprise Yearly",
      features: [
        "Unlimited bots",
        "Unlimited trades",
        "All AI features",
        "Custom strategies",
        "24/7 support",
        "API access",
        "2 months free",
      ],
      trialDays: 3,
    },
  },
}

// Add-ons configuration
export const ADD_ONS = {
  extra_bots: {
    priceId: "price_extra_bots",
    name: "Extra Bot Slots",
    price: 999, // $9.99
    description: "Add 5 more bot slots to your plan",
    features: ["5 additional bot slots", "Same features as your current plan"],
  },
  premium_support: {
    priceId: "price_premium_support",
    name: "Premium Support",
    price: 1999, // $19.99
    description: "24/7 priority support with dedicated account manager",
    features: ["24/7 priority support", "Dedicated account manager", "Phone support", "Custom integrations help"],
  },
  advanced_analytics: {
    priceId: "price_advanced_analytics",
    name: "Advanced Analytics",
    price: 1499, // $14.99
    description: "Advanced trading analytics and reporting",
    features: ["Advanced performance metrics", "Custom reports", "Risk analysis", "Portfolio optimization"],
  },
  api_access: {
    priceId: "price_api_access",
    name: "API Access",
    price: 2499, // $24.99
    description: "Full API access for custom integrations",
    features: ["REST API access", "Webhook notifications", "Custom integrations", "Developer documentation"],
  },
}

// Create checkout session
export function createCheckoutSession(params: Stripe.Checkout.SessionCreateParams) {
  return stripe.checkout.sessions.create(params)
}

// Retrieve checkout session
export function retrieveCheckoutSession(sessionId: string) {
  return stripe.checkout.sessions.retrieve(sessionId)
}

// Create customer
export function createCustomer(params: Stripe.CustomerCreateParams) {
  return stripe.customers.create(params)
}

// Retrieve customer
export function retrieveCustomer(customerId: string) {
  return stripe.customers.retrieve(customerId)
}

// Update customer
export function updateCustomer(customerId: string, params: Stripe.CustomerUpdateParams) {
  return stripe.customers.update(customerId, params)
}

// Create subscription
export function createSubscription(params: Stripe.SubscriptionCreateParams) {
  return stripe.subscriptions.create(params)
}

// Retrieve subscription
export function retrieveSubscription(subscriptionId: string) {
  return stripe.subscriptions.retrieve(subscriptionId)
}

// Update subscription
export function updateSubscription(subscriptionId: string, params: Stripe.SubscriptionUpdateParams) {
  return stripe.subscriptions.update(subscriptionId, params)
}

// Cancel subscription
export function cancelSubscription(subscriptionId: string) {
  return stripe.subscriptions.cancel(subscriptionId)
}

// List customer subscriptions
export function listCustomerSubscriptions(customerId: string) {
  return stripe.subscriptions.list({ customer: customerId })
}

// Construct webhook event
export function constructWebhookEvent(payload: string | Buffer, signature: string, secret: string) {
  return stripe.webhooks.constructEvent(payload, signature, secret)
}

// Helper function to create a checkout session for subscription with trial
export async function createSubscriptionCheckout({
  priceId,
  customerId,
  customerEmail,
  successUrl,
  cancelUrl,
  metadata = {},
  trialDays = 3,
}: {
  priceId: string
  customerId?: string
  customerEmail?: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
  trialDays?: number
}) {
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
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
    metadata,
    allow_promotion_codes: true,
    billing_address_collection: "required",
    customer_update: {
      address: "auto",
      name: "auto",
    },
    subscription_data: {
      trial_period_days: trialDays,
    },
  }

  if (customerId) {
    sessionParams.customer = customerId
  } else if (customerEmail) {
    sessionParams.customer_email = customerEmail
  }

  return createCheckoutSession(sessionParams)
}

// Helper function to create a one-time payment checkout
export async function createPaymentCheckout({
  amount,
  currency = "usd",
  customerId,
  customerEmail,
  successUrl,
  cancelUrl,
  metadata = {},
  description,
}: {
  amount: number
  currency?: string
  customerId?: string
  customerEmail?: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
  description?: string
}) {
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency,
          product_data: {
            name: description || "CoinWayFinder Payment",
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
    billing_address_collection: "required",
  }

  if (customerId) {
    sessionParams.customer = customerId
  } else if (customerEmail) {
    sessionParams.customer_email = customerEmail
  }

  return createCheckoutSession(sessionParams)
}

// Helper function to get plan details by price ID
export function getPlanByPriceId(priceId: string) {
  for (const [planName, plan] of Object.entries(STRIPE_PLANS)) {
    if (plan.monthly.priceId === priceId) {
      return { ...plan.monthly, planName, billing: "monthly" }
    }
    if (plan.yearly.priceId === priceId) {
      return { ...plan.yearly, planName, billing: "yearly" }
    }
  }
  return null
}

// Helper function to get add-on details by price ID
export function getAddOnByPriceId(priceId: string) {
  return Object.values(ADD_ONS).find((addon) => addon.priceId === priceId) || null
}

// Helper function to format price
export function formatPrice(amount: number, currency = "usd"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100)
}

// Helper function to get all available plans
export function getAllPlans() {
  const plans = []
  for (const [planName, plan] of Object.entries(STRIPE_PLANS)) {
    plans.push({
      ...plan.monthly,
      planName,
      billing: "monthly",
    })
    plans.push({
      ...plan.yearly,
      planName,
      billing: "yearly",
    })
  }
  return plans
}

// Helper function to get all available add-ons
export function getAllAddOns() {
  return Object.values(ADD_ONS)
}

// Helper function to calculate savings for yearly plans
export function calculateYearlySavings(monthlyAmount: number, yearlyAmount: number): number {
  const monthlyYearly = monthlyAmount * 12
  return monthlyYearly - yearlyAmount
}

// Helper function to verify webhook signature
export function verifyWebhookSignature(payload: string | Buffer, signature: string, secret: string): boolean {
  try {
    stripe.webhooks.constructEvent(payload, signature, secret)
    return true
  } catch (error) {
    console.error("Webhook signature verification failed:", error)
    return false
  }
}

// Helper function to create trial checkout (free trial without payment method)
export async function createTrialCheckout({
  userId,
  successUrl,
  cancelUrl,
}: {
  userId: string
  successUrl: string
  cancelUrl: string
}) {
  // For a free trial, we don't need Stripe checkout
  // This would be handled by our internal trial system
  return {
    url: `${successUrl}?trial=started&userId=${userId}`,
  }
}

// Export the stripe instance
export { stripe }
export default stripe
