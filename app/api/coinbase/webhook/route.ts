import { type NextRequest, NextResponse } from "next/server"
import { database } from "@/lib/database"
import crypto from "crypto"

const webhookSecret = process.env.COINBASE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-cc-webhook-signature")

    // Verify webhook signature
    if (webhookSecret && signature) {
      const expectedSignature = crypto.createHmac("sha256", webhookSecret).update(body).digest("hex")

      if (signature !== expectedSignature) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
      }
    }

    const event = JSON.parse(body)

    switch (event.type) {
      case "charge:confirmed":
        await handleChargeConfirmed(event.data)
        break

      case "charge:failed":
        await handleChargeFailed(event.data)
        break

      case "charge:delayed":
        await handleChargeDelayed(event.data)
        break

      default:
        console.log(`Unhandled Coinbase event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Coinbase webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

async function handleChargeConfirmed(charge: any) {
  try {
    // Extract user information from charge metadata
    const { userId, planId } = charge.metadata || {}

    if (!userId || !planId) {
      console.error("Missing metadata in Coinbase charge")
      return
    }

    // Get or create user settings
    let userSettings = await database.getUserSettings(userId)

    if (!userSettings) {
      userSettings = await database.createUserWithTrial(userId)
    }

    // Calculate subscription end date (1 month from now)
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + 1)

    // Update subscription
    userSettings.subscription = {
      plan: planId as any,
      status: "active",
      startDate: new Date(),
      endDate,
      trialUsed: true,
    }

    // Store payment information
    userSettings.paymentStatus = {
      lastPayment: new Date(),
      coinbaseChargeId: charge.id,
      amount: Number.parseFloat(charge.pricing.local.amount),
      currency: charge.pricing.local.currency,
    }

    await database.saveUserSettings(userSettings)

    console.log(`Crypto subscription activated for user ${userId} with plan ${planId}`)
  } catch (error) {
    console.error("Error handling Coinbase charge confirmation:", error)
  }
}

async function handleChargeFailed(charge: any) {
  console.log(`Coinbase charge failed: ${charge.id}`)
  // Handle failed crypto payment
}

async function handleChargeDelayed(charge: any) {
  console.log(`Coinbase charge delayed: ${charge.id}`)
  // Handle delayed crypto payment (waiting for confirmations)
}
