import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { database } from "@/lib/database"
import type Stripe from "stripe"

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error("Webhook signature verification failed:", err)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case "customer.subscription.deleted":
        await handleSubscriptionCancelled(event.data.object as Stripe.Subscription)
        break

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { userId, planId, addOns } = session.metadata || {}

  if (!userId || !planId) {
    console.error("Missing metadata in checkout session")
    return
  }

  try {
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
      stripeSessionId: session.id,
      stripeSubscriptionId: session.subscription as string,
      amount: session.amount_total || 0,
      currency: session.currency || "usd",
    }

    userSettings.stripeSubscriptionId = session.subscription as string

    await database.saveUserSettings(userSettings)

    console.log(`Subscription activated for user ${userId} with plan ${planId}`)
  } catch (error) {
    console.error("Error handling checkout completion:", error)
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string

  if (!subscriptionId) return

  try {
    // Find user by subscription ID
    const userSettings = await database.getUserSettings("")
    // Note: You'll need to implement a method to find user by subscription ID
    // This is a simplified version

    if (userSettings && userSettings.stripeSubscriptionId === subscriptionId) {
      // Extend subscription
      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + 1)

      userSettings.subscription.endDate = endDate
      userSettings.subscription.status = "active"

      if (userSettings.paymentStatus) {
        userSettings.paymentStatus.lastPayment = new Date()
        userSettings.paymentStatus.stripeInvoiceId = invoice.id
        userSettings.paymentStatus.amount = invoice.amount_paid
      }

      await database.saveUserSettings(userSettings)
      console.log(`Subscription renewed for subscription ${subscriptionId}`)
    }
  } catch (error) {
    console.error("Error handling payment success:", error)
  }
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  try {
    // Find user by subscription ID and update status
    // This would require implementing a method to find user by subscription ID
    console.log(`Subscription cancelled: ${subscription.id}`)
  } catch (error) {
    console.error("Error handling subscription cancellation:", error)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    // Handle failed payment - maybe send notification
    console.log(`Payment failed for invoice: ${invoice.id}`)
  } catch (error) {
    console.error("Error handling payment failure:", error)
  }
}
