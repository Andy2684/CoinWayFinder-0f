import { randomBytes, createHash } from "crypto"

export interface APIKey {
  id: string
  userId: string
  name: string
  keyId: string
  hashedSecret: string
  permissions: string[]
  isActive: boolean
  createdAt: Date
  lastUsedAt?: Date
  expiresAt?: Date
  rateLimit: {
    requestsPerMinute: number
    requestsPerHour: number
    requestsPerDay: number
  }
  usage: {
    totalRequests: number
    lastResetAt: Date
  }
}

export interface APIKeyUsage {
  keyId: string
  endpoint: string
  method: string
  statusCode: number
  responseTime: number
  timestamp: Date
  userAgent?: string
  ipAddress?: string
}

export interface RateLimitCheck {
  allowed: boolean
  remaining?: number
  resetTime?: Date
}

class APIKeyManager {
  private apiKeys = new Map<string, APIKey>()
  private usageRecords = new Map<string, APIKeyUsage[]>()
  private rateLimitCounters = new Map<string, { count: number; resetTime: Date }>()

  generateAPIKey(userId: string, name: string, permissions: string[] = []): { keyId: string; secret: string } {
    const keyId = `cwf_${randomBytes(16).toString("hex")}`
    const secret = randomBytes(32).toString("hex")
    const hashedSecret = this.hashSecret(secret)

    const apiKey: APIKey = {
      id: randomBytes(8).toString("hex"),
      userId,
      name,
      keyId,
      hashedSecret,
      permissions,
      isActive: true,
      createdAt: new Date(),
      rateLimit: {
        requestsPerMinute: 60,
        requestsPerHour: 1000,
        requestsPerDay: 10000,
      },
      usage: {
        totalRequests: 0,
        lastResetAt: new Date(),
      },
    }

    this.apiKeys.set(keyId, apiKey)
    return { keyId, secret }
  }

  private hashSecret(secret: string): string {
    return createHash("sha256").update(secret).digest("hex")
  }

  async validateAPIKey(keyId: string, secret: string): Promise<APIKey | null> {
    const apiKey = this.apiKeys.get(keyId)
    if (!apiKey || !apiKey.isActive) {
      return null
    }

    const hashedSecret = this.hashSecret(secret)
    if (hashedSecret !== apiKey.hashedSecret) {
      return null
    }

    // Check expiration
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return null
    }

    // Update last used
    apiKey.lastUsedAt = new Date()
    return apiKey
  }

  async checkRateLimit(keyId: string): Promise<RateLimitCheck> {
    const apiKey = this.apiKeys.get(keyId)
    if (!apiKey) {
      return { allowed: false }
    }

    const now = new Date()
    const minuteKey = `${keyId}:${Math.floor(now.getTime() / 60000)}`

    let counter = this.rateLimitCounters.get(minuteKey)
    if (!counter) {
      counter = {
        count: 0,
        resetTime: new Date(Math.ceil(now.getTime() / 60000) * 60000),
      }
      this.rateLimitCounters.set(minuteKey, counter)
    }

    if (counter.count >= apiKey.rateLimit.requestsPerMinute) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: counter.resetTime,
      }
    }

    counter.count++
    return {
      allowed: true,
      remaining: apiKey.rateLimit.requestsPerMinute - counter.count,
      resetTime: counter.resetTime,
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

    let records = this.usageRecords.get(keyId)
    if (!records) {
      records = []
      this.usageRecords.set(keyId, records)
    }

    records.push(usage)
    apiKey.usage.totalRequests++

    // Keep only last 1000 records per key
    if (records.length > 1000) {
      records.splice(0, records.length - 1000)
    }
  }

  async getUserAPIKeys(userId: string): Promise<Omit<APIKey, "hashedSecret">[]> {
    const userKeys: Omit<APIKey, "hashedSecret">[] = []

    for (const apiKey of this.apiKeys.values()) {
      if (apiKey.userId === userId) {
        const { hashedSecret, ...safeKey } = apiKey
        userKeys.push(safeKey)
      }
    }

    return userKeys.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  async revokeAPIKey(keyId: string, userId: string): Promise<boolean> {
    const apiKey = this.apiKeys.get(keyId)
    if (!apiKey || apiKey.userId !== userId) {
      return false
    }

    apiKey.isActive = false
    return true
  }

  async deleteAPIKey(keyId: string, userId: string): Promise<boolean> {
    const apiKey = this.apiKeys.get(keyId)
    if (!apiKey || apiKey.userId !== userId) {
      return false
    }

    this.apiKeys.delete(keyId)
    this.usageRecords.delete(keyId)
    return true
  }

  async updateAPIKeyPermissions(keyId: string, userId: string, permissions: string[]): Promise<boolean> {
    const apiKey = this.apiKeys.get(keyId)
    if (!apiKey || apiKey.userId !== userId) {
      return false
    }

    apiKey.permissions = permissions
    return true
  }

  async getAPIKeyUsage(keyId: string, userId: string, limit = 100): Promise<APIKeyUsage[]> {
    const apiKey = this.apiKeys.get(keyId)
    if (!apiKey || apiKey.userId !== userId) {
      return []
    }

    const records = this.usageRecords.get(keyId) || []
    return records.slice(-limit).reverse()
  }

  async getUsageStats(
    keyId: string,
    userId: string,
  ): Promise<{
    totalRequests: number
    requestsToday: number
    requestsThisHour: number
    averageResponseTime: number
    errorRate: number
  }> {
    const apiKey = this.apiKeys.get(keyId)
    if (!apiKey || apiKey.userId !== userId) {
      return {
        totalRequests: 0,
        requestsToday: 0,
        requestsThisHour: 0,
        averageResponseTime: 0,
        errorRate: 0,
      }
    }

    const records = this.usageRecords.get(keyId) || []
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const hourStart = new Date(now.getTime() - 60 * 60 * 1000)

    const requestsToday = records.filter((r) => r.timestamp >= todayStart).length
    const requestsThisHour = records.filter((r) => r.timestamp >= hourStart).length

    const totalResponseTime = records.reduce((sum, r) => sum + r.responseTime, 0)
    const averageResponseTime = records.length > 0 ? totalResponseTime / records.length : 0

    const errorRequests = records.filter((r) => r.statusCode >= 400).length
    const errorRate = records.length > 0 ? (errorRequests / records.length) * 100 : 0

    return {
      totalRequests: apiKey.usage.totalRequests,
      requestsToday,
      requestsThisHour,
      averageResponseTime: Math.round(averageResponseTime),
      errorRate: Math.round(errorRate * 100) / 100,
    }
  }
}

export const apiKeyManager = new APIKeyManager()
