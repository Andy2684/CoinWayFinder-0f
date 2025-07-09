/**
 * Subscription Checker Script
 * Implements graceful expiration system for CoinWayFinder
 *
 * Key Features:
 * - Existing bots continue running after subscription expiry
 * - Only stops bots if autoStop flag is enabled
 * - Sends notifications about expiration
 * - Comprehensive logging and error handling
 */

const fs = require("fs")
const path = require("path")

// Mock database for development
const mockDatabase = {
  users: [
    {
      id: "user1",
      email: "user1@example.com",
      subscriptionStatus: "expired",
      subscriptionEndDate: new Date("2025-01-01"),
      autoStop: false,
      notificationsSent: 0,
    },
    {
      id: "user2",
      email: "user2@example.com",
      subscriptionStatus: "active",
      subscriptionEndDate: new Date("2025-12-31"),
      autoStop: false,
      notificationsSent: 0,
    },
    {
      id: "user3",
      email: "user3@example.com",
      subscriptionStatus: "expired",
      subscriptionEndDate: new Date("2024-12-01"),
      autoStop: true,
      notificationsSent: 2,
    },
  ],
  bots: [
    {
      id: "bot1",
      userId: "user1",
      status: "running",
      strategy: "DCA",
      autoStop: false,
      startTime: new Date("2025-01-05"),
      lastActivity: new Date(),
    },
    {
      id: "bot2",
      userId: "user2",
      status: "running",
      strategy: "Scalping",
      autoStop: false,
      startTime: new Date("2025-01-06"),
      lastActivity: new Date(),
    },
    {
      id: "bot3",
      userId: "user3",
      status: "running",
      strategy: "Grid",
      autoStop: true,
      startTime: new Date("2024-11-15"),
      lastActivity: new Date(),
    },
  ],
}

// Statistics tracking
const stats = {
  totalUsers: 0,
  expiredUsers: 0,
  activeUsers: 0,
  botsProcessed: 0,
  botsStopped: 0,
  notificationsSent: 0,
  errors: 0,
}

/**
 * Initialize database connection (mock for development)
 */
async function initializeDatabase() {
  console.log("🔌 Initializing database connection...")

  try {
    // In production, this would connect to MongoDB/Supabase
    // For now, we use mock data
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log("✅ Database connection established")
    return true
  } catch (error) {
    console.error("❌ Database connection failed:", error.message)
    return false
  }
}

/**
 * Get all users from database
 */
async function getAllUsers() {
  console.log("👥 Fetching all users...")

  try {
    // Simulate database query delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const users = mockDatabase.users
    console.log(`📊 Found ${users.length} users`)
    return users
  } catch (error) {
    console.error("❌ Error fetching users:", error.message)
    stats.errors++
    return []
  }
}

/**
 * Get user's active bots
 */
async function getUserBots(userId) {
  try {
    const bots = mockDatabase.bots.filter((bot) => bot.userId === userId && bot.status === "running")
    return bots
  } catch (error) {
    console.error(`❌ Error fetching bots for user ${userId}:`, error.message)
    stats.errors++
    return []
  }
}

/**
 * Stop a bot (only if autoStop is enabled)
 */
async function stopBot(botId, reason = "Subscription expired") {
  try {
    console.log(`🛑 Stopping bot ${botId} - Reason: ${reason}`)

    // Find and update bot status
    const bot = mockDatabase.bots.find((b) => b.id === botId)
    if (bot) {
      bot.status = "stopped"
      bot.stopReason = reason
      bot.stopTime = new Date()
      stats.botsStopped++
    }

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 200))

    console.log(`✅ Bot ${botId} stopped successfully`)
    return true
  } catch (error) {
    console.error(`❌ Error stopping bot ${botId}:`, error.message)
    stats.errors++
    return false
  }
}

/**
 * Send expiration notification to user
 */
async function sendExpirationNotification(user) {
  try {
    console.log(`📧 Sending expiration notification to ${user.email}`)

    // In production, this would send actual email/SMS/push notification
    // For now, we just log it
    const message = `
      🚫 Your CoinWayFinder subscription has expired.
      
      Your current bots will finish normally, but you cannot launch new ones.
      
      🔁 Renew now to continue trading: https://coinwayfinder.com/subscription
      
      Need help? Contact support: support@coinwayfinder.com
    `

    console.log(`📨 Notification sent to ${user.email}`)

    // Update notification count
    user.notificationsSent = (user.notificationsSent || 0) + 1
    stats.notificationsSent++

    // Simulate notification delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    return true
  } catch (error) {
    console.error(`❌ Error sending notification to ${user.email}:`, error.message)
    stats.errors++
    return false
  }
}

/**
 * Process a single user's subscription status
 */
async function processUser(user) {
  try {
    console.log(`\n👤 Processing user: ${user.email}`)
    console.log(`📅 Subscription status: ${user.subscriptionStatus}`)

    stats.totalUsers++

    if (user.subscriptionStatus === "active") {
      stats.activeUsers++
      console.log("✅ User has active subscription - no action needed")
      return
    }

    if (user.subscriptionStatus === "expired") {
      stats.expiredUsers++
      console.log("⚠️ User subscription expired")

      // Get user's active bots
      const bots = await getUserBots(user.id)
      console.log(`🤖 Found ${bots.length} active bots`)

      // Process each bot
      for (const bot of bots) {
        stats.botsProcessed++
        console.log(`🔍 Processing bot ${bot.id} (${bot.strategy})`)

        // Only stop bot if autoStop is enabled for user OR bot
        if (user.autoStop || bot.autoStop) {
          console.log("🛑 AutoStop enabled - stopping bot")
          await stopBot(bot.id, "Subscription expired - AutoStop enabled")
        } else {
          console.log("✅ AutoStop disabled - bot continues running")
          console.log("💡 Bot will finish naturally or user can stop manually")
        }

        // Small delay between bot operations
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      // Send notification if not sent too many times
      if ((user.notificationsSent || 0) < 3) {
        await sendExpirationNotification(user)
      } else {
        console.log("📧 Notification limit reached - skipping")
      }
    }

    // Rate limiting between users
    await new Promise((resolve) => setTimeout(resolve, 200))
  } catch (error) {
    console.error(`❌ Error processing user ${user.email}:`, error.message)
    stats.errors++
  }
}

/**
 * Generate and display final statistics
 */
function displayStatistics() {
  console.log("\n📊 SUBSCRIPTION CHECK STATISTICS")
  console.log("=====================================")
  console.log(`👥 Total users processed: ${stats.totalUsers}`)
  console.log(`✅ Active subscriptions: ${stats.activeUsers}`)
  console.log(`⚠️ Expired subscriptions: ${stats.expiredUsers}`)
  console.log(`🤖 Bots processed: ${stats.botsProcessed}`)
  console.log(`🛑 Bots stopped: ${stats.botsStopped}`)
  console.log(`📧 Notifications sent: ${stats.notificationsSent}`)
  console.log(`❌ Errors encountered: ${stats.errors}`)
  console.log("=====================================")

  // Calculate success rate
  const successRate =
    stats.totalUsers > 0 ? (((stats.totalUsers - stats.errors) / stats.totalUsers) * 100).toFixed(1) : 100

  console.log(`📈 Success rate: ${successRate}%`)

  if (stats.errors > 0) {
    console.log("⚠️ Some errors occurred - check logs above")
  } else {
    console.log("✅ All operations completed successfully")
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log("🚀 Starting CoinWayFinder Subscription Checker")
  console.log("===============================================")
  console.log(`⏰ Started at: ${new Date().toISOString()}`)
  console.log("")

  try {
    // Initialize database connection
    const dbConnected = await initializeDatabase()
    if (!dbConnected) {
      console.log("⚠️ Database connection failed - using mock data")
    }

    // Get all users
    const users = await getAllUsers()
    if (users.length === 0) {
      console.log("ℹ️ No users found - exiting")
      process.exit(0)
    }

    console.log(`\n🔄 Processing ${users.length} users...`)

    // Process each user
    for (const user of users) {
      await processUser(user)
    }

    // Display final statistics
    displayStatistics()

    console.log("\n✅ Subscription check completed successfully")
    console.log(`⏰ Finished at: ${new Date().toISOString()}`)

    // Exit with success code
    process.exit(0)
  } catch (error) {
    console.error("\n❌ Fatal error during subscription check:", error.message)
    console.error("Stack trace:", error.stack)

    // Display partial statistics
    displayStatistics()

    // Exit with error code
    process.exit(1)
  }
}

/**
 * Handle process signals for graceful shutdown
 */
process.on("SIGINT", () => {
  console.log("\n⚠️ Received SIGINT - shutting down gracefully...")
  displayStatistics()
  process.exit(0)
})

process.on("SIGTERM", () => {
  console.log("\n⚠️ Received SIGTERM - shutting down gracefully...")
  displayStatistics()
  process.exit(0)
})

// Export functions for potential reuse
module.exports = {
  main,
  processUser,
  stopBot,
  sendExpirationNotification,
  getAllUsers,
  getUserBots,
  initializeDatabase,
}

// Run main function if script is executed directly
if (require.main === module) {
  main()
}
