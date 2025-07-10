import Redis from "ioredis"

// Types
interface CacheOptions {
  ttl?: number // Time to live in seconds
  prefix?: string
  serialize?: boolean
  compress?: boolean
}

interface CacheEntry<T> {
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

// Cache configuration
const CACHE_CONFIG = {
  DEFAULT_TTL: 300, // 5 minutes
  MAX_MEMORY_SIZE: 50 * 1024 * 1024, // 50MB
  COMPRESSION_THRESHOLD: 1024, // 1KB
  PREFIXES: {
    CRYPTO_PRICES: "crypto:prices:",
    NEWS: "news:",
    USER_DATA: "user:",
    MARKET_DATA: "market:",
    BOT_DATA: "bot:",
  },
}

// Redis client (server-side only)
let redisClient: Redis | null = null

if (typeof window === "undefined" && process.env.UPSTASH_REDIS_REST_URL) {
  redisClient = new Redis({
    host: process.env.UPSTASH_REDIS_REST_URL?.replace("https://", ""),
    port: 6379,
    password: process.env.UPSTASH_REDIS_REST_TOKEN,
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  })
}

// Memory cache for client-side
class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>()
  private stats: CacheStats = { hits: 0, misses: 0, sets: 0, deletes: 0, size: 0 }
  private maxSize: number

  constructor(maxSize = CACHE_CONFIG.MAX_MEMORY_SIZE) {
    this.maxSize = maxSize
    this.startCleanupInterval()
  }

  set<T>(key: string, value: T, options: CacheOptions = {}): void {
    const ttl = options.ttl || CACHE_CONFIG.DEFAULT_TTL
    const prefixedKey = this.getPrefixedKey(key, options.prefix)

    // Remove expired entries if cache is full
    if (this.getCurrentSize() > this.maxSize * 0.9) {
      this.cleanup()
    }

    const entry: CacheEntry<T> = {
      data: value,
      timestamp: Date.now(),
      ttl: ttl * 1000, // Convert to milliseconds
    }

    this.cache.set(prefixedKey, entry)
    this.stats.sets++
    this.updateSize()
  }

  get<T>(key: string, options: CacheOptions = {}): T | null {
    const prefixedKey = this.getPrefixedKey(key, options.prefix)
    const entry = this.cache.get(prefixedKey) as CacheEntry<T> | undefined

    if (!entry) {
      this.stats.misses++
      return null
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(prefixedKey)
      this.stats.misses++
      this.updateSize()
      return null
    }

    this.stats.hits++
    return entry.data
  }

  delete(key: string, prefix?: string): boolean {
    const prefixedKey = this.getPrefixedKey(key, prefix)
    const deleted = this.cache.delete(prefixedKey)
    if (deleted) {
      this.stats.deletes++
      this.updateSize()
    }
    return deleted
  }

  clear(prefix?: string): void {
    if (prefix) {
      const keysToDelete = Array.from(this.cache.keys()).filter((key) => key.startsWith(prefix))
      keysToDelete.forEach((key) => this.cache.delete(key))
    } else {
      this.cache.clear()
    }
    this.updateSize()
  }

  getStats(): CacheStats {
    return { ...this.stats }
  }

  private getPrefixedKey(key: string, prefix?: string): string {
    return prefix ? `${prefix}${key}` : key
  }

  private getCurrentSize(): number {
    return JSON.stringify(Array.from(this.cache.entries())).length
  }

  private updateSize(): void {
    this.stats.size = this.getCurrentSize()
  }

  private cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key))
    this.updateSize()
  }

  private startCleanupInterval(): void {
    if (typeof window !== "undefined") {
      setInterval(() => this.cleanup(), 60000) // Cleanup every minute
    }
  }
}

// Global memory cache instance
const memoryCache = new MemoryCache()

// Cache manager class
export class CacheManager {
  static async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    const ttl = options.ttl || CACHE_CONFIG.DEFAULT_TTL

    // Set in memory cache
    memoryCache.set(key, value, options)

    // Set in Redis (server-side only)
    if (redisClient) {
      try {
        const prefixedKey = options.prefix ? `${options.prefix}${key}` : key
        const serializedValue = options.serialize !== false ? JSON.stringify(value) : (value as string)

        await redisClient.setex(prefixedKey, ttl, serializedValue)
      } catch (error) {
        console.warn("Redis cache set failed:", error)
      }
    }
  }

  static async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    // Try memory cache first
    const memoryValue = memoryCache.get<T>(key, options)
    if (memoryValue !== null) {
      return memoryValue
    }

    // Try Redis (server-side only)
    if (redisClient) {
      try {
        const prefixedKey = options.prefix ? `${options.prefix}${key}` : key
        const value = await redisClient.get(prefixedKey)

        if (value !== null) {
          const parsedValue = options.serialize !== false ? JSON.parse(value) : (value as T)

          // Cache in memory for faster subsequent access
          memoryCache.set(key, parsedValue, options)
          return parsedValue
        }
      } catch (error) {
        console.warn("Redis cache get failed:", error)
      }
    }

    return null
  }

  static async delete(key: string, prefix?: string): Promise<void> {
    // Delete from memory cache
    memoryCache.delete(key, prefix)

    // Delete from Redis
    if (redisClient) {
      try {
        const prefixedKey = prefix ? `${prefix}${key}` : key
        await redisClient.del(prefixedKey)
      } catch (error) {
        console.warn("Redis cache delete failed:", error)
      }
    }
  }

  static async clear(prefix?: string): Promise<void> {
    // Clear memory cache
    memoryCache.clear(prefix)

    // Clear Redis by pattern
    if (redisClient && prefix) {
      try {
        const keys = await redisClient.keys(`${prefix}*`)
        if (keys.length > 0) {
          await redisClient.del(...keys)
        }
      } catch (error) {
        console.warn("Redis cache clear failed:", error)
      }
    }
  }

  static getStats(): CacheStats {
    return memoryCache.getStats()
  }

  // Helper methods for common cache patterns
  static async getOrSet<T>(key: string, fetcher: () => Promise<T>, options: CacheOptions = {}): Promise<T> {
    const cached = await this.get<T>(key, options)
    if (cached !== null) {
      return cached
    }

    const fresh = await fetcher()
    await this.set(key, fresh, options)
    return fresh
  }

  static async invalidatePattern(pattern: string): Promise<void> {
    if (redisClient) {
      try {
        const keys = await redisClient.keys(pattern)
        if (keys.length > 0) {
          await redisClient.del(...keys)
        }
      } catch (error) {
        console.warn("Cache invalidation failed:", error)
      }
    }

    // For memory cache, we need to iterate and match
    if (typeof window !== "undefined") {
      memoryCache.clear() // Simple approach - clear all for patterns
    }
  }
}

// Export cache prefixes for consistent usage
export const CACHE_PREFIXES = CACHE_CONFIG.PREFIXES

// Export TTL constants
export const CACHE_TTL = {
  VERY_SHORT: 30, // 30 seconds - real-time data
  SHORT: 60, // 1 minute - frequently changing
  MEDIUM: 300, // 5 minutes - market data
  LONG: 1800, // 30 minutes - news/analysis
  VERY_LONG: 3600, // 1 hour - static data
} as const

export default CacheManager
