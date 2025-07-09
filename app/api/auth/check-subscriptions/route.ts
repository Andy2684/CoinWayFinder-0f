import { NextResponse } from "next/server"
import { database } from "@/lib/database"

export async function POST() {
  try {
    // Get all expired subscriptions
    const expiredSubscriptions = await database.getExpiredSubscriptions()

    let processedCount = 0

    for (const userSettings of expiredSubscriptions) {
      // Update subscription status
      await database.updateSubscriptionStatus(userSettings.userId, "expired")

      // Stop all running bots for this user
      const stoppedBots = await database.stopUserBots(userSettings.userId, "Subscription expired")

      console.log(`Processed expired subscription for user ${userSettings.userId}, stopped ${stoppedBots} bots`)
      processedCount++
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${processedCount} expired subscriptions`,
      processedCount,
    })
  } catch (error) {
    console.error("Check subscriptions error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
