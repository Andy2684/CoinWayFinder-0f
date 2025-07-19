"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Wifi, WifiOff, BookOpen } from "lucide-react"
import { useRealtimeOrderBook } from "@/hooks/use-realtime-data"
import { useState } from "react"

export function RealtimeOrderBook() {
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT")
  const { orderBook, isConnected, error } = useRealtimeOrderBook(selectedSymbol)

  const symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "ADAUSDT", "SOLUSDT"]

  const formatPrice = (price: number) => {
    if (price >= 1) {
      return price.toFixed(2)
    } else if (price >= 0.01) {
      return price.toFixed(4)
    } else {
      return price.toFixed(8)
    }
  }

  const formatAmount = (amount: number) => {
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`
    }
    return amount.toFixed(4)
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-[#30D5C8]" />
            <span>Order Book</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
              <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {symbols.map((symbol) => (
                  <SelectItem key={symbol} value={symbol} className="text-white">
                    {symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded p-2">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {orderBook ? (
          <div className="grid grid-cols-2 gap-4">
            {/* Asks (Sell Orders) */}
            <div>
              <h4 className="text-red-400 font-medium mb-2 text-sm">Asks (Sell)</h4>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {orderBook.asks
                  .slice(0, 10)
                  .reverse()
                  .map(([price, amount], index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-red-400 font-mono">${formatPrice(price)}</span>
                      <span className="text-gray-400 font-mono">{formatAmount(amount)}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Bids (Buy Orders) */}
            <div>
              <h4 className="text-green-400 font-medium mb-2 text-sm">Bids (Buy)</h4>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {orderBook.bids.slice(0, 10).map(([price, amount], index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-green-400 font-mono">${formatPrice(price)}</span>
                    <span className="text-gray-400 font-mono">{formatAmount(amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="animate-pulse">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="h-4 bg-gray-700 rounded mb-2 w-20"></div>
                  <div className="space-y-1">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className="flex justify-between">
                        <div className="h-3 bg-gray-700 rounded w-16"></div>
                        <div className="h-3 bg-gray-700 rounded w-12"></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="h-4 bg-gray-700 rounded mb-2 w-20"></div>
                  <div className="space-y-1">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className="flex justify-between">
                        <div className="h-3 bg-gray-700 rounded w-16"></div>
                        <div className="h-3 bg-gray-700 rounded w-12"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
