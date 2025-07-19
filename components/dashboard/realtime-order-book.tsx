"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff } from "lucide-react"
import { useRealtimeOrderBook } from "@/hooks/use-realtime-data"

export function RealtimeOrderBook() {
  const { orderBook, isConnected } = useRealtimeOrderBook("BTCUSDT")

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Order Book (BTC/USDT)</CardTitle>
        {isConnected ? (
          <Badge variant="outline" className="border-green-500 text-green-600">
            <Wifi className="w-3 h-3 mr-1" />
            Live
          </Badge>
        ) : (
          <Badge variant="outline" className="border-red-500 text-red-600">
            <WifiOff className="w-3 h-3 mr-1" />
            Disconnected
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {!orderBook ? (
          <div className="text-center py-4 text-muted-foreground">Loading order book...</div>
        ) : (
          <div className="space-y-4">
            {/* Asks (Sell Orders) */}
            <div>
              <h4 className="text-sm font-medium text-red-600 mb-2">Asks (Sell)</h4>
              <div className="space-y-1">
                {orderBook.asks
                  .slice(0, 5)
                  .reverse()
                  .map((ask, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-red-600">${ask.price}</span>
                      <span className="text-muted-foreground">{ask.quantity}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Spread */}
            <div className="border-t border-b py-2">
              <div className="text-center text-sm font-medium">
                Spread: $
                {(
                  Number.parseFloat(orderBook.asks[0]?.price || "0") -
                  Number.parseFloat(orderBook.bids[0]?.price || "0")
                ).toFixed(2)}
              </div>
            </div>

            {/* Bids (Buy Orders) */}
            <div>
              <h4 className="text-sm font-medium text-green-600 mb-2">Bids (Buy)</h4>
              <div className="space-y-1">
                {orderBook.bids.slice(0, 5).map((bid, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-green-600">${bid.price}</span>
                    <span className="text-muted-foreground">{bid.quantity}</span>
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
