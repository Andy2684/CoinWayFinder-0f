interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>()
  private defaultTTL = 5 * 60 * 1000 // 5 minutes

  set<T>(key: string, data: T, ttl?: number): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    }
    this.cache.set(key, item)
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    const now = Date.now()
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data as T
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false

    const now = Date.now()
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  size(): number {
    return this.cache.size
  }
}

export const globalCache = new MemoryCache()

export const cacheUtils = {
  setCachedApiResponse: <T>(url: string, data: T, ttl?: number): void => {
    globalCache.set(`api:${url}\`, data, ttl);
  },

  getCachedApiResponse: <T>(url: string): T | null => {
    return globalCache.get<T>(\`api:${url}\`);
  },

  invalidateApiCache: (url: string): boolean => {
    return globalCache.delete(\`api:${url}\`);
  },

  setCachedUserData: <T>(userId: string, data: T, ttl?: number): void => {
    globalCache.set(\`user:${userId}\`, data, ttl);
  },

  getCachedUserData: <T>(userId: string): T | null => {
    return globalCache.get<T>(\`user:${userId}\`);
  },

  invalidateUserCache: (userId: string): boolean => {
    return globalCache.delete(\`user:${userId}\`);
  },

  setCachedMarketData: <T>(symbol: string, data: T, ttl?: number): void => {
    globalCache.set(\`market:${symbol}\`, data, ttl || 30000); // 30 seconds for market data
  },

  getCachedMarketData: <T>(symbol: string): T | null => {
    return globalCache.get<T>(\`market:${symbol}\`);
  },

  clearAllCache: (): void => {
    globalCache.clear();
  }
};
\
export default globalCache;
