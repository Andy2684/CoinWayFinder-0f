interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  maxSize?: number // Maximum number of items in cache
  persistent?: boolean // Whether to persist to localStorage
}

export class CacheManager {
  private cache = new Map<string, CacheItem<any>>()
  private defaultTTL = 5 * 60 * 1000 // 5 minutes
  private maxSize = 1000
  private persistent = false
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor(options: CacheOptions = {}) {
    this.defaultTTL = options.ttl || this.defaultTTL
    this.maxSize = options.maxSize || this.maxSize
    this.persistent = options.persistent || false

    if (this.persistent && typeof window !== "undefined") {
      this.loadFromStorage()
    }

    // Start cleanup interval
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 60000) // Cleanup every minute
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem("cache-manager")
      if (stored) {
        const data = JSON.parse(stored)
        Object.entries(data).forEach(([key, item]) => {
          this.cache.set(key, item as CacheItem<any>)
        })
      }
    } catch (error) {
      console.warn("Failed to load cache from storage:", error)
    }
  }

  private saveToStorage() {
    if (!this.persistent || typeof window === "undefined") return

    try {
      const data = Object.fromEntries(this.cache.entries())
      localStorage.setItem("cache-manager", JSON.stringify(data))
    } catch (error) {
      console.warn("Failed to save cache to storage:", error)
    }
  }

  private cleanup() {
    const now = Date.now()
    const keysToDelete: string[] = []

    this.cache.forEach((item, key) => {
      if (now - item.timestamp > item.ttl) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach((key) => {
      this.cache.delete(key)
    })

    if (keysToDelete.length > 0 && this.persistent) {
      this.saveToStorage()
    }
  }

  private evictOldest() {
    if (this.cache.size === 0) return

    let oldestKey = ""
    let oldestTime = Date.now()

    this.cache.forEach((item, key) => {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp
        oldestKey = key
      }
    })

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  set<T>(key: string, data: T, ttl?: number): void {
    // Evict oldest item if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest()
    }

    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    }

    this.cache.set(key, item)

    if (this.persistent) {
      this.saveToStorage()
    }
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)

    if (!item) {
      return null
    }

    const now = Date.now()
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key)
      if (this.persistent) {
        this.saveToStorage()
      }
      return null
    }

    return item.data as T
  }

  has(key: string): boolean {
    const item = this.cache.get(key)

    if (!item) {
      return false
    }

    const now = Date.now()
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key)
      if (this.persistent) {
        this.saveToStorage()
      }
      return false
    }

    return true
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key)

    if (deleted && this.persistent) {
      this.saveToStorage()
    }

    return deleted
  }

  clear(): void {
    this.cache.clear()

    if (this.persistent) {
      this.saveToStorage()
    }
  }

  size(): number {
    return this.cache.size
  }

  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  getStats() {
    const now = Date.now()
    let expired = 0
    let active = 0

    this.cache.forEach((item) => {
      if (now - item.timestamp > item.ttl) {
        expired++
      } else {
        active++
      }
    })

    return {
      total: this.cache.size,
      active,
      expired,
      maxSize: this.maxSize,
      hitRate: this.getHitRate(),
    }
  }

  private hitCount = 0
  private missCount = 0

  private getHitRate(): number {
    const total = this.hitCount + this.missCount
    return total === 0 ? 0 : this.hitCount / total
  }

  // Wrapper method that tracks hit/miss statistics
  getWithStats<T>(key: string): T | null {
    const result = this.get<T>(key)

    if (result !== null) {
      this.hitCount++
    } else {
      this.missCount++
    }

    return result
  }

  // Async wrapper for caching async operations
  async getOrSet<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = this.get<T>(key)

    if (cached !== null) {
      this.hitCount++
      return cached
    }

    this.missCount++
    const data = await fetcher()
    this.set(key, data, ttl)
    return data
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.clear()
  }
}

// Global cache instance
export const globalCache = new CacheManager({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 1000,
  persistent: true,
})

// Utility functions for common caching patterns
export const cacheUtils = {
  // Cache API responses
  cacheApiResponse: <T>(url: string, data: T, ttl = 5 * 60 * 1000) => {
    globalCache.set(`api:${url}`, data, ttl)
  },

  getCachedApiResponse: <T>(url: string): T | null => {\
    return globalCache.get<T>(`api:${url}`)
  },

  // Cache user data
  cacheUserData: <T>(userId: string, data: T, ttl = 15 * 60 * 1000) => {
    globalCache.set(`user:${userId}`, data, ttl)
  },

  getCachedUserData: <T>(userId: string): T | null => {\
    return globalCache.get<T>(`user:${userId}`)
  },

  // Cache crypto prices
  cacheCryptoPrice: (symbol: string, price: number, ttl = 30 * 1000) => {
    globalCache.set(`price:${symbol}`, price, ttl)
  },

  getCachedCryptoPrice: (symbol: string): number | null => {\
    return globalCache.get<number>(`price:${symbol}`)
  },

  // Invalidate related cache entries
  invalidatePattern: (pattern: string) => {\
    const keys = globalCache.keys()
    const keysToDelete = keys.filter((key) => key.includes(pattern))
    keysToDelete.forEach((key) => globalCache.delete(key))
  },\
}
