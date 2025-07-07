import crypto from "crypto"

export interface ExchangeCredentials {
  apiKey: string
  secretKey: string
  passphrase?: string // For OKX
  sandbox?: boolean
}

export interface OrderRequest {
  symbol: string
  side: "buy" | "sell"
  type: "market" | "limit"
  amount: number
  price?: number
  timeInForce?: "GTC" | "IOC" | "FOK"
}

export interface OrderResponse {
  orderId: string
  symbol: string
  side: "buy" | "sell"
  amount: number
  price: number
  status: "pending" | "filled" | "cancelled" | "rejected"
  timestamp: number
}

export interface Balance {
  asset: string
  free: number
  locked: number
  total: number
}

export interface Ticker {
  symbol: string
  price: number
  change24h: number
  volume24h: number
  high24h: number
  low24h: number
  timestamp: number
}

export interface Kline {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export abstract class ExchangeAPIClient {
  protected credentials: ExchangeCredentials
  protected baseUrl: string
  protected wsUrl: string

  constructor(credentials: ExchangeCredentials) {
    this.credentials = credentials
    this.baseUrl = ""
    this.wsUrl = ""
  }

  abstract testConnection(): Promise<boolean>
  abstract getBalance(): Promise<Balance[]>
  abstract getTicker(symbol: string): Promise<Ticker>
  abstract getKlines(symbol: string, interval: string, limit?: number): Promise<Kline[]>
  abstract placeOrder(order: OrderRequest): Promise<OrderResponse>
  abstract cancelOrder(symbol: string, orderId: string): Promise<boolean>
  abstract getOrderStatus(symbol: string, orderId: string): Promise<OrderResponse>
  abstract getOpenOrders(symbol?: string): Promise<OrderResponse[]>
  abstract getOrderHistory(symbol?: string, limit?: number): Promise<OrderResponse[]>

  protected createSignature(timestamp: string, method: string, path: string, body = ""): string {
    const message = timestamp + method + path + body
    return crypto.createHmac("sha256", this.credentials.secretKey).update(message).digest("hex")
  }

  protected async makeRequest(
    method: "GET" | "POST" | "DELETE",
    endpoint: string,
    params: any = {},
    requiresAuth = true,
  ): Promise<any> {
    const timestamp = Date.now().toString()
    const url = new URL(endpoint, this.baseUrl)

    let body = ""
    if (method === "GET" && Object.keys(params).length > 0) {
      Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]))
    } else if (method === "POST" && Object.keys(params).length > 0) {
      body = JSON.stringify(params)
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    if (requiresAuth) {
      headers["X-MBX-APIKEY"] = this.credentials.apiKey
      if (method === "POST" || method === "DELETE") {
        const signature = this.createSignature(timestamp, method, url.pathname, body)
        headers["X-MBX-SIGNATURE"] = signature
        headers["X-MBX-TIMESTAMP"] = timestamp
      }
    }

    const response = await fetch(url.toString(), {
      method,
      headers,
      body: body || undefined,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API Error: ${response.status} - ${error}`)
    }

    return response.json()
  }
}

export class BinanceAPIClient extends ExchangeAPIClient {
  constructor(credentials: ExchangeCredentials) {
    super(credentials)
    this.baseUrl = credentials.sandbox ? "https://testnet.binance.vision/api/v3" : "https://api.binance.com/api/v3"
    this.wsUrl = credentials.sandbox ? "wss://testnet.binance.vision/ws" : "wss://stream.binance.com:9443/ws"
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest("GET", "/account")
      return response && typeof response === "object"
    } catch (error) {
      console.error("Binance connection test failed:", error)
      return false
    }
  }

  async getBalance(): Promise<Balance[]> {
    const response = await this.makeRequest("GET", "/account")
    return response.balances
      .map((balance: any) => ({
        asset: balance.asset,
        free: Number.parseFloat(balance.free),
        locked: Number.parseFloat(balance.locked),
        total: Number.parseFloat(balance.free) + Number.parseFloat(balance.locked),
      }))
      .filter((balance: Balance) => balance.total > 0)
  }

  async getTicker(symbol: string): Promise<Ticker> {
    const response = await this.makeRequest("GET", "/ticker/24hr", { symbol }, false)
    return {
      symbol: response.symbol,
      price: Number.parseFloat(response.lastPrice),
      change24h: Number.parseFloat(response.priceChangePercent),
      volume24h: Number.parseFloat(response.volume),
      high24h: Number.parseFloat(response.highPrice),
      low24h: Number.parseFloat(response.lowPrice),
      timestamp: Date.now(),
    }
  }

  async getKlines(symbol: string, interval: string, limit = 100): Promise<Kline[]> {
    const response = await this.makeRequest("GET", "/klines", { symbol, interval, limit }, false)
    return response.map((kline: any[]) => ({
      timestamp: kline[0],
      open: Number.parseFloat(kline[1]),
      high: Number.parseFloat(kline[2]),
      low: Number.parseFloat(kline[3]),
      close: Number.parseFloat(kline[4]),
      volume: Number.parseFloat(kline[5]),
    }))
  }

  async placeOrder(order: OrderRequest): Promise<OrderResponse> {
    const params: any = {
      symbol: order.symbol,
      side: order.side.toUpperCase(),
      type: order.type.toUpperCase(),
      quantity: order.amount.toString(),
      timestamp: Date.now(),
    }

    if (order.type === "limit") {
      params.price = order.price?.toString()
      params.timeInForce = order.timeInForce || "GTC"
    }

    const response = await this.makeRequest("POST", "/order", params)

    return {
      orderId: response.orderId.toString(),
      symbol: response.symbol,
      side: response.side.toLowerCase() as "buy" | "sell",
      amount: Number.parseFloat(response.origQty),
      price: Number.parseFloat(response.price || response.fills?.[0]?.price || "0"),
      status: this.mapOrderStatus(response.status),
      timestamp: response.transactTime,
    }
  }

  async cancelOrder(symbol: string, orderId: string): Promise<boolean> {
    try {
      await this.makeRequest("DELETE", "/order", {
        symbol,
        orderId: Number.parseInt(orderId),
        timestamp: Date.now(),
      })
      return true
    } catch (error) {
      console.error("Failed to cancel order:", error)
      return false
    }
  }

  async getOrderStatus(symbol: string, orderId: string): Promise<OrderResponse> {
    const response = await this.makeRequest("GET", "/order", {
      symbol,
      orderId: Number.parseInt(orderId),
    })

    return {
      orderId: response.orderId.toString(),
      symbol: response.symbol,
      side: response.side.toLowerCase() as "buy" | "sell",
      amount: Number.parseFloat(response.origQty),
      price: Number.parseFloat(response.price),
      status: this.mapOrderStatus(response.status),
      timestamp: response.time,
    }
  }

  async getOpenOrders(symbol?: string): Promise<OrderResponse[]> {
    const params = symbol ? { symbol } : {}
    const response = await this.makeRequest("GET", "/openOrders", params)

    return response.map((order: any) => ({
      orderId: order.orderId.toString(),
      symbol: order.symbol,
      side: order.side.toLowerCase() as "buy" | "sell",
      amount: Number.parseFloat(order.origQty),
      price: Number.parseFloat(order.price),
      status: this.mapOrderStatus(order.status),
      timestamp: order.time,
    }))
  }

  async getOrderHistory(symbol?: string, limit = 100): Promise<OrderResponse[]> {
    const params: any = { limit }
    if (symbol) params.symbol = symbol

    const response = await this.makeRequest("GET", "/allOrders", params)

    return response.map((order: any) => ({
      orderId: order.orderId.toString(),
      symbol: order.symbol,
      side: order.side.toLowerCase() as "buy" | "sell",
      amount: Number.parseFloat(order.origQty),
      price: Number.parseFloat(order.price),
      status: this.mapOrderStatus(order.status),
      timestamp: order.time,
    }))
  }

  private mapOrderStatus(status: string): "pending" | "filled" | "cancelled" | "rejected" {
    switch (status) {
      case "NEW":
      case "PARTIALLY_FILLED":
        return "pending"
      case "FILLED":
        return "filled"
      case "CANCELED":
      case "REJECTED":
      case "EXPIRED":
        return "cancelled"
      default:
        return "rejected"
    }
  }
}

export class BybitAPIClient extends ExchangeAPIClient {
  constructor(credentials: ExchangeCredentials) {
    super(credentials)
    this.baseUrl = credentials.sandbox ? "https://api-testnet.bybit.com" : "https://api.bybit.com"
    this.wsUrl = credentials.sandbox
      ? "wss://stream-testnet.bybit.com/v5/public/spot"
      : "wss://stream.bybit.com/v5/public/spot"
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest("GET", "/v5/account/wallet-balance", { accountType: "SPOT" })
      return response.retCode === 0
    } catch (error) {
      console.error("Bybit connection test failed:", error)
      return false
    }
  }

  async getBalance(): Promise<Balance[]> {
    const response = await this.makeRequest("GET", "/v5/account/wallet-balance", { accountType: "SPOT" })

    if (response.retCode !== 0) {
      throw new Error(`Bybit API Error: ${response.retMsg}`)
    }

    const balances: Balance[] = []
    response.result.list.forEach((account: any) => {
      account.coin.forEach((coin: any) => {
        const total = Number.parseFloat(coin.walletBalance)
        if (total > 0) {
          balances.push({
            asset: coin.coin,
            free: Number.parseFloat(coin.availableToWithdraw),
            locked: total - Number.parseFloat(coin.availableToWithdraw),
            total,
          })
        }
      })
    })

    return balances
  }

  async getTicker(symbol: string): Promise<Ticker> {
    const response = await this.makeRequest(
      "GET",
      "/v5/market/tickers",
      {
        category: "spot",
        symbol,
      },
      false,
    )

    if (response.retCode !== 0) {
      throw new Error(`Bybit API Error: ${response.retMsg}`)
    }

    const ticker = response.result.list[0]
    return {
      symbol: ticker.symbol,
      price: Number.parseFloat(ticker.lastPrice),
      change24h: Number.parseFloat(ticker.price24hPcnt) * 100,
      volume24h: Number.parseFloat(ticker.volume24h),
      high24h: Number.parseFloat(ticker.highPrice24h),
      low24h: Number.parseFloat(ticker.lowPrice24h),
      timestamp: Date.now(),
    }
  }

  async getKlines(symbol: string, interval: string, limit = 100): Promise<Kline[]> {
    const response = await this.makeRequest(
      "GET",
      "/v5/market/kline",
      {
        category: "spot",
        symbol,
        interval,
        limit,
      },
      false,
    )

    if (response.retCode !== 0) {
      throw new Error(`Bybit API Error: ${response.retMsg}`)
    }

    return response.result.list.map((kline: any[]) => ({
      timestamp: Number.parseInt(kline[0]),
      open: Number.parseFloat(kline[1]),
      high: Number.parseFloat(kline[2]),
      low: Number.parseFloat(kline[3]),
      close: Number.parseFloat(kline[4]),
      volume: Number.parseFloat(kline[5]),
    }))
  }

  async placeOrder(order: OrderRequest): Promise<OrderResponse> {
    const params: any = {
      category: "spot",
      symbol: order.symbol,
      side: order.side.charAt(0).toUpperCase() + order.side.slice(1),
      orderType: order.type.charAt(0).toUpperCase() + order.type.slice(1),
      qty: order.amount.toString(),
    }

    if (order.type === "limit") {
      params.price = order.price?.toString()
      params.timeInForce = order.timeInForce || "GTC"
    }

    const response = await this.makeRequest("POST", "/v5/order/create", params)

    if (response.retCode !== 0) {
      throw new Error(`Bybit API Error: ${response.retMsg}`)
    }

    return {
      orderId: response.result.orderId,
      symbol: order.symbol,
      side: order.side,
      amount: order.amount,
      price: order.price || 0,
      status: "pending",
      timestamp: Date.now(),
    }
  }

  async cancelOrder(symbol: string, orderId: string): Promise<boolean> {
    try {
      const response = await this.makeRequest("POST", "/v5/order/cancel", {
        category: "spot",
        symbol,
        orderId,
      })
      return response.retCode === 0
    } catch (error) {
      console.error("Failed to cancel order:", error)
      return false
    }
  }

  async getOrderStatus(symbol: string, orderId: string): Promise<OrderResponse> {
    const response = await this.makeRequest("GET", "/v5/order/realtime", {
      category: "spot",
      orderId,
    })

    if (response.retCode !== 0) {
      throw new Error(`Bybit API Error: ${response.retMsg}`)
    }

    const order = response.result.list[0]
    return {
      orderId: order.orderId,
      symbol: order.symbol,
      side: order.side.toLowerCase() as "buy" | "sell",
      amount: Number.parseFloat(order.qty),
      price: Number.parseFloat(order.price),
      status: this.mapOrderStatus(order.orderStatus),
      timestamp: Number.parseInt(order.createdTime),
    }
  }

  async getOpenOrders(symbol?: string): Promise<OrderResponse[]> {
    const params: any = { category: "spot" }
    if (symbol) params.symbol = symbol

    const response = await this.makeRequest("GET", "/v5/order/realtime", params)

    if (response.retCode !== 0) {
      throw new Error(`Bybit API Error: ${response.retMsg}`)
    }

    return response.result.list.map((order: any) => ({
      orderId: order.orderId,
      symbol: order.symbol,
      side: order.side.toLowerCase() as "buy" | "sell",
      amount: Number.parseFloat(order.qty),
      price: Number.parseFloat(order.price),
      status: this.mapOrderStatus(order.orderStatus),
      timestamp: Number.parseInt(order.createdTime),
    }))
  }

  async getOrderHistory(symbol?: string, limit = 100): Promise<OrderResponse[]> {
    const params: any = {
      category: "spot",
      limit: limit.toString(),
    }
    if (symbol) params.symbol = symbol

    const response = await this.makeRequest("GET", "/v5/order/history", params)

    if (response.retCode !== 0) {
      throw new Error(`Bybit API Error: ${response.retMsg}`)
    }

    return response.result.list.map((order: any) => ({
      orderId: order.orderId,
      symbol: order.symbol,
      side: order.side.toLowerCase() as "buy" | "sell",
      amount: Number.parseFloat(order.qty),
      price: Number.parseFloat(order.avgPrice || order.price),
      status: this.mapOrderStatus(order.orderStatus),
      timestamp: Number.parseInt(order.createdTime),
    }))
  }

  private mapOrderStatus(status: string): "pending" | "filled" | "cancelled" | "rejected" {
    switch (status) {
      case "New":
      case "PartiallyFilled":
        return "pending"
      case "Filled":
        return "filled"
      case "Cancelled":
      case "Rejected":
        return "cancelled"
      default:
        return "rejected"
    }
  }

  protected createSignature(timestamp: string, method: string, path: string, body = ""): string {
    const params = new URLSearchParams()
    if (body) {
      const bodyObj = JSON.parse(body)
      Object.keys(bodyObj).forEach((key) => {
        params.append(key, bodyObj[key])
      })
    }
    params.append("api_key", this.credentials.apiKey)
    params.append("timestamp", timestamp)

    const sortedParams = Array.from(params.entries()).sort()
    const queryString = sortedParams.map(([key, value]) => `${key}=${value}`).join("&")

    return crypto.createHmac("sha256", this.credentials.secretKey).update(queryString).digest("hex")
  }
}

export class KuCoinAPIClient extends ExchangeAPIClient {
  constructor(credentials: ExchangeCredentials) {
    super(credentials)
    this.baseUrl = credentials.sandbox ? "https://openapi-sandbox.kucoin.com" : "https://api.kucoin.com"
    this.wsUrl = credentials.sandbox ? "wss://ws-api-sandbox.kucoin.com" : "wss://ws-api-spot.kucoin.com"
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest("GET", "/api/v1/accounts")
      return response.code === "200000"
    } catch (error) {
      console.error("KuCoin connection test failed:", error)
      return false
    }
  }

  async getBalance(): Promise<Balance[]> {
    const response = await this.makeRequest("GET", "/api/v1/accounts")

    if (response.code !== "200000") {
      throw new Error(`KuCoin API Error: ${response.msg}`)
    }

    return response.data
      .map((account: any) => ({
        asset: account.currency,
        free: Number.parseFloat(account.available),
        locked: Number.parseFloat(account.holds),
        total: Number.parseFloat(account.balance),
      }))
      .filter((balance: Balance) => balance.total > 0)
  }

  async getTicker(symbol: string): Promise<Ticker> {
    const response = await this.makeRequest("GET", `/api/v1/market/stats?symbol=${symbol}`, {}, false)

    if (response.code !== "200000") {
      throw new Error(`KuCoin API Error: ${response.msg}`)
    }

    const ticker = response.data
    return {
      symbol: ticker.symbol,
      price: Number.parseFloat(ticker.last),
      change24h: Number.parseFloat(ticker.changeRate) * 100,
      volume24h: Number.parseFloat(ticker.vol),
      high24h: Number.parseFloat(ticker.high),
      low24h: Number.parseFloat(ticker.low),
      timestamp: Date.now(),
    }
  }

  async getKlines(symbol: string, interval: string, limit = 100): Promise<Kline[]> {
    const response = await this.makeRequest(
      "GET",
      `/api/v1/market/candles?symbol=${symbol}&type=${interval}&startAt=${Date.now() - limit * 60000}&endAt=${Date.now()}`,
      {},
      false,
    )

    if (response.code !== "200000") {
      throw new Error(`KuCoin API Error: ${response.msg}`)
    }

    return response.data.map((kline: any[]) => ({
      timestamp: Number.parseInt(kline[0]) * 1000,
      open: Number.parseFloat(kline[1]),
      close: Number.parseFloat(kline[2]),
      high: Number.parseFloat(kline[3]),
      low: Number.parseFloat(kline[4]),
      volume: Number.parseFloat(kline[5]),
    }))
  }

  async placeOrder(order: OrderRequest): Promise<OrderResponse> {
    const params: any = {
      clientOid: Date.now().toString(),
      side: order.side,
      symbol: order.symbol,
      type: order.type,
    }

    if (order.type === "market") {
      if (order.side === "buy") {
        params.funds = (order.amount * (order.price || 0)).toString()
      } else {
        params.size = order.amount.toString()
      }
    } else {
      params.size = order.amount.toString()
      params.price = order.price?.toString()
    }

    const response = await this.makeRequest("POST", "/api/v1/orders", params)

    if (response.code !== "200000") {
      throw new Error(`KuCoin API Error: ${response.msg}`)
    }

    return {
      orderId: response.data.orderId,
      symbol: order.symbol,
      side: order.side,
      amount: order.amount,
      price: order.price || 0,
      status: "pending",
      timestamp: Date.now(),
    }
  }

  async cancelOrder(symbol: string, orderId: string): Promise<boolean> {
    try {
      const response = await this.makeRequest("DELETE", `/api/v1/orders/${orderId}`)
      return response.code === "200000"
    } catch (error) {
      console.error("Failed to cancel order:", error)
      return false
    }
  }

  async getOrderStatus(symbol: string, orderId: string): Promise<OrderResponse> {
    const response = await this.makeRequest("GET", `/api/v1/orders/${orderId}`)

    if (response.code !== "200000") {
      throw new Error(`KuCoin API Error: ${response.msg}`)
    }

    const order = response.data
    return {
      orderId: order.id,
      symbol: order.symbol,
      side: order.side,
      amount: Number.parseFloat(order.size),
      price: Number.parseFloat(order.price),
      status: this.mapOrderStatus(order.isActive, order.cancelExist),
      timestamp: Number.parseInt(order.createdAt),
    }
  }

  async getOpenOrders(symbol?: string): Promise<OrderResponse[]> {
    const params = symbol ? { symbol } : {}
    const response = await this.makeRequest("GET", "/api/v1/orders", params)

    if (response.code !== "200000") {
      throw new Error(`KuCoin API Error: ${response.msg}`)
    }

    return response.data.items.map((order: any) => ({
      orderId: order.id,
      symbol: order.symbol,
      side: order.side,
      amount: Number.parseFloat(order.size),
      price: Number.parseFloat(order.price),
      status: this.mapOrderStatus(order.isActive, order.cancelExist),
      timestamp: Number.parseInt(order.createdAt),
    }))
  }

  async getOrderHistory(symbol?: string, limit = 100): Promise<OrderResponse[]> {
    const params: any = { status: "done" }
    if (symbol) params.symbol = symbol

    const response = await this.makeRequest("GET", "/api/v1/orders", params)

    if (response.code !== "200000") {
      throw new Error(`KuCoin API Error: ${response.msg}`)
    }

    return response.data.items.slice(0, limit).map((order: any) => ({
      orderId: order.id,
      symbol: order.symbol,
      side: order.side,
      amount: Number.parseFloat(order.size),
      price: Number.parseFloat(order.price),
      status: this.mapOrderStatus(order.isActive, order.cancelExist),
      timestamp: Number.parseInt(order.createdAt),
    }))
  }

  private mapOrderStatus(isActive: boolean, cancelExist: boolean): "pending" | "filled" | "cancelled" | "rejected" {
    if (isActive) return "pending"
    if (cancelExist) return "cancelled"
    return "filled"
  }

  protected createSignature(timestamp: string, method: string, path: string, body = ""): string {
    const message = timestamp + method + path + body
    return crypto.createHmac("sha256", this.credentials.secretKey).update(message).digest("base64")
  }
}

export class OKXAPIClient extends ExchangeAPIClient {
  constructor(credentials: ExchangeCredentials) {
    super(credentials)
    this.baseUrl = credentials.sandbox ? "https://www.okx.com" : "https://www.okx.com"
    this.wsUrl = credentials.sandbox ? "wss://wspap.okx.com:8443/ws/v5/public" : "wss://ws.okx.com:8443/ws/v5/public"
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest("GET", "/api/v5/account/balance")
      return response.code === "0"
    } catch (error) {
      console.error("OKX connection test failed:", error)
      return false
    }
  }

  async getBalance(): Promise<Balance[]> {
    const response = await this.makeRequest("GET", "/api/v5/account/balance")

    if (response.code !== "0") {
      throw new Error(`OKX API Error: ${response.msg}`)
    }

    const balances: Balance[] = []
    response.data.forEach((account: any) => {
      account.details.forEach((detail: any) => {
        const total = Number.parseFloat(detail.eq)
        if (total > 0) {
          balances.push({
            asset: detail.ccy,
            free: Number.parseFloat(detail.availEq),
            locked: total - Number.parseFloat(detail.availEq),
            total,
          })
        }
      })
    })

    return balances
  }

  async getTicker(symbol: string): Promise<Ticker> {
    const response = await this.makeRequest("GET", `/api/v5/market/ticker?instId=${symbol}`, {}, false)

    if (response.code !== "0") {
      throw new Error(`OKX API Error: ${response.msg}`)
    }

    const ticker = response.data[0]
    return {
      symbol: ticker.instId,
      price: Number.parseFloat(ticker.last),
      change24h: Number.parseFloat(ticker.chgUtc0) * 100,
      volume24h: Number.parseFloat(ticker.vol24h),
      high24h: Number.parseFloat(ticker.high24h),
      low24h: Number.parseFloat(ticker.low24h),
      timestamp: Number.parseInt(ticker.ts),
    }
  }

  async getKlines(symbol: string, interval: string, limit = 100): Promise<Kline[]> {
    const response = await this.makeRequest(
      "GET",
      `/api/v5/market/candles?instId=${symbol}&bar=${interval}&limit=${limit}`,
      {},
      false,
    )

    if (response.code !== "0") {
      throw new Error(`OKX API Error: ${response.msg}`)
    }

    return response.data.map((kline: any[]) => ({
      timestamp: Number.parseInt(kline[0]),
      open: Number.parseFloat(kline[1]),
      high: Number.parseFloat(kline[2]),
      low: Number.parseFloat(kline[3]),
      close: Number.parseFloat(kline[4]),
      volume: Number.parseFloat(kline[5]),
    }))
  }

  async placeOrder(order: OrderRequest): Promise<OrderResponse> {
    const params: any = {
      instId: order.symbol,
      tdMode: "cash",
      side: order.side,
      ordType: order.type,
      sz: order.amount.toString(),
    }

    if (order.type === "limit") {
      params.px = order.price?.toString()
    }

    const response = await this.makeRequest("POST", "/api/v5/trade/order", params)

    if (response.code !== "0") {
      throw new Error(`OKX API Error: ${response.msg}`)
    }

    return {
      orderId: response.data[0].ordId,
      symbol: order.symbol,
      side: order.side,
      amount: order.amount,
      price: order.price || 0,
      status: "pending",
      timestamp: Date.now(),
    }
  }

  async cancelOrder(symbol: string, orderId: string): Promise<boolean> {
    try {
      const response = await this.makeRequest("POST", "/api/v5/trade/cancel-order", {
        instId: symbol,
        ordId: orderId,
      })
      return response.code === "0"
    } catch (error) {
      console.error("Failed to cancel order:", error)
      return false
    }
  }

  async getOrderStatus(symbol: string, orderId: string): Promise<OrderResponse> {
    const response = await this.makeRequest("GET", `/api/v5/trade/order?instId=${symbol}&ordId=${orderId}`)

    if (response.code !== "0") {
      throw new Error(`OKX API Error: ${response.msg}`)
    }

    const order = response.data[0]
    return {
      orderId: order.ordId,
      symbol: order.instId,
      side: order.side,
      amount: Number.parseFloat(order.sz),
      price: Number.parseFloat(order.px),
      status: this.mapOrderStatus(order.state),
      timestamp: Number.parseInt(order.cTime),
    }
  }

  async getOpenOrders(symbol?: string): Promise<OrderResponse[]> {
    const params = symbol ? { instId: symbol } : {}
    const response = await this.makeRequest("GET", "/api/v5/trade/orders-pending", params)

    if (response.code !== "0") {
      throw new Error(`OKX API Error: ${response.msg}`)
    }

    return response.data.map((order: any) => ({
      orderId: order.ordId,
      symbol: order.instId,
      side: order.side,
      amount: Number.parseFloat(order.sz),
      price: Number.parseFloat(order.px),
      status: this.mapOrderStatus(order.state),
      timestamp: Number.parseInt(order.cTime),
    }))
  }

  async getOrderHistory(symbol?: string, limit = 100): Promise<OrderResponse[]> {
    const params: any = { instType: "SPOT" }
    if (symbol) params.instId = symbol

    const response = await this.makeRequest("GET", "/api/v5/trade/orders-history", params)

    if (response.code !== "0") {
      throw new Error(`OKX API Error: ${response.msg}`)
    }

    return response.data.slice(0, limit).map((order: any) => ({
      orderId: order.ordId,
      symbol: order.instId,
      side: order.side,
      amount: Number.parseFloat(order.sz),
      price: Number.parseFloat(order.avgPx || order.px),
      status: this.mapOrderStatus(order.state),
      timestamp: Number.parseInt(order.cTime),
    }))
  }

  private mapOrderStatus(state: string): "pending" | "filled" | "cancelled" | "rejected" {
    switch (state) {
      case "live":
      case "partially_filled":
        return "pending"
      case "filled":
        return "filled"
      case "canceled":
        return "cancelled"
      default:
        return "rejected"
    }
  }

  protected createSignature(timestamp: string, method: string, path: string, body = ""): string {
    const message = timestamp + method + path + body
    return crypto.createHmac("sha256", this.credentials.secretKey).update(message).digest("base64")
  }
}

export function createExchangeClient(exchange: string, credentials: ExchangeCredentials): ExchangeAPIClient {
  switch (exchange.toLowerCase()) {
    case "binance":
      return new BinanceAPIClient(credentials)
    case "bybit":
      return new BybitAPIClient(credentials)
    case "kucoin":
      return new KuCoinAPIClient(credentials)
    case "okx":
      return new OKXAPIClient(credentials)
    default:
      throw new Error(`Unsupported exchange: ${exchange}`)
  }
}
