"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp, TrendingDown, DollarSign, Activity, RefreshCw, ArrowUpDown } from "lucide-react"

interface MarketData {
  symbol: string
  name: string
  price: number
  change24h: number
  volume24h: number
  marketCap: number
  dominance: number
  rank: number
}

interface MarketMetrics {
  totalMarketCap: number
  totalVolume: number
  btcDominance: number
  ethDominance: number
  altcoinIndex: number
  fearGreedIndex: number
}

interface CorrelationData {
  asset1: string
  asset2: string
  correlation: number
}

export function MarketAnalysis() {
  const [marketData, setMarketData] = useState<MarketData[]>([])
  const [metrics, setMetrics] = useState<MarketMetrics>({
    totalMarketCap: 0,
    totalVolume: 0,
    btcDominance: 0,
    ethDominance: 0,
    altcoinIndex: 0,
    fearGreedIndex: 0,
  })
  const [correlations, setCorrelations] = useState<CorrelationData[]>([])
  const [selectedMetric, setSelectedMetric] = useState("marketCap")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchMarketData()
  }, [])

  const fetchMarketData = async () => {
    setLoading(true)
    try {
      // Mock data for demonstration
      const mockMarketData: MarketData[] = [
        {
          symbol: "BTC",
          name: "Bitcoin",
          price: 42000,
          change24h: 2.5,
          volume24h: 15000000000,
          marketCap: 820000000000,
          dominance: 52.3,
          rank: 1,
        },
        {
          symbol: "ETH",
          name: "Ethereum",
          price: 2500,
          change24h: -1.2,
          volume24h: 8000000000,
          marketCap: 300000000000,
          dominance: 19.1,
          rank: 2,
        },
        {
          symbol: "BNB",
          name: "BNB",
          price: 320,
          change24h: 3.8,
          volume24h: 1200000000,
          marketCap: 50000000000,
          dominance: 3.2,
          rank: 3,
        },
        {
          symbol: "ADA",
          name: "Cardano",
          price: 0.5,
          change24h: -2.1,
          volume24h: 800000000,
          marketCap: 17000000000,
          dominance: 1.1,
          rank: 4,
        },
        {
          symbol: "SOL",
          name: "Solana",
          price: 100,
          change24h: 5.2,
          volume24h: 1500000000,
          marketCap: 45000000000,
          dominance: 2.9,
          rank: 5,
        },
      ]

      const mockMetrics: MarketMetrics = {
        totalMarketCap: 1570000000000,
        totalVolume: 45000000000,
        btcDominance: 52.3,
        ethDominance: 19.1,
        altcoinIndex: 1250,
        fearGreedIndex: 68,
      }

      const mockCorrelations: CorrelationData[] = [
        { asset1: "BTC", asset2: "ETH", correlation: 0.85 },
        { asset1: "BTC", asset2: "ADA", correlation: 0.72 },
        { asset1: "BTC", asset2: "SOL", correlation: 0.68 },
        { asset1: "ETH", asset2: "ADA", correlation: 0.79 },
        { asset1: "ETH", asset2: "SOL", correlation: 0.74 },
        { asset1: "ADA", asset2: "SOL", correlation: 0.81 },
      ]

      setMarketData(mockMarketData)
      setMetrics(mockMetrics)
      setCorrelations(mockCorrelations)
    } catch (error) {
      console.error("Error fetching market data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getMetricData = () => {
    return marketData.map((item) => ({
      name: item.symbol,
      value:
        selectedMetric === "marketCap"
          ? item.marketCap / 1000000000
          : selectedMetric === "volume"
            ? item.volume24h / 1000000000
            : item.change24h,
    }))
  }

  const getCorrelationColor = (correlation: number) => {
    if (correlation > 0.8) return "bg-red-100 text-red-800"
    if (correlation > 0.6) return "bg-yellow-100 text-yellow-800"
    return "bg-green-100 text-green-800"
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Market Analysis
            <Button variant="outline" size="sm" onClick={fetchMarketData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </CardTitle>
          <CardDescription>Comprehensive cryptocurrency market analysis and metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Total Market Cap</span>
                </div>
                <div className="text-2xl font-bold">${(metrics.totalMarketCap / 1000000000000).toFixed(2)}T</div>
                <div className="text-sm text-muted-foreground">Global crypto market</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">24h Volume</span>
                </div>
                <div className="text-2xl font-bold">${(metrics.totalVolume / 1000000000).toFixed(1)}B</div>
                <div className="text-sm text-muted-foreground">Trading volume</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">BTC Dominance</span>
                </div>
                <div className="text-2xl font-bold">{metrics.btcDominance}%</div>
                <div className="text-sm text-muted-foreground">Market share</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowUpDown className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Fear & Greed</span>
                </div>
                <div className="text-2xl font-bold">{metrics.fearGreedIndex}</div>
                <div className="text-sm text-muted-foreground">Market sentiment</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Market Overview</TabsTrigger>
          <TabsTrigger value="dominance">Dominance</TabsTrigger>
          <TabsTrigger value="correlation">Correlation</TabsTrigger>
          <TabsTrigger value="sectors">Sectors</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Top Cryptocurrencies
                <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="marketCap">Market Cap</SelectItem>
                    <SelectItem value="volume">Volume</SelectItem>
                    <SelectItem value="change">24h Change</SelectItem>
                  </SelectContent>
                </Select>
              </CardTitle>
              <CardDescription>Market data for top cryptocurrencies by market capitalization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getMetricData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => [
                        selectedMetric === "change" ? `${value.toFixed(2)}%` : `${value.toFixed(2)}B`,
                        selectedMetric === "marketCap"
                          ? "Market Cap"
                          : selectedMetric === "volume"
                            ? "Volume"
                            : "24h Change",
                      ]}
                    />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>

                <div className="space-y-3">
                  {marketData.map((crypto, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold">{crypto.symbol}</span>
                        </div>
                        <div>
                          <div className="font-medium">{crypto.name}</div>
                          <div className="text-sm text-muted-foreground">#{crypto.rank}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">${crypto.price.toLocaleString()}</div>
                        <div className={`text-sm ${crypto.change24h >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {crypto.change24h >= 0 ? "+" : ""}
                          {crypto.change24h}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dominance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Market Dominance</CardTitle>
              <CardDescription>Market share distribution among top cryptocurrencies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  {marketData.map((crypto, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{crypto.name}</span>
                        <span className="text-sm">{crypto.dominance}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${crypto.dominance}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{metrics.btcDominance}%</div>
                        <div className="text-sm text-muted-foreground">Bitcoin Dominance</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{metrics.ethDominance}%</div>
                        <div className="text-sm text-muted-foreground">Ethereum Dominance</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {(100 - metrics.btcDominance - metrics.ethDominance).toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Altcoin Dominance</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="correlation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asset Correlation Matrix</CardTitle>
              <CardDescription>Correlation coefficients between major cryptocurrencies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {correlations.map((corr, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">
                          {corr.asset1} vs {corr.asset2}
                        </span>
                        <Badge className={getCorrelationColor(corr.correlation)}>{corr.correlation.toFixed(2)}</Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${corr.correlation * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {corr.correlation > 0.8
                          ? "High correlation"
                          : corr.correlation > 0.6
                            ? "Moderate correlation"
                            : "Low correlation"}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sectors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sector Performance</CardTitle>
              <CardDescription>Performance analysis by cryptocurrency sectors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[
                  { name: "DeFi", change: 5.2, volume: "2.1B", projects: 45 },
                  { name: "Layer 1", change: 2.8, volume: "8.5B", projects: 12 },
                  { name: "Layer 2", change: 8.1, volume: "1.2B", projects: 8 },
                  { name: "NFT", change: -3.4, volume: "450M", projects: 23 },
                  { name: "Gaming", change: 12.5, volume: "320M", projects: 67 },
                  { name: "Metaverse", change: -1.2, volume: "180M", projects: 34 },
                ].map((sector, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{sector.name}</span>
                        <div
                          className={`flex items-center gap-1 ${sector.change >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {sector.change >= 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          <span className="text-sm font-bold">
                            {sector.change >= 0 ? "+" : ""}
                            {sector.change}%
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Volume:</span>
                          <span>${sector.volume}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Projects:</span>
                          <span>{sector.projects}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
