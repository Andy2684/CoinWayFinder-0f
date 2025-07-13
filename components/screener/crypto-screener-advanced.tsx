"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Search, Star, Filter, RefreshCw, Download, Settings, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react"

interface CryptoAsset {
  id: string
  symbol: string
  name: string
  price: number
  change24h: number
  change7d: number
  volume24h: number
  marketCap: number
  sector: string
  rsi: number
  macd: string
  sma20: number
  sma50: number
  ema12: number
  bollingerPosition: number
  atr: number
  stochastic: number
  isWatchlisted: boolean
  rank: number
  circulatingSupply: number
  totalSupply: number
  maxSupply: number
  ath: number
  athDate: string
  atl: number
  atlDate: string
  roi: number
  beta: number
  correlation: number
  volatility: number
  sharpeRatio: number
  exchange: string[]
}

interface FilterCriteria {
  priceRange: [number, number]
  marketCapRange: [number, number]
  volumeRange: [number, number]
  change24hRange: [number, number]
  change7dRange: [number, number]
  rsiRange: [number, number]
  sectors: string[]
  exchanges: string[]
  technicalSignals: string[]
  minRank: number
  maxRank: number
  hasMaxSupply: boolean | null
  roiRange: [number, number]
  volatilityRange: [number, number]
  betaRange: [number, number]
}

const defaultFilters: FilterCriteria = {
  priceRange: [0, 100000],
  marketCapRange: [0, 1000000],
  volumeRange: [0, 10000],
  change24hRange: [-100, 100],
  change7dRange: [-100, 100],
  rsiRange: [0, 100],
  sectors: [],
  exchanges: [],
  technicalSignals: [],
  minRank: 1,
  maxRank: 1000,
  hasMaxSupply: null,
  roiRange: [-100, 1000],
  volatilityRange: [0, 200],
  betaRange: [0, 3],
}

export function CryptoScreenerAdvanced() {
  const [assets, setAssets] = useState<CryptoAsset[]>([])
  const [filteredAssets, setFilteredAssets] = useState<CryptoAsset[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("marketCap")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [loading, setLoading] = useState(false)
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState<FilterCriteria>(defaultFilters)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(
    new Set(["name", "price", "change24h", "marketCap", "volume24h", "rsi", "sector"]),
  )
  const [presetFilter, setPresetFilter] = useState("")

  const sectors = [
    "Layer 1",
    "Layer 2",
    "DeFi",
    "NFT & Gaming",
    "Meme Coins",
    "Privacy",
    "Oracle",
    "Storage",
    "Exchange",
    "Stablecoin",
    "Metaverse",
    "AI & Big Data",
  ]

  const exchanges = ["Binance", "Coinbase", "Kraken", "Bybit", "OKX", "KuCoin", "Gate.io", "Huobi"]

  const technicalSignals = [
    "Strong Buy",
    "Buy",
    "Neutral",
    "Sell",
    "Strong Sell",
    "Oversold (RSI < 30)",
    "Overbought (RSI > 70)",
    "Golden Cross",
    "Death Cross",
    "Breakout",
  ]

  const allColumns = [
    { key: "rank", label: "Rank", sortable: true },
    { key: "name", label: "Name", sortable: true },
    { key: "price", label: "Price", sortable: true },
    { key: "change24h", label: "24h %", sortable: true },
    { key: "change7d", label: "7d %", sortable: true },
    { key: "marketCap", label: "Market Cap", sortable: true },
    { key: "volume24h", label: "Volume 24h", sortable: true },
    { key: "sector", label: "Sector", sortable: true },
    { key: "rsi", label: "RSI", sortable: true },
    { key: "sma20", label: "SMA 20", sortable: true },
    { key: "sma50", label: "SMA 50", sortable: true },
    { key: "ema12", label: "EMA 12", sortable: true },
    { key: "atr", label: "ATR", sortable: true },
    { key: "stochastic", label: "Stochastic", sortable: true },
    { key: "volatility", label: "Volatility", sortable: true },
    { key: "beta", label: "Beta", sortable: true },
    { key: "roi", label: "ROI %", sortable: true },
    { key: "ath", label: "ATH", sortable: true },
    { key: "atl", label: "ATL", sortable: true },
  ]

  const presetFilters = {
    "top-gainers": {
      name: "Top Gainers (24h)",
      filters: { ...defaultFilters, change24hRange: [5, 100] },
    },
    "top-losers": {
      name: "Top Losers (24h)",
      filters: { ...defaultFilters, change24hRange: [-100, -5] },
    },
    "high-volume": {
      name: "High Volume",
      filters: { ...defaultFilters, volumeRange: [100, 10000] },
    },
    oversold: {
      name: "Oversold (RSI < 30)",
      filters: { ...defaultFilters, rsiRange: [0, 30] },
    },
    overbought: {
      name: "Overbought (RSI > 70)",
      filters: { ...defaultFilters, rsiRange: [70, 100] },
    },
    "large-cap": {
      name: "Large Cap (>$10B)",
      filters: { ...defaultFilters, marketCapRange: [10000, 1000000] },
    },
    "mid-cap": {
      name: "Mid Cap ($1B-$10B)",
      filters: { ...defaultFilters, marketCapRange: [1000, 10000] },
    },
    "small-cap": {
      name: "Small Cap (<$1B)",
      filters: { ...defaultFilters, marketCapRange: [0, 1000] },
    },
    "defi-tokens": {
      name: "DeFi Tokens",
      filters: { ...defaultFilters, sectors: ["DeFi"] },
    },
    "layer1-chains": {
      name: "Layer 1 Blockchains",
      filters: { ...defaultFilters, sectors: ["Layer 1"] },
    },
  }

  const fetchCryptoData = async () => {
    setLoading(true)
    try {
      // Mock comprehensive data
      const mockAssets: CryptoAsset[] = [
        {
          id: "bitcoin",
          symbol: "BTC",
          name: "Bitcoin",
          price: 43200,
          change24h: 2.4,
          change7d: 5.8,
          volume24h: 15000,
          marketCap: 850000,
          sector: "Layer 1",
          rsi: 65.4,
          macd: "Bullish",
          sma20: 42800,
          sma50: 41200,
          ema12: 43100,
          bollingerPosition: 0.75,
          atr: 1250,
          stochastic: 68.2,
          isWatchlisted: false,
          rank: 1,
          circulatingSupply: 19700000,
          totalSupply: 19700000,
          maxSupply: 21000000,
          ath: 69000,
          athDate: "2021-11-10",
          atl: 67.81,
          atlDate: "2013-07-06",
          roi: 15420.5,
          beta: 1.2,
          correlation: 1.0,
          volatility: 65.2,
          sharpeRatio: 1.8,
          exchange: ["Binance", "Coinbase", "Kraken"],
        },
        {
          id: "ethereum",
          symbol: "ETH",
          name: "Ethereum",
          price: 2280,
          change24h: 1.8,
          change7d: 3.2,
          volume24h: 8500,
          marketCap: 275000,
          sector: "Layer 1",
          rsi: 58.2,
          macd: "Neutral",
          sma20: 2250,
          sma50: 2180,
          ema12: 2290,
          bollingerPosition: 0.65,
          atr: 85,
          stochastic: 55.8,
          isWatchlisted: true,
          rank: 2,
          circulatingSupply: 120500000,
          totalSupply: 120500000,
          maxSupply: 0,
          ath: 4878,
          athDate: "2021-11-10",
          atl: 0.43,
          atlDate: "2015-10-21",
          roi: 530000,
          beta: 1.5,
          correlation: 0.85,
          volatility: 78.5,
          sharpeRatio: 1.6,
          exchange: ["Binance", "Coinbase", "Kraken", "Bybit"],
        },
        {
          id: "solana",
          symbol: "SOL",
          name: "Solana",
          price: 64,
          change24h: 5.7,
          change7d: 12.4,
          volume24h: 1200,
          marketCap: 28000,
          sector: "Layer 1",
          rsi: 72.8,
          macd: "Bullish",
          sma20: 58,
          sma50: 52,
          ema12: 62,
          bollingerPosition: 0.85,
          atr: 4.2,
          stochastic: 78.5,
          isWatchlisted: false,
          rank: 5,
          circulatingSupply: 437500000,
          totalSupply: 580000000,
          maxSupply: 0,
          ath: 260,
          athDate: "2021-11-06",
          atl: 0.5,
          atlDate: "2020-05-11",
          roi: 12700,
          beta: 2.1,
          correlation: 0.72,
          volatility: 95.8,
          sharpeRatio: 1.4,
          exchange: ["Binance", "Coinbase", "Bybit", "OKX"],
        },
        {
          id: "cardano",
          symbol: "ADA",
          name: "Cardano",
          price: 0.65,
          change24h: -3.2,
          change7d: -1.8,
          volume24h: 450,
          marketCap: 23000,
          sector: "Layer 1",
          rsi: 42.1,
          macd: "Bearish",
          sma20: 0.68,
          sma50: 0.72,
          ema12: 0.66,
          bollingerPosition: 0.25,
          atr: 0.035,
          stochastic: 38.2,
          isWatchlisted: false,
          rank: 8,
          circulatingSupply: 35400000000,
          totalSupply: 35400000000,
          maxSupply: 45000000000,
          ath: 3.09,
          athDate: "2021-09-02",
          atl: 0.017,
          atlDate: "2020-03-13",
          roi: 3720,
          beta: 1.8,
          correlation: 0.68,
          volatility: 82.3,
          sharpeRatio: 0.9,
          exchange: ["Binance", "Coinbase", "Kraken"],
        },
        {
          id: "uniswap",
          symbol: "UNI",
          name: "Uniswap",
          price: 8.45,
          change24h: -1.2,
          change7d: 4.5,
          volume24h: 180,
          marketCap: 5100,
          sector: "DeFi",
          rsi: 48.5,
          macd: "Neutral",
          sma20: 8.8,
          sma50: 9.2,
          ema12: 8.3,
          bollingerPosition: 0.45,
          atr: 0.52,
          stochastic: 45.8,
          isWatchlisted: true,
          rank: 15,
          circulatingSupply: 603500000,
          totalSupply: 1000000000,
          maxSupply: 1000000000,
          ath: 44.97,
          athDate: "2021-05-03",
          atl: 1.03,
          atlDate: "2020-09-17",
          roi: 720,
          beta: 2.3,
          correlation: 0.75,
          volatility: 105.2,
          sharpeRatio: 1.1,
          exchange: ["Binance", "Coinbase", "Bybit"],
        },
        {
          id: "polygon",
          symbol: "MATIC",
          name: "Polygon",
          price: 0.85,
          change24h: 3.8,
          change7d: 8.2,
          volume24h: 320,
          marketCap: 8500,
          sector: "Layer 2",
          rsi: 61.3,
          macd: "Bullish",
          sma20: 0.82,
          sma50: 0.78,
          ema12: 0.84,
          bollingerPosition: 0.72,
          atr: 0.045,
          stochastic: 62.5,
          isWatchlisted: false,
          rank: 12,
          circulatingSupply: 10000000000,
          totalSupply: 10000000000,
          maxSupply: 10000000000,
          ath: 2.92,
          athDate: "2021-12-27",
          atl: 0.003,
          atlDate: "2019-05-10",
          roi: 28200,
          beta: 1.9,
          correlation: 0.71,
          volatility: 88.7,
          sharpeRatio: 1.3,
          exchange: ["Binance", "Coinbase", "OKX"],
        },
        {
          id: "dogecoin",
          symbol: "DOGE",
          name: "Dogecoin",
          price: 0.082,
          change24h: 8.5,
          change7d: 15.2,
          volume24h: 890,
          marketCap: 12000,
          sector: "Meme Coins",
          rsi: 78.2,
          macd: "Bullish",
          sma20: 0.075,
          sma50: 0.068,
          ema12: 0.079,
          bollingerPosition: 0.88,
          atr: 0.0065,
          stochastic: 82.1,
          isWatchlisted: false,
          rank: 10,
          circulatingSupply: 146000000000,
          totalSupply: 146000000000,
          maxSupply: 0,
          ath: 0.73,
          athDate: "2021-05-08",
          atl: 0.00008,
          atlDate: "2015-05-07",
          roi: 102400,
          beta: 2.5,
          correlation: 0.45,
          volatility: 125.8,
          sharpeRatio: 0.8,
          exchange: ["Binance", "Coinbase", "Kraken", "Bybit"],
        },
        {
          id: "chainlink",
          symbol: "LINK",
          name: "Chainlink",
          price: 14.25,
          change24h: -0.8,
          change7d: 2.1,
          volume24h: 420,
          marketCap: 8400,
          sector: "Oracle",
          rsi: 52.7,
          macd: "Neutral",
          sma20: 14.8,
          sma50: 15.2,
          ema12: 14.1,
          bollingerPosition: 0.42,
          atr: 0.85,
          stochastic: 48.5,
          isWatchlisted: false,
          rank: 13,
          circulatingSupply: 590000000,
          totalSupply: 1000000000,
          maxSupply: 1000000000,
          ath: 52.7,
          athDate: "2021-05-10",
          atl: 0.148,
          atlDate: "2017-11-29",
          roi: 9530,
          beta: 1.7,
          correlation: 0.69,
          volatility: 92.3,
          sharpeRatio: 1.2,
          exchange: ["Binance", "Coinbase", "Kraken"],
        },
      ]

      setAssets(mockAssets)
      setFilteredAssets(mockAssets)

      // Initialize watchlist
      const watchlistedIds = mockAssets.filter((asset) => asset.isWatchlisted).map((asset) => asset.id)
      setWatchlist(new Set(watchlistedIds))
    } catch (error) {
      console.error("Error fetching crypto data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCryptoData()
  }, [])

  const filteredAndSortedAssets = useMemo(() => {
    const filtered = assets.filter((asset) => {
      const matchesSearch =
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesFilters =
        asset.price >= filters.priceRange[0] &&
        asset.price <= filters.priceRange[1] &&
        asset.marketCap >= filters.marketCapRange[0] * 1000000 &&
        asset.marketCap <= filters.marketCapRange[1] * 1000000 &&
        asset.volume24h >= filters.volumeRange[0] * 1000000 &&
        asset.volume24h <= filters.volumeRange[1] * 1000000 &&
        asset.change24h >= filters.change24hRange[0] &&
        asset.change24h <= filters.change24hRange[1] &&
        asset.change7d >= filters.change7dRange[0] &&
        asset.change7d <= filters.change7dRange[1] &&
        asset.rsi >= filters.rsiRange[0] &&
        asset.rsi <= filters.rsiRange[1] &&
        asset.rank >= filters.minRank &&
        asset.rank <= filters.maxRank &&
        asset.roi >= filters.roiRange[0] &&
        asset.roi <= filters.roiRange[1] &&
        asset.volatility >= filters.volatilityRange[0] &&
        asset.volatility <= filters.volatilityRange[1] &&
        asset.beta >= filters.betaRange[0] &&
        asset.beta <= filters.betaRange[1] &&
        (filters.sectors.length === 0 || filters.sectors.includes(asset.sector)) &&
        (filters.exchanges.length === 0 || filters.exchanges.some((exchange) => asset.exchange.includes(exchange))) &&
        (filters.hasMaxSupply === null ||
          (filters.hasMaxSupply && asset.maxSupply > 0) ||
          (!filters.hasMaxSupply && asset.maxSupply === 0))

      return matchesSearch && matchesFilters
    })

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy as keyof CryptoAsset]
      let bValue = b[sortBy as keyof CryptoAsset]

      if (typeof aValue === "string") aValue = aValue.toLowerCase()
      if (typeof bValue === "string") bValue = bValue.toLowerCase()

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return filtered
  }, [assets, searchTerm, filters, sortBy, sortOrder])

  const toggleWatchlist = (assetId: string) => {
    const newWatchlist = new Set(watchlist)
    if (newWatchlist.has(assetId)) {
      newWatchlist.delete(assetId)
    } else {
      newWatchlist.add(assetId)
    }
    setWatchlist(newWatchlist)
  }

  const toggleColumn = (columnKey: string) => {
    const newColumns = new Set(selectedColumns)
    if (newColumns.has(columnKey)) {
      newColumns.delete(columnKey)
    } else {
      newColumns.add(columnKey)
    }
    setSelectedColumns(newColumns)
  }

  const applyPresetFilter = (presetKey: string) => {
    if (presetFilters[presetKey as keyof typeof presetFilters]) {
      setFilters(presetFilters[presetKey as keyof typeof presetFilters].filters)
      setPresetFilter(presetKey)
    }
  }

  const clearFilters = () => {
    setFilters(defaultFilters)
    setPresetFilter("")
  }

  const exportData = () => {
    const csvContent = [
      // Header
      allColumns
        .filter((col) => selectedColumns.has(col.key))
        .map((col) => col.label)
        .join(","),
      // Data rows
      ...filteredAndSortedAssets.map((asset) =>
        allColumns
          .filter((col) => selectedColumns.has(col.key))
          .map((col) => {
            const value = asset[col.key as keyof CryptoAsset]
            return typeof value === "string" ? `"${value}"` : value
          })
          .join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `crypto-screener-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatValue = (key: string, value: any) => {
    switch (key) {
      case "price":
        return value < 1 ? `$${value.toFixed(4)}` : `$${value.toLocaleString()}`
      case "marketCap":
      case "volume24h":
        if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
        if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
        return `$${value.toLocaleString()}`
      case "change24h":
      case "change7d":
      case "roi":
        return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`
      case "rsi":
      case "stochastic":
      case "volatility":
      case "beta":
        return value.toFixed(2)
      case "sma20":
      case "sma50":
      case "ema12":
      case "ath":
      case "atl":
        return value < 1 ? `$${value.toFixed(4)}` : `$${value.toFixed(2)}`
      case "atr":
        return value.toFixed(3)
      default:
        return value
    }
  }

  const getChangeColor = (change: number) => {
    return change >= 0 ? "text-green-600" : "text-red-600"
  }

  const getRSIColor = (rsi: number) => {
    if (rsi >= 70) return "text-red-600"
    if (rsi <= 30) return "text-green-600"
    return "text-yellow-600"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Advanced Crypto Screener</h2>
          <p className="text-muted-foreground">
            Professional cryptocurrency screening with advanced filters and analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={fetchCryptoData} disabled={loading} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search cryptocurrencies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {allColumns
                    .filter((col) => col.sortable)
                    .map((col) => (
                      <SelectItem key={col.key} value={col.key}>
                        {col.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
                {sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Columns
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Select Columns</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                    {allColumns.map((col) => (
                      <div key={col.key} className="flex items-center space-x-2">
                        <Checkbox
                          id={col.key}
                          checked={selectedColumns.has(col.key)}
                          onCheckedChange={() => toggleColumn(col.key)}
                        />
                        <Label htmlFor={col.key} className="text-sm">
                          {col.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {/* Preset Filters */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(presetFilters).map(([key, preset]) => (
              <Button
                key={key}
                variant={presetFilter === key ? "default" : "outline"}
                size="sm"
                onClick={() => applyPresetFilter(key)}
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </CardHeader>

        {showFilters && (
          <CardContent className="border-t">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="technical">Technical</TabsTrigger>
                <TabsTrigger value="fundamental">Fundamental</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>Price Range</Label>
                    <div className="px-2">
                      <Slider
                        value={filters.priceRange}
                        onValueChange={(value) => setFilters({ ...filters, priceRange: value as [number, number] })}
                        max={100000}
                        step={100}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>${filters.priceRange[0]}</span>
                        <span>${filters.priceRange[1]}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Market Cap (Millions)</Label>
                    <div className="px-2">
                      <Slider
                        value={filters.marketCapRange}
                        onValueChange={(value) => setFilters({ ...filters, marketCapRange: value as [number, number] })}
                        max={1000000}
                        step={1000}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>${filters.marketCapRange[0]}M</span>
                        <span>${filters.marketCapRange[1]}M</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>24h Change (%)</Label>
                    <div className="px-2">
                      <Slider
                        value={filters.change24hRange}
                        onValueChange={(value) => setFilters({ ...filters, change24hRange: value as [number, number] })}
                        min={-100}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{filters.change24hRange[0]}%</span>
                        <span>{filters.change24hRange[1]}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Sectors</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {sectors.map((sector) => (
                        <div key={sector} className="flex items-center space-x-2">
                          <Checkbox
                            id={sector}
                            checked={filters.sectors.includes(sector)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFilters({
                                  ...filters,
                                  sectors: [...filters.sectors, sector],
                                })
                              } else {
                                setFilters({
                                  ...filters,
                                  sectors: filters.sectors.filter((s) => s !== sector),
                                })
                              }
                            }}
                          />
                          <Label htmlFor={sector} className="text-sm">
                            {sector}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Exchanges</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {exchanges.map((exchange) => (
                        <div key={exchange} className="flex items-center space-x-2">
                          <Checkbox
                            id={exchange}
                            checked={filters.exchanges.includes(exchange)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFilters({
                                  ...filters,
                                  exchanges: [...filters.exchanges, exchange],
                                })
                              } else {
                                setFilters({
                                  ...filters,
                                  exchanges: filters.exchanges.filter((e) => e !== exchange),
                                })
                              }
                            }}
                          />
                          <Label htmlFor={exchange} className="text-sm">
                            {exchange}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="technical" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>RSI Range</Label>
                    <div className="px-2">
                      <Slider
                        value={filters.rsiRange}
                        onValueChange={(value) => setFilters({ ...filters, rsiRange: value as [number, number] })}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{filters.rsiRange[0]}</span>
                        <span>{filters.rsiRange[1]}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Volatility Range (%)</Label>
                    <div className="px-2">
                      <Slider
                        value={filters.volatilityRange}
                        onValueChange={(value) =>
                          setFilters({ ...filters, volatilityRange: value as [number, number] })
                        }
                        max={200}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{filters.volatilityRange[0]}%</span>
                        <span>{filters.volatilityRange[1]}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Beta Range</Label>
                    <div className="px-2">
                      <Slider
                        value={filters.betaRange}
                        onValueChange={(value) => setFilters({ ...filters, betaRange: value as [number, number] })}
                        max={3}
                        step={0.1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{filters.betaRange[0]}</span>
                        <span>{filters.betaRange[1]}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="fundamental" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>Market Cap Rank</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={filters.minRank}
                        onChange={(e) => setFilters({ ...filters, minRank: Number(e.target.value) || 1 })}
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={filters.maxRank}
                        onChange={(e) => setFilters({ ...filters, maxRank: Number(e.target.value) || 1000 })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>ROI Range (%)</Label>
                    <div className="px-2">
                      <Slider
                        value={filters.roiRange}
                        onValueChange={(value) => setFilters({ ...filters, roiRange: value as [number, number] })}
                        min={-100}
                        max={1000}
                        step={10}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{filters.roiRange[0]}%</span>
                        <span>{filters.roiRange[1]}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Supply Type</Label>
                    <Select
                      value={filters.hasMaxSupply === null ? "all" : filters.hasMaxSupply ? "capped" : "uncapped"}
                      onValueChange={(value) =>
                        setFilters({
                          ...filters,
                          hasMaxSupply: value === "all" ? null : value === "capped" ? true : false,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="capped">Capped Supply</SelectItem>
                        <SelectItem value="uncapped">Uncapped Supply</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Volume Range (Millions)</Label>
                    <div className="px-2">
                      <Slider
                        value={filters.volumeRange}
                        onValueChange={(value) => setFilters({ ...filters, volumeRange: value as [number, number] })}
                        max={10000}
                        step={100}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>${filters.volumeRange[0]}M</span>
                        <span>${filters.volumeRange[1]}M</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>7d Change Range (%)</Label>
                    <div className="px-2">
                      <Slider
                        value={filters.change7dRange}
                        onValueChange={(value) => setFilters({ ...filters, change7dRange: value as [number, number] })}
                        min={-100}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{filters.change7dRange[0]}%</span>
                        <span>{filters.change7dRange[1]}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {filteredAndSortedAssets.length} of {assets.length} assets match your criteria
              </div>
              <Button onClick={clearFilters} variant="outline" size="sm">
                Clear All Filters
              </Button>
            </div>
          </CardContent>
        )}

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  {allColumns
                    .filter((col) => selectedColumns.has(col.key))
                    .map((col) => (
                      <TableHead
                        key={col.key}
                        className={col.sortable ? "cursor-pointer hover:bg-muted/50" : ""}
                        onClick={() => col.sortable && setSortBy(col.key)}
                      >
                        <div className="flex items-center gap-1">
                          {col.label}
                          {col.sortable && sortBy === col.key && <ArrowUpDown className="h-3 w-3" />}
                        </div>
                      </TableHead>
                    ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedAssets.map((asset) => (
                  <TableRow key={asset.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => toggleWatchlist(asset.id)}>
                        <Star
                          className={`h-4 w-4 ${
                            watchlist.has(asset.id) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                          }`}
                        />
                      </Button>
                    </TableCell>
                    {allColumns
                      .filter((col) => selectedColumns.has(col.key))
                      .map((col) => (
                        <TableCell key={col.key}>
                          {col.key === "name" ? (
                            <div>
                              <div className="font-medium">{asset.name}</div>
                              <div className="text-sm text-muted-foreground">{asset.symbol}</div>
                            </div>
                          ) : col.key === "sector" ? (
                            <Badge variant="outline">{asset.sector}</Badge>
                          ) : col.key === "change24h" || col.key === "change7d" ? (
                            <span className={getChangeColor(asset[col.key as keyof CryptoAsset] as number)}>
                              {formatValue(col.key, asset[col.key as keyof CryptoAsset])}
                            </span>
                          ) : col.key === "rsi" ? (
                            <span className={getRSIColor(asset.rsi)}>
                              {formatValue(col.key, asset[col.key as keyof CryptoAsset])}
                            </span>
                          ) : (
                            formatValue(col.key, asset[col.key as keyof CryptoAsset])
                          )}
                        </TableCell>
                      ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
