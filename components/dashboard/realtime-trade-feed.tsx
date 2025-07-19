"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, ArrowUp, ArrowDown } from "lucide-react"
import { useRealtimeTrades } from "@/hooks/use-realtime-data"

export function RealtimeTradeFeed() {
  const { trades, isConnected } = useRealtimeTrades("BTCUSDT")

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Live Trades</CardTitle>
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
        {trades.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">Waiting for trades...</div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {trades.slice(0, 20).map((trade, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded text-sm">
                <div className="flex items-center space-x-2">
                  {trade.side === "BUY" ? (
                    <ArrowUp className="w-3 h-3 text-green-600" />
                  ) : (
                    <ArrowDown className="w-3 h-3 text-red-600" />
                  )}
                  <span className={trade.side === "BUY" ? "text-green-600" : "text-red-600"}>${trade.price}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-muted-foreground">{trade.quantity}</span>
                  <span className="text-xs text-muted-foreground">{formatTime(trade.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
