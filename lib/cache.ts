interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

interface CacheStats {
  hits: number
  misses: number
  sets: number
  deletes: number
  size: number
}

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>()
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    size: 0,
  }
  private maxSize: number
  private cleanupInterval: NodeJS.Timeout

  constructor(maxSize = 1000) {
    this.maxSize = maxSize

    // Cleanup expired items every 5 minutes
    this.cleanupInterval = setInterval(
      () => {
        this.cleanup()
      },
      5 * 60 * 1000,
    )
  }

  set<T>(key: string, data: T, ttlSeconds = 300): void {
    const now = Date.now()
    const ttl = ttlSeconds * 1000

    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      ttl,
    })

    this.stats.sets++
    this.stats.size = this.cache.size
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)

    if (!item) {
      this.stats.misses++
      return null
    }

    const now = Date.now()
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key)
      this.stats.misses++
      this.stats.size = this.cache.size
      return null
    }

    this.stats.hits++
    return item.data
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    if (deleted) {
      this.stats.deletes++
      this.stats.size = this.cache.size
    }
    return deleted
  }

  clear(): void {
    this.cache.clear()
    this.stats.size = 0
  }

  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false

    const now = Date.now()
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key)
      this.stats.size = this.cache.size
      return false
    }

    return true
  }

  getStats(): CacheStats {
    return { ...this.stats }
  }

  private cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach((key) => {
      this.cache.delete(key)
    })

    this.stats.size = this.cache.size
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.clear()
  }
}

// Global memory cache instance
const memoryCache = new MemoryCache(2000)

// Redis cache functions (fallback to memory cache if Redis unavailable)
class RedisCache {
  private redis: any = null

  constructor() {
    this.initRedis()
  }

  private async initRedis() {
    try {
      if (process.env.REDIS_URL || process.env.KV_REST_API_URL) {
        // Use Redis if available
        const Redis = require("ioredis")
        this.redis = new Redis(
          process.env.REDIS_URL || {
            host: process.env.KV_REST_API_URL,
            token: process.env.KV_REST_API_TOKEN,
          },
        )
      }
    } catch (error) {
      console.warn("Redis not available, using memory cache only:", error)
    }
  }

  async set(key: string, data: any, ttlSeconds = 300): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.setex(key, ttlSeconds, JSON.stringify(data))
      }
    } catch (error) {
      console.warn("Redis set failed, using memory cache:", error)
    }

    // Always set in memory cache as fallback
    memoryCache.set(key, data, ttlSeconds)
  }

  async get<T>(key: string): Promise<T | null> {
    // Try memory cache first (fastest)
    const memoryResult = memoryCache.get<T>(key)
    if (memoryResult !== null) {
      return memoryResult
    }

    // Try Redis if available
    try {
      if (this.redis) {
        const result = await this.redis.get(key)
        if (result) {
          const data = JSON.parse(result)
          // Store in memory cache for faster future access
          memoryCache.set(key, data, 300)
          return data
        }
      }
    } catch (error) {
      console.warn("Redis get failed:", error)
    }

    return null
  }

  async delete(key: string): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.del(key)
      }
    } catch (error) {
      console.warn("Redis delete failed:", error)
    }

    memoryCache.delete(key)
  }

  async clear(pattern?: string): Promise<void> {
    try {
      if (this.redis && pattern) {
        const keys = await this.redis.keys(pattern)
        if (keys.length > 0) {
          await this.redis.del(...keys)
        }
      }
    } catch (error) {
      console.warn("Redis clear failed:", error)
    }

    if (!pattern) {
      memoryCache.clear()
    }
  }
}

// Global Redis cache instance
const redisCache = new RedisCache()

// Cache key generators
export const cacheKeys = {
  cryptoPrices: () => "crypto:prices",
  cryptoPrice: (symbol: string) => `crypto:price:${symbol}`,
  news: () => "crypto:news",
  marketTrends: () => "crypto:trends",
  whaleAlerts: () => "crypto:whales",
  userBots: (userId: string) => `user:${userId}:bots`,
  userApiKeys: (userId: string) => `user:${userId}:api-keys`,
  userUsage: (userId: string) => `user:${userId}:usage`,
  botPerformance: (botId: string) => `bot:${botId}:performance`,
}

// Main cache interface
export const cache = {
  // Get from cache
  async get<T>(key: string): Promise<T | null> {
    return await redisCache.get<T>(key)
  },

  // Set in cache
  async set<T>(key: string, data: T, ttlSeconds = 300): Promise<void> {
    await redisCache.set(key, data, ttlSeconds)
  },

  // Delete from cache
  async delete(key: string): Promise<void> {
    await redisCache.delete(key)
  },

  // Clear cache by pattern
  async clear(pattern?: string): Promise<void> {
    await redisCache.clear(pattern)
  },

  // Get cache stats
  getStats(): CacheStats {
    return memoryCache.getStats()
  },

  // Cache wrapper function
  async wrap<T>(key: string, fn: () => Promise<T>, ttlSeconds = 300): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    // Execute function and cache result
    const result = await fn()
    await this.set(key, result, ttlSeconds)
    return result
  },

  // Invalidate user-specific cache
  async invalidateUser(userId: string): Promise<void> {
    await this.clear(`user:${userId}:*`)
  },

  // Invalidate crypto data cache
  async invalidateCrypto(): Promise<void> {
    await this.clear("crypto:*")
  },
}

// Performance monitoring decorator
export function cached(ttlSeconds = 300) {
  return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`

      return await cache.wrap(cacheKey, () => method.apply(this, args), ttlSeconds)
    }
  }
}

// Cleanup on process exit
process.on("exit", () => {
  memoryCache.destroy()
})

export { memoryCache, redisCache }
