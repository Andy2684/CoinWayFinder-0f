import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export interface CacheOptions {
  ttl?: number // Time to live in seconds
  tags?: string[]
}

export class CacheManager {
  private static instance: CacheManager
  private redis: Redis

  private constructor() {
    this.redis = redis
  }

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key)
      return value as T
    } catch (error) {
      console.error("Cache get error:", error)
      return null
    }
  }

  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<boolean> {
    try {
      const { ttl = 3600 } = options // Default 1 hour
      await this.redis.setex(key, ttl, JSON.stringify(value))
      return true
    } catch (error) {
      console.error("Cache set error:", error)
      return false
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      await this.redis.del(key)
      return true
    } catch (error) {
      console.error("Cache delete error:", error)
      return false
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key)
      return result === 1
    } catch (error) {
      console.error("Cache exists error:", error)
      return false
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern)
      if (keys.length > 0) {
        await this.redis.del(...keys)
      }
    } catch (error) {
      console.error("Cache invalidate pattern error:", error)
    }
  }

  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const values = await this.redis.mget(...keys)
      return values.map((value) => value as T | null)
    } catch (error) {
      console.error("Cache mget error:", error)
      return keys.map(() => null)
    }
  }

  async mset(keyValuePairs: Record<string, any>, ttl = 3600): Promise<boolean> {
    try {
      const pipeline = this.redis.pipeline()

      Object.entries(keyValuePairs).forEach(([key, value]) => {
        pipeline.setex(key, ttl, JSON.stringify(value))
      })

      await pipeline.exec()
      return true
    } catch (error) {
      console.error("Cache mset error:", error)
      return false
    }
  }

  async increment(key: string, by = 1): Promise<number> {
    try {
      return await this.redis.incrby(key, by)
    } catch (error) {
      console.error("Cache increment error:", error)
      return 0
    }
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const result = await this.redis.expire(key, seconds)
      return result === 1
    } catch (error) {
      console.error("Cache expire error:", error)
      return false
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      return await this.redis.ttl(key)
    } catch (error) {
      console.error("Cache ttl error:", error)
      return -1
    }
  }
}

// Utility functions for common caching patterns
export const cache = CacheManager.getInstance()

export async function withCache<T>(key: string, fetcher: () => Promise<T>, options: CacheOptions = {}): Promise<T> {
  const cached = await cache.get<T>(key)
  if (cached !== null) {
    return cached
  }

  const fresh = await fetcher()
  await cache.set(key, fresh, options)
  return fresh
}

export function getCacheKey(...parts: (string | number)[]): string {
  return parts.join(":")
}

// Cache key generators
export const CacheKeys = {
  user: (userId: string) => `user:${userId}`,
  userProfile: (userId: string) => `user:profile:${userId}`,
  userSettings: (userId: string) => `user:settings:${userId}`,
  cryptoPrice: (symbol: string) => `crypto:price:${symbol}`,
  cryptoPrices: () => "crypto:prices:all",
  marketData: (symbol: string) => `market:data:${symbol}`,
  news: (page: number) => `news:page:${page}`,
  whaleAlerts: () => "whale:alerts",
  botPerformance: (botId: string) => `bot:performance:${botId}`,
  tradingSignals: (strategy: string) => `signals:${strategy}`,
  apiUsage: (userId: string, date: string) => `api:usage:${userId}:${date}`,
} as const
