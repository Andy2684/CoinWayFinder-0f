import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"

export async function GET(request: NextRequest, { params }: { params: { sessionId: string } }) {
  try {
    const { sessionId } = params

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "customer"],
    })

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        amount_total: session.amount_total,
        currency: session.currency,
        customer_details: session.customer_details,
        metadata: session.metadata,
        payment_status: session.payment_status,
        status: session.status,
        line_items: session.line_items?.data || [],
      },
    })
  } catch (error) {
    console.error("Error retrieving session:", error)
    return NextResponse.json({ error: "Failed to retrieve session" }, { status: 500 })
  }
}
