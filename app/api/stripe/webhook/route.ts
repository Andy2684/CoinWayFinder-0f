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

    console.log(`Processing webhook event: ${event.type}`)

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

    console.log(`✅ Checkout completed for user ${userId}, plan ${planId}`)

    // Update user settings immediately to unlock access
    const userSettings = await database.getUserSettings(userId)
    if (userSettings) {
      userSettings.subscription = {
        ...userSettings.subscription,
        plan: planId as any,
        status: "active",
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      }

      userSettings.paymentStatus = {
        lastPayment: new Date(),
        stripeSessionId: session.id,
        amount: session.amount_total || 0,
        currency: session.currency || "usd",
      }

      await database.saveUserSettings(userSettings)
      console.log(`🔓 Access unlocked for user ${userId}`)
    }

    // Send confirmation email (implement this based on your email service)
    await sendConfirmationEmail(userId, planId, session)
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

    settings.stripeSubscriptionId = subscription.id

    await database.saveUserSettings(settings)
    console.log(`🔄 Updated subscription for user ${userId} to plan ${planId}`)
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

      // Stop all running bots for cancelled users
      await database.stopUserBots(userId, "Subscription cancelled")

      console.log(`❌ Cancelled subscription for user ${userId}`)
    }
  } catch (error) {
    console.error("Failed to handle subscription cancellation:", error)
  }
}

async function handlePaymentSuccess(invoice: Stripe.Invoice) {
  try {
    const subscriptionId = invoice.subscription as string

    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      const userId = subscription.metadata.userId

      if (userId) {
        const settings = await database.getUserSettings(userId)
        if (settings) {
          settings.paymentStatus = {
            lastPayment: new Date(),
            amount: invoice.amount_paid,
            currency: invoice.currency,
            stripeInvoiceId: invoice.id,
          }
          await database.saveUserSettings(settings)
          console.log(`💰 Payment succeeded for user ${userId}: $${invoice.amount_paid / 100}`)
        }
      }
    }
  } catch (error) {
    console.error("Failed to handle payment success:", error)
  }
}

async function handlePaymentFailure(invoice: Stripe.Invoice) {
  try {
    const subscriptionId = invoice.subscription as string

    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      const userId = subscription.metadata.userId

      if (userId) {
        // Stop bots on payment failure
        await database.stopUserBots(userId, "Payment failed")
        console.log(`💳 Payment failed for user ${userId} - bots stopped`)
      }
    }
  } catch (error) {
    console.error("Failed to handle payment failure:", error)
  }
}

async function sendConfirmationEmail(userId: string, planId: string, session: Stripe.Checkout.Session) {
  try {
    // Get user details
    const user = await database.getUserById(userId)
    if (!user?.email) return

    console.log(`📧 Sending confirmation email to ${user.email} for ${planId} plan`)

    // Here you would integrate with your email service (SendGrid, Resend, etc.)
    // For now, we'll just log it
    console.log(`Email would be sent to: ${user.email}`)
    console.log(`Plan: ${planId}`)
    console.log(`Amount: $${(session.amount_total || 0) / 100}`)
  } catch (error) {
    console.error("Failed to send confirmation email:", error)
  }
}
