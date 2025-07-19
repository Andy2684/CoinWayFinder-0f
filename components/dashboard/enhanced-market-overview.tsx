"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, Zap, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"

interface CryptoPair {
  symbol: string
  price: number
  change24h: number
  volume: number
  high24h: number
  low24h: number
  marketCap?: number
}

export function EnhancedMarketOverview() {
  const [cryptoData, setCryptoData] = useState<CryptoPair[]>([
    { symbol: "BTC/USDT", price: 67234.56, change24h: 2.3, volume: 1234567890, high24h: 68000, low24h: 65500 },
    { symbol: "ETH/USDT", price: 3456.78, change24h: -1.2, volume: 987654321, high24h: 3500, low24h: 3400 },
    { symbol: "BNB/USDT", price: 318.45, change24h: 0.8, volume: 456789123, high24h: 320, low24h: 315 },
    { symbol: "ADA/USDT", price: 0.485, change24h: 3.2, volume: 234567890, high24h: 0.49, low24h: 0.47 },
    { symbol: "SOL/USDT", price: 98.72, change24h: -2.1, volume: 345678901, high24h: 101, low24h: 96.5 },
    { symbol: "DOT/USDT", price: 7.22, change24h: 1.5, volume: 123456789, high24h: 7.35, low24h: 7.1 },
  ])

  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [isUpdating, setIsUpdating] = useState(false)

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCryptoData((prev) =>
        prev.map((crypto) => ({
          ...crypto,
          price: crypto.price * (1 + (Math.random() - 0.5) * 0.02), // +/- 1% random change
          change24h: crypto.change24h + (Math.random() - 0.5) * 0.5,
          volume: crypto.volume * (1 + (Math.random() - 0.5) * 0.1),
        })),
      )
      setLastUpdate(new Date())
    }, 3000) // Update every 3 seconds

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    setIsUpdating(true)
    setTimeout(() => {
      setIsUpdating(false)
      setLastUpdate(new Date())
    }, 1000)
  }

  const formatPrice = (price: number, symbol: string) => {
    const decimals = symbol.includes("BTC") || symbol.includes("ETH") ? 2 : symbol.includes("ADA") ? 4 : 2
    return price.toFixed(decimals)
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(1)}B`
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`
    return volume.toString()
  }

  const topGainers = cryptoData
    .filter((crypto) => crypto.change24h > 0)
    .sort((a, b) => b.change24h - a.change24h)
    .slice(0, 3)
  const topLosers = cryptoData
    .filter((crypto) => crypto.change24h < 0)
    .sort((a, b) => a.change24h - b.change24h)
    .slice(0, 3)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Market Overview</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="border-green-500 text-green-600">
              <Zap className="w-3 h-3 mr-1" />
              Live
            </Badge>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isUpdating}>
              <RefreshCw className={`w-4 h-4 ${isUpdating ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Last updated: {lastUpdate.toLocaleTimeString()}</p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Markets</TabsTrigger>
            <TabsTrigger value="gainers">Top Gainers</TabsTrigger>
            <TabsTrigger value="losers">Top Losers</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-3">
              {cryptoData.map((crypto, index) => (
                <div
                  key={crypto.symbol}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {crypto.symbol.split("/")[0].slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-medium">{crypto.symbol}</div>
                      <div className="text-sm text-muted-foreground">Vol: {formatVolume(crypto.volume)}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-lg">${formatPrice(crypto.price, crypto.symbol)}</div>
                    <div className="flex items-center space-x-1">
                      {crypto.change24h >= 0 ? (
                        <TrendingUp className="w-3 h-3 text-green-500" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-500" />
                      )}
                      <span
                        className={`text-sm font-medium ${crypto.change24h >= 0 ? "text-green-500" : "text-red-500"}`}
                      >
                        {crypto.change24h >= 0 ? "+" : ""}
                        {crypto.change24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="gainers" className="space-y-4">
            <div className="grid gap-3">
              {topGainers.map((crypto, index) => (
                <div
                  key={crypto.symbol}
                  className="flex items-center justify-between p-4 border rounded-lg bg-green-50 dark:bg-green-900/10"
                >
                  <div className="flex items-center space-x-4">
                    <Badge className="bg-green-500 text-white">#{index + 1}</Badge>
                    <div>
                      <div className="font-medium">{crypto.symbol}</div>
                      <div className="text-sm text-muted-foreground">${formatPrice(crypto.price, crypto.symbol)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-green-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span className="font-bold">+{crypto.change24h.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="losers" className="space-y-4">
            <div className="grid gap-3">
              {topLosers.map((crypto, index) => (
                <div
                  key={crypto.symbol}
                  className="flex items-center justify-between p-4 border rounded-lg bg-red-50 dark:bg-red-900/10"
                >
                  <div className="flex items-center space-x-4">
                    <Badge variant="destructive">#{index + 1}</Badge>
                    <div>
                      <div className="font-medium">{crypto.symbol}</div>
                      <div className="text-sm text-muted-foreground">${formatPrice(crypto.price, crypto.symbol)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-red-600">
                      <TrendingDown className="w-4 h-4 mr-1" />
                      <span className="font-bold">{crypto.change24h.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
