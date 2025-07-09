import { type NextRequest, NextResponse } from "next/server"
import { database } from "@/lib/database"
import crypto from "crypto"

const COINBASE_WEBHOOK_SECRET = process.env.COINBASE_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-cc-webhook-signature")

    // Verify webhook signature if secret is configured
    if (COINBASE_WEBHOOK_SECRET && signature) {
      const expectedSignature = crypto.createHmac("sha256", COINBASE_WEBHOOK_SECRET).update(body).digest("hex")

      if (signature !== expectedSignature) {
        console.error("Invalid Coinbase webhook signature")
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
      }
    }

    const event = JSON.parse(body)
    console.log("Coinbase webhook event:", event.type)

    switch (event.type) {
      case "charge:confirmed":
        await handleChargeConfirmed(event.data)
        break

      case "charge:failed":
        await handleChargeFailed(event.data)
        break

      case "charge:delayed":
        console.log("Charge delayed, waiting for confirmations:", event.data.id)
        break

      default:
        console.log(`Unhandled Coinbase event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Coinbase webhook processing failed:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

async function handleChargeConfirmed(charge: any) {
  try {
    console.log(`✅ Coinbase charge confirmed: ${charge.id}`)

    // Extract user info from metadata (you'll need to add this when creating the charge)
    const userId = charge.metadata?.userId
    const planId = charge.metadata?.planId || "basic"

    if (!userId) {
      console.error("No userId in charge metadata")
      return
    }

    // Update user subscription
    const userSettings = await database.getUserSettings(userId)
    if (userSettings) {
      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + 1) // 1 month subscription

      userSettings.subscription = {
        ...userSettings.subscription,
        plan: planId as any,
        status: "active",
        startDate: new Date(),
        endDate,
      }

      userSettings.paymentStatus = {
        lastPayment: new Date(),
        coinbaseChargeId: charge.id,
        amount: charge.pricing.local.amount * 100, // Convert to cents
        currency: charge.pricing.local.currency.toLowerCase(),
      }

      await database.saveUserSettings(userSettings)
      console.log(`🔓 Crypto payment confirmed - Access unlocked for user ${userId}`)

      // Send confirmation email
      await sendCryptoConfirmationEmail(userId, planId, charge)
    }
  } catch (error) {
    console.error("Failed to handle confirmed charge:", error)
  }
}

async function handleChargeFailed(charge: any) {
  try {
    console.log(`❌ Coinbase charge failed: ${charge.id}`)

    const userId = charge.metadata?.userId
    if (userId) {
      // You could notify the user about the failed payment
      console.log(`Payment failed for user ${userId}`)
    }
  } catch (error) {
    console.error("Failed to handle failed charge:", error)
  }
}

async function sendCryptoConfirmationEmail(userId: string, planId: string, charge: any) {
  try {
    const user = await database.getUserById(userId)
    if (!user?.email) return

    console.log(`📧 Sending crypto confirmation email to ${user.email}`)
    console.log(`Plan: ${planId}`)
    console.log(`Amount: ${charge.pricing.local.amount} ${charge.pricing.local.currency}`)
    console.log(`Transaction: ${charge.id}`)

    // Here you would integrate with your email service
    // For now, we'll just log it
  } catch (error) {
    console.error("Failed to send crypto confirmation email:", error)
  }
}
