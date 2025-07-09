import { type NextRequest, NextResponse } from "next/server"
import { createCheckoutSession } from "@/lib/stripe"
import { database } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { planId, userId, addOns = [] } = body

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

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    const checkoutSession = await createCheckoutSession({
      planId,
      userId,
      addOns,
      successUrl: `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/subscription/cancel`,
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
