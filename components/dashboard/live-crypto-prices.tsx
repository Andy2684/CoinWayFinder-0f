"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, RefreshCw, Activity } from "lucide-react"
import type { CryptoPrice } from "@/lib/crypto-api"

export function LiveCryptoPrices() {
  const [prices, setPrices] = useState<CryptoPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fetchPrices = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/crypto/prices")
      const data = await response.json()

      if (data.success) {
        setPrices(data.data)
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error("Failed to fetch crypto prices:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrices()

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchPrices, 30000)
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

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <Activity className="w-5 h-5 mr-2 text-[#30D5C8]" />
            Live Crypto Prices
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className="bg-green-500/10 text-green-400">
              <Activity className="w-3 h-3 mr-1" />
              Live
            </Badge>
            <Button variant="ghost" size="sm" onClick={fetchPrices} disabled={loading} className="h-8 w-8 p-0">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-400">Last updated: {lastUpdate.toLocaleTimeString()}</p>
      </CardHeader>
      <CardContent>
        {loading && prices.length === 0 ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                    <div>
                      <div className="h-4 bg-gray-700 rounded w-16 mb-1"></div>
                      <div className="h-3 bg-gray-700 rounded w-12"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-5 bg-gray-700 rounded w-20 mb-1"></div>
                    <div className="h-4 bg-gray-700 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {prices.map((coin) => (
              <div
                key={coin.id}
                className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700 hover:border-[#30D5C8]/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#30D5C8] to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{coin.symbol.slice(0, 2)}</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{coin.symbol}</h4>
                    <p className="text-gray-400 text-sm">{coin.name}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-white">{formatPrice(coin.current_price)}</p>
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

                <div className="hidden lg:block text-right">
                  <p className="text-sm text-gray-300">{formatMarketCap(coin.total_volume)}</p>
                  <p className="text-xs text-gray-500">24h Volume</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
