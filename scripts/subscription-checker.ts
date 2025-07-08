#!/usr/bin/env node

/**
 * Subscription Checker Script
 *
 * This script runs periodically to check for expired subscriptions
 * and automatically stop trading bots for users with expired plans.
 *
 * Usage:
 * - Run manually: npx tsx scripts/subscription-checker.ts
 * - Run as cron job: */ 5 * * * * /path/to/node /path/to/project/scripts/subscription-checker.ts
\
 * - Run
with PM2
: pm2 start scripts/subscription-checker.ts --cron "0 * * * *"
 */

import { database } from "../lib/database"
import { node, path } from "some-module" // Placeholder import for undeclared variables

async function checkExpiredSubscriptions() {
  console.log("🔍 Starting subscription check...", new Date().toISOString())

  try {
    await database.connect()

    // Get all expired subscriptions
    const expiredUsers = await database.getExpiredSubscriptions()

    if (expiredUsers.length === 0) {
      console.log("✅ No expired subscriptions found")
      return
    }

    console.log(`📋 Found ${expiredUsers.length} expired subscriptions`)

    let processedCount = 0
    let totalStoppedBots = 0

    for (const userSettings of expiredUsers) {
      try {
        console.log(`👤 Processing user: ${userSettings.userId}`)

        // Update subscription status to expired
        const statusUpdated = await database.updateSubscriptionStatus(userSettings.userId, "expired")

        if (!statusUpdated) {
          console.log(`⚠️  Failed to update subscription status for user ${userSettings.userId}`)
          continue
        }

        // Stop all running bots for this user
        const stoppedBotsCount = await database.stopUserBots(
          userSettings.userId,
          "Subscription expired - Please renew your subscription to continue trading",
        )

        totalStoppedBots += stoppedBotsCount
        processedCount++

        console.log(`✅ User ${userSettings.userId}: Updated status and stopped ${stoppedBotsCount} bots`)

        // Add a small delay to avoid overwhelming the database
        await new Promise((resolve) => setTimeout(resolve, 100))
      } catch (userError) {
        console.error(`❌ Error processing user ${userSettings.userId}:`, userError)
      }
    }

    console.log(`🎯 Subscription check completed:`)
    console.log(`   - Users processed: ${processedCount}/${expiredUsers.length}`)
    console.log(`   - Total bots stopped: ${totalStoppedBots}`)
    console.log(`   - Completed at: ${new Date().toISOString()}`)
  } catch (error) {
    console.error("❌ Subscription checker error:", error)
    process.exit(1)
  } finally {
    await database.disconnect()
  }
}

// Run the subscription check
checkExpiredSubscriptions()
  .then(() => {
    console.log("✨ Subscription check finished successfully")
    process.exit(0)
  })
  .catch((error) => {
    console.error("💥 Subscription check failed:", error)
    process.exit(1)
  })
