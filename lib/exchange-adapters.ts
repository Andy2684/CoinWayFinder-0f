// Exchange-specific adapters for unified API interface with real API connections

import crypto from "crypto"

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
  private testnetUrl = "https://testnet.binance.vision"
  private testnetWsUrl = "wss://testnet.binance.vision/ws"
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

      const response = await fetch(`${this.baseUrl}/api/v3/account?${queryString}&signature=${signature}`, {
        headers: {
          "X-MBX-APIKEY": this.apiKey,
        },
      })

      if (response.ok) {
        const data = await response.json()
        return data.accountType !== undefined
      }
      return false
    } catch (error) {
      console.error("Binance authentication error:", error)
      return false
    }
  }

  async getBalance(): Promise<any> {
    const timestamp = Date.now()
    const queryString = `timestamp=${timestamp}`
    const signature = this.createSignature(queryString)

    const response = await fetch(`${this.baseUrl}/api/v3/account?${queryString}&signature=${signature}`, {
      headers: {
        "X-MBX-APIKEY": this.apiKey,
      },
    })

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      balances: data.balances.filter(
        (balance: any) => Number.parseFloat(balance.free) > 0 || Number.parseFloat(balance.locked) > 0,
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
      bids: data.bids.map((bid: string[]) => [Number.parseFloat(bid[0]), Number.parseFloat(bid[1])]),
      asks: data.asks.map((ask: string[]) => [Number.parseFloat(ask[0]), Number.parseFloat(ask[1])]),
      lastUpdateId: data.lastUpdateId,
    }
  }

  async placeLimitOrder(symbol: string, side: "buy" | "sell", amount: number, price: number): Promise<any> {
    const timestamp = Date.now()
    const params = {
      symbol,
      side: side.toUpperCase(),
      type: "LIMIT",
      timeInForce: "GTC",
      quantity: amount.toString(),
      price: price.toString(),
      timestamp: timestamp.toString(),
    }

    const queryString = new URLSearchParams(params).toString()
    const signature = this.createSignature(queryString)

    const response = await fetch(`${this.baseUrl}/api/v3/order`, {
      method: "POST",
      headers: {
        "X-MBX-APIKEY": this.apiKey,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `${queryString}&signature=${signature}`,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Binance order error: ${error.msg}`)
    }

    return response.json()
  }

  async placeMarketOrder(symbol: string, side: "buy" | "sell", amount: number): Promise<any> {
    const timestamp = Date.now()
    const params = {
      symbol,
      side: side.toUpperCase(),
      type: "MARKET",
      quantity: amount.toString(),
      timestamp: timestamp.toString(),
    }

    const queryString = new URLSearchParams(params).toString()
    const signature = this.createSignature(queryString)

    const response = await fetch(`${this.baseUrl}/api/v3/order`, {
      method: "POST",
      headers: {
        "X-MBX-APIKEY": this.apiKey,
        "Content-Type": "application/x-www-form-urlencoded",
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
      method: "DELETE",
      headers: {
        "X-MBX-APIKEY": this.apiKey,
        "Content-Type": "application/x-www-form-urlencoded",
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

    const response = await fetch(`${this.baseUrl}/api/v3/openOrders?${queryString}&signature=${signature}`, {
      headers: {
        "X-MBX-APIKEY": this.apiKey,
      },
    })

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.statusText}`)
    }

    return response.json()
  }

  async getTradeHistory(): Promise<any> {
    const timestamp = Date.now()
    const queryString = `timestamp=${timestamp}`
    const signature = this.createSignature(queryString)

    const response = await fetch(`${this.baseUrl}/api/v3/myTrades?${queryString}&signature=${signature}`, {
      headers: {
        "X-MBX-APIKEY": this.apiKey,
      },
    })

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
        console.error("WebSocket ticker error:", error)
      }
    }

    ws.onerror = (error) => {
      console.error("WebSocket ticker connection error:", error)
    }

    ws.onclose = () => {
      console.log("WebSocket ticker connection closed")
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
        console.error("WebSocket orderbook error:", error)
      }
    }

    ws.onerror = (error) => {
      console.error("WebSocket orderbook connection error:", error)
    }

    ws.onclose = () => {
      console.log("WebSocket orderbook connection closed")
      setTimeout(() => this.subscribeToOrderBook(symbol, callback), 5000)
    }
  }

  getRateLimit(): { requests: number; window: number; remaining: number } {
    return { requests: 1200, window: 60, remaining: this.rateLimitRemaining }
  }

  private createSignature(queryString: string): string {
    return crypto.createHmac("sha256", this.secretKey).update(queryString).digest("hex")
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
      bids: data.b?.map((bid: string[]) => [Number.parseFloat(bid[0]), Number.parseFloat(bid[1])]) || [],
      asks: data.a?.map((ask: string[]) => [Number.parseFloat(ask[0]), Number.parseFloat(ask[1])]) || [],
      lastUpdateId: data.u,
      timestamp: data.E,
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
  private testnetUrl = "https://api-testnet.bybit.com"
  private testnetWsUrl = "wss://stream-testnet.bybit.com/v5/public/spot"
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
      const signature = this.createSignature(timestamp, "")

      const response = await fetch(`${this.baseUrl}/v5/account/wallet-balance?accountType=UNIFIED`, {
        headers: {
          "X-BAPI-API-KEY": this.apiKey,
          "X-BAPI-TIMESTAMP": timestamp,
          "X-BAPI-SIGN": signature,
          "X-BAPI-RECV-WINDOW": "5000",
        },
      })

      if (response.ok) {
        const data = await response.json()
        return data.retCode === 0
      }
      return false
    } catch (error) {
      console.error("Bybit authentication error:", error)
      return false
    }
  }

  async getBalance(): Promise<any> {
    const timestamp = Date.now().toString()
    const signature = this.createSignature(timestamp, "")

    const response = await fetch(`${this.baseUrl}/v5/account/wallet-balance?accountType=UNIFIED`, {
      headers: {
        "X-BAPI-API-KEY": this.apiKey,
        "X-BAPI-TIMESTAMP": timestamp,
        "X-BAPI-SIGN": signature,
        "X-BAPI-RECV-WINDOW": "5000",
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
    const response = await fetch(`${this.baseUrl}/v5/market/orderbook?category=spot&symbol=${symbol}&limit=50`)

    if (!response.ok) {
      throw new Error(`Bybit API error: ${response.statusText}`)
    }

    const data = await response.json()
    if (data.retCode !== 0) {
      throw new Error(`Bybit API error: ${data.retMsg}`)
    }

    return {
      symbol,
      bids: data.result.b.map((bid: string[]) => [Number.parseFloat(bid[0]), Number.parseFloat(bid[1])]),
      asks: data.result.a.map((ask: string[]) => [Number.parseFloat(ask[0]), Number.parseFloat(ask[1])]),
      timestamp: data.result.ts,
    }
  }

  async placeLimitOrder(symbol: string, side: "buy" | "sell", amount: number, price: number): Promise<any> {
    const timestamp = Date.now().toString()
    const params = {
      category: "spot",
      symbol,
      side: side.charAt(0).toUpperCase() + side.slice(1),
      orderType: "Limit",
      qty: amount.toString(),
      price: price.toString(),
    }

    const signature = this.createSignature(timestamp, JSON.stringify(params))

    const response = await fetch(`${this.baseUrl}/v5/order/create`, {
      method: "POST",
      headers: {
        "X-BAPI-API-KEY": this.apiKey,
        "X-BAPI-TIMESTAMP": timestamp,
        "X-BAPI-SIGN": signature,
        "X-BAPI-RECV-WINDOW": "5000",
        "Content-Type": "application/json",
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

  async placeMarketOrder(symbol: string, side: "buy" | "sell", amount: number): Promise<any> {
    const timestamp = Date.now().toString()
    const params = {
      category: "spot",
      symbol,
      side: side.charAt(0).toUpperCase() + side.slice(1),
      orderType: "Market",
      qty: amount.toString(),
    }

    const signature = this.createSignature(timestamp, JSON.stringify(params))

    const response = await fetch(`${this.baseUrl}/v5/order/create`, {
      method: "POST",
      headers: {
        "X-BAPI-API-KEY": this.apiKey,
        "X-BAPI-TIMESTAMP": timestamp,
        "X-BAPI-SIGN": signature,
        "X-BAPI-RECV-WINDOW": "5000",
        "Content-Type": "application/json",
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
      category: "spot",
      orderId,
    }

    const signature = this.createSignature(timestamp, JSON.stringify(params))

    const response = await fetch(`${this.baseUrl}/v5/order/cancel`, {
      method: "POST",
      headers: {
        "X-BAPI-API-KEY": this.apiKey,
        "X-BAPI-TIMESTAMP": timestamp,
        "X-BAPI-SIGN": signature,
        "X-BAPI-RECV-WINDOW": "5000",
        "Content-Type": "application/json",
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
    const signature = this.createSignature(timestamp, "")

    const response = await fetch(`${this.baseUrl}/v5/order/realtime?category=spot`, {
      headers: {
        "X-BAPI-API-KEY": this.apiKey,
        "X-BAPI-TIMESTAMP": timestamp,
        "X-BAPI-SIGN": signature,
        "X-BAPI-RECV-WINDOW": "5000",
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
    const signature = this.createSignature(timestamp, "")

    const response = await fetch(`${this.baseUrl}/v5/execution/list?category=spot`, {
      headers: {
        "X-BAPI-API-KEY": this.apiKey,
        "X-BAPI-TIMESTAMP": timestamp,
        "X-BAPI-SIGN": signature,
        "X-BAPI-RECV-WINDOW": "5000",
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
          op: "subscribe",
          args: [`tickers.${symbol}`],
        }),
      )
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.topic?.includes("tickers")) {
          callback(this.normalizeTicker(data.data))
        }
      } catch (error) {
        console.error("WebSocket ticker error:", error)
      }
    }

    ws.onerror = (error) => {
      console.error("WebSocket ticker connection error:", error)
    }

    ws.onclose = () => {
      console.log("WebSocket ticker connection closed")
      setTimeout(() => this.subscribeToTicker(symbol, callback), 5000)
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
      try {
        const data = JSON.parse(event.data)
        if (data.topic?.includes("orderbook")) {
          callback(this.normalizeOrderBook(data.data))
        }
      } catch (error) {
        console.error("WebSocket orderbook error:", error)
      }
    }

    ws.onerror = (error) => {
      console.error("WebSocket orderbook connection error:", error)
    }

    ws.onclose = () => {
      console.log("WebSocket orderbook connection closed")
      setTimeout(() => this.subscribeToOrderBook(symbol, callback), 5000)
    }
  }

  getRateLimit(): { requests: number; window: number; remaining: number } {
    return { requests: 120, window: 60, remaining: this.rateLimitRemaining }
  }

  private createSignature(timestamp: string, params: string): string {
    const message = timestamp + this.apiKey + "5000" + params
    return crypto.createHmac("sha256", this.secretKey).update(message).digest("hex")
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
      bids: data.b?.map((bid: string[]) => [Number.parseFloat(bid[0]), Number.parseFloat(bid[1])]) || [],
      asks: data.a?.map((ask: string[]) => [Number.parseFloat(ask[0]), Number.parseFloat(ask[1])]) || [],
      timestamp: data.ts,
    }
  }
}

export class CoinbaseAdapter implements ExchangeAdapter {
  id = "coinbase"
  name = "Coinbase Pro"
  private apiKey = ""
  private secretKey = ""
  private passphrase = ""
  private baseUrl = "https://api.exchange.coinbase.com"
  private wsUrl = "wss://ws-feed.exchange.coinbase.com"
  private testnetUrl = "https://api-public.sandbox.exchange.coinbase.com"
  private testnetWsUrl = "wss://ws-feed-public.sandbox.exchange.coinbase.com"
  private isTestnet = false
  private rateLimitRemaining = 10000

  constructor(testnet = false) {
    this.isTestnet = testnet
    if (testnet) {
      this.baseUrl = this.testnetUrl
      this.wsUrl = this.testnetWsUrl
    }
  }

  async authenticate(credentials: { apiKey: string; secretKey: string; passphrase: string }): Promise<boolean> {
    this.apiKey = credentials.apiKey
    this.secretKey = credentials.secretKey
    this.passphrase = credentials.passphrase

    try {
      const timestamp = Date.now() / 1000
      const method = "GET"
      const path = "/accounts"
      const signature = this.createSignature(timestamp.toString(), method, path, "")

      const response = await fetch(`${this.baseUrl}${path}`, {
        headers: {
          "CB-ACCESS-KEY": this.apiKey,
          "CB-ACCESS-SIGN": signature,
          "CB-ACCESS-TIMESTAMP": timestamp.toString(),
          "CB-ACCESS-PASSPHRASE": this.passphrase,
        },
      })

      return response.ok
    } catch (error) {
      console.error("Coinbase authentication error:", error)
      return false
    }
  }

  async getBalance(): Promise<any> {
    const timestamp = Date.now() / 1000
    const method = "GET"
    const path = "/accounts"
    const signature = this.createSignature(timestamp.toString(), method, path, "")

    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        "CB-ACCESS-KEY": this.apiKey,
        "CB-ACCESS-SIGN": signature,
        "CB-ACCESS-TIMESTAMP": timestamp.toString(),
        "CB-ACCESS-PASSPHRASE": this.passphrase,
      },
    })

    if (!response.ok) {
      throw new Error(`Coinbase API error: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      balances: data.filter((account: any) => Number.parseFloat(account.balance) > 0),
      accountType: "spot",
      canTrade: true,
      canWithdraw: true,
      canDeposit: true,
    }
  }

  async getOrderBook(symbol: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/products/${symbol}/book?level=2`)

    if (!response.ok) {
      throw new Error(`Coinbase API error: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      symbol,
      bids: data.bids.map((bid: string[]) => [Number.parseFloat(bid[0]), Number.parseFloat(bid[1])]),
      asks: data.asks.map((ask: string[]) => [Number.parseFloat(ask[0]), Number.parseFloat(ask[1])]),
      sequence: data.sequence,
    }
  }

  async placeLimitOrder(symbol: string, side: "buy" | "sell", amount: number, price: number): Promise<any> {
    const timestamp = Date.now() / 1000
    const method = "POST"
    const path = "/orders"
    const body = JSON.stringify({
      product_id: symbol,
      side,
      type: "limit",
      size: amount.toString(),
      price: price.toString(),
    })

    const signature = this.createSignature(timestamp.toString(), method, path, body)

    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: {
        "CB-ACCESS-KEY": this.apiKey,
        "CB-ACCESS-SIGN": signature,
        "CB-ACCESS-TIMESTAMP": timestamp.toString(),
        "CB-ACCESS-PASSPHRASE": this.passphrase,
        "Content-Type": "application/json",
      },
      body,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Coinbase order error: ${error.message}`)
    }

    return response.json()
  }

  async placeMarketOrder(symbol: string, side: "buy" | "sell", amount: number): Promise<any> {
    const timestamp = Date.now() / 1000
    const method = "POST"
    const path = "/orders"
    const body = JSON.stringify({
      product_id: symbol,
      side,
      type: "market",
      size: amount.toString(),
    })

    const signature = this.createSignature(timestamp.toString(), method, path, body)

    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: {
        "CB-ACCESS-KEY": this.apiKey,
        "CB-ACCESS-SIGN": signature,
        "CB-ACCESS-TIMESTAMP": timestamp.toString(),
        "CB-ACCESS-PASSPHRASE": this.passphrase,
        "Content-Type": "application/json",
      },
      body,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Coinbase order error: ${error.message}`)
    }

    return response.json()
  }

  async cancelOrder(orderId: string): Promise<any> {
    const timestamp = Date.now() / 1000
    const method = "DELETE"
    const path = `/orders/${orderId}`
    const signature = this.createSignature(timestamp.toString(), method, path, "")

    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "DELETE",
      headers: {
        "CB-ACCESS-KEY": this.apiKey,
        "CB-ACCESS-SIGN": signature,
        "CB-ACCESS-TIMESTAMP": timestamp.toString(),
        "CB-ACCESS-PASSPHRASE": this.passphrase,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Coinbase cancel error: ${error.message}`)
    }

    return response.json()
  }

  async getOpenOrders(): Promise<any> {
    const timestamp = Date.now() / 1000
    const method = "GET"
    const path = "/orders"
    const signature = this.createSignature(timestamp.toString(), method, path, "")

    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        "CB-ACCESS-KEY": this.apiKey,
        "CB-ACCESS-SIGN": signature,
        "CB-ACCESS-TIMESTAMP": timestamp.toString(),
        "CB-ACCESS-PASSPHRASE": this.passphrase,
      },
    })

    if (!response.ok) {
      throw new Error(`Coinbase API error: ${response.statusText}`)
    }

    return response.json()
  }

  async getTradeHistory(): Promise<any> {
    const timestamp = Date.now() / 1000
    const method = "GET"
    const path = "/fills"
    const signature = this.createSignature(timestamp.toString(), method, path, "")

    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        "CB-ACCESS-KEY": this.apiKey,
        "CB-ACCESS-SIGN": signature,
        "CB-ACCESS-TIMESTAMP": timestamp.toString(),
        "CB-ACCESS-PASSPHRASE": this.passphrase,
      },
    })

    if (!response.ok) {
      throw new Error(`Coinbase API error: ${response.statusText}`)
    }

    return response.json()
  }

  subscribeToTicker(symbol: string, callback: (data: any) => void): void {
    const ws = new WebSocket(this.wsUrl)

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "subscribe",
          product_ids: [symbol],
          channels: ["ticker"],
        }),
      )
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === "ticker") {
          callback(this.normalizeTicker(data))
        }
      } catch (error) {
        console.error("WebSocket ticker error:", error)
      }
    }

    ws.onerror = (error) => {
      console.error("WebSocket ticker connection error:", error)
    }

    ws.onclose = () => {
      console.log("WebSocket ticker connection closed")
      setTimeout(() => this.subscribeToTicker(symbol, callback), 5000)
    }
  }

  subscribeToOrderBook(symbol: string, callback: (data: any) => void): void {
    const ws = new WebSocket(this.wsUrl)

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "subscribe",
          product_ids: [symbol],
          channels: ["level2"],
        }),
      )
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === "l2update") {
          callback(this.normalizeOrderBook(data))
        }
      } catch (error) {
        console.error("WebSocket orderbook error:", error)
      }
    }

    ws.onerror = (error) => {
      console.error("WebSocket orderbook connection error:", error)
    }

    ws.onclose = () => {
      console.log("WebSocket orderbook connection closed")
      setTimeout(() => this.subscribeToOrderBook(symbol, callback), 5000)
    }
  }

  getRateLimit(): { requests: number; window: number; remaining: number } {
    return { requests: 10000, window: 3600, remaining: this.rateLimitRemaining }
  }

  private createSignature(timestamp: string, method: string, path: string, body: string): string {
    const message = timestamp + method + path + body
    return crypto.createHmac("sha256", Buffer.from(this.secretKey, "base64")).update(message).digest("base64")
  }

  private normalizeTicker(data: any): any {
    return {
      symbol: data.product_id,
      price: Number.parseFloat(data.price),
      change: Number.parseFloat(data.open_24h) - Number.parseFloat(data.price),
      changePercent:
        ((Number.parseFloat(data.price) - Number.parseFloat(data.open_24h)) / Number.parseFloat(data.open_24h)) * 100,
      volume: Number.parseFloat(data.volume_24h),
      high: Number.parseFloat(data.high_24h),
      low: Number.parseFloat(data.low_24h),
      timestamp: new Date(data.time).getTime(),
    }
  }

  private normalizeOrderBook(data: any): any {
    return {
      symbol: data.product_id,
      bids:
        data.changes
          ?.filter((change: any) => change[0] === "buy")
          .map((bid: any) => [Number.parseFloat(bid[1]), Number.parseFloat(bid[2])]) || [],
      asks:
        data.changes
          ?.filter((change: any) => change[0] === "sell")
          .map((ask: any) => [Number.parseFloat(ask[1]), Number.parseFloat(ask[2])]) || [],
      timestamp: new Date(data.time).getTime(),
    }
  }
}

export class KrakenAdapter implements ExchangeAdapter {
  id = "kraken"
  name = "Kraken"
  private apiKey = ""
  private secretKey = ""
  private baseUrl = "https://api.kraken.com"
  private wsUrl = "wss://ws.kraken.com"
  private rateLimitRemaining = 15

  async authenticate(credentials: { apiKey: string; secretKey: string }): Promise<boolean> {
    this.apiKey = credentials.apiKey
    this.secretKey = credentials.secretKey

    try {
      const nonce = Date.now() * 1000
      const postData = `nonce=${nonce}`
      const signature = this.createSignature("/0/private/Balance", postData, nonce.toString())

      const response = await fetch(`${this.baseUrl}/0/private/Balance`, {
        method: "POST",
        headers: {
          "API-Key": this.apiKey,
          "API-Sign": signature,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: postData,
      })

      if (response.ok) {
        const data = await response.json()
        return data.error.length === 0
      }
      return false
    } catch (error) {
      console.error("Kraken authentication error:", error)
      return false
    }
  }

  async getBalance(): Promise<any> {
    const nonce = Date.now() * 1000
    const postData = `nonce=${nonce}`
    const signature = this.createSignature("/0/private/Balance", postData, nonce.toString())

    const response = await fetch(`${this.baseUrl}/0/private/Balance`, {
      method: "POST",
      headers: {
        "API-Key": this.apiKey,
        "API-Sign": signature,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: postData,
    })

    if (!response.ok) {
      throw new Error(`Kraken API error: ${response.statusText}`)
    }

    const data = await response.json()
    if (data.error.length > 0) {
      throw new Error(`Kraken API error: ${data.error.join(", ")}`)
    }

    return {
      balances: Object.entries(data.result).map(([currency, balance]) => ({
        asset: currency,
        free: balance,
        locked: "0",
      })),
      accountType: "spot",
      canTrade: true,
      canWithdraw: true,
      canDeposit: true,
    }
  }

  async getOrderBook(symbol: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/0/public/Depth?pair=${symbol}&count=100`)

    if (!response.ok) {
      throw new Error(`Kraken API error: ${response.statusText}`)
    }

    const data = await response.json()
    if (data.error.length > 0) {
      throw new Error(`Kraken API error: ${data.error.join(", ")}`)
    }

    const pairData = Object.values(data.result)[0] as any
    return {
      symbol,
      bids: pairData.bids.map((bid: string[]) => [Number.parseFloat(bid[0]), Number.parseFloat(bid[1])]),
      asks: pairData.asks.map((ask: string[]) => [Number.parseFloat(ask[0]), Number.parseFloat(ask[1])]),
    }
  }

  async placeLimitOrder(symbol: string, side: "buy" | "sell", amount: number, price: number): Promise<any> {
    const nonce = Date.now() * 1000
    const postData = `nonce=${nonce}&pair=${symbol}&type=${side}&ordertype=limit&volume=${amount}&price=${price}`
    const signature = this.createSignature("/0/private/AddOrder", postData, nonce.toString())

    const response = await fetch(`${this.baseUrl}/0/private/AddOrder`, {
      method: "POST",
      headers: {
        "API-Key": this.apiKey,
        "API-Sign": signature,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: postData,
    })

    if (!response.ok) {
      throw new Error(`Kraken API error: ${response.statusText}`)
    }

    const data = await response.json()
    if (data.error.length > 0) {
      throw new Error(`Kraken order error: ${data.error.join(", ")}`)
    }

    return data.result
  }

  async placeMarketOrder(symbol: string, side: "buy" | "sell", amount: number): Promise<any> {
    const nonce = Date.now() * 1000
    const postData = `nonce=${nonce}&pair=${symbol}&type=${side}&ordertype=market&volume=${amount}`
    const signature = this.createSignature("/0/private/AddOrder", postData, nonce.toString())

    const response = await fetch(`${this.baseUrl}/0/private/AddOrder`, {
      method: "POST",
      headers: {
        "API-Key": this.apiKey,
        "API-Sign": signature,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: postData,
    })

    if (!response.ok) {
      throw new Error(`Kraken API error: ${response.statusText}`)
    }

    const data = await response.json()
    if (data.error.length > 0) {
      throw new Error(`Kraken order error: ${data.error.join(", ")}`)
    }

    return data.result
  }

  async cancelOrder(orderId: string): Promise<any> {
    const nonce = Date.now() * 1000
    const postData = `nonce=${nonce}&txid=${orderId}`
    const signature = this.createSignature("/0/private/CancelOrder", postData, nonce.toString())

    const response = await fetch(`${this.baseUrl}/0/private/CancelOrder`, {
      method: "POST",
      headers: {
        "API-Key": this.apiKey,
        "API-Sign": signature,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: postData,
    })

    if (!response.ok) {
      throw new Error(`Kraken API error: ${response.statusText}`)
    }

    const data = await response.json()
    if (data.error.length > 0) {
      throw new Error(`Kraken cancel error: ${data.error.join(", ")}`)
    }

    return data.result
  }

  async getOpenOrders(): Promise<any> {
    const nonce = Date.now() * 1000
    const postData = `nonce=${nonce}`
    const signature = this.createSignature("/0/private/OpenOrders", postData, nonce.toString())

    const response = await fetch(`${this.baseUrl}/0/private/OpenOrders`, {
      method: "POST",
      headers: {
        "API-Key": this.apiKey,
        "API-Sign": signature,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: postData,
    })

    if (!response.ok) {
      throw new Error(`Kraken API error: ${response.statusText}`)
    }

    const data = await response.json()
    if (data.error.length > 0) {
      throw new Error(`Kraken API error: ${data.error.join(", ")}`)
    }

    return data.result.open
  }

  async getTradeHistory(): Promise<any> {
    const nonce = Date.now() * 1000
    const postData = `nonce=${nonce}`
    const signature = this.createSignature("/0/private/TradesHistory", postData, nonce.toString())

    const response = await fetch(`${this.baseUrl}/0/private/TradesHistory`, {
      method: "POST",
      headers: {
        "API-Key": this.apiKey,
        "API-Sign": signature,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: postData,
    })

    if (!response.ok) {
      throw new Error(`Kraken API error: ${response.statusText}`)
    }

    const data = await response.json()
    if (data.error.length > 0) {
      throw new Error(`Kraken API error: ${data.error.join(", ")}`)
    }

    return data.result.trades
  }

  subscribeToTicker(symbol: string, callback: (data: any) => void): void {
    const ws = new WebSocket(this.wsUrl)

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          event: "subscribe",
          pair: [symbol],
          subscription: { name: "ticker" },
        }),
      )
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (Array.isArray(data) && data[2] === "ticker") {
          callback(this.normalizeTicker(data[1], symbol))
        }
      } catch (error) {
        console.error("WebSocket ticker error:", error)
      }
    }

    ws.onerror = (error) => {
      console.error("WebSocket ticker connection error:", error)
    }

    ws.onclose = () => {
      console.log("WebSocket ticker connection closed")
      setTimeout(() => this.subscribeToTicker(symbol, callback), 5000)
    }
  }

  subscribeToOrderBook(symbol: string, callback: (data: any) => void): void {
    const ws = new WebSocket(this.wsUrl)

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          event: "subscribe",
          pair: [symbol],
          subscription: { name: "book", depth: 25 },
        }),
      )
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (Array.isArray(data) && data[2] === "book-25") {
          callback(this.normalizeOrderBook(data[1], symbol))
        }
      } catch (error) {
        console.error("WebSocket orderbook error:", error)
      }
    }

    ws.onerror = (error) => {
      console.error("WebSocket orderbook connection error:", error)
    }

    ws.onclose = () => {
      console.log("WebSocket orderbook connection closed")
      setTimeout(() => this.subscribeToOrderBook(symbol, callback), 5000)
    }
  }

  getRateLimit(): { requests: number; window: number; remaining: number } {
    return { requests: 15, window: 1, remaining: this.rateLimitRemaining }
  }

  private createSignature(path: string, postData: string, nonce: string): string {
    const message =
      path +
      crypto
        .createHash("sha256")
        .update(nonce + postData)
        .digest()
    return crypto.createHmac("sha512", Buffer.from(this.secretKey, "base64")).update(message).digest("base64")
  }

  private normalizeTicker(data: any, symbol: string): any {
    return {
      symbol,
      price: Number.parseFloat(data.c[0]),
      change: Number.parseFloat(data.p[1]),
      changePercent: Number.parseFloat(data.p[1]),
      volume: Number.parseFloat(data.v[1]),
      high: Number.parseFloat(data.h[1]),
      low: Number.parseFloat(data.l[1]),
      timestamp: Date.now(),
    }
  }

  private normalizeOrderBook(data: any, symbol: string): any {
    return {
      symbol,
      bids: data.b?.map((bid: string[]) => [Number.parseFloat(bid[0]), Number.parseFloat(bid[1])]) || [],
      asks: data.a?.map((ask: string[]) => [Number.parseFloat(ask[0]), Number.parseFloat(ask[1])]) || [],
      timestamp: Date.now(),
    }
  }
}

export class OKXAdapter implements ExchangeAdapter {
  id = "okx"
  name = "OKX"
  private apiKey = ""
  private secretKey = ""
  private passphrase = ""
  private baseUrl = "https://www.okx.com"
  private wsUrl = "wss://ws.okx.com:8443/ws/v5/public"
  private rateLimitRemaining = 20

  async authenticate(credentials: { apiKey: string; secretKey: string; passphrase: string }): Promise<boolean> {
    this.apiKey = credentials.apiKey
    this.secretKey = credentials.secretKey
    this.passphrase = credentials.passphrase

    try {
      const timestamp = new Date().toISOString()
      const method = "GET"
      const path = "/api/v5/account/balance"
      const signature = this.createSignature(timestamp, method, path, "")

      const response = await fetch(`${this.baseUrl}${path}`, {
        headers: {
          "OK-ACCESS-KEY": this.apiKey,
          "OK-ACCESS-SIGN": signature,
          "OK-ACCESS-TIMESTAMP": timestamp,
          "OK-ACCESS-PASSPHRASE": this.passphrase,
        },
      })

      if (response.ok) {
        const data = await response.json()
        return data.code === "0"
      }
      return false
    } catch (error) {
      console.error("OKX authentication error:", error)
      return false
    }
  }

  async getBalance(): Promise<any> {
    const timestamp = new Date().toISOString()
    const method = "GET"
    const path = "/api/v5/account/balance"
    const signature = this.createSignature(timestamp, method, path, "")

    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        "OK-ACCESS-KEY": this.apiKey,
        "OK-ACCESS-SIGN": signature,
        "OK-ACCESS-TIMESTAMP": timestamp,
        "OK-ACCESS-PASSPHRASE": this.passphrase,
      },
    })

    if (!response.ok) {
      throw new Error(`OKX API error: ${response.statusText}`)
    }

    const data = await response.json()
    if (data.code !== "0") {
      throw new Error(`OKX API error: ${data.msg}`)
    }

    return {
      balances: data.data[0]?.details || [],
      accountType: "spot",
      canTrade: true,
      canWithdraw: true,
      canDeposit: true,
    }
  }

  async getOrderBook(symbol: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v5/market/books?instId=${symbol}&sz=100`)

    if (!response.ok) {
      throw new Error(`OKX API error: ${response.statusText}`)
    }

    const data = await response.json()
    if (data.code !== "0") {
      throw new Error(`OKX API error: ${data.msg}`)
    }

    const bookData = data.data[0]
    return {
      symbol,
      bids: bookData.bids.map((bid: string[]) => [Number.parseFloat(bid[0]), Number.parseFloat(bid[1])]),
      asks: bookData.asks.map((ask: string[]) => [Number.parseFloat(ask[0]), Number.parseFloat(ask[1])]),
      timestamp: Number.parseInt(bookData.ts),
    }
  }

  async placeLimitOrder(symbol: string, side: "buy" | "sell", amount: number, price: number): Promise<any> {
    const timestamp = new Date().toISOString()
    const method = "POST"
    const path = "/api/v5/trade/order"
    const body = JSON.stringify({
      instId: symbol,
      tdMode: "cash",
      side,
      ordType: "limit",
      sz: amount.toString(),
      px: price.toString(),
    })

    const signature = this.createSignature(timestamp, method, path, body)

    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: {
        "OK-ACCESS-KEY": this.apiKey,
        "OK-ACCESS-SIGN": signature,
        "OK-ACCESS-TIMESTAMP": timestamp,
        "OK-ACCESS-PASSPHRASE": this.passphrase,
        "Content-Type": "application/json",
      },
      body,
    })

    if (!response.ok) {
      throw new Error(`OKX API error: ${response.statusText}`)
    }

    const data = await response.json()
    if (data.code !== "0") {
      throw new Error(`OKX order error: ${data.msg}`)
    }

    return data.data[0]
  }

  async placeMarketOrder(symbol: string, side: "buy" | "sell", amount: number): Promise<any> {
    const timestamp = new Date().toISOString()
    const method = "POST"
    const path = "/api/v5/trade/order"
    const body = JSON.stringify({
      instId: symbol,
      tdMode: "cash",
      side,
      ordType: "market",
      sz: amount.toString(),
    })

    const signature = this.createSignature(timestamp, method, path, body)

    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: {
        "OK-ACCESS-KEY": this.apiKey,
        "OK-ACCESS-SIGN": signature,
        "OK-ACCESS-TIMESTAMP": timestamp,
        "OK-ACCESS-PASSPHRASE": this.passphrase,
        "Content-Type": "application/json",
      },
      body,
    })

    if (!response.ok) {
      throw new Error(`OKX API error: ${response.statusText}`)
    }

    const data = await response.json()
    if (data.code !== "0") {
      throw new Error(`OKX order error: ${data.msg}`)
    }

    return data.data[0]
  }

  async cancelOrder(orderId: string): Promise<any> {
    const timestamp = new Date().toISOString()
    const method = "POST"
    const path = "/api/v5/trade/cancel-order"
    const body = JSON.stringify({
      ordId: orderId,
    })

    const signature = this.createSignature(timestamp, method, path, body)

    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: {
        "OK-ACCESS-KEY": this.apiKey,
        "OK-ACCESS-SIGN": signature,
        "OK-ACCESS-TIMESTAMP": timestamp,
        "OK-ACCESS-PASSPHRASE": this.passphrase,
        "Content-Type": "application/json",
      },
      body,
    })

    if (!response.ok) {
      throw new Error(`OKX API error: ${response.statusText}`)
    }

    const data = await response.json()
    if (data.code !== "0") {
      throw new Error(`OKX cancel error: ${data.msg}`)
    }

    return data.data[0]
  }

  async getOpenOrders(): Promise<any> {
    const timestamp = new Date().toISOString()
    const method = "GET"
    const path = "/api/v5/trade/orders-pending"
    const signature = this.createSignature(timestamp, method, path, "")

    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        "OK-ACCESS-KEY": this.apiKey,
        "OK-ACCESS-SIGN": signature,
        "OK-ACCESS-TIMESTAMP": timestamp,
        "OK-ACCESS-PASSPHRASE": this.passphrase,
      },
    })

    if (!response.ok) {
      throw new Error(`OKX API error: ${response.statusText}`)
    }

    const data = await response.json()
    if (data.code !== "0") {
      throw new Error(`OKX API error: ${data.msg}`)
    }

    return data.data
  }

  async getTradeHistory(): Promise<any> {
    const timestamp = new Date().toISOString()
    const method = "GET"
    const path = "/api/v5/trade/fills"
    const signature = this.createSignature(timestamp, method, path, "")

    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        "OK-ACCESS-KEY": this.apiKey,
        "OK-ACCESS-SIGN": signature,
        "OK-ACCESS-TIMESTAMP": timestamp,
        "OK-ACCESS-PASSPHRASE": this.passphrase,
      },
    })

    if (!response.ok) {
      throw new Error(`OKX API error: ${response.statusText}`)
    }

    const data = await response.json()
    if (data.code !== "0") {
      throw new Error(`OKX API error: ${data.msg}`)
    }

    return data.data
  }

  subscribeToTicker(symbol: string, callback: (data: any) => void): void {
    const ws = new WebSocket(this.wsUrl)

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          op: "subscribe",
          args: [
            {
              channel: "tickers",
              instId: symbol,
            },
          ],
        }),
      )
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.arg?.channel === "tickers") {
          callback(this.normalizeTicker(data.data[0]))
        }
      } catch (error) {
        console.error("WebSocket ticker error:", error)
      }
    }

    ws.onerror = (error) => {
      console.error("WebSocket ticker connection error:", error)
    }

    ws.onclose = () => {
      console.log("WebSocket ticker connection closed")
      setTimeout(() => this.subscribeToTicker(symbol, callback), 5000)
    }
  }

  subscribeToOrderBook(symbol: string, callback: (data: any) => void): void {
    const ws = new WebSocket(this.wsUrl)

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          op: "subscribe",
          args: [
            {
              channel: "books",
              instId: symbol,
            },
          ],
        }),
      )
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.arg?.channel === "books") {
          callback(this.normalizeOrderBook(data.data[0]))
        }
      } catch (error) {
        console.error("WebSocket orderbook error:", error)
      }
    }

    ws.onerror = (error) => {
      console.error("WebSocket orderbook connection error:", error)
    }

    ws.onclose = () => {
      console.log("WebSocket orderbook connection closed")
      setTimeout(() => this.subscribeToOrderBook(symbol, callback), 5000)
    }
  }

  getRateLimit(): { requests: number; window: number; remaining: number } {
    return { requests: 20, window: 2, remaining: this.rateLimitRemaining }
  }

  private createSignature(timestamp: string, method: string, path: string, body: string): string {
    const message = timestamp + method + path + body
    return crypto.createHmac("sha256", this.secretKey).update(message).digest("base64")
  }

  private normalizeTicker(data: any): any {
    return {
      symbol: data.instId,
      price: Number.parseFloat(data.last),
      change: Number.parseFloat(data.open24h) - Number.parseFloat(data.last),
      changePercent:
        ((Number.parseFloat(data.last) - Number.parseFloat(data.open24h)) / Number.parseFloat(data.open24h)) * 100,
      volume: Number.parseFloat(data.vol24h),
      high: Number.parseFloat(data.high24h),
      low: Number.parseFloat(data.low24h),
      timestamp: Number.parseInt(data.ts),
    }
  }

  private normalizeOrderBook(data: any): any {
    return {
      symbol: data.instId,
      bids: data.bids?.map((bid: string[]) => [Number.parseFloat(bid[0]), Number.parseFloat(bid[1])]) || [],
      asks: data.asks?.map((ask: string[]) => [Number.parseFloat(ask[0]), Number.parseFloat(ask[1])]) || [],
      timestamp: Number.parseInt(data.ts),
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
    if ("isTestnet" in adapter) {
      ;(adapter as any).isTestnet = testnet
    }
    return adapter
  }

  static getAllAdapters(): string[] {
    return Array.from(this.adapters.keys())
  }

  static initialize(): void {
    // Register all available adapters
    this.registerAdapter("binance", () => new BinanceAdapter())
    this.registerAdapter("bybit", () => new BybitAdapter())
    this.registerAdapter("coinbase", () => new CoinbaseAdapter())
    this.registerAdapter("kraken", () => new KrakenAdapter())
    this.registerAdapter("okx", () => new OKXAdapter())
  }
}

// Initialize adapters
ExchangeAdapterFactory.initialize()
