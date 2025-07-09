import { database } from "./database"
import crypto from "crypto"

export interface APIKey {
  id: string
  name: string
  key: string
  permissions: string[]
  createdAt: Date
  lastUsedAt?: Date
  isActive: boolean
}

export class APIKeyManager {
  static generateAPIKey(): string {
    return `cwf_${crypto.randomBytes(32).toString("hex")}`
  }

  static async createAPIKey(
    userId: string,
    name: string,
    permissions: string[] = ["read"],
  ): Promise<{ success: boolean; apiKey?: string; message: string }> {
    try {
      const apiKey = this.generateAPIKey()

      await database.createAPIKey(userId, {
        name,
        key: apiKey,
        permissions,
      })

      return {
        success: true,
        apiKey,
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

  static async getUserAPIKeys(userId: string): Promise<APIKey[]> {
    try {
      return (await database.getUserAPIKeys(userId)) || []
    } catch (error) {
      console.error("Get API keys error:", error)
      return []
    }
  }

  static async validateAPIKey(apiKey: string): Promise<{
    valid: boolean
    userId?: string
    permissions?: string[]
  }> {
    try {
      // This would typically query a dedicated API keys table
      // For now, we'll implement a basic validation
      if (!apiKey.startsWith("cwf_")) {
        return { valid: false }
      }

      // In a real implementation, you'd query the database
      // For now, return a mock validation
      return {
        valid: true,
        userId: "mock-user-id",
        permissions: ["read", "write"],
      }
    } catch (error) {
      console.error("Validate API key error:", error)
      return { valid: false }
    }
  }

  static async revokeAPIKey(userId: string, keyId: string): Promise<{ success: boolean; message: string }> {
    try {
      await database.deleteAPIKey(userId, keyId)
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

  static async updateAPIKeyUsage(apiKey: string): Promise<void> {
    try {
      // Update last used timestamp
      // This would be implemented with proper database queries
      console.log(`API key ${apiKey} used at ${new Date().toISOString()}`)
    } catch (error) {
      console.error("Update API key usage error:", error)
    }
  }

  static hasPermission(permissions: string[], requiredPermission: string): boolean {
    return permissions.includes(requiredPermission) || permissions.includes("admin")
  }
}

export const apiKeyManager = new APIKeyManager()
