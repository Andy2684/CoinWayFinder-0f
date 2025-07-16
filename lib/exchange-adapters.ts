// Exchange-specific adapters for unified API interface with real API connections

import crypto from 'crypto'

export interface ExchangeAdapter {
  id: string
  name: string
  authenticate(credentials: any): Promise<boolean>
  getBalance(): Promise<any>
  getOrderBook(symbol: string): Promise<any>
  placeLimitOrder(symbol: string, side: 'buy' | 'sell', amount: number, price: number): Promise<any>
  placeMarketOrder(symbol: string, side: 'buy' | 'sell', amount: number): Promise<any>
  cancelOrder(orderId: string): Promise<any>
  getOpenOrders(): Promise<any>
  getTradeHistory(): Promise<any>
  subscribeToTicker(symbol: string, callback: (data: any) => void): void
  subscribeToOrderBook(symbol: string, callback: (data: any) => void): void
  getRateLimit(): { requests: number; window: number; remaining: number }
}

export class BinanceAdapter implements ExchangeAdapter {
  id = 'binance'
  name = 'Binance'
  private apiKey = ''
  private secretKey = ''
  private baseUrl = 'https://api.binance.com'
  private wsUrl = 'wss://stream.binance.com:9443/ws'
  private testnetUrl = 'https://testnet.binance.vision'
  private testnetWsUrl = 'wss://testnet.binance.vision/ws'
  private isTestnet = false
  private rateLimitRemaining = 1200

  constructor(testnet = false) {
    this.isTestnet = testnet
    if (testnet) {
      this.baseUrl = this.testnetUrl
      this.wsUrl = this.testnetWsUrl
    }
  }

  async authenticate(credentials: { apiKey: string; secretKey: string }): Promise<boolean> {
    this.apiKey = credentials.apiKey
    this.secretKey = credentials.secretKey

    try {
      const timestamp = Date.now()
      const queryString = `timestamp=${timestamp}`
      const signature = this.createSignature(queryString)

      const response = await fetch(
        `${this.baseUrl}/api/v3/account?${queryString}&signature=${signature}`,
        {
          headers: {
            'X-MBX-APIKEY': this.apiKey,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        return data.accountType !== undefined
      }
      return false
    } catch (error) {
      console.error('Binance authentication error:', error)
      return false
    }
  }

  async getBalance(): Promise<any> {
    const timestamp = Date.now()
    const queryString = `timestamp=${timestamp}`
    const signature = this.createSignature(queryString)

    const response = await fetch(
      `${this.baseUrl}/api/v3/account?${queryString}&signature=${signature}`,
      {
        headers: {
          'X-MBX-APIKEY': this.apiKey,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      balances: data.balances.filter(
        (balance: any) =>
          Number.parseFloat(balance.free) > 0 || Number.parseFloat(balance.locked) > 0
      ),
      accountType: data.accountType,
      canTrade: data.canTrade,
      canWithdraw: data.canWithdraw,
      canDeposit: data.canDeposit,
    }
  }

  async getOrderBook(symbol: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v3/depth?symbol=${symbol}&limit=100`)

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      symbol,
      bids: data.bids.map((bid: string[]) => [
        Number.parseFloat(bid[0]),
        Number.parseFloat(bid[1]),
      ]),
      asks: data.asks.map((ask: string[]) => [
        Number.parseFloat(ask[0]),
        Number.parseFloat(ask[1]),
      ]),
      lastUpdateId: data.lastUpdateId,
    }
  }

  async placeLimitOrder(
    symbol: string,
    side: 'buy' | 'sell',
    amount: number,
    price: number
  ): Promise<any> {
    const timestamp = Date.now()
    const params = {
      symbol,
      side: side.toUpperCase(),
      type: 'LIMIT',
      timeInForce: 'GTC',
      quantity: amount.toString(),
      price: price.toString(),
      timestamp: timestamp.toString(),
    }

    const queryString = new URLSearchParams(params).toString()
    const signature = this.createSignature(queryString)

    const response = await fetch(`${this.baseUrl}/api/v3/order`, {
      method: 'POST',
      headers: {
        'X-MBX-APIKEY': this.apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `${queryString}&signature=${signature}`,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Binance order error: ${error.msg}`)
    }

    return response.json()
  }

  async placeMarketOrder(symbol: string, side: 'buy' | 'sell', amount: number): Promise<any> {
    const timestamp = Date.now()
    const params = {
      symbol,
      side: side.toUpperCase(),
      type: 'MARKET',
      quantity: amount.toString(),
      timestamp: timestamp.toString(),
    }

    const queryString = new URLSearchParams(params).toString()
    const signature = this.createSignature(queryString)

    const response = await fetch(`${this.baseUrl}/api/v3/order`, {
      method: 'POST',
      headers: {
        'X-MBX-APIKEY': this.apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `${queryString}&signature=${signature}`,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Binance order error: ${error.msg}`)
    }

    return response.json()
  }

  async cancelOrder(orderId: string): Promise<any> {
    const timestamp = Date.now()
    const params = {
      orderId,
      timestamp: timestamp.toString(),
    }

    const queryString = new URLSearchParams(params).toString()
    const signature = this.createSignature(queryString)

    const response = await fetch(`${this.baseUrl}/api/v3/order`, {
      method: 'DELETE',
      headers: {
        'X-MBX-APIKEY': this.apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `${queryString}&signature=${signature}`,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Binance cancel error: ${error.msg}`)
    }

    return response.json()
  }

  async getOpenOrders(): Promise<any> {
    const timestamp = Date.now()
    const queryString = `timestamp=${timestamp}`
    const signature = this.createSignature(queryString)

    const response = await fetch(
      `${this.baseUrl}/api/v3/openOrders?${queryString}&signature=${signature}`,
      {
        headers: {
          'X-MBX-APIKEY': this.apiKey,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.statusText}`)
    }

    return response.json()
  }

  async getTradeHistory(): Promise<any> {
    const timestamp = Date.now()
    const queryString = `timestamp=${timestamp}`
    const signature = this.createSignature(queryString)

    const response = await fetch(
      `${this.baseUrl}/api/v3/myTrades?${queryString}&signature=${signature}`,
      {
        headers: {
          'X-MBX-APIKEY': this.apiKey,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.statusText}`)
    }

    return response.json()
  }

  subscribeToTicker(symbol: string, callback: (data: any) => void): void {
    const ws = new WebSocket(`${this.wsUrl}/${symbol.toLowerCase()}@ticker`)

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        callback(this.normalizeTicker(data))
      } catch (error) {
        console.error('WebSocket ticker error:', error)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket ticker connection error:', error)
    }

    ws.onclose = () => {
      console.log('WebSocket ticker connection closed')
      // Implement reconnection logic here
      setTimeout(() => this.subscribeToTicker(symbol, callback), 5000)
    }
  }

  subscribeToOrderBook(symbol: string, callback: (data: any) => void): void {
    const ws = new WebSocket(`${this.wsUrl}/${symbol.toLowerCase()}@depth@100ms`)

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        callback(this.normalizeOrderBook(data))
      } catch (error) {
        console.error('WebSocket orderbook error:', error)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket orderbook connection error:', error)
    }

    ws.onclose = () => {
      console.log('WebSocket orderbook connection closed')
      // Implement reconnection logic here
      setTimeout(() => this.subscribeToOrderBook(symbol, callback), 5000)
    }
  }

  getRateLimit(): { requests: number; window: number; remaining: number } {
    return { requests: 1200, window: 60, remaining: this.rateLimitRemaining }
  }

  private createSignature(queryString: string): string {
    return crypto.createHmac('sha256', this.secretKey).update(queryString).digest('hex')
  }

  private normalizeTicker(data: any): any {
    return {
      symbol: data.s,
      price: Number.parseFloat(data.c),
      change: Number.parseFloat(data.P),
      changePercent: Number.parseFloat(data.P),
      volume: Number.parseFloat(data.v),
      quoteVolume: Number.parseFloat(data.q),
      high: Number.parseFloat(data.h),
      low: Number.parseFloat(data.l),
      open: Number.parseFloat(data.o),
      count: Number.parseInt(data.count),
      timestamp: data.E,
    }
  }

  private normalizeOrderBook(data: any): any {
    return {
      symbol: data.s,
      bids:
        data.b?.map((bid: string[]) => [Number.parseFloat(bid[0]), Number.parseFloat(bid[1])]) ||
        [],
      asks:
        data.a?.map((ask: string[]) => [Number.parseFloat(ask[0]), Number.parseFloat(ask[1])]) ||
        [],
      lastUpdateId: data.u,
      timestamp: data.E,
    }
  }
}

export class BybitAdapter implements ExchangeAdapter {
  id = 'bybit'
  name = 'Bybit'
  private apiKey = ''
  private secretKey = ''
  private baseUrl = 'https://api.bybit.com'
  private wsUrl = 'wss://stream.bybit.com/v5/public/spot'
  private testnetUrl = 'https://api-testnet.bybit.com'
  private testnetWsUrl = 'wss://stream-testnet.bybit.com/v5/public/spot'
  private isTestnet = false
  private rateLimitRemaining = 120

  constructor(testnet = false) {
    this.isTestnet = testnet
    if (testnet) {
      this.baseUrl = this.testnetUrl
      this.wsUrl = this.testnetWsUrl
    }
  }

  async authenticate(credentials: { apiKey: string; secretKey: string }): Promise<boolean> {
    this.apiKey = credentials.apiKey
    this.secretKey = credentials.secretKey

    try {
      const timestamp = Date.now().toString()
      const signature = this.createSignature(timestamp, '')

      const response = await fetch(
        `${this.baseUrl}/v5/account/wallet-balance?accountType=UNIFIED`,
        {
          headers: {
            'X-BAPI-API-KEY': this.apiKey,
            'X-BAPI-TIMESTAMP': timestamp,
            'X-BAPI-SIGN': signature,
            'X-BAPI-RECV-WINDOW': '5000',
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        return data.retCode === 0
      }
      return false
    } catch (error) {
      console.error('Bybit authentication error:', error)
      return false
    }
  }

  async getBalance(): Promise<any> {
    const timestamp = Date.now().toString()
    const signature = this.createSignature(timestamp, '')

    const response = await fetch(`${this.baseUrl}/v5/account/wallet-balance?accountType=UNIFIED`, {
      headers: {
        'X-BAPI-API-KEY': this.apiKey,
        'X-BAPI-TIMESTAMP': timestamp,
        'X-BAPI-SIGN': signature,
        'X-BAPI-RECV-WINDOW': '5000',
      },
    })

    if (!response.ok) {
      throw new Error(`Bybit API error: ${response.statusText}`)
    }

    const data = await response.json()
    if (data.retCode !== 0) {
      throw new Error(`Bybit API error: ${data.retMsg}`)
    }

    return {
      balances: data.result.list[0]?.coin || [],
      accountType: data.result.list[0]?.accountType,
      totalEquity: data.result.list[0]?.totalEquity,
      totalWalletBalance: data.result.list[0]?.totalWalletBalance,
    }
  }

  async getOrderBook(symbol: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/v5/market/orderbook?category=spot&symbol=${symbol}&limit=50`
    )

    if (!response.ok) {
      throw new Error(`Bybit API error: ${response.statusText}`)
    }

    const data = await response.json()
    if (data.retCode !== 0) {
      throw new Error(`Bybit API error: ${data.retMsg}`)
    }

    return {
      symbol,
      bids: data.result.b.map((bid: string[]) => [
        Number.parseFloat(bid[0]),
        Number.parseFloat(bid[1]),
      ]),
      asks: data.result.a.map((ask: string[]) => [
        Number.parseFloat(ask[0]),
        Number.parseFloat(ask[1]),
      ]),
      timestamp: data.result.ts,
    }
  }

  async placeLimitOrder(
    symbol: string,
    side: 'buy' | 'sell',
    amount: number,
    price: number
  ): Promise<any> {
    const timestamp = Date.now().toString()
    const params = {
      category: 'spot',
      symbol,
      side: side.charAt(0).toUpperCase() + side.slice(1),
      orderType: 'Limit',
      qty: amount.toString(),
      price: price.toString(),
    }

    const signature = this.createSignature(timestamp, JSON.stringify(params))

    const response = await fetch(`${this.baseUrl}/v5/order/create`, {
      method: 'POST',
      headers: {
        'X-BAPI-API-KEY': this.apiKey,
        'X-BAPI-TIMESTAMP': timestamp,
        'X-BAPI-SIGN': signature,
        'X-BAPI-RECV-WINDOW': '5000',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      throw new Error(`Bybit API error: ${response.statusText}`)
    }

    const data = await response.json()
    if (data.retCode !== 0) {
      throw new Error(`Bybit order error: ${data.retMsg}`)
    }

    return data.result
  }

  async placeMarketOrder(symbol: string, side: 'buy' | 'sell', amount: number): Promise<any> {
    const timestamp = Date.now().toString()
    const params = {
      category: 'spot',
      symbol,
      side: side.charAt(0).toUpperCase() + side.slice(1),
      orderType: 'Market',
      qty: amount.toString(),
    }

    const signature = this.createSignature(timestamp, JSON.stringify(params))

    const response = await fetch(`${this.baseUrl}/v5/order/create`, {
      method: 'POST',
      headers: {
        'X-BAPI-API-KEY': this.apiKey,
        'X-BAPI-TIMESTAMP': timestamp,
        'X-BAPI-SIGN': signature,
        'X-BAPI-RECV-WINDOW': '5000',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      throw new Error(`Bybit API error: ${response.statusText}`)
    }

    const data = await response.json()
    if (data.retCode !== 0) {
      throw new Error(`Bybit order error: ${data.retMsg}`)
    }

    return data.result
  }

  async cancelOrder(orderId: string): Promise<any> {
    const timestamp = Date.now().toString()
    const params = {
      category: 'spot',
      orderId,
    }

    const signature = this.createSignature(timestamp, JSON.stringify(params))

    const response = await fetch(`${this.baseUrl}/v5/order/cancel`, {
      method: 'POST',
      headers: {
        'X-BAPI-API-KEY': this.apiKey,
        'X-BAPI-TIMESTAMP': timestamp,
        'X-BAPI-SIGN': signature,
        'X-BAPI-RECV-WINDOW': '5000',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      throw new Error(`Bybit API error: ${response.statusText}`)
    }

    const data = await response.json()
    if (data.retCode !== 0) {
      throw new Error(`Bybit cancel error: ${data.retMsg}`)
    }

    return data.result
  }

  async getOpenOrders(): Promise<any> {
    const timestamp = Date.now().toString()
    const signature = this.createSignature(timestamp, '')

    const response = await fetch(`${this.baseUrl}/v5/order/realtime?category=spot`, {
      headers: {
        'X-BAPI-API-KEY': this.apiKey,
        'X-BAPI-TIMESTAMP': timestamp,
        'X-BAPI-SIGN': signature,
        'X-BAPI-RECV-WINDOW': '5000',
      },
    })

    if (!response.ok) {
      throw new Error(`Bybit API error: ${response.statusText}`)
    }

    const data = await response.json()
    if (data.retCode !== 0) {
      throw new Error(`Bybit API error: ${data.retMsg}`)
    }

    return data.result.list
  }

  async getTradeHistory(): Promise<any> {
    const timestamp = Date.now().toString()
    const signature = this.createSignature(timestamp, '')

    const response = await fetch(`${this.baseUrl}/v5/execution/list?category=spot`, {
      headers: {
        'X-BAPI-API-KEY': this.apiKey,
        'X-BAPI-TIMESTAMP': timestamp,
        'X-BAPI-SIGN': signature,
        'X-BAPI-RECV-WINDOW': '5000',
      },
    })

    if (!response.ok) {
      throw new Error(`Bybit API error: ${response.statusText}`)
    }

    const data = await response.json()
    if (data.retCode !== 0) {
      throw new Error(`Bybit API error: ${data.retMsg}`)
    }

    return data.result.list
  }

  subscribeToTicker(symbol: string, callback: (data: any) => void): void {
    const ws = new WebSocket(this.wsUrl)

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          op: 'subscribe',
          args: [`tickers.${symbol}`],
        })
      )
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.topic?.includes('tickers')) {
          callback(this.normalizeTicker(data.data))
        }
      } catch (error) {
        console.error('WebSocket ticker error:', error)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket ticker connection error:', error)
    }

    ws.onclose = () => {
      console.log('WebSocket ticker connection closed')
      setTimeout(() => this.subscribeToTicker(symbol, callback), 5000)
    }
  }

  subscribeToOrderBook(symbol: string, callback: (data: any) => void): void {
    const ws = new WebSocket(this.wsUrl)

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          op: 'subscribe',
          args: [`orderbook.50.${symbol}`],
        })
      )
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.topic?.includes('orderbook')) {
          callback(this.normalizeOrderBook(data.data))
        }
      } catch (error) {
        console.error('WebSocket orderbook error:', error)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket orderbook connection error:', error)
    }

    ws.onclose = () => {
      console.log('WebSocket orderbook connection closed')
      setTimeout(() => this.subscribeToOrderBook(symbol, callback), 5000)
    }
  }

  getRateLimit(): { requests: number; window: number; remaining: number } {
    return { requests: 120, window: 60, remaining: this.rateLimitRemaining }
  }

  private createSignature(timestamp: string, params: string): string {
    const message = timestamp + this.apiKey + '5000' + params
    return crypto.createHmac('sha256', this.secretKey).update(message).digest('hex')
  }

  private normalizeTicker(data: any): any {
    return {
      symbol: data.symbol,
      price: Number.parseFloat(data.lastPrice),
      change: Number.parseFloat(data.price24hPcnt) * 100,
      changePercent: Number.parseFloat(data.price24hPcnt) * 100,
      volume: Number.parseFloat(data.volume24h),
      quoteVolume: Number.parseFloat(data.turnover24h),
      high: Number.parseFloat(data.highPrice24h),
      low: Number.parseFloat(data.lowPrice24h),
      timestamp: data.ts,
    }
  }

  private normalizeOrderBook(data: any): any {
    return {
      symbol: data.s,
      bids:
        data.b?.map((bid: string[]) => [Number.parseFloat(bid[0]), Number.parseFloat(bid[1])]) ||
        [],
      asks:
        data.a?.map((ask: string[]) => [Number.parseFloat(ask[0]), Number.parseFloat(ask[1])]) ||
        [],
      timestamp: data.ts,
    }
  }
}

// Factory for creating exchange adapters
export class ExchangeAdapterFactory {
  private static adapters: Map<string, () => ExchangeAdapter> = new Map()

  static registerAdapter(id: string, factory: () => ExchangeAdapter): void {
    this.adapters.set(id, factory)
  }

  static getAdapter(exchangeId: string, testnet = false): ExchangeAdapter | null {
    const factory = this.adapters.get(exchangeId)
    if (!factory) return null

    const adapter = factory()
    if ('isTestnet' in adapter) {
      ;(adapter as any).isTestnet = testnet
    }
    return adapter
  }

  static getAllAdapters(): string[] {
    return Array.from(this.adapters.keys())
  }

  static initialize(): void {
    // Register all available adapters
    this.registerAdapter('binance', () => new BinanceAdapter())
    this.registerAdapter('bybit', () => new BybitAdapter())
    // Add more adapters as needed
  }
}

// Initialize adapters
ExchangeAdapterFactory.initialize()
