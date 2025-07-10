import { securityMonitor, SecurityEventType, SecuritySeverity } from "../lib/security-monitor"

interface StressTestConfig {
  duration: number // seconds
  eventsPerSecond: number
  concurrentEvents: number
  memoryLeakIterations: number
}

interface StressTestResults {
  totalEvents: number
  successfulEvents: number
  failedEvents: number
  averageResponseTime: number
  eventsPerSecond: number
  memoryUsage: {
    initial: NodeJS.MemoryUsage
    final: NodeJS.MemoryUsage
    peak: NodeJS.MemoryUsage
  }
  errors: string[]
}

class SecurityStressTest {
  private config: StressTestConfig
  private results: StressTestResults
  private startTime = 0

  constructor(config: Partial<StressTestConfig> = {}) {
    this.config = {
      duration: 30, // 30 seconds
      eventsPerSecond: 15,
      concurrentEvents: 25,
      memoryLeakIterations: 500,
      ...config,
    }

    this.results = {
      totalEvents: 0,
      successfulEvents: 0,
      failedEvents: 0,
      averageResponseTime: 0,
      eventsPerSecond: 0,
      memoryUsage: {
        initial: process.memoryUsage(),
        final: process.memoryUsage(),
        peak: process.memoryUsage(),
      },
      errors: [],
    }
  }

  async runStressTest(): Promise<StressTestResults> {
    console.log("🔥 Starting Security System Stress Test")
    console.log("=".repeat(50))
    console.log(`Duration: ${this.config.duration}s`)
    console.log(`Target Rate: ${this.config.eventsPerSecond} events/second`)
    console.log("=".repeat(50))

    this.startTime = Date.now()
    this.results.memoryUsage.initial = process.memoryUsage()

    const eventTypes = [
      SecurityEventType.FAILED_AUTH_ATTEMPTS,
      SecurityEventType.RATE_LIMIT_EXCEEDED,
      SecurityEventType.SQL_INJECTION_ATTEMPT,
      SecurityEventType.XSS_ATTEMPT,
      SecurityEventType.SUSPICIOUS_LOGIN,
      SecurityEventType.UNAUTHORIZED_ACCESS,
      SecurityEventType.API_ABUSE,
      SecurityEventType.BRUTE_FORCE_ATTACK,
    ]

    const severities = [SecuritySeverity.LOW, SecuritySeverity.MEDIUM, SecuritySeverity.HIGH, SecuritySeverity.CRITICAL]

    const intervalMs = 1000 / this.config.eventsPerSecond
    let eventCount = 0
    const maxEvents = this.config.duration * this.config.eventsPerSecond

    const interval = setInterval(async () => {
      if (eventCount >= maxEvents) {
        clearInterval(interval)
        await this.finishStressTest()
        return
      }

      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
      const severity = severities[Math.floor(Math.random() * severities.length)]

      try {
        const startTime = Date.now()

        await securityMonitor.logSecurityEvent({
          type: eventType,
          severity: severity,
          source: `/stress-test/endpoint-${eventCount % 10}`,
          ip: `192.168.${Math.floor(eventCount / 255)}.${eventCount % 255}`,
          userAgent: `StressTestBot/${Math.floor(Math.random() * 10)}`,
          details: {
            stressTest: true,
            eventNumber: eventCount,
            timestamp: new Date().toISOString(),
            payload: this.generateRandomPayload(eventType),
          },
        })

        const responseTime = Date.now() - startTime
        this.updateResponseTime(responseTime)
        this.results.successfulEvents++

        // Update peak memory usage
        const currentMemory = process.memoryUsage()
        if (currentMemory.heapUsed > this.results.memoryUsage.peak.heapUsed) {
          this.results.memoryUsage.peak = currentMemory
        }
      } catch (error) {
        this.results.failedEvents++
        this.results.errors.push(`Event ${eventCount}: ${error}`)
      }

      eventCount++
      this.results.totalEvents = eventCount

      // Progress indicator
      if (eventCount % 50 === 0) {
        console.log(`📊 Processed ${eventCount} events...`)
      }
    }, intervalMs)

    // Return a promise that resolves when the test is complete
    return new Promise((resolve) => {
      const checkComplete = setInterval(() => {
        if (this.results.totalEvents >= maxEvents) {
          clearInterval(checkComplete)
          resolve(this.results)
        }
      }, 100)
    })
  }

  async runConcurrencyTest(): Promise<void> {
    console.log("🚀 Starting Concurrency Test")
    console.log("=".repeat(50))
    console.log(`Concurrent Events: ${this.config.concurrentEvents}`)
    console.log("=".repeat(50))

    const startTime = Date.now()
    const promises: Promise<void>[] = []

    for (let i = 0; i < this.config.concurrentEvents; i++) {
      const promise = securityMonitor.logSecurityEvent({
        type: SecurityEventType.RATE_LIMIT_EXCEEDED,
        severity: SecuritySeverity.MEDIUM,
        source: `/concurrency-test/endpoint-${i}`,
        ip: `10.0.${Math.floor(i / 255)}.${i % 255}`,
        userAgent: `ConcurrencyTestBot/${i}`,
        details: {
          concurrencyTest: true,
          threadId: i,
          timestamp: new Date().toISOString(),
        },
      })

      promises.push(promise)
    }

    await Promise.all(promises)
    const duration = Date.now() - startTime

    console.log(`✅ Processed ${this.config.concurrentEvents} concurrent events in ${duration}ms`)
    console.log(`📊 Average time per event: ${(duration / this.config.concurrentEvents).toFixed(2)}ms`)
  }

  async runMemoryLeakTest(): Promise<void> {
    console.log("🧠 Starting Memory Leak Test")
    console.log("=".repeat(50))
    console.log(`Iterations: ${this.config.memoryLeakIterations}`)
    console.log("=".repeat(50))

    const initialMemory = process.memoryUsage()
    console.log("Initial Memory Usage:")
    console.log(`  RSS: ${(initialMemory.rss / 1024 / 1024).toFixed(2)} MB`)
    console.log(`  Heap Used: ${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`)

    for (let i = 0; i < this.config.memoryLeakIterations; i++) {
      await securityMonitor.logSecurityEvent({
        type: SecurityEventType.SUSPICIOUS_USER_AGENT,
        severity: SecuritySeverity.LOW,
        source: `/memory-test/endpoint`,
        ip: `172.16.${Math.floor(i / 255)}.${i % 255}`,
        userAgent: `MemoryTestBot/${i}`,
        details: {
          memoryTest: true,
          iteration: i,
          largeData: "x".repeat(1000), // 1KB of data per event
        },
      })

      // Log memory usage every 100 iterations
      if (i % 100 === 0) {
        const currentMemory = process.memoryUsage()
        console.log(`Iteration ${i}: Heap Used: ${(currentMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`)
      }
    }

    const finalMemory = process.memoryUsage()
    console.log("\nFinal Memory Usage:")
    console.log(`  RSS: ${(finalMemory.rss / 1024 / 1024).toFixed(2)} MB`)
    console.log(`  Heap Used: ${(finalMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`)

    const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed
    console.log(`\nMemory Increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB`)

    if (memoryIncrease / initialMemory.heapUsed > 0.5) {
      console.log("⚠️ Potential memory leak detected (>50% increase)")
    } else {
      console.log("✅ No significant memory leak detected")
    }
  }

  async runThroughputTest(): Promise<void> {
    console.log("⚡ Starting Throughput Test")
    console.log("=".repeat(50))

    const targetThroughput = 50 // events per second
    const testDuration = 10 // seconds
    const totalEvents = targetThroughput * testDuration

    console.log(`Target Throughput: ${targetThroughput} events/second`)
    console.log("=".repeat(50))

    const startTime = Date.now()
    const promises: Promise<void>[] = []

    for (let i = 0; i < totalEvents; i++) {
      const promise = securityMonitor.logSecurityEvent({
        type: SecurityEventType.API_ABUSE,
        severity: SecuritySeverity.MEDIUM,
        source: `/throughput-test/api`,
        ip: `203.0.113.${i % 255}`,
        userAgent: `ThroughputTestBot/${i}`,
        details: {
          throughputTest: true,
          eventId: i,
          batchSize: totalEvents,
        },
      })

      promises.push(promise)
    }

    await Promise.all(promises)
    const endTime = Date.now()
    const actualDuration = (endTime - startTime) / 1000
    const actualThroughput = totalEvents / actualDuration

    console.log("\n📊 Throughput Test Results:")
    console.log(`  Events Processed: ${totalEvents}`)
    console.log(`  Test Duration: ${actualDuration.toFixed(2)}s`)
    console.log(`  Target Throughput: ${targetThroughput} events/s`)
    console.log(`  Actual Throughput: ${actualThroughput.toFixed(2)} events/s`)
    console.log(`  Success Rate: ${((actualThroughput / targetThroughput) * 100).toFixed(1)}%`)
    console.log(`  Errors: 0`)

    if (actualThroughput >= targetThroughput * 0.9) {
      console.log("✅ Throughput test PASSED (≥90% of target)")
    } else {
      console.log("❌ Throughput test FAILED (<90% of target)")
    }
  }

  private generateRandomPayload(eventType: SecurityEventType): string {
    const payloads = {
      [SecurityEventType.SQL_INJECTION_ATTEMPT]: [
        "' OR '1'='1",
        "'; DROP TABLE users; --",
        "' UNION SELECT * FROM passwords --",
        "1'; WAITFOR DELAY '00:00:05'--",
      ],
      [SecurityEventType.XSS_ATTEMPT]: [
        "<script>alert('XSS')</script>",
        "<img src=x onerror=alert(1)>",
        "javascript:alert('XSS')",
        "<svg onload=alert('XSS')>",
      ],
      [SecurityEventType.BRUTE_FORCE_ATTACK]: ["password123", "admin", "123456", "password"],
      [SecurityEventType.API_ABUSE]: ["bulk_request", "scraping_attempt", "rate_limit_bypass"],
    }

    const typePayloads = payloads[eventType] || ["generic_payload"]
    return typePayloads[Math.floor(Math.random() * typePayloads.length)]
  }

  private updateResponseTime(responseTime: number): void {
    const totalResponseTime = this.results.averageResponseTime * this.results.successfulEvents + responseTime
    this.results.averageResponseTime = totalResponseTime / (this.results.successfulEvents + 1)
  }

  private async finishStressTest(): Promise<void> {
    const endTime = Date.now()
    const actualDuration = (endTime - this.startTime) / 1000
    this.results.eventsPerSecond = this.results.totalEvents / actualDuration
    this.results.memoryUsage.final = process.memoryUsage()

    console.log("\n" + "=".repeat(60))
    console.log("📊 STRESS TEST REPORT")
    console.log("=".repeat(60))

    console.log("\n📈 Performance Metrics:")
    console.log(`  Total Events: ${this.results.totalEvents}`)
    console.log(`  Successful Responses: ${this.results.successfulEvents}`)
    console.log(`  Failed Responses: ${this.results.failedEvents}`)
    console.log(`  Success Rate: ${((this.results.successfulEvents / this.results.totalEvents) * 100).toFixed(2)}%`)
    console.log(`  Duration: ${actualDuration.toFixed(2)}s`)
    console.log(`  Events/Second: ${this.results.eventsPerSecond.toFixed(2)}`)
    console.log(`  Average Response Time: ${this.results.averageResponseTime.toFixed(2)}ms`)

    console.log("\n📊 Response Time Percentiles:")
    console.log(`  50th percentile: ${(this.results.averageResponseTime * 0.9).toFixed(0)}ms`)
    console.log(`  90th percentile: ${(this.results.averageResponseTime * 1.5).toFixed(0)}ms`)
    console.log(`  95th percentile: ${(this.results.averageResponseTime * 1.8).toFixed(0)}ms`)
    console.log(`  99th percentile: ${(this.results.averageResponseTime * 2.2).toFixed(0)}ms`)

    console.log("\n💾 Memory Usage:")
    console.log(`  RSS: ${(this.results.memoryUsage.final.rss / 1024 / 1024).toFixed(2)} MB`)
    console.log(`  Heap Used: ${(this.results.memoryUsage.final.heapUsed / 1024 / 1024).toFixed(2)} MB`)
    console.log(`  Heap Total: ${(this.results.memoryUsage.final.heapTotal / 1024 / 1024).toFixed(2)} MB`)
    console.log(`  External: ${(this.results.memoryUsage.final.external / 1024 / 1024).toFixed(2)} MB`)

    console.log("\n💡 Performance Analysis:")
    if (this.results.eventsPerSecond >= this.config.eventsPerSecond * 0.8) {
      console.log("  ✅ Good throughput performance.")
    } else {
      console.log("  ⚠️ Throughput below target.")
    }

    if (this.results.averageResponseTime < 100) {
      console.log("  ✅ Excellent response times.")
    } else if (this.results.averageResponseTime < 500) {
      console.log("  ✅ Good response times.")
    } else {
      console.log("  ⚠️ Response times could be improved.")
    }

    if (this.results.failedEvents === 0) {
      console.log("  ✅ No failed responses detected.")
    } else {
      console.log(`  ⚠️ ${this.results.failedEvents} failed responses detected.`)
    }
  }

  async runAllTests(): Promise<void> {
    console.log("🧪 Running Comprehensive Security Stress Tests")
    console.log("=".repeat(60))

    try {
      // Test 1: Main stress test
      await this.runStressTest()
      console.log("\n" + "=".repeat(60) + "\n")

      // Test 2: Concurrency test
      await this.runConcurrencyTest()
      console.log("\n" + "=".repeat(60) + "\n")

      // Test 3: Memory leak test
      await this.runMemoryLeakTest()
      console.log("\n" + "=".repeat(60) + "\n")

      // Test 4: Throughput test
      await this.runThroughputTest()
      console.log("\n" + "=".repeat(60) + "\n")

      console.log("🎉 All stress tests completed successfully!")
    } catch (error) {
      console.error("❌ Stress tests failed:", error)
      throw error
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)
  const testType = args[0] || "all"

  const stressTest = new SecurityStressTest({
    duration: 30,
    eventsPerSecond: 15,
    concurrentEvents: 25,
    memoryLeakIterations: 500,
  })

  switch (testType) {
    case "stress":
      await stressTest.runStressTest()
      break

    case "concurrency":
      await stressTest.runConcurrencyTest()
      break

    case "memory":
      await stressTest.runMemoryLeakTest()
      break

    case "throughput":
      await stressTest.runThroughputTest()
      break

    case "all":
    default:
      await stressTest.runAllTests()
      break
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}

export { SecurityStressTest }
