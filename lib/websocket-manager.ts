export interface WebSocketMessage {
  type: "price_update" | "order_book" | "trade" | "connection_status"
  symbol?: string
  data: any
  timestamp: number
}

export interface MarketData {
  symbol: string
  price: number
  change24h: number
  changePercent24h: number
  volume24h: number
  high24h: number
  low24h: number
  lastUpdate: number
}

export interface OrderBookEntry {
  price: number
  quantity: number
  total: number
}

export interface OrderBook {
  symbol: string
  bids: OrderBookEntry[]
  asks: OrderBookEntry[]
  lastUpdate: number
}

export interface Trade {
  id: string
  symbol: string
  price: number
  quantity: number
  side: "buy" | "sell"
  timestamp: number
}

export class WebSocketManager {
  private connections: Map<string, WebSocket> = new Map()
  private subscribers: Map<string, Set<(data: any) => void>> = new Map()
  private reconnectAttempts: Map<string, number> = new Map()
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  constructor() {
    // Initialize mock data streams
    this.startMockDataStreams()
  }

  private startMockDataStreams() {
    // Mock price updates
    setInterval(() => {
      const symbols = ["BTCUSDT", "ETHUSDT", "ADAUSDT", "SOLUSDT", "DOTUSDT"]
      symbols.forEach((symbol) => {
        const basePrice = this.getBasePrice(symbol)
        const price = basePrice + (Math.random() - 0.5) * basePrice * 0.02
        const change24h = (Math.random() - 0.5) * basePrice * 0.1

        this.notifySubscribers(`market_${symbol}`, {
          type: "price_update",
          symbol,
          data: {
            symbol,
            price,
            change24h,
            changePercent24h: (change24h / basePrice) * 100,
            volume24h: Math.random() * 1000000,
            high24h: price * 1.05,
            low24h: price * 0.95,
            lastUpdate: Date.now(),
          },
          timestamp: Date.now(),
        })
      })
    }, 2000)

    // Mock order book updates
    setInterval(() => {
      const symbols = ["BTCUSDT", "ETHUSDT"]
      symbols.forEach((symbol) => {
        const basePrice = this.getBasePrice(symbol)
        const bids = Array.from({ length: 10 }, (_, i) => ({
          price: basePrice - (i + 1) * 10,
          quantity: Math.random() * 10,
          total: 0,
        }))
        const asks = Array.from({ length: 10 }, (_, i) => ({
          price: basePrice + (i + 1) * 10,
          quantity: Math.random() * 10,
          total: 0,
        }))

        this.notifySubscribers(`orderbook_${symbol}`, {
          type: "order_book",
          symbol,
          data: { symbol, bids, asks, lastUpdate: Date.now() },
          timestamp: Date.now(),
        })
      })
    }, 1000)

    // Mock trades
    setInterval(() => {
      const symbols = ["BTCUSDT", "ETHUSDT", "ADAUSDT"]
      const symbol = symbols[Math.floor(Math.random() * symbols.length)]
      const basePrice = this.getBasePrice(symbol)

      this.notifySubscribers(`trades_${symbol}`, {
        type: "trade",
        symbol,
        data: {
          id: Math.random().toString(36).substr(2, 9),
          symbol,
          price: basePrice + (Math.random() - 0.5) * basePrice * 0.01,
          quantity: Math.random() * 5,
          side: Math.random() > 0.5 ? "buy" : "sell",
          timestamp: Date.now(),
        },
        timestamp: Date.now(),
      })
    }, 500)
  }

  private getBasePrice(symbol: string): number {
    const prices: Record<string, number> = {
      BTCUSDT: 43000,
      ETHUSDT: 2600,
      ADAUSDT: 0.45,
      SOLUSDT: 95,
      DOTUSDT: 7.5,
    }
    return prices[symbol] || 100
  }

  subscribe(channel: string, callback: (data: any) => void): () => void {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set())
    }

    this.subscribers.get(channel)!.add(callback)

    // Return unsubscribe function
    return () => {
      const channelSubscribers = this.subscribers.get(channel)
      if (channelSubscribers) {
        channelSubscribers.delete(callback)
        if (channelSubscribers.size === 0) {
          this.subscribers.delete(channel)
        }
      }
    }
  }

  private notifySubscribers(channel: string, data: any) {
    const channelSubscribers = this.subscribers.get(channel)
    if (channelSubscribers) {
      channelSubscribers.forEach((callback) => callback(data))
    }
  }

  getConnectionStatus(channel: string): "connected" | "connecting" | "disconnected" {
    return this.subscribers.has(channel) ? "connected" : "disconnected"
  }

  disconnect(channel: string) {
    this.subscribers.delete(channel)
  }

  disconnectAll() {
    this.subscribers.clear()
    this.connections.forEach((ws) => ws.close())
    this.connections.clear()
  }
}

export const wsManager = new WebSocketManager()
