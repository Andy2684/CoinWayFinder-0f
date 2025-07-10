import { simpleHash, generateRandomString } from "./security"

export interface ApiKey {
  id: string
  userId: string
  name: string
  key: string
  hashedKey: string
  permissions: string[]
  isActive: boolean
  lastUsed?: Date
  expiresAt?: Date
  createdAt: Date
}

export interface ApiKeyUsage {
  keyId: string
  endpoint: string
  method: string
  timestamp: Date
  ip?: string
  userAgent?: string
}

export class ApiKeyManager {
  private static readonly KEY_PREFIX = "cwf_"
  private static readonly KEY_LENGTH = 32

  static generateApiKey(): { key: string; hashedKey: string } {
    const randomKey = generateRandomString(this.KEY_LENGTH)
    const key = `${this.KEY_PREFIX}${randomKey}`
    const hashedKey = this.hashKey(key)

    return { key, hashedKey }
  }

  static hashKey(key: string): string {
    return simpleHash(key)
  }

  static maskKey(key: string): string {
    if (key.length < 8) return key
    return `${key.substring(0, 8)}${"*".repeat(key.length - 12)}${key.substring(key.length - 4)}`
  }

  async createApiKey(
    userId: string,
    name: string,
    permissions: string[] = ["read"],
    expiresAt?: Date,
  ): Promise<{ success: boolean; apiKey?: ApiKey; key?: string; error?: string }> {
    try {
      const { key, hashedKey } = ApiKeyManager.generateApiKey()

      const apiKeyData: Omit<ApiKey, "id"> = {
        userId,
        name,
        key: ApiKeyManager.maskKey(key), // Store masked version
        hashedKey,
        permissions,
        isActive: true,
        expiresAt,
        createdAt: new Date(),
      }

      // Store in database (you'll need to add this method to your database class)
      const result = await this.storeApiKey(apiKeyData)

      return {
        success: true,
        apiKey: { ...apiKeyData, id: result.id },
        key, // Return the actual key only once
      }
    } catch (error) {
      console.error("Failed to create API key:", error)
      return { success: false, error: "Failed to create API key" }
    }
  }

  async validateApiKey(key: string): Promise<{ valid: boolean; userId?: string; permissions?: string[] }> {
    try {
      if (!key.startsWith(ApiKeyManager.KEY_PREFIX)) {
        return { valid: false }
      }

      const hashedKey = ApiKeyManager.hashKey(key)
      const apiKey = await this.getApiKeyByHash(hashedKey)

      if (!apiKey) {
        return { valid: false }
      }

      // Check if key is active
      if (!apiKey.isActive) {
        return { valid: false }
      }

      // Check if key has expired
      if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
        await this.deactivateApiKey(apiKey.id)
        return { valid: false }
      }

      // Update last used timestamp
      await this.updateLastUsed(apiKey.id)

      return {
        valid: true,
        userId: apiKey.userId,
        permissions: apiKey.permissions,
      }
    } catch (error) {
      console.error("API key validation error:", error)
      return { valid: false }
    }
  }

  async getUserApiKeys(userId: string): Promise<ApiKey[]> {
    try {
      return await this.getApiKeysByUserId(userId)
    } catch (error) {
      console.error("Failed to get user API keys:", error)
      return []
    }
  }

  async revokeApiKey(keyId: string, userId: string): Promise<boolean> {
    try {
      const apiKey = await this.getApiKeyById(keyId)

      if (!apiKey || apiKey.userId !== userId) {
        return false
      }

      await this.deactivateApiKey(keyId)
      return true
    } catch (error) {
      console.error("Failed to revoke API key:", error)
      return false
    }
  }

  async updateApiKeyPermissions(keyId: string, userId: string, permissions: string[]): Promise<boolean> {
    try {
      const apiKey = await this.getApiKeyById(keyId)

      if (!apiKey || apiKey.userId !== userId) {
        return false
      }

      await this.updateApiKey(keyId, { permissions })
      return true
    } catch (error) {
      console.error("Failed to update API key permissions:", error)
      return false
    }
  }

  async logApiKeyUsage(
    keyId: string,
    endpoint: string,
    method: string,
    ip?: string,
    userAgent?: string,
  ): Promise<void> {
    try {
      const usage: ApiKeyUsage = {
        keyId,
        endpoint,
        method,
        timestamp: new Date(),
        ip,
        userAgent,
      }

      await this.storeApiKeyUsage(usage)
    } catch (error) {
      console.error("Failed to log API key usage:", error)
    }
  }

  async getApiKeyUsage(keyId: string, limit = 100): Promise<ApiKeyUsage[]> {
    try {
      return await this.getUsageByKeyId(keyId, limit)
    } catch (error) {
      console.error("Failed to get API key usage:", error)
      return []
    }
  }

  async hasPermission(keyId: string, permission: string): Promise<boolean> {
    try {
      const apiKey = await this.getApiKeyById(keyId)

      if (!apiKey || !apiKey.isActive) {
        return false
      }

      return apiKey.permissions.includes(permission) || apiKey.permissions.includes("admin")
    } catch (error) {
      console.error("Failed to check API key permission:", error)
      return false
    }
  }

  // Database methods (these would be implemented in your database class)
  private async storeApiKey(apiKeyData: Omit<ApiKey, "id">): Promise<{ id: string }> {
    // Implementation depends on your database
    // For now, return a mock ID
    return { id: generateRandomString(16) }
  }

  private async getApiKeyByHash(hashedKey: string): Promise<ApiKey | null> {
    // Implementation depends on your database
    return null
  }

  private async getApiKeyById(keyId: string): Promise<ApiKey | null> {
    // Implementation depends on your database
    return null
  }

  private async getApiKeysByUserId(userId: string): Promise<ApiKey[]> {
    // Implementation depends on your database
    return []
  }

  private async updateLastUsed(keyId: string): Promise<void> {
    // Implementation depends on your database
  }

  private async deactivateApiKey(keyId: string): Promise<void> {
    // Implementation depends on your database
  }

  private async updateApiKey(keyId: string, updates: Partial<ApiKey>): Promise<void> {
    // Implementation depends on your database
  }

  private async storeApiKeyUsage(usage: ApiKeyUsage): Promise<void> {
    // Implementation depends on your database
  }

  private async getUsageByKeyId(keyId: string, limit: number): Promise<ApiKeyUsage[]> {
    // Implementation depends on your database
    return []
  }
}

export const apiKeyManager = new ApiKeyManager()

// Middleware for API key authentication
export function withApiKeyAuth(requiredPermission = "read") {
  return (handler: any) => async (req: any) => {
    try {
      const apiKey = req.headers.get("x-api-key") || req.headers.get("authorization")?.replace("Bearer ", "")

      if (!apiKey) {
        return new Response(JSON.stringify({ error: "API key required" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        })
      }

      const validation = await apiKeyManager.validateApiKey(apiKey)

      if (!validation.valid) {
        return new Response(JSON.stringify({ error: "Invalid API key" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        })
      }

      if (!validation.permissions?.includes(requiredPermission) && !validation.permissions?.includes("admin")) {
        return new Response(JSON.stringify({ error: "Insufficient permissions" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        })
      }

      // Log usage
      await apiKeyManager.logApiKeyUsage(
        apiKey,
        req.url,
        req.method,
        req.headers.get("x-forwarded-for") || req.ip,
        req.headers.get("user-agent"),
      )

      // Add user info to request
      req.userId = validation.userId
      req.permissions = validation.permissions

      return handler(req)
    } catch (error) {
      console.error("API key auth error:", error)
      return new Response(JSON.stringify({ error: "Authentication error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }
  }
}
