#!/usr/bin/env node

/**
 * Subscription Checker Script
 * Implements graceful expiration system for CoinWayFinder
 *
 * Key Features:
 * - Existing bots continue running after subscription expiry
 * - Only stops bots if autoStop flag is enabled
 * - Updates subscription status in database
 * - Sends notifications about expiration
 */

// Mock database for development
const mockUsers = [
  {
    id: "user1",
    email: "test@example.com",
    subscriptionStatus: "expired",
    subscriptionEndDate: new Date("2024-12-01"),
    plan: "pro",
    autoStop: false,
  },
  {
    id: "user2",
    email: "user2@example.com",
    subscriptionStatus: "active",
    subscriptionEndDate: new Date("2025-12-01"),
    plan: "premium",
    autoStop: true,
  },
]

const mockBots = [
  {
    id: "bot1",
    userId: "user1",
    status: "running",
    subscriptionStatus: "expired",
    autoStop: false,
    startTime: new Date("2024-11-15"),
    strategy: "DCA",
  },
  {
    id: "bot2",
    userId: "user2",
    status: "running",
    subscriptionStatus: "active",
    autoStop: true,
    startTime: new Date("2024-12-01"),
    strategy: "Scalping",
  },
]

/**
 * Connect to database (MongoDB or mock for development)
 */
async function connectDatabase() {
  try {
    console.log("🔌 Connecting to database...")
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log("✅ Database connected successfully")
    return true
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    return false
  }
}

/**
 * Get all users from database
 */
async function getAllUsers() {
  try {
    console.log("👥 Fetching users from database...")
    await new Promise((resolve) => setTimeout(resolve, 500))
    return mockUsers
  } catch (error) {
    console.error("❌ Error fetching users:", error)
    return []
  }
}

/**
 * Get bots for a specific user
 */
async function getUserBots(userId) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return mockBots.filter((bot) => bot.userId === userId)
  } catch (error) {
    console.error(`❌ Error fetching bots for user ${userId}:`, error)
    return []
  }
}

/**
 * Update user subscription status
 */
async function updateUserSubscriptionStatus(userId, status) {
  try {
    console.log(`📝 Updating subscription status for user ${userId} to ${status}`)
    await new Promise((resolve) => setTimeout(resolve, 300))

    const user = mockUsers.find((u) => u.id === userId)
    if (user) {
      user.subscriptionStatus = status
    }

    return true
  } catch (error) {
    console.error(`❌ Error updating user ${userId}:`, error)
    return false
  }
}

/**
 * Stop a bot (only if autoStop is enabled)
 */
async function stopBot(botId, reason) {
  try {
    console.log(`🛑 Stopping bot ${botId} - Reason: ${reason}`)
    await new Promise((resolve) => setTimeout(resolve, 400))

    const bot = mockBots.find((b) => b.id === botId)
    if (bot) {
      bot.status = "stopped"
      bot.endTime = new Date()
    }

    return true
  } catch (error) {
    console.error(`❌ Error stopping bot ${botId}:`, error)
    return false
  }
}

/**
 * Send expiration notification to user
 */
async function sendExpirationNotification(user) {
  try {
    console.log(`📧 Sending expiration notification to ${user.email}`)
    await new Promise((resolve) => setTimeout(resolve, 200))

    console.log(
      `✉️  Notification sent to ${user.email}: Your subscription has expired. Your active bots will continue running, but you cannot create new ones.`,
    )
    return true
  } catch (error) {
    console.error(`❌ Error sending notification to ${user.email}:`, error)
    return false
  }
}

/**
 * Check if subscription is expired
 */
function isSubscriptionExpired(user) {
  const now = new Date()
  return user.subscriptionEndDate < now && user.subscriptionStatus !== "expired"
}

/**
 * Process a single user's subscription
 */
async function processUser(user) {
  const result = { botsAffected: 0, botsStopped: 0, errors: [] }

  try {
    console.log(`\n👤 Processing user: ${user.email} (${user.plan})`)

    // Check if subscription is expired
    if (!isSubscriptionExpired(user)) {
      console.log(`✅ Subscription active until ${user.subscriptionEndDate.toISOString()}`)
      return result
    }

    console.log(`⚠️  Subscription expired on ${user.subscriptionEndDate.toISOString()}`)

    // Update user subscription status
    const statusUpdated = await updateUserSubscriptionStatus(user.id, "expired")
    if (!statusUpdated) {
      result.errors.push(`Failed to update subscription status for ${user.email}`)
    }

    // Send expiration notification
    await sendExpirationNotification(user)

    // Get user's bots
    const bots = await getUserBots(user.id)
    console.log(`🤖 Found ${bots.length} bots for user`)

    // Process each bot
    for (const bot of bots) {
      result.botsAffected++

      if (bot.status === "running") {
        if (bot.autoStop || user.autoStop) {
          // Stop bot only if autoStop is enabled
          const stopped = await stopBot(bot.id, "Subscription expired with autoStop enabled")
          if (stopped) {
            result.botsStopped++
            console.log(`🛑 Bot ${bot.id} stopped due to expired subscription`)
          } else {
            result.errors.push(`Failed to stop bot ${bot.id}`)
          }
        } else {
          // Let bot continue running (graceful expiration)
          console.log(`🔄 Bot ${bot.id} continues running (graceful expiration)`)
        }
      }
    }
  } catch (error) {
    const errorMsg = `Error processing user ${user.email}: ${error}`
    console.error(`❌ ${errorMsg}`)
    result.errors.push(errorMsg)
  }

  return result
}

/**
 * Main subscription checker function
 */
async function checkSubscriptions() {
  const result = {
    usersChecked: 0,
    subscriptionsExpired: 0,
    botsAffected: 0,
    botsStopped: 0,
    errors: [],
  }

  console.log("🚀 Starting subscription check...")
  console.log(`📅 Current time: ${new Date().toISOString()}`)

  try {
    // Connect to database
    const connected = await connectDatabase()
    if (!connected) {
      throw new Error("Failed to connect to database")
    }

    // Get all users
    const users = await getAllUsers()
    console.log(`👥 Found ${users.length} users to check`)

    // Process each user
    for (const user of users) {
      result.usersChecked++

      const userResult = await processUser(user)
      result.botsAffected += userResult.botsAffected
      result.botsStopped += userResult.botsStopped
      result.errors.push(...userResult.errors)

      if (isSubscriptionExpired(user)) {
        result.subscriptionsExpired++
      }

      // Small delay to prevent overwhelming the database
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  } catch (error) {
    const errorMsg = `Fatal error in subscription checker: ${error}`
    console.error(`💥 ${errorMsg}`)
    result.errors.push(errorMsg)
  }

  return result
}

/**
 * Print final results
 */
function printResults(result) {
  console.log("\n📊 SUBSCRIPTION CHECK RESULTS")
  console.log("================================")
  console.log(`👥 Users checked: ${result.usersChecked}`)
  console.log(`⚠️  Subscriptions expired: ${result.subscriptionsExpired}`)
  console.log(`🤖 Bots affected: ${result.botsAffected}`)
  console.log(`🛑 Bots stopped: ${result.botsStopped}`)
  console.log(`🔄 Bots continuing: ${result.botsAffected - result.botsStopped}`)
  console.log(`❌ Errors: ${result.errors.length}`)

  if (result.errors.length > 0) {
    console.log("\n🚨 ERRORS:")
    result.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`)
    })
  }

  console.log("\n✅ Subscription check completed")
}

/**
 * Main execution
 */
async function main() {
  try {
    const result = await checkSubscriptions()
    printResults(result)

    // Exit with appropriate code
    const exitCode = result.errors.length > 0 ? 1 : 0
    process.exit(exitCode)
  } catch (error) {
    console.error("💥 Fatal error:", error)
    process.exit(1)
  }
}

// Export functions for potential reuse
module.exports = {
  checkSubscriptions,
  processUser,
  isSubscriptionExpired,
  connectDatabase,
  getAllUsers,
  getUserBots,
  updateUserSubscriptionStatus,
  stopBot,
  sendExpirationNotification,
}

// Run if called directly
if (require.main === module) {
  main()
}
