import { database } from "./database"
import crypto from "crypto"

export interface APIKey {
  _id?: string
  userId: string
  keyId: string
  secretHash: string
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
    lastResetMinute: Date
    lastResetHour: Date
    lastResetDay: Date
  }
  isActive: boolean
  createdAt: Date
  expiresAt?: Date
}

export interface APIUsageLog {
  _id?: string
  keyId: string
  userId: string
  endpoint: string
  method: string
  timestamp: Date
  responseStatus: number
  responseTime: number
  userAgent?: string
  ipAddress?: string
}

class APIKeyManager {
  private static instance: APIKeyManager

  static getInstance(): APIKeyManager {
    if (!APIKeyManager.instance) {
      APIKeyManager.instance = new APIKeyManager()
    }
    return APIKeyManager.instance
  }

  generateKeyPair(): { keyId: string; secret: string } {
    const keyId = `cwf_${crypto.randomBytes(16).toString("hex")}`
    const secret = crypto.randomBytes(32).toString("hex")
    return { keyId, secret }
  }

  hashSecret(secret: string): string {
    return crypto.createHash("sha256").update(secret).digest("hex")
  }

  async createAPIKey(
    userId: string,
    name: string,
    permissions: string[] = ["signals:read"],
    planLimits: { requestsPerMinute: number; requestsPerHour: number; requestsPerDay: number },
  ): Promise<{ keyId: string; secret: string }> {
    const { keyId, secret } = this.generateKeyPair()
    const secretHash = this.hashSecret(secret)

    const apiKey: Omit<APIKey, "_id"> = {
      userId,
      keyId,
      secretHash,
      name,
      permissions,
      rateLimit: planLimits,
      usage: {
        totalRequests: 0,
        requestsToday: 0,
        requestsThisHour: 0,
        requestsThisMinute: 0,
        lastResetMinute: new Date(),
        lastResetHour: new Date(),
        lastResetDay: new Date(),
      },
      isActive: true,
      createdAt: new Date(),
    }

    await database.saveAPIKey(apiKey)
    return { keyId, secret }
  }

  async validateAPIKey(keyId: string, secret: string): Promise<APIKey | null> {
    const apiKey = await database.getAPIKey(keyId)
    if (!apiKey || !apiKey.isActive) {
      return null
    }

    const secretHash = this.hashSecret(secret)
    if (secretHash !== apiKey.secretHash) {
      return null
    }

    return apiKey
  }

  async checkRateLimit(keyId: string): Promise<{ allowed: boolean; resetTime?: Date; remaining?: number }> {
    const apiKey = await database.getAPIKey(keyId)
    if (!apiKey) {
      return { allowed: false }
    }

    const now = new Date()

    // Reset counters if needed
    if (now.getMinutes() !== apiKey.usage.lastResetMinute.getMinutes()) {
      apiKey.usage.requestsThisMinute = 0
      apiKey.usage.lastResetMinute = now
    }

    if (now.getHours() !== apiKey.usage.lastResetHour.getHours()) {
      apiKey.usage.requestsThisHour = 0
      apiKey.usage.lastResetHour = now
    }

    if (now.getDate() !== apiKey.usage.lastResetDay.getDate()) {
      apiKey.usage.requestsToday = 0
      apiKey.usage.lastResetDay = now
    }

    // Check limits
    if (apiKey.usage.requestsThisMinute >= apiKey.rateLimit.requestsPerMinute) {
      const resetTime = new Date(now.getTime() + (60 - now.getSeconds()) * 1000)
      return {
        allowed: false,
        resetTime,
        remaining: 0,
      }
    }

    if (apiKey.usage.requestsThisHour >= apiKey.rateLimit.requestsPerHour) {
      const resetTime = new Date(now.getTime() + (3600 - (now.getMinutes() * 60 + now.getSeconds())) * 1000)
      return {
        allowed: false,
        resetTime,
        remaining: 0,
      }
    }

    if (apiKey.usage.requestsToday >= apiKey.rateLimit.requestsPerDay) {
      const resetTime = new Date(now)
      resetTime.setDate(resetTime.getDate() + 1)
      resetTime.setHours(0, 0, 0, 0)
      return {
        allowed: false,
        resetTime,
        remaining: 0,
      }
    }

    return {
      allowed: true,
      remaining: apiKey.rateLimit.requestsPerMinute - apiKey.usage.requestsThisMinute,
    }
  }

  async recordUsage(
    keyId: string,
    endpoint: string,
    method: string,
    responseStatus: number,
    responseTime: number,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<void> {
    // Update API key usage
    await database.incrementAPIKeyUsage(keyId)

    // Log the request
    const usageLog: Omit<APIUsageLog, "_id"> = {
      keyId,
      userId: "", // Will be filled by database
      endpoint,
      method,
      timestamp: new Date(),
      responseStatus,
      responseTime,
      userAgent,
      ipAddress,
    }

    await database.saveAPIUsageLog(usageLog)
  }

  async getUserAPIKeys(userId: string): Promise<APIKey[]> {
    return database.getUserAPIKeys(userId)
  }

  async revokeAPIKey(keyId: string, userId: string): Promise<boolean> {
    return database.revokeAPIKey(keyId, userId)
  }

  async getAPIKeyUsage(keyId: string, userId: string, days = 30): Promise<APIUsageLog[]> {
    return database.getAPIKeyUsage(keyId, userId, days)
  }

  getPlanLimits(plan: string): { requestsPerMinute: number; requestsPerHour: number; requestsPerDay: number } {
    const limits = {
      free: { requestsPerMinute: 10, requestsPerHour: 100, requestsPerDay: 500 },
      basic: { requestsPerMinute: 50, requestsPerHour: 1000, requestsPerDay: 5000 },
      premium: { requestsPerMinute: 200, requestsPerHour: 5000, requestsPerDay: 25000 },
      enterprise: { requestsPerMinute: 500, requestsPerHour: 15000, requestsPerDay: 100000 },
    }

    return limits[plan as keyof typeof limits] || limits.free
  }

  getPermissionsByPlan(plan: string): string[] {
    const permissions = {
      free: ["signals:read"],
      basic: ["signals:read", "whales:read", "trends:read"],
      premium: ["signals:read", "whales:read", "trends:read", "bots:read", "bots:create"],
      enterprise: [
        "signals:read",
        "whales:read",
        "trends:read",
        "bots:read",
        "bots:create",
        "bots:manage",
        "analytics:read",
      ],
    }

    return permissions[plan as keyof typeof permissions] || permissions.free
  }
}

export const apiKeyManager = APIKeyManager.getInstance()
