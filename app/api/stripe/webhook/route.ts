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

    console.log(`Processing webhook event: ${event.type}`)

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case "customer.subscription.deleted":
        await handleSubscriptionCancelled(event.data.object as Stripe.Subscription)
        break

      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      case "customer.subscription.trial_will_end":
        await handleTrialWillEnd(event.data.object as Stripe.Subscription)
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
  const { userId, planId, billingCycle, addOns } = session.metadata || {}

  if (!userId || !planId) {
    console.error("Missing metadata in checkout session")
    return
  }

  try {
    console.log(`Processing checkout completion for user ${userId}, plan ${planId}`)

    // Get user settings
    let userSettings = await database.getUserSettings(userId)

    if (!userSettings) {
      userSettings = await database.createUserWithTrial(userId)
    }

    // Calculate subscription end date
    const startDate = new Date()
    const endDate = new Date()

    if (billingCycle === "yearly") {
      endDate.setFullYear(endDate.getFullYear() + 1)
    } else {
      endDate.setMonth(endDate.getMonth() + 1)
    }

    // Update subscription
    userSettings.subscription = {
      plan: planId as any,
      status: "active",
      startDate,
      endDate,
      trialUsed: true,
      billingCycle: billingCycle || "monthly",
    }

    // Store payment information
    userSettings.paymentStatus = {
      lastPayment: new Date(),
      stripeSessionId: session.id,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: session.subscription as string,
      amount: session.amount_total || 0,
      currency: session.currency || "usd",
    }

    userSettings.stripeSubscriptionId = session.subscription as string
    userSettings.stripeCustomerId = session.customer as string

    // Add add-ons if any
    if (addOns) {
      userSettings.addOns = addOns.split(",").filter(Boolean)
    }

    await database.saveUserSettings(userSettings)

    console.log(`Subscription activated for user ${userId} with plan ${planId}`)

    // Send welcome email (optional)
    await sendWelcomeEmail(userId, planId)
  } catch (error) {
    console.error("Error handling checkout completion:", error)
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const { userId, planId } = subscription.metadata || {}

  if (!userId) return

  try {
    console.log(`Subscription created for user ${userId}`)

    const userSettings = await database.getUserSettings(userId)
    if (!userSettings) return

    // Update subscription status
    userSettings.subscription = {
      ...userSettings.subscription,
      status: subscription.status as any,
      stripeSubscriptionId: subscription.id,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    }

    await database.saveUserSettings(userSettings)
  } catch (error) {
    console.error("Error handling subscription creation:", error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const { userId } = subscription.metadata || {}

  if (!userId) return

  try {
    console.log(`Subscription updated for user ${userId}`)

    const userSettings = await database.getUserSettings(userId)
    if (!userSettings) return

    // Update subscription details
    userSettings.subscription = {
      ...userSettings.subscription,
      status: subscription.status as any,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    }

    // Handle plan changes
    if (subscription.items.data.length > 0) {
      const priceId = subscription.items.data[0].price.id
      const planMapping = {
        [process.env.STRIPE_STARTER_PRICE_ID!]: "starter",
        [process.env.STRIPE_PRO_PRICE_ID!]: "pro",
        [process.env.STRIPE_ENTERPRISE_PRICE_ID!]: "enterprise",
      }

      const newPlan = planMapping[priceId]
      if (newPlan) {
        userSettings.subscription.plan = newPlan as any
      }
    }

    await database.saveUserSettings(userSettings)
  } catch (error) {
    console.error("Error handling subscription update:", error)
  }
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  const { userId } = subscription.metadata || {}

  if (!userId) return

  try {
    console.log(`Subscription cancelled for user ${userId}`)

    const userSettings = await database.getUserSettings(userId)
    if (!userSettings) return

    // Update subscription status
    userSettings.subscription = {
      ...userSettings.subscription,
      status: "cancelled",
      cancelledAt: new Date(),
    }

    await database.saveUserSettings(userSettings)

    // Send cancellation email (optional)
    await sendCancellationEmail(userId)
  } catch (error) {
    console.error("Error handling subscription cancellation:", error)
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string

  if (!subscriptionId) return

  try {
    console.log(`Payment succeeded for subscription ${subscriptionId}`)

    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const { userId } = subscription.metadata || {}

    if (!userId) return

    const userSettings = await database.getUserSettings(userId)
    if (!userSettings) return

    // Update payment status
    if (userSettings.paymentStatus) {
      userSettings.paymentStatus.lastPayment = new Date()
      userSettings.paymentStatus.stripeInvoiceId = invoice.id
      userSettings.paymentStatus.amount = invoice.amount_paid
    }

    // Ensure subscription is active
    userSettings.subscription = {
      ...userSettings.subscription,
      status: "active",
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    }

    await database.saveUserSettings(userSettings)

    console.log(`Payment processed for user ${userId}`)
  } catch (error) {
    console.error("Error handling payment success:", error)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string

  if (!subscriptionId) return

  try {
    console.log(`Payment failed for subscription ${subscriptionId}`)

    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const { userId } = subscription.metadata || {}

    if (!userId) return

    const userSettings = await database.getUserSettings(userId)
    if (!userSettings) return

    // Update subscription status
    userSettings.subscription = {
      ...userSettings.subscription,
      status: "past_due",
    }

    await database.saveUserSettings(userSettings)

    // Send payment failed email (optional)
    await sendPaymentFailedEmail(userId)
  } catch (error) {
    console.error("Error handling payment failure:", error)
  }
}

async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  const { userId } = subscription.metadata || {}

  if (!userId) return

  try {
    console.log(`Trial ending soon for user ${userId}`)

    // Send trial ending email (optional)
    await sendTrialEndingEmail(userId)
  } catch (error) {
    console.error("Error handling trial will end:", error)
  }
}

// Email notification functions (implement as needed)
async function sendWelcomeEmail(userId: string, planId: string) {
  // Implement welcome email logic
  console.log(`Sending welcome email to user ${userId} for plan ${planId}`)
}

async function sendCancellationEmail(userId: string) {
  // Implement cancellation email logic
  console.log(`Sending cancellation email to user ${userId}`)
}

async function sendPaymentFailedEmail(userId: string) {
  // Implement payment failed email logic
  console.log(`Sending payment failed email to user ${userId}`)
}

async function sendTrialEndingEmail(userId: string) {
  // Implement trial ending email logic
  console.log(`Sending trial ending email to user ${userId}`)
}
