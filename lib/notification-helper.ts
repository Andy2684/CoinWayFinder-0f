interface NotificationOptions {
  userEmail: string
  userName: string
  delay?: number
}

class NotificationHelper {
  private async sendNotification(type: string, data: any, options: NotificationOptions) {
    try {
      const response = await fetch("/api/notifications/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify({
          type,
          data: {
            ...data,
            userEmail: options.userEmail,
            userName: options.userName,
          },
          delay: options.delay || 0,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to send notification: ${response.statusText}`)
      }

      const result = await response.json()
      return result.jobId
    } catch (error) {
      console.error("Failed to send notification:", error)
      throw error
    }
  }

  async notifyProfileChange(changeType: string, changeDetails: string, options: NotificationOptions) {
    return await this.sendNotification(
      "profile_change",
      {
        changeType,
        changeDetails,
      },
      options,
    )
  }

  async notifySecurityAlert(alertType: string, details: string, options: NotificationOptions & { location?: string }) {
    return await this.sendNotification(
      "security_alert",
      {
        alertType,
        details,
        location: options.location,
      },
      options,
    )
  }

  async notifyPasswordChange(options: NotificationOptions) {
    return await this.sendNotification("password_change", {}, options)
  }

  async notifyTwoFactorChange(enabled: boolean, options: NotificationOptions) {
    return await this.sendNotification(
      "2fa_change",
      {
        enabled,
      },
      options,
    )
  }

  async notifyApiKeyChange(action: "created" | "deleted" | "updated", keyName: string, options: NotificationOptions) {
    return await this.sendNotification(
      "api_key_change",
      {
        action,
        keyName,
      },
      options,
    )
  }

  private getAuthToken(): string {
    // In a real app, this would get the token from localStorage, cookies, or context
    if (typeof window !== "undefined") {
      return localStorage.getItem("authToken") || ""
    }
    return ""
  }

  async getNotificationStatus(jobId: string) {
    try {
      const response = await fetch(`/api/notifications/status?jobId=${jobId}`, {
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to get notification status: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Failed to get notification status:", error)
      throw error
    }
  }

  async getQueueStatus() {
    try {
      const response = await fetch("/api/notifications/status", {
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to get queue status: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Failed to get queue status:", error)
      throw error
    }
  }

  async retryFailedNotifications() {
    try {
      const response = await fetch("/api/notifications/retry", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to retry notifications: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Failed to retry notifications:", error)
      throw error
    }
  }
}

export const notificationHelper = new NotificationHelper()
