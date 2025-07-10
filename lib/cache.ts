interface CacheConfig {
  defaultTTL: number
  maxSize: number
  enableCompression: boolean
}

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>()
  private config: CacheConfig

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 300000, // 5 minutes
      maxSize: 1000,
      enableCompression: false,
      ...config,
    }
  }

  set<T>(key: string, value: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data: value,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
    }

    // Remove oldest entries if cache is full
    if (this.cache.size >= this.config.maxSize) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }

    this.cache.set(key, entry)
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  size(): number {
    return this.cache.size
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

// Global cache instance
export const globalCache = new MemoryCache({
  defaultTTL: 300000, // 5 minutes
  maxSize: 1000,
  enableCompression: false,
})

// Cache utilities
export const cacheUtils = {
  // Cache API responses
  setCachedApiResponse: <T>(url: string, data: T, ttl?: number): void => {
    globalCache.set(`api:${url}\`, data, ttl);
  },

  getCachedApiResponse: <T>(url: string): T | null => {
    return globalCache.get<T>(\`api:${url}\`);
  },

  // Cache user data
  setCachedUserData: <T>(userId: string, data: T, ttl?: number): void => {
    globalCache.set(\`user:${userId}\`, data, ttl);
  },

  getCachedUserData: <T>(userId: string): T | null => {
    return globalCache.get<T>(\`user:${userId}\`);
  },

  // Cache market data
  setCachedMarketData: <T>(symbol: string, data: T, ttl?: number): void => {
    globalCache.set(\`market:${symbol}\`, data, ttl || 60000); // 1 minute default for market data
  },

  getCachedMarketData: <T>(symbol: string): T | null => {
    return globalCache.get<T>(\`market:${symbol}\`);
  },

  // Cache bot data
  setCachedBotData: <T>(botId: string, data: T, ttl?: number): void => {
    globalCache.set(\`bot:${botId}\`, data, ttl);
  },

  getCachedBotData: <T>(botId: string): T | null => {
    return globalCache.get<T>(\`bot:${botId}\`);
  },

  // Generic cache operations
  invalidatePattern: (pattern: string): void => {
    // Simple pattern matching - could be enhanced
    for (const key of Array.from(globalCache.cache.keys())) {
      if (key.includes(pattern)) {
        globalCache.delete(key);
      }
    }
  },

  // Get cache statistics
  getStats: () => {
    return {
      size: globalCache.size(),
      maxSize: globalCache.config.maxSize,
      defaultTTL: globalCache.config.defaultTTL
    };
  }
};

// Auto cleanup every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    globalCache.cleanup();
  }, 300000);
}
\
export default globalCache;
