"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react"
import { useRealtimeMarketData } from "@/hooks/use-realtime-data"

export function LiveMarketData() {
  const { marketData, isConnected } = useRealtimeMarketData()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold">Market Overview</CardTitle>
        <div className="flex items-center space-x-2">
          <Badge variant={isConnected ? "default" : "destructive"}>{isConnected ? "Live" : "Offline"}</Badge>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {marketData.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">Loading market data...</div>
          ) : (
            marketData.map((data) => (
              <div key={data.symbol} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{data.symbol}</h3>
                  <div
                    className={`flex items-center ${Number.parseFloat(data.change24h) >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {Number.parseFloat(data.change24h) >= 0 ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    )}
                    <span className="text-sm font-medium">
                      {Number.parseFloat(data.change24h) >= 0 ? "+" : ""}
                      {data.change24h}%
                    </span>
                  </div>
                </div>
                <div className="text-2xl font-bold mb-1">${data.price}</div>
                <div className="text-sm text-muted-foreground">
                  Vol: {Number.parseFloat(data.volume).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
