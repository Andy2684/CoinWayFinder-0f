import { type NextRequest, NextResponse } from "next/server"
import { authManager } from "@/lib/auth"
import { database } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const user = await authManager.getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const { planId } = await request.json()

    if (!planId || !["free", "basic", "premium", "enterprise"].includes(planId)) {
      return NextResponse.json({ success: false, error: "Invalid plan" }, { status: 400 })
    }

    // Get user settings
    const userSettings = await database.getUserSettings(user.id)
    if (!userSettings) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // Calculate new end date based on plan
    const now = new Date()
    const endDate = new Date(now)

    if (planId === "free") {
      endDate.setDate(endDate.getDate() + 3) // 3 days
    } else {
      endDate.setMonth(endDate.getMonth() + 1) // 1 month
    }

    // Update subscription
    userSettings.subscription = {
      plan: planId as any,
      status: "active",
      startDate: now,
      endDate,
      trialUsed: userSettings.subscription.trialUsed,
      trialEndDate: userSettings.subscription.trialEndDate,
    }

    await database.saveUserSettings(userSettings)

    return NextResponse.json({
      success: true,
      message: `Successfully upgraded to ${planId} plan`,
      subscription: userSettings.subscription,
    })
  } catch (error) {
    console.error("Upgrade subscription error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
