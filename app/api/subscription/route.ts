import { type NextRequest, NextResponse } from "next/server"
import { subscriptionManager, SUBSCRIPTION_PLANS } from "@/lib/subscription-manager"
import { database } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const currentPlan = await subscriptionManager.getUserPlan(userId)
    const usageStats = await subscriptionManager.getUsageStats(userId)
    const isTrialExpired = await subscriptionManager.isTrialExpired(userId)

    return NextResponse.json({
      currentPlan,
      usageStats,
      isTrialExpired,
      availablePlans: Object.values(SUBSCRIPTION_PLANS),
    })
  } catch (error) {
    console.error("Failed to get subscription info:", error)
    return NextResponse.json({ error: "Failed to get subscription information" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, action, planId, paymentMethodId, referralCode } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    switch (action) {
      case "upgrade":
        if (!planId) {
          return NextResponse.json({ error: "Plan ID required for upgrade" }, { status: 400 })
        }

        const upgradeResult = await subscriptionManager.upgradePlan(userId, planId, paymentMethodId)

        return NextResponse.json(upgradeResult)

      case "cancel":
        const cancelResult = await subscriptionManager.cancelSubscription(userId)
        return NextResponse.json(cancelResult)

      case "referral":
        if (!referralCode) {
          return NextResponse.json({ error: "Referral code required" }, { status: 400 })
        }

        const referralResult = await subscriptionManager.processReferral(userId, referralCode)

        return NextResponse.json(referralResult)

      case "create_trial":
        const trialUser = await database.createUserWithTrial(userId, referralCode)
        return NextResponse.json({
          success: true,
          user: trialUser,
        })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Subscription action failed:", error)
    return NextResponse.json({ error: "Subscription action failed" }, { status: 500 })
  }
}
