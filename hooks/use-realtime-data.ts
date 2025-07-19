"use client"

import { useState, useEffect } from "react"

export interface MarketData {
  symbol: string
  price: number
  change: number
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

// Mock data generators for demo purposes
const generateMockMarketData = (symbol: string): MarketData => {
  const basePrice = symbol === "BTCUSDT" ? 45000 : symbol === "ETHUSDT" ? 3000 : 100
  const change = (Math.random() - 0.5) * basePrice * 0.05
  const price = basePrice + change

  return {
    symbol,
    price,
    change,
    changePercent: (change / basePrice) * 100,
    volume: Math.random() * 1000000,
    high24h: price * (1 + Math.random() * 0.1),
    low24h: price * (1 - Math.random() * 0.1),
    timestamp: Date.now(),
  }
}

const generateMockOrderBook = (symbol: string): OrderBook => {
  const basePrice = symbol === "BTCUSDT" ? 45000 : symbol === "ETHUSDT" ? 3000 : 100
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
  const basePrice = symbol === "BTCUSDT" ? 45000 : symbol === "ETHUSDT" ? 3000 : 100
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
    // Simulate WebSocket connection with intervals
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
      ) // Random interval between 1-3 seconds

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
    }, 500) // Update every 500ms

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
        setTrades((prev) => [newTrade, ...prev.slice(0, 49)]) // Keep last 50 trades
      },
      2000 + Math.random() * 3000,
    ) // Random interval between 2-5 seconds

    setIsConnected(true)

    return () => {
      clearInterval(interval)
      setIsConnected(false)
    }
  }, [symbol])

  return { trades, isConnected }
}
