import { Queue, Worker, type Job } from "bullmq"
import Redis from "ioredis"
import { getBotManager } from "./bot-manager"
import { database } from "./database"

// Redis connection for job queue
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379")

// Bot execution queue
export const botQueue = new Queue("bot-execution", {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
  },
})

// Bot monitoring queue for health checks
export const monitorQueue = new Queue("bot-monitoring", {
  connection: redis,
})

export interface BotJobData {
  botId: string
  userId: string
  action: "start" | "stop" | "execute" | "monitor"
  config?: any
}

export class BotScheduler {
  private static instance: BotScheduler
  private workers: Map<string, Worker> = new Map()

  static getInstance(): BotScheduler {
    if (!BotScheduler.instance) {
      BotScheduler.instance = new BotScheduler()
    }
    return BotScheduler.instance
  }

  async initialize(): Promise<void> {
    // Start bot execution worker
    const executionWorker = new Worker(
      "bot-execution",
      async (job: Job<BotJobData>) => {
        return this.processBotJob(job)
      },
      {
        connection: redis,
        concurrency: 10, // Process up to 10 bots simultaneously
      },
    )

    // Start monitoring worker
    const monitorWorker = new Worker(
      "bot-monitoring",
      async (job: Job<BotJobData>) => {
        return this.monitorBots(job)
      },
      {
        connection: redis,
        concurrency: 5,
      },
    )

    this.workers.set("execution", executionWorker)
    this.workers.set("monitoring", monitorWorker)

    // Set up recurring monitoring job
    await monitorQueue.add("health-check", { action: "monitor" } as BotJobData, {
      repeat: { every: 30000 }, // Every 30 seconds
      jobId: "bot-health-check",
    })

    console.log("Bot scheduler initialized with workers")
  }

  async scheduleBot(botId: string, userId: string, action: "start" | "stop"): Promise<void> {
    const bot = await database.getBot(botId, userId)
    if (!bot) throw new Error("Bot not found")

    if (action === "start") {
      // Schedule recurring execution based on strategy
      const interval = this.getExecutionInterval(bot.strategy, bot.config)

      await botQueue.add(
        `bot-${botId}`,
        {
          botId,
          userId,
          action: "execute",
          config: bot.config,
        },
        {
          repeat: { every: interval },
          jobId: `bot-${botId}`,
        },
      )

      await database.updateBot(botId, userId, { status: "running" })
      console.log(`Scheduled bot ${botId} with ${interval}ms interval`)
    } else {
      // Remove scheduled job
      await botQueue.removeRepeatable(`bot-${botId}`, {
        every: this.getExecutionInterval(bot.strategy, bot.config),
      })

      await database.updateBot(botId, userId, { status: "stopped" })
      console.log(`Stopped bot ${botId}`)
    }
  }

  private async processBotJob(job: Job<BotJobData>): Promise<any> {
    const { botId, userId, action, config } = job.data

    try {
      const botManager = getBotManager(userId)

      switch (action) {
        case "execute":
          return await this.executeBotStrategy(botId, userId, config)
        case "start":
          return await botManager.startBot(botId)
        case "stop":
          return await botManager.stopBot(botId)
        default:
          throw new Error(`Unknown action: ${action}`)
      }
    } catch (error) {
      console.error(`Bot job failed for ${botId}:`, error)

      // Update bot status to error
      await database.updateBot(botId, userId, {
        status: "error",
        lastError: error.message,
        lastErrorAt: new Date(),
      })

      throw error
    }
  }

  private async executeBotStrategy(botId: string, userId: string, config: any): Promise<void> {
    // Get fresh bot data
    const bot = await database.getBot(botId, userId)
    if (!bot || bot.status !== "running") {
      throw new Error("Bot is not in running state")
    }

    const botManager = getBotManager(userId)

    // Execute one iteration of the strategy
    if (botManager.isRunning(botId)) {
      const stats = await botManager.getBotStats(botId)

      // Update last execution time
      await database.updateBot(botId, userId, {
        lastExecutedAt: new Date(),
        stats: stats,
      })

      return stats
    } else {
      // Bot is not running in memory, start it
      await botManager.startBot(botId)
    }
  }

  private async monitorBots(job: Job<BotJobData>): Promise<void> {
    try {
      // Get all running bots from database
      const runningBots = await database.getRunningBots()

      for (const bot of runningBots) {
        // Check if bot job is still scheduled
        const jobs = await botQueue.getJobs(["waiting", "active", "delayed"])
        const botJob = jobs.find((j) => j.id === `bot-${bot._id}`)

        if (!botJob && bot.status === "running") {
          console.log(`Rescheduling missing bot: ${bot._id}`)
          await this.scheduleBot(bot._id!.toString(), bot.userId, "start")
        }

        // Check for stale bots (no execution in last 10 minutes)
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
        if (bot.lastExecutedAt && bot.lastExecutedAt < tenMinutesAgo) {
          console.log(`Bot ${bot._id} appears stale, restarting...`)
          await this.scheduleBot(bot._id!.toString(), bot.userId, "stop")
          await this.scheduleBot(bot._id!.toString(), bot.userId, "start")
        }
      }
    } catch (error) {
      console.error("Bot monitoring failed:", error)
    }
  }

  private getExecutionInterval(strategy: string, config: any): number {
    switch (strategy) {
      case "dca":
        return this.parseInterval(config.dcaInterval || "1h")
      case "scalping":
        return 5000 // 5 seconds
      case "grid":
        return 30000 // 30 seconds
      case "long-short":
        return 60000 // 1 minute
      case "trend-following":
        return 300000 // 5 minutes
      case "arbitrage":
        return 10000 // 10 seconds
      default:
        return 60000 // 1 minute default
    }
  }

  private parseInterval(interval: string): number {
    const unit = interval.slice(-1)
    const value = Number.parseInt(interval.slice(0, -1))

    switch (unit) {
      case "s":
        return value * 1000
      case "m":
        return value * 60 * 1000
      case "h":
        return value * 60 * 60 * 1000
      case "d":
        return value * 24 * 60 * 60 * 1000
      default:
        return 60 * 1000 // 1 minute default
    }
  }

  async getQueueStats(): Promise<any> {
    const waiting = await botQueue.getWaiting()
    const active = await botQueue.getActive()
    const completed = await botQueue.getCompleted()
    const failed = await botQueue.getFailed()

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      workers: this.workers.size,
    }
  }

  async shutdown(): Promise<void> {
    for (const [name, worker] of this.workers) {
      await worker.close()
      console.log(`Closed worker: ${name}`)
    }

    await redis.disconnect()
    console.log("Bot scheduler shutdown complete")
  }
}

// Global scheduler instance
export const botScheduler = BotScheduler.getInstance()
