import { Redis } from "ioredis"

// Memory cache for client-side caching
class MemoryCache {
  private cache = new Map<string, { data: any; expiry: number }>()
  private maxSize = 100

  set(key: string, data: any, ttl = 300000) {
    // 5 minutes default
    const expiry = Date.now() + ttl

    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }

    this.cache.set(key, { data, expiry })
  }

  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  delete(key: string) {
    this.cache.delete(key)
  }

  clear() {
    this.cache.clear()
  }

  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  size(): number {
    return this.cache.size
  }
}

// Redis cache for server-side caching
class RedisCache {
  private redis: Redis | null = null
  private isConnected = false

  constructor() {
    this.initRedis()
  }

  private async initRedis() {
    try {
      if (process.env.REDIS_URL || process.env.KV_REST_API_URL) {
        this.redis = new Redis(process.env.REDIS_URL || process.env.KV_REST_API_URL!)
        this.isConnected = true
      }
    } catch (error) {
      console.error("Redis connection failed:", error)
      this.isConnected = false
    }
  }

  async set(key: string, data: any, ttl = 300): Promise<void> {
    if (!this.isConnected || !this.redis) return

    try {
      await this.redis.setex(key, ttl, JSON.stringify(data))
    } catch (error) {
      console.error("Redis set error:", error)
    }
  }

  async get(key: string): Promise<any | null> {
    if (!this.isConnected || !this.redis) return null

    try {
      const data = await this.redis.get(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error("Redis get error:", error)
      return null
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.isConnected || !this.redis) return

    try {
      await this.redis.del(key)
    } catch (error) {
      console.error("Redis delete error:", error)
    }
  }

  async clear(pattern?: string): Promise<void> {
    if (!this.isConnected || !this.redis) return

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
      console.error("Redis clear error:", error)
    }
  }

  async keys(pattern = "*"): Promise<string[]> {
    if (!this.isConnected || !this.redis) return []

    try {
      return await this.redis.keys(pattern)
    } catch (error) {
      console.error("Redis keys error:", error)
      return []
    }
  }
}

// Multi-layer cache manager
class CacheManager {
  private memoryCache = new MemoryCache()
  private redisCache = new RedisCache()

  // Cache key generators
  generateKey(prefix: string, ...parts: string[]): string {
    return `${prefix}:${parts.join(":")}`
  }

  // Get with fallback (memory -> redis -> null)
  async get(key: string): Promise<any | null> {
    // Try memory cache first
    const memoryData = this.memoryCache.get(key)
    if (memoryData) return memoryData

    // Try redis cache
    const redisData = await this.redisCache.get(key)
    if (redisData) {
      // Store in memory cache for faster access
      this.memoryCache.set(key, redisData, 60000) // 1 minute in memory
      return redisData
    }

    return null
  }

  // Set in both caches
  async set(key: string, data: any, ttl = 300): Promise<void> {
    const memoryTtl = Math.min(ttl * 1000, 300000) // Max 5 minutes in memory

    this.memoryCache.set(key, data, memoryTtl)
    await this.redisCache.set(key, data, ttl)
  }

  // Delete from both caches
  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key)
    await this.redisCache.delete(key)
  }

  // Clear cache with pattern
  async clear(pattern?: string): Promise<void> {
    if (pattern) {
      // Clear matching keys from memory
      const memoryKeys = this.memoryCache.keys()
      const regex = new RegExp(pattern.replace("*", ".*"))
      memoryKeys.forEach((key) => {
        if (regex.test(key)) {
          this.memoryCache.delete(key)
        }
      })
    } else {
      this.memoryCache.clear()
    }

    await this.redisCache.clear(pattern)
  }

  // Cache statistics
  getStats() {
    return {
      memorySize: this.memoryCache.size(),
      memoryKeys: this.memoryCache.keys(),
    }
  }
}

// Export singleton instance
export const cache = new CacheManager()

// Helper functions for common cache operations
export const CacheKeys = {
  CRYPTO_PRICES: "crypto:prices",
  CRYPTO_NEWS: "crypto:news",
  MARKET_TRENDS: "market:trends",
  WHALE_ALERTS: "whale:alerts",
  BOT_PERFORMANCE: "bot:performance",
  USER_STATS: "user:stats",
  API_USAGE: "api:usage",
}

export const CacheTTL = {
  REAL_TIME: 30, // 30 seconds
  SHORT: 300, // 5 minutes
  MEDIUM: 900, // 15 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
}

// Cache wrapper for functions
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string,
  ttl: number = CacheTTL.SHORT,
): T {
  return (async (...args: Parameters<T>) => {
    const key = keyGenerator(...args)

    // Try to get from cache first
    const cached = await cache.get(key)
    if (cached) return cached

    // Execute function and cache result
    const result = await fn(...args)
    await cache.set(key, result, ttl)

    return result
  }) as T
}

// Cache invalidation helper
export async function invalidateCache(patterns: string[]) {
  for (const pattern of patterns) {
    await cache.clear(pattern)
  }
}

// Preload cache with common data
export async function preloadCache() {
  // This can be called on app startup to warm the cache
  console.log("Cache preloading started...")

  // Add preloading logic here if needed

  console.log("Cache preloading completed")
}
