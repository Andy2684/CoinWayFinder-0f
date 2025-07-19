"use client"

import { useRealtimeMarketData } from "@/hooks/use-realtime-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, RefreshCw, Wifi, WifiOff } from "lucide-react"
import { useState } from "react"

const POPULAR_SYMBOLS = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "ADAUSDT", "SOLUSDT", "DOTUSDT"]

export function LiveMarketData() {
  const [selectedSymbols, setSelectedSymbols] = useState(POPULAR_SYMBOLS.slice(0, 4))
  const { data, isConnected } = useRealtimeMarketData(selectedSymbols)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)
  }

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? "+" : ""}${percent.toFixed(2)}%`
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`
    }
    return volume.toFixed(0)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Live Market Data</CardTitle>
        <div className="flex items-center space-x-2">
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 mr-1" />
                Connected
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 mr-1" />
                Disconnected
              </>
            )}
          </Badge>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {selectedSymbols.map((symbol) => {
            const marketData = data[symbol]
            if (!marketData) {
              return (
                <div key={symbol} className="p-4 border rounded-lg">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              )
            }

            const isPositive = marketData.changePercent >= 0

            return (
              <div key={symbol} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm">{symbol.replace("USDT", "/USDT")}</h3>
                  <div className={`flex items-center space-x-1 ${isPositive ? "text-green-600" : "text-red-600"}`}>
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xl font-bold">{formatPrice(marketData.price)}</div>

                  <div className={`text-sm font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
                    {formatPercent(marketData.changePercent)}
                  </div>

                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex justify-between">
                      <span>24h High:</span>
                      <span>{formatPrice(marketData.high24h)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>24h Low:</span>
                      <span>{formatPrice(marketData.low24h)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Volume:</span>
                      <span>{formatVolume(marketData.volume)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
