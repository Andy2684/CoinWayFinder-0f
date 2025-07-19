"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Wifi, WifiOff, Activity, Trash2 } from "lucide-react"
import { useRealtimeTrades } from "@/hooks/use-realtime-data"

export function RealtimeTradeFeed() {
  const { trades, isConnected, error, clearTrades } = useRealtimeTrades()

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
    return amount.toFixed(4)
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const getSideColor = (side: "buy" | "sell") => {
    return side === "buy" ? "text-green-400" : "text-red-400"
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center space-x-2">
            <Activity className="w-5 h-5 text-[#30D5C8]" />
            <span>Live Trades</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearTrades}
              className="border-gray-600 text-white hover:bg-gray-800 bg-transparent"
            >
              <Trash2 className="w-4 h-4" />
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
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded p-2">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {trades.length > 0 ? (
            <>
              {/* Header */}
              <div className="grid grid-cols-5 gap-2 text-xs text-gray-400 font-medium border-b border-gray-700 pb-2">
                <span>Time</span>
                <span>Symbol</span>
                <span>Side</span>
                <span>Price</span>
                <span>Amount</span>
              </div>

              {/* Trades */}
              {trades.map((trade) => (
                <div
                  key={trade.id}
                  className="grid grid-cols-5 gap-2 text-sm py-1 hover:bg-gray-800/30 rounded transition-colors"
                >
                  <span className="text-gray-400 font-mono text-xs">{formatTime(trade.timestamp)}</span>
                  <span className="text-white font-medium">{trade.symbol}</span>
                  <span className={`font-medium ${getSideColor(trade.side)}`}>{trade.side.toUpperCase()}</span>
                  <span className="text-white font-mono">${formatPrice(trade.price)}</span>
                  <span className="text-gray-400 font-mono">{formatAmount(trade.amount)}</span>
                </div>
              ))}
            </>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Waiting for live trades...</p>
            </div>
          )}
        </div>

        {trades.length > 0 && (
          <div className="mt-4 pt-2 border-t border-gray-700">
            <p className="text-sm text-gray-400">Showing {trades.length} recent trades</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
