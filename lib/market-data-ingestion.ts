// Real-time market data ingestion system

export interface MarketDataPoint {
  symbol: string
  exchange: string
  timestamp: number
  price: number
  volume: number
  high24h: number
  low24h: number
  change24h: number
  bid: number
  ask: number
  fundingRate?: number
  openInterest?: number
  liquidations?: number
}

export interface OrderBookData {
  symbol: string
  exchange: string
  timestamp: number
  bids: [number, number][] // [price, quantity]
  asks: [number, number][]
}

export interface TradeData {
  symbol: string
  exchange: string
  timestamp: number
  price: number
  quantity: number
  side: "buy" | "sell"
  tradeId: string
}

export class MarketDataIngestion {
  private subscribers: Map<string, Set<(data: MarketDataPoint) => void>> = new Map()
  private orderBookSubscribers: Map<string, Set<(data: OrderBookData) => void>> = new Map()
  private tradeSubscribers: Map<string, Set<(data: TradeData) => void>> = new Map()
  private connections: Map<string, WebSocket> = new Map()
  private reconnectAttempts: Map<string, number> = new Map()
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  constructor() {
    this.initializeConnections()
  }

  private initializeConnections(): void {
    const exchanges = [
      {
        id: "binance",
        wsUrl: "wss://stream.binance.com:9443/ws/!ticker@arr",
        type: "ticker",
      },
      {
        id: "bybit",
        wsUrl: "wss://stream.bybit.com/v5/public/spot",
        type: "ticker",
      },
      {
        id: "okx",
        wsUrl: "wss://ws.okx.com:8443/ws/v5/public",
        type: "ticker",
      },
    ]

    exchanges.forEach((exchange) => {
      this.connectToExchange(exchange.id, exchange.wsUrl, exchange.type)
    })
  }

  private connectToExchange(exchangeId: string, wsUrl: string, type: string): void {
    try {
      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        console.log(`Connected to ${exchangeId} ${type} stream`)
        this.reconnectAttempts.set(exchangeId, 0)

        // Send subscription messages based on exchange
        this.sendSubscriptionMessage(ws, exchangeId, type)
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.processMessage(exchangeId, data, type)
        } catch (error) {
          console.error(`Error parsing message from ${exchangeId}:`, error)
        }
      }

      ws.onclose = () => {
        console.log(`Disconnected from ${exchangeId} ${type} stream`)
        this.handleReconnection(exchangeId, wsUrl, type)
      }

      ws.onerror = (error) => {
        console.error(`WebSocket error for ${exchangeId}:`, error)
      }

      this.connections.set(`${exchangeId}_${type}`, ws)
    } catch (error) {
      console.error(`Failed to connect to ${exchangeId}:`, error)
      this.handleReconnection(exchangeId, wsUrl, type)
    }
  }

  private sendSubscriptionMessage(ws: WebSocket, exchangeId: string, type: string): void {
    switch (exchangeId) {
      case "binance":
        // Binance automatically sends all tickers
        break
      case "bybit":
        ws.send(
          JSON.stringify({
            op: "subscribe",
            args: ["tickers.BTC-USDT", "tickers.ETH-USDT", "tickers.SOL-USDT"],
          }),
        )
        break
      case "okx":
        ws.send(
          JSON.stringify({
            op: "subscribe",
            args: [
              { channel: "tickers", instId: "BTC-USDT" },
              { channel: "tickers", instId: "ETH-USDT" },
              { channel: "tickers", instId: "SOL-USDT" },
            ],
          }),
        )
        break
    }
  }

  private processMessage(exchangeId: string, data: any, type: string): void {
    switch (exchangeId) {
      case "binance":
        this.processBinanceData(data)
        break
      case "bybit":
        this.processBybitData(data)
        break
      case "okx":
        this.processOKXData(data)
        break
    }
  }

  private processBinanceData(data: any): void {
    if (Array.isArray(data)) {
      // Multiple tickers
      data.forEach((ticker) => this.processBinanceTicker(ticker))
    } else if (data.e === "24hrTicker") {
      // Single ticker
      this.processBinanceTicker(data)
    }
  }

  private processBinanceTicker(ticker: any): void {
    const marketData: MarketDataPoint = {
      symbol: ticker.s,
      exchange: "binance",
      timestamp: Date.now(),
      price: Number.parseFloat(ticker.c),
      volume: Number.parseFloat(ticker.v),
      high24h: Number.parseFloat(ticker.h),
      low24h: Number.parseFloat(ticker.l),
      change24h: Number.parseFloat(ticker.P),
      bid: Number.parseFloat(ticker.b),
      ask: Number.parseFloat(ticker.a),
    }

    this.notifySubscribers(ticker.s, marketData)
  }

  private processBybitData(data: any): void {
    if (data.topic && data.topic.includes("tickers")) {
      const ticker = data.data
      const marketData: MarketDataPoint = {
        symbol: ticker.symbol,
        exchange: "bybit",
        timestamp: Date.now(),
        price: Number.parseFloat(ticker.lastPrice),
        volume: Number.parseFloat(ticker.volume24h),
        high24h: Number.parseFloat(ticker.highPrice24h),
        low24h: Number.parseFloat(ticker.lowPrice24h),
        change24h: Number.parseFloat(ticker.price24hPcnt) * 100,
        bid: Number.parseFloat(ticker.bid1Price),
        ask: Number.parseFloat(ticker.ask1Price),
      }

      this.notifySubscribers(ticker.symbol, marketData)
    }
  }

  private processOKXData(data: any): void {
    if (data.arg && data.arg.channel === "tickers" && data.data) {
      data.data.forEach((ticker: any) => {
        const marketData: MarketDataPoint = {
          symbol: ticker.instId,
          exchange: "okx",
          timestamp: Date.now(),
          price: Number.parseFloat(ticker.last),
          volume: Number.parseFloat(ticker.vol24h),
          high24h: Number.parseFloat(ticker.high24h),
          low24h: Number.parseFloat(ticker.low24h),
          change24h: Number.parseFloat(ticker.chgUtc) * 100,
          bid: Number.parseFloat(ticker.bidPx),
          ask: Number.parseFloat(ticker.askPx),
        }

        this.notifySubscribers(ticker.instId, marketData)
      })
    }
  }

  private notifySubscribers(symbol: string, data: MarketDataPoint): void {
    const symbolSubscribers = this.subscribers.get(symbol)
    if (symbolSubscribers) {
      symbolSubscribers.forEach((callback) => {
        try {
          callback(data)
        } catch (error) {
          console.error("Error in subscriber callback:", error)
        }
      })
    }

    // Also notify wildcard subscribers
    const wildcardSubscribers = this.subscribers.get("*")
    if (wildcardSubscribers) {
      wildcardSubscribers.forEach((callback) => {
        try {
          callback(data)
        } catch (error) {
          console.error("Error in wildcard subscriber callback:", error)
        }
      })
    }
  }

  private handleReconnection(exchangeId: string, wsUrl: string, type: string): void {
    const key = `${exchangeId}_${type}`
    const attempts = this.reconnectAttempts.get(exchangeId) || 0

    if (attempts < this.maxReconnectAttempts) {
      this.reconnectAttempts.set(exchangeId, attempts + 1)

      setTimeout(() => {
        console.log(`Attempting to reconnect to ${exchangeId} (attempt ${attempts + 1})`)
        this.connectToExchange(exchangeId, wsUrl, type)
      }, this.reconnectDelay * Math.pow(2, attempts)) // Exponential backoff
    } else {
      console.error(`Max reconnection attempts reached for ${exchangeId}`)
    }
  }

  public subscribe(symbol: string, callback: (data: MarketDataPoint) => void): () => void {
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, new Set())
    }

    this.subscribers.get(symbol)!.add(callback)

    // Return unsubscribe function
    return () => {
      const symbolSubscribers = this.subscribers.get(symbol)
      if (symbolSubscribers) {
        symbolSubscribers.delete(callback)
        if (symbolSubscribers.size === 0) {
          this.subscribers.delete(symbol)
        }
      }
    }
  }

  public subscribeToOrderBook(symbol: string, callback: (data: OrderBookData) => void): () => void {
    if (!this.orderBookSubscribers.has(symbol)) {
      this.orderBookSubscribers.set(symbol, new Set())
    }

    this.orderBookSubscribers.get(symbol)!.add(callback)

    return () => {
      const symbolSubscribers = this.orderBookSubscribers.get(symbol)
      if (symbolSubscribers) {
        symbolSubscribers.delete(callback)
        if (symbolSubscribers.size === 0) {
          this.orderBookSubscribers.delete(symbol)
        }
      }
    }
  }

  public getConnectionStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {}

    this.connections.forEach((ws, key) => {
      status[key] = ws.readyState === WebSocket.OPEN
    })

    return status
  }

  public disconnect(): void {
    this.connections.forEach((ws, key) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
    })

    this.connections.clear()
    this.subscribers.clear()
    this.orderBookSubscribers.clear()
    this.tradeSubscribers.clear()
  }

  // Add these methods to support chart data
  public getHistoricalData(symbol: string, timeframe = "1h", limit = 100): Promise<MarketDataPoint[]> {
    // Simulate historical data - in production, this would fetch from an API
    return new Promise((resolve) => {
      const data: MarketDataPoint[] = []
      const now = Date.now()
      const intervalMs = this.getIntervalMs(timeframe)

      for (let i = limit; i >= 0; i--) {
        const timestamp = now - i * intervalMs
        const basePrice = 67000 + (Math.random() - 0.5) * 10000

        data.push({
          symbol,
          exchange: "aggregated",
          timestamp,
          price: basePrice,
          volume: Math.random() * 1000000 + 100000,
          high24h: basePrice * 1.02,
          low24h: basePrice * 0.98,
          change24h: (Math.random() - 0.5) * 10,
          bid: basePrice * 0.999,
          ask: basePrice * 1.001,
        })
      }

      resolve(data)
    })
  }

  private getIntervalMs(timeframe: string): number {
    switch (timeframe) {
      case "1m":
        return 60 * 1000
      case "5m":
        return 5 * 60 * 1000
      case "15m":
        return 15 * 60 * 1000
      case "1h":
        return 60 * 60 * 1000
      case "4h":
        return 4 * 60 * 60 * 1000
      case "1d":
        return 24 * 60 * 60 * 1000
      default:
        return 60 * 60 * 1000
    }
  }

  public getMarketOverview(): Promise<any[]> {
    // Simulate market overview data
    return new Promise((resolve) => {
      const markets = [
        "BTC/USDT",
        "ETH/USDT",
        "SOL/USDT",
        "ADA/USDT",
        "MATIC/USDT",
        "AVAX/USDT",
        "DOT/USDT",
        "LINK/USDT",
        "UNI/USDT",
        "AAVE/USDT",
      ]

      const data = markets.map((symbol) => ({
        symbol,
        price: Math.random() * 1000 + 1,
        change24h: (Math.random() - 0.5) * 20,
        volume24h: Math.random() * 1000000000 + 100000000,
        high24h: 0,
        low24h: 0,
        marketCap: Math.random() * 100000000000 + 1000000000,
      }))

      resolve(data)
    })
  }

  // Enhanced subscription with historical data
  public subscribeWithHistory(
    symbol: string,
    callback: (data: MarketDataPoint) => void,
    timeframe = "1h",
  ): Promise<() => void> {
    return new Promise((resolve) => {
      // First, get historical data
      this.getHistoricalData(symbol, timeframe).then((historicalData) => {
        // Send historical data first
        historicalData.forEach((data) => callback(data))

        // Then subscribe to real-time updates
        const unsubscribe = this.subscribe(symbol, callback)
        resolve(unsubscribe)
      })
    })
  }
}

// Singleton instance
export const marketDataIngestion = new MarketDataIngestion()
