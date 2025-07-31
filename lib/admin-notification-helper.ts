interface NotificationOptions {
  delay?: number
  maxAttempts?: number
}

class AdminNotificationHelper {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  }

  private async makeRequest(endpoint: string, data?: any, method = "POST") {
    const response = await fetch(`${this.baseUrl}/api/admin/notifications/${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include", // Include cookies for authentication
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Request failed")
    }

    return response.json()
  }

  async sendAdminActionNotification(
    adminEmail: string,
    adminName: string,
    targetUserEmail: string,
    targetUserName: string,
    action: string,
    actionDetails: string,
    metadata?: Record<string, any>,
    options?: NotificationOptions,
  ): Promise<string> {
    const data = {
      adminEmail,
      adminName,
      targetUserEmail,
      targetUserName,
      action,
      actionDetails,
      metadata,
    }

    const result = await this.makeRequest("send", {
      type: "admin-action",
      data,
      options,
    })

    return result.jobId
  }

  async sendSecurityAlert(
    alertType: string,
    severity: "low" | "medium" | "high" | "critical",
    description: string,
    affectedUsers?: number,
    ipAddress?: string,
    location?: string,
    metadata?: Record<string, any>,
    options?: NotificationOptions,
  ): Promise<string> {
    const data = {
      alertType,
      severity,
      description,
      affectedUsers,
      ipAddress,
      location,
      metadata,
    }

    const result = await this.makeRequest("send", {
      type: "security-alert",
      data,
      options,
    })

    return result.jobId
  }

  async sendSystemEvent(
    eventType: string,
    description: string,
    severity: "info" | "warning" | "error" | "critical",
    metadata?: Record<string, any>,
    options?: NotificationOptions,
  ): Promise<string> {
    const data = {
      eventType,
      description,
      severity,
      metadata,
    }

    const result = await this.makeRequest("send", {
      type: "system-event",
      data,
      options,
    })

    return result.jobId
  }

  async sendUserRegistrationAlert(
    userEmail: string,
    userName: string,
    ipAddress?: string,
    options?: NotificationOptions,
  ): Promise<string> {
    const data = {
      userEmail,
      userName,
      ipAddress,
    }

    const result = await this.makeRequest("send", {
      type: "user-registration",
      data,
      options,
    })

    return result.jobId
  }

  async sendFailedLoginAlert(
    email: string,
    attempts: number,
    ipAddress?: string,
    location?: string,
    options?: NotificationOptions,
  ): Promise<string> {
    const data = {
      email,
      attempts,
      ipAddress,
      location,
    }

    const result = await this.makeRequest("send", {
      type: "failed-login",
      data,
      options,
    })

    return result.jobId
  }

  async sendSuspiciousActivityAlert(
    description: string,
    userId?: string,
    ipAddress?: string,
    metadata?: Record<string, any>,
    options?: NotificationOptions,
  ): Promise<string> {
    const data = {
      description,
      userId,
      ipAddress,
      metadata,
    }

    const result = await this.makeRequest("send", {
      type: "suspicious-activity",
      data,
      options,
    })

    return result.jobId
  }

  async getNotificationSettings() {
    return this.makeRequest("settings", undefined, "GET")
  }

  async updateNotificationSettings(settings: {
    adminEmails?: string[]
    notifications?: Record<string, boolean>
    alertThresholds?: Record<string, number>
  }) {
    return this.makeRequest("settings", settings, "POST")
  }
}

export const adminNotificationHelper = new AdminNotificationHelper()
