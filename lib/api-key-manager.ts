import { database } from "./database"
import crypto from "crypto"

export interface ApiKey {
  _id?: string
  userId: string
  keyId: string
  keySecret: string
  name: string
  permissions: string[]
  rateLimit: {
    requestsPerMinute: number
    requestsPerHour: number
    requestsPerDay: number
  }
  usage: {
    totalRequests: number
    lastUsed?: Date
    requestsToday: number
    requestsThisHour: number
    requestsThisMinute: number
    resetDaily: Date
    resetHourly: Date
    resetMinute: Date
  }
  status: "active" | "suspended" | "revoked"
  createdAt: Date
  expiresAt?: Date
}

export interface ApiUsage {
  userId: string
  keyId: string
  endpoint: string
  method: string
  timestamp: Date
  responseTime: number
  statusCode: number
  userAgent?: string
  ipAddress?: string
}

class ApiKeyManager {
  private generateKeyPair(): { keyId: string; keySecret: string } {
    const keyId = `cwf_${crypto.randomBytes(16).toString("hex")}`
    const keySecret = crypto.randomBytes(32).toString("hex")
    return { keyId, keySecret }
  }

  async createApiKey(
    userId: string,
    name: string,
    permissions: string[] = [],
    expiresInDays?: number,
  ): Promise<ApiKey> {
    await database.connect()
    const collection = database.db!.collection<ApiKey>("api_keys")

    const { keyId, keySecret } = this.generateKeyPair()

    // Get user's plan to determine rate limits
    const userSettings = await database.getUserSettings(userId)
    const plan = userSettings?.subscription.plan || "free"

    const rateLimits = this.getRateLimitsForPlan(plan)
    const defaultPermissions = this.getDefaultPermissionsForPlan(plan)

    const expiresAt = expiresInDays ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) : undefined

    const apiKey: ApiKey = {
      userId,
      keyId,
      keySecret: this.hashSecret(keySecret),
      name,
      permissions: permissions.length > 0 ? permissions : defaultPermissions,
      rateLimit: rateLimits,
      usage: {
        totalRequests: 0,
        requestsToday: 0,
        requestsThisHour: 0,
        requestsThisMinute: 0,
        resetDaily: new Date(),
        resetHourly: new Date(),
        resetMinute: new Date(),
      },
      status: "active",
      createdAt: new Date(),
      expiresAt,
    }

    await collection.insertOne(apiKey)

    // Return the key with the unhashed secret (only time it's visible)
    return { ...apiKey, keySecret }
  }

  private hashSecret(secret: string): string {
    return crypto.createHash("sha256").update(secret).digest("hex")
  }

  private getRateLimitsForPlan(plan: string) {
    const limits = {
      free: { requestsPerMinute: 10, requestsPerHour: 100, requestsPerDay: 1000 },
      starter: { requestsPerMinute: 30, requestsPerHour: 500, requestsPerDay: 5000 },
      pro: { requestsPerMinute: 100, requestsPerHour: 2000, requestsPerDay: 20000 },
      enterprise: { requestsPerMinute: 500, requestsPerHour: 10000, requestsPerDay: 100000 },
    }
    return limits[plan as keyof typeof limits] || limits.free
  }

  private getDefaultPermissionsForPlan(plan: string): string[] {
    const permissions = {
      free: ["signals:read"],
      starter: ["signals:read", "whales:read", "trends:read"],
      pro: ["signals:read", "whales:read", "trends:read", "bots:read", "bots:create"],
      enterprise: [
        "signals:read",
        "whales:read",
        "trends:read",
        "bots:read",
        "bots:create",
        "bots:manage",
        "analytics:read",
        "webhooks:create",
      ],
    }
    return permissions[plan as keyof typeof permissions] || permissions.free
  }

  async validateApiKey(keyId: string, keySecret: string): Promise<ApiKey | null> {
    await database.connect()
    const collection = database.db!.collection<ApiKey>("api_keys")

    const apiKey = await collection.findOne({
      keyId,
      status: "active",
    })

    if (!apiKey) return null

    // Check if key is expired
    if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
      await this.revokeApiKey(keyId)
      return null
    }

    // Verify secret
    const hashedSecret = this.hashSecret(keySecret)
    if (apiKey.keySecret !== hashedSecret) return null

    return apiKey
  }

  async checkRateLimit(keyId: string): Promise<{ allowed: boolean; resetTime?: Date; remaining?: number }> {
    await database.connect()
    const collection = database.db!.collection<ApiKey>("api_keys")

    const apiKey = await collection.findOne({ keyId })
    if (!apiKey) return { allowed: false }

    const now = new Date()

    // Reset counters if needed
    let needsUpdate = false
    const updates: any = {}

    // Reset minute counter
    if (now.getTime() - apiKey.usage.resetMinute.getTime() >= 60000) {
      updates["usage.requestsThisMinute"] = 0
      updates["usage.resetMinute"] = now
      needsUpdate = true
    }

    // Reset hour counter
    if (now.getTime() - apiKey.usage.resetHourly.getTime() >= 3600000) {
      updates["usage.requestsThisHour"] = 0
      updates["usage.resetHourly"] = now
      needsUpdate = true
    }

    // Reset daily counter
    if (now.toDateString() !== apiKey.usage.resetDaily.toDateString()) {
      updates["usage.requestsToday"] = 0
      updates["usage.resetDaily"] = now
      needsUpdate = true
    }

    if (needsUpdate) {
      await collection.updateOne({ keyId }, { $set: updates })
      // Refresh the apiKey object
      const updatedKey = await collection.findOne({ keyId })
      if (updatedKey) Object.assign(apiKey, updatedKey)
    }

    // Check limits
    if (apiKey.usage.requestsThisMinute >= apiKey.rateLimit.requestsPerMinute) {
      return {
        allowed: false,
        resetTime: new Date(apiKey.usage.resetMinute.getTime() + 60000),
        remaining: 0,
      }
    }

    if (apiKey.usage.requestsThisHour >= apiKey.rateLimit.requestsPerHour) {
      return {
        allowed: false,
        resetTime: new Date(apiKey.usage.resetHourly.getTime() + 3600000),
        remaining: 0,
      }
    }

    if (apiKey.usage.requestsToday >= apiKey.rateLimit.requestsPerDay) {
      return {
        allowed: false,
        resetTime: new Date(apiKey.usage.resetDaily.getTime() + 86400000),
        remaining: 0,
      }
    }

    return {
      allowed: true,
      remaining: Math.min(
        apiKey.rateLimit.requestsPerMinute - apiKey.usage.requestsThisMinute,
        apiKey.rateLimit.requestsPerHour - apiKey.usage.requestsThisHour,
        apiKey.rateLimit.requestsPerDay - apiKey.usage.requestsToday,
      ),
    }
  }

  async incrementUsage(keyId: string, endpoint: string, method: string, responseTime: number, statusCode: number) {
    await database.connect()
    const collection = database.db!.collection<ApiKey>("api_keys")

    await collection.updateOne(
      { keyId },
      {
        $inc: {
          "usage.totalRequests": 1,
          "usage.requestsToday": 1,
          "usage.requestsThisHour": 1,
          "usage.requestsThisMinute": 1,
        },
        $set: {
          "usage.lastUsed": new Date(),
        },
      },
    )

    // Log usage for analytics
    const usageCollection = database.db!.collection<ApiUsage>("api_usage")
    await usageCollection.insertOne({
      userId: "", // Will be filled by the API middleware
      keyId,
      endpoint,
      method,
      timestamp: new Date(),
      responseTime,
      statusCode,
    })
  }

  async getUserApiKeys(userId: string): Promise<Omit<ApiKey, "keySecret">[]> {
    await database.connect()
    const collection = database.db!.collection<ApiKey>("api_keys")

    const keys = await collection.find({ userId }).toArray()
    return keys.map(({ keySecret, ...key }) => key)
  }

  async revokeApiKey(keyId: string): Promise<boolean> {
    await database.connect()
    const collection = database.db!.collection<ApiKey>("api_keys")

    const result = await collection.updateOne({ keyId }, { $set: { status: "revoked" } })
    return result.modifiedCount > 0
  }

  async updateApiKeyPermissions(keyId: string, permissions: string[]): Promise<boolean> {
    await database.connect()
    const collection = database.db!.collection<ApiKey>("api_keys")

    const result = await collection.updateOne({ keyId }, { $set: { permissions } })
    return result.modifiedCount > 0
  }

  hasPermission(apiKey: ApiKey, permission: string): boolean {
    return apiKey.permissions.includes(permission) || apiKey.permissions.includes("*")
  }
}

export const apiKeyManager = new ApiKeyManager()
