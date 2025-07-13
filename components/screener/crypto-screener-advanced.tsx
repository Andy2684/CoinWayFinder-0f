"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Filter, Download, Star, TrendingUp, TrendingDown, ArrowUpDown, RefreshCw } from "lucide-react"

interface CryptoAsset {
  id: string
  symbol: string
  name: string
  price: number
  change24h: number
  change7d: number
  marketCap: number
  volume24h: number
  rank: number
  sector: string
  exchange: string
  rsi: number
  macd: number
  volatility: number
  beta: number
  isWatchlisted: boolean
}

const mockCryptoData: CryptoAsset[] = [
  {
    id: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    price: 43250.0,
    change24h: 2.45,
    change7d: -1.23,
    marketCap: 847000000000,
    volume24h: 15200000000,
    rank: 1,
    sector: "Layer 1",
    exchange: "Binance",
    rsi: 65.4,
    macd: 0.12,
    volatility: 3.2,
    beta: 1.1,
    isWatchlisted: true,
  },
  {
    id: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    price: 2650.0,
    change24h: 3.21,
    change7d: 5.67,
    marketCap: 318000000000,
    volume24h: 8900000000,
    rank: 2,
    sector: "Layer 1",
    exchange: "Coinbase",
    rsi: 58.7,
    macd: 0.08,
    volatility: 4.1,
    beta: 1.3,
    isWatchlisted: false,
  },
  {
    id: "solana",
    symbol: "SOL",
    name: "Solana",
    price: 98.45,
    change24h: 8.92,
    change7d: 12.34,
    marketCap: 42000000000,
    volume24h: 1200000000,
    rank: 5,
    sector: "Layer 1",
    exchange: "Binance",
    rsi: 72.1,
    macd: 0.15,
    volatility: 6.8,
    beta: 1.8,
    isWatchlisted: true,
  },
  {
    id: "chainlink",
    symbol: "LINK",
    name: "Chainlink",
    price: 14.67,
    change24h: -2.34,
    change7d: 3.45,
    marketCap: 8200000000,
    volume24h: 450000000,
    rank: 15,
    sector: "Oracle",
    exchange: "Kraken",
    rsi: 45.2,
    macd: -0.05,
    volatility: 5.4,
    beta: 1.4,
    isWatchlisted: false,
  },
  {
    id: "uniswap",
    symbol: "UNI",
    name: "Uniswap",
    price: 6.78,
    change24h: 4.56,
    change7d: -2.11,
    marketCap: 4100000000,
    volume24h: 180000000,
    rank: 22,
    sector: "DeFi",
    exchange: "Uniswap",
    rsi: 61.8,
    macd: 0.03,
    volatility: 7.2,
    beta: 1.6,
    isWatchlisted: false,
  },
]

const sectors = ["All", "Layer 1", "Layer 2", "DeFi", "Oracle", "Gaming", "NFT", "Meme"]
const exchanges = ["All", "Binance", "Coinbase", "Kraken", "Uniswap", "OKX"]

const presetFilters = {
  topGainers: { name: "Top Gainers", change24h: [5, 100] },
  topLosers: { name: "Top Losers", change24h: [-100, -5] },
  highVolume: { name: "High Volume", volume24h: [1000000000, Number.POSITIVE_INFINITY] },
  oversold: { name: "Oversold (RSI < 30)", rsi: [0, 30] },
  overbought: { name: "Overbought (RSI > 70)", rsi: [70, 100] },
  largeCap: { name: "Large Cap (>$10B)", marketCap: [10000000000, Number.POSITIVE_INFINITY] },
}

export function CryptoScreenerAdvanced() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSector, setSelectedSector] = useState("All")
  const [selectedExchange, setSelectedExchange] = useState("All")
  const [priceRange, setPriceRange] = useState([0, 50000])
  const [marketCapRange, setMarketCapRange] = useState([0, 1000000000000])
  const [change24hRange, setChange24hRange] = useState([-50, 50])
  const [volumeRange, setVolumeRange] = useState([0, 20000000000])
  const [rsiRange, setRsiRange] = useState([0, 100])
  const [volatilityRange, setVolatilityRange] = useState([0, 20])
  const [sortBy, setSortBy] = useState("marketCap")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [showWatchlistOnly, setShowWatchlistOnly] = useState(false)
  const [selectedColumns, setSelectedColumns] = useState([
    "symbol",
    "name",
    "price",
    "change24h",
    "marketCap",
    "volume24h",
    "rsi",
  ])
  const [cryptoData, setCryptoData] = useState(mockCryptoData)

  const filteredData = useMemo(() => {
    return cryptoData
      .filter((asset) => {
        const matchesSearch =
          asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesSector = selectedSector === "All" || asset.sector === selectedSector
        const matchesExchange = selectedExchange === "All" || asset.exchange === selectedExchange
        const matchesPrice = asset.price >= priceRange[0] && asset.price <= priceRange[1]
        const matchesMarketCap = asset.marketCap >= marketCapRange[0] && asset.marketCap <= marketCapRange[1]
        const matchesChange24h = asset.change24h >= change24hRange[0] && asset.change24h <= change24hRange[1]
        const matchesVolume = asset.volume24h >= volumeRange[0] && asset.volume24h <= volumeRange[1]
        const matchesRsi = asset.rsi >= rsiRange[0] && asset.rsi <= rsiRange[1]
        const matchesVolatility = asset.volatility >= volatilityRange[0] && asset.volatility <= volatilityRange[1]
        const matchesWatchlist = !showWatchlistOnly || asset.isWatchlisted

        return (
          matchesSearch &&
          matchesSector &&
          matchesExchange &&
          matchesPrice &&
          matchesMarketCap &&
          matchesChange24h &&
          matchesVolume &&
          matchesRsi &&
          matchesVolatility &&
          matchesWatchlist
        )
      })
      .sort((a, b) => {
        const aValue = a[sortBy as keyof CryptoAsset] as number
        const bValue = b[sortBy as keyof CryptoAsset] as number
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue
      })
  }, [
    cryptoData,
    searchTerm,
    selectedSector,
    selectedExchange,
    priceRange,
    marketCapRange,
    change24hRange,
    volumeRange,
    rsiRange,
    volatilityRange,
    sortBy,
    sortOrder,
    showWatchlistOnly,
  ])

  const applyPresetFilter = (preset: keyof typeof presetFilters) => {
    const filter = presetFilters[preset]
    if (filter.change24h) setChange24hRange(filter.change24h)
    if (filter.volume24h)
      setVolumeRange([
        filter.volume24h[0],
        filter.volume24h[1] === Number.POSITIVE_INFINITY ? 20000000000 : filter.volume24h[1],
      ])
    if (filter.rsi) setRsiRange(filter.rsi)
    if (filter.marketCap)
      setMarketCapRange([
        filter.marketCap[0],
        filter.marketCap[1] === Number.POSITIVE_INFINITY ? 1000000000000 : filter.marketCap[1],
      ])
  }

  const resetFilters = () => {
    setSearchTerm("")
    setSelectedSector("All")
    setSelectedExchange("All")
    setPriceRange([0, 50000])
    setMarketCapRange([0, 1000000000000])
    setChange24hRange([-50, 50])
    setVolumeRange([0, 20000000000])
    setRsiRange([0, 100])
    setVolatilityRange([0, 20])
    setShowWatchlistOnly(false)
  }

  const toggleWatchlist = (assetId: string) => {
    setCryptoData((prev) =>
      prev.map((asset) => (asset.id === assetId ? { ...asset, isWatchlisted: !asset.isWatchlisted } : asset)),
    )
  }

  const exportToCSV = () => {
    const headers = selectedColumns.join(",")
    const rows = filteredData
      .map((asset) => selectedColumns.map((col) => asset[col as keyof CryptoAsset]).join(","))
      .join("\n")

    const csv = `${headers}\n${rows}`
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "crypto-screener-results.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const formatNumber = (num: number, type: "currency" | "percentage" | "number" = "number") => {
    if (type === "currency") {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num)
    }
    if (type === "percentage") {
      return `${num.toFixed(2)}%`
    }
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`
    return num.toFixed(2)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Crypto Screener</h1>
          <p className="text-gray-400">Advanced filtering and analysis tools</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={resetFilters} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Filters
          </Button>
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Preset Filters */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Quick Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(presetFilters).map(([key, filter]) => (
              <Button
                key={key}
                variant="outline"
                size="sm"
                onClick={() => applyPresetFilter(key as keyof typeof presetFilters)}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                {filter.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Advanced Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800">
              <TabsTrigger value="basic" className="text-gray-300">
                Basic
              </TabsTrigger>
              <TabsTrigger value="technical" className="text-gray-300">
                Technical
              </TabsTrigger>
              <TabsTrigger value="fundamental" className="text-gray-300">
                Fundamental
              </TabsTrigger>
              <TabsTrigger value="display" className="text-gray-300">
                Display
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search assets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Sector</Label>
                  <Select value={selectedSector} onValueChange={setSelectedSector}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {sectors.map((sector) => (
                        <SelectItem key={sector} value={sector} className="text-white">
                          {sector}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Exchange</Label>
                  <Select value={selectedExchange} onValueChange={setSelectedExchange}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {exchanges.map((exchange) => (
                        <SelectItem key={exchange} value={exchange} className="text-white">
                          {exchange}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Price Range ($)</Label>
                  <Slider value={priceRange} onValueChange={setPriceRange} max={50000} step={100} className="w-full" />
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">24h Change (%)</Label>
                  <Slider
                    value={change24hRange}
                    onValueChange={setChange24hRange}
                    min={-50}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>{change24hRange[0]}%</span>
                    <span>{change24hRange[1]}%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Volume Range</Label>
                  <Slider
                    value={volumeRange}
                    onValueChange={setVolumeRange}
                    max={20000000000}
                    step={100000000}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>{formatNumber(volumeRange[0])}</span>
                    <span>{formatNumber(volumeRange[1])}</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="technical" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">RSI Range</Label>
                  <Slider value={rsiRange} onValueChange={setRsiRange} max={100} step={1} className="w-full" />
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>{rsiRange[0]}</span>
                    <span>{rsiRange[1]}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Volatility Range (%)</Label>
                  <Slider
                    value={volatilityRange}
                    onValueChange={setVolatilityRange}
                    max={20}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>{volatilityRange[0]}%</span>
                    <span>{volatilityRange[1]}%</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="fundamental" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Market Cap Range</Label>
                  <Slider
                    value={marketCapRange}
                    onValueChange={setMarketCapRange}
                    max={1000000000000}
                    step={1000000000}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>{formatNumber(marketCapRange[0])}</span>
                    <span>{formatNumber(marketCapRange[1])}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="watchlist-only" checked={showWatchlistOnly} onCheckedChange={setShowWatchlistOnly} />
                  <Label htmlFor="watchlist-only" className="text-gray-300">
                    Show watchlist only
                  </Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="display" className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Visible Columns</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {[
                    "symbol",
                    "name",
                    "price",
                    "change24h",
                    "change7d",
                    "marketCap",
                    "volume24h",
                    "rank",
                    "sector",
                    "exchange",
                    "rsi",
                    "macd",
                    "volatility",
                    "beta",
                  ].map((column) => (
                    <div key={column} className="flex items-center space-x-2">
                      <Checkbox
                        id={column}
                        checked={selectedColumns.includes(column)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedColumns([...selectedColumns, column])
                          } else {
                            setSelectedColumns(selectedColumns.filter((col) => col !== column))
                          }
                        }}
                      />
                      <Label htmlFor={column} className="text-gray-300 capitalize">
                        {column.replace(/([A-Z])/g, " $1").trim()}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Results */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Screener Results</CardTitle>
              <CardDescription>Showing {filteredData.length} assets matching your criteria</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="marketCap" className="text-white">
                    Market Cap
                  </SelectItem>
                  <SelectItem value="price" className="text-white">
                    Price
                  </SelectItem>
                  <SelectItem value="change24h" className="text-white">
                    24h Change
                  </SelectItem>
                  <SelectItem value="volume24h" className="text-white">
                    Volume
                  </SelectItem>
                  <SelectItem value="rsi" className="text-white">
                    RSI
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="border-gray-700 text-gray-300"
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800">
                  <TableHead className="text-gray-300">Watch</TableHead>
                  {selectedColumns.includes("symbol") && <TableHead className="text-gray-300">Symbol</TableHead>}
                  {selectedColumns.includes("name") && <TableHead className="text-gray-300">Name</TableHead>}
                  {selectedColumns.includes("price") && <TableHead className="text-gray-300">Price</TableHead>}
                  {selectedColumns.includes("change24h") && <TableHead className="text-gray-300">24h Change</TableHead>}
                  {selectedColumns.includes("change7d") && <TableHead className="text-gray-300">7d Change</TableHead>}
                  {selectedColumns.includes("marketCap") && <TableHead className="text-gray-300">Market Cap</TableHead>}
                  {selectedColumns.includes("volume24h") && <TableHead className="text-gray-300">Volume 24h</TableHead>}
                  {selectedColumns.includes("rank") && <TableHead className="text-gray-300">Rank</TableHead>}
                  {selectedColumns.includes("sector") && <TableHead className="text-gray-300">Sector</TableHead>}
                  {selectedColumns.includes("exchange") && <TableHead className="text-gray-300">Exchange</TableHead>}
                  {selectedColumns.includes("rsi") && <TableHead className="text-gray-300">RSI</TableHead>}
                  {selectedColumns.includes("macd") && <TableHead className="text-gray-300">MACD</TableHead>}
                  {selectedColumns.includes("volatility") && (
                    <TableHead className="text-gray-300">Volatility</TableHead>
                  )}
                  {selectedColumns.includes("beta") && <TableHead className="text-gray-300">Beta</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((asset) => (
                  <TableRow key={asset.id} className="border-gray-800 hover:bg-gray-800/50">
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => toggleWatchlist(asset.id)} className="p-1">
                        <Star
                          className={`h-4 w-4 ${asset.isWatchlisted ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`}
                        />
                      </Button>
                    </TableCell>
                    {selectedColumns.includes("symbol") && (
                      <TableCell className="font-medium text-white">{asset.symbol}</TableCell>
                    )}
                    {selectedColumns.includes("name") && <TableCell className="text-gray-300">{asset.name}</TableCell>}
                    {selectedColumns.includes("price") && (
                      <TableCell className="text-white">{formatNumber(asset.price, "currency")}</TableCell>
                    )}
                    {selectedColumns.includes("change24h") && (
                      <TableCell>
                        <div
                          className={`flex items-center ${asset.change24h >= 0 ? "text-green-400" : "text-red-400"}`}
                        >
                          {asset.change24h >= 0 ? (
                            <TrendingUp className="h-4 w-4 mr-1" />
                          ) : (
                            <TrendingDown className="h-4 w-4 mr-1" />
                          )}
                          {formatNumber(asset.change24h, "percentage")}
                        </div>
                      </TableCell>
                    )}
                    {selectedColumns.includes("change7d") && (
                      <TableCell>
                        <div className={`flex items-center ${asset.change7d >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {asset.change7d >= 0 ? (
                            <TrendingUp className="h-4 w-4 mr-1" />
                          ) : (
                            <TrendingDown className="h-4 w-4 mr-1" />
                          )}
                          {formatNumber(asset.change7d, "percentage")}
                        </div>
                      </TableCell>
                    )}
                    {selectedColumns.includes("marketCap") && (
                      <TableCell className="text-gray-300">{formatNumber(asset.marketCap, "currency")}</TableCell>
                    )}
                    {selectedColumns.includes("volume24h") && (
                      <TableCell className="text-gray-300">{formatNumber(asset.volume24h, "currency")}</TableCell>
                    )}
                    {selectedColumns.includes("rank") && <TableCell className="text-gray-300">#{asset.rank}</TableCell>}
                    {selectedColumns.includes("sector") && (
                      <TableCell>
                        <Badge variant="outline" className="border-gray-600 text-gray-300">
                          {asset.sector}
                        </Badge>
                      </TableCell>
                    )}
                    {selectedColumns.includes("exchange") && (
                      <TableCell className="text-gray-300">{asset.exchange}</TableCell>
                    )}
                    {selectedColumns.includes("rsi") && (
                      <TableCell>
                        <div
                          className={`${asset.rsi > 70 ? "text-red-400" : asset.rsi < 30 ? "text-green-400" : "text-gray-300"}`}
                        >
                          {asset.rsi.toFixed(1)}
                        </div>
                      </TableCell>
                    )}
                    {selectedColumns.includes("macd") && (
                      <TableCell>
                        <div className={`${asset.macd > 0 ? "text-green-400" : "text-red-400"}`}>
                          {asset.macd.toFixed(3)}
                        </div>
                      </TableCell>
                    )}
                    {selectedColumns.includes("volatility") && (
                      <TableCell className="text-gray-300">{asset.volatility.toFixed(1)}%</TableCell>
                    )}
                    {selectedColumns.includes("beta") && (
                      <TableCell className="text-gray-300">{asset.beta.toFixed(1)}</TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
