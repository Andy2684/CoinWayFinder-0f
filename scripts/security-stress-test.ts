#!/usr/bin/env ts-node

import { securityMonitor, SecurityEventType, SecuritySeverity } from "../lib/security-monitor"

interface StressTestMetrics {
  totalEvents: number
  eventsPerSecond: number
  averageResponseTime: number
  successfulResponses: number
  failedResponses: number
  memoryUsage: NodeJS.MemoryUsage
  duration: number
}

class SecurityStressTester {
  private metrics: StressTestMetrics = {
    totalEvents: 0,
    eventsPerSecond: 0,
    averageResponseTime: 0,
    successfulResponses: 0,
    failedResponses: 0,
    memoryUsage: process.memoryUsage(),
    duration: 0,
  }

  async runStressTest(duration = 60000, eventsPerSecond = 10): Promise<void> {
    console.log("🔥 Starting Security System Stress Test")
    console.log("=".repeat(50))
    console.log(`Duration: ${duration / 1000}s`)
    console.log(`Target Rate: ${eventsPerSecond} events/second`)
    console.log("=".repeat(50))

    const startTime = Date.now()
    const endTime = startTime + duration
    const interval = 1000 / eventsPerSecond
    const responseTimes: number[] = []

    let eventCount = 0

    while (Date.now() < endTime) {
      const eventStartTime = Date.now()

      try {
        await this.generateRandomSecurityEvent()
        const responseTime = Date.now() - eventStartTime
        responseTimes.push(responseTime)
        this.metrics.successfulResponses++

        eventCount++
        if (eventCount % 50 === 0) {
          console.log(`📊 Processed ${eventCount} events...`)
        }
      } catch (error) {
        this.metrics.failedResponses++
        console.error(`❌ Event ${eventCount} failed:`, error)
      }

      // Wait for next event
      const elapsed = Date.now() - eventStartTime
      const waitTime = Math.max(0, interval - elapsed)
      if (waitTime > 0) {
        await this.sleep(waitTime)
      }
    }

    // Calculate final metrics
    this.metrics.totalEvents = eventCount
    this.metrics.duration = Date.now() - startTime
    this.metrics.eventsPerSecond = eventCount / (this.metrics.duration / 1000)
    this.metrics.averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    this.metrics.memoryUsage = process.memoryUsage()

    this.generateStressTestReport(responseTimes)
  }

  private async generateRandomSecurityEvent(): Promise<void> {
    const eventTypes = [
      SecurityEventType.SQL_INJECTION_ATTEMPT,
      SecurityEventType.XSS_ATTEMPT,
      SecurityEventType.BRUTE_FORCE_ATTACK,
      SecurityEventType.RATE_LIMIT_EXCEEDED,
      SecurityEventType.UNAUTHORIZED_ACCESS,
      SecurityEventType.FAILED_AUTH_ATTEMPTS,
      SecurityEventType.SUSPICIOUS_LOGIN,
      SecurityEventType.API_ABUSE,
    ]

    const severities = [SecuritySeverity.CRITICAL, SecuritySeverity.HIGH, SecuritySeverity.MEDIUM, SecuritySeverity.LOW]

    const randomEventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
    const randomSeverity = severities[Math.floor(Math.random() * severities.length)]
    const randomIP = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`

    await securityMonitor.logSecurityEvent({
      type: randomEventType,
      severity: randomSeverity,
      source: this.getRandomEndpoint(),
      ip: randomIP,
      userAgent: this.getRandomUserAgent(),
      details: {
        stressTest: true,
        timestamp: new Date().toISOString(),
        eventId: Math.random().toString(36).substr(2, 9),
        payload: this.getRandomPayload(randomEventType),
      },
    })
  }

  private getRandomEndpoint(): string {
    const endpoints = [
      "/api/auth/signin",
      "/api/users",
      "/api/crypto/prices",
      "/api/trades",
      "/api/bots",
      "/admin/users",
      "/api/news",
      "/api/portfolio",
      "/api/subscription",
      "/api/integrations",
    ]
    return endpoints[Math.floor(Math.random() * endpoints.length)]
  }

  private getRandomUserAgent(): string {
    const userAgents = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
      "Python/3.9 requests/2.25.1",
      "curl/7.68.0",
      "PostmanRuntime/7.28.0",
      "sqlmap/1.6.12",
      "Nikto/2.1.6",
    ]
    return userAgents[Math.floor(Math.random() * userAgents.length)]
  }

  private getRandomPayload(eventType: SecurityEventType): string {
    switch (eventType) {
      case SecurityEventType.SQL_INJECTION_ATTEMPT:
        const sqlPayloads = [
          "' OR '1'='1",
          "'; DROP TABLE users; --",
          "' UNION SELECT * FROM passwords --",
          "1' AND (SELECT COUNT(*) FROM users) > 0 --",
        ]
        return sqlPayloads[Math.floor(Math.random() * sqlPayloads.length)]

      case SecurityEventType.XSS_ATTEMPT:
        const xssPayloads = [
          "<script>alert('XSS')</script>",
          "javascript:alert(document.cookie)",
          "<img src=x onerror=alert(1)>",
          "<svg onload=alert(1)>",
        ]
        return xssPayloads[Math.floor(Math.random() * xssPayloads.length)]

      default:
        return "random_payload_" + Math.random().toString(36).substr(2, 9)
    }
  }

  async runConcurrencyTest(concurrentEvents = 50): Promise<void> {
    console.log("\n🚀 Starting Concurrency Test")
    console.log("=".repeat(50))
    console.log(`Concurrent Events: ${concurrentEvents}`)
    console.log("=".repeat(50))

    const startTime = Date.now()
    const promises: Promise<void>[] = []

    for (let i = 0; i < concurrentEvents; i++) {
      promises.push(this.generateRandomSecurityEvent())
    }

    try {
      await Promise.all(promises)
      const duration = Date.now() - startTime
      console.log(`✅ Processed ${concurrentEvents} concurrent events in ${duration}ms`)
      console.log(`📊 Average time per event: ${(duration / concurrentEvents).toFixed(2)}ms`)
    } catch (error) {
      console.error("❌ Concurrency test failed:", error)
    }
  }

  async runMemoryLeakTest(iterations = 1000): Promise<void> {
    console.log("\n🧠 Starting Memory Leak Test")
    console.log("=".repeat(50))
    console.log(`Iterations: ${iterations}`)
    console.log("=".repeat(50))

    const initialMemory = process.memoryUsage()
    console.log(`Initial Memory Usage:`)
    console.log(`  RSS: ${(initialMemory.rss / 1024 / 1024).toFixed(2)} MB`)
    console.log(`  Heap Used: ${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`)

    for (let i = 0; i < iterations; i++) {
      await this.generateRandomSecurityEvent()

      if (i % 100 === 0) {
        const currentMemory = process.memoryUsage()
        console.log(`Iteration ${i}: Heap Used: ${(currentMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`)

        // Force garbage collection if available
        if (global.gc) {
          global.gc()
        }
      }
    }

    const finalMemory = process.memoryUsage()
    console.log(`\nFinal Memory Usage:`)
    console.log(`  RSS: ${(finalMemory.rss / 1024 / 1024).toFixed(2)} MB`)
    console.log(`  Heap Used: ${(finalMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`)

    const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed
    console.log(`\nMemory Increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB`)

    if (memoryIncrease > 100 * 1024 * 1024) {
      // 100MB threshold
      console.log("⚠️ Potential memory leak detected!")
    } else {
      console.log("✅ No significant memory leak detected")
    }
  }

  async runThroughputTest(targetThroughput = 100): Promise<void> {
    console.log("\n⚡ Starting Throughput Test")
    console.log("=".repeat(50))
    console.log(`Target Throughput: ${targetThroughput} events/second`)
    console.log("=".repeat(50))

    const testDuration = 10000 // 10 seconds
    const startTime = Date.now()
    let eventCount = 0
    const errors: any[] = []

    const interval = setInterval(async () => {
      const batchSize = Math.ceil(targetThroughput / 10) // 10 batches per second
      const promises: Promise<void>[] = []

      for (let i = 0; i < batchSize; i++) {
        promises.push(
          this.generateRandomSecurityEvent().catch((error) => {
            errors.push(error)
          }),
        )
      }

      try {
        await Promise.all(promises)
        eventCount += batchSize
      } catch (error) {
        console.error("Batch processing error:", error)
      }
    }, 100) // Every 100ms

    // Wait for test duration
    await this.sleep(testDuration)
    clearInterval(interval)

    const actualDuration = Date.now() - startTime
    const actualThroughput = eventCount / (actualDuration / 1000)

    console.log(`\n📊 Throughput Test Results:`)
    console.log(`  Events Processed: ${eventCount}`)
    console.log(`  Test Duration: ${(actualDuration / 1000).toFixed(2)}s`)
    console.log(`  Target Throughput: ${targetThroughput} events/s`)
    console.log(`  Actual Throughput: ${actualThroughput.toFixed(2)} events/s`)
    console.log(`  Success Rate: ${(((eventCount - errors.length) / eventCount) * 100).toFixed(2)}%`)
    console.log(`  Errors: ${errors.length}`)

    if (actualThroughput >= targetThroughput * 0.9) {
      console.log(`✅ Throughput test PASSED (${((actualThroughput / targetThroughput) * 100).toFixed(1)}% of target)`)
    } else {
      console.log(`❌ Throughput test FAILED (${((actualThroughput / targetThroughput) * 100).toFixed(1)}% of target)`)
    }
  }

  private generateStressTestReport(responseTimes: number[]): void {
    console.log("\n" + "=".repeat(60))
    console.log("📊 STRESS TEST REPORT")
    console.log("=".repeat(60))

    console.log(`\n📈 Performance Metrics:`)
    console.log(`  Total Events: ${this.metrics.totalEvents}`)
    console.log(`  Successful Responses: ${this.metrics.successfulResponses}`)
    console.log(`  Failed Responses: ${this.metrics.failedResponses}`)
    console.log(`  Success Rate: ${((this.metrics.successfulResponses / this.metrics.totalEvents) * 100).toFixed(2)}%`)
    console.log(`  Duration: ${(this.metrics.duration / 1000).toFixed(2)}s`)
    console.log(`  Events/Second: ${this.metrics.eventsPerSecond.toFixed(2)}`)
    console.log(`  Average Response Time: ${this.metrics.averageResponseTime.toFixed(2)}ms`)

    // Response time percentiles
    const sortedTimes = responseTimes.sort((a, b) => a - b)
    const p50 = sortedTimes[Math.floor(sortedTimes.length * 0.5)]
    const p90 = sortedTimes[Math.floor(sortedTimes.length * 0.9)]
    const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)]
    const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)]

    console.log(`\n📊 Response Time Percentiles:`)
    console.log(`  50th percentile: ${p50}ms`)
    console.log(`  90th percentile: ${p90}ms`)
    console.log(`  95th percentile: ${p95}ms`)
    console.log(`  99th percentile: ${p99}ms`)

    console.log(`\n💾 Memory Usage:`)
    console.log(`  RSS: ${(this.metrics.memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`)
    console.log(`  Heap Used: ${(this.metrics.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`)
    console.log(`  Heap Total: ${(this.metrics.memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`)
    console.log(`  External: ${(this.metrics.memoryUsage.external / 1024 / 1024).toFixed(2)} MB`)

    console.log(`\n💡 Performance Analysis:`)
    if (this.metrics.eventsPerSecond < 5) {
      console.log(`  ⚠️ Low throughput detected. Consider optimizing event processing.`)
    } else if (this.metrics.eventsPerSecond > 50) {
      console.log(`  ✅ Excellent throughput performance.`)
    } else {
      console.log(`  ✅ Good throughput performance.`)
    }

    if (this.metrics.averageResponseTime > 1000) {
      console.log(`  ⚠️ High response times detected. Check for bottlenecks.`)
    } else if (this.metrics.averageResponseTime < 100) {
      console.log(`  ✅ Excellent response times.`)
    } else {
      console.log(`  ✅ Good response times.`)
    }

    if (this.metrics.failedResponses > 0) {
      console.log(`  ⚠️ ${this.metrics.failedResponses} failed responses detected. Review error logs.`)
    } else {
      console.log(`  ✅ No failed responses detected.`)
    }

    console.log("\n" + "=".repeat(60))
    console.log("🎯 Stress Test Completed!")
    console.log("=".repeat(60))
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async runFullTestSuite(): Promise<void> {
    console.log("🧪 Starting Full Security Stress Test Suite")
    console.log("=".repeat(60))

    try {
      // 1. Basic stress test
      await this.runStressTest(30000, 15) // 30 seconds, 15 events/second

      // 2. Concurrency test
      await this.runConcurrencyTest(25)

      // 3. Memory leak test
      await this.runMemoryLeakTest(500)

      // 4. Throughput test
      await this.runThroughputTest(50)

      console.log("\n🎉 Full Test Suite Completed Successfully!")
    } catch (error) {
      console.error("❌ Test suite failed:", error)
    }
  }
}

// CLI interface
if (require.main === module) {
  const tester = new SecurityStressTester()

  const [, , testType, ...args] = process.argv

  async function runTests() {
    if (testType === "stress") {
      const duration = Number.parseInt(args[0]) || 60000
      const eventsPerSecond = Number.parseInt(args[1]) || 10
      await tester.runStressTest(duration, eventsPerSecond)
    } else if (testType === "concurrency") {
      const concurrentEvents = Number.parseInt(args[0]) || 50
      await tester.runConcurrencyTest(concurrentEvents)
    } else if (testType === "memory") {
      const iterations = Number.parseInt(args[0]) || 1000
      await tester.runMemoryLeakTest(iterations)
    } else if (testType === "throughput") {
      const targetThroughput = Number.parseInt(args[0]) || 100
      await tester.runThroughputTest(targetThroughput)
    } else if (testType === "full") {
      await tester.runFullTestSuite()
    } else {
      console.log("Usage:")
      console.log("  ts-node security-stress-test.ts stress [duration_ms] [events_per_second]")
      console.log("  ts-node security-stress-test.ts concurrency [concurrent_events]")
      console.log("  ts-node security-stress-test.ts memory [iterations]")
      console.log("  ts-node security-stress-test.ts throughput [events_per_second]")
      console.log("  ts-node security-stress-test.ts full")
      console.log("")
      console.log("Examples:")
      console.log("  ts-node security-stress-test.ts stress 30000 20")
      console.log("  ts-node security-stress-test.ts concurrency 100")
      console.log("  ts-node security-stress-test.ts memory 2000")
      console.log("  ts-node security-stress-test.ts throughput 75")
      console.log("  ts-node security-stress-test.ts full")
    }
  }

  runTests().catch(console.error)
}

export { SecurityStressTester }
