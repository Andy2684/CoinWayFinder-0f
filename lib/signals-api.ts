export interface Signal {
  id: string
  symbol: string
  type: 'BUY' | 'SELL'
  strategy: string
  exchange: string
  timeframe: string
  confidence: number
  entryPrice: number
  targetPrice: number
  stopLoss: number
  currentPrice: number
  pnl: number
  pnlPercentage: number
  progress: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  aiAnalysis: string
  createdAt: string
  status: 'ACTIVE' | 'COMPLETED' | 'STOPPED'
}

export interface SignalFilters {
  symbols?: string[]
  strategies?: string[]
  exchanges?: string[]
  timeframes?: string[]
  riskLevels?: string[]
  status?: string
  confidenceRange?: [number, number]
  pnlRange?: [number, number]
}

export interface SignalPerformance {
  totalPnl: number
  winRate: number
  totalSignals: number
  activeSignals: number
  avgReturn: number
  sharpeRatio: number
  maxDrawdown: number
  profitFactor: number
}

export interface AlertRule {
  id: string
  name: string
  condition: string
  symbol: string
  value: number
  operator: '>' | '<' | '=' | '>=' | '<='
  enabled: boolean
  channels: string[]
  createdAt: string
  triggeredAt?: string
  status: 'ACTIVE' | 'TRIGGERED' | 'PAUSED'
}

class SignalsAPI {
  private baseUrl = '/api/signals'

  async getSignals(filters?: SignalFilters): Promise<{ data: Signal[]; total: number }> {
    const params = new URLSearchParams()

    if (filters?.symbols?.length) {
      params.append('symbols', filters.symbols.join(','))
    }
    if (filters?.strategies?.length) {
      params.append('strategies', filters.strategies.join(','))
    }
    if (filters?.exchanges?.length) {
      params.append('exchanges', filters.exchanges.join(','))
    }
    if (filters?.status) {
      params.append('status', filters.status)
    }

    const response = await fetch(`${this.baseUrl}?${params}`)
    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error)
    }

    return { data: result.data, total: result.total }
  }

  async createSignal(signalData: Partial<Signal>): Promise<Signal> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signalData),
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error)
    }

    return result.data
  }

  async updateSignal(id: string, updates: Partial<Signal>): Promise<void> {
    const response = await fetch(this.baseUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, ...updates }),
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error)
    }
  }

  async deleteSignal(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}?id=${id}`, {
      method: 'DELETE',
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error)
    }
  }

  async getPerformance(): Promise<SignalPerformance> {
    const response = await fetch(`${this.baseUrl}/performance`)
    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error)
    }

    return result.data
  }

  async getAlerts(): Promise<AlertRule[]> {
    const response = await fetch(`${this.baseUrl}/alerts`)
    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error)
    }

    return result.data
  }

  async createAlert(alertData: Partial<AlertRule>): Promise<AlertRule> {
    const response = await fetch(`${this.baseUrl}/alerts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(alertData),
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error)
    }

    return result.data
  }

  async updateAlert(id: string, updates: Partial<AlertRule>): Promise<void> {
    const response = await fetch(`${this.baseUrl}/alerts`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, ...updates }),
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error)
    }
  }

  async deleteAlert(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/alerts?id=${id}`, {
      method: 'DELETE',
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error)
    }
  }

  // Utility functions
  calculateProgress(signal: Signal): number {
    const { entryPrice, targetPrice, currentPrice, type } = signal

    if (type === 'BUY') {
      const totalDistance = targetPrice - entryPrice
      const currentDistance = currentPrice - entryPrice
      return Math.max(0, Math.min(100, (currentDistance / totalDistance) * 100))
    } else {
      const totalDistance = entryPrice - targetPrice
      const currentDistance = entryPrice - currentPrice
      return Math.max(0, Math.min(100, (currentDistance / totalDistance) * 100))
    }
  }

  calculatePnL(signal: Signal): { pnl: number; pnlPercentage: number } {
    const { entryPrice, currentPrice, type } = signal

    let pnl: number
    if (type === 'BUY') {
      pnl = currentPrice - entryPrice
    } else {
      pnl = entryPrice - currentPrice
    }

    const pnlPercentage = (pnl / entryPrice) * 100

    return { pnl, pnlPercentage }
  }

  getRiskRewardRatio(signal: Signal): number {
    const { entryPrice, targetPrice, stopLoss, type } = signal

    let reward: number, risk: number

    if (type === 'BUY') {
      reward = targetPrice - entryPrice
      risk = entryPrice - stopLoss
    } else {
      reward = entryPrice - targetPrice
      risk = stopLoss - entryPrice
    }

    return reward / risk
  }

  formatPrice(price: number, decimals = 2): string {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  }

  formatPercentage(percentage: number, decimals = 2): string {
    const sign = percentage >= 0 ? '+' : ''
    return `${sign}${percentage.toFixed(decimals)}%`
  }

  getSignalStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-400 bg-green-400/10'
      case 'COMPLETED':
        return 'text-blue-400 bg-blue-400/10'
      case 'STOPPED':
        return 'text-red-400 bg-red-400/10'
      default:
        return 'text-gray-400 bg-gray-400/10'
    }
  }

  getRiskLevelColor(risk: string): string {
    switch (risk) {
      case 'LOW':
        return 'text-green-400 bg-green-400/10'
      case 'MEDIUM':
        return 'text-yellow-400 bg-yellow-400/10'
      case 'HIGH':
        return 'text-red-400 bg-red-400/10'
      default:
        return 'text-gray-400 bg-gray-400/10'
    }
  }
}

export const signalsAPI = new SignalsAPI()
