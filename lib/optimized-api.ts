import { cache, CacheConfigs } from "./cache"
import { perf } from "./performance"
import { fetch } from "node-fetch" // Ensure fetch is imported if not available globally

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE"
  headers?: Record<string, string>
  body?: any
  timeout?: number
  retries?: number
  retryDelay?: number
  cache?: boolean
  cacheKey?: string
  cacheTTL?: number
}

interface PendingRequest {
  promise: Promise<any>
  timestamp: number
}

class OptimizedApiClient {
  private pendingRequests = new Map<string, PendingRequest>()
  private defaultTimeout = 10000 // 10 seconds
  private defaultRetries = 3
  private defaultRetryDelay = 1000 // 1 second

  async request<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const {
      method = "GET",
      headers = {},
      body,
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      retryDelay = this.defaultRetryDelay,
      cache: useCache = method === "GET",
      cacheKey = `${method}:${url}:${JSON.stringify(body)}`,
      cacheTTL = 300,
    } = options

    // Check cache first for GET requests
    if (useCache && method === "GET") {
      const cached = await cache.get<T>(cacheKey)
      if (cached !== null) {
        return cached
      }
    }

    // Deduplicate identical requests
    const requestKey = `${method}:${url}:${JSON.stringify(body)}`
    const pending = this.pendingRequests.get(requestKey)

    if (pending && Date.now() - pending.timestamp < 5000) {
      return pending.promise
    }

    // Create new request
    const requestPromise = this.executeRequest<T>(url, {
      method,
      headers,
      body,
      timeout,
      retries,
      retryDelay,
    })

    // Store pending request
    this.pendingRequests.set(requestKey, {
      promise: requestPromise,
      timestamp: Date.now(),
    })

    try {
      const result = await requestPromise

      // Cache successful GET requests
      if (useCache && method === "GET") {
        await cache.set(cacheKey, result, { ttl: cacheTTL })
      }

      return result
    } finally {
      // Clean up pending request
      this.pendingRequests.delete(requestKey)
    }
  }

  private async executeRequest<T>(
    url: string,
    options: Required<Pick<RequestOptions, "method" | "headers" | "body" | "timeout" | "retries" | "retryDelay">>,
  ): Promise<T> {
    const { method, headers, body, timeout, retries, retryDelay } = options

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await perf.trackApiCall(
          `${method} ${url}`,
          () => this.singleRequest<T>(url, { method, headers, body, timeout }),
          { attempt, url },
        )
      } catch (error) {
        const isLastAttempt = attempt === retries
        const shouldRetry = this.shouldRetry(error, attempt)

        if (isLastAttempt || !shouldRetry) {
          throw error
        }

        // Exponential backoff
        const delay = retryDelay * Math.pow(2, attempt)
        await this.sleep(delay)
      }
    }

    throw new Error("Max retries exceeded")
  }

  private async singleRequest<T>(
    url: string,
    options: { method: string; headers: Record<string, string>; body?: any; timeout: number },
  ): Promise<T> {
    const { method, headers, body, timeout } = options

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } finally {
      clearTimeout(timeoutId)
    }
  }

  private shouldRetry(error: any, attempt: number): boolean {
    // Don't retry on client errors (4xx)
    if (error.message?.includes("HTTP 4")) {
      return false
    }

    // Don't retry after too many attempts
    if (attempt >= 2) {
      return false
    }

    // Retry on network errors, timeouts, and server errors
    return true
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  // Batch multiple requests
  async batch<T>(requests: Array<{ url: string; options?: RequestOptions }>): Promise<T[]> {
    const promises = requests.map(({ url, options }) => this.request<T>(url, options))
    return Promise.all(promises)
  }

  // Prefetch data for better performance
  async prefetch(url: string, options: RequestOptions = {}): Promise<void> {
    try {
      await this.request(url, { ...options, cache: true })
    } catch (error) {
      // Ignore prefetch errors
      console.warn("Prefetch failed:", url, error)
    }
  }

  // Clear all pending requests
  clearPending(): void {
    this.pendingRequests.clear()
  }

  // Get pending request stats
  getPendingStats() {
    return {
      count: this.pendingRequests.size,
      requests: Array.from(this.pendingRequests.keys()),
    }
  }
}

// Export singleton instance
export const apiClient = new OptimizedApiClient()

// Convenience methods for common operations
export const api = {\
  get: <T>(url: string, options?: Omit<RequestOptions, 'method'>) =>\
    apiClient.request<T>(url, { ...options, method: 'GET' }),
\
  post: <T>(url: string, data?: any, options?: Omit<RequestOptions, 'method' | 'body'>) =>\
    apiClient.request<T>(url, { ...options, method: 'POST', body: data }),
\
  put: <T>(url: string, data?: any, options?: Omit<RequestOptions, 'method' | 'body'>) =>\
    apiClient.request<T>(url, { ...options, method: 'PUT', body: data }),
\
  delete: <T>(url: string, options?: Omit<RequestOptions, 'method'>) =>\
    apiClient.request<T>(url, { ...options, method: 'DELETE' }),

  // Cached requests with predefined configurations
  getCryptoPrices: <T>(symbol?: string) =>
    apiClient.request<T>(`/api/crypto/prices${symbol ? `?symbol=${symbol}` : ''}`, {
      ...CacheConfigs.CRYPTO_PRICES,\
      cache: true,
    }),

  getNews: <T>(limit?: number) =>
    apiClient.request<T>(`/api/news${limit ? `?limit=${limit}` : ''}`, {
      ...CacheConfigs.NEWS,\
      cache: true,
    }),

  getMarketTrends: <T>() =>
    apiClient.request<T>('/api/crypto/trends', {
      ...CacheConfigs.MARKET_TRENDS,\
      cache: true,
    }),

  getBots: <T>() =>
    apiClient.request<T>('/api/bots', {
      ...CacheConfigs.BOT_DATA,\
      cache: true,
    }),\
}
