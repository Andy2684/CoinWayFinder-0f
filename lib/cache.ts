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

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
    }
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
      console.warn("Redis cache set error:", error)
    }
  }

  async get(key: string): Promise<any | null> {
    if (!this.redis) return null

    try {
      const data = await this.redis.get(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.warn("Redis cache get error:", error)
      return null
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.redis) return

    try {
      await this.redis.del(key)
    } catch (error) {
      console.warn("Redis cache delete error:", error)
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
      console.warn("Redis cache clear error:", error)
    }
  }
}

// Multi-layer cache implementation
export class CacheManager {
  private memoryCache = new MemoryCache()
  private redisCache = new RedisCache()

  // Cache key generators
  static keys = {
    cryptoPrices: (symbols?: string[]) => `crypto:prices${symbols ? ":" + symbols.sort().join(",") : ""}`,
    news: (category?: string) => `news${category ? ":" + category : ""}`,
    marketTrends: () => "market:trends",
    userBots: (userId: string) => `user:${userId}:bots`,
    botPerformance: (botId: string) => `bot:${botId}:performance`,
    apiUsage: (userId: string) => `user:${userId}:api:usage`,
  }

  // TTL configurations (in seconds)
  static ttl = {
    cryptoPrices: 30, // 30 seconds for real-time data
    news: 300, // 5 minutes for news
    marketTrends: 60, // 1 minute for trends
    userBots: 120, // 2 minutes for user bots
    botPerformance: 60, // 1 minute for bot performance
    apiUsage: 300, // 5 minutes for API usage
  }

  async get(key: string): Promise<any | null> {
    // Try memory cache first (fastest)
    let data = this.memoryCache.get(key)
    if (data !== null) {
      return data
    }

    // Try Redis cache (server-side)
    data = await this.redisCache.get(key)
    if (data !== null) {
      // Store in memory cache for next time
      this.memoryCache.set(key, data, 60) // 1 minute in memory
      return data
    }

    return null
  }

  async set(key: string, data: any, ttlSeconds = 300): Promise<void> {
    // Store in both caches
    this.memoryCache.set(key, data, Math.min(ttlSeconds, 300)) // Max 5 min in memory
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

  // Utility method for cache-or-fetch pattern
  async getOrFetch<T>(key: string, fetchFn: () => Promise<T>, ttlSeconds = 300): Promise<T> {
    let data = await this.get(key)

    if (data === null) {
      data = await fetchFn()
      await this.set(key, data, ttlSeconds)
    }

    return data
  }

  // Batch operations
  async getMany(keys: string[]): Promise<Record<string, any>> {
    const results: Record<string, any> = {}

    await Promise.all(
      keys.map(async (key) => {
        results[key] = await this.get(key)
      }),
    )

    return results
  }

  async setMany(items: Record<string, { data: any; ttl?: number }>): Promise<void> {
    await Promise.all(Object.entries(items).map(([key, { data, ttl = 300 }]) => this.set(key, data, ttl)))
  }

  // Cache invalidation by pattern
  async invalidatePattern(pattern: string): Promise<void> {
    await this.clear(pattern)
  }

  // User-specific cache invalidation
  async invalidateUser(userId: string): Promise<void> {
    await this.clear(`user:${userId}:*`)
  }

  // Get cache statistics
  getStats() {
    return {
      memory: this.memoryCache.getStats(),
    }
  }
}

// Global cache instance
export const cache = new CacheManager()

// Convenience functions for common cache operations
export const cacheUtils = {
  // Crypto prices caching
  async getCryptoPrices(symbols?: string[]) {
    const key = CacheManager.keys.cryptoPrices(symbols)
    return cache.get(key)
  },

  async setCryptoPrices(data: any, symbols?: string[]) {
    const key = CacheManager.keys.cryptoPrices(symbols)
    return cache.set(key, data, CacheManager.ttl.cryptoPrices)
  },

  // News caching
  async getNews(category?: string) {
    const key = CacheManager.keys.news(category)
    return cache.get(key)
  },

  async setNews(data: any, category?: string) {
    const key = CacheManager.keys.news(category)
    return cache.set(key, data, CacheManager.ttl.news)
  },

  // Market trends caching
  async getMarketTrends() {
    const key = CacheManager.keys.marketTrends()
    return cache.get(key)
  },

  async setMarketTrends(data: any) {
    const key = CacheManager.keys.marketTrends()
    return cache.set(key, data, CacheManager.ttl.marketTrends)
  },
}
