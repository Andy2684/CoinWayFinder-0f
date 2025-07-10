import { Redis } from "ioredis"

// Memory cache for client-side caching
class MemoryCache {
  private cache = new Map<string, { data: any; expires: number }>()
  private maxSize = 1000

  set(key: string, data: any, ttlSeconds = 300): void {
    // Clean up expired entries if cache is getting large
    if (this.cache.size >= this.maxSize) {
      this.cleanup()
    }

    const expires = Date.now() + ttlSeconds * 1000
    this.cache.set(key, { data, expires })
  }

  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() > item.expires) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key)
      }
    }
  }

  size(): number {
    return this.cache.size
  }
}

// Redis cache for server-side caching
class RedisCache {
  private redis: Redis | null = null

  constructor() {
    if (typeof window === "undefined" && process.env.UPSTASH_REDIS_REST_URL) {
      try {
        this.redis = new Redis(process.env.UPSTASH_REDIS_REST_URL)
      } catch (error) {
        console.warn("Failed to initialize Redis cache:", error)
      }
    }
  }

  async set(key: string, data: any, ttlSeconds = 300): Promise<void> {
    if (!this.redis) return

    try {
      const serialized = JSON.stringify(data)
      await this.redis.setex(key, ttlSeconds, serialized)
    } catch (error) {
      console.error("Redis cache set error:", error)
    }
  }

  async get(key: string): Promise<any | null> {
    if (!this.redis) return null

    try {
      const data = await this.redis.get(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error("Redis cache get error:", error)
      return null
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.redis) return

    try {
      await this.redis.del(key)
    } catch (error) {
      console.error("Redis cache delete error:", error)
    }
  }

  async clear(pattern?: string): Promise<void> {
    if (!this.redis) return

    try {
      if (pattern) {
        const keys = await this.redis.keys(pattern)
        if (keys.length > 0) {
          await this.redis.del(...keys)
        }
      } else {
        await this.redis.flushall()
      }
    } catch (error) {
      console.error("Redis cache clear error:", error)
    }
  }
}

// Multi-layer cache implementation
export class CacheManager {
  private memoryCache = new MemoryCache()
  private redisCache = new RedisCache()

  async get(key: string): Promise<any | null> {
    // Try memory cache first
    let data = this.memoryCache.get(key)
    if (data !== null) {
      return data
    }

    // Try Redis cache
    data = await this.redisCache.get(key)
    if (data !== null) {
      // Store in memory cache for faster access
      this.memoryCache.set(key, data, 60) // 1 minute in memory
      return data
    }

    return null
  }

  async set(key: string, data: any, ttlSeconds = 300): Promise<void> {
    // Store in both caches
    this.memoryCache.set(key, data, Math.min(ttlSeconds, 300)) // Max 5 minutes in memory
    await this.redisCache.set(key, data, ttlSeconds)
  }

  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key)
    await this.redisCache.delete(key)
  }

  async clear(pattern?: string): Promise<void> {
    this.memoryCache.clear()
    await this.redisCache.clear(pattern)
  }

  // Cache with automatic refresh
  async getOrSet<T>(key: string, fetcher: () => Promise<T>, ttlSeconds = 300): Promise<T> {
    let data = await this.get(key)

    if (data === null) {
      data = await fetcher()
      await this.set(key, data, ttlSeconds)
    }

    return data
  }

  // Invalidate cache by pattern
  async invalidatePattern(pattern: string): Promise<void> {
    await this.redisCache.clear(pattern)
    // For memory cache, we clear everything since we don't have pattern matching
    this.memoryCache.clear()
  }

  // Get cache statistics
  getStats() {
    return {
      memorySize: this.memoryCache.size(),
      redisConnected: this.redisCache !== null,
    }
  }
}

// Global cache instance
export const cache = new CacheManager()

// Cache key generators
export const cacheKeys = {
  cryptoPrices: (symbols?: string[]) => `crypto:prices${symbols ? `:${symbols.join(",")}` : ""}`,

  cryptoNews: (limit?: number) => `crypto:news${limit ? `:${limit}` : ""}`,

  marketTrends: () => "crypto:trends",

  whaleAlerts: (limit?: number) => `crypto:whales${limit ? `:${limit}` : ""}`,

  userBots: (userId: string) => `user:${userId}:bots`,

  userApiKeys: (userId: string) => `user:${userId}:api-keys`,

  userUsage: (userId: string) => `user:${userId}:usage`,

  botPerformance: (botId: string) => `bot:${botId}:performance`,

  tradeLogs: (userId: string, limit?: number) => `user:${userId}:trades${limit ? `:${limit}` : ""}`,
}

// Cache TTL constants (in seconds)
export const cacheTTL = {
  cryptoPrices: 30, // 30 seconds for real-time prices
  cryptoNews: 300, // 5 minutes for news
  marketTrends: 60, // 1 minute for trends
  whaleAlerts: 120, // 2 minutes for whale alerts
  userBots: 60, // 1 minute for user bots
  userApiKeys: 300, // 5 minutes for API keys
  userUsage: 60, // 1 minute for usage stats
  botPerformance: 30, // 30 seconds for bot performance
  tradeLogs: 60, // 1 minute for trade logs
}
