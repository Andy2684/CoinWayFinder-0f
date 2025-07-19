"use client"

import { useRealtimeMarketData } from "@/hooks/use-realtime-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Wifi, WifiOff } from "lucide-react"

const SYMBOLS = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "ADAUSDT", "SOLUSDT"]

export function RealtimeMarketTicker() {
  const { data, isConnected } = useRealtimeMarketData(SYMBOLS)

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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Live Market Data</CardTitle>
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
        <div className="space-y-3">
          {SYMBOLS.map((symbol) => {
            const marketData = data[symbol]
            if (!marketData) return null

            const isPositive = marketData.changePercent >= 0

            return (
              <div
                key={symbol}
                className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800"
              >
                <div className="flex items-center space-x-3">
                  <div className="font-medium text-sm">{symbol.replace("USDT", "/USDT")}</div>
                  <div className="text-lg font-bold">{formatPrice(marketData.price)}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`flex items-center space-x-1 ${isPositive ? "text-green-600" : "text-red-600"}`}>
                    {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span className="text-sm font-medium">{formatPercent(marketData.changePercent)}</span>
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
