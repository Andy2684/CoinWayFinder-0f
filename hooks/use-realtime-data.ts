"use client"

import { useState, useEffect } from "react"
import { wsManager, type MarketData, type OrderBook, type Trade } from "@/lib/websocket-manager"

export function useRealtimeMarketData(symbols: string[] = []) {
  const [marketData, setMarketData] = useState<Record<string, MarketData>>({})
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "disconnected">("disconnected")

  useEffect(() => {
    if (symbols.length === 0) return

    const unsubscribeFunctions: (() => void)[] = []

    symbols.forEach((symbol) => {
      const unsubscribe = wsManager.subscribe(`market_${symbol}`, (message) => {
        if (message.type === "price_update") {
          setMarketData((prev) => ({
            ...prev,
            [symbol]: message.data,
          }))
        }
      })
      unsubscribeFunctions.push(unsubscribe)
    })

    setConnectionStatus("connected")

    return () => {
      unsubscribeFunctions.forEach((unsub) => unsub())
      setConnectionStatus("disconnected")
    }
  }, [symbols])

  return { marketData, connectionStatus }
}

export function useRealtimeOrderBook(symbol: string) {
  const [orderBook, setOrderBook] = useState<OrderBook | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "disconnected">("disconnected")

  useEffect(() => {
    if (!symbol) return

    const unsubscribe = wsManager.subscribe(`orderbook_${symbol}`, (message) => {
      if (message.type === "order_book") {
        setOrderBook(message.data)
      }
    })

    setConnectionStatus("connected")

    return () => {
      unsubscribe()
      setConnectionStatus("disconnected")
    }
  }, [symbol])

  return { orderBook, connectionStatus }
}

export function useRealtimeTrades(symbol: string, limit = 50) {
  const [trades, setTrades] = useState<Trade[]>([])
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "disconnected">("disconnected")

  useEffect(() => {
    if (!symbol) return

    const unsubscribe = wsManager.subscribe(`trades_${symbol}`, (message) => {
      if (message.type === "trade") {
        setTrades((prev) => {
          const newTrades = [message.data, ...prev].slice(0, limit)
          return newTrades
        })
      }
    })

    setConnectionStatus("connected")

    return () => {
      unsubscribe()
      setConnectionStatus("disconnected")
    }
  }, [symbol, limit])

  return { trades, connectionStatus }
}
