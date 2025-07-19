"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, RefreshCw, Activity } from "lucide-react"

interface MarketDataPoint {
  symbol: string
  price: number
  change24h: number
  changePercent24h: number
  volume24h: number
  lastUpdate: number
}

export function LiveMarketData() {
  const [marketData, setMarketData] = useState<MarketDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        // Simulate API call to fetch market data
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const symbols = ["BTCUSDT", "ETHUSDT", "ADAUSDT", "SOLUSDT", "DOTUSDT"]
        const data = symbols.map((symbol) => {
          const basePrice = getBasePrice(symbol)
          const change = (Math.random() - 0.5) * basePrice * 0.1

          return {
            symbol,
            price: basePrice + (Math.random() - 0.5) * basePrice * 0.02,
            change24h: change,
            changePercent24h: (change / basePrice) * 100,
            volume24h: Math.random() * 1000000,
            lastUpdate: Date.now(),
          }
        })

        setMarketData(data)
        setLastUpdate(new Date())
        setLoading(false)
      } catch (error) {
        console.error("Error fetching market data:", error)
        setLoading(false)
      }
    }

    fetchMarketData()

    // Update market data every 5 seconds
    const interval = setInterval(fetchMarketData, 5000)

    return () => clearInterval(interval)
  }, [])

  const getBasePrice = (symbol: string): number => {
    const prices: Record<string, number> = {
      BTCUSDT: 43000,
      ETHUSDT: 2600,
      ADAUSDT: 0.45,
      SOLUSDT: 95,
      DOTUSDT: 7.5,
    }
    return prices[symbol] || 100
  }

  const formatPrice = (price: number, symbol: string) => {
    const decimals = symbol.includes("USDT") ? 2 : 6
    return price.toFixed(decimals)
  }

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? "+" : ""}${percent.toFixed(2)}%`
  }

  const getChangeColor = (change: number) => {
    return change >= 0 ? "text-green-400" : "text-red-400"
  }

  if (loading) {
    return (
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Market Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-20"></div>
                  <div className="h-6 bg-gray-700 rounded w-24"></div>
                </div>
                <div className="h-4 bg-gray-700 rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Live Market Data</span>
            <Badge variant="outline" className="border-green-500 text-green-400">
              Live
            </Badge>
          </CardTitle>
          <div className="flex items-center space-x-2">
            {lastUpdate && <span className="text-xs text-gray-400">Updated: {lastUpdate.toLocaleTimeString()}</span>}
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="border-gray-600 text-white hover:bg-gray-800 bg-transparent"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {marketData.map((item) => (
            <div
              key={item.symbol}
              className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="space-y-1">
                <h3 className="font-medium text-white">{item.symbol.replace("USDT", "/USDT")}</h3>
                <p className="text-lg font-bold text-white">${formatPrice(item.price, item.symbol)}</p>
              </div>
              <div className="text-right space-y-1">
                <div className={`flex items-center space-x-1 ${getChangeColor(item.changePercent24h)}`}>
                  {item.changePercent24h >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span className="font-medium">{formatPercent(item.changePercent24h)}</span>
                </div>
                <p className="text-xs text-gray-400">Vol: {item.volume24h.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
