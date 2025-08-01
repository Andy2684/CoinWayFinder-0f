import { connectToDatabase } from "@/lib/mongodb"

export interface NotificationData {
  type: "security" | "admin" | "system" | "user"
  subject: string
  message: string
  recipients: string[]
  priority: "low" | "medium" | "high" | "critical"
  metadata?: Record<string, any>
}

export interface NotificationResult {
  success: boolean
  messageId?: string
  error?: string
}

class AdminNotificationService {
  async sendSecurityAlert(data: {
    subject: string
    message: string
    recipients: string[]
    metadata?: Record<string, any>
  }): Promise<NotificationResult> {
    try {
      const notificationData: NotificationData = {
        type: "security",
        subject: data.subject,
        message: data.message,
        recipients: data.recipients,
        priority: "critical",
        metadata: data.metadata,
      }

      return await this.sendNotification(notificationData)
    } catch (error) {
      console.error("Failed to send security alert:", error)
      return { success: false, error: "Failed to send security alert" }
    }
  }

  async sendAdminNotification(data: {
    subject: string
    message: string
    recipients: string[]
    priority?: "low" | "medium" | "high"
    metadata?: Record<string, any>
  }): Promise<NotificationResult> {
    try {
      const notificationData: NotificationData = {
        type: "admin",
        subject: data.subject,
        message: data.message,
        recipients: data.recipients,
        priority: data.priority || "medium",
        metadata: data.metadata,
      }

      return await this.sendNotification(notificationData)
    } catch (error) {
      console.error("Failed to send admin notification:", error)
      return { success: false, error: "Failed to send admin notification" }
    }
  }

  async sendSystemAlert(data: {
    subject: string
    message: string
    recipients: string[]
    metadata?: Record<string, any>
  }): Promise<NotificationResult> {
    try {
      const notificationData: NotificationData = {
        type: "system",
        subject: data.subject,
        message: data.message,
        recipients: data.recipients,
        priority: "high",
        metadata: data.metadata,
      }

      return await this.sendNotification(notificationData)
    } catch (error) {
      console.error("Failed to send system alert:", error)
      return { success: false, error: "Failed to send system alert" }
    }
  }

  private async sendNotification(data: NotificationData): Promise<NotificationResult> {
    try {
      // Log notification to database
      await this.logNotification(data)

      // Send email notification
      const emailResult = await this.sendEmailNotification(data)

      return emailResult
    } catch (error) {
      console.error("Failed to send notification:", error)
      return { success: false, error: "Failed to send notification" }
    }
  }

  private async logNotification(data: NotificationData): Promise<void> {
    try {
      const db = await connectToDatabase()
      const collection = db.collection("notification_history")

      await collection.insertOne({
        type: data.type,
        subject: data.subject,
        message: data.message,
        recipients: data.recipients,
        priority: data.priority,
        metadata: data.metadata,
        status: "pending",
        created_at: new Date(),
      })
    } catch (error) {
      console.error("Failed to log notification:", error)
    }
  }

  private async sendEmailNotification(data: NotificationData): Promise<NotificationResult> {
    try {
      // Mock email sending - replace with actual email service
      console.log("Sending email notification:", {
        subject: data.subject,
        recipients: data.recipients,
        type: data.type,
        priority: data.priority,
      })

      // Simulate email sending delay
      await new Promise((resolve) => setTimeout(resolve, 100))

      return {
        success: true,
        messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      }
    } catch (error) {
      console.error("Failed to send email:", error)
      return { success: false, error: "Failed to send email" }
    }
  }

  async getNotificationHistory(filters?: {
    type?: string
    status?: string
    startDate?: Date
    endDate?: Date
    limit?: number
    offset?: number
  }) {
    try {
      const db = await connectToDatabase()
      const collection = db.collection("notification_history")

      const query: any = {}

      if (filters?.type) query.type = filters.type
      if (filters?.status) query.status = filters.status
      if (filters?.startDate || filters?.endDate) {
        query.created_at = {}
        if (filters.startDate) query.created_at.$gte = filters.startDate
        if (filters.endDate) query.created_at.$lte = filters.endDate
      }

      const notifications = await collection
        .find(query)
        .sort({ created_at: -1 })
        .limit(filters?.limit || 50)
        .skip(filters?.offset || 0)
        .toArray()

      const total = await collection.countDocuments(query)

      return {
        notifications,
        total,
        hasMore: (filters?.offset || 0) + notifications.length < total,
      }
    } catch (error) {
      console.error("Failed to get notification history:", error)
      return { notifications: [], total: 0, hasMore: false }
    }
  }
}

// Create singleton instance
const adminNotificationService = new AdminNotificationService()

// Named exports
export { adminNotificationService, AdminNotificationService }

// Default export
export default adminNotificationService
