import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"
import { database } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const user = await AuthService.getCurrentUser()

    if (!user) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }

    const { plan } = await request.json()

    if (!["basic", "premium", "enterprise"].includes(plan)) {
      return NextResponse.json({ success: false, message: "Invalid subscription plan" }, { status: 400 })
    }

    // Get current user settings
    const userSettings = await database.getUserSettings(user.id)
    if (!userSettings) {
      return NextResponse.json({ success: false, message: "User settings not found" }, { status: 404 })
    }

    // Calculate new end date (30 days from now)
    const newEndDate = new Date()
    newEndDate.setDate(newEndDate.getDate() + 30)

    // Update subscription
    const updatedSettings = {
      ...userSettings,
      subscription: {
        ...userSettings.subscription,
        plan: plan as "basic" | "premium" | "enterprise",
        status: "active" as const,
        endDate: newEndDate,
      },
    }

    await database.saveUserSettings(updatedSettings)

    // In a real app, you would integrate with a payment processor here
    // For demo purposes, we'll just simulate a successful upgrade

    return NextResponse.json({
      success: true,
      message: `Successfully upgraded to ${plan} plan`,
      subscription: updatedSettings.subscription,
    })
  } catch (error) {
    console.error("Subscription upgrade error:", error)
    return NextResponse.json({ success: false, message: "Failed to upgrade subscription" }, { status: 500 })
  }
}
