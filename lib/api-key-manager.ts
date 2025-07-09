import { connectToDatabase } from "./database"
import crypto from "crypto"

export interface ApiKey {
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

  generateApiKey(): string {
    return `cwf_${crypto.randomBytes(32).toString("hex")}`
  }

  hashApiKey(apiKey: string): string {
    return crypto.createHash("sha256").update(apiKey).digest("hex")
  }

  async createApiKey(
    userId: string,
    name: string,
    permissions: string[] = ["read"],
    expiresInDays?: number,
  ): Promise<{ apiKey: ApiKey; plainKey: string }> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    const plainKey = this.generateApiKey()
    const keyHash = this.hashApiKey(plainKey)
    const keyId = new Date().getTime().toString()

    const expiresAt = expiresInDays ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) : undefined

    const apiKey: ApiKey = {
      id: keyId,
      userId,
      name,
      keyHash,
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

    return { apiKey, plainKey }
  }

  async validateApiKey(plainKey: string): Promise<ApiKey | null> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    if (!plainKey.startsWith("cwf_")) {
      return null
    }

    const keyHash = this.hashApiKey(plainKey)

    const apiKey = await this.db.collection("apiKeys").findOne({
      keyHash,
      isActive: true,
    })

    if (!apiKey) {
      return null
    }

    // Check if key is expired
    if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
      await this.deactivateApiKey(apiKey.id)
      return null
    }

    return apiKey
  }

  async checkRateLimit(apiKey: ApiKey): Promise<{ allowed: boolean; resetTime?: Date }> {
    const now = new Date()
    const currentMinute = Math.floor(now.getTime() / (60 * 1000))
    const currentHour = Math.floor(now.getTime() / (60 * 60 * 1000))
    const currentDay = Math.floor(now.getTime() / (24 * 60 * 60 * 1000))

    // Check minute limit
    if (apiKey.usage.requestsThisMinute >= apiKey.rateLimit.requestsPerMinute) {
      return {
        allowed: false,
        resetTime: new Date((currentMinute + 1) * 60 * 1000),
      }
    }

    // Check hour limit
    if (apiKey.usage.requestsThisHour >= apiKey.rateLimit.requestsPerHour) {
      return {
        allowed: false,
        resetTime: new Date((currentHour + 1) * 60 * 60 * 1000),
      }
    }

    // Check day limit
    if (apiKey.usage.requestsToday >= apiKey.rateLimit.requestsPerDay) {
      return {
        allowed: false,
        resetTime: new Date((currentDay + 1) * 24 * 60 * 60 * 1000),
      }
    }

    return { allowed: true }
  }

  async recordApiUsage(
    apiKey: ApiKey,
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

    const now = new Date()
    const currentMinute = Math.floor(now.getTime() / (60 * 1000))
    const currentHour = Math.floor(now.getTime() / (60 * 60 * 1000))
    const currentDay = Math.floor(now.getTime() / (24 * 60 * 60 * 1000))

    // Record usage
    const usage: ApiKeyUsage = {
      keyId: apiKey.id,
      endpoint,
      method,
      timestamp: now,
      responseTime,
      statusCode,
      userAgent,
      ipAddress,
    }

    await this.db.collection("apiKeyUsage").insertOne(usage)

    // Update API key usage counters
    const lastUsageMinute = apiKey.usage.lastRequestAt
      ? Math.floor(apiKey.usage.lastRequestAt.getTime() / (60 * 1000))
      : 0
    const lastUsageHour = apiKey.usage.lastRequestAt
      ? Math.floor(apiKey.usage.lastRequestAt.getTime() / (60 * 60 * 1000))
      : 0
    const lastUsageDay = apiKey.usage.lastRequestAt
      ? Math.floor(apiKey.usage.lastRequestAt.getTime() / (24 * 60 * 60 * 1000))
      : 0

    const updates: any = {
      "usage.totalRequests": apiKey.usage.totalRequests + 1,
      "usage.lastRequestAt": now,
      lastUsedAt: now,
    }

    // Reset counters if time period has changed
    if (currentMinute !== lastUsageMinute) {
      updates["usage.requestsThisMinute"] = 1
    } else {
      updates["usage.requestsThisMinute"] = apiKey.usage.requestsThisMinute + 1
    }

    if (currentHour !== lastUsageHour) {
      updates["usage.requestsThisHour"] = 1
    } else {
      updates["usage.requestsThisHour"] = apiKey.usage.requestsThisHour + 1
    }

    if (currentDay !== lastUsageDay) {
      updates["usage.requestsToday"] = 1
    } else {
      updates["usage.requestsToday"] = apiKey.usage.requestsToday + 1
    }

    await this.db.collection("apiKeys").updateOne({ id: apiKey.id }, { $set: updates })
  }

  async getUserApiKeys(userId: string): Promise<ApiKey[]> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    return this.db.collection("apiKeys").find({ userId, isActive: true }).toArray()
  }

  async getApiKey(keyId: string): Promise<ApiKey | null> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    return this.db.collection("apiKeys").findOne({ id: keyId })
  }

  async updateApiKey(keyId: string, updates: Partial<ApiKey>): Promise<boolean> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    const result = await this.db.collection("apiKeys").updateOne({ id: keyId }, { $set: updates })

    return result.modifiedCount > 0
  }

  async deactivateApiKey(keyId: string): Promise<boolean> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    const result = await this.db.collection("apiKeys").updateOne({ id: keyId }, { $set: { isActive: false } })

    return result.modifiedCount > 0
  }

  async deleteApiKey(keyId: string): Promise<boolean> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    const result = await this.db.collection("apiKeys").deleteOne({ id: keyId })

    return result.deletedCount > 0
  }

  async getApiKeyUsage(keyId: string, startDate?: Date, endDate?: Date): Promise<ApiKeyUsage[]> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    const query: any = { keyId }

    if (startDate || endDate) {
      query.timestamp = {}
      if (startDate) query.timestamp.$gte = startDate
      if (endDate) query.timestamp.$lte = endDate
    }

    return this.db.collection("apiKeyUsage").find(query).sort({ timestamp: -1 }).toArray()
  }

  async getUsageStats(keyId: string): Promise<{
    totalRequests: number
    requestsToday: number
    requestsThisWeek: number
    requestsThisMonth: number
    avgResponseTime: number
    errorRate: number
    topEndpoints: Array<{ endpoint: string; count: number }>
  }> {
    if (!this.db) {
      await this.initializeDatabase()
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [totalRequests, requestsToday, requestsThisWeek, requestsThisMonth, usageData] = await Promise.all([
      this.db.collection("apiKeyUsage").countDocuments({ keyId }),
      this.db.collection("apiKeyUsage").countDocuments({ keyId, timestamp: { $gte: today } }),
      this.db.collection("apiKeyUsage").countDocuments({ keyId, timestamp: { $gte: weekAgo } }),
      this.db.collection("apiKeyUsage").countDocuments({ keyId, timestamp: { $gte: monthAgo } }),
      this.db.collection("apiKeyUsage").find({ keyId }).toArray(),
    ])

    const avgResponseTime =
      usageData.length > 0 ? usageData.reduce((sum, usage) => sum + usage.responseTime, 0) / usageData.length : 0

    const errorCount = usageData.filter((usage) => usage.statusCode >= 400).length
    const errorRate = usageData.length > 0 ? (errorCount / usageData.length) * 100 : 0

    // Calculate top endpoints
    const endpointCounts = usageData.reduce(
      (acc, usage) => {
        acc[usage.endpoint] = (acc[usage.endpoint] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const topEndpoints = Object.entries(endpointCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([endpoint, count]) => ({ endpoint, count }))

    return {
      totalRequests,
      requestsToday,
      requestsThisWeek,
      requestsThisMonth,
      avgResponseTime,
      errorRate,
      topEndpoints,
    }
  }

  async cleanupExpiredKeys(): Promise<number> {
    if (!this.db) {
      await this.initializeDatabase()
    }

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
  }

  async hasPermission(apiKey: ApiKey, permission: string): Promise<boolean> {
    return apiKey.permissions.includes(permission) || apiKey.permissions.includes("admin")
  }

  async updateRateLimit(
    keyId: string,
    rateLimit: {
      requestsPerMinute?: number
      requestsPerHour?: number
      requestsPerDay?: number
    },
  ): Promise<boolean> {
    if (!this.db) {
      await this.initializeDatabase()
    }

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

    const result = await this.db.collection("apiKeys").updateOne({ id: keyId }, { $set: updates })

    return result.modifiedCount > 0
  }
}

export const apiKeyManager = new ApiKeyManager()
