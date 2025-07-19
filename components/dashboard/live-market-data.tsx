"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, RefreshCw, Activity, DollarSign, Wifi, WifiOff } from "lucide-react"
import { useRealtimeMarketData } from "@/hooks/use-realtime-data"

interface LiveMarketDataProps {
  symbols?: string[]
  exchange?: string
  className?: string
}

export function LiveMarketData({
  symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "ADAUSDT", "SOLUSDT", "DOTUSDT", "LINKUSDT", "LTCUSDT"],
  exchange = "binance",
  className = "",
}: LiveMarketDataProps) {
  const [selectedExchange, setSelectedExchange] = useState(exchange)
  const [selectedSymbols, setSelectedSymbols] = useState(symbols)
  const { data: marketData, isConnected, error, reconnect } = useRealtimeMarketData(selectedSymbols)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const exchanges = [
    { id: "binance", name: "Binance" },
    { id: "bybit", name: "Bybit" },
  ]

  // Update last update time when new data arrives
  useEffect(() => {
    if (marketData.length > 0) {
      setLastUpdate(new Date())
    }
  }, [marketData])

  const formatPrice = (price: number) => {
    if (price >= 1) {
      return price.toFixed(2)
    } else if (price >= 0.01) {
      return price.toFixed(4)
    } else {
      return price.toFixed(8)
    }
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`
    }
    return volume.toFixed(0)
  }

  const getChangeColor = (change: number) => {
    return change >= 0 ? "text-green-400" : "text-red-400"
  }

  const getChangeIcon = (change: number) => {
    return change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />
  }

  return (
    <Card className={`bg-gray-900/50 border-gray-800 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center space-x-2">
            <Activity className="w-5 h-5 text-[#30D5C8]" />
            <span>Live Market Data</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={selectedExchange} onValueChange={setSelectedExchange}>
              <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {exchanges.map((exchange) => (
                  <SelectItem key={exchange.id} value={exchange.id} className="text-white">
                    {exchange.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={reconnect}
              className="border-gray-600 text-white hover:bg-gray-800 bg-transparent"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            {isConnected ? (
              <Badge variant="outline" className="border-green-500 text-green-400">
                <Wifi className="w-3 h-3 mr-1" />
                Live
              </Badge>
            ) : (
              <Badge variant="outline" className="border-red-500 text-red-400">
                <WifiOff className="w-3 h-3 mr-1" />
                Disconnected
              </Badge>
            )}
          </div>
        </div>
        {lastUpdate && <p className="text-sm text-gray-400">Last updated: {lastUpdate.toLocaleTimeString()}</p>}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded p-2">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {marketData.map((data) => (
            <div
              key={`${selectedExchange}-${data.symbol}`}
              className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-[#30D5C8]/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-white">{data.symbol}</h3>
                  <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                    {selectedExchange.toUpperCase()}
                  </Badge>
                </div>
                <div className={`flex items-center space-x-1 ${getChangeColor(data.change)}`}>
                  {getChangeIcon(data.change)}
                  <span className="text-sm font-medium">
                    {data.changePercent >= 0 ? "+" : ""}
                    {data.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Price</span>
                  <span className="text-white font-mono">${formatPrice(data.price)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">24h Change</span>
                  <span className={`font-mono text-sm ${getChangeColor(data.change)}`}>
                    {data.change >= 0 ? "+" : ""}${formatPrice(Math.abs(data.change))}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Volume</span>
                  <span className="text-white font-mono text-sm">{formatVolume(data.volume)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {marketData.length === 0 && !error && (
          <div className="text-center py-8">
            <div className="animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {selectedSymbols.map((symbol) => (
                  <div key={symbol} className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-6 bg-gray-700 rounded mb-1"></div>
                    <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {marketData.length === 0 && error && (
          <div className="text-center py-8">
            <DollarSign className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">Failed to load market data</p>
            <Button
              variant="outline"
              onClick={reconnect}
              className="border-gray-600 text-white hover:bg-gray-800 bg-transparent"
            >
              Retry Connection
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
