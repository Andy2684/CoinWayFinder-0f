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
        <CardTitle className="text-lg font-semibold">Recent Trades</CardTitle>
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
        <div className="space-y-1 max-h-80 overflow-y-auto">
          {/* Header */}
          <div className="grid grid-cols-4 gap-2 text-xs font-medium text-muted-foreground border-b pb-2 sticky top-0 bg-background">
            <div>Price (USDT)</div>
            <div className="text-right">Amount</div>
            <div className="text-right">Time</div>
            <div className="text-center">Side</div>
          </div>

          {trades.length > 0 ? (
            trades.map((trade) => (
              <div
                key={trade.id}
                className={`grid grid-cols-4 gap-2 py-1 text-sm hover:bg-muted/50 rounded transition-colors ${
                  trade.side === "buy"
                    ? "hover:bg-green-50 dark:hover:bg-green-950/20"
                    : "hover:bg-red-50 dark:hover:bg-red-950/20"
                }`}
              >
                <div className={`font-mono ${trade.side === "buy" ? "text-green-600" : "text-red-600"}`}>
                  {formatPrice(trade.price)}
                </div>
                <div className="text-right font-mono text-muted-foreground">{formatQuantity(trade.quantity)}</div>
                <div className="text-right font-mono text-muted-foreground text-xs">{formatTime(trade.timestamp)}</div>
                <div className="flex items-center justify-center">
                  {trade.side === "buy" ? (
                    <ArrowUp className="w-3 h-3 text-green-600" />
                  ) : (
                    <ArrowDown className="w-3 h-3 text-red-600" />
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8">Waiting for trades...</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
