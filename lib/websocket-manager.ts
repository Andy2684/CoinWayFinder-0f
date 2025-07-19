// WebSocket manager for real-time data connections

export interface WebSocketMessage {
  type: string
  data: any
  timestamp: number
}

export interface MarketDataUpdate {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  timestamp: number
}

export interface OrderBookUpdate {
  symbol: string
  bids: [number, number][]
  asks: [number, number][]
  timestamp: number
}

export interface TradeUpdate {
  id: string
  symbol: string
  side: "buy" | "sell"
  amount: number
  price: number
  timestamp: number
}

export class WebSocketManager {
  private static instance: WebSocketManager
  private connections: Map<string, WebSocket> = new Map()
  private subscribers: Map<string, Set<(data: any) => void>> = new Map()
  private reconnectAttempts: Map<string, number> = new Map()
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private heartbeatInterval: NodeJS.Timeout | null = null

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager()
    }
    return WebSocketManager.instance
  }

  // Subscribe to market data updates
  subscribeToMarketData(symbols: string[], callback: (data: MarketDataUpdate) => void): () => void {
    const channel = `market:${symbols.join(",")}`

    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set())
      this.connectToMarketData(symbols)
    }

    this.subscribers.get(channel)!.add(callback)

    // Return unsubscribe function
    return () => {
      const channelSubscribers = this.subscribers.get(channel)
      if (channelSubscribers) {
        channelSubscribers.delete(callback)
        if (channelSubscribers.size === 0) {
          this.subscribers.delete(channel)
          this.disconnect(channel)
        }
      }
    }
  }

  // Subscribe to order book updates
  subscribeToOrderBook(symbol: string, callback: (data: OrderBookUpdate) => void): () => void {
    const channel = `orderbook:${symbol}`

    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set())
      this.connectToOrderBook(symbol)
    }

    this.subscribers.get(channel)!.add(callback)

    return () => {
      const channelSubscribers = this.subscribers.get(channel)
      if (channelSubscribers) {
        channelSubscribers.delete(callback)
        if (channelSubscribers.size === 0) {
          this.subscribers.delete(channel)
          this.disconnect(channel)
        }
      }
    }
  }

  // Subscribe to trade updates
  subscribeToTrades(callback: (data: TradeUpdate) => void): () => void {
    const channel = "trades"

    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set())
      this.connectToTrades()
    }

    this.subscribers.get(channel)!.add(callback)

    return () => {
      const channelSubscribers = this.subscribers.get(channel)
      if (channelSubscribers) {
        channelSubscribers.delete(callback)
        if (channelSubscribers.size === 0) {
          this.subscribers.delete(channel)
          this.disconnect(channel)
        }
      }
    }
  }

  private connectToMarketData(symbols: string[]): void {
    const channel = `market:${symbols.join(",")}`

    try {
      // For demo purposes, we'll simulate WebSocket connection
      // In production, this would connect to actual exchange WebSocket APIs
      const ws = this.createMockWebSocket(channel, () => {
        // Simulate market data updates
        const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)]
        const basePrice = this.getBasePrice(randomSymbol)
        const change = (Math.random() - 0.5) * basePrice * 0.05

        return {
          type: "market_data",
          data: {
            symbol: randomSymbol,
            price: basePrice + change,
            change: change,
            changePercent: (change / basePrice) * 100,
            volume: Math.random() * 1000000,
            timestamp: Date.now(),
          } as MarketDataUpdate,
        }
      })

      this.connections.set(channel, ws)
      this.reconnectAttempts.set(channel, 0)
    } catch (error) {
      console.error(`Failed to connect to market data for ${channel}:`, error)
      this.handleReconnect(channel, () => this.connectToMarketData(symbols))
    }
  }

  private connectToOrderBook(symbol: string): void {
    const channel = `orderbook:${symbol}`

    try {
      const ws = this.createMockWebSocket(channel, () => {
        // Simulate order book updates
        const basePrice = this.getBasePrice(symbol)
        const bids: [number, number][] = []
        const asks: [number, number][] = []

        // Generate mock bids (below current price)
        for (let i = 0; i < 10; i++) {
          const price = basePrice - (i + 1) * (basePrice * 0.001)
          const amount = Math.random() * 100
          bids.push([price, amount])
        }

        // Generate mock asks (above current price)
        for (let i = 0; i < 10; i++) {
          const price = basePrice + (i + 1) * (basePrice * 0.001)
          const amount = Math.random() * 100
          asks.push([price, amount])
        }

        return {
          type: "orderbook",
          data: {
            symbol,
            bids,
            asks,
            timestamp: Date.now(),
          } as OrderBookUpdate,
        }
      })

      this.connections.set(channel, ws)
      this.reconnectAttempts.set(channel, 0)
    } catch (error) {
      console.error(`Failed to connect to order book for ${symbol}:`, error)
      this.handleReconnect(channel, () => this.connectToOrderBook(symbol))
    }
  }

  private connectToTrades(): void {
    const channel = "trades"

    try {
      const ws = this.createMockWebSocket(channel, () => {
        // Simulate trade updates
        const symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "ADAUSDT"]
        const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)]

        return {
          type: "trade",
          data: {
            id: Math.random().toString(36).substr(2, 9),
            symbol: randomSymbol,
            side: Math.random() > 0.5 ? "buy" : "sell",
            amount: Math.random() * 10,
            price: this.getBasePrice(randomSymbol),
            timestamp: Date.now(),
          } as TradeUpdate,
        }
      })

      this.connections.set(channel, ws)
      this.reconnectAttempts.set(channel, 0)
    } catch (error) {
      console.error(`Failed to connect to trades:`, error)
      this.handleReconnect(channel, () => this.connectToTrades())
    }
  }

  private createMockWebSocket(channel: string, dataGenerator: () => WebSocketMessage): WebSocket {
    // Create a mock WebSocket for demonstration
    // In production, this would be a real WebSocket connection
    const mockWs = {
      readyState: 1, // OPEN
      close: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
    } as unknown as WebSocket

    // Simulate periodic data updates
    const interval = setInterval(
      () => {
        if (this.subscribers.has(channel)) {
          const message = dataGenerator()
          const subscribers = this.subscribers.get(channel)
          if (subscribers) {
            subscribers.forEach((callback) => callback(message.data))
          }
        } else {
          clearInterval(interval)
        }
      },
      1000 + Math.random() * 2000,
    ) // Random interval between 1-3 seconds

    return mockWs
  }

  private getBasePrice(symbol: string): number {
    // Mock base prices for different symbols
    const basePrices: Record<string, number> = {
      BTCUSDT: 45000,
      ETHUSDT: 3000,
      BNBUSDT: 400,
      ADAUSDT: 0.5,
      SOLUSDT: 100,
      DOTUSDT: 8,
      LINKUSDT: 15,
      LTCUSDT: 100,
    }
    return basePrices[symbol] || 100
  }

  private handleReconnect(channel: string, reconnectFn: () => void): void {
    const attempts = this.reconnectAttempts.get(channel) || 0

    if (attempts < this.maxReconnectAttempts) {
      this.reconnectAttempts.set(channel, attempts + 1)
      const delay = this.reconnectDelay * Math.pow(2, attempts) // Exponential backoff

      setTimeout(() => {
        console.log(`Attempting to reconnect ${channel} (attempt ${attempts + 1})`)
        reconnectFn()
      }, delay)
    } else {
      console.error(`Max reconnection attempts reached for ${channel}`)
    }
  }

  private disconnect(channel: string): void {
    const connection = this.connections.get(channel)
    if (connection) {
      connection.close()
      this.connections.delete(channel)
    }
    this.reconnectAttempts.delete(channel)
  }

  // Disconnect all connections
  disconnectAll(): void {
    this.connections.forEach((ws, channel) => {
      ws.close()
    })
    this.connections.clear()
    this.subscribers.clear()
    this.reconnectAttempts.clear()

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  // Get connection status
  getConnectionStatus(channel: string): "connected" | "connecting" | "disconnected" {
    const connection = this.connections.get(channel)
    if (!connection) return "disconnected"

    switch (connection.readyState) {
      case WebSocket.CONNECTING:
        return "connecting"
      case WebSocket.OPEN:
        return "connected"
      default:
        return "disconnected"
    }
  }
}

// Export singleton instance
export const wsManager = WebSocketManager.getInstance()
