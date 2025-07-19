"use client"

import { useRealtimeTrades } from "@/hooks/use-realtime-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Wifi, WifiOff, ArrowUp, ArrowDown } from "lucide-react"
import { useState } from "react"

export function RealtimeTradeFeed() {
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT")
  const { trades, isConnected } = useRealtimeTrades(selectedSymbol)

  const formatPrice = (price: number) => {
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const formatQuantity = (quantity: number) => {
    return quantity.toFixed(4)
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Recent Trades</CardTitle>
        <div className="flex items-center space-x-2">
          <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BTCUSDT">BTC/USDT</SelectItem>
              <SelectItem value="ETHUSDT">ETH/USDT</SelectItem>
              <SelectItem value="BNBUSDT">BNB/USDT</SelectItem>
            </SelectContent>
          </Select>
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
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {trades.length > 0 ? (
            trades.map((trade) => (
              <div key={trade.id} className="flex items-center justify-between py-1 text-xs">
                <div className="flex items-center space-x-2">
                  {trade.side === "buy" ? (
                    <ArrowUp className="w-3 h-3 text-green-600" />
                  ) : (
                    <ArrowDown className="w-3 h-3 text-red-600" />
                  )}
                  <span className={`font-mono ${trade.side === "buy" ? "text-green-600" : "text-red-600"}`}>
                    {formatPrice(trade.price)}
                  </span>
                </div>
                <span className="text-gray-600 font-mono">{formatQuantity(trade.quantity)}</span>
                <span className="text-gray-500 font-mono">{formatTime(trade.timestamp)}</span>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">Waiting for trades...</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
