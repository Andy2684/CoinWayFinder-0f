import { Redis } from "@upstash/redis"

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// In-memory cache for client-side caching
class MemoryCache {
  private cache = new Map<string, { data: any; expires: number }>()
  private maxSize = 1000

  set(key: string, data: any, ttlSeconds = 300) {
    // Clean up expired entries if cache is getting large
    if (this.cache.size >= this.maxSize) {
      this.cleanup()
    }

    const expires = Date.now() + ttlSeconds * 1000
    this.cache.set(key, { data, expires })
  }

  get(key: string) {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() > entry.expires) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  delete(key: string) {
    this.cache.delete(key)
  }

  clear() {
    this.cache.clear()
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
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

const memoryCache = new MemoryCache()

export interface CacheOptions {
  ttl?: number // Time to live in seconds
  useMemoryCache?: boolean
  useRedisCache?: boolean
  prefix?: string
}

export class CacheManager {
  private defaultTTL = 300 // 5 minutes

  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    const { useMemoryCache = true, useRedisCache = true, prefix = "cwf" } = options

    const fullKey = `${prefix}:${key}`

    // Try memory cache first (fastest)
    if (useMemoryCache) {
      const memoryResult = memoryCache.get(fullKey)
      if (memoryResult !== null) {
        return memoryResult
      }
    }

    // Try Redis cache (server-side)
    if (useRedisCache) {
      try {
        const redisResult = await redis.get(fullKey)
        if (redisResult !== null) {
          // Store in memory cache for next time
          if (useMemoryCache) {
            memoryCache.set(fullKey, redisResult, options.ttl || this.defaultTTL)
          }
          return redisResult as T
        }
      } catch (error) {
        console.error("Redis cache error:", error)
      }
    }

    return null
  }

  async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    const { ttl = this.defaultTTL, useMemoryCache = true, useRedisCache = true, prefix = "cwf" } = options

    const fullKey = `${prefix}:${key}`

    // Store in memory cache
    if (useMemoryCache) {
      memoryCache.set(fullKey, data, ttl)
    }

    // Store in Redis cache
    if (useRedisCache) {
      try {
        await redis.setex(fullKey, ttl, JSON.stringify(data))
      } catch (error) {
        console.error("Redis cache set error:", error)
      }
    }
  }

  async delete(key: string, options: CacheOptions = {}): Promise<void> {
    const { useMemoryCache = true, useRedisCache = true, prefix = "cwf" } = options

    const fullKey = `${prefix}:${key}`

    // Delete from memory cache
    if (useMemoryCache) {
      memoryCache.delete(fullKey)
    }

    // Delete from Redis cache
    if (useRedisCache) {
      try {
        await redis.del(fullKey)
      } catch (error) {
        console.error("Redis cache delete error:", error)
      }
    }
  }

  async invalidatePattern(pattern: string, options: CacheOptions = {}): Promise<void> {
    const { prefix = "cwf" } = options
    const fullPattern = `${prefix}:${pattern}`

    try {
      const keys = await redis.keys(fullPattern)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } catch (error) {
      console.error("Redis pattern invalidation error:", error)
    }

    // Clear memory cache (simple approach - clear all)
    memoryCache.clear()
  }

  async getOrSet<T>(key: string, fetcher: () => Promise<T>, options: CacheOptions = {}): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key, options)
    if (cached !== null) {
      return cached
    }

    // Fetch fresh data
    const data = await fetcher()

    // Store in cache
    await this.set(key, data, options)

    return data
  }

  getMemoryStats() {
    return memoryCache.getStats()
  }
}

// Export singleton instance
export const cache = new CacheManager()

// Predefined cache configurations for different data types
export const CacheConfigs = {
  CRYPTO_PRICES: { ttl: 30, prefix: "prices" }, // 30 seconds for real-time data
  NEWS: { ttl: 300, prefix: "news" }, // 5 minutes for news
  MARKET_TRENDS: { ttl: 60, prefix: "trends" }, // 1 minute for trends
  USER_DATA: { ttl: 600, prefix: "user" }, // 10 minutes for user data
  BOT_DATA: { ttl: 120, prefix: "bots" }, // 2 minutes for bot data
  API_KEYS: { ttl: 3600, prefix: "apikeys" }, // 1 hour for API keys
}
