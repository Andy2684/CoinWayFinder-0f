"use client"

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
  key: string
}

interface CacheStats {
  hits: number
  misses: number
  size: number
  maxSize: number
}

export class CacheManager {
  private cache = new Map<string, CacheItem<any>>()
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    size: 0,
    maxSize: 1000,
  }
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor(maxSize = 1000, cleanupIntervalMs = 60000) {
    this.stats.maxSize = maxSize
    this.startCleanup(cleanupIntervalMs)
  }

  private startCleanup(intervalMs: number): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, intervalMs)
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

    // If still over max size, remove oldest items
    if (this.cache.size > this.stats.maxSize) {
      const sortedEntries = Array.from(this.cache.entries()).sort(([, a], [, b]) => a.timestamp - b.timestamp)

      const itemsToRemove = this.cache.size - this.stats.maxSize
      for (let i = 0; i < itemsToRemove; i++) {
        this.cache.delete(sortedEntries[i][0])
      }

      this.stats.size = this.cache.size
    }
  }

  public set<T>(key: string, data: T, ttlMs = 300000): void {
    // Default TTL: 5 minutes
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
      key,
    }

    this.cache.set(key, item)
    this.stats.size = this.cache.size

    // Immediate cleanup if over max size
    if (this.cache.size > this.stats.maxSize) {
      this.cleanup()
    }
  }

  public get<T>(key: string): T | null {
    const item = this.cache.get(key)

    if (!item) {
      this.stats.misses++
      return null
    }

    const now = Date.now()
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key)
      this.stats.size = this.cache.size
      this.stats.misses++
      return null
    }

    this.stats.hits++
    return item.data
  }

  public has(key: string): boolean {
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

  public delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    if (deleted) {
      this.stats.size = this.cache.size
    }
    return deleted
  }

  public clear(): void {
    this.cache.clear()
    this.stats.size = 0
    this.stats.hits = 0
    this.stats.misses = 0
  }

  public getStats(): CacheStats {
    return { ...this.stats }
  }

  public getHitRate(): number {
    const total = this.stats.hits + this.stats.misses
    return total === 0 ? 0 : this.stats.hits / total
  }

  public keys(): string[] {
    return Array.from(this.cache.keys())
  }

  public values<T>(): T[] {
    return Array.from(this.cache.values()).map((item) => item.data)
  }

  public entries<T>(): Array<[string, T]> {
    return Array.from(this.cache.entries()).map(([key, item]) => [key, item.data])
  }

  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.clear()
  }
}

// Utility functions for common caching patterns
export function createCacheKey(...parts: (string | number | boolean)[]): string {
  return parts.map(String).join(":")
}

export function withCache<T>(cache: CacheManager, key: string, fetcher: () => Promise<T>, ttlMs = 300000): Promise<T> {
  const cached = cache.get<T>(key)
  if (cached !== null) {
    return Promise.resolve(cached)
  }

  return fetcher().then((data) => {
    cache.set(key, data, ttlMs)
    return data
  })
}

export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  cache: CacheManager,
  keyGenerator?: (...args: Parameters<T>) => string,
  ttlMs = 300000,
): T {
  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : createCacheKey("memoized", JSON.stringify(args))

    const cached = cache.get(key)
    if (cached !== null) {
      return cached
    }

    const result = fn(...args)
    cache.set(key, result, ttlMs)
    return result
  }) as T
}

// Global cache instance
export const globalCache = new CacheManager(1000, 60000)

// Specialized cache instances
export const apiCache = new CacheManager(500, 30000) // API responses
export const userCache = new CacheManager(100, 600000) // User data (10 minutes)
export const configCache = new CacheManager(50, 3600000) // Configuration (1 hour)

// Cache utilities for specific use cases
export const cacheUtils = {
  // Cache API responses
  cacheApiResponse: (endpoint: string, data: any, ttl = 300000) => {
    apiCache.set(createCacheKey("api", endpoint), data, ttl)
  },

  // Get cached API response
  getCachedApiResponse: (endpoint: string): any | null => {
    return apiCache.get(createCacheKey("api", endpoint))
  },

  // Cache user data
  cacheUserData: (userId: string, data: any, ttl = 600000) => {
    userCache.set(createCacheKey("user", userId), data, ttl)
  },

  // Get cached user data
  getCachedUserData: (userId: string): any | null => {
    return userCache.get(createCacheKey("user", userId))
  },

  // Cache configuration
  cacheConfig: (configKey: string, data: any, ttl = 3600000) => {
    configCache.set(createCacheKey("config", configKey), data, ttl)
  },

  // Get cached configuration
  getCachedConfig: (configKey: string): any | null => {
    return configCache.get(createCacheKey("config", configKey))
  },

  // Clear all caches
  clearAll: () => {
    globalCache.clear()
    apiCache.clear()
    userCache.clear()
    configCache.clear()
  },

  // Get combined stats
  getAllStats: () => ({
    global: globalCache.getStats(),
    api: apiCache.getStats(),
    user: userCache.getStats(),
    config: configCache.getStats(),
  }),
}

// Browser storage integration
export const persistentCache = {
  set: (key: string, data: any, ttlMs = 300000) => {
    if (typeof window === "undefined") return

    try {
      const item = {
        data,
        timestamp: Date.now(),
        ttl: ttlMs,
      }
      localStorage.setItem(`cache_${key}`, JSON.stringify(item))
    } catch (error) {
      console.warn("Failed to save to persistent cache:", error)
    }
  },

  get: (key: string): any | null => {
    if (typeof window === "undefined") return null

    try {
      const stored = localStorage.getItem(`cache_${key}`)
      if (!stored) return null

      const item = JSON.parse(stored)
      const now = Date.now()

      if (now - item.timestamp > item.ttl) {
        localStorage.removeItem(`cache_${key}`)
        return null
      }

      return item.data
    } catch (error) {
      console.warn("Failed to read from persistent cache:", error)
      return null
    }
  },

  delete: (key: string) => {
    if (typeof window === "undefined") return

    try {
      localStorage.removeItem(`cache_${key}`)
    } catch (error) {
      console.warn("Failed to delete from persistent cache:", error)
    }
  },

  clear: () => {
    if (typeof window === "undefined") return

    try {
      const keys = Object.keys(localStorage).filter((key) => key.startsWith("cache_"))
      keys.forEach((key) => localStorage.removeItem(key))
    } catch (error) {
      console.warn("Failed to clear persistent cache:", error)
    }
  },
}
