"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, Activity } from "lucide-react"

interface MarketData {
  symbol: string
  name: string
  price: number
  change: number
  volume: number
  marketCap: number
  category: string
}

export function MarketHeatmap() {
  const [timeframe, setTimeframe] = useState("24h")
  const [category, setCategory] = useState("all")
  const [marketData, setMarketData] = useState<MarketData[]>([])

  useEffect(() => {
    // Generate realistic market data
    const cryptos = [
      { symbol: "BTC", name: "Bitcoin", category: "Layer 1" },
      { symbol: "ETH", name: "Ethereum", category: "Layer 1" },
      { symbol: "SOL", name: "Solana", category: "Layer 1" },
      { symbol: "ADA", name: "Cardano", category: "Layer 1" },
      { symbol: "MATIC", name: "Polygon", category: "Layer 2" },
      { symbol: "AVAX", name: "Avalanche", category: "Layer 1" },
      { symbol: "DOT", name: "Polkadot", category: "Layer 0" },
      { symbol: "LINK", name: "Chainlink", category: "Oracle" },
      { symbol: "UNI", name: "Uniswap", category: "DeFi" },
      { symbol: "AAVE", name: "Aave", category: "DeFi" },
      { symbol: "CRV", name: "Curve", category: "DeFi" },
      { symbol: "COMP", name: "Compound", category: "DeFi" },
      { symbol: "MKR", name: "Maker", category: "DeFi" },
      { symbol: "SNX", name: "Synthetix", category: "DeFi" },
      { symbol: "1INCH", name: "1inch", category: "DeFi" },
      { symbol: "SAND", name: "Sandbox", category: "Gaming" },
      { symbol: "MANA", name: "Decentraland", category: "Gaming" },
      { symbol: "AXS", name: "Axie Infinity", category: "Gaming" },
      { symbol: "ENJ", name: "Enjin", category: "Gaming" },
      { symbol: "GALA", name: "Gala", category: "Gaming" },
    ]

    const data = cryptos.map((crypto) => ({
      ...crypto,
      price: Math.random() * 1000 + 1,
      change: (Math.random() - 0.5) * 20, // -10% to +10%
      volume: Math.random() * 1000000000 + 100000000,
      marketCap: Math.random() * 100000000000 + 1000000000,
    }))

    setMarketData(data)

    // Update every 10 seconds
    const interval = setInterval(() => {
      setMarketData((prevData) =>
        prevData.map((item) => ({
          ...item,
          change: item.change + (Math.random() - 0.5) * 2,
          volume: item.volume * (0.9 + Math.random() * 0.2),
        })),
      )
    }, 10000)

    return () => clearInterval(interval)
  }, [timeframe])

  const filteredData = category === "all" ? marketData : marketData.filter((item) => item.category === category)

  const getChangeColor = (change: number) => {
    if (change > 5) return "bg-green-600"
    if (change > 2) return "bg-green-500"
    if (change > 0) return "bg-green-400"
    if (change > -2) return "bg-red-400"
    if (change > -5) return "bg-red-500"
    return "bg-red-600"
  }

  const getTextColor = (change: number) => {
    return Math.abs(change) > 3 ? "text-white" : "text-gray-900"
  }

  const formatMarketCap = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`
    return `$${value.toFixed(0)}`
  }

  const categories = ["all", "Layer 1", "Layer 2", "DeFi", "Gaming", "Oracle"]

  // Calculate grid dimensions based on data length
  const getGridSize = (length: number) => {
    const sqrt = Math.ceil(Math.sqrt(length))
    if (length <= 4) return { cols: 2, rows: 2 }
    if (length <= 9) return { cols: 3, rows: 3 }
    if (length <= 16) return { cols: 4, rows: 4 }
    return { cols: 5, rows: Math.ceil(length / 5) }
  }

  const gridSize = getGridSize(filteredData.length)

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <Activity className="w-5 h-5 mr-2 text-[#30D5C8]" />
            Market Heatmap
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-20 bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="1h">1h</SelectItem>
                <SelectItem value="24h">24h</SelectItem>
                <SelectItem value="7d">7d</SelectItem>
                <SelectItem value="30d">30d</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Market Summary */}
        <div className="flex items-center space-x-6">
          <Badge className="bg-green-500/10 text-green-400">
            <TrendingUp className="w-3 h-3 mr-1" />
            {filteredData.filter((item) => item.change > 0).length} Gainers
          </Badge>
          <Badge className="bg-red-500/10 text-red-400">
            <TrendingDown className="w-3 h-3 mr-1" />
            {filteredData.filter((item) => item.change < 0).length} Losers
          </Badge>
          <span className="text-gray-400 text-sm">Total: {filteredData.length} assets</span>
        </div>
      </CardHeader>

      <CardContent>
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${gridSize.cols}, 1fr)`,
            minHeight: `${gridSize.rows * 120}px`,
          }}
        >
          {filteredData.map((asset, index) => (
            <div
              key={asset.symbol}
              className={`${getChangeColor(asset.change)} rounded-lg p-3 transition-all duration-300 hover:scale-105 cursor-pointer border border-gray-600`}
              style={{
                opacity: 0.7 + Math.abs(asset.change) / 20,
              }}
            >
              <div className={`${getTextColor(asset.change)} space-y-1`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">{asset.symbol}</span>
                  <span className="text-xs opacity-75">{asset.category}</span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium truncate">{asset.name}</p>
                  <p className="font-bold text-sm">${asset.price.toFixed(asset.price < 1 ? 4 : 2)}</p>
                  <p className="font-semibold">
                    {asset.change > 0 ? "+" : ""}
                    {asset.change.toFixed(2)}%
                  </p>
                  <p className="text-xs opacity-75">{formatMarketCap(asset.marketCap)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Color Legend */}
        <div className="flex items-center justify-center space-x-4 mt-6 pt-4 border-t border-gray-700">
          <span className="text-sm text-gray-400">Change %:</span>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-600 rounded"></div>
            <span className="text-xs text-gray-400">-5%+</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-400 rounded"></div>
            <span className="text-xs text-gray-400">-2%</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-600 rounded"></div>
            <span className="text-xs text-gray-400">0%</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-400 rounded"></div>
            <span className="text-xs text-gray-400">+2%</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-600 rounded"></div>
            <span className="text-xs text-gray-400">+5%+</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
