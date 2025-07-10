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

  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    try {
      const prefixedKey = this.getPrefixedKey(key, options?.prefix)
      const value = await redis.get(prefixedKey)
      return value as T
    } catch (error) {
      console.error("Cache get error:", error)
      return null
    }
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<boolean> {
    try {
      const prefixedKey = this.getPrefixedKey(key, options?.prefix)
      const ttl = options?.ttl || this.defaultTTL

      await redis.setex(prefixedKey, ttl, JSON.stringify(value))
      return true
    } catch (error) {
      console.error("Cache set error:", error)
      return false
    }
  }

  async del(key: string, options?: CacheOptions): Promise<boolean> {
    try {
      const prefixedKey = this.getPrefixedKey(key, options?.prefix)
      await redis.del(prefixedKey)
      return true
    } catch (error) {
      console.error("Cache delete error:", error)
      return false
    }
  }

  async exists(key: string, options?: CacheOptions): Promise<boolean> {
    try {
      const prefixedKey = this.getPrefixedKey(key, options?.prefix)
      const result = await redis.exists(prefixedKey)
      return result === 1
    } catch (error) {
      console.error("Cache exists error:", error)
      return false
    }
  }

  async flush(prefix?: string): Promise<boolean> {
    try {
      if (prefix) {
        const keys = await redis.keys(`${prefix}:*`)
        if (keys.length > 0) {
          await redis.del(...keys)
        }
      } else {
        await redis.flushall()
      }
      return true
    } catch (error) {
      console.error("Cache flush error:", error)
      return false
    }
  }

  async increment(key: string, options?: CacheOptions): Promise<number> {
    try {
      const prefixedKey = this.getPrefixedKey(key, options?.prefix)
      const result = await redis.incr(prefixedKey)

      if (options?.ttl) {
        await redis.expire(prefixedKey, options.ttl)
      }

      return result
    } catch (error) {
      console.error("Cache increment error:", error)
      return 0
    }
  }

  async decrement(key: string, options?: CacheOptions): Promise<number> {
    try {
      const prefixedKey = this.getPrefixedKey(key, options?.prefix)
      const result = await redis.decr(prefixedKey)

      if (options?.ttl) {
        await redis.expire(prefixedKey, options.ttl)
      }

      return result
    } catch (error) {
      console.error("Cache decrement error:", error)
      return 0
    }
  }

  async getOrSet<T>(key: string, fetcher: () => Promise<T>, options?: CacheOptions): Promise<T | null> {
    try {
      // Try to get from cache first
      const cached = await this.get<T>(key, options)
      if (cached !== null) {
        return cached
      }

      // If not in cache, fetch and set
      const value = await fetcher()
      await this.set(key, value, options)
      return value
    } catch (error) {
      console.error("Cache getOrSet error:", error)
      return null
    }
  }

  private getPrefixedKey(key: string, prefix?: string): string {
    return prefix ? `${prefix}:${key}` : key
  }
}

export const cache = new CacheManager()

// Utility functions for common cache patterns
export const cacheKeys = {
  user: (userId: string) => `user:${userId}`,
  session: (sessionId: string) => `session:${sessionId}`,
  apiKey: (keyId: string) => `api_key:${keyId}`,
  rateLimit: (identifier: string) => `rate_limit:${identifier}`,
  cryptoPrice: (symbol: string) => `crypto_price:${symbol}`,
  news: (category: string) => `news:${category}`,
  whaleAlert: (txHash: string) => `whale_alert:${txHash}`,
  botStatus: (botId: string) => `bot_status:${botId}`,
  tradingSignal: (signalId: string) => `trading_signal:${signalId}`,
}

export const cacheTTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
}
