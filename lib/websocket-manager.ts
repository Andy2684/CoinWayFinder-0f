export class WebSocketManager {
  private connections: Map<string, WebSocket> = new Map()
  private reconnectAttempts: Map<string, number> = new Map()
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  connect(url: string, onMessage: (data: any) => void, onError?: (error: Event) => void): string {
    const connectionId = `${url}_${Date.now()}`

    try {
      // For demo purposes, we'll simulate WebSocket connections
      // In production, you would use: new WebSocket(url)
      const mockConnection = this.createMockWebSocket(url, onMessage)
      this.connections.set(connectionId, mockConnection as any)

      return connectionId
    } catch (error) {
      console.error("WebSocket connection failed:", error)
      if (onError) onError(error as Event)
      return ""
    }
  }

  private createMockWebSocket(url: string, onMessage: (data: any) => void) {
    const mockWs = {
      readyState: 1, // OPEN
      close: () => {},
      send: () => {},
    }

    // Simulate real-time data based on URL
    if (url.includes("ticker")) {
      this.simulateTickerData(onMessage)
    } else if (url.includes("orderbook")) {
      this.simulateOrderBookData(onMessage)
    } else if (url.includes("trades")) {
      this.simulateTradeData(onMessage)
    }

    return mockWs
  }

  private simulateTickerData(onMessage: (data: any) => void) {
    const symbols = ["BTCUSDT", "ETHUSDT", "ADAUSDT", "DOTUSDT", "LINKUSDT"]
    const basePrice = { BTCUSDT: 43000, ETHUSDT: 2600, ADAUSDT: 0.45, DOTUSDT: 7.2, LINKUSDT: 15.8 }

    setInterval(() => {
      const symbol = symbols[Math.floor(Math.random() * symbols.length)]
      const price = basePrice[symbol as keyof typeof basePrice] * (1 + (Math.random() - 0.5) * 0.02)
      const change24h = (Math.random() - 0.5) * 10

      onMessage({
        symbol,
        price: price.toFixed(symbol === "BTCUSDT" || symbol === "ETHUSDT" ? 2 : 4),
        change24h: change24h.toFixed(2),
        volume: (Math.random() * 1000000).toFixed(0),
      })
    }, 2000)
  }

  private simulateOrderBookData(onMessage: (data: any) => void) {
    setInterval(() => {
      const bids = Array.from({ length: 10 }, (_, i) => ({
        price: (43000 - i * 10).toFixed(2),
        quantity: (Math.random() * 5).toFixed(4),
      }))

      const asks = Array.from({ length: 10 }, (_, i) => ({
        price: (43010 + i * 10).toFixed(2),
        quantity: (Math.random() * 5).toFixed(4),
      }))

      onMessage({
        symbol: "BTCUSDT",
        bids,
        asks,
        timestamp: Date.now(),
      })
    }, 1000)
  }

  private simulateTradeData(onMessage: (data: any) => void) {
    setInterval(() => {
      const symbols = ["BTCUSDT", "ETHUSDT", "ADAUSDT"]
      const symbol = symbols[Math.floor(Math.random() * symbols.length)]
      const isBuy = Math.random() > 0.5

      onMessage({
        symbol,
        price: (43000 + (Math.random() - 0.5) * 1000).toFixed(2),
        quantity: (Math.random() * 2).toFixed(4),
        side: isBuy ? "BUY" : "SELL",
        timestamp: Date.now(),
      })
    }, 3000)
  }

  disconnect(connectionId: string) {
    const connection = this.connections.get(connectionId)
    if (connection) {
      connection.close()
      this.connections.delete(connectionId)
      this.reconnectAttempts.delete(connectionId)
    }
  }

  disconnectAll() {
    this.connections.forEach((connection, id) => {
      connection.close()
    })
    this.connections.clear()
    this.reconnectAttempts.clear()
  }
}

export const wsManager = new WebSocketManager()
