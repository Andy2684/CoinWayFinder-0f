import { database } from "./database"
import crypto from "crypto"

export interface APIKey {
  id: string
  userId: string
  name: string
  key: string
  permissions: string[]
  isActive: boolean
  lastUsedAt?: Date
  createdAt: Date
  expiresAt?: Date
  usageCount: number
  rateLimit: number
}

export interface CreateAPIKeyRequest {
  name: string
  permissions: string[]
  expiresAt?: Date
  rateLimit?: number
}

export class APIKeyManager {
  private static generateAPIKey(): string {
    return `cwf_${crypto.randomBytes(32).toString("hex")}`
  }

  static async createAPIKey(userId: string, request: CreateAPIKeyRequest): Promise<APIKey> {
    const key = this.generateAPIKey()

    const apiKeyData = {
      userId,
      name: request.name,
      key,
      permissions: request.permissions,
      isActive: true,
      createdAt: new Date(),
      expiresAt: request.expiresAt,
      usageCount: 0,
      rateLimit: request.rateLimit || 1000,
    }

    const createdKey = await database.createAPIKey(apiKeyData)

    return {
      id: createdKey._id!.toString(),
      userId: createdKey.userId,
      name: createdKey.name,
      key: createdKey.key,
      permissions: createdKey.permissions,
      isActive: createdKey.isActive,
      createdAt: createdKey.createdAt,
      expiresAt: createdKey.expiresAt,
      usageCount: createdKey.usageCount,
      rateLimit: createdKey.rateLimit,
    }
  }

  static async getUserAPIKeys(userId: string): Promise<APIKey[]> {
    const keys = await database.getUserAPIKeys(userId)

    return keys.map((key) => ({
      id: key._id!.toString(),
      userId: key.userId,
      name: key.name,
      key: key.key,
      permissions: key.permissions,
      isActive: key.isActive,
      lastUsedAt: key.lastUsedAt,
      createdAt: key.createdAt,
      expiresAt: key.expiresAt,
      usageCount: key.usageCount,
      rateLimit: key.rateLimit,
    }))
  }

  static async validateAPIKey(key: string): Promise<APIKey | null> {
    const apiKey = await database.getAPIKey(key)

    if (!apiKey || !apiKey.isActive) {
      return null
    }

    // Check if key is expired
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      await this.revokeAPIKey(apiKey._id!.toString())
      return null
    }

    // Update last used timestamp and usage count
    await database.updateAPIKey(apiKey._id!.toString(), {
      lastUsedAt: new Date(),
      usageCount: apiKey.usageCount + 1,
    })

    return {
      id: apiKey._id!.toString(),
      userId: apiKey.userId,
      name: apiKey.name,
      key: apiKey.key,
      permissions: apiKey.permissions,
      isActive: apiKey.isActive,
      lastUsedAt: new Date(),
      createdAt: apiKey.createdAt,
      expiresAt: apiKey.expiresAt,
      usageCount: apiKey.usageCount + 1,
      rateLimit: apiKey.rateLimit,
    }
  }

  static async revokeAPIKey(keyId: string): Promise<boolean> {
    try {
      await database.updateAPIKey(keyId, { isActive: false })
      return true
    } catch (error) {
      console.error("Error revoking API key:", error)
      return false
    }
  }

  static async deleteAPIKey(keyId: string): Promise<boolean> {
    try {
      await database.deleteAPIKey(keyId)
      return true
    } catch (error) {
      console.error("Error deleting API key:", error)
      return false
    }
  }

  static async hasPermission(key: APIKey, permission: string): Promise<boolean> {
    return key.permissions.includes(permission) || key.permissions.includes("*")
  }

  static async checkRateLimit(key: APIKey): Promise<boolean> {
    // Simple rate limiting - check usage in last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const recentUsage = await database.getAPIKeyUsage(key.id, oneHourAgo)

    return recentUsage < key.rateLimit
  }

  static getAvailablePermissions(): string[] {
    return [
      "bots:read",
      "bots:write",
      "bots:delete",
      "trades:read",
      "portfolio:read",
      "market:read",
      "news:read",
      "whales:read",
      "signals:read",
      "*", // All permissions
    ]
  }
}

export const apiKeyManager = new APIKeyManager()
