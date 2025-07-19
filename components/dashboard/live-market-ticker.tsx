"use client"

import { useRealtimeMarketData } from "@/hooks/use-realtime-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Wifi, WifiOff } from "lucide-react"

const SYMBOLS = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "ADAUSDT", "SOLUSDT", "DOTUSDT", "LINKUSDT", "AVAXUSDT"]

export function LiveMarketTicker() {
  const { data, isConnected } = useRealtimeMarketData(SYMBOLS)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: price < 1 ? 4 : 2,
    }).format(price)
  }

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? "+" : ""}${percent.toFixed(2)}%`
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Live Market Data</CardTitle>
        <Badge variant={isConnected ? "default" : "destructive"} className="text-xs">
          {isConnected ? (
            <>
              <Wifi className="w-3 h-3 mr-1" />
              Live
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 mr-1" />
              Disconnected
            </>
          )}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SYMBOLS.slice(0, 8).map((symbol) => {
            const marketData = data[symbol]
            if (!marketData) {
              return (
                <div key={symbol} className="p-3 border rounded-lg animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
              )
            }

            const isPositive = marketData.changePercent >= 0

            return (
              <div key={symbol} className="p-3 border rounded-lg hover:shadow-md transition-shadow bg-card">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm">{symbol.replace("USDT", "/USDT")}</h3>
                  <div className={`flex items-center space-x-1 ${isPositive ? "text-green-600" : "text-red-600"}`}>
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-lg font-bold">{formatPrice(marketData.price)}</div>
                  <div className={`text-sm font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
                    {formatPercent(marketData.changePercent)}
                  </div>
                  <div className="text-xs text-muted-foreground">Vol: {(marketData.volume / 1000000).toFixed(1)}M</div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
