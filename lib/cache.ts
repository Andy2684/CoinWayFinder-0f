import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export interface CacheOptions {
  ttl?: number
  prefix?: string
}

export class CacheManager {
  private defaultTTL = 3600 // 1 hour in seconds
  private defaultPrefix = "coinwayfinder"

  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    try {
      const fullKey = this.buildKey(key, options.prefix)
      const result = await redis.get(fullKey)
      return result as T | null
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

  async invalidatePattern(pattern: string, options: CacheOptions = {}): Promise<void> {
    try {
      const fullPattern = this.buildKey(pattern, options.prefix)
      const keys = await redis.keys(fullPattern)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } catch (error) {
      console.error("Cache invalidate pattern error:", error)
    }
  }

  private buildKey(key: string, prefix?: string): string {
    const actualPrefix = prefix || this.defaultPrefix
    return `${actualPrefix}:${key}`
  }
}

export const cache = new CacheManager()

export async function getCachedData<T>(key: string, fetcher: () => Promise<T>, options: CacheOptions = {}): Promise<T> {
  const cached = await cache.get<T>(key, options)
  if (cached !== null) {
    return cached
  }

  const fresh = await fetcher()
  await cache.set(key, fresh, options)
  return fresh
}
