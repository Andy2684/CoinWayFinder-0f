import { type NextRequest, NextResponse } from "next/server"
import { database } from "@/lib/database"
import { subscriptionManager } from "@/lib/subscription-manager"
import { getServerSession } from "next-auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const userSettings = await database.getUserSettings(userId)

    if (!userSettings) {
      return NextResponse.json({
        hasAccess: false,
        plan: "free",
        status: "inactive",
        message: "No subscription found",
      })
    }

    const limits = await subscriptionManager.getUserLimits(userId)
    const hasActiveSubscription = userSettings.subscription.status === "active"

    return NextResponse.json({
      hasAccess: hasActiveSubscription,
      plan: userSettings.subscription.plan,
      status: userSettings.subscription.status,
      endDate: userSettings.subscription.endDate,
      limits,
      paymentStatus: userSettings.paymentStatus,
      message: hasActiveSubscription ? "Access granted" : "Subscription required",
    })
  } catch (error) {
    console.error("Check access error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
