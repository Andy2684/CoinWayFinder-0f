"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Wifi, WifiOff } from "lucide-react"
import { useRealtimeOrderBook } from "@/hooks/use-realtime-data"

export function RealtimeOrderBook() {
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT")
  const { orderBook, connectionStatus } = useRealtimeOrderBook(selectedSymbol)

  const formatPrice = (price: number) => {
    return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const formatQuantity = (quantity: number) => {
    return quantity.toFixed(4)
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center space-x-2">
            <span>Order Book</span>
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
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {!orderBook ? (
          <div className="space-y-2">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="animate-pulse flex space-x-4">
                <div className="h-4 bg-gray-700 rounded flex-1"></div>
                <div className="h-4 bg-gray-700 rounded flex-1"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header */}
            <div className="grid grid-cols-2 gap-4 text-xs font-medium text-gray-400 border-b border-gray-700 pb-2">
              <div className="text-center">Price (USDT)</div>
              <div className="text-center">Quantity</div>
            </div>

            {/* Asks (Sell Orders) */}
            <div className="space-y-1">
              <h4 className="text-xs font-medium text-red-400 mb-2">Asks (Sell)</h4>
              {orderBook.asks
                .slice(0, 5)
                .reverse()
                .map((ask, index) => (
                  <div key={index} className="grid grid-cols-2 gap-4 text-sm py-1 hover:bg-red-500/10 rounded">
                    <div className="text-red-400 text-center font-mono">{formatPrice(ask.price)}</div>
                    <div className="text-white text-center font-mono">{formatQuantity(ask.quantity)}</div>
                  </div>
                ))}
            </div>

            {/* Spread */}
            {orderBook.asks.length > 0 && orderBook.bids.length > 0 && (
              <div className="text-center py-2 border-y border-gray-700">
                <span className="text-xs text-gray-400">Spread: </span>
                <span className="text-white font-mono">
                  {formatPrice(orderBook.asks[0].price - orderBook.bids[0].price)}
                </span>
              </div>
            )}

            {/* Bids (Buy Orders) */}
            <div className="space-y-1">
              <h4 className="text-xs font-medium text-green-400 mb-2">Bids (Buy)</h4>
              {orderBook.bids.slice(0, 5).map((bid, index) => (
                <div key={index} className="grid grid-cols-2 gap-4 text-sm py-1 hover:bg-green-500/10 rounded">
                  <div className="text-green-400 text-center font-mono">{formatPrice(bid.price)}</div>
                  <div className="text-white text-center font-mono">{formatQuantity(bid.quantity)}</div>
                </div>
              ))}
            </div>

            {/* Last Update */}
            <div className="text-xs text-gray-400 text-center pt-2 border-t border-gray-700">
              Last updated: {new Date(orderBook.lastUpdate).toLocaleTimeString()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
