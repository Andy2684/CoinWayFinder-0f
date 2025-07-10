import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export interface CacheOptions {
  ttl?: number
  tags?: string[]
}

export class CacheManager {
  private static instance: CacheManager
  private defaultTTL = 3600

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get(key)
      return value as T
    } catch (error) {
      console.error("Cache get error:", error)
      return null
    }
  }

  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<boolean> {
    try {
      const ttl = options.ttl || this.defaultTTL
      await redis.setex(key, ttl, JSON.stringify(value))

      if (options.tags) {
        for (const tag of options.tags) {
          await redis.sadd(`tag:${tag}`, key)
        }
      }

      return true
    } catch (error) {
      console.error("Cache set error:", error)
      return false
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      await redis.del(key)
      return true
    } catch (error) {
      console.error("Cache delete error:", error)
      return false
    }
  }

  async invalidateByTag(tag: string): Promise<boolean> {
    try {
      const keys = await redis.smembers(`tag:${tag}`)
      if (keys.length > 0) {
        await redis.del(...keys)
        await redis.del(`tag:${tag}`)
      }
      return true
    } catch (error) {
      console.error("Cache invalidate by tag error:", error)
      return false
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key)
      return result === 1
    } catch (error) {
      console.error("Cache exists error:", error)
      return false
    }
  }

  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const values = await redis.mget(...keys)
      return values.map((value) => value as T)
    } catch (error) {
      console.error("Cache mget error:", error)
      return keys.map(() => null)
    }
  }

  async mset<T>(entries: Array<{ key: string; value: T; ttl?: number }>): Promise<boolean> {
    try {
      const pipeline = redis.pipeline()

      for (const entry of entries) {
        const ttl = entry.ttl || this.defaultTTL
        pipeline.setex(entry.key, ttl, JSON.stringify(entry.value))
      }

      await pipeline.exec()
      return true
    } catch (error) {
      console.error("Cache mset error:", error)
      return false
    }
  }

  async clear(): Promise<boolean> {
    try {
      await redis.flushall()
      return true
    } catch (error) {
      console.error("Cache clear error:", error)
      return false
    }
  }

  generateKey(...parts: string[]): string {
    return parts.join(":")
  }
}

export const cache = CacheManager.getInstance()

export async function getCachedData<T>(key: string, fetcher: () => Promise<T>, options: CacheOptions = {}): Promise<T> {
  const cached = await cache.get<T>(key)

  if (cached !== null) {
    return cached
  }

  const data = await fetcher()
  await cache.set(key, data, options)

  return data
}

export function withCache<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  keyGenerator: (...args: T) => string,
  options: CacheOptions = {},
) {
  return async (...args: T): Promise<R> => {
    const key = keyGenerator(...args)
    return getCachedData(key, () => fn(...args), options)
  }
}
