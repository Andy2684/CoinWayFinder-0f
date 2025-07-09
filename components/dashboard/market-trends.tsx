"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react"
import type { MarketTrend } from "@/lib/crypto-api"

export function MarketTrends() {
  const [trends, setTrends] = useState<{ gainers: MarketTrend[]; losers: MarketTrend[] }>({ gainers: [], losers: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrends()
    const interval = setInterval(fetchTrends, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  const fetchTrends = async () => {
    try {
      const response = await fetch("/api/crypto/trends")
      const data = await response.json()

      if (data.success) {
        setTrends(data.data)
      }
    } catch (error) {
      console.error("Error fetching market trends:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: price < 1 ? 6 : 2,
    }).format(price)
  }

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`
    return `$${marketCap.toLocaleString()}`
  }

  const TrendList = ({ coins, type }: { coins: MarketTrend[]; type: "gainers" | "losers" }) => (
    <div className="space-y-3">
      {coins.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No {type} data available</p>
        </div>
      ) : (
        coins.map((coin, index) => (
          <div
            key={coin.id}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="text-sm font-medium text-muted-foreground w-6">#{index + 1}</div>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {coin.symbol.charAt(0)}
              </div>
              <div>
                <div className="font-semibold">{coin.symbol}</div>
                <div className="text-sm text-muted-foreground">{coin.name}</div>
              </div>
            </div>

            <div className="text-right">
              <div className="font-semibold">{formatPrice(coin.current_price)}</div>
              <div className="flex items-center gap-1 justify-end">
                {coin.price_change_percentage_24h >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <Badge variant={coin.price_change_percentage_24h >= 0 ? "default" : "destructive"} className="text-xs">
                  {coin.price_change_percentage_24h >= 0 ? "+" : ""}
                  {coin.price_change_percentage_24h.toFixed(2)}%
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground mt-1">{formatMarketCap(coin.market_cap)}</div>
            </div>
          </div>
        ))
      )}
    </div>
  )

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Market Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-4 bg-gray-200 rounded"></div>
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="space-y-1">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                      <div className="h-3 bg-gray-200 rounded w-12"></div>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Market Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="gainers" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="gainers" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Top Gainers
            </TabsTrigger>
            <TabsTrigger value="losers" className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              Top Losers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gainers" className="mt-4">
            <TrendList coins={trends.gainers} type="gainers" />
          </TabsContent>

          <TabsContent value="losers" className="mt-4">
            <TrendList coins={trends.losers} type="losers" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
