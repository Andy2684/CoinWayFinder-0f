export interface ScreenerAlert {
  id: string
  name: string
  conditions: FilterCondition[]
  isActive: boolean
  createdAt: string
  lastTriggered?: string
  notificationMethod: "email" | "push" | "both"
}

export interface FilterCondition {
  field: string
  operator: "gt" | "lt" | "eq" | "between" | "in"
  value: any
  label: string
}

export class ScreenerAlertManager {
  private alerts: ScreenerAlert[] = []
  private subscribers: Set<(alerts: ScreenerAlert[]) => void> = new Set()

  constructor() {
    this.loadAlerts()
  }

  private loadAlerts(): void {
    try {
      const saved = localStorage.getItem("screener-alerts")
      if (saved) {
        this.alerts = JSON.parse(saved)
      }
    } catch (error) {
      console.error("Failed to load screener alerts:", error)
    }
  }

  private saveAlerts(): void {
    try {
      localStorage.setItem("screener-alerts", JSON.stringify(this.alerts))
      this.notifySubscribers()
    } catch (error) {
      console.error("Failed to save screener alerts:", error)
    }
  }

  private notifySubscribers(): void {
    this.subscribers.forEach((callback) => {
      try {
        callback([...this.alerts])
      } catch (error) {
        console.error("Error in alert subscriber callback:", error)
      }
    })
  }

  public createAlert(alert: Omit<ScreenerAlert, "id" | "createdAt">): string {
    const newAlert: ScreenerAlert = {
      ...alert,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    }

    this.alerts.push(newAlert)
    this.saveAlerts()
    return newAlert.id
  }

  public updateAlert(id: string, updates: Partial<ScreenerAlert>): boolean {
    const index = this.alerts.findIndex((alert) => alert.id === id)
    if (index === -1) return false

    this.alerts[index] = { ...this.alerts[index], ...updates }
    this.saveAlerts()
    return true
  }

  public deleteAlert(id: string): boolean {
    const index = this.alerts.findIndex((alert) => alert.id === id)
    if (index === -1) return false

    this.alerts.splice(index, 1)
    this.saveAlerts()
    return true
  }

  public getAlerts(): ScreenerAlert[] {
    return [...this.alerts]
  }

  public subscribe(callback: (alerts: ScreenerAlert[]) => void): () => void {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  public checkAlerts(assets: any[]): ScreenerAlert[] {
    const triggeredAlerts: ScreenerAlert[] = []

    for (const alert of this.alerts) {
      if (!alert.isActive) continue

      const matchingAssets = assets.filter((asset) => this.evaluateConditions(asset, alert.conditions))

      if (matchingAssets.length > 0) {
        triggeredAlerts.push(alert)
        // Update last triggered time
        this.updateAlert(alert.id, {
          lastTriggered: new Date().toISOString(),
        })
      }
    }

    return triggeredAlerts
  }

  private evaluateConditions(asset: any, conditions: FilterCondition[]): boolean {
    return conditions.every((condition) => {
      const value = asset[condition.field]

      switch (condition.operator) {
        case "gt":
          return value > condition.value
        case "lt":
          return value < condition.value
        case "eq":
          return value === condition.value
        case "between":
          return value >= condition.value[0] && value <= condition.value[1]
        case "in":
          return condition.value.includes(value)
        default:
          return false
      }
    })
  }
}

export const screenerAlertManager = new ScreenerAlertManager()

// Preset screener configurations
export const screenerPresets = {
  "breakout-candidates": {
    name: "Breakout Candidates",
    description: "Assets showing strong momentum with high volume",
    filters: {
      change24h: [5, 100],
      rsi: [60, 80],
      volume24h: [50, 10000],
    },
  },
  "oversold-bounce": {
    name: "Oversold Bounce",
    description: "Oversold assets with potential for reversal",
    filters: {
      rsi: [0, 30],
      change24h: [-50, 0],
      marketCap: [100, 100000],
    },
  },
  "high-momentum": {
    name: "High Momentum",
    description: "Assets with strong upward momentum",
    filters: {
      change24h: [10, 100],
      change7d: [15, 100],
      volume24h: [100, 10000],
    },
  },
  "value-picks": {
    name: "Value Picks",
    description: "Undervalued assets with strong fundamentals",
    filters: {
      marketCap: [100, 10000],
      roi: [100, 10000],
      beta: [0.5, 1.5],
    },
  },
  "defi-leaders": {
    name: "DeFi Leaders",
    description: "Top performing DeFi tokens",
    filters: {
      sectors: ["DeFi"],
      marketCap: [500, 100000],
      volume24h: [50, 10000],
    },
  },
  "layer1-chains": {
    name: "Layer 1 Blockchains",
    description: "Major blockchain platforms",
    filters: {
      sectors: ["Layer 1"],
      marketCap: [1000, 1000000],
      rank: [1, 50],
    },
  },
}

// Export functions for data analysis
export const analyzeScreenerResults = (assets: any[]) => {
  const analysis = {
    totalAssets: assets.length,
    sectors: {} as Record<string, number>,
    avgMarketCap: 0,
    avgVolume: 0,
    avgChange24h: 0,
    topGainers: [] as any[],
    topLosers: [] as any[],
    highestVolume: [] as any[],
    technicalSignals: {
      bullish: 0,
      bearish: 0,
      neutral: 0,
    },
  }

  if (assets.length === 0) return analysis

  // Calculate sector distribution
  assets.forEach((asset) => {
    analysis.sectors[asset.sector] = (analysis.sectors[asset.sector] || 0) + 1
  })

  // Calculate averages
  analysis.avgMarketCap = assets.reduce((sum, asset) => sum + asset.marketCap, 0) / assets.length
  analysis.avgVolume = assets.reduce((sum, asset) => sum + asset.volume24h, 0) / assets.length
  analysis.avgChange24h = assets.reduce((sum, asset) => sum + asset.change24h, 0) / assets.length

  // Get top performers
  const sortedByChange = [...assets].sort((a, b) => b.change24h - a.change24h)
  analysis.topGainers = sortedByChange.slice(0, 5)
  analysis.topLosers = sortedByChange.slice(-5).reverse()

  const sortedByVolume = [...assets].sort((a, b) => b.volume24h - a.volume24h)
  analysis.highestVolume = sortedByVolume.slice(0, 5)

  // Technical signals analysis
  assets.forEach((asset) => {
    if (asset.rsi > 70 || asset.change24h > 5) {
      analysis.technicalSignals.bullish++
    } else if (asset.rsi < 30 || asset.change24h < -5) {
      analysis.technicalSignals.bearish++
    } else {
      analysis.technicalSignals.neutral++
    }
  })

  return analysis
}
