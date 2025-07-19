"use client"

import { useState, useEffect } from "react"

export interface MarketData {
  symbol: string
  price: number
  change24h: number
  changePercent: number
  volume: number
  high24h: number
  low24h: number
  timestamp: number
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
  timestamp: number
}

export interface Trade {
  id: string
  symbol: string
  price: number
  quantity: number
  side: "buy" | "sell"
  timestamp: number
}

export interface PortfolioData {
  totalValue: number
  todayChange: number
  todayChangePercent: number
  positions: {
    symbol: string
    quantity: number
    value: number
    change: number
    changePercent: number
  }[]
}

// Mock data generators
const generateMockMarketData = (symbol: string): MarketData => {
  const basePrices: Record<string, number> = {
    BTCUSDT: 43000,
    ETHUSDT: 2600,
    BNBUSDT: 320,
    ADAUSDT: 0.45,
    SOLUSDT: 95,
    DOTUSDT: 7.2,
    LINKUSDT: 15.8,
    AVAXUSDT: 38.5,
  }

  const basePrice = basePrices[symbol] || 100
  const changePercent = (Math.random() - 0.5) * 10 // -5% to +5%
  const change24h = basePrice * (changePercent / 100)
  const price = basePrice + change24h

  return {
    symbol,
    price,
    change24h,
    changePercent,
    volume: Math.random() * 1000000,
    high24h: price * (1 + Math.random() * 0.05),
    low24h: price * (1 - Math.random() * 0.05),
    timestamp: Date.now(),
  }
}

const generateMockOrderBook = (symbol: string): OrderBook => {
  const basePrices: Record<string, number> = {
    BTCUSDT: 43000,
    ETHUSDT: 2600,
    BNBUSDT: 320,
  }

  const basePrice = basePrices[symbol] || 100
  const bids: OrderBookEntry[] = []
  const asks: OrderBookEntry[] = []

  for (let i = 0; i < 10; i++) {
    const bidPrice = basePrice - (i + 1) * (basePrice * 0.001)
    const askPrice = basePrice + (i + 1) * (basePrice * 0.001)
    const quantity = Math.random() * 10

    bids.push({
      price: bidPrice,
      quantity,
      total: bidPrice * quantity,
    })

    asks.push({
      price: askPrice,
      quantity,
      total: askPrice * quantity,
    })
  }

  return {
    symbol,
    bids,
    asks,
    timestamp: Date.now(),
  }
}

const generateMockTrade = (symbol: string): Trade => {
  const basePrices: Record<string, number> = {
    BTCUSDT: 43000,
    ETHUSDT: 2600,
    BNBUSDT: 320,
  }

  const basePrice = basePrices[symbol] || 100
  const price = basePrice + (Math.random() - 0.5) * basePrice * 0.01

  return {
    id: Math.random().toString(36).substr(2, 9),
    symbol,
    price,
    quantity: Math.random() * 5,
    side: Math.random() > 0.5 ? "buy" : "sell",
    timestamp: Date.now(),
  }
}

export function useRealtimeMarketData(symbols: string[]) {
  const [data, setData] = useState<Record<string, MarketData>>({})
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const intervals: NodeJS.Timeout[] = []

    symbols.forEach((symbol) => {
      const interval = setInterval(
        () => {
          const marketData = generateMockMarketData(symbol)
          setData((prev) => ({
            ...prev,
            [symbol]: marketData,
          }))
        },
        1000 + Math.random() * 2000,
      )

      intervals.push(interval)
    })

    setIsConnected(true)

    return () => {
      intervals.forEach(clearInterval)
      setIsConnected(false)
    }
  }, [symbols])

  return { data, isConnected }
}

export function useRealtimeOrderBook(symbol: string) {
  const [orderBook, setOrderBook] = useState<OrderBook | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      const newOrderBook = generateMockOrderBook(symbol)
      setOrderBook(newOrderBook)
    }, 500)

    setIsConnected(true)

    return () => {
      clearInterval(interval)
      setIsConnected(false)
    }
  }, [symbol])

  return { orderBook, isConnected }
}

export function useRealtimeTrades(symbol: string) {
  const [trades, setTrades] = useState<Trade[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const interval = setInterval(
      () => {
        const newTrade = generateMockTrade(symbol)
        setTrades((prev) => [newTrade, ...prev.slice(0, 49)])
      },
      2000 + Math.random() * 3000,
    )

    setIsConnected(true)

    return () => {
      clearInterval(interval)
      setIsConnected(false)
    }
  }, [symbol])

  return { trades, isConnected }
}

export function useRealtimePortfolio() {
  const [portfolio, setPortfolio] = useState<PortfolioData>({
    totalValue: 12450.67,
    todayChange: 234.56,
    todayChangePercent: 1.92,
    positions: [
      { symbol: "BTC", quantity: 0.25, value: 10750, change: 125.5, changePercent: 1.18 },
      { symbol: "ETH", quantity: 2.5, value: 6500, change: 89.25, changePercent: 1.39 },
      { symbol: "BNB", quantity: 15, value: 4800, change: -45.75, changePercent: -0.94 },
    ],
  })
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setPortfolio((prev) => ({
        ...prev,
        totalValue: prev.totalValue + (Math.random() - 0.5) * 100,
        todayChange: prev.todayChange + (Math.random() - 0.5) * 20,
        todayChangePercent: prev.todayChangePercent + (Math.random() - 0.5) * 0.5,
        positions: prev.positions.map((pos) => ({
          ...pos,
          value: pos.value + (Math.random() - 0.5) * 50,
          change: pos.change + (Math.random() - 0.5) * 10,
          changePercent: pos.changePercent + (Math.random() - 0.5) * 0.2,
        })),
      }))
    }, 5000)

    setIsConnected(true)

    return () => {
      clearInterval(interval)
      setIsConnected(false)
    }
  }, [])

  return { portfolio, isConnected }
}
