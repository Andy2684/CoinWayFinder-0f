interface PerformanceMetric {
  name: string
  duration: number
  timestamp: number
  metadata?: Record<string, any>
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private maxMetrics = 1000

  // Start timing a function
  startTiming(name: string): () => void {
    const startTime = performance.now()

    return (metadata?: Record<string, any>) => {
      const duration = performance.now() - startTime
      this.addMetric(name, duration, metadata)
    }
  }

  // Add a metric manually
  addMetric(name: string, duration: number, metadata?: Record<string, any>) {
    this.metrics.push({
      name,
      duration,
      timestamp: Date.now(),
      metadata,
    })

    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }
  }

  // Get performance statistics
  getStats(name?: string) {
    const filteredMetrics = name ? this.metrics.filter((m) => m.name === name) : this.metrics

    if (filteredMetrics.length === 0) {
      return null
    }

    const durations = filteredMetrics.map((m) => m.duration)
    durations.sort((a, b) => a - b)

    const sum = durations.reduce((a, b) => a + b, 0)
    const avg = sum / durations.length
    const min = durations[0]
    const max = durations[durations.length - 1]
    const p50 = durations[Math.floor(durations.length * 0.5)]
    const p95 = durations[Math.floor(durations.length * 0.95)]
    const p99 = durations[Math.floor(durations.length * 0.99)]

    return {
      count: filteredMetrics.length,
      avg: Math.round(avg * 100) / 100,
      min: Math.round(min * 100) / 100,
      max: Math.round(max * 100) / 100,
      p50: Math.round(p50 * 100) / 100,
      p95: Math.round(p95 * 100) / 100,
      p99: Math.round(p99 * 100) / 100,
    }
  }

  // Get all metric names
  getMetricNames(): string[] {
    return [...new Set(this.metrics.map((m) => m.name))]
  }

  // Clear metrics
  clear() {
    this.metrics = []
  }

  // Get recent metrics
  getRecentMetrics(minutes = 5) {
    const cutoff = Date.now() - minutes * 60 * 1000
    return this.metrics.filter((m) => m.timestamp > cutoff)
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor()

// Decorator for automatic performance tracking
export function trackPerformance(name?: string) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value
    const metricName = name || `${target.constructor.name}.${propertyKey}`

    descriptor.value = async function (...args: any[]) {
      const endTiming = performanceMonitor.startTiming(metricName)

      try {
        const result = await originalMethod.apply(this, args)
        endTiming({ success: true })
        return result
      } catch (error) {
        endTiming({ success: false, error: error.message })
        throw error
      }
    }

    return descriptor
  }
}

// Utility functions for common performance tracking
export const perf = {
  // Track API calls
  trackApiCall: async <T>(\
    name: string,\
    apiCall: () => Promise<T>,\
    metadata?: Record<string, any>\
  ): Promise<T> => {\
    const endTiming = performanceMonitor.startTiming(`api.${name}\`);

    try {
      const result = await apiCall();
      endTiming({ ...metadata, success: true });
      return result;
    } catch (error) {
      endTiming({ ...metadata, success: false, error: error.message });
      throw error;
    }
  },

  // Track component renders
  trackRender: (componentName: string) => {
    const endTiming = performanceMonitor.startTiming(\`render.${componentName}\`);
    return endTiming;
  },

  // Track user interactions
  trackInteraction: (action: string, metadata?: Record<string, any>) => {
    performanceMonitor.addMetric(\`interaction.${action}\`, 0, metadata);
  },

  // Get performance report
  getReport: () => {
    const metricNames = performanceMonitor.getMetricNames();
    const report: Record<string, any> = {};

    for (const name of metricNames) {
      report[name] = performanceMonitor.getStats(name);
    }

    return report;
  },
};

// Memory usage tracking
export const memoryTracker = {
  getUsage: () => {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
      };
    }
    return null;
  },

  startTracking: (intervalMs: number = 30000) => {
    if (typeof window === 'undefined') return;

    const interval = setInterval(() => {
      const usage = memoryTracker.getUsage();
      if (usage) {
        performanceMonitor.addMetric('memory.usage', usage.used, usage);
      }
    }, intervalMs);

    return () => clearInterval(interval);
  },\
};
