"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { wsManager, type MarketDataUpdate, type OrderBookUpdate, type TradeUpdate } from "@/lib/websocket-manager"

export function useRealtimeMarketData(symbols: string[]) {
  const [data, setData] = useState<Record<string, MarketDataUpdate>>({})
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (symbols.length === 0) return

    setError(null)
    setIsConnected(false)

    const handleMarketData = (update: MarketDataUpdate) => {
      setData((prev) => ({
        ...prev,
        [update.symbol]: update,
      }))
      setIsConnected(true)
    }

    const handleError = (error: any) => {
      setError(error.message || "Connection error")
      setIsConnected(false)
    }

    try {
      unsubscribeRef.current = wsManager.subscribeToMarketData(symbols, handleMarketData)

      // Check connection status periodically
      const statusInterval = setInterval(() => {
        const status = wsManager.getConnectionStatus(`market:${symbols.join(",")}`)
        setIsConnected(status === "connected")
      }, 5000)

      return () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current()
        }
        clearInterval(statusInterval)
      }
    } catch (error) {
      handleError(error)
    }
  }, [symbols.join(",")])

  const reconnect = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current()
    }
    // Trigger re-subscription by updating symbols
    setData({})
    setError(null)
  }, [])

  return {
    data: Object.values(data),
    isConnected,
    error,
    reconnect,
  }
}

export function useRealtimeOrderBook(symbol: string) {
  const [orderBook, setOrderBook] = useState<OrderBookUpdate | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!symbol) return

    setError(null)
    setIsConnected(false)

    const handleOrderBook = (update: OrderBookUpdate) => {
      setOrderBook(update)
      setIsConnected(true)
    }

    const handleError = (error: any) => {
      setError(error.message || "Connection error")
      setIsConnected(false)
    }

    try {
      unsubscribeRef.current = wsManager.subscribeToOrderBook(symbol, handleOrderBook)

      return () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current()
        }
      }
    } catch (error) {
      handleError(error)
    }
  }, [symbol])

  return {
    orderBook,
    isConnected,
    error,
  }
}

export function useRealtimeTrades() {
  const [trades, setTrades] = useState<TradeUpdate[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const unsubscribeRef = useRef<(() => void) | null>(null)
  const maxTrades = 50

  useEffect(() => {
    setError(null)
    setIsConnected(false)

    const handleTrade = (trade: TradeUpdate) => {
      setTrades((prev) => {
        const newTrades = [trade, ...prev].slice(0, maxTrades)
        return newTrades
      })
      setIsConnected(true)
    }

    const handleError = (error: any) => {
      setError(error.message || "Connection error")
      setIsConnected(false)
    }

    try {
      unsubscribeRef.current = wsManager.subscribeToTrades(handleTrade)

      return () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current()
        }
      }
    } catch (error) {
      handleError(error)
    }
  }, [])

  const clearTrades = useCallback(() => {
    setTrades([])
  }, [])

  return {
    trades,
    isConnected,
    error,
    clearTrades,
  }
}
