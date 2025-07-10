import crypto from "crypto"
import { connectToDatabase } from "./database"

export interface APIKey {
  id: string
  userId: string
  name: string
  keyHash: string
  permissions: string[]
  isActive: boolean
  lastUsedAt?: Date
  expiresAt?: Date
  createdAt: Date
  rateLimit: {
    requestsPerMinute: number
    requestsPerHour: number
    requestsPerDay: number
  }
  usage: {
    totalRequests: number
    lastRequestAt?: Date
    requestsToday: number
    requestsThisHour: number
    requestsThisMinute: number
  }
}

export interface APIKeyUsage {
  keyId: string
  endpoint: string
  method: string
  timestamp: Date
  responseTime: number
  statusCode: number
  userAgent?: string
  ipAddress?: string
}

export class APIKeyManager {
  private db: any
  private usageCache = new Map<string, any>()

  constructor() {
    this.initializeDatabase()
  }

  private async initializeDatabase() {
    this.db = await connectToDatabase()
  }

  generateAPIKey(): { key: string; hash: string } {
    const key = `cwf_${crypto.randomBytes(32).toString("hex")}`
    const hash = crypto.createHash("sha256").update(key).digest("hex")
    return { key, hash }
  }

  async createAPIKey(
    userId: string,
    name: string,
    permissions: string[] = ["read"],
    expiresInDays?: number,
  ): Promise<{ apiKey: APIKey; plainKey: string } | null> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    try {
      const { key, hash } = this.generateAPIKey()
      const keyId = new Date().getTime().toString()

      const expiresAt = expiresInDays ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) : undefined

      const apiKey: APIKey = {
        id: keyId,
        userId,
        name,
        keyHash: hash,
        permissions,
        isActive: true,
        expiresAt,
        createdAt: new Date(),
        rateLimit: {
          requestsPerMinute: 60,
          requestsPerHour: 1000,
          requestsPerDay: 10000,
        },
        usage: {
          totalRequests: 0,
          requestsToday: 0,
          requestsThisHour: 0,
          requestsThisMinute: 0,
        },
      }

      await this.db.collection("apiKeys").insertOne(apiKey)

      return { apiKey, plainKey: key }
    } catch (error) {
      console.error("Error creating API key:", error)
      return null
    }
  }

  async validateAPIKey(key: string): Promise<APIKey | null> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    try {
      const hash = crypto.createHash("sha256").update(key).digest("hex")
      const apiKey = await this.db.collection("apiKeys").findOne({
        keyHash: hash,
        isActive: true,
      })

      if (!apiKey) {
        return null
      }

      // Check expiration
      if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
        await this.deactivateAPIKey(apiKey.id)
        return null
      }

      // Check rate limits
      const canMakeRequest = await this.checkRateLimit(apiKey.id)
      if (!canMakeRequest) {
        return null
      }

      return apiKey
    } catch (error) {
      console.error("Error validating API key:", error)
      return null
    }
  }

  async checkRateLimit(keyId: string): Promise<boolean> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    try {
      const apiKey = await this.db.collection("apiKeys").findOne({ id: keyId })
      if (!apiKey) {
        return false
      }

      const now = new Date()
      const usage = this.usageCache.get(keyId) || apiKey.usage

      // Check minute limit
      if (usage.requestsThisMinute >= apiKey.rateLimit.requestsPerMinute) {
        return false
      }

      // Check hour limit
      if (usage.requestsThisHour >= apiKey.rateLimit.requestsPerHour) {
        return false
      }

      // Check day limit
      if (usage.requestsToday >= apiKey.rateLimit.requestsPerDay) {
        return false
      }

      return true
    } catch (error) {
      console.error("Error checking rate limit:", error)
      return false
    }
  }

  async recordAPIUsage(
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

    try {
      const now = new Date()

      // Record usage
      const usage: APIKeyUsage = {
        keyId,
        endpoint,
        method,
        timestamp: now,
        responseTime,
        statusCode,
        userAgent,
        ipAddress,
      }

      await this.db.collection("apiUsage").insertOne(usage)

      // Update API key usage counters
      const currentHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours())
      const currentDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const currentMinute = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes())

      await this.db.collection("apiKeys").updateOne(
        { id: keyId },
        {
          $inc: {
            "usage.totalRequests": 1,
            "usage.requestsToday": 1,
            "usage.requestsThisHour": 1,
            "usage.requestsThisMinute": 1,
          },
          $set: {
            "usage.lastRequestAt": now,
            lastUsedAt: now,
          },
        },
      )

      // Reset counters if needed
      await this.resetUsageCounters(keyId, currentDay, currentHour, currentMinute)
    } catch (error) {
      console.error("Error recording API usage:", error)
    }
  }

  private async resetUsageCounters(
    keyId: string,
    currentDay: Date,
    currentHour: Date,
    currentMinute: Date,
  ): Promise<void> {
    try {
      const apiKey = await this.db.collection("apiKeys").findOne({ id: keyId })
      if (!apiKey) return

      const lastRequest = apiKey.usage.lastRequestAt ? new Date(apiKey.usage.lastRequestAt) : new Date(0)

      // Reset daily counter
      if (lastRequest.toDateString() !== currentDay.toDateString()) {
        await this.db.collection("apiKeys").updateOne({ id: keyId }, { $set: { "usage.requestsToday": 0 } })
      }

      // Reset hourly counter
      if (lastRequest.getHours() !== currentHour.getHours()) {
        await this.db.collection("apiKeys").updateOne({ id: keyId }, { $set: { "usage.requestsThisHour": 0 } })
      }

      // Reset minute counter
      if (lastRequest.getMinutes() !== currentMinute.getMinutes()) {
        await this.db.collection("apiKeys").updateOne({ id: keyId }, { $set: { "usage.requestsThisMinute": 0 } })
      }
    } catch (error) {
      console.error("Error resetting usage counters:", error)
    }
  }

  async getUserAPIKeys(userId: string): Promise<APIKey[]> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    try {
      const apiKeys = await this.db.collection("apiKeys").find({ userId, isActive: true }).toArray()
      return apiKeys
    } catch (error) {
      console.error("Error getting user API keys:", error)
      return []
    }
  }

  async getAPIKeyById(keyId: string): Promise<APIKey | null> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    try {
      const apiKey = await this.db.collection("apiKeys").findOne({ id: keyId })
      return apiKey
    } catch (error) {
      console.error("Error getting API key by ID:", error)
      return null
    }
  }

  async updateAPIKey(keyId: string, updates: Partial<APIKey>): Promise<boolean> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    try {
      const result = await this.db.collection("apiKeys").updateOne({ id: keyId }, { $set: updates })
      return result.modifiedCount > 0
    } catch (error) {
      console.error("Error updating API key:", error)
      return false
    }
  }

  async deactivateAPIKey(keyId: string): Promise<boolean> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    try {
      const result = await this.db.collection("apiKeys").updateOne({ id: keyId }, { $set: { isActive: false } })
      return result.modifiedCount > 0
    } catch (error) {
      console.error("Error deactivating API key:", error)
      return false
    }
  }

  async deleteAPIKey(keyId: string): Promise<boolean> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    try {
      const result = await this.db.collection("apiKeys").deleteOne({ id: keyId })
      return result.deletedCount > 0
    } catch (error) {
      console.error("Error deleting API key:", error)
      return false
    }
  }

  async getAPIKeyUsage(keyId: string, days = 30): Promise<APIKeyUsage[]> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      const usage = await this.db
        .collection("apiUsage")
        .find({
          keyId,
          timestamp: { $gte: startDate },
        })
        .sort({ timestamp: -1 })
        .toArray()

      return usage
    } catch (error) {
      console.error("Error getting API key usage:", error)
      return []
    }
  }

  async getUsageAnalytics(keyId: string): Promise<{
    totalRequests: number
    successRate: number
    avgResponseTime: number
    requestsByEndpoint: { [endpoint: string]: number }
    requestsByDay: { date: string; count: number }[]
  }> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    try {
      const usage = await this.getAPIKeyUsage(keyId, 30)

      const totalRequests = usage.length
      const successfulRequests = usage.filter((u) => u.statusCode >= 200 && u.statusCode < 400).length
      const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0

      const avgResponseTime = totalRequests > 0 ? usage.reduce((sum, u) => sum + u.responseTime, 0) / totalRequests : 0

      const requestsByEndpoint = usage.reduce(
        (acc, u) => {
          acc[u.endpoint] = (acc[u.endpoint] || 0) + 1
          return acc
        },
        {} as { [endpoint: string]: number },
      )

      const requestsByDay = usage.reduce(
        (acc, u) => {
          const date = u.timestamp.toISOString().split("T")[0]
          const existing = acc.find((item) => item.date === date)
          if (existing) {
            existing.count++
          } else {
            acc.push({ date, count: 1 })
          }
          return acc
        },
        [] as { date: string; count: number }[],
      )

      return {
        totalRequests,
        successRate,
        avgResponseTime,
        requestsByEndpoint,
        requestsByDay: requestsByDay.sort((a, b) => a.date.localeCompare(b.date)),
      }
    } catch (error) {
      console.error("Error getting usage analytics:", error)
      return {
        totalRequests: 0,
        successRate: 0,
        avgResponseTime: 0,
        requestsByEndpoint: {},
        requestsByDay: [],
      }
    }
  }

  async hasPermission(keyId: string, permission: string): Promise<boolean> {
    try {
      const apiKey = await this.getAPIKeyById(keyId)
      if (!apiKey) {
        return false
      }

      return apiKey.permissions.includes(permission) || apiKey.permissions.includes("admin")
    } catch (error) {
      console.error("Error checking permission:", error)
      return false
    }
  }

  async updateRateLimit(
    keyId: string,
    rateLimit: { requestsPerMinute?: number; requestsPerHour?: number; requestsPerDay?: number },
  ): Promise<boolean> {
    try {
      const updates: any = {}
      if (rateLimit.requestsPerMinute !== undefined) {
        updates["rateLimit.requestsPerMinute"] = rateLimit.requestsPerMinute
      }
      if (rateLimit.requestsPerHour !== undefined) {
        updates["rateLimit.requestsPerHour"] = rateLimit.requestsPerHour
      }
      if (rateLimit.requestsPerDay !== undefined) {
        updates["rateLimit.requestsPerDay"] = rateLimit.requestsPerDay
      }

      return this.updateAPIKey(keyId, updates)
    } catch (error) {
      console.error("Error updating rate limit:", error)
      return false
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
          $set: { isActive: false },
        },
      )

      return result.modifiedCount
    } catch (error) {
      console.error("Error cleaning up expired keys:", error)
      return 0
    }
  }
}

export const apiKeyManager = new APIKeyManager()
