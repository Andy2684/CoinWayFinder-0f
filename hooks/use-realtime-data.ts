"use client"

import { useState, useEffect } from "react"
import { wsManager } from "@/lib/websocket-manager"

export interface MarketData {
  symbol: string
  price: string
  change24h: string
  volume: string
}

export interface OrderBookData {
  symbol: string
  bids: { price: string; quantity: string }[]
  asks: { price: string; quantity: string }[]
  timestamp: number
}

export interface TradeData {
  symbol: string
  price: string
  quantity: string
  side: "BUY" | "SELL"
  timestamp: number
}

export function useRealtimeMarketData() {
  const [marketData, setMarketData] = useState<MarketData[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const connectionId = wsManager.connect(
      "wss://stream.binance.com:9443/ws/!ticker@arr",
      (data: MarketData) => {
        setMarketData((prev) => {
          const existing = prev.find((item) => item.symbol === data.symbol)
          if (existing) {
            return prev.map((item) => (item.symbol === data.symbol ? data : item))
          }
          return [...prev, data]
        })
        setIsConnected(true)
      },
      () => setIsConnected(false),
    )

    return () => {
      if (connectionId) {
        wsManager.disconnect(connectionId)
      }
    }
  }, [])

  return { marketData, isConnected }
}

export function useRealtimeOrderBook(symbol = "BTCUSDT") {
  const [orderBook, setOrderBook] = useState<OrderBookData | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const connectionId = wsManager.connect(
      `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@depth`,
      (data: OrderBookData) => {
        setOrderBook(data)
        setIsConnected(true)
      },
      () => setIsConnected(false),
    )

    return () => {
      if (connectionId) {
        wsManager.disconnect(connectionId)
      }
    }
  }, [symbol])

  return { orderBook, isConnected }
}

export function useRealtimeTrades(symbol = "BTCUSDT") {
  const [trades, setTrades] = useState<TradeData[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const connectionId = wsManager.connect(
      `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@trade`,
      (data: TradeData) => {
        setTrades((prev) => [data, ...prev.slice(0, 49)]) // Keep last 50 trades
        setIsConnected(true)
      },
      () => setIsConnected(false),
    )

    return () => {
      if (connectionId) {
        wsManager.disconnect(connectionId)
      }
    }
  }, [symbol])

  return { trades, isConnected }
}
