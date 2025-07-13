// Exchange-specific adapters for unified API interface

export interface ExchangeAdapter {
  id: string
  name: string
  authenticate(credentials: any): Promise<boolean>
  getBalance(): Promise<any>
  getOrderBook(symbol: string): Promise<any>
  placeLimitOrder(symbol: string, side: "buy" | "sell", amount: number, price: number): Promise<any>
  placeMarketOrder(symbol: string, side: "buy" | "sell", amount: number): Promise<any>
  cancelOrder(orderId: string): Promise<any>
  getOpenOrders(): Promise<any>
  getTradeHistory(): Promise<any>
  subscribeToTicker(symbol: string, callback: (data: any) => void): void
  subscribeToOrderBook(symbol: string, callback: (data: any) => void): void
  getRateLimit(): { requests: number; window: number; remaining: number }
}

export class BinanceAdapter implements ExchangeAdapter {
  id = "binance"
  name = "Binance"
  private apiKey = ""
  private secretKey = ""
  private baseUrl = "https://api.binance.com"
  private wsUrl = "wss://stream.binance.com:9443/ws"

  async authenticate(credentials: { apiKey: string; secretKey: string }): Promise<boolean> {
    this.apiKey = credentials.apiKey
    this.secretKey = credentials.secretKey

    try {
      const response = await this.makeRequest("GET", "/api/v3/account")
      return response.ok
    } catch (error) {
      return false
    }
  }

  async getBalance(): Promise<any> {
    return this.makeRequest("GET", "/api/v3/account")
  }

  async getOrderBook(symbol: string): Promise<any> {
    return this.makeRequest("GET", `/api/v3/depth?symbol=${symbol}&limit=100`)
  }

  async placeLimitOrder(symbol: string, side: "buy" | "sell", amount: number, price: number): Promise<any> {
    const params = {
      symbol,
      side: side.toUpperCase(),
      type: "LIMIT",
      timeInForce: "GTC",
      quantity: amount.toString(),
      price: price.toString(),
      timestamp: Date.now().toString(),
    }

    return this.makeRequest("POST", "/api/v3/order", params)
  }

  async placeMarketOrder(symbol: string, side: "buy" | "sell", amount: number): Promise<any> {
    const params = {
      symbol,
      side: side.toUpperCase(),
      type: "MARKET",
      quantity: amount.toString(),
      timestamp: Date.now().toString(),
    }

    return this.makeRequest("POST", "/api/v3/order", params)
  }

  async cancelOrder(orderId: string): Promise<any> {
    const params = {
      orderId,
      timestamp: Date.now().toString(),
    }

    return this.makeRequest("DELETE", "/api/v3/order", params)
  }

  async getOpenOrders(): Promise<any> {
    return this.makeRequest("GET", "/api/v3/openOrders")
  }

  async getTradeHistory(): Promise<any> {
    return this.makeRequest("GET", "/api/v3/myTrades")
  }

  subscribeToTicker(symbol: string, callback: (data: any) => void): void {
    const ws = new WebSocket(`${this.wsUrl}/${symbol.toLowerCase()}@ticker`)
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      callback(this.normalizeTicker(data))
    }
  }

  subscribeToOrderBook(symbol: string, callback: (data: any) => void): void {
    const ws = new WebSocket(`${this.wsUrl}/${symbol.toLowerCase()}@depth`)
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      callback(this.normalizeOrderBook(data))
    }
  }

  getRateLimit(): { requests: number; window: number; remaining: number } {
    return { requests: 1200, window: 60, remaining: 1200 }
  }

  private async makeRequest(method: string, endpoint: string, params?: any): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`
    const headers = this.buildHeaders(method, endpoint, params)

    const response = await fetch(url, {
      method,
      headers,
      body: params ? JSON.stringify(params) : undefined,
    })

    return response.json()
  }

  private buildHeaders(method: string, endpoint: string, params?: any): Record<string, string> {
    const timestamp = Date.now().toString()
    const queryString = params ? new URLSearchParams(params).toString() : ""
    const signature = this.createSignature(queryString)

    return {
      "X-MBX-APIKEY": this.apiKey,
      "Content-Type": "application/json",
      signature: signature,
      timestamp: timestamp,
    }
  }

  private createSignature(queryString: string): string {
    // In real implementation, use crypto.createHmac
    return `signature_${queryString}_${this.secretKey}`
  }

  private normalizeTicker(data: any): any {
    return {
      symbol: data.s,
      price: Number.parseFloat(data.c),
      change: Number.parseFloat(data.P),
      volume: Number.parseFloat(data.v),
      high: Number.parseFloat(data.h),
      low: Number.parseFloat(data.l),
    }
  }

  private normalizeOrderBook(data: any): any {
    return {
      bids: data.b?.map((bid: any) => [Number.parseFloat(bid[0]), Number.parseFloat(bid[1])]) || [],
      asks: data.a?.map((ask: any) => [Number.parseFloat(ask[0]), Number.parseFloat(ask[1])]) || [],
    }
  }
}

export class BybitAdapter implements ExchangeAdapter {
  id = "bybit"
  name = "Bybit"
  private apiKey = ""
  private secretKey = ""
  private baseUrl = "https://api.bybit.com"
  private wsUrl = "wss://stream.bybit.com/v5/public/spot"

  async authenticate(credentials: { apiKey: string; secretKey: string }): Promise<boolean> {
    this.apiKey = credentials.apiKey
    this.secretKey = credentials.secretKey

    try {
      const response = await this.makeRequest("GET", "/v5/account/wallet-balance")
      return response.retCode === 0
    } catch (error) {
      return false
    }
  }

  async getBalance(): Promise<any> {
    return this.makeRequest("GET", "/v5/account/wallet-balance")
  }

  async getOrderBook(symbol: string): Promise<any> {
    return this.makeRequest("GET", `/v5/market/orderbook?category=spot&symbol=${symbol}&limit=50`)
  }

  async placeLimitOrder(symbol: string, side: "buy" | "sell", amount: number, price: number): Promise<any> {
    const params = {
      category: "spot",
      symbol,
      side: side.charAt(0).toUpperCase() + side.slice(1),
      orderType: "Limit",
      qty: amount.toString(),
      price: price.toString(),
    }

    return this.makeRequest("POST", "/v5/order/create", params)
  }

  async placeMarketOrder(symbol: string, side: "buy" | "sell", amount: number): Promise<any> {
    const params = {
      category: "spot",
      symbol,
      side: side.charAt(0).toUpperCase() + side.slice(1),
      orderType: "Market",
      qty: amount.toString(),
    }

    return this.makeRequest("POST", "/v5/order/create", params)
  }

  async cancelOrder(orderId: string): Promise<any> {
    const params = {
      category: "spot",
      orderId,
    }

    return this.makeRequest("POST", "/v5/order/cancel", params)
  }

  async getOpenOrders(): Promise<any> {
    return this.makeRequest("GET", "/v5/order/realtime?category=spot")
  }

  async getTradeHistory(): Promise<any> {
    return this.makeRequest("GET", "/v5/execution/list?category=spot")
  }

  subscribeToTicker(symbol: string, callback: (data: any) => void): void {
    const ws = new WebSocket(this.wsUrl)
    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          op: "subscribe",
          args: [`tickers.${symbol}`],
        }),
      )
    }
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.topic?.includes("tickers")) {
        callback(this.normalizeTicker(data.data))
      }
    }
  }

  subscribeToOrderBook(symbol: string, callback: (data: any) => void): void {
    const ws = new WebSocket(this.wsUrl)
    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          op: "subscribe",
          args: [`orderbook.50.${symbol}`],
        }),
      )
    }
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.topic?.includes("orderbook")) {
        callback(this.normalizeOrderBook(data.data))
      }
    }
  }

  getRateLimit(): { requests: number; window: number; remaining: number } {
    return { requests: 120, window: 60, remaining: 120 }
  }

  private async makeRequest(method: string, endpoint: string, params?: any): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`
    const headers = this.buildHeaders(method, endpoint, params)

    const response = await fetch(url, {
      method,
      headers,
      body: params ? JSON.stringify(params) : undefined,
    })

    return response.json()
  }

  private buildHeaders(method: string, endpoint: string, params?: any): Record<string, string> {
    const timestamp = Date.now().toString()
    const signature = this.createSignature(timestamp, params)

    return {
      "X-BAPI-API-KEY": this.apiKey,
      "X-BAPI-TIMESTAMP": timestamp,
      "X-BAPI-SIGN": signature,
      "X-BAPI-RECV-WINDOW": "5000",
      "Content-Type": "application/json",
    }
  }

  private createSignature(timestamp: string, params?: any): string {
    // In real implementation, use crypto.createHmac
    const paramString = params ? JSON.stringify(params) : ""
    return `signature_${timestamp}_${this.apiKey}_${paramString}_${this.secretKey}`
  }

  private normalizeTicker(data: any): any {
    return {
      symbol: data.symbol,
      price: Number.parseFloat(data.lastPrice),
      change: Number.parseFloat(data.price24hPcnt) * 100,
      volume: Number.parseFloat(data.volume24h),
      high: Number.parseFloat(data.highPrice24h),
      low: Number.parseFloat(data.lowPrice24h),
    }
  }

  private normalizeOrderBook(data: any): any {
    return {
      bids: data.b?.map((bid: any) => [Number.parseFloat(bid[0]), Number.parseFloat(bid[1])]) || [],
      asks: data.a?.map((ask: any) => [Number.parseFloat(ask[0]), Number.parseFloat(ask[1])]) || [],
    }
  }
}

// Factory for creating exchange adapters
export class ExchangeAdapterFactory {
  private static adapters: Map<string, ExchangeAdapter> = new Map()

  static registerAdapter(adapter: ExchangeAdapter): void {
    this.adapters.set(adapter.id, adapter)
  }

  static getAdapter(exchangeId: string): ExchangeAdapter | null {
    return this.adapters.get(exchangeId) || null
  }

  static getAllAdapters(): ExchangeAdapter[] {
    return Array.from(this.adapters.values())
  }

  static initialize(): void {
    // Register all available adapters
    this.registerAdapter(new BinanceAdapter())
    this.registerAdapter(new BybitAdapter())
    // Add more adapters as needed
  }
}

// Initialize adapters
ExchangeAdapterFactory.initialize()
