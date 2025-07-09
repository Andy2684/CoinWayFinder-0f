"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, RefreshCw, BarChart3 } from "lucide-react"
import type { MarketTrend } from "@/lib/crypto-api"

interface MarketTrendsData {
  gainers: MarketTrend[]
  losers: MarketTrend[]
  trending: MarketTrend[]
  trending_coins: any[]
}

export function MarketTrends() {
  const [trendsData, setTrendsData] = useState<MarketTrendsData>({
    gainers: [],
    losers: [],
    trending: [],
    trending_coins: [],
  })
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fetchTrends = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/crypto/trends")
      const data = await response.json()

      if (data.success) {
        setTrendsData(data.data)
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error("Failed to fetch market trends:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrends()

    // Auto-refresh every 2 minutes
    const interval = setInterval(fetchTrends, 120000)
    return () => clearInterval(interval)
  }, [])

  const formatPrice = (price: number) => {
    if (price < 1) return `$${price.toFixed(6)}`
    if (price < 100) return `$${price.toFixed(4)}`
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`
    return `$${marketCap.toLocaleString()}`
  }

  const renderTrendList = (trends: MarketTrend[], type: "gainers" | "losers" | "trending") => (
    <div className="space-y-2">
      {trends.slice(0, 10).map((coin, index) => (
        <div
          key={coin.id}
          className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-700 hover:border-[#30D5C8]/50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <span className="text-gray-500 text-sm w-6">#{index + 1}</span>
            <div className="w-8 h-8 bg-gradient-to-br from-[#30D5C8] to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">{coin.symbol.slice(0, 2)}</span>
            </div>
            <div>
              <p className="text-white font-semibold">{coin.symbol}</p>
              <p className="text-gray-400 text-sm">{coin.name}</p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-white font-semibold">{formatPrice(coin.current_price)}</p>
            <div className="flex items-center space-x-1">
              {coin.price_change_percentage_24h > 0 ? (
                <TrendingUp className="w-3 h-3 text-green-400" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-400" />
              )}
              <span className={coin.price_change_percentage_24h > 0 ? "text-green-400" : "text-red-400"}>
                {coin.price_change_percentage_24h > 0 ? "+" : ""}
                {coin.price_change_percentage_24h.toFixed(2)}%
              </span>
            </div>
          </div>

          <div className="hidden md:block text-right">
            <p className="text-sm text-gray-300">{formatMarketCap(coin.market_cap)}</p>
            <p className="text-xs text-gray-500">Market Cap</p>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-[#30D5C8]" />
            Market Trends
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className="bg-purple-500/10 text-purple-400">
              <BarChart3 className="w-3 h-3 mr-1" />
              Live Data
            </Badge>
            <Button variant="ghost" size="sm" onClick={fetchTrends} disabled={loading} className="h-8 w-8 p-0">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-400">
          Top gainers, losers, and trending • Last updated: {lastUpdate.toLocaleTimeString()}
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="gainers" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
            <TabsTrigger value="gainers" className="text-green-400 data-[state=active]:bg-green-500/20">
              🚀 Top Gainers
            </TabsTrigger>
            <TabsTrigger value="losers" className="text-red-400 data-[state=active]:bg-red-500/20">
              📉 Top Losers
            </TabsTrigger>
            <TabsTrigger value="trending" className="text-blue-400 data-[state=active]:bg-blue-500/20">
              🔥 Trending
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gainers" className="mt-4">
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                        <div>
                          <div className="h-4 bg-gray-700 rounded w-16 mb-1"></div>
                          <div className="h-3 bg-gray-700 rounded w-12"></div>
                        </div>
                      </div>
                      <div className="h-5 bg-gray-700 rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              renderTrendList(trendsData.gainers, "gainers")
            )}
          </TabsContent>

          <TabsContent value="losers" className="mt-4">
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                        <div>
                          <div className="h-4 bg-gray-700 rounded w-16 mb-1"></div>
                          <div className="h-3 bg-gray-700 rounded w-12"></div>
                        </div>
                      </div>
                      <div className="h-5 bg-gray-700 rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              renderTrendList(trendsData.losers, "losers")
            )}
          </TabsContent>

          <TabsContent value="trending" className="mt-4">
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                        <div>
                          <div className="h-4 bg-gray-700 rounded w-16 mb-1"></div>
                          <div className="h-3 bg-gray-700 rounded w-12"></div>
                        </div>
                      </div>
                      <div className="h-5 bg-gray-700 rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              renderTrendList(trendsData.trending, "trending")
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
