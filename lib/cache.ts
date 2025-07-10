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
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Clean up expired items every 5 minutes
    this.cleanupInterval = setInterval(
      () => {
        this.cleanup()
      },
      5 * 60 * 1000,
    )

    // Clean up on process exit
    if (typeof process !== "undefined") {
      process.on("exit", () => {
        if (this.cleanupInterval) {
          clearInterval(this.cleanupInterval)
        }
      })
    }
  }

  set<T>(key: string, data: T, ttlSeconds = 300): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000,
    }

    this.cache.set(key, item)
    this.stats.sets++
    this.stats.size = this.cache.size
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)

    if (!item) {
      this.stats.misses++
      return null
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      this.stats.misses++
      this.stats.size = this.cache.size
      return null
    }

    this.stats.hits++
    return item.data as T
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    if (deleted) {
      this.stats.deletes++
      this.stats.size = this.cache.size
    }
    return deleted
  }

  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      this.stats.size = this.cache.size
      return false
    }

    return true
  }

  clear(): void {
    this.cache.clear()
    this.stats.size = 0
  }

  getStats(): CacheStats {
    return { ...this.stats }
  }

  getHitRate(): number {
    const total = this.stats.hits + this.stats.misses
    return total === 0 ? 0 : (this.stats.hits / total) * 100
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

  // Get all keys (for debugging)
  getKeys(): string[] {
    return Array.from(this.cache.keys())
  }

  // Get cache size in bytes (approximate)
  getSizeInBytes(): number {
    let size = 0
    for (const [key, item] of this.cache.entries()) {
      size += key.length * 2 // UTF-16 characters
      size += JSON.stringify(item).length * 2
    }
    return size
  }
}

// Global cache instance
const cache = new MemoryCache()

// Cache utility functions
export const cacheUtils = {
  // Generic cache wrapper for async functions
  async withCache<T>(key: string, fetcher: () => Promise<T>, ttlSeconds = 300): Promise<T> {
    // Try to get from cache first
    const cached = cache.get<T>(key)
    if (cached !== null) {
      return cached
    }

    // Fetch fresh data
    const data = await fetcher()

    // Store in cache
    cache.set(key, data, ttlSeconds)

    return data
  },

  // Cache for API responses
  async cacheApiResponse<T>(endpoint: string, params: Record<string, any> = {}, ttlSeconds = 300): Promise<T> {
    const cacheKey = generateCacheKey(endpoint, params)

    return this.withCache(
      cacheKey,
      async () => {
        const url = new URL(endpoint, process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000")
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.append(key, String(value))
        })

        const response = await fetch(url.toString())
        if (!response.ok) {
          throw new Error(`API request failed: ${response.statusText}`)
        }

        return response.json()
      },
      ttlSeconds,
    )
  },

  // Invalidate cache by pattern
  invalidatePattern(pattern: string): number {
    const keys = cache.getKeys()
    const regex = new RegExp(pattern)
    let deleted = 0

    keys.forEach((key) => {
      if (regex.test(key)) {
        cache.delete(key)
        deleted++
      }
    })

    return deleted
  },

  // Get cache statistics
  getStats() {
    return {
      ...cache.getStats(),
      hitRate: cache.getHitRate(),
      sizeInBytes: cache.getSizeInBytes(),
    }
  },

  // Manual cache operations
  set: (key: string, data: any, ttlSeconds?: number) => cache.set(key, data, ttlSeconds),
  get: (key: string) => cache.get<any>(key),
  delete: (key: string) => cache.delete(key),
  has: (key: string) => cache.has(key),
  clear: () => cache.clear(),
}

// Helper function to generate consistent cache keys
export function generateCacheKey(prefix: string, params: Record<string, any> = {}): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&")

  return sortedParams ? `${prefix}:${sortedParams}` : prefix
}

// Predefined cache keys for common operations
export const CACHE_KEYS = {
  CRYPTO_PRICES: "crypto:prices",
  CRYPTO_NEWS: "crypto:news",
  MARKET_TRENDS: "crypto:trends",
  WHALE_ALERTS: "crypto:whales",
  USER_PORTFOLIO: (userId: string) => `user:${userId}:portfolio`,
  USER_BOTS: (userId: string) => `user:${userId}:bots`,
  USER_TRADES: (userId: string) => `user:${userId}:trades`,
  EXCHANGE_RATES: "exchange:rates",
  API_USAGE: (userId: string) => `user:${userId}:api-usage`,
} as const

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 900, // 15 minutes
  HOUR: 3600, // 1 hour
  DAY: 86400, // 24 hours
} as const

export default cache
