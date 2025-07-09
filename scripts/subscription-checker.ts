#!/usr/bin/env tsx

import { MongoClient, type Db } from "mongodb"

// Types for our subscription system
interface User {
  _id: string
  email: string
  subscriptionStatus: "active" | "expired" | "cancelled"
  subscriptionEndDate: Date
  plan: "free" | "pro" | "enterprise"
}

interface Bot {
  _id: string
  userId: string
  status: "running" | "stopped" | "completed"
  autoStop: boolean
  strategy: string
  createdAt: Date
  lastActivity: Date
}

interface SubscriptionStats {
  totalUsers: number
  expiredUsers: number
  activeBots: number
  stoppedBots: number
  processedUsers: number
}

class SubscriptionChecker {
  private client: MongoClient | null = null
  private db: Db | null = null

  async connect(): Promise<void> {
    try {
      // Use environment variable or fallback to mock
      const mongoUrl = process.env.MONGODB_URI || "mongodb://localhost:27017/coinwayfinder"
      this.client = new MongoClient(mongoUrl)
      await this.client.connect()
      this.db = this.client.db("coinwayfinder")
      console.log("✅ Connected to MongoDB")
    } catch (error) {
      console.error("❌ Failed to connect to MongoDB:", error)
      // Use mock database for development
      this.db = null
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close()
      console.log("🔌 Disconnected from MongoDB")
    }
  }

  async getExpiredUsers(): Promise<User[]> {
    if (!this.db) {
      // Return mock data for development
      return [
        {
          _id: "user1",
          email: "test@example.com",
          subscriptionStatus: "expired",
          subscriptionEndDate: new Date(Date.now() - 86400000), // Yesterday
          plan: "pro",
        },
      ]
    }

    try {
      const users = await this.db
        .collection("users")
        .find({
          subscriptionStatus: "active",
          subscriptionEndDate: { $lt: new Date() },
        })
        .toArray()

      return users as User[]
    } catch (error) {
      console.error("❌ Error fetching expired users:", error)
      return []
    }
  }

  async updateUserSubscriptionStatus(userId: string): Promise<boolean> {
    if (!this.db) {
      console.log(`🔄 [MOCK] Updated user ${userId} subscription status to expired`)
      return true
    }

    try {
      const result = await this.db.collection("users").updateOne(
        { _id: userId },
        {
          $set: {
            subscriptionStatus: "expired",
            updatedAt: new Date(),
          },
        },
      )

      return result.modifiedCount > 0
    } catch (error) {
      console.error(`❌ Error updating user ${userId}:`, error)
      return false
    }
  }

  async getUserBots(userId: string): Promise<Bot[]> {
    if (!this.db) {
      // Return mock bot data
      return [
        {
          _id: "bot1",
          userId: userId,
          status: "running",
          autoStop: false,
          strategy: "DCA",
          createdAt: new Date(),
          lastActivity: new Date(),
        },
      ]
    }

    try {
      const bots = await this.db
        .collection("bots")
        .find({
          userId: userId,
          status: "running",
        })
        .toArray()

      return bots as Bot[]
    } catch (error) {
      console.error(`❌ Error fetching bots for user ${userId}:`, error)
      return []
    }
  }

  async stopBot(botId: string): Promise<boolean> {
    if (!this.db) {
      console.log(`🛑 [MOCK] Stopped bot ${botId}`)
      return true
    }

    try {
      const result = await this.db.collection("bots").updateOne(
        { _id: botId },
        {
          $set: {
            status: "stopped",
            stoppedAt: new Date(),
            stoppedReason: "subscription_expired",
          },
        },
      )

      return result.modifiedCount > 0
    } catch (error) {
      console.error(`❌ Error stopping bot ${botId}:`, error)
      return false
    }
  }

  async processExpiredUser(user: User): Promise<number> {
    console.log(`🔍 Processing expired user: ${user.email}`)

    // Update user subscription status
    const userUpdated = await this.updateUserSubscriptionStatus(user._id)
    if (!userUpdated) {
      console.error(`❌ Failed to update user ${user.email}`)
      return 0
    }

    // Get user's running bots
    const bots = await this.getUserBots(user._id)
    console.log(`🤖 Found ${bots.length} running bots for ${user.email}`)

    let stoppedBots = 0

    // Process each bot based on autoStop setting
    for (const bot of bots) {
      if (bot.autoStop) {
        console.log(`🛑 Auto-stopping bot ${bot._id} (${bot.strategy})`)
        const stopped = await this.stopBot(bot._id)
        if (stopped) {
          stoppedBots++
        }
      } else {
        console.log(`✅ Allowing bot ${bot._id} (${bot.strategy}) to continue running`)
      }

      // Small delay to prevent overwhelming the database
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    console.log(`✅ Processed user ${user.email}: ${stoppedBots}/${bots.length} bots stopped`)
    return stoppedBots
  }

  async checkSubscriptions(): Promise<SubscriptionStats> {
    console.log("🚀 Starting subscription check...")

    const stats: SubscriptionStats = {
      totalUsers: 0,
      expiredUsers: 0,
      activeBots: 0,
      stoppedBots: 0,
      processedUsers: 0,
    }

    try {
      // Get all expired users
      const expiredUsers = await this.getExpiredUsers()
      stats.expiredUsers = expiredUsers.length

      console.log(`📊 Found ${expiredUsers.length} expired users`)

      if (expiredUsers.length === 0) {
        console.log("✅ No expired users found. All subscriptions are current!")
        return stats
      }

      // Process each expired user
      for (const user of expiredUsers) {
        try {
          const stoppedBots = await this.processExpiredUser(user)
          stats.stoppedBots += stoppedBots
          stats.processedUsers++

          // Small delay between users
          await new Promise((resolve) => setTimeout(resolve, 200))
        } catch (error) {
          console.error(`❌ Error processing user ${user.email}:`, error)
        }
      }

      console.log("📈 Subscription check completed!")
      console.log(
        `📊 Stats: ${stats.processedUsers}/${stats.expiredUsers} users processed, ${stats.stoppedBots} bots stopped`,
      )
    } catch (error) {
      console.error("❌ Error during subscription check:", error)
    }

    return stats
  }
}

// Main execution function
async function main(): Promise<void> {
  const checker = new SubscriptionChecker()

  try {
    await checker.connect()
    const stats = await checker.checkSubscriptions()

    // Log final statistics
    console.log("\n📊 Final Statistics:")
    console.log(`   Expired Users: ${stats.expiredUsers}`)
    console.log(`   Processed Users: ${stats.processedUsers}`)
    console.log(`   Stopped Bots: ${stats.stoppedBots}`)

    process.exit(0)
  } catch (error) {
    console.error("💥 Fatal error:", error)
    process.exit(1)
  } finally {
    await checker.disconnect()
  }
}

// Export for potential reuse
export { SubscriptionChecker }
export type { User, Bot, SubscriptionStats }

// Run if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error("💥 Unhandled error:", error)
    process.exit(1)
  })
}
