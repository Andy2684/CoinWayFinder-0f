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
  private defaultTTL = 3600 // 1 hour default
  private keyPrefix = "coinwayfinder:"

  constructor(private options: CacheOptions = {}) {
    if (options.ttl) {
      this.defaultTTL = options.ttl
    }
    if (options.prefix) {
      this.keyPrefix = options.prefix
    }
  }

  private getKey(key: string): string {
    return `${this.keyPrefix}${key}`
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const result = await redis.get(this.getKey(key))
      return result as T
    } catch (error) {
      console.error("Cache get error:", error)
      return null
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    try {
      const cacheKey = this.getKey(key)
      const timeToLive = ttl || this.defaultTTL

      await redis.setex(cacheKey, timeToLive, JSON.stringify(value))
      return true
    } catch (error) {
      console.error("Cache set error:", error)
      return false
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      await redis.del(this.getKey(key))
      return true
    } catch (error) {
      console.error("Cache delete error:", error)
      return false
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(this.getKey(key))
      return result === 1
    } catch (error) {
      console.error("Cache exists error:", error)
      return false
    }
  }

  async flush(): Promise<boolean> {
    try {
      const keys = await redis.keys(`${this.keyPrefix}*`)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
      return true
    } catch (error) {
      console.error("Cache flush error:", error)
      return false
    }
  }

  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const cacheKeys = keys.map((key) => this.getKey(key))
      const results = await redis.mget(...cacheKeys)
      return results.map((result) => result as T | null)
    } catch (error) {
      console.error("Cache mget error:", error)
      return keys.map(() => null)
    }
  }

  async mset<T>(entries: Array<{ key: string; value: T; ttl?: number }>): Promise<boolean> {
    try {
      const pipeline = redis.pipeline()

      entries.forEach(({ key, value, ttl }) => {
        const cacheKey = this.getKey(key)
        const timeToLive = ttl || this.defaultTTL
        pipeline.setex(cacheKey, timeToLive, JSON.stringify(value))
      })

      await pipeline.exec()
      return true
    } catch (error) {
      console.error("Cache mset error:", error)
      return false
    }
  }

  async increment(key: string, amount = 1): Promise<number | null> {
    try {
      const result = await redis.incrby(this.getKey(key), amount)
      return result
    } catch (error) {
      console.error("Cache increment error:", error)
      return null
    }
  }

  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      await redis.expire(this.getKey(key), ttl)
      return true
    } catch (error) {
      console.error("Cache expire error:", error)
      return false
    }
  }
}

// Default cache instance
export const cache = new CacheManager()

// Specialized cache instances
export const userCache = new CacheManager({ prefix: "user:", ttl: 1800 }) // 30 minutes
export const apiCache = new CacheManager({ prefix: "api:", ttl: 300 }) // 5 minutes
export const sessionCache = new CacheManager({ prefix: "session:", ttl: 86400 }) // 24 hours
