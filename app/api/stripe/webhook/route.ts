import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { stripe } from "@/lib/stripe"
import { database } from "@/lib/database"
import type Stripe from "stripe"

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get("stripe-signature")!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error("Webhook signature verification failed:", err)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break

      case "customer.subscription.created":
      case "customer.subscription.updated":
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdate(subscription)
        break

      case "customer.subscription.deleted":
        const deletedSubscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCancellation(deletedSubscription)
        break

      case "invoice.payment_succeeded":
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSuccess(invoice)
        break

      case "invoice.payment_failed":
        const failedInvoice = event.data.object as Stripe.Invoice
        await handlePaymentFailure(failedInvoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook processing failed:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    const userId = session.metadata?.userId
    const planId = session.metadata?.planId

    if (!userId || !planId) {
      console.error("Missing metadata in checkout session")
      return
    }

    console.log(`Checkout completed for user ${userId}, plan ${planId}`)

    // The subscription will be handled by the subscription.created event
  } catch (error) {
    console.error("Failed to handle checkout completion:", error)
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata.userId

    if (!userId) {
      console.error("No userId in subscription metadata")
      return
    }

    const settings = await database.getUserSettings(userId)
    if (!settings) {
      console.error(`User settings not found for userId: ${userId}`)
      return
    }

    // Get plan ID from metadata
    const planId = subscription.metadata.planId || "basic"

    settings.subscription = {
      plan: planId as any,
      status: subscription.status === "active" ? "active" : "cancelled",
      startDate: new Date(subscription.current_period_start * 1000),
      endDate: new Date(subscription.current_period_end * 1000),
      trialUsed: settings.subscription.trialUsed,
      trialEndDate: settings.subscription.trialEndDate,
    }

    await database.saveUserSettings(settings)
    console.log(`Updated subscription for user ${userId} to plan ${planId}`)
  } catch (error) {
    console.error("Failed to handle subscription update:", error)
  }
}

async function handleSubscriptionCancellation(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata.userId

    if (!userId) {
      console.error("No userId in subscription metadata")
      return
    }

    const settings = await database.getUserSettings(userId)
    if (settings) {
      settings.subscription.status = "cancelled"
      await database.saveUserSettings(settings)
      console.log(`Cancelled subscription for user ${userId}`)
    }
  } catch (error) {
    console.error("Failed to handle subscription cancellation:", error)
  }
}

async function handlePaymentSuccess(invoice: Stripe.Invoice) {
  try {
    const customerId = invoice.customer as string
    const subscriptionId = invoice.subscription as string

    console.log(`Payment succeeded for customer ${customerId}, subscription ${subscriptionId}`)
  } catch (error) {
    console.error("Failed to handle payment success:", error)
  }
}

async function handlePaymentFailure(invoice: Stripe.Invoice) {
  try {
    const customerId = invoice.customer as string
    const subscriptionId = invoice.subscription as string

    console.log(`Payment failed for customer ${customerId}, subscription ${subscriptionId}`)

    // You could add logic here to:
    // - Send payment failure notifications
    // - Pause bots if payment fails
    // - Update subscription status
  } catch (error) {
    console.error("Failed to handle payment failure:", error)
  }
}
