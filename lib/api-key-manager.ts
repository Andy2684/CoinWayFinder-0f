import { database } from "./database"
import crypto from "crypto"

interface APIKey {
  id: string
  userId: string
  name: string
  key: string
  permissions: string[]
  createdAt: Date
  lastUsedAt?: Date
  isActive: boolean
  expiresAt?: Date
}

interface APIKeyUsage {
  keyId: string
  endpoint: string
  timestamp: Date
  responseTime: number
  statusCode: number
}

class APIKeyManager {
  private usageStore: Map<string, APIKeyUsage[]> = new Map()

  generateAPIKey(prefix = "cwf"): string {
    const randomBytes = crypto.randomBytes(32)
    const key = `${prefix}_${randomBytes.toString("hex")}`
    return key
  }

  async createAPIKey(
    userId: string,
    name: string,
    permissions: string[] = ["read"],
    expiresInDays?: number,
  ): Promise<{ success: boolean; key?: string; message: string }> {
    try {
      const key = this.generateAPIKey()
      const expiresAt = expiresInDays ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) : undefined

      await database.createAPIKey(userId, {
        name,
        key,
        permissions,
      })

      return {
        success: true,
        key,
        message: "API key created successfully",
      }
    } catch (error) {
      console.error("Create API key error:", error)
      return {
        success: false,
        message: "Failed to create API key",
      }
    }
  }

  async validateAPIKey(key: string): Promise<{
    valid: boolean
    userId?: string
    permissions?: string[]
    message?: string
  }> {
    try {
      // Basic format validation
      if (!key.startsWith("cwf_") || key.length < 40) {
        return {
          valid: false,
          message: "Invalid API key format",
        }
      }

      // In a real implementation, you would query the database
      // For now, we'll simulate validation
      const mockUserId = "user-123"
      const mockPermissions = ["read", "write"]

      // Update last used timestamp
      this.recordAPIKeyUsage(key, "/api/test", 200, 150)

      return {
        valid: true,
        userId: mockUserId,
        permissions: mockPermissions,
      }
    } catch (error) {
      console.error("Validate API key error:", error)
      return {
        valid: false,
        message: "Failed to validate API key",
      }
    }
  }

  async getUserAPIKeys(userId: string): Promise<APIKey[]> {
    try {
      const apiKeys = await database.getUserAPIKeys(userId)
      return (apiKeys || []).map((key) => ({
        id: key.id,
        userId,
        name: key.name,
        key: key.key.substring(0, 8) + "..." + key.key.substring(key.key.length - 4), // Mask key
        permissions: key.permissions,
        createdAt: key.createdAt,
        lastUsedAt: key.lastUsedAt,
        isActive: key.isActive,
      }))
    } catch (error) {
      console.error("Get user API keys error:", error)
      return []
    }
  }

  async revokeAPIKey(userId: string, keyId: string): Promise<{ success: boolean; message: string }> {
    try {
      await database.updateAPIKey(userId, keyId, { isActive: false })
      return {
        success: true,
        message: "API key revoked successfully",
      }
    } catch (error) {
      console.error("Revoke API key error:", error)
      return {
        success: false,
        message: "Failed to revoke API key",
      }
    }
  }

  async deleteAPIKey(userId: string, keyId: string): Promise<{ success: boolean; message: string }> {
    try {
      await database.deleteAPIKey(userId, keyId)
      return {
        success: true,
        message: "API key deleted successfully",
      }
    } catch (error) {
      console.error("Delete API key error:", error)
      return {
        success: false,
        message: "Failed to delete API key",
      }
    }
  }

  recordAPIKeyUsage(key: string, endpoint: string, statusCode: number, responseTime: number): void {
    const usage: APIKeyUsage = {
      keyId: key,
      endpoint,
      timestamp: new Date(),
      responseTime,
      statusCode,
    }

    if (!this.usageStore.has(key)) {
      this.usageStore.set(key, [])
    }

    const keyUsage = this.usageStore.get(key)!
    keyUsage.push(usage)

    // Keep only last 1000 entries per key
    if (keyUsage.length > 1000) {
      keyUsage.splice(0, keyUsage.length - 1000)
    }
  }

  getAPIKeyUsage(key: string, limit = 100): APIKeyUsage[] {
    const usage = this.usageStore.get(key) || []
    return usage.slice(-limit)
  }

  getAPIKeyStats(key: string): {
    totalRequests: number
    successRate: number
    averageResponseTime: number
    lastUsed?: Date
  } {
    const usage = this.usageStore.get(key) || []

    if (usage.length === 0) {
      return {
        totalRequests: 0,
        successRate: 0,
        averageResponseTime: 0,
      }
    }

    const totalRequests = usage.length
    const successfulRequests = usage.filter((u) => u.statusCode >= 200 && u.statusCode < 400).length
    const successRate = (successfulRequests / totalRequests) * 100
    const averageResponseTime = usage.reduce((sum, u) => sum + u.responseTime, 0) / totalRequests
    const lastUsed = usage[usage.length - 1]?.timestamp

    return {
      totalRequests,
      successRate,
      averageResponseTime,
      lastUsed,
    }
  }

  checkRateLimit(key: string, limit = 1000, windowMs = 60000): boolean {
    const usage = this.usageStore.get(key) || []
    const now = Date.now()
    const windowStart = now - windowMs

    const recentUsage = usage.filter((u) => u.timestamp.getTime() > windowStart)
    return recentUsage.length < limit
  }

  hasPermission(permissions: string[], requiredPermission: string): boolean {
    return permissions.includes(requiredPermission) || permissions.includes("admin")
  }

  // Cleanup old usage data
  cleanupUsageData(): void {
    const cutoffTime = Date.now() - 7 * 24 * 60 * 60 * 1000 // 7 days ago

    for (const [key, usage] of this.usageStore.entries()) {
      const filteredUsage = usage.filter((u) => u.timestamp.getTime() > cutoffTime)
      if (filteredUsage.length === 0) {
        this.usageStore.delete(key)
      } else {
        this.usageStore.set(key, filteredUsage)
      }
    }
  }
}

export const apiKeyManager = new APIKeyManager()

// Cleanup usage data every hour
setInterval(
  () => {
    apiKeyManager.cleanupUsageData()
  },
  60 * 60 * 1000,
)
