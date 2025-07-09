import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { database } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { planId, userId, addOns = [], billingCycle = "monthly" } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    if (!planId || !["starter", "pro", "enterprise"].includes(planId)) {
      return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 })
    }

    // Verify user exists
    const user = await database.getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get price IDs based on plan and billing cycle
    const priceIds = {
      starter: {
        monthly: process.env.STRIPE_STARTER_PRICE_ID,
        yearly: process.env.STRIPE_STARTER_YEARLY_PRICE_ID,
      },
      pro: {
        monthly: process.env.STRIPE_PRO_PRICE_ID,
        yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID,
      },
      enterprise: {
        monthly: process.env.STRIPE_ENTERPRISE_PRICE_ID,
        yearly: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID,
      },
    }

    const priceId = priceIds[planId as keyof typeof priceIds][billingCycle as keyof typeof priceIds.starter]

    if (!priceId) {
      return NextResponse.json({ error: "Price ID not configured" }, { status: 500 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

    // Create or get customer
    let customer
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

    // Add add-ons if any
    if (addOns.length > 0) {
      for (const addOn of addOns) {
        const addOnPriceId = process.env[`STRIPE_${addOn.toUpperCase()}_PRICE_ID`]
        if (addOnPriceId) {
          lineItems.push({
            price: addOnPriceId,
            quantity: 1,
          })
        }
      }
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "subscription",
      success_url: `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/subscription/cancel`,
      metadata: {
        userId: userId,
        planId: planId,
        billingCycle: billingCycle,
        addOns: addOns.join(","),
      },
      subscription_data: {
        metadata: {
          userId: userId,
          planId: planId,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: "required",
      customer_update: {
        address: "auto",
        name: "auto",
      },
    })

    return NextResponse.json({
      success: true,
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    })
  } catch (error) {
    console.error("Checkout session creation failed:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create checkout session",
      },
      { status: 500 },
    )
  }
}
