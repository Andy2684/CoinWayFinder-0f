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
        <CardTitle className="text-sm font-medium">Order Book</CardTitle>
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
            {/* Asks (Sell Orders) */}
            <div>
              <h4 className="text-xs font-medium text-red-600 mb-2">ASKS (SELL)</h4>
              <div className="space-y-1">
                {orderBook.asks
                  .slice(0, 5)
                  .reverse()
                  .map((ask, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span className="text-red-600 font-mono">{formatPrice(ask.price)}</span>
                      <span className="text-gray-600 font-mono">{formatQuantity(ask.quantity)}</span>
                      <span className="text-gray-500 font-mono">{formatPrice(ask.total)}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Spread */}
            <div className="border-t border-b py-2">
              <div className="text-center text-xs text-gray-500">
                Spread:{" "}
                {orderBook.asks[0] && orderBook.bids[0]
                  ? formatPrice(orderBook.asks[0].price - orderBook.bids[0].price)
                  : "N/A"}
              </div>
            </div>

            {/* Bids (Buy Orders) */}
            <div>
              <h4 className="text-xs font-medium text-green-600 mb-2">BIDS (BUY)</h4>
              <div className="space-y-1">
                {orderBook.bids.slice(0, 5).map((bid, index) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span className="text-green-600 font-mono">{formatPrice(bid.price)}</span>
                    <span className="text-gray-600 font-mono">{formatQuantity(bid.quantity)}</span>
                    <span className="text-gray-500 font-mono">{formatPrice(bid.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">Loading order book...</div>
        )}
      </CardContent>
    </Card>
  )
}
