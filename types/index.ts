export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  username?: string
  role: "user" | "admin"
  isEmailVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface TradingSignal {
  id: string
  symbol: string
  type: "buy" | "sell"
  price: number
  confidence: number
  timestamp: string
  status: "active" | "executed" | "expired"
  description: string
}

export interface TradingBot {
  id: string
  name: string
  strategy: string
  status: "active" | "paused" | "stopped"
  profit: number
  trades: number
  createdAt: string
}

export interface MarketData {
  symbol: string
  price: number
  change24h: number
  volume: number
  marketCap: number
}

export interface NewsItem {
  id: string
  title: string
  content: string
  source: string
  sentiment: "positive" | "negative" | "neutral"
  timestamp: string
  url?: string
}
