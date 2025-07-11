"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, TrendingUp, TrendingDown, RefreshCw, Star } from "lucide-react"

interface CryptoAsset {
  symbol: string
  name: string
  price: number
  change24h: number
  volume24h: number
  marketCap: number
  rsi: number
  macd: number
  volume: number
  rank: number
  sector: string
  isWatchlisted: boolean
}

interface ScreenerFilters {
  priceRange: [number, number]
  marketCapRange: [number, number]
  volumeRange: [number, number]
  changeRange: [number, number]
  rsiRange: [number, number]
  sectors: string[]
  minRank: number
  maxRank: number
}

export function CryptoScreener() {
  const [assets, setAssets] = useState<CryptoAsset[]>([])
  const [filteredAssets, setFilteredAssets] = useState<CryptoAsset[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("marketCap")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(false)

  const [filters, setFilters] = useState<ScreenerFilters>({
    priceRange: [0, 100000],
    marketCapRange: [0, 1000000],
    volumeRange: [0, 10000],
    changeRange: [-50, 50],
    rsiRange: [0, 100],
    sectors: [],
    minRank: 1,
    maxRank: 500,
  })

  const sectors = ["DeFi", "Layer 1", "Layer 2", "NFT", "Gaming", "Metaverse", "AI", "Storage"]

  useEffect(() => {
    fetchAssets()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [assets, searchTerm, filters, sortBy, sortOrder])

  const fetchAssets = async () => {
    setLoading(true)
    try {
      // Mock data for demonstration
      const mockAssets: CryptoAsset[] = [
        {
          symbol: "BTC",
          name: "Bitcoin",
          price: 42000,
          change24h: 2.5,
          volume24h: 15000000000,
          marketCap: 820000000000,
          rsi: 65,
          macd: 0.002,
          volume: 15000,
          rank: 1,
          sector: "Layer 1",
          isWatchlisted: true,
        },
        {
          symbol: "ETH",
          name: "Ethereum",
          price: 2500,
          change24h: -1.2,
          volume24h: 8000000000,
          marketCap: 300000000000,
          rsi: 58,
          macd: -0.001,
          volume: 8000,
          rank: 2,
          sector: "Layer 1",
          isWatchlisted: false,
        },
        {
          symbol: "UNI",
          name: "Uniswap",
          price: 8.5,
          change24h: 5.8,
          volume24h: 200000000,
          marketCap: 5000000000,
          rsi: 72,
          macd: 0.05,
          volume: 200,
          rank: 15,
          sector: "DeFi",
          isWatchlisted: false,
        },
        {
          symbol: "MATIC",
          name: "Polygon",
          price: 0.85,
          change24h: 8.2,
          volume24h: 400000000,
          marketCap: 8000000000,
          rsi: 78,
          macd: 0.02,
          volume: 400,
          rank: 12,
          sector: "Layer 2",
          isWatchlisted: true,
        },
        {
          symbol: "SAND",
          name: "The Sandbox",
          price: 0.45,
          change24h: -3.2,
          volume24h: 150000000,
          marketCap: 1000000000,
          rsi: 42,
          macd: -0.01,
          volume: 150,
          rank: 45,
          sector: "Metaverse",
          isWatchlisted: false,
        },
      ]

      setAssets(mockAssets)
    } catch (error) {
      console.error("Error fetching assets:", error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    const filtered = assets.filter((asset) => {
      const matchesSearch =
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesPrice = asset.price >= filters.priceRange[0] && asset.price <= filters.priceRange[1]
      const matchesMarketCap =
        asset.marketCap >= filters.marketCapRange[0] * 1000000 && asset.marketCap <= filters.marketCapRange[1] * 1000000
      const matchesVolume =
        asset.volume24h >= filters.volumeRange[0] * 1000000 && asset.volume24h <= filters.volumeRange[1] * 1000000
      const matchesChange = asset.change24h >= filters.changeRange[0] && asset.change24h <= filters.changeRange[1]
      const matchesRSI = asset.rsi >= filters.rsiRange[0] && asset.rsi <= filters.rsiRange[1]
      const matchesSector = filters.sectors.length === 0 || filters.sectors.includes(asset.sector)
      const matchesRank = asset.rank >= filters.minRank && asset.rank <= filters.maxRank

      return (
        matchesSearch &&
        matchesPrice &&
        matchesMarketCap &&
        matchesVolume &&
        matchesChange &&
        matchesRSI &&
        matchesSector &&
        matchesRank
      )
    })

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue: number, bValue: number

      switch (sortBy) {
        case "price":
          aValue = a.price
          bValue = b.price
          break
        case "change24h":
          aValue = a.change24h
          bValue = b.change24h
          break
        case "volume24h":
          aValue = a.volume24h
          bValue = b.volume24h
          break
        case "rsi":
          aValue = a.rsi
          bValue = b.rsi
          break
        case "rank":
          aValue = a.rank
          bValue = b.rank
          break
        default:
          aValue = a.marketCap
          bValue = b.marketCap
      }

      return sortOrder === "asc" ? aValue - bValue : bValue - aValue
    })

    setFilteredAssets(filtered)
  }

  const toggleWatchlist = (symbol: string) => {
    setAssets((prev) =>
      prev.map((asset) => (asset.symbol === symbol ? { ...asset, isWatchlisted: !asset.isWatchlisted } : asset)),
    )
  }

  const resetFilters = () => {
    setFilters({
      priceRange: [0, 100000],
      marketCapRange: [0, 1000000],
      volumeRange: [0, 10000],
      changeRange: [-50, 50],
      rsiRange: [0, 100],
      sectors: [],
      minRank: 1,
      maxRank: 500,
    })
    setSearchTerm("")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Cryptocurrency Screener
            </div>
            <Button variant="outline" size="sm" onClick={fetchAssets} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </CardTitle>
          <CardDescription>
            Advanced screening tool to find cryptocurrencies based on technical and fundamental criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by name or symbol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="marketCap">Market Cap</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="change24h">24h Change</SelectItem>
                <SelectItem value="volume24h">Volume</SelectItem>
                <SelectItem value="rsi">RSI</SelectItem>
                <SelectItem value="rank">Rank</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
              {sortOrder === "asc" ? "↑" : "↓"}
            </Button>

            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  Advanced Filters
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    Reset All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Price Range ($)</label>
                    <Slider
                      value={filters.priceRange}
                      onValueChange={(value) =>
                        setFilters((prev) => ({ ...prev, priceRange: value as [number, number] }))
                      }
                      max={100000}
                      step={100}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>${filters.priceRange[0]}</span>
                      <span>${filters.priceRange[1]}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Market Cap (M)</label>
                    <Slider
                      value={filters.marketCapRange}
                      onValueChange={(value) =>
                        setFilters((prev) => ({ ...prev, marketCapRange: value as [number, number] }))
                      }
                      max={1000000}
                      step={1000}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>${filters.marketCapRange[0]}M</span>
                      <span>${filters.marketCapRange[1]}M</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">24h Change (%)</label>
                    <Slider
                      value={filters.changeRange}
                      onValueChange={(value) =>
                        setFilters((prev) => ({ ...prev, changeRange: value as [number, number] }))
                      }
                      min={-50}
                      max={50}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{filters.changeRange[0]}%</span>
                      <span>{filters.changeRange[1]}%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">RSI Range</label>
                    <Slider
                      value={filters.rsiRange}
                      onValueChange={(value) =>
                        setFilters((prev) => ({ ...prev, rsiRange: value as [number, number] }))
                      }
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{filters.rsiRange[0]}</span>
                      <span>{filters.rsiRange[1]}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rank Range</label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={filters.minRank}
                        onChange={(e) =>
                          setFilters((prev) => ({ ...prev, minRank: Number.parseInt(e.target.value) || 1 }))
                        }
                        className="w-20"
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={filters.maxRank}
                        onChange={(e) =>
                          setFilters((prev) => ({ ...prev, maxRank: Number.parseInt(e.target.value) || 500 }))
                        }
                        className="w-20"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sectors</label>
                    <div className="grid grid-cols-2 gap-2">
                      {sectors.map((sector) => (
                        <div key={sector} className="flex items-center space-x-2">
                          <Checkbox
                            id={sector}
                            checked={filters.sectors.includes(sector)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFilters((prev) => ({ ...prev, sectors: [...prev.sectors, sector] }))
                              } else {
                                setFilters((prev) => ({ ...prev, sectors: prev.sectors.filter((s) => s !== sector) }))
                              }
                            }}
                          />
                          <label htmlFor={sector} className="text-xs">
                            {sector}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {filteredAssets.length} of {assets.length} cryptocurrencies
            </div>
            <div className="flex gap-2">
              {filters.sectors.map((sector) => (
                <Badge key={sector} variant="secondary">
                  {sector}
                </Badge>
              ))}
            </div>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Asset</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>24h Change</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead>Market Cap</TableHead>
                  <TableHead>RSI</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead>Rank</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.map((asset) => (
                  <TableRow key={asset.symbol}>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => toggleWatchlist(asset.symbol)}>
                        <Star className={`h-4 w-4 ${asset.isWatchlisted ? "fill-yellow-400 text-yellow-400" : ""}`} />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold">{asset.symbol}</span>
                        </div>
                        <div>
                          <div className="font-medium">{asset.symbol}</div>
                          <div className="text-xs text-muted-foreground">{asset.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">${asset.price.toLocaleString()}</TableCell>
                    <TableCell>
                      <div
                        className={`flex items-center gap-1 ${asset.change24h >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {asset.change24h >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        <span>
                          {asset.change24h >= 0 ? "+" : ""}
                          {asset.change24h.toFixed(2)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">${(asset.volume24h / 1000000).toFixed(1)}M</TableCell>
                    <TableCell className="font-mono">${(asset.marketCap / 1000000000).toFixed(2)}B</TableCell>
                    <TableCell>
                      <Badge variant={asset.rsi > 70 ? "destructive" : asset.rsi < 30 ? "default" : "secondary"}>
                        {asset.rsi}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{asset.sector}</Badge>
                    </TableCell>
                    <TableCell>#{asset.rank}</TableCell>
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
