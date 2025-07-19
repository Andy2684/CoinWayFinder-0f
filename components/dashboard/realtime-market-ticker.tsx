"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Wifi, WifiOff } from "lucide-react"
import { useRealtimeMarketData } from "@/hooks/use-realtime-data"

export function RealtimeMarketTicker() {
  const { marketData, isConnected } = useRealtimeMarketData()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Live Market Data</CardTitle>
        <div className="flex items-center space-x-2">
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
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {marketData.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">Connecting to market data...</div>
          ) : (
            marketData.slice(0, 5).map((data) => (
              <div key={data.symbol} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="font-medium">{data.symbol}</div>
                  <div className="text-lg font-bold">${data.price}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className={`flex items-center ${Number.parseFloat(data.change24h) >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {Number.parseFloat(data.change24h) >= 0 ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    )}
                    <span className="font-medium">
                      {Number.parseFloat(data.change24h) >= 0 ? "+" : ""}
                      {data.change24h}%
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
