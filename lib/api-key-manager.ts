import crypto from "crypto"

export interface APIKey {
  id: string
  userId: string
  name: string
  keyId: string
  hashedSecret: string
  permissions: string[]
  isActive: boolean
  lastUsed?: Date
  createdAt: Date
  expiresAt?: Date
  rateLimit: {
    requestsPerMinute: number
    requestsPerHour: number
    requestsPerDay: number
  }
  usage: {
    totalRequests: number
    lastReset: Date
    currentMinute: number
    currentHour: number
    currentDay: number
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
  limit: number
}

class APIKeyManager {
  private apiKeys = new Map<string, APIKey>()
  private usageHistory = new Map<string, APIKeyUsage[]>()

  private hashSecret(secret: string): string {
    return crypto.createHash("sha256").update(secret).digest("hex")
  }

  private generateKeyId(): string {
    return `cwf_${crypto.randomBytes(16).toString("hex")}`
  }

  private generateSecret(): string {
    return crypto.randomBytes(32).toString("hex")
  }

  async createAPIKey(
    userId: string,
    name: string,
    permissions: string[] = ["read"],
    expiresAt?: Date,
  ): Promise<{ keyId: string; secret: string; apiKey: APIKey }> {
    const keyId = this.generateKeyId()
    const secret = this.generateSecret()
    const hashedSecret = this.hashSecret(secret)

    const apiKey: APIKey = {
      id: crypto.randomUUID(),
      userId,
      name,
      keyId,
      hashedSecret,
      permissions,
      isActive: true,
      createdAt: new Date(),
      expiresAt,
      rateLimit: {
        requestsPerMinute: 60,
        requestsPerHour: 1000,
        requestsPerDay: 10000,
      },
      usage: {
        totalRequests: 0,
        lastReset: new Date(),
        currentMinute: 0,
        currentHour: 0,
        currentDay: 0,
      },
    }

    this.apiKeys.set(keyId, apiKey)
    return { keyId, secret, apiKey }
  }

  async validateAPIKey(keyId: string, secret: string): Promise<APIKey | null> {
    const apiKey = this.apiKeys.get(keyId)
    if (!apiKey) {
      return null
    }

    if (!apiKey.isActive) {
      return null
    }

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return null
    }

    const hashedSecret = this.hashSecret(secret)
    if (hashedSecret !== apiKey.hashedSecret) {
      return null
    }

    // Update last used
    apiKey.lastUsed = new Date()
    return apiKey
  }

  async checkRateLimit(keyId: string): Promise<RateLimitCheck> {
    const apiKey = this.apiKeys.get(keyId)
    if (!apiKey) {
      return { allowed: false, limit: 0 }
    }

    const now = new Date()
    const currentMinute = Math.floor(now.getTime() / 60000)
    const currentHour = Math.floor(now.getTime() / 3600000)
    const currentDay = Math.floor(now.getTime() / 86400000)

    // Reset counters if time periods have changed
    const lastResetMinute = Math.floor(apiKey.usage.lastReset.getTime() / 60000)
    const lastResetHour = Math.floor(apiKey.usage.lastReset.getTime() / 3600000)
    const lastResetDay = Math.floor(apiKey.usage.lastReset.getTime() / 86400000)

    if (currentMinute > lastResetMinute) {
      apiKey.usage.currentMinute = 0
    }
    if (currentHour > lastResetHour) {
      apiKey.usage.currentHour = 0
    }
    if (currentDay > lastResetDay) {
      apiKey.usage.currentDay = 0
    }

    // Check limits
    if (apiKey.usage.currentMinute >= apiKey.rateLimit.requestsPerMinute) {
      const resetTime = new Date((currentMinute + 1) * 60000)
      return {
        allowed: false,
        remaining: 0,
        resetTime,
        limit: apiKey.rateLimit.requestsPerMinute,
      }
    }

    if (apiKey.usage.currentHour >= apiKey.rateLimit.requestsPerHour) {
      const resetTime = new Date((currentHour + 1) * 3600000)
      return {
        allowed: false,
        remaining: 0,
        resetTime,
        limit: apiKey.rateLimit.requestsPerHour,
      }
    }

    if (apiKey.usage.currentDay >= apiKey.rateLimit.requestsPerDay) {
      const resetTime = new Date((currentDay + 1) * 86400000)
      return {
        allowed: false,
        remaining: 0,
        resetTime,
        limit: apiKey.rateLimit.requestsPerDay,
      }
    }

    return {
      allowed: true,
      remaining: apiKey.rateLimit.requestsPerMinute - apiKey.usage.currentMinute,
      limit: apiKey.rateLimit.requestsPerMinute,
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
    if (!apiKey) {
      return
    }

    // Update usage counters
    apiKey.usage.totalRequests++
    apiKey.usage.currentMinute++
    apiKey.usage.currentHour++
    apiKey.usage.currentDay++

    // Record usage history
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

    if (!this.usageHistory.has(keyId)) {
      this.usageHistory.set(keyId, [])
    }

    const history = this.usageHistory.get(keyId)!
    history.push(usage)

    // Keep only last 1000 entries
    if (history.length > 1000) {
      history.splice(0, history.length - 1000)
    }
  }

  async getUserAPIKeys(userId: string): Promise<APIKey[]> {
    return Array.from(this.apiKeys.values()).filter((key) => key.userId === userId)
  }

  async revokeAPIKey(keyId: string): Promise<boolean> {
    const apiKey = this.apiKeys.get(keyId)
    if (!apiKey) {
      return false
    }

    apiKey.isActive = false
    return true
  }

  async deleteAPIKey(keyId: string): Promise<boolean> {
    const deleted = this.apiKeys.delete(keyId)
    this.usageHistory.delete(keyId)
    return deleted
  }

  async getAPIKeyUsage(keyId: string, limit = 100): Promise<APIKeyUsage[]> {
    const history = this.usageHistory.get(keyId) || []
    return history.slice(-limit)
  }

  async updateAPIKeyPermissions(keyId: string, permissions: string[]): Promise<boolean> {
    const apiKey = this.apiKeys.get(keyId)
    if (!apiKey) {
      return false
    }

    apiKey.permissions = permissions
    return true
  }

  async updateRateLimit(
    keyId: string,
    rateLimit: {
      requestsPerMinute?: number
      requestsPerHour?: number
      requestsPerDay?: number
    },
  ): Promise<boolean> {
    const apiKey = this.apiKeys.get(keyId)
    if (!apiKey) {
      return false
    }

    if (rateLimit.requestsPerMinute !== undefined) {
      apiKey.rateLimit.requestsPerMinute = rateLimit.requestsPerMinute
    }
    if (rateLimit.requestsPerHour !== undefined) {
      apiKey.rateLimit.requestsPerHour = rateLimit.requestsPerHour
    }
    if (rateLimit.requestsPerDay !== undefined) {
      apiKey.rateLimit.requestsPerDay = rateLimit.requestsPerDay
    }

    return true
  }
}

export const apiKeyManager = new APIKeyManager()
