interface EmailJob {
  id: string
  type: string
  data: any
  status: "pending" | "processing" | "completed" | "failed"
  attempts: number
  maxAttempts: number
  createdAt: Date
  processedAt?: Date
  error?: string
  delay?: number
}

class EmailQueue {
  private jobs: Map<string, EmailJob> = new Map()
  private processing = false
  private maxConcurrent = 3
  private currentProcessing = 0

  addJob(type: string, data: any, options: { delay?: number; maxAttempts?: number } = {}): string {
    const id = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const job: EmailJob = {
      id,
      type,
      data,
      status: "pending",
      attempts: 0,
      maxAttempts: options.maxAttempts || 3,
      createdAt: new Date(),
      delay: options.delay || 0,
    }

    this.jobs.set(id, job)

    // Start processing if not already running
    if (!this.processing) {
      this.processQueue()
    }

    return id
  }

  async processQueue(): Promise<void> {
    if (this.processing || this.currentProcessing >= this.maxConcurrent) {
      return
    }

    this.processing = true

    while (this.currentProcessing < this.maxConcurrent) {
      const job = this.getNextJob()
      if (!job) break

      this.currentProcessing++
      this.processJob(job).finally(() => {
        this.currentProcessing--
      })
    }

    this.processing = false

    // Check if there are more jobs to process
    if (this.hasJobsToProcess()) {
      setTimeout(() => this.processQueue(), 1000)
    }
  }

  private getNextJob(): EmailJob | null {
    const now = new Date()

    for (const job of this.jobs.values()) {
      if (job.status === "pending") {
        const shouldProcess = !job.delay || now.getTime() - job.createdAt.getTime() >= job.delay

        if (shouldProcess) {
          return job
        }
      }
    }

    return null
  }

  private hasJobsToProcess(): boolean {
    const now = new Date()

    for (const job of this.jobs.values()) {
      if (job.status === "pending") {
        const shouldProcess = !job.delay || now.getTime() - job.createdAt.getTime() >= job.delay

        if (shouldProcess) {
          return true
        }
      }
    }

    return false
  }

  private async processJob(job: EmailJob): Promise<void> {
    try {
      job.status = "processing"
      job.attempts++
      job.processedAt = new Date()

      // Import emailService dynamically to avoid circular dependencies
      const { emailService } = await import("./email-service")

      let success = false

      switch (job.type) {
        case "profile-change":
          success = await emailService.sendProfileChangeNotification(job.data)
          break
        case "security-alert":
          success = await emailService.sendSecurityAlert(job.data)
          break
        case "password-change":
          success = await emailService.sendPasswordChangeConfirmation(job.data)
          break
        case "two-factor-change":
          success = await emailService.sendTwoFactorStatusChange(job.data)
          break
        case "api-key-change":
          success = await emailService.sendApiKeyNotification(job.data)
          break
        default:
          throw new Error(`Unknown job type: ${job.type}`)
      }

      if (success) {
        job.status = "completed"
        console.log(`Email job ${job.id} completed successfully`)
      } else {
        throw new Error("Email sending failed")
      }
    } catch (error) {
      console.error(`Email job ${job.id} failed:`, error)
      job.error = error instanceof Error ? error.message : "Unknown error"

      if (job.attempts >= job.maxAttempts) {
        job.status = "failed"
        console.error(`Email job ${job.id} failed permanently after ${job.attempts} attempts`)
      } else {
        job.status = "pending"
        // Exponential backoff: 2^attempts * 1000ms
        job.delay = Math.pow(2, job.attempts) * 1000
        job.createdAt = new Date() // Reset created time for delay calculation
        console.log(`Email job ${job.id} will retry in ${job.delay}ms (attempt ${job.attempts}/${job.maxAttempts})`)
      }
    }
  }

  getJobStatus(id: string): EmailJob | null {
    return this.jobs.get(id) || null
  }

  getQueueStats(): {
    total: number
    pending: number
    processing: number
    completed: number
    failed: number
  } {
    const stats = {
      total: this.jobs.size,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
    }

    for (const job of this.jobs.values()) {
      stats[job.status]++
    }

    return stats
  }

  retryFailedJobs(): number {
    let retriedCount = 0

    for (const job of this.jobs.values()) {
      if (job.status === "failed" && job.attempts < job.maxAttempts) {
        job.status = "pending"
        job.attempts = 0
        job.error = undefined
        job.delay = 0
        job.createdAt = new Date()
        retriedCount++
      }
    }

    if (retriedCount > 0 && !this.processing) {
      this.processQueue()
    }

    return retriedCount
  }

  clearCompletedJobs(): number {
    let clearedCount = 0
    const completedJobs = []

    for (const [id, job] of this.jobs.entries()) {
      if (job.status === "completed") {
        completedJobs.push(id)
      }
    }

    for (const id of completedJobs) {
      this.jobs.delete(id)
      clearedCount++
    }

    return clearedCount
  }

  getFailedJobs(): EmailJob[] {
    return Array.from(this.jobs.values()).filter((job) => job.status === "failed")
  }

  removeJob(id: string): boolean {
    return this.jobs.delete(id)
  }
}

export const emailQueue = new EmailQueue()
