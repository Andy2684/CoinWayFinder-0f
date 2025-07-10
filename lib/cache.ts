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

  async delete(key: string): Promise<boolean> {
    try {
      await redis.del(key)
      return true
    } catch (error) {
      console.error("Cache delete error:", error)
      return false
    }
  }

  async invalidateByTag(tag: string): Promise<boolean> {
    try {
      const keys = await redis.smembers(`tag:${tag}`)
      if (keys.length > 0) {
        await redis.del(...keys)
        await redis.del(`tag:${tag}`)
      }
      return true
    } catch (error) {
      console.error("Cache invalidate by tag error:", error)
      return false
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

  private async addToTags(key: string, tags: string[]): Promise<void> {
    for (const tag of tags) {
      await redis.sadd(`tag:${tag}`, key)
    }
  }

  // Utility methods for common cache patterns
  async remember<T>(key: string, callback: () => Promise<T>, options: CacheOptions = {}): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const value = await callback()
    await this.set(key, value, options)
    return value
  }

  async increment(key: string, amount = 1): Promise<number> {
    try {
      return await redis.incrby(key, amount)
    } catch (error) {
      console.error("Cache increment error:", error)
      return 0
    }
  }

  async decrement(key: string, amount = 1): Promise<number> {
    try {
      return await redis.decrby(key, amount)
    } catch (error) {
      console.error("Cache decrement error:", error)
      return 0
    }
  }
}

export const cache = CacheManager.getInstance()

// Helper functions for common cache keys
export const cacheKeys = {
  user: (id: string) => `user:${id}`,
  userProfile: (id: string) => `user:profile:${id}`,
  cryptoPrice: (symbol: string) => `crypto:price:${symbol}`,
  cryptoNews: () => "crypto:news",
  marketData: () => "market:data",
  whaleAlerts: () => "whale:alerts",
  botPerformance: (botId: string) => `bot:performance:${botId}`,
  userBots: (userId: string) => `user:bots:${userId}`,
  subscription: (userId: string) => `subscription:${userId}`,
}
