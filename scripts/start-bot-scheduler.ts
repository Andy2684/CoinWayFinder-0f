#!/usr/bin/env tsx

import { botScheduler } from "../lib/bot-scheduler"
import { connectToDatabase } from "../lib/database"

async function startScheduler() {
  console.log("🚀 Starting Bot Scheduler...")

  try {
    // Test database connection
    const { db } = await connectToDatabase()
    console.log("✅ Database connected")

    // Start monitoring
    await botScheduler.startMonitoring()
    console.log("✅ Bot monitoring started")

    // Restart any previously running bots
    const runningBots = await db.collection("bots").find({ status: "running" }).toArray()
    console.log(`📊 Found ${runningBots.length} running bots to restart`)

    for (const bot of runningBots) {
      try {
        await botScheduler.startBot({
          botId: bot._id,
          userId: bot.userId,
          strategy: bot.strategy,
          config: bot.config,
          exchangeConfig: bot.exchangeConfig,
        })
        console.log(`✅ Restarted bot ${bot._id} (${bot.strategy})`)
      } catch (error) {
        console.error(`❌ Failed to restart bot ${bot._id}:`, error)
      }
    }

    console.log("🎉 Bot Scheduler is running!")
    console.log("📊 Queue stats available at /api/bots/scheduler")

    // Graceful shutdown
    process.on("SIGINT", async () => {
      console.log("\n🛑 Shutting down Bot Scheduler...")
      await botScheduler.shutdown()
      process.exit(0)
    })

    process.on("SIGTERM", async () => {
      console.log("\n🛑 Shutting down Bot Scheduler...")
      await botScheduler.shutdown()
      process.exit(0)
    })
  } catch (error) {
    console.error("❌ Failed to start Bot Scheduler:", error)
    process.exit(1)
  }
}

// Start the scheduler
startScheduler()
