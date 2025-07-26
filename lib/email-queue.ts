import { emailService } from "./email-service"

interface EmailJob {
  id: string
  type: "profile_change" | "security_alert" | "password_change" | "2fa_change" | "api_key_change"
  data: any
  attempts: number
  maxAttempts: number
  scheduledAt: Date
  createdAt: Date
  status: "pending" | "processing" | "completed" | "failed"
}

class EmailQueue {
  private queue: EmailJob[] = []
  private processing = false
  private maxRetries = 3
  private retryDelay = 5000 // 5 seconds

  async addJob(type: EmailJob["type"], data: any, delay = 0): Promise<string> {
    const job: EmailJob = {
      id: this.generateId(),
      type,
      data,
      attempts: 0,
      maxAttempts: this.maxRetries,
      scheduledAt: new Date(Date.now() + delay),
      createdAt: new Date(),
      status: "pending",
    }

    this.queue.push(job)

    if (!this.processing) {
      this.processQueue()
    }

    return job.id
  }

  private async processQueue() {
    if (this.processing) return

    this.processing = true

    while (this.queue.length > 0) {
      const now = new Date()
      const readyJobs = this.queue.filter((job) => job.status === "pending" && job.scheduledAt <= now)

      if (readyJobs.length === 0) {
        await this.sleep(1000) // Wait 1 second before checking again
        continue
      }

      const job = readyJobs[0]
      await this.processJob(job)
    }

    this.processing = false
  }

  private async processJob(job: EmailJob) {
    job.status = "processing"
    job.attempts++

    try {
      let success = false

      switch (job.type) {
        case "profile_change":
          success = await emailService.sendProfileChangeNotification(job.data)
          break
        case "security_alert":
          success = await emailService.sendSecurityAlert(job.data)
          break
        case "password_change":
          success = await emailService.sendPasswordChangeConfirmation(job.data)
          break
        case "2fa_change":
          success = await emailService.sendTwoFactorStatusChange(job.data)
          break
        case "api_key_change":
          success = await emailService.sendApiKeyNotification(job.data)
          break
        default:
          console.error("Unknown email job type:", job.type)
          success = false
      }

      if (success) {
        job.status = "completed"
        this.removeJob(job.id)
        console.log(`Email job ${job.id} completed successfully`)
      } else {
        throw new Error("Email sending failed")
      }
    } catch (error) {
      console.error(`Email job ${job.id} failed:`, error)

      if (job.attempts >= job.maxAttempts) {
        job.status = "failed"
        this.removeJob(job.id)
        console.error(`Email job ${job.id} failed permanently after ${job.attempts} attempts`)
      } else {
        job.status = "pending"
        job.scheduledAt = new Date(Date.now() + this.retryDelay * job.attempts)
        console.log(`Email job ${job.id} will retry in ${this.retryDelay * job.attempts}ms`)
      }
    }
  }

  private removeJob(jobId: string) {
    this.queue = this.queue.filter((job) => job.id !== jobId)
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  // Public methods for monitoring
  getQueueStatus() {
    return {
      total: this.queue.length,
      pending: this.queue.filter((job) => job.status === "pending").length,
      processing: this.queue.filter((job) => job.status === "processing").length,
      failed: this.queue.filter((job) => job.status === "failed").length,
      isProcessing: this.processing,
    }
  }

  getJobById(jobId: string): EmailJob | undefined {
    return this.queue.find((job) => job.id === jobId)
  }

  clearFailedJobs() {
    this.queue = this.queue.filter((job) => job.status !== "failed")
  }

  retryFailedJobs() {
    const failedJobs = this.queue.filter((job) => job.status === "failed")
    failedJobs.forEach((job) => {
      job.status = "pending"
      job.attempts = 0
      job.scheduledAt = new Date()
    })

    if (failedJobs.length > 0 && !this.processing) {
      this.processQueue()
    }

    return failedJobs.length
  }
}

export const emailQueue = new EmailQueue()
