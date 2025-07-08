import { NextResponse } from "next/server"
import { database } from "@/lib/database"

export async function POST() {
  try {
    console.log("🔍 Checking expired subscriptions...")

    // Get all expired subscriptions
    const expiredUsers = await database.getExpiredSubscriptions()

    let processedCount = 0
    let stoppedBotsCount = 0

    for (const userSettings of expiredUsers) {
      try {
        // Update subscription status to expired
        await database.updateSubscriptionStatus(userSettings.userId, "expired")

        // Stop all running bots for this user
        const stoppedBots = await database.stopUserBots(
          userSettings.userId,
          "Subscription expired - Please renew to continue trading",
        )

        stoppedBotsCount += stoppedBots
        processedCount++

        console.log(`✅ User ${userSettings.userId}: Stopped ${stoppedBots} bots`)
      } catch (error) {
        console.error(`❌ Error processing user ${userSettings.userId}:`, error)
      }
    }

    console.log(`🎯 Subscription check complete: ${processedCount} users processed, ${stoppedBotsCount} bots stopped`)

    return NextResponse.json({
      success: true,
      message: `Processed ${processedCount} expired subscriptions`,
      data: {
        processedUsers: processedCount,
        stoppedBots: stoppedBotsCount,
      },
    })
  } catch (error) {
    console.error("❌ Subscription check error:", error)
    return NextResponse.json({ success: false, message: "Failed to check subscriptions" }, { status: 500 })
  }
}
