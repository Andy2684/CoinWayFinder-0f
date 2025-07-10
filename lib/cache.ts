import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export interface CacheOptions {
  ttl?: number // Time to live in seconds
  prefix?: string
}

export class CacheManager {
  private defaultTTL = 3600 // 1 hour
  private defaultPrefix = "coinwayfinder:"

  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    try {
      const fullKey = this.buildKey(key, options.prefix)
      const value = await redis.get(fullKey)
      return value as T
    } catch (error) {
      console.error("Cache get error:", error)
      return null
    }
  }

  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key, options.prefix)
      const ttl = options.ttl || this.defaultTTL

      await redis.setex(fullKey, ttl, JSON.stringify(value))
      return true
    } catch (error) {
      console.error("Cache set error:", error)
      return false
    }
  }

  async del(key: string, options: CacheOptions = {}): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key, options.prefix)
      await redis.del(fullKey)
      return true
    } catch (error) {
      console.error("Cache delete error:", error)
      return false
    }
  }

  async exists(key: string, options: CacheOptions = {}): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key, options.prefix)
      const result = await redis.exists(fullKey)
      return result === 1
    } catch (error) {
      console.error("Cache exists error:", error)
      return false
    }
  }

  async increment(key: string, options: CacheOptions = {}): Promise<number> {
    try {
      const fullKey = this.buildKey(key, options.prefix)
      return await redis.incr(fullKey)
    } catch (error) {
      console.error("Cache increment error:", error)
      return 0
    }
  }

  async expire(key: string, ttl: number, options: CacheOptions = {}): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key, options.prefix)
      await redis.expire(fullKey, ttl)
      return true
    } catch (error) {
      console.error("Cache expire error:", error)
      return false
    }
  }

  private buildKey(key: string, prefix?: string): string {
    const keyPrefix = prefix || this.defaultPrefix
    return `${keyPrefix}${key}`
  }

  // Utility methods for common cache patterns
  async getOrSet<T>(key: string, fetcher: () => Promise<T>, options: CacheOptions = {}): Promise<T | null> {
    const cached = await this.get<T>(key, options)
    if (cached !== null) {
      return cached
    }

    try {
      const fresh = await fetcher()
      await this.set(key, fresh, options)
      return fresh
    } catch (error) {
      console.error("Cache getOrSet error:", error)
      return null
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      // Note: This is a simplified implementation
      // In production, you might want to use Redis SCAN for better performance
      const keys = await redis.keys(`${this.defaultPrefix}${pattern}`)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } catch (error) {
      console.error("Cache invalidate pattern error:", error)
    }
  }
}

// Export singleton instance
export const cache = new CacheManager()

// Utility functions for common cache operations
export async function getCachedData<T>(key: string, fetcher: () => Promise<T>, ttl = 3600): Promise<T | null> {
  return cache.getOrSet(key, fetcher, { ttl })
}

export async function invalidateCache(key: string): Promise<void> {
  await cache.del(key)
}

export async function setCachedData<T>(key: string, data: T, ttl = 3600): Promise<void> {
  await cache.set(key, data, { ttl })
}
