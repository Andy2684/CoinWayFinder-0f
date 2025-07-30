// Advanced price alert system with multiple trigger types

export interface PriceAlert {
  id: string
  userId: string
  symbol: string
  exchange: string
  type:
    | "price_above"
    | "price_below"
    | "price_change"
    | "volume_spike"
    | "rsi_oversold"
    | "rsi_overbought"
    | "macd_cross"
  condition: {
    value: number
    percentage?: number
    timeframe?: string
  }
  isActive: boolean
  isTriggered: boolean
  createdAt: number
  triggeredAt?: number
  message: string
  notificationMethods: ("email" | "push" | "sms")[]
  metadata?: Record<string, any>
}

export interface AlertTriggerEvent {
  alertId: string
  symbol: string
  exchange: string
  triggerType: string
  currentValue: number
  targetValue: number
  timestamp: number
  message: string
}

export class PriceAlertManager {
  private static instance: PriceAlertManager
  private alerts: Map<string, PriceAlert> = new Map()
  private subscribers: Map<string, ((event: AlertTriggerEvent) => void)[]> = new Map()
  private monitoringInterval: NodeJS.Timeout | null = null
  private isMonitoring = false

  static getInstance(): PriceAlertManager {
    if (!PriceAlertManager.instance) {
      PriceAlertManager.instance = new PriceAlertManager()
    }
    return PriceAlertManager.instance
  }

  // Create a new price alert
  createAlert(alert: Omit<PriceAlert, "id" | "createdAt" | "isTriggered">): string {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const newAlert: PriceAlert = {
      ...alert,
      id: alertId,
      createdAt: Date.now(),
      isTriggered: false,
    }

    this.alerts.set(alertId, newAlert)

    // Start monitoring if not already running
    if (!this.isMonitoring) {
      this.startMonitoring()
    }

    return alertId
  }

  // Update an existing alert
  updateAlert(alertId: string, updates: Partial<PriceAlert>): boolean {
    const alert = this.alerts.get(alertId)
    if (!alert) return false

    const updatedAlert = { ...alert, ...updates }
    this.alerts.set(alertId, updatedAlert)
    return true
  }

  // Delete an alert
  deleteAlert(alertId: string): boolean {
    return this.alerts.delete(alertId)
  }

  // Get alert by ID
  getAlert(alertId: string): PriceAlert | undefined {
    return this.alerts.get(alertId)
  }

  // Get all alerts for a user
  getUserAlerts(userId: string): PriceAlert[] {
    return Array.from(this.alerts.values()).filter((alert) => alert.userId === userId)
  }

  // Get active alerts for a symbol
  getSymbolAlerts(symbol: string, exchange?: string): PriceAlert[] {
    return Array.from(this.alerts.values()).filter(
      (alert) =>
        alert.symbol === symbol &&
        alert.isActive &&
        !alert.isTriggered &&
        (exchange ? alert.exchange === exchange : true),
    )
  }

  // Subscribe to alert triggers
  subscribe(userId: string, callback: (event: AlertTriggerEvent) => void): void {
    if (!this.subscribers.has(userId)) {
      this.subscribers.set(userId, [])
    }
    this.subscribers.get(userId)!.push(callback)
  }

  // Unsubscribe from alert triggers
  unsubscribe(userId: string, callback: (event: AlertTriggerEvent) => void): void {
    const userSubscribers = this.subscribers.get(userId)
    if (userSubscribers) {
      const index = userSubscribers.indexOf(callback)
      if (index > -1) {
        userSubscribers.splice(index, 1)
      }
    }
  }

  // Start monitoring alerts
  private startMonitoring(): void {
    if (this.isMonitoring) return

    this.isMonitoring = true
    this.monitoringInterval = setInterval(async () => {
      await this.checkAlerts()
    }, 5000) // Check every 5 seconds
  }

  // Stop monitoring alerts
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }
    this.isMonitoring = false
  }

  // Check all active alerts
  private async checkAlerts(): Promise<void> {
    const activeAlerts = Array.from(this.alerts.values()).filter((alert) => alert.isActive && !alert.isTriggered)

    for (const alert of activeAlerts) {
      try {
        await this.checkAlert(alert)
      } catch (error) {
        console.error(`Error checking alert ${alert.id}:`, error)
      }
    }
  }

  // Check individual alert
  private async checkAlert(alert: PriceAlert): Promise<void> {
    const marketData = await this.getMarketData(alert.symbol, alert.exchange)
    if (!marketData) return

    let isTriggered = false
    let triggerMessage = ""

    switch (alert.type) {
      case "price_above":
        isTriggered = marketData.price >= alert.condition.value
        triggerMessage = `${alert.symbol} price (${marketData.price}) is above ${alert.condition.value}`
        break

      case "price_below":
        isTriggered = marketData.price <= alert.condition.value
        triggerMessage = `${alert.symbol} price (${marketData.price}) is below ${alert.condition.value}`
        break

      case "price_change":
        const changePercent = Math.abs(marketData.changePercent)
        isTriggered = changePercent >= (alert.condition.percentage || 5)
        triggerMessage = `${alert.symbol} price changed by ${changePercent.toFixed(2)}%`
        break

      case "volume_spike":
        const avgVolume = await this.getAverageVolume(alert.symbol, alert.exchange)
        const volumeRatio = marketData.volume / avgVolume
        isTriggered = volumeRatio >= (alert.condition.value || 2)
        triggerMessage = `${alert.symbol} volume spike: ${volumeRatio.toFixed(2)}x average`
        break

      case "rsi_oversold":
        const rsiLow = await this.getRSI(alert.symbol, alert.exchange)
        isTriggered = rsiLow <= (alert.condition.value || 30)
        triggerMessage = `${alert.symbol} RSI oversold: ${rsiLow.toFixed(2)}`
        break

      case "rsi_overbought":
        const rsiHigh = await this.getRSI(alert.symbol, alert.exchange)
        isTriggered = rsiHigh >= (alert.condition.value || 70)
        triggerMessage = `${alert.symbol} RSI overbought: ${rsiHigh.toFixed(2)}`
        break

      case "macd_cross":
        const macdSignal = await this.getMACDSignal(alert.symbol, alert.exchange)
        isTriggered = macdSignal === (alert.condition.value > 0 ? "bullish" : "bearish")
        triggerMessage = `${alert.symbol} MACD ${macdSignal} crossover detected`
        break
    }

    if (isTriggered) {
      await this.triggerAlert(alert, {
        alertId: alert.id,
        symbol: alert.symbol,
        exchange: alert.exchange,
        triggerType: alert.type,
        currentValue: marketData.price,
        targetValue: alert.condition.value,
        timestamp: Date.now(),
        message: triggerMessage,
      })
    }
  }

  // Trigger an alert
  private async triggerAlert(alert: PriceAlert, event: AlertTriggerEvent): Promise<void> {
    // Mark alert as triggered
    alert.isTriggered = true
    alert.triggeredAt = Date.now()
    this.alerts.set(alert.id, alert)

    // Notify subscribers
    const userSubscribers = this.subscribers.get(alert.userId)
    if (userSubscribers) {
      userSubscribers.forEach((callback) => callback(event))
    }

    // Send notifications
    await this.sendNotifications(alert, event)

    console.log(`Alert triggered: ${event.message}`)
  }

  // Send notifications
  private async sendNotifications(alert: PriceAlert, event: AlertTriggerEvent): Promise<void> {
    for (const method of alert.notificationMethods) {
      try {
        switch (method) {
          case "email":
            await this.sendEmailNotification(alert, event)
            break
          case "push":
            await this.sendPushNotification(alert, event)
            break
          case "sms":
            await this.sendSMSNotification(alert, event)
            break
        }
      } catch (error) {
        console.error(`Failed to send ${method} notification:`, error)
      }
    }
  }

  // Send email notification
  private async sendEmailNotification(alert: PriceAlert, event: AlertTriggerEvent): Promise<void> {
    // Implementation would integrate with email service
    console.log(`Email notification sent for alert ${alert.id}`)
  }

  // Send push notification
  private async sendPushNotification(alert: PriceAlert, event: AlertTriggerEvent): Promise<void> {
    // Implementation would integrate with push notification service
    console.log(`Push notification sent for alert ${alert.id}`)
  }

  // Send SMS notification
  private async sendSMSNotification(alert: PriceAlert, event: AlertTriggerEvent): Promise<void> {
    // Implementation would integrate with SMS service
    console.log(`SMS notification sent for alert ${alert.id}`)
  }

  // Get market data (mock implementation)
  private async getMarketData(symbol: string, exchange: string): Promise<any> {
    // Mock market data
    return {
      price: 45000 + Math.random() * 10000,
      changePercent: (Math.random() - 0.5) * 20,
      volume: 1000000 + Math.random() * 5000000,
    }
  }

  // Get average volume (mock implementation)
  private async getAverageVolume(symbol: string, exchange: string): Promise<number> {
    return 2000000 + Math.random() * 1000000
  }

  // Get RSI (mock implementation)
  private async getRSI(symbol: string, exchange: string): Promise<number> {
    return 30 + Math.random() * 40
  }

  // Get MACD signal (mock implementation)
  private async getMACDSignal(symbol: string, exchange: string): Promise<"bullish" | "bearish" | "neutral"> {
    const signals = ["bullish", "bearish", "neutral"] as const
    return signals[Math.floor(Math.random() * signals.length)]
  }

  // Get alert statistics
  getAlertStats(): {
    total: number
    active: number
    triggered: number
    byType: Record<string, number>
  } {
    const alerts = Array.from(this.alerts.values())
    const byType: Record<string, number> = {}

    alerts.forEach((alert) => {
      byType[alert.type] = (byType[alert.type] || 0) + 1
    })

    return {
      total: alerts.length,
      active: alerts.filter((a) => a.isActive && !a.isTriggered).length,
      triggered: alerts.filter((a) => a.isTriggered).length,
      byType,
    }
  }

  // Bulk operations
  createBulkAlerts(alerts: Omit<PriceAlert, "id" | "createdAt" | "isTriggered">[]): string[] {
    return alerts.map((alert) => this.createAlert(alert))
  }

  deleteBulkAlerts(alertIds: string[]): number {
    let deleted = 0
    alertIds.forEach((id) => {
      if (this.deleteAlert(id)) deleted++
    })
    return deleted
  }

  // Export/Import alerts
  exportAlerts(userId: string): PriceAlert[] {
    return this.getUserAlerts(userId)
  }

  importAlerts(alerts: PriceAlert[]): number {
    let imported = 0
    alerts.forEach((alert) => {
      this.alerts.set(alert.id, alert)
      imported++
    })
    return imported
  }
}

// Export singleton instance
export const priceAlertManager = PriceAlertManager.getInstance()
