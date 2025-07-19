"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Wifi, WifiOff, TrendingUp, TrendingDown } from "lucide-react"
import { useRealtimeTrades } from "@/hooks/use-realtime-data"

export function RealtimeTradeFeed() {
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT")
  const { trades, connectionStatus } = useRealtimeTrades(selectedSymbol, 20)

  const formatPrice = (price: number) => {
    return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const formatQuantity = (quantity: number) => {
    return quantity.toFixed(4)
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center space-x-2">
            <span>Live Trades</span>
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
          <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
            <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="BTCUSDT">BTC/USDT</SelectItem>
              <SelectItem value="ETHUSDT">ETH/USDT</SelectItem>
              <SelectItem value="ADAUSDT">ADA/USDT</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {trades.length === 0 ? (
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse flex space-x-4">
                <div className="h-4 bg-gray-700 rounded w-16"></div>
                <div className="h-4 bg-gray-700 rounded flex-1"></div>
                <div className="h-4 bg-gray-700 rounded w-20"></div>
                <div className="h-4 bg-gray-700 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {/* Header */}
            <div className="grid grid-cols-4 gap-2 text-xs font-medium text-gray-400 border-b border-gray-700 pb-2">
              <div>Side</div>
              <div className="text-right">Price</div>
              <div className="text-right">Quantity</div>
              <div className="text-right">Time</div>
            </div>

            {/* Trades */}
            <div className="max-h-64 overflow-y-auto space-y-1">
              {trades.map((trade) => (
                <div
                  key={trade.id}
                  className={`grid grid-cols-4 gap-2 text-sm py-1 px-2 rounded transition-all duration-200 ${
                    trade.side === "buy"
                      ? "hover:bg-green-500/10 border-l-2 border-green-500/50"
                      : "hover:bg-red-500/10 border-l-2 border-red-500/50"
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    {trade.side === "buy" ? (
                      <TrendingUp className="w-3 h-3 text-green-400" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-400" />
                    )}
                    <span className={trade.side === "buy" ? "text-green-400" : "text-red-400"}>
                      {trade.side.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-white text-right font-mono">{formatPrice(trade.price)}</div>
                  <div className="text-gray-300 text-right font-mono">{formatQuantity(trade.quantity)}</div>
                  <div className="text-gray-400 text-right text-xs">{formatTime(trade.timestamp)}</div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="text-xs text-gray-400 text-center pt-2 border-t border-gray-700">
              Showing last {trades.length} trades • Updates every 500ms
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
