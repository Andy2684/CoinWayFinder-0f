"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, RefreshCw, Activity, DollarSign } from "lucide-react"

interface MarketData {
  symbol: string
  exchange: string
  price: number
  volume: number
  change: number
  changePercent: number
  high: number
  low: number
  timestamp: number
}

interface BestPrice {
  bestBid: { price: number; exchange: string } | null
  bestAsk: { price: number; exchange: string } | null
}

export function LiveMarketData() {
  const [marketData, setMarketData] = useState<MarketData[]>([])
  const [bestPrices, setBestPrices] = useState<Record<string, BestPrice>>({})
  const [selectedExchange, setSelectedExchange] = useState("binance")
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([])
  const [popularPairs, setPopularPairs] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const exchanges = [
    { id: "binance", name: "Binance" },
    { id: "bybit", name: "Bybit" },
  ]

  // Fetch popular trading pairs
  useEffect(() => {
    const fetchPopularPairs = async () => {
      try {
        const response = await fetch(`/api/market-data?type=popular-pairs&exchange=${selectedExchange}`)
        const data = await response.json()

        if (data.success) {
          setPopularPairs(data.data)
          setSelectedSymbols(data.data.slice(0, 8)) // Show top 8 pairs
        }
      } catch (error) {
        console.error("Error fetching popular pairs:", error)
        // Fallback to default pairs
        const defaultPairs = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "ADAUSDT", "SOLUSDT", "DOTUSDT", "LINKUSDT", "LTCUSDT"]
        setPopularPairs(defaultPairs)
        setSelectedSymbols(defaultPairs)
      }
    }

    fetchPopularPairs()
  }, [selectedExchange])

  // Fetch market data
  const fetchMarketData = async () => {
    if (selectedSymbols.length === 0) return

    try {
      setError(null)
      const symbolsParam = selectedSymbols.join(",")
      const response = await fetch(`/api/market-data?symbols=${symbolsParam}&exchange=${selectedExchange}`)
      const data = await response.json()

      if (data.success) {
        setMarketData(data.data)
        setLastUpdate(new Date())

        // Fetch best prices for comparison
        await fetchBestPrices()
      } else {
        setError(data.error || "Failed to fetch market data")
      }
    } catch (error) {
      console.error("Error fetching market data:", error)
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Fetch best prices across exchanges
  const fetchBestPrices = async () => {
    try {
      const bestPricesData: Record<string, BestPrice> = {}

      for (const symbol of selectedSymbols.slice(0, 4)) {
        // Limit to avoid rate limits
        const response = await fetch("/api/market-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "get-best-price",
            symbol,
            exchanges: ["binance", "bybit"],
          }),
        })

        const data = await response.json()
        if (data.success) {
          bestPricesData[symbol] = data.data
        }
      }

      setBestPrices(bestPricesData)
    } catch (error) {
      console.error("Error fetching best prices:", error)
    }
  }

  // Auto-refresh effect
  useEffect(() => {
    fetchMarketData()

    if (autoRefresh) {
      const interval = setInterval(fetchMarketData, 10000) // Refresh every 10 seconds
      return () => clearInterval(interval)
    }
  }, [selectedSymbols, selectedExchange, autoRefresh])

  const formatPrice = (price: number) => {
    if (price >= 1) {
      return price.toFixed(2)
    } else if (price >= 0.01) {
      return price.toFixed(4)
    } else {
      return price.toFixed(8)
    }
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`
    }
    return volume.toFixed(0)
  }

  const getChangeColor = (change: number) => {
    return change >= 0 ? "text-green-400" : "text-red-400"
  }

  const getChangeIcon = (change: number) => {
    return change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />
  }

  if (loading && marketData.length === 0) {
    return (
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Activity className="w-5 h-5 text-[#30D5C8]" />
            <span>Live Market Data</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-[#30D5C8]" />
            <span className="ml-2 text-gray-400">Loading market data...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center space-x-2">
            <Activity className="w-5 h-5 text-[#30D5C8]" />
            <span>Live Market Data</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={selectedExchange} onValueChange={setSelectedExchange}>
              <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {exchanges.map((exchange) => (
                  <SelectItem key={exchange.id} value={exchange.id} className="text-white">
                    {exchange.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchMarketData}
              disabled={loading}
              className="border-gray-600 text-white hover:bg-gray-800 bg-transparent"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
        {lastUpdate && <p className="text-sm text-gray-400">Last updated: {lastUpdate.toLocaleTimeString()}</p>}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded p-2">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {marketData.map((data) => (
            <div
              key={`${data.exchange}-${data.symbol}`}
              className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-[#30D5C8]/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-white">{data.symbol}</h3>
                  <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                    {data.exchange.toUpperCase()}
                  </Badge>
                </div>
                <div className={`flex items-center space-x-1 ${getChangeColor(data.change)}`}>
                  {getChangeIcon(data.change)}
                  <span className="text-sm font-medium">
                    {data.changePercent >= 0 ? "+" : ""}
                    {data.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Price</span>
                  <span className="text-white font-mono">${formatPrice(data.price)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">24h Change</span>
                  <span className={`font-mono text-sm ${getChangeColor(data.change)}`}>
                    {data.change >= 0 ? "+" : ""}${formatPrice(Math.abs(data.change))}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Volume</span>
                  <span className="text-white font-mono text-sm">{formatVolume(data.volume)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">High/Low</span>
                  <span className="text-white font-mono text-sm">
                    ${formatPrice(data.high)}/${formatPrice(data.low)}
                  </span>
                </div>

                {/* Best price comparison */}
                {bestPrices[data.symbol] && (
                  <div className="mt-3 pt-2 border-t border-gray-700">
                    <div className="text-xs text-gray-400 mb-1">Best Prices</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {bestPrices[data.symbol].bestBid && (
                        <div>
                          <span className="text-green-400">
                            Bid: ${formatPrice(bestPrices[data.symbol].bestBid!.price)}
                          </span>
                          <div className="text-gray-500">{bestPrices[data.symbol].bestBid!.exchange}</div>
                        </div>
                      )}
                      {bestPrices[data.symbol].bestAsk && (
                        <div>
                          <span className="text-red-400">
                            Ask: ${formatPrice(bestPrices[data.symbol].bestAsk!.price)}
                          </span>
                          <div className="text-gray-500">{bestPrices[data.symbol].bestAsk!.exchange}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {marketData.length === 0 && !loading && (
          <div className="text-center py-8">
            <DollarSign className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No market data available</p>
            <Button
              variant="outline"
              onClick={fetchMarketData}
              className="mt-4 border-gray-600 text-white hover:bg-gray-800 bg-transparent"
            >
              Retry
            </Button>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="auto-refresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-600 bg-gray-800 text-[#30D5C8]"
            />
            <label htmlFor="auto-refresh" className="text-sm text-gray-400">
              Auto-refresh every 10 seconds Auto-refresh every 10 seconds
            </label>
          </div>
          <div className="text-sm text-gray-400">
            Showing {marketData.length} of {popularPairs.length} pairs
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
