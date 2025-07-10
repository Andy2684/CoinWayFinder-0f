import { simpleHash, generateRandomString } from "./security"

class SecurityMonitor {
  private apiKey: string
  private sessionId: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
    this.sessionId = generateRandomString(16)
  }

  async logEvent(event: string, data: any): Promise<void> {
    const timestamp = new Date().toISOString()
    const eventData = {
      apiKey: this.apiKey,
      sessionId: this.sessionId,
      event,
      data,
      timestamp,
    }

    const payload = JSON.stringify(eventData)
    const hash = await simpleHash(payload)
    const signature = hash // In a real system, this would be a more robust signature

    try {
      // Simulate sending data to a security monitoring service
      console.log(`Sending event: ${event} with signature: ${signature}`)
      // In a real implementation, you would send this data to a server
      // using fetch or another HTTP client.
    } catch (error) {
      console.error("Failed to log event:", error)
    }
  }
}

export default SecurityMonitor
