interface NotificationOptions {
  delay?: number
  maxAttempts?: number
}

class NotificationHelper {
  private baseUrl: string
  private authToken: string | null = null

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  }

  setAuthToken(token: string) {
    this.authToken = token
  }

  private async makeRequest(endpoint: string, data?: any, method = "POST") {
    if (!this.authToken) {
      throw new Error("Authentication token not set")
    }

    const response = await fetch(`${this.baseUrl}/api/notifications/${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.authToken}`,
      },
      body: data ? JSON.stringify(data) : undefined,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Request failed")
    }

    return response.json()
  }

  async sendProfileChangeNotification(
    userEmail: string,
    userName: string,
    changeType: string,
    changeDetails: string,
    ipAddress?: string,
    options?: NotificationOptions,
  ): Promise<string> {
    const data = {
      userEmail,
      userName,
      changeType,
      changeDetails,
      timestamp: new Date().toISOString(),
      ipAddress,
    }

    const result = await this.makeRequest("send", {
      type: "profile-change",
      data,
      options,
    })

    return result.jobId
  }

  async sendSecurityAlert(
    userEmail: string,
    userName: string,
    alertType: string,
    details: string,
    ipAddress?: string,
    location?: string,
    options?: NotificationOptions,
  ): Promise<string> {
    const data = {
      userEmail,
      userName,
      alertType,
      details,
      timestamp: new Date().toISOString(),
      ipAddress,
      location,
    }

    const result = await this.makeRequest("send", {
      type: "security-alert",
      data,
      options,
    })

    return result.jobId
  }

  async sendPasswordChangeNotification(
    userEmail: string,
    userName: string,
    ipAddress?: string,
    options?: NotificationOptions,
  ): Promise<string> {
    const data = {
      userEmail,
      userName,
      timestamp: new Date().toISOString(),
      ipAddress,
    }

    const result = await this.makeRequest("send", {
      type: "password-change",
      data,
      options,
    })

    return result.jobId
  }

  async sendTwoFactorStatusChange(
    userEmail: string,
    userName: string,
    enabled: boolean,
    options?: NotificationOptions,
  ): Promise<string> {
    const data = {
      userEmail,
      userName,
      enabled,
      timestamp: new Date().toISOString(),
    }

    const result = await this.makeRequest("send", {
      type: "two-factor-change",
      data,
      options,
    })

    return result.jobId
  }

  async sendApiKeyNotification(
    userEmail: string,
    userName: string,
    action: "created" | "deleted" | "updated",
    keyName: string,
    options?: NotificationOptions,
  ): Promise<string> {
    const data = {
      userEmail,
      userName,
      action,
      keyName,
      timestamp: new Date().toISOString(),
    }

    const result = await this.makeRequest("send", {
      type: "api-key-change",
      data,
      options,
    })

    return result.jobId
  }

  async getJobStatus(jobId: string) {
    return this.makeRequest(`status?jobId=${jobId}`, undefined, "GET")
  }

  async getQueueStats() {
    return this.makeRequest("status", undefined, "GET")
  }

  async retryFailedJobs() {
    return this.makeRequest("retry")
  }
}

export const notificationHelper = new NotificationHelper()
