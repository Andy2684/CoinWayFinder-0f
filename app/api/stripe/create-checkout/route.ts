import { type NextRequest, NextResponse } from "next/server"
import { stripe, createCheckoutSession, createStripeCustomer } from "@/lib/stripe"
import { database } from "@/lib/database"
import { getServerSession } from "next-auth"

export async function POST(request: NextRequest) {
  try {
    const { planId } = await request.json()

    // Get user session (you'll need to implement this based on your auth system)
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const userEmail = session.user.email
    const userName = session.user.name || "User"

    // Validate plan
    if (!["basic", "premium", "enterprise"].includes(planId)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    // Get or create Stripe customer
    let customerId: string
    const userSettings = await database.getUserSettings(userId)

    if (userSettings?.stripeCustomerId) {
      customerId = userSettings.stripeCustomerId
    } else {
      const customer = await createStripeCustomer(userEmail, userName)
      customerId = customer.id

      // Save customer ID to database
      if (userSettings) {
        userSettings.stripeCustomerId = customerId
        await database.saveUserSettings(userSettings)
      }
    }

    // Create or get price for the plan
    let priceId: string

    try {
      // First, try to find existing price
      const prices = await stripe.prices.list({
        lookup_keys: [`${planId}_monthly`],
        expand: ["data.product"],
      })

      if (prices.data.length > 0) {
        priceId = prices.data[0].id
      } else {
        // Create new price if it doesn't exist
        const product = await stripe.products.create({
          name: `CoinWayFinder ${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan`,
          description: `Monthly subscription to CoinWayFinder ${planId} plan`,
        })

        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: planId === "basic" ? 2900 : planId === "premium" ? 4900 : 9900,
          currency: "usd",
          recurring: {
            interval: "month",
          },
          lookup_key: `${planId}_monthly`,
        })

        priceId = price.id
      }
    } catch (error) {
      console.error("Error creating/finding price:", error)
      return NextResponse.json({ error: "Failed to create price" }, { status: 500 })
    }

    // Create checkout session
    const checkoutSession = await createCheckoutSession({
      customerId,
      priceId,
      userId,
      planId,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/cancel`,
    })

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    })
  } catch (error) {
    console.error("Stripe checkout error:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
