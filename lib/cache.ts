import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export interface CacheOptions {
  ttl?: number // Time to live in seconds
  tags?: string[]
}

export class CacheManager {
  private static instance: CacheManager
  private defaultTTL = 3600 // 1 hour

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get(key)
      return value as T
    } catch (error) {
      console.error("Cache get error:", error)
      return null
    }
  }

  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<boolean> {
    try {
      const ttl = options.ttl || this.defaultTTL
      await redis.setex(key, ttl, JSON.stringify(value))

      if (options.tags) {
        await this.addToTags(key, options.tags)
      }

      return true
    } catch (error) {
      console.error("Cache set error:", error)
      return false
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      await redis.del(key)
      return true
    } catch (error) {
      console.error("Cache delete error:", error)
      return false
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key)
      return result === 1
    } catch (error) {
      console.error("Cache exists error:", error)
      return false
    }
  }

  async invalidateByTag(tag: string): Promise<void> {
    try {
      const keys = await redis.smembers(`tag:${tag}`)
      if (keys.length > 0) {
        await redis.del(...keys)
        await redis.del(`tag:${tag}`)
      }
    } catch (error) {
      console.error("Cache invalidate by tag error:", error)
    }
  }

  async invalidateByPattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } catch (error) {
      console.error("Cache invalidate by pattern error:", error)
    }
  }

  private async addToTags(key: string, tags: string[]): Promise<void> {
    try {
      for (const tag of tags) {
        await redis.sadd(`tag:${tag}`, key)
      }
    } catch (error) {
      console.error("Cache add to tags error:", error)
    }
  }

  async getOrSet<T>(key: string, fetcher: () => Promise<T>, options: CacheOptions = {}): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const value = await fetcher()
    await this.set(key, value, options)
    return value
  }

  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const values = await redis.mget(...keys)
      return values.map((value) => value as T | null)
    } catch (error) {
      console.error("Cache mget error:", error)
      return keys.map(() => null)
    }
  }

  async mset<T>(entries: Array<[string, T]>, ttl?: number): Promise<boolean> {
    try {
      const pipeline = redis.pipeline()

      for (const [key, value] of entries) {
        if (ttl) {
          pipeline.setex(key, ttl, JSON.stringify(value))
        } else {
          pipeline.set(key, JSON.stringify(value))
        }
      }

      await pipeline.exec()
      return true
    } catch (error) {
      console.error("Cache mset error:", error)
      return false
    }
  }

  async increment(key: string, amount = 1): Promise<number> {
    try {
      return await redis.incrby(key, amount)
    } catch (error) {
      console.error("Cache increment error:", error)
      return 0
    }
  }

  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      const result = await redis.expire(key, ttl)
      return result === 1
    } catch (error) {
      console.error("Cache expire error:", error)
      return false
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      return await redis.ttl(key)
    } catch (error) {
      console.error("Cache TTL error:", error)
      return -1
    }
  }

  async flush(): Promise<boolean> {
    try {
      await redis.flushall()
      return true
    } catch (error) {
      console.error("Cache flush error:", error)
      return false
    }
  }
}

export const cache = CacheManager.getInstance()

// Cache key generators
export const cacheKeys = {
  user: (userId: string) => `user:${userId}`,
  userProfile: (userId: string) => `user:profile:${userId}`,
  userSubscription: (userId: string) => `user:subscription:${userId}`,
  cryptoPrice: (symbol: string) => `crypto:price:${symbol}`,
  cryptoPrices: () => "crypto:prices:all",
  marketData: (symbol: string) => `market:data:${symbol}`,
  news: (page = 1) => `news:page:${page}`,
  whaleAlerts: () => "whale:alerts",
  botPerformance: (botId: string) => `bot:performance:${botId}`,
  tradingSignals: (strategy: string) => `signals:${strategy}`,
  apiUsage: (userId: string, date: string) => `api:usage:${userId}:${date}`,
}

// Cache TTL constants (in seconds)
export const cacheTTL = {
  short: 300, // 5 minutes
  medium: 1800, // 30 minutes
  long: 3600, // 1 hour
  day: 86400, // 24 hours
  week: 604800, // 7 days
}
