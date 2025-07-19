"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Wifi, WifiOff } from "lucide-react"
import { useRealtimeMarketData } from "@/hooks/use-realtime-data"

interface RealtimeMarketTickerProps {
  symbols?: string[]
  className?: string
}

export function RealtimeMarketTicker({
  symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "ADAUSDT", "SOLUSDT"],
  className = "",
}: RealtimeMarketTickerProps) {
  const { data, isConnected, error, reconnect } = useRealtimeMarketData(symbols)
  const [displayData, setDisplayData] = useState(data)

  // Update display data when new data arrives
  useEffect(() => {
    if (data.length > 0) {
      setDisplayData(data)
    }
  }, [data])

  const formatPrice = (price: number) => {
    if (price >= 1) {
      return price.toFixed(2)
    } else if (price >= 0.01) {
      return price.toFixed(4)
    } else {
      return price.toFixed(8)
    }
  }

  const getChangeColor = (change: number) => {
    return change >= 0 ? "text-green-400" : "text-red-400"
  }

  const getChangeIcon = (change: number) => {
    return change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />
  }

  return (
    <Card className={`bg-gray-900/50 border-gray-800 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Live Market Data</h3>
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Badge variant="outline" className="border-green-500 text-green-400">
                <Wifi className="w-3 h-3 mr-1" />
                Live
              </Badge>
            ) : (
              <Badge variant="outline" className="border-red-500 text-red-400 cursor-pointer" onClick={reconnect}>
                <WifiOff className="w-3 h-3 mr-1" />
                Disconnected
              </Badge>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded p-2 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {displayData.map((item) => (
            <div
              key={item.symbol}
              className="bg-gray-800/50 rounded-lg p-3 border border-gray-700 hover:border-[#30D5C8]/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-white text-sm">{item.symbol}</span>
                <div className={`flex items-center space-x-1 ${getChangeColor(item.change)}`}>
                  {getChangeIcon(item.change)}
                  <span className="text-xs font-medium">
                    {item.changePercent >= 0 ? "+" : ""}
                    {item.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-white font-mono text-lg">${formatPrice(item.price)}</div>
                <div className={`text-sm font-mono ${getChangeColor(item.change)}`}>
                  {item.change >= 0 ? "+" : ""}${formatPrice(Math.abs(item.change))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {displayData.length === 0 && !error && (
          <div className="text-center py-8">
            <div className="animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {symbols.map((symbol) => (
                  <div key={symbol} className="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-6 bg-gray-700 rounded mb-1"></div>
                    <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
