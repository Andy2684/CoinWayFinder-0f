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
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor(maxSize = 1000) {
    this.maxSize = maxSize

    // Only set up cleanup interval in browser environment
    if (typeof window !== "undefined") {
      this.cleanupInterval = setInterval(
        () => {
          this.cleanup()
        },
        5 * 60 * 1000,
      ) // Cleanup every 5 minutes
    }
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
      this.cleanupInterval = null
    }
    this.clear()
  }
}

// Global memory cache instance
const memoryCache = new MemoryCache(2000)

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

// TTL constants (in seconds)
export const cacheTTL = {
  REAL_TIME: 30, // 30 seconds for real-time data
  SHORT: 300, // 5 minutes for frequently changing data
  MEDIUM: 900, // 15 minutes for moderate data
  LONG: 3600, // 1 hour for stable data
  VERY_LONG: 86400, // 24 hours for static data
}

// Main cache interface
export const cache = {
  // Get from cache
  get<T>(key: string): T | null {
    return memoryCache.get<T>(key)
  },

  // Set in cache
  set<T>(key: string, data: T, ttlSeconds = cacheTTL.SHORT): void {
    memoryCache.set(key, data, ttlSeconds)
  },

  // Delete from cache
  delete(key: string): boolean {
    return memoryCache.delete(key)
  },

  // Clear cache
  clear(): void {
    memoryCache.clear()
  },

  // Check if key exists
  has(key: string): boolean {
    return memoryCache.has(key)
  },

  // Get cache stats
  getStats(): CacheStats {
    return memoryCache.getStats()
  },

  // Cache wrapper function
  wrap<T>(key: string, fn: () => T | Promise<T>, ttlSeconds = cacheTTL.SHORT): T | Promise<T> {
    // Try to get from cache first
    const cached = this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    // Execute function and cache result
    const result = fn()

    // Handle both sync and async functions
    if (result instanceof Promise) {
      return result.then((data) => {
        this.set(key, data, ttlSeconds)
        return data
      })
    } else {
      this.set(key, result, ttlSeconds)
      return result
    }
  },

  // Invalidate cache by pattern (simple implementation)
  invalidatePattern(pattern: string): void {
    const stats = this.getStats()
    // For simplicity, we'll clear all cache if pattern matching is needed
    // In a real implementation, you'd iterate through keys and match patterns
    if (pattern.includes("*")) {
      this.clear()
    } else {
      this.delete(pattern)
    }
  },
}

// Performance monitoring decorator
export function cached(ttlSeconds = cacheTTL.SHORT) {
  return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
    const method = descriptor.value

    descriptor.value = function (...args: any[]) {
      const cacheKey = `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`

      return cache.wrap(cacheKey, () => method.apply(this, args), ttlSeconds)
    }

    return descriptor
  }
}

// Utility functions
export const cacheUtils = {
  // Generate cache key with prefix
  generateKey(prefix: string, ...parts: (string | number)[]): string {
    return `${prefix}:${parts.join(":")}`
  },

  // Get cache hit rate
  getHitRate(): number {
    const stats = cache.getStats()
    const total = stats.hits + stats.misses
    return total > 0 ? (stats.hits / total) * 100 : 0
  },

  // Get cache size in MB (approximate)
  getCacheSizeMB(): number {
    const stats = cache.getStats()
    // Rough estimation: assume average 1KB per item
    return (stats.size * 1024) / (1024 * 1024)
  },

  // Warm cache with common data
  async warmCache(): Promise<void> {
    console.log("Warming cache with common data...")
    // This would typically pre-load frequently accessed data
    // For now, it's a placeholder
  },
}

// Cleanup on process exit (Node.js only)
if (typeof process !== "undefined") {
  process.on("exit", () => {
    memoryCache.destroy()
  })

  process.on("SIGINT", () => {
    memoryCache.destroy()
    process.exit(0)
  })

  process.on("SIGTERM", () => {
    memoryCache.destroy()
    process.exit(0)
  })
}

export { memoryCache }
export default cache
