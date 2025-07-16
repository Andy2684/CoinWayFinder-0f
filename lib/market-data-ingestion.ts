// Real-time market data ingestion from multiple exchanges

import { ExchangeAdapterFactory } from './exchange-adapters'

export interface MarketData {
  symbol: string
  exchange: string
  price: number
  volume: number
  change: number
  changePercent: number
  high: number
  low: number
  timestamp: number
}

export interface OrderBookData {
  symbol: string
  exchange: string
  bids: [number, number][]
  asks: [number, number][]
  timestamp: number
}

export class MarketDataManager {
  private static instance: MarketDataManager
  private subscribers: Map<string, ((data: MarketData) => void)[]> = new Map()
  private orderBookSubscribers: Map<string, ((data: OrderBookData) => void)[]> = new Map()
  private connections: Map<string, WebSocket> = new Map()
  private reconnectAttempts: Map<string, number> = new Map()
  private maxReconnectAttempts = 5
  private reconnectDelay = 5000

  static getInstance(): MarketDataManager {
    if (!MarketDataManager.instance) {
      MarketDataManager.instance = new MarketDataManager()
    }
    return MarketDataManager.instance
  }

  // Subscribe to ticker updates for a symbol
  subscribeTicker(symbol: string, exchange: string, callback: (data: MarketData) => void): void {
    const key = `${exchange}:${symbol}:ticker`

    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, [])
      this.startTickerStream(symbol, exchange)
    }

    this.subscribers.get(key)!.push(callback)
  }

  // Subscribe to order book updates for a symbol
  subscribeOrderBook(
    symbol: string,
    exchange: string,
    callback: (data: OrderBookData) => void
  ): void {
    const key = `${exchange}:${symbol}:orderbook`

    if (!this.orderBookSubscribers.has(key)) {
      this.orderBookSubscribers.set(key, [])
      this.startOrderBookStream(symbol, exchange)
    }

    this.orderBookSubscribers.get(key)!.push(callback)
  }

  // Unsubscribe from ticker updates
  unsubscribeTicker(symbol: string, exchange: string, callback: (data: MarketData) => void): void {
    const key = `${exchange}:${symbol}:ticker`
    const subscribers = this.subscribers.get(key)

    if (subscribers) {
      const index = subscribers.indexOf(callback)
      if (index > -1) {
        subscribers.splice(index, 1)
      }

      if (subscribers.length === 0) {
        this.subscribers.delete(key)
        this.stopStream(key)
      }
    }
  }

  // Unsubscribe from order book updates
  unsubscribeOrderBook(
    symbol: string,
    exchange: string,
    callback: (data: OrderBookData) => void
  ): void {
    const key = `${exchange}:${symbol}:orderbook`
    const subscribers = this.orderBookSubscribers.get(key)

    if (subscribers) {
      const index = subscribers.indexOf(callback)
      if (index > -1) {
        subscribers.splice(index, 1)
      }

      if (subscribers.length === 0) {
        this.orderBookSubscribers.delete(key)
        this.stopStream(key)
      }
    }
  }

  // Get current market data for multiple symbols
  async getMarketData(symbols: string[], exchange: string): Promise<MarketData[]> {
    const adapter = ExchangeAdapterFactory.getAdapter(exchange)
    if (!adapter) {
      throw new Error(`Exchange ${exchange} not supported`)
    }

    const marketData: MarketData[] = []

    for (const symbol of symbols) {
      try {
        // For real implementation, we'd use a batch API call if available
        const ticker = await this.fetchTicker(symbol, exchange)
        if (ticker) {
          marketData.push(ticker)
        }
      } catch (error) {
        console.error(`Error fetching ticker for ${symbol} on ${exchange}:`, error)
      }
    }

    return marketData
  }

  // Get aggregated market data from multiple exchanges
  async getAggregatedMarketData(symbol: string, exchanges: string[]): Promise<MarketData[]> {
    const promises = exchanges.map((exchange) => this.fetchTicker(symbol, exchange))
    const results = await Promise.allSettled(promises)

    return results
      .filter(
        (result): result is PromiseFulfilledResult<MarketData> =>
          result.status === 'fulfilled' && result.value !== null
      )
      .map((result) => result.value)
  }

  // Get best bid/ask across exchanges
  async getBestPrice(
    symbol: string,
    exchanges: string[]
  ): Promise<{
    bestBid: { price: number; exchange: string } | null
    bestAsk: { price: number; exchange: string } | null
  }> {
    const orderBooks = await Promise.allSettled(
      exchanges.map(async (exchange) => {
        const adapter = ExchangeAdapterFactory.getAdapter(exchange)
        if (!adapter) return null

        try {
          const orderBook = await adapter.getOrderBook(symbol)
          return { ...orderBook, exchange }
        } catch (error) {
          console.error(`Error fetching order book for ${symbol} on ${exchange}:`, error)
          return null
        }
      })
    )

    let bestBid: { price: number; exchange: string } | null = null
    let bestAsk: { price: number; exchange: string } | null = null

    orderBooks.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        const { bids, asks, exchange } = result.value

        if (bids.length > 0) {
          const topBid = bids[0][0]
          if (!bestBid || topBid > bestBid.price) {
            bestBid = { price: topBid, exchange }
          }
        }

        if (asks.length > 0) {
          const topAsk = asks[0][0]
          if (!bestAsk || topAsk < bestAsk.price) {
            bestAsk = { price: topAsk, exchange }
          }
        }
      }
    })

    return { bestBid, bestAsk }
  }

  private async fetchTicker(symbol: string, exchange: string): Promise<MarketData | null> {
    try {
      // Use public API endpoints that don't require authentication
      switch (exchange.toLowerCase()) {
        case 'binance':
          return await this.fetchBinanceTicker(symbol)
        case 'bybit':
          return await this.fetchBybitTicker(symbol)
        default:
          console.warn(`Ticker fetching not implemented for ${exchange}`)
          return null
      }
    } catch (error) {
      console.error(`Error fetching ticker for ${symbol} on ${exchange}:`, error)
      return null
    }
  }

  private async fetchBinanceTicker(symbol: string): Promise<MarketData | null> {
    try {
      const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`)
      if (!response.ok) return null

      const data = await response.json()
      return {
        symbol: data.symbol,
        exchange: 'binance',
        price: Number.parseFloat(data.lastPrice),
        volume: Number.parseFloat(data.volume),
        change: Number.parseFloat(data.priceChange),
        changePercent: Number.parseFloat(data.priceChangePercent),
        high: Number.parseFloat(data.highPrice),
        low: Number.parseFloat(data.lowPrice),
        timestamp: Date.now(),
      }
    } catch (error) {
      console.error('Error fetching Binance ticker:', error)
      return null
    }
  }

  private async fetchBybitTicker(symbol: string): Promise<MarketData | null> {
    try {
      const response = await fetch(
        `https://api.bybit.com/v5/market/tickers?category=spot&symbol=${symbol}`
      )
      if (!response.ok) return null

      const data = await response.json()
      if (data.retCode !== 0 || !data.result.list.length) return null

      const ticker = data.result.list[0]
      return {
        symbol: ticker.symbol,
        exchange: 'bybit',
        price: Number.parseFloat(ticker.lastPrice),
        volume: Number.parseFloat(ticker.volume24h),
        change: Number.parseFloat(ticker.price24hPcnt) * Number.parseFloat(ticker.lastPrice),
        changePercent: Number.parseFloat(ticker.price24hPcnt) * 100,
        high: Number.parseFloat(ticker.highPrice24h),
        low: Number.parseFloat(ticker.lowPrice24h),
        timestamp: Date.now(),
      }
    } catch (error) {
      console.error('Error fetching Bybit ticker:', error)
      return null
    }
  }

  private startTickerStream(symbol: string, exchange: string): void {
    const adapter = ExchangeAdapterFactory.getAdapter(exchange)
    if (!adapter) return

    const key = `${exchange}:${symbol}:ticker`

    try {
      adapter.subscribeToTicker(symbol, (data) => {
        const marketData: MarketData = {
          symbol: data.symbol,
          exchange,
          price: data.price,
          volume: data.volume || 0,
          change: data.change || 0,
          changePercent: data.changePercent || 0,
          high: data.high || 0,
          low: data.low || 0,
          timestamp: data.timestamp || Date.now(),
        }

        const subscribers = this.subscribers.get(key)
        if (subscribers) {
          subscribers.forEach((callback) => callback(marketData))
        }
      })

      this.reconnectAttempts.set(key, 0)
    } catch (error) {
      console.error(`Error starting ticker stream for ${key}:`, error)
      this.handleReconnect(key, () => this.startTickerStream(symbol, exchange))
    }
  }

  private startOrderBookStream(symbol: string, exchange: string): void {
    const adapter = ExchangeAdapterFactory.getAdapter(exchange)
    if (!adapter) return

    const key = `${exchange}:${symbol}:orderbook`

    try {
      adapter.subscribeToOrderBook(symbol, (data) => {
        const orderBookData: OrderBookData = {
          symbol: data.symbol,
          exchange,
          bids: data.bids || [],
          asks: data.asks || [],
          timestamp: data.timestamp || Date.now(),
        }

        const subscribers = this.orderBookSubscribers.get(key)
        if (subscribers) {
          subscribers.forEach((callback) => callback(orderBookData))
        }
      })

      this.reconnectAttempts.set(key, 0)
    } catch (error) {
      console.error(`Error starting order book stream for ${key}:`, error)
      this.handleReconnect(key, () => this.startOrderBookStream(symbol, exchange))
    }
  }

  private stopStream(key: string): void {
    const connection = this.connections.get(key)
    if (connection) {
      connection.close()
      this.connections.delete(key)
    }
    this.reconnectAttempts.delete(key)
  }

  private handleReconnect(key: string, reconnectFn: () => void): void {
    const attempts = this.reconnectAttempts.get(key) || 0

    if (attempts < this.maxReconnectAttempts) {
      this.reconnectAttempts.set(key, attempts + 1)
      setTimeout(
        () => {
          console.log(`Attempting to reconnect ${key} (attempt ${attempts + 1})`)
          reconnectFn()
        },
        this.reconnectDelay * Math.pow(2, attempts)
      ) // Exponential backoff
    } else {
      console.error(`Max reconnection attempts reached for ${key}`)
    }
  }

  // Get popular trading pairs for an exchange
  async getPopularPairs(exchange: string): Promise<string[]> {
    try {
      switch (exchange.toLowerCase()) {
        case 'binance':
          return await this.getBinancePopularPairs()
        case 'bybit':
          return await this.getBybitPopularPairs()
        default:
          return ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT']
      }
    } catch (error) {
      console.error(`Error fetching popular pairs for ${exchange}:`, error)
      return ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT']
    }
  }

  private async getBinancePopularPairs(): Promise<string[]> {
    try {
      const response = await fetch('https://api.binance.com/api/v3/ticker/24hr')
      if (!response.ok) throw new Error('Failed to fetch Binance tickers')

      const tickers = await response.json()
      return tickers
        .filter((ticker: any) => ticker.symbol.endsWith('USDT'))
        .sort(
          (a: any, b: any) => Number.parseFloat(b.quoteVolume) - Number.parseFloat(a.quoteVolume)
        )
        .slice(0, 20)
        .map((ticker: any) => ticker.symbol)
    } catch (error) {
      console.error('Error fetching Binance popular pairs:', error)
      return ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT']
    }
  }

  private async getBybitPopularPairs(): Promise<string[]> {
    try {
      const response = await fetch('https://api.bybit.com/v5/market/tickers?category=spot')
      if (!response.ok) throw new Error('Failed to fetch Bybit tickers')

      const data = await response.json()
      if (data.retCode !== 0) throw new Error('Bybit API error')

      return data.result.list
        .filter((ticker: any) => ticker.symbol.endsWith('USDT'))
        .sort(
          (a: any, b: any) => Number.parseFloat(b.turnover24h) - Number.parseFloat(a.turnover24h)
        )
        .slice(0, 20)
        .map((ticker: any) => ticker.symbol)
    } catch (error) {
      console.error('Error fetching Bybit popular pairs:', error)
      return ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'ADAUSDT', 'DOTUSDT']
    }
  }
}

// Export singleton instance
export const marketDataManager = MarketDataManager.getInstance()
