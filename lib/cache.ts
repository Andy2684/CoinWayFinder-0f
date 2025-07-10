import { Redis } from "@upstash/redis"

export interface CacheOptions {
  ttl?: number // Time to live in seconds
  tags?: string[] // Cache tags for invalidation
  revalidate?: boolean // Whether to revalidate in background
}

export interface CacheStats {
  hits: number
  misses: number
  hitRate: number
  totalKeys: number
  memoryUsage: number
  lastCleanup: Date
}

class CacheManager {
  private redis: Redis | null = null
  private memoryCache = new Map<string, { value: any; expires: number; tags: string[] }>()
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    totalKeys: 0,
    memoryUsage: 0,
    lastCleanup: new Date(),
  }
  private cleanupInterval: NodeJS.Timeout | null = null
  private maxMemoryKeys = 1000
  private defaultTTL = 3600 // 1 hour

  constructor() {
    // Initialize Redis if available
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      this.redis = new Redis({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
      })
    }

    // Start cleanup interval
    this.startCleanup()
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      // Try memory cache first
      const memoryResult = this.getFromMemory<T>(key)
      if (memoryResult !== null) {
        this.stats.hits++
        this.updateHitRate()
        return memoryResult
      }

      // Try Redis if available
      if (this.redis) {
        const redisResult = await this.redis.get(key)
        if (redisResult !== null) {
          // Store in memory cache for faster access
          this.setInMemory(key, redisResult, Date.now() + this.defaultTTL * 1000, [])
          this.stats.hits++
          this.updateHitRate()
          return redisResult as T
        }
      }

      this.stats.misses++
      this.updateHitRate()
      return null
    } catch (error) {
      console.warn("Cache get error:", error)
      this.stats.misses++
      this.updateHitRate()
      return null
    }
  }

  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    const { ttl = this.defaultTTL, tags = [] } = options
    const expires = Date.now() + ttl * 1000

    try {
      // Set in memory cache
      this.setInMemory(key, value, expires, tags)

      // Set in Redis if available
      if (this.redis) {
        await this.redis.setex(key, ttl, JSON.stringify(value))

        // Store tags for invalidation
        if (tags.length > 0) {
          for (const tag of tags) {
            await this.redis.sadd(`tag:${tag}`, key)
            await this.redis.expire(`tag:${tag}`, ttl)
          }
        }
      }

      this.updateStats()
    } catch (error) {
      console.warn("Cache set error:", error)
    }
  }

  async delete(key: string): Promise<void> {
    try {
      // Delete from memory cache
      this.memoryCache.delete(key)

      // Delete from Redis if available
      if (this.redis) {
        await this.redis.del(key)
      }

      this.updateStats()
    } catch (error) {
      console.warn("Cache delete error:", error)
    }
  }

  async invalidateByTag(tag: string): Promise<void> {
    try {
      if (this.redis) {
        // Get all keys with this tag
        const keys = await this.redis.smembers(`tag:${tag}`)

        if (keys.length > 0) {
          // Delete all keys
          await this.redis.del(...keys)
          // Delete the tag set
          await this.redis.del(`tag:${tag}`)
        }
      }

      // Invalidate from memory cache
      for (const [key, entry] of this.memoryCache.entries()) {
        if (entry.tags.includes(tag)) {
          this.memoryCache.delete(key)
        }
      }

      this.updateStats()
    } catch (error) {
      console.warn("Cache invalidation error:", error)
    }
  }

  async clear(): Promise<void> {
    try {
      // Clear memory cache
      this.memoryCache.clear()

      // Clear Redis if available (be careful with this in production)
      if (this.redis && process.env.NODE_ENV !== "production") {
        await this.redis.flushall()
      }

      this.resetStats()
    } catch (error) {
      console.warn("Cache clear error:", error)
    }
  }

  async memoize<T>(key: string, fn: () => Promise<T>, options: CacheOptions = {}): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    // Execute function and cache result
    try {
      const result = await fn()
      await this.set(key, result, options)
      return result
    } catch (error) {
      // Don't cache errors
      throw error
    }
  }

  getStats(): CacheStats {
    return { ...this.stats }
  }

  private getFromMemory<T>(key: string): T | null {
    const entry = this.memoryCache.get(key)
    if (!entry) {
      return null
    }

    // Check if expired
    if (Date.now() > entry.expires) {
      this.memoryCache.delete(key)
      return null
    }

    return entry.value as T
  }

  private setInMemory<T>(key: string, value: T, expires: number, tags: string[]): void {
    // Implement LRU eviction if cache is full
    if (this.memoryCache.size >= this.maxMemoryKeys) {
      const firstKey = this.memoryCache.keys().next().value
      if (firstKey) {
        this.memoryCache.delete(firstKey)
      }
    }

    this.memoryCache.set(key, { value, expires, tags })
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0
  }

  private updateStats(): void {
    this.stats.totalKeys = this.memoryCache.size
    this.stats.memoryUsage = this.calculateMemoryUsage()
  }

  private calculateMemoryUsage(): number {
    // Rough estimation of memory usage
    let size = 0
    for (const [key, entry] of this.memoryCache.entries()) {
      size += key.length * 2 // UTF-16 characters
      size += JSON.stringify(entry.value).length * 2
      size += entry.tags.join("").length * 2
      size += 64 // Overhead for object structure
    }
    return size
  }

  private resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalKeys: 0,
      memoryUsage: 0,
      lastCleanup: new Date(),
    }
  }

  private startCleanup(): void {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(
      () => {
        this.cleanup()
      },
      5 * 60 * 1000,
    )
  }

  private cleanup(): void {
    const now = Date.now()
    let cleaned = 0

    for (const [key, entry] of this.memoryCache.entries()) {
      if (now > entry.expires) {
        this.memoryCache.delete(key)
        cleaned++
      }
    }

    this.stats.lastCleanup = new Date()
    this.updateStats()

    if (cleaned > 0) {
      console.log(`Cache cleanup: removed ${cleaned} expired entries`)
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }
}

// Export singleton instance
export const cache = new CacheManager()

// Export class for custom instances
export { CacheManager }

// Utility functions
export async function getCachedData<T>(key: string, fetcher: () => Promise<T>, options: CacheOptions = {}): Promise<T> {
  return cache.memoize(key, fetcher, options)
}

export async function invalidateCache(keyOrTag: string, isTag = false): Promise<void> {
  if (isTag) {
    await cache.invalidateByTag(keyOrTag)
  } else {
    await cache.delete(keyOrTag)
  }
}

export function getCacheStats(): CacheStats {
  return cache.getStats()
}
