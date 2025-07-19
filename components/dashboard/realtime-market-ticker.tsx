"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, RefreshCw, Wifi, WifiOff } from "lucide-react"
import { useRealtimeMarketData } from "@/hooks/use-realtime-data"

const POPULAR_SYMBOLS = ["BTCUSDT", "ETHUSDT", "ADAUSDT", "SOLUSDT", "DOTUSDT"]

export function RealtimeMarketTicker() {
  const { marketData, connectionStatus } = useRealtimeMarketData(POPULAR_SYMBOLS)
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT")

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

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center space-x-2">
            <span>Live Market Data</span>
            <Badge
              variant="outline"
              className={`${
                connectionStatus === "connected" ? "border-green-500 text-green-400" : "border-red-500 text-red-400"
              }`}
            >
              {connectionStatus === "connected" ? (
                <>
                  <Wifi className="w-3 h-3 mr-1" /> Live
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 mr-1" /> Offline
                </>
              )}
            </Badge>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="border-gray-600 text-white hover:bg-gray-800 bg-transparent"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {POPULAR_SYMBOLS.map((symbol) => {
            const data = marketData[symbol]
            if (!data) {
              return (
                <div key={symbol} className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-6 bg-gray-700 rounded mb-1"></div>
                    <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                  </div>
                </div>
              )
            }

            return (
              <div
                key={symbol}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                  selectedSymbol === symbol
                    ? "bg-[#30D5C8]/10 border-[#30D5C8]"
                    : "bg-gray-800/50 border-gray-700 hover:border-gray-600"
                }`}
                onClick={() => setSelectedSymbol(symbol)}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-300">{symbol.replace("USDT", "/USDT")}</span>
                    {data.changePercent24h >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div className="text-lg font-bold text-white">${formatPrice(data.price, symbol)}</div>
                  <div className={`text-sm font-medium ${getChangeColor(data.changePercent24h)}`}>
                    {formatPercent(data.changePercent24h)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Selected Symbol Details */}
        {marketData[selectedSymbol] && (
          <div className="mt-6 p-4 rounded-lg bg-gray-800/30 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-3">{selectedSymbol.replace("USDT", "/USDT")} Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-400">24h High</span>
                <p className="text-white font-medium">
                  ${formatPrice(marketData[selectedSymbol].high24h, selectedSymbol)}
                </p>
              </div>
              <div>
                <span className="text-gray-400">24h Low</span>
                <p className="text-white font-medium">
                  ${formatPrice(marketData[selectedSymbol].low24h, selectedSymbol)}
                </p>
              </div>
              <div>
                <span className="text-gray-400">24h Volume</span>
                <p className="text-white font-medium">{marketData[selectedSymbol].volume24h.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-gray-400">Last Update</span>
                <p className="text-white font-medium">
                  {new Date(marketData[selectedSymbol].lastUpdate).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
