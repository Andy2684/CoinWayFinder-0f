"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Star, TrendingUp, TrendingDown, Filter, RefreshCw } from "lucide-react"

interface CryptoAsset {
  id: string
  symbol: string
  name: string
  price: number
  change24h: number
  volume24h: number
  marketCap: number
  sector: string
  rsi: number
  macd: string
  isWatchlisted: boolean
}

interface FilterOptions {
  priceMin: string
  priceMax: string
  marketCapMin: string
  marketCapMax: string
  volumeMin: string
  change24hMin: string
  change24hMax: string
  sector: string
  rsiMin: string
  rsiMax: string
}

export function CryptoScreener() {
  const [assets, setAssets] = useState<CryptoAsset[]>([])
  const [filteredAssets, setFilteredAssets] = useState<CryptoAsset[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("marketCap")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(false)
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set())

  const [filters, setFilters] = useState<FilterOptions>({
    priceMin: "",
    priceMax: "",
    marketCapMin: "",
    marketCapMax: "",
    volumeMin: "",
    change24hMin: "",
    change24hMax: "",
    sector: "",
    rsiMin: "",
    rsiMax: "",
  })

  const sectors = [
    "All Sectors",
    "Layer 1",
    "DeFi",
    "Layer 2",
    "NFT & Gaming",
    "Meme Coins",
    "Privacy",
    "Oracle",
    "Storage",
    "Exchange",
  ]

  const sortOptions = [
    { value: "marketCap", label: "Market Cap" },
    { value: "price", label: "Price" },
    { value: "change24h", label: "24h Change" },
    { value: "volume24h", label: "24h Volume" },
    { value: "name", label: "Name" },
    { value: "rsi", label: "RSI" },
  ]

  const fetchCryptoData = async () => {
    setLoading(true)
    try {
      // Mock data for demonstration
      const mockAssets: CryptoAsset[] = [
        {
          id: "bitcoin",
          symbol: "BTC",
          name: "Bitcoin",
          price: 43200,
          change24h: 2.4,
          volume24h: 15000000000,
          marketCap: 850000000000,
          sector: "Layer 1",
          rsi: 65.4,
          macd: "Bullish",
          isWatchlisted: false,
        },
        {
          id: "ethereum",
          symbol: "ETH",
          name: "Ethereum",
          price: 2280,
          change24h: 1.8,
          volume24h: 8500000000,
          marketCap: 275000000000,
          sector: "Layer 1",
          rsi: 58.2,
          macd: "Neutral",
          isWatchlisted: true,
        },
        {
          id: "cardano",
          symbol: "ADA",
          name: "Cardano",
          price: 0.65,
          change24h: -3.2,
          volume24h: 450000000,
          marketCap: 23000000000,
          sector: "Layer 1",
          rsi: 42.1,
          macd: "Bearish",
          isWatchlisted: false,
        },
        {
          id: "solana",
          symbol: "SOL",
          name: "Solana",
          price: 64,
          change24h: 5.7,
          volume24h: 1200000000,
          marketCap: 28000000000,
          sector: "Layer 1",
          rsi: 72.8,
          macd: "Bullish",
          isWatchlisted: false,
        },
        {
          id: "uniswap",
          symbol: "UNI",
          name: "Uniswap",
          price: 8.45,
          change24h: -1.2,
          volume24h: 180000000,
          marketCap: 5100000000,
          sector: "DeFi",
          rsi: 48.5,
          macd: "Neutral",
          isWatchlisted: true,
        },
        {
          id: "polygon",
          symbol: "MATIC",
          name: "Polygon",
          price: 0.85,
          change24h: 3.8,
          volume24h: 320000000,
          marketCap: 8500000000,
          sector: "Layer 2",
          rsi: 61.3,
          macd: "Bullish",
          isWatchlisted: false,
        },
        {
          id: "dogecoin",
          symbol: "DOGE",
          name: "Dogecoin",
          price: 0.082,
          change24h: 8.5,
          volume24h: 890000000,
          marketCap: 12000000000,
          sector: "Meme Coins",
          rsi: 78.2,
          macd: "Bullish",
          isWatchlisted: false,
        },
        {
          id: "chainlink",
          symbol: "LINK",
          name: "Chainlink",
          price: 14.25,
          change24h: -0.8,
          volume24h: 420000000,
          marketCap: 8400000000,
          sector: "Oracle",
          rsi: 52.7,
          macd: "Neutral",
          isWatchlisted: false,
        },
      ]

      setAssets(mockAssets)
      setFilteredAssets(mockAssets)

      // Initialize watchlist from mock data
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

  useEffect(() => {
    const filtered = assets.filter((asset) => {
      const matchesSearch =
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesFilters =
        (!filters.priceMin || asset.price >= Number.parseFloat(filters.priceMin)) &&
        (!filters.priceMax || asset.price <= Number.parseFloat(filters.priceMax)) &&
        (!filters.marketCapMin || asset.marketCap >= Number.parseFloat(filters.marketCapMin) * 1000000) &&
        (!filters.marketCapMax || asset.marketCap <= Number.parseFloat(filters.marketCapMax) * 1000000) &&
        (!filters.volumeMin || asset.volume24h >= Number.parseFloat(filters.volumeMin) * 1000000) &&
        (!filters.change24hMin || asset.change24h >= Number.parseFloat(filters.change24hMin)) &&
        (!filters.change24hMax || asset.change24h <= Number.parseFloat(filters.change24hMax)) &&
        (!filters.sector || filters.sector === "All Sectors" || asset.sector === filters.sector) &&
        (!filters.rsiMin || asset.rsi >= Number.parseFloat(filters.rsiMin)) &&
        (!filters.rsiMax || asset.rsi <= Number.parseFloat(filters.rsiMax))

      return matchesSearch && matchesFilters
    })

    // Sort filtered results
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

    setFilteredAssets(filtered)
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

  const formatMarketCap = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    return `$${value.toLocaleString()}`
  }

  const formatVolume = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`
    return `$${value.toLocaleString()}`
  }

  const getChangeColor = (change: number) => {
    return change >= 0 ? "text-green-600" : "text-red-600"
  }

  const getRSIColor = (rsi: number) => {
    if (rsi >= 70) return "text-red-600"
    if (rsi <= 30) return "text-green-600"
    return "text-yellow-600"
  }

  const getMACDColor = (macd: string) => {
    switch (macd.toLowerCase()) {
      case "bullish":
        return "bg-green-100 text-green-800"
      case "bearish":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const clearFilters = () => {
    setFilters({
      priceMin: "",
      priceMax: "",
      marketCapMin: "",
      marketCapMax: "",
      volumeMin: "",
      change24hMin: "",
      change24hMax: "",
      sector: "",
      rsiMin: "",
      rsiMax: "",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Crypto Screener</h2>
          <p className="text-muted-foreground">Advanced cryptocurrency screening and filtering</p>
        </div>
        <Button onClick={fetchCryptoData} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
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
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
                {sortOrder === "asc" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              </Button>
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardHeader>

        {showFilters && (
          <CardContent className="border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Price Range</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Min"
                    value={filters.priceMin}
                    onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
                    type="number"
                  />
                  <Input
                    placeholder="Max"
                    value={filters.priceMax}
                    onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
                    type="number"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Market Cap (M)</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Min"
                    value={filters.marketCapMin}
                    onChange={(e) => setFilters({ ...filters, marketCapMin: e.target.value })}
                    type="number"
                  />
                  <Input
                    placeholder="Max"
                    value={filters.marketCapMax}
                    onChange={(e) => setFilters({ ...filters, marketCapMax: e.target.value })}
                    type="number"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">24h Change (%)</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Min"
                    value={filters.change24hMin}
                    onChange={(e) => setFilters({ ...filters, change24hMin: e.target.value })}
                    type="number"
                  />
                  <Input
                    placeholder="Max"
                    value={filters.change24hMax}
                    onChange={(e) => setFilters({ ...filters, change24hMax: e.target.value })}
                    type="number"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Sector</label>
                <Select value={filters.sector} onValueChange={(value) => setFilters({ ...filters, sector: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Sectors" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectors.map((sector) => (
                      <SelectItem key={sector} value={sector}>
                        {sector}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">RSI Range</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Min"
                    value={filters.rsiMin}
                    onChange={(e) => setFilters({ ...filters, rsiMin: e.target.value })}
                    type="number"
                    min="0"
                    max="100"
                  />
                  <Input
                    placeholder="Max"
                    value={filters.rsiMax}
                    onChange={(e) => setFilters({ ...filters, rsiMax: e.target.value })}
                    type="number"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Volume (M)</label>
                <Input
                  placeholder="Min volume"
                  value={filters.volumeMin}
                  onChange={(e) => setFilters({ ...filters, volumeMin: e.target.value })}
                  type="number"
                />
              </div>
            </div>
            <Button onClick={clearFilters} variant="outline" size="sm">
              Clear Filters
            </Button>
          </CardContent>
        )}

        <CardContent>
          <div className="text-sm text-muted-foreground mb-4">
            Showing {filteredAssets.length} of {assets.length} cryptocurrencies
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>24h Change</TableHead>
                  <TableHead>Market Cap</TableHead>
                  <TableHead>Volume (24h)</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead>RSI</TableHead>
                  <TableHead>MACD</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => toggleWatchlist(asset.id)}>
                        <Star
                          className={`h-4 w-4 ${
                            watchlist.has(asset.id) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                          }`}
                        />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{asset.name}</div>
                        <div className="text-sm text-muted-foreground">{asset.symbol}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${asset.price < 1 ? asset.price.toFixed(4) : asset.price.toLocaleString()}
                    </TableCell>
                    <TableCell className={getChangeColor(asset.change24h)}>
                      {asset.change24h >= 0 ? "+" : ""}
                      {asset.change24h.toFixed(2)}%
                    </TableCell>
                    <TableCell>{formatMarketCap(asset.marketCap)}</TableCell>
                    <TableCell>{formatVolume(asset.volume24h)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{asset.sector}</Badge>
                    </TableCell>
                    <TableCell className={getRSIColor(asset.rsi)}>{asset.rsi.toFixed(1)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getMACDColor(asset.macd)}>
                        {asset.macd}
                      </Badge>
                    </TableCell>
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
