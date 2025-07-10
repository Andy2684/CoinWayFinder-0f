import { connectToDatabase } from "./database"
import crypto from "crypto"

export interface ApiKey {
  id: string
  userId: string
  name: string
  key: string
  hashedKey: string
  permissions: string[]
  rateLimit: {
    perMinute: number
    perHour: number
    perDay: number
  }
  usage: {
    totalRequests: number
    lastUsed?: Date
    requestsToday: number
    requestsThisHour: number
    requestsThisMinute: number
  }
  isActive: boolean
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface ApiKeyUsage {
  keyId: string
  endpoint: string
  method: string
  timestamp: Date
  responseTime: number
  statusCode: number
  userAgent?: string
  ipAddress?: string
}

export class ApiKeyManager {
  private db: any

  constructor() {
    this.initializeDatabase()
  }

  private async initializeDatabase() {
    this.db = await connectToDatabase()
  }

  async generateApiKey(
    userId: string,
    name: string,
    permissions: string[] = [],
    rateLimit?: { perMinute?: number; perHour?: number; perDay?: number },
    expiresAt?: Date,
  ): Promise<{ key: string; apiKey: ApiKey }> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    // Generate a secure API key
    const key = `cwf_${crypto.randomBytes(32).toString("hex")}`
    const hashedKey = crypto.createHash("sha256").update(key).digest("hex")

    const apiKey: ApiKey = {
      id: crypto.randomUUID(),
      userId,
      name,
      key: key.substring(0, 12) + "..." + key.substring(key.length - 8), // Store partial key for display
      hashedKey,
      permissions,
      rateLimit: {
        perMinute: rateLimit?.perMinute || 60,
        perHour: rateLimit?.perHour || 1000,
        perDay: rateLimit?.perDay || 10000,
      },
      usage: {
        totalRequests: 0,
        requestsToday: 0,
        requestsThisHour: 0,
        requestsThisMinute: 0,
      },
      isActive: true,
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    try {
      await this.db.collection("apiKeys").insertOne(apiKey)
      return { key, apiKey }
    } catch (error) {
      console.error("Error generating API key:", error)
      throw new Error("Failed to generate API key")
    }
  }

  async validateApiKey(key: string): Promise<ApiKey | null> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    try {
      const hashedKey = crypto.createHash("sha256").update(key).digest("hex")
      const apiKey = await this.db.collection("apiKeys").findOne({
        hashedKey,
        isActive: true,
      })

      if (!apiKey) {
        return null
      }

      // Check if key is expired
      if (apiKey.expiresAt && new Date() > new Date(apiKey.expiresAt)) {
        await this.deactivateApiKey(apiKey.id)
        return null
      }

      return apiKey
    } catch (error) {
      console.error("Error validating API key:", error)
      return null
    }
  }

  async checkRateLimit(apiKey: ApiKey): Promise<{ allowed: boolean; resetTime?: Date }> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    const now = new Date()
    const minuteAgo = new Date(now.getTime() - 60 * 1000)
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    try {
      // Count recent requests
      const [minuteCount, hourCount, dayCount] = await Promise.all([
        this.db.collection("apiKeyUsage").countDocuments({
          keyId: apiKey.id,
          timestamp: { $gte: minuteAgo },
        }),
        this.db.collection("apiKeyUsage").countDocuments({
          keyId: apiKey.id,
          timestamp: { $gte: hourAgo },
        }),
        this.db.collection("apiKeyUsage").countDocuments({
          keyId: apiKey.id,
          timestamp: { $gte: dayAgo },
        }),
      ])

      // Check limits
      if (minuteCount >= apiKey.rateLimit.perMinute) {
        return { allowed: false, resetTime: new Date(minuteAgo.getTime() + 60 * 1000) }
      }

      if (hourCount >= apiKey.rateLimit.perHour) {
        return { allowed: false, resetTime: new Date(hourAgo.getTime() + 60 * 60 * 1000) }
      }

      if (dayCount >= apiKey.rateLimit.perDay) {
        return { allowed: false, resetTime: new Date(dayAgo.getTime() + 24 * 60 * 60 * 1000) }
      }

      return { allowed: true }
    } catch (error) {
      console.error("Error checking rate limit:", error)
      return { allowed: false }
    }
  }

  async recordUsage(
    keyId: string,
    endpoint: string,
    method: string,
    responseTime: number,
    statusCode: number,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<void> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    const usage: ApiKeyUsage = {
      keyId,
      endpoint,
      method,
      timestamp: new Date(),
      responseTime,
      statusCode,
      userAgent,
      ipAddress,
    }

    try {
      await Promise.all([
        this.db.collection("apiKeyUsage").insertOne(usage),
        this.db.collection("apiKeys").updateOne(
          { id: keyId },
          {
            $inc: { "usage.totalRequests": 1 },
            $set: { "usage.lastUsed": new Date(), updatedAt: new Date() },
          },
        ),
      ])
    } catch (error) {
      console.error("Error recording API usage:", error)
    }
  }

  async getUserApiKeys(userId: string): Promise<ApiKey[]> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    try {
      const apiKeys = await this.db
        .collection("apiKeys")
        .find({ userId, isActive: true })
        .sort({ createdAt: -1 })
        .toArray()

      return apiKeys
    } catch (error) {
      console.error("Error getting user API keys:", error)
      return []
    }
  }

  async updateApiKey(
    keyId: string,
    updates: Partial<Pick<ApiKey, "name" | "permissions" | "rateLimit" | "expiresAt">>,
  ): Promise<boolean> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    try {
      const result = await this.db.collection("apiKeys").updateOne(
        { id: keyId },
        {
          $set: {
            ...updates,
            updatedAt: new Date(),
          },
        },
      )

      return result.modifiedCount > 0
    } catch (error) {
      console.error("Error updating API key:", error)
      return false
    }
  }

  async deactivateApiKey(keyId: string): Promise<boolean> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    try {
      const result = await this.db.collection("apiKeys").updateOne(
        { id: keyId },
        {
          $set: {
            isActive: false,
            updatedAt: new Date(),
          },
        },
      )

      return result.modifiedCount > 0
    } catch (error) {
      console.error("Error deactivating API key:", error)
      return false
    }
  }

  async getApiKeyUsageStats(keyId: string, days = 30): Promise<any> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    try {
      const [totalUsage, dailyUsage, endpointUsage, statusCodes] = await Promise.all([
        this.db.collection("apiKeyUsage").countDocuments({
          keyId,
          timestamp: { $gte: startDate },
        }),
        this.db
          .collection("apiKeyUsage")
          .aggregate([
            {
              $match: {
                keyId,
                timestamp: { $gte: startDate },
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
                },
                count: { $sum: 1 },
                avgResponseTime: { $avg: "$responseTime" },
              },
            },
            { $sort: { _id: 1 } },
          ])
          .toArray(),
        this.db
          .collection("apiKeyUsage")
          .aggregate([
            {
              $match: {
                keyId,
                timestamp: { $gte: startDate },
              },
            },
            {
              $group: {
                _id: "$endpoint",
                count: { $sum: 1 },
                avgResponseTime: { $avg: "$responseTime" },
              },
            },
            { $sort: { count: -1 } },
          ])
          .toArray(),
        this.db
          .collection("apiKeyUsage")
          .aggregate([
            {
              $match: {
                keyId,
                timestamp: { $gte: startDate },
              },
            },
            {
              $group: {
                _id: "$statusCode",
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ])
          .toArray(),
      ])

      return {
        totalUsage,
        dailyUsage,
        endpointUsage,
        statusCodes,
        period: { start: startDate, end: new Date() },
      }
    } catch (error) {
      console.error("Error getting API key usage stats:", error)
      return {
        totalUsage: 0,
        dailyUsage: [],
        endpointUsage: [],
        statusCodes: [],
        period: { start: startDate, end: new Date() },
      }
    }
  }

  async cleanupExpiredKeys(): Promise<number> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    try {
      const result = await this.db.collection("apiKeys").updateMany(
        {
          expiresAt: { $lt: new Date() },
          isActive: true,
        },
        {
          $set: {
            isActive: false,
            updatedAt: new Date(),
          },
        },
      )

      return result.modifiedCount
    } catch (error) {
      console.error("Error cleaning up expired keys:", error)
      return 0
    }
  }
}

export const apiKeyManager = new ApiKeyManager()
