export interface Signal {
  id: string
  symbol: string
  type: "BUY" | "SELL"
  strategy: string
  confidence: number
  entryPrice: number
  targetPrice: number
  stopLoss: number
  currentPrice: number
  pnl: number
  pnlPercentage: number
  status: "ACTIVE" | "COMPLETED" | "STOPPED"
  timeframe: string
  createdAt: string
  description: string
  aiAnalysis: string
  riskLevel: "LOW" | "MEDIUM" | "HIGH"
  exchange: string
}

export interface SignalFilters {
  search?: string
  filter?: string
  symbols?: string[]
  strategies?: string[]
  exchanges?: string[]
  timeframes?: string[]
  riskLevels?: string[]
  confidenceRange?: [number, number]
  pnlRange?: [number, number]
  status?: string
}

export class SignalsAPI {
  private baseUrl = "/api/signals"

  async getSignals(filters: SignalFilters = {}, limit = 20, offset = 0) {
    const params = new URLSearchParams()

    if (filters.search) params.append("search", filters.search)
    if (filters.filter) params.append("filter", filters.filter)
    params.append("limit", limit.toString())
    params.append("offset", offset.toString())

    const response = await fetch(`${this.baseUrl}?${params}`)
    if (!response.ok) {
      throw new Error("Failed to fetch signals")
    }

    return response.json()
  }

  async createSignal(signalData: Partial<Signal>) {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(signalData),
    })

    if (!response.ok) {
      throw new Error("Failed to create signal")
    }

    return response.json()
  }

  async updateSignal(id: string, updates: Partial<Signal>) {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      throw new Error("Failed to update signal")
    }

    return response.json()
  }

  async deleteSignal(id: string) {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error("Failed to delete signal")
    }

    return response.json()
  }

  async getSignalPerformance(timeframe = "7d") {
    const response = await fetch(`${this.baseUrl}/performance?timeframe=${timeframe}`)
    if (!response.ok) {
      throw new Error("Failed to fetch signal performance")
    }

    return response.json()
  }
}

export const signalsAPI = new SignalsAPI()
