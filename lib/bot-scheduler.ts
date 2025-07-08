import { Queue, Worker, type Job } from "bullmq"
import Redis from "ioredis"
import { connectToDatabase } from "./database"
import { TradingBotEngine } from "./trading-bot-engine"
import { ExchangeAPIClient } from "./exchange-api-client"

// Redis connection
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
})

// Job queues
export const botExecutionQueue = new Queue("bot-execution", { connection: redis })
export const botMonitoringQueue = new Queue("bot-monitoring", { connection: redis })

// Bot execution intervals by strategy
const STRATEGY_INTERVALS = {
  dca: 60 * 60 * 1000, // 1 hour
  grid: 30 * 1000, // 30 seconds
  scalping: 5 * 1000, // 5 seconds
  "long-short-ai": 5 * 60 * 1000, // 5 minutes
  "trend-following": 15 * 60 * 1000, // 15 minutes
  arbitrage: 10 * 1000, // 10 seconds
}

export interface BotJobData {
  botId: string
  userId: string
  strategy: string
  config: any
  exchangeConfig: any
}

export class BotScheduler {
  private executionWorker: Worker
  private monitoringWorker: Worker

  constructor() {
    this.initializeWorkers()
  }

  private initializeWorkers() {
    // Bot execution worker
    this.executionWorker = new Worker(
      "bot-execution",
      async (job: Job<BotJobData>) => {
        return this.executeBotJob(job.data)
      },
      {
        connection: redis,
        concurrency: 10,
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    )

    // Bot monitoring worker
    this.monitoringWorker = new Worker(
      "bot-monitoring",
      async (job: Job) => {
        return this.monitorBots()
      },
      {
        connection: redis,
        concurrency: 1,
      },
    )

    // Error handling
    this.executionWorker.on("failed", (job, err) => {
      console.error(`Bot execution failed for job ${job?.id}:`, err)
    })

    this.monitoringWorker.on("failed", (job, err) => {
      console.error(`Bot monitoring failed:`, err)
    })
  }

  async startBot(botData: BotJobData): Promise<void> {
    const interval = STRATEGY_INTERVALS[botData.strategy as keyof typeof STRATEGY_INTERVALS] || 60000

    // Add recurring job for bot execution
    await botExecutionQueue.add(`bot-${botData.botId}`, botData, {
      repeat: { every: interval },
      jobId: `bot-${botData.botId}`,
      removeOnComplete: 10,
      removeOnFail: 5,
    })

    // Update bot status in database
    const { db } = await connectToDatabase()
    await db.collection("bots").updateOne(
      { _id: botData.botId },
      {
        $set: {
          status: "running",
          lastStarted: new Date(),
          scheduledAt: new Date(),
        },
      },
    )

    console.log(`Bot ${botData.botId} scheduled with ${interval}ms interval`)
  }

  async stopBot(botId: string): Promise<void> {
    // Remove the recurring job
    const job = await botExecutionQueue.getJob(`bot-${botId}`)
    if (job) {
      await job.remove()
    }

    // Update bot status in database
    const { db } = await connectToDatabase()
    await db.collection("bots").updateOne(
      { _id: botId },
      {
        $set: {
          status: "stopped",
          lastStopped: new Date(),
        },
      },
    )

    console.log(`Bot ${botId} stopped and removed from queue`)
  }

  async pauseBot(botId: string): Promise<void> {
    const job = await botExecutionQueue.getJob(`bot-${botId}`)
    if (job) {
      await job.remove()
    }

    const { db } = await connectToDatabase()
    await db.collection("bots").updateOne(
      { _id: botId },
      {
        $set: {
          status: "paused",
          lastPaused: new Date(),
        },
      },
    )

    console.log(`Bot ${botId} paused`)
  }

  private async executeBotJob(data: BotJobData): Promise<any> {
    try {
      const { db } = await connectToDatabase()

      // Check if bot is still active
      const bot = await db.collection("bots").findOne({ _id: data.botId })
      if (!bot || bot.status !== "running") {
        console.log(`Bot ${data.botId} is not active, skipping execution`)
        return { skipped: true, reason: "Bot not active" }
      }

      // Initialize exchange client
      const exchangeClient = new ExchangeAPIClient(data.exchangeConfig)

      // Initialize trading engine
      const tradingEngine = new TradingBotEngine(data.botId, data.strategy, data.config)

      // Execute trading logic
      const result = await tradingEngine.execute(exchangeClient)

      // Update bot's last execution time
      await db.collection("bots").updateOne(
        { _id: data.botId },
        {
          $set: {
            lastExecution: new Date(),
            lastResult: result,
            totalExecutions: { $inc: 1 },
          },
        },
      )

      console.log(`Bot ${data.botId} executed successfully:`, result)
      return result
    } catch (error) {
      console.error(`Bot execution error for ${data.botId}:`, error)

      // Update error count in database
      const { db } = await connectToDatabase()
      await db.collection("bots").updateOne(
        { _id: data.botId },
        {
          $inc: { errorCount: 1 },
          $set: { lastError: error.message, lastErrorAt: new Date() },
        },
      )

      throw error
    }
  }

  private async monitorBots(): Promise<void> {
    try {
      const { db } = await connectToDatabase()

      // Find all running bots
      const runningBots = await db.collection("bots").find({ status: "running" }).toArray()

      for (const bot of runningBots) {
        // Check if bot has a scheduled job
        const job = await botExecutionQueue.getJob(`bot-${bot._id}`)

        if (!job) {
          console.log(`Rescheduling missing job for bot ${bot._id}`)

          // Reschedule the bot
          await this.startBot({
            botId: bot._id,
            userId: bot.userId,
            strategy: bot.strategy,
            config: bot.config,
            exchangeConfig: bot.exchangeConfig,
          })
        }

        // Check for stale bots (no execution in 2x expected interval)
        const expectedInterval = STRATEGY_INTERVALS[bot.strategy as keyof typeof STRATEGY_INTERVALS] || 60000
        const staleThreshold = expectedInterval * 2
        const timeSinceLastExecution = Date.now() - new Date(bot.lastExecution || bot.createdAt).getTime()

        if (timeSinceLastExecution > staleThreshold) {
          console.log(`Bot ${bot._id} appears stale, restarting...`)
          await this.stopBot(bot._id)
          await this.startBot({
            botId: bot._id,
            userId: bot.userId,
            strategy: bot.strategy,
            config: bot.config,
            exchangeConfig: bot.exchangeConfig,
          })
        }
      }
    } catch (error) {
      console.error("Bot monitoring error:", error)
    }
  }

  async getQueueStats() {
    const executionStats = {
      waiting: await botExecutionQueue.getWaiting(),
      active: await botExecutionQueue.getActive(),
      completed: await botExecutionQueue.getCompleted(),
      failed: await botExecutionQueue.getFailed(),
    }

    return {
      execution: {
        waiting: executionStats.waiting.length,
        active: executionStats.active.length,
        completed: executionStats.completed.length,
        failed: executionStats.failed.length,
      },
    }
  }

  async startMonitoring(): Promise<void> {
    // Add recurring monitoring job every 5 minutes
    await botMonitoringQueue.add(
      "monitor-bots",
      {},
      {
        repeat: { every: 5 * 60 * 1000 }, // 5 minutes
        jobId: "monitor-bots",
      },
    )

    console.log("Bot monitoring started")
  }

  async shutdown(): Promise<void> {
    await this.executionWorker.close()
    await this.monitoringWorker.close()
    await redis.quit()
    console.log("Bot scheduler shutdown complete")
  }
}

// Singleton instance
export const botScheduler = new BotScheduler()
