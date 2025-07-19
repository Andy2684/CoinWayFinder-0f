"use client"

import { useRealtimeOrderBook } from "@/hooks/use-realtime-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Wifi, WifiOff } from "lucide-react"
import { useState } from "react"

export function RealtimeOrderBook() {
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT")
  const { orderBook, isConnected } = useRealtimeOrderBook(selectedSymbol)

  const formatPrice = (price: number) => {
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const formatQuantity = (quantity: number) => {
    return quantity.toFixed(4)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Order Book</CardTitle>
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
        {orderBook ? (
          <div className="space-y-4">
            {/* Header */}
            <div className="grid grid-cols-3 gap-4 text-xs font-medium text-muted-foreground border-b pb-2">
              <div>Price (USDT)</div>
              <div className="text-right">Amount</div>
              <div className="text-right">Total</div>
            </div>

            {/* Asks (Sell Orders) */}
            <div className="space-y-1">
              {orderBook.asks
                .slice(0, 8)
                .reverse()
                .map((ask, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-3 gap-4 text-sm hover:bg-red-50 dark:hover:bg-red-950/20 p-1 rounded"
                  >
                    <div className="text-red-600 font-mono">{formatPrice(ask.price)}</div>
                    <div className="text-right font-mono text-muted-foreground">{formatQuantity(ask.quantity)}</div>
                    <div className="text-right font-mono text-muted-foreground">{formatPrice(ask.total)}</div>
                  </div>
                ))}
            </div>

            {/* Spread */}
            <div className="border-t border-b py-3">
              <div className="text-center text-sm font-medium">
                <span className="text-muted-foreground">Spread: </span>
                <span className="text-foreground">
                  {orderBook.asks[0] && orderBook.bids[0]
                    ? formatPrice(orderBook.asks[0].price - orderBook.bids[0].price)
                    : "N/A"}
                </span>
              </div>
            </div>

            {/* Bids (Buy Orders) */}
            <div className="space-y-1">
              {orderBook.bids.slice(0, 8).map((bid, index) => (
                <div
                  key={index}
                  className="grid grid-cols-3 gap-4 text-sm hover:bg-green-50 dark:hover:bg-green-950/20 p-1 rounded"
                >
                  <div className="text-green-600 font-mono">{formatPrice(bid.price)}</div>
                  <div className="text-right font-mono text-muted-foreground">{formatQuantity(bid.quantity)}</div>
                  <div className="text-right font-mono text-muted-foreground">{formatPrice(bid.total)}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">Loading order book...</div>
        )}
      </CardContent>
    </Card>
  )
}
