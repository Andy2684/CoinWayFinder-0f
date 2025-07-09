import { randomBytes } from "crypto"
import { database } from "./database"

export interface APIKey {
  id: string
  userId: string
  name: string
  key: string
  permissions: string[]
  isActive: boolean
  createdAt: Date
  lastUsedAt?: Date
  expiresAt?: Date
  usageCount: number
  rateLimit: number
}

export interface APIKeyUsage {
  keyId: string
  endpoint: string
  timestamp: Date
  responseTime: number
  statusCode: number
  ipAddress?: string
  userAgent?: string
}

class APIKeyManager {
  private generateAPIKey(): string {
    const prefix = "cwf_"
    const randomPart = randomBytes(32).toString("hex")
    return `${prefix}${randomPart}`
  }

  async createAPIKey(
    userId: string,
    name: string,
    permissions: string[] = ["read"],
    expiresInDays?: number,
  ): Promise<{ success: boolean; apiKey?: APIKey; message?: string }> {
    try {
      // Check if user already has maximum number of API keys
      const existingKeys = await database.getUserAPIKeys(userId)
      if (existingKeys && existingKeys.length >= 5) {
        return { success: false, message: "Maximum number of API keys reached (5)" }
      }

      const key = this.generateAPIKey()
      const expiresAt = expiresInDays ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) : undefined

      const apiKeyData = {
        userId,
        name,
        key,
        permissions,
        isActive: true,
        createdAt: new Date(),
        expiresAt,
        usageCount: 0,
        rateLimit: 1000, // Default rate limit per hour
      }

      const apiKey = await database.createAPIKey(apiKeyData)

      return {
        success: true,
        apiKey: {
          id: apiKey._id!.toString(),
          ...apiKeyData,
        },
      }
    } catch (error) {
      console.error("Create API key error:", error)
      return { success: false, message: "Failed to create API key" }
    }
  }

  async validateAPIKey(key: string): Promise<{
    valid: boolean
    apiKey?: APIKey
    message?: string
  }> {
    try {
      const apiKey = await database.getAPIKey(key)

      if (!apiKey) {
        return { valid: false, message: "Invalid API key" }
      }

      if (!apiKey.isActive) {
        return { valid: false, message: "API key is disabled" }
      }

      if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
        return { valid: false, message: "API key has expired" }
      }

      // Update last used timestamp
      await database.updateAPIKey(apiKey._id!.toString(), {
        lastUsedAt: new Date(),
        usageCount: apiKey.usageCount + 1,
      })

      return {
        valid: true,
        apiKey: {
          id: apiKey._id!.toString(),
          userId: apiKey.userId,
          name: apiKey.name,
          key: apiKey.key,
          permissions: apiKey.permissions,
          isActive: apiKey.isActive,
          createdAt: apiKey.createdAt,
          lastUsedAt: new Date(),
          expiresAt: apiKey.expiresAt,
          usageCount: apiKey.usageCount + 1,
          rateLimit: apiKey.rateLimit,
        },
      }
    } catch (error) {
      console.error("Validate API key error:", error)
      return { valid: false, message: "API key validation failed" }
    }
  }

  async checkPermission(apiKey: APIKey, permission: string): Promise<boolean> {
    return apiKey.permissions.includes(permission) || apiKey.permissions.includes("admin")
  }

  async checkRateLimit(apiKey: APIKey): Promise<{
    allowed: boolean
    remaining: number
    resetTime: Date
  }> {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      const recentUsage = await database.getAPIKeyUsage(apiKey.id, oneHourAgo)

      const remaining = Math.max(0, apiKey.rateLimit - recentUsage)
      const resetTime = new Date(Date.now() + 60 * 60 * 1000) // Next hour

      return {
        allowed: recentUsage < apiKey.rateLimit,
        remaining,
        resetTime,
      }
    } catch (error) {
      console.error("Check rate limit error:", error)
      return {
        allowed: false,
        remaining: 0,
        resetTime: new Date(),
      }
    }
  }

  async getUserAPIKeys(userId: string): Promise<APIKey[]> {
    try {
      const apiKeys = await database.getUserAPIKeys(userId)
      return (apiKeys || []).map((key) => ({
        id: key.id,
        userId: key.userId || userId,
        name: key.name,
        key: key.key,
        permissions: key.permissions,
        isActive: key.isActive,
        createdAt: key.createdAt,
        lastUsedAt: key.lastUsedAt,
        expiresAt: undefined,
        usageCount: 0,
        rateLimit: 1000,
      }))
    } catch (error) {
      console.error("Get user API keys error:", error)
      return []
    }
  }

  async updateAPIKey(
    keyId: string,
    updates: {
      name?: string
      permissions?: string[]
      isActive?: boolean
      rateLimit?: number
    },
  ): Promise<{ success: boolean; message?: string }> {
    try {
      await database.updateAPIKey(keyId, updates)
      return { success: true }
    } catch (error) {
      console.error("Update API key error:", error)
      return { success: false, message: "Failed to update API key" }
    }
  }

  async revokeAPIKey(keyId: string): Promise<{ success: boolean; message?: string }> {
    try {
      await database.updateAPIKey(keyId, { isActive: false })
      return { success: true, message: "API key revoked successfully" }
    } catch (error) {
      console.error("Revoke API key error:", error)
      return { success: false, message: "Failed to revoke API key" }
    }
  }

  async deleteAPIKey(userId: string, keyId: string): Promise<{ success: boolean; message?: string }> {
    try {
      await database.deleteAPIKey(userId, keyId)
      return { success: true, message: "API key deleted successfully" }
    } catch (error) {
      console.error("Delete API key error:", error)
      return { success: false, message: "Failed to delete API key" }
    }
  }

  async regenerateAPIKey(
    userId: string,
    keyId: string,
  ): Promise<{
    success: boolean
    newKey?: string
    message?: string
  }> {
    try {
      const newKey = this.generateAPIKey()

      await database.updateAPIKey(keyId, {
        key: newKey,
        usageCount: 0,
        lastUsedAt: undefined,
      })

      return {
        success: true,
        newKey,
        message: "API key regenerated successfully",
      }
    } catch (error) {
      console.error("Regenerate API key error:", error)
      return { success: false, message: "Failed to regenerate API key" }
    }
  }

  async getAPIKeyStats(keyId: string): Promise<{
    totalRequests: number
    requestsToday: number
    requestsThisMonth: number
    averageResponseTime: number
    errorRate: number
  }> {
    try {
      // Mock stats - in real implementation, query usage logs
      return {
        totalRequests: Math.floor(Math.random() * 10000),
        requestsToday: Math.floor(Math.random() * 100),
        requestsThisMonth: Math.floor(Math.random() * 1000),
        averageResponseTime: Math.floor(Math.random() * 500) + 100,
        errorRate: Math.random() * 5,
      }
    } catch (error) {
      console.error("Get API key stats error:", error)
      return {
        totalRequests: 0,
        requestsToday: 0,
        requestsThisMonth: 0,
        averageResponseTime: 0,
        errorRate: 0,
      }
    }
  }

  async logAPIUsage(usage: Omit<APIKeyUsage, "timestamp">): Promise<void> {
    try {
      // In a real implementation, you would store this in a usage log table
      console.log("API Usage:", {
        ...usage,
        timestamp: new Date(),
      })
    } catch (error) {
      console.error("Log API usage error:", error)
    }
  }

  // Utility method to mask API key for display
  maskAPIKey(key: string): string {
    if (key.length <= 8) return key
    return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`
  }

  // Validate API key format
  isValidAPIKeyFormat(key: string): boolean {
    return /^cwf_[a-f0-9]{64}$/.test(key)
  }
}

export const apiKeyManager = new APIKeyManager()
