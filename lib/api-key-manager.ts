import { randomBytes } from "crypto"
import { database } from "./database"

export interface APIKey {
  id: string
  name: string
  key: string
  permissions: string[]
  createdAt: Date
  lastUsedAt?: Date
  isActive: boolean
  userId: string
}

export interface CreateAPIKeyRequest {
  name: string
  permissions: string[]
}

export interface APIKeyUsage {
  keyId: string
  endpoint: string
  timestamp: Date
  responseTime: number
  statusCode: number
}

class APIKeyManager {
  private readonly keyPrefix = "cwf_"
  private readonly keyLength = 32

  generateAPIKey(): string {
    const randomPart = randomBytes(this.keyLength).toString("hex")
    return `${this.keyPrefix}${randomPart}`
  }

  async createAPIKey(userId: string, request: CreateAPIKeyRequest): Promise<APIKey> {
    const apiKey: APIKey = {
      id: randomBytes(16).toString("hex"),
      name: request.name,
      key: this.generateAPIKey(),
      permissions: request.permissions,
      createdAt: new Date(),
      isActive: true,
      userId,
    }

    await database.createAPIKey(userId, {
      name: apiKey.name,
      key: apiKey.key,
      permissions: apiKey.permissions,
    })

    return apiKey
  }

  async getUserAPIKeys(userId: string): Promise<APIKey[]> {
    const keys = await database.getUserAPIKeys(userId)
    return (
      keys?.map((key) => ({
        id: key.id,
        name: key.name,
        key: key.key,
        permissions: key.permissions,
        createdAt: key.createdAt,
        lastUsedAt: key.lastUsedAt,
        isActive: key.isActive,
        userId,
      })) || []
    )
  }

  async validateAPIKey(key: string): Promise<APIKey | null> {
    if (!key.startsWith(this.keyPrefix)) {
      return null
    }

    // In a real implementation, you would query the database
    // For now, we'll return a mock validation
    return {
      id: "mock-key-id",
      name: "Mock API Key",
      key,
      permissions: ["read", "write"],
      createdAt: new Date(),
      isActive: true,
      userId: "mock-user-id",
    }
  }

  async updateAPIKey(userId: string, keyId: string, updates: Partial<APIKey>): Promise<boolean> {
    try {
      await database.updateAPIKey(userId, keyId, updates)
      return true
    } catch (error) {
      console.error("Error updating API key:", error)
      return false
    }
  }

  async deleteAPIKey(userId: string, keyId: string): Promise<boolean> {
    try {
      await database.deleteAPIKey(userId, keyId)
      return true
    } catch (error) {
      console.error("Error deleting API key:", error)
      return false
    }
  }

  async recordAPIKeyUsage(keyId: string, endpoint: string, responseTime: number, statusCode: number): Promise<void> {
    // In a real implementation, you would store this in a database
    console.log(`API Key ${keyId} used for ${endpoint} - ${statusCode} (${responseTime}ms)`)
  }

  async getAPIKeyUsageStats(
    userId: string,
    keyId?: string,
  ): Promise<{
    totalRequests: number
    requestsToday: number
    averageResponseTime: number
    errorRate: number
    topEndpoints: Array<{ endpoint: string; count: number }>
  }> {
    // Mock usage stats - in real implementation, query from database
    return {
      totalRequests: 1250,
      requestsToday: 45,
      averageResponseTime: 120,
      errorRate: 0.02,
      topEndpoints: [
        { endpoint: "/api/v1/bots", count: 450 },
        { endpoint: "/api/v1/signals", count: 320 },
        { endpoint: "/api/v1/trends", count: 280 },
        { endpoint: "/api/v1/whales", count: 200 },
      ],
    }
  }

  async checkPermission(key: string, permission: string): Promise<boolean> {
    const apiKey = await this.validateAPIKey(key)
    if (!apiKey || !apiKey.isActive) {
      return false
    }

    return apiKey.permissions.includes(permission) || apiKey.permissions.includes("*")
  }

  async getRateLimits(key: string): Promise<{
    requestsPerMinute: number
    requestsPerHour: number
    requestsPerDay: number
  }> {
    const apiKey = await this.validateAPIKey(key)
    if (!apiKey) {
      return { requestsPerMinute: 0, requestsPerHour: 0, requestsPerDay: 0 }
    }

    // Different rate limits based on permissions
    if (apiKey.permissions.includes("premium")) {
      return { requestsPerMinute: 1000, requestsPerHour: 10000, requestsPerDay: 100000 }
    }

    return { requestsPerMinute: 100, requestsPerHour: 1000, requestsPerDay: 10000 }
  }

  maskAPIKey(key: string): string {
    if (key.length <= 8) return key
    return `${key.substring(0, 8)}${"*".repeat(key.length - 12)}${key.substring(key.length - 4)}`
  }

  getAvailablePermissions(): string[] {
    return [
      "read", // Read access to data
      "write", // Write access (create/update)
      "delete", // Delete access
      "admin", // Admin operations
      "bots", // Bot management
      "trades", // Trade execution
      "signals", // Signal access
      "analytics", // Analytics data
      "premium", // Premium features
    ]
  }
}

export const apiKeyManager = new APIKeyManager()
