#!/usr/bin/env tsx

import { authManager } from "../lib/auth"

async function checkSubscriptions() {
  console.log("🔍 Checking subscription statuses...")

  try {
    await authManager.disconnectExpiredUsers()
    console.log("✅ Subscription check completed successfully")
  } catch (error) {
    console.error("❌ Subscription check failed:", error)
    process.exit(1)
  }
}

// Run immediately
checkSubscriptions()

// Schedule to run every hour
setInterval(checkSubscriptions, 60 * 60 * 1000)

console.log("🚀 Subscription checker started - running every hour")
