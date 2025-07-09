import crypto from "crypto"
import { database } from "./database"

interface APIKey {
  id: string
  userId: string
  name: string
  keyId: string
  secretHash: string
  permissions: string[]
  rateLimit: {
    requestsPerMinute: number
    requestsPerHour: number
    requestsPerDay: number
  }
  usage: {
    totalRequests: number
    lastUsedAt?: Date
    dailyRequests: number
    dailyResetAt: Date
  }
  isActive: boolean
  createdAt: Date
  expiresAt?: Date
}

interface APIKeyUsage {
  keyId: string
  endpoint: string
  method: string
  statusCode: number
  responseTime: number
  timestamp: Date
  userAgent?: string
  ipAddress?: string
}

interface RateLimitResult {
  allowed: boolean
  remaining?: number
  resetTime?: Date
}

class APIKeyManager {
  private apiKeys = new Map<string, APIKey>()
  private usageLog = new Map<string, APIKeyUsage[]>()
  private rateLimitCache = new Map<string, { count: number; resetTime: number }>()

  generateAPIKey(): { keyId: string; secret: string } {
    const keyId = "cwf_" + crypto.randomBytes(16).toString("hex")
    const secret = crypto.randomBytes(32).toString("hex")
    return { keyId, secret }
  }

  private hashSecret(secret: string): string {
    return crypto.createHash("sha256").update(secret).digest("hex")
  }

  async createAPIKey(
    userId: string,
    name: string,
    permissions: string[] = ["read"],
    rateLimit?: Partial<APIKey["rateLimit"]>,
  ): Promise<{ keyId: string; secret: string }> {
    const { keyId, secret } = this.generateAPIKey()
    const secretHash = this.hashSecret(secret)

    const apiKey: APIKey = {
      id: crypto.randomUUID(),
      userId,
      name,
      keyId,
      secretHash,
      permissions,
      rateLimit: {
        requestsPerMinute: rateLimit?.requestsPerMinute || 60,
        requestsPerHour: rateLimit?.requestsPerHour || 1000,
        requestsPerDay: rateLimit?.requestsPerDay || 10000,
      },
      usage: {
        totalRequests: 0,
        dailyRequests: 0,
        dailyResetAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      isActive: true,
      createdAt: new Date(),
    }

    this.apiKeys.set(keyId, apiKey)

    // Store in database
    await database.createAPIKey(userId, {
      name,
      key: keyId,
      permissions,
    })

    return { keyId, secret }
  }

  async validateAPIKey(keyId: string, secret: string): Promise<APIKey | null> {
    const apiKey = this.apiKeys.get(keyId)
    if (!apiKey || !apiKey.isActive) {
      return null
    }

    const secretHash = this.hashSecret(secret)
    if (secretHash !== apiKey.secretHash) {
      return null
    }

    // Check if expired
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return null
    }

    return apiKey
  }

  async checkRateLimit(keyId: string): Promise<RateLimitResult> {
    const apiKey = this.apiKeys.get(keyId)
    if (!apiKey) {
      return { allowed: false }
    }

    const now = Date.now()
    const minuteKey = `${keyId}:minute:${Math.floor(now / 60000)}`
    const hourKey = `${keyId}:hour:${Math.floor(now / 3600000)}`
    const dayKey = `${keyId}:day:${Math.floor(now / 86400000)}`

    // Check minute limit
    const minuteLimit = this.rateLimitCache.get(minuteKey)
    if (minuteLimit && minuteLimit.count >= apiKey.rateLimit.requestsPerMinute) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: new Date(minuteLimit.resetTime),
      }
    }

    // Check hour limit
    const hourLimit = this.rateLimitCache.get(hourKey)
    if (hourLimit && hourLimit.count >= apiKey.rateLimit.requestsPerHour) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: new Date(hourLimit.resetTime),
      }
    }

    // Check day limit
    const dayLimit = this.rateLimitCache.get(dayKey)
    if (dayLimit && dayLimit.count >= apiKey.rateLimit.requestsPerDay) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: new Date(dayLimit.resetTime),
      }
    }

    // Update counters
    this.updateRateLimitCounter(minuteKey, now + 60000)
    this.updateRateLimitCounter(hourKey, now + 3600000)
    this.updateRateLimitCounter(dayKey, now + 86400000)

    const remaining = apiKey.rateLimit.requestsPerMinute - (minuteLimit?.count || 0) - 1

    return {
      allowed: true,
      remaining: Math.max(0, remaining),
    }
  }

  private updateRateLimitCounter(key: string, resetTime: number): void {
    const existing = this.rateLimitCache.get(key)
    if (existing) {
      existing.count++
    } else {
      this.rateLimitCache.set(key, { count: 1, resetTime })
    }
  }

  async recordUsage(
    keyId: string,
    endpoint: string,
    method: string,
    statusCode: number,
    responseTime: number,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<void> {
    const apiKey = this.apiKeys.get(keyId)
    if (!apiKey) return

    // Update usage stats
    apiKey.usage.totalRequests++
    apiKey.usage.lastUsedAt = new Date()

    // Reset daily counter if needed
    if (new Date() > apiKey.usage.dailyResetAt) {
      apiKey.usage.dailyRequests = 0
      apiKey.usage.dailyResetAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
    apiKey.usage.dailyRequests++

    // Log usage
    const usage: APIKeyUsage = {
      keyId,
      endpoint,
      method,
      statusCode,
      responseTime,
      timestamp: new Date(),
      userAgent,
      ipAddress,
    }

    const keyUsage = this.usageLog.get(keyId) || []
    keyUsage.push(usage)

    // Keep only last 1000 entries per key
    if (keyUsage.length > 1000) {
      keyUsage.splice(0, keyUsage.length - 1000)
    }

    this.usageLog.set(keyId, keyUsage)
  }

  async getUserAPIKeys(userId: string): Promise<Omit<APIKey, "secretHash">[]> {
    const userKeys = Array.from(this.apiKeys.values())
      .filter((key) => key.userId === userId)
      .map((key) => {
        const { secretHash, ...keyWithoutSecret } = key
        return keyWithoutSecret
      })

    return userKeys
  }

  async getAPIKeyUsage(keyId: string, limit = 100): Promise<APIKeyUsage[]> {
    const usage = this.usageLog.get(keyId) || []
    return usage.slice(-limit).reverse()
  }

  async updateAPIKey(
    keyId: string,
    updates: Partial<Pick<APIKey, "name" | "permissions" | "rateLimit" | "isActive">>,
  ): Promise<boolean> {
    const apiKey = this.apiKeys.get(keyId)
    if (!apiKey) return false

    Object.assign(apiKey, updates)
    return true
  }

  async deleteAPIKey(keyId: string): Promise<boolean> {
    const deleted = this.apiKeys.delete(keyId)
    this.usageLog.delete(keyId)
    return deleted
  }

  async getAPIKeyStats(keyId: string): Promise<{
    totalRequests: number
    dailyRequests: number
    averageResponseTime: number
    errorRate: number
    lastUsedAt?: Date
  } | null> {
    const apiKey = this.apiKeys.get(keyId)
    if (!apiKey) return null

    const usage = this.usageLog.get(keyId) || []
    const recentUsage = usage.filter((u) => u.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000))

    const totalRequests = apiKey.usage.totalRequests
    const dailyRequests = recentUsage.length
    const averageResponseTime =
      recentUsage.length > 0 ? recentUsage.reduce((sum, u) => sum + u.responseTime, 0) / recentUsage.length : 0
    const errorRequests = recentUsage.filter((u) => u.statusCode >= 400).length
    const errorRate = recentUsage.length > 0 ? (errorRequests / recentUsage.length) * 100 : 0

    return {
      totalRequests,
      dailyRequests,
      averageResponseTime,
      errorRate,
      lastUsedAt: apiKey.usage.lastUsedAt,
    }
  }

  // Initialize with some default API keys for testing
  async initializeDefaultKeys(): Promise<void> {
    // This would typically load from database
    console.log("API Key Manager initialized")
  }
}

export const apiKeyManager = new APIKeyManager()

// Initialize on module load
apiKeyManager.initializeDefaultKeys()
