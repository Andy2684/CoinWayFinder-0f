#!/usr/bin/env node

import { botScheduler } from "../lib/bot-scheduler"

async function startScheduler() {
  try {
    console.log("🚀 Starting Bot Scheduler...")

    // Initialize the scheduler with workers
    await botScheduler.initialize()

    console.log("✅ Bot Scheduler started successfully")
    console.log("📊 Queue workers are now processing bot jobs")

    // Handle graceful shutdown
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

    // Keep the process alive
    setInterval(() => {
      // Health check - could add monitoring here
    }, 30000)
  } catch (error) {
    console.error("❌ Failed to start Bot Scheduler:", error)
    process.exit(1)
  }
}

// Start the scheduler if this file is run directly
if (require.main === module) {
  startScheduler()
}
