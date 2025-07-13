"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Bot,
  Target,
  AlertCircle,
  Shield,
  Wifi,
  WifiOff,
  RefreshCw,
  Globe,
  Zap,
} from "lucide-react"
import { ProtectedRoute } from "@/components/auth/protected-route"

interface RealTimePrice {
  symbol: string
  price: number
  change24h: number
  volume24h: number
  high24h: number
  low24h: number
  lastUpdate: number
}

interface PortfolioData {
  timestamp: string
  value: number
  btc: number
  eth: number
  alt: number
}

interface PnLData {
  date: string
  pnl: number
  cumulative: number
}

interface AssetAllocation {
  name: string
  value: number
  color: string
  amount: number
  percentage: number
}

interface DashboardStats {
  totalPnL: number
  todayPnL: number
  activeBots: number
  totalTrades: number
  winRate: number
  portfolioValue: number
  dailyVolume: number
  activeSignals: number
}

export default function DashboardPage() {
  const [realTimePrices, setRealTimePrices] = useState<Record<string, RealTimePrice>>({})
  const [portfolioHistory, setPortfolioHistory] = useState<PortfolioData[]>([])
  const [pnlHistory, setPnlHistory] = useState<PnLData[]>([])
  const [assetAllocation, setAssetAllocation] = useState<AssetAllocation[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting")
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [wsConnections, setWsConnections] = useState<WebSocket[]>([])

  // Fetch initial data from CoinGecko API
  const fetchInitialData = useCallback(async () => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,binancecoin,solana,cardano,polygon,chainlink,avalanche-2&order=market_cap_desc&per_page=10&page=1&sparkline=true&price_change_percentage=24h",
      )

      if (!response.ok) throw new Error("Failed to fetch data")

      const data = await response.json()

      const pricesData: Record<string, RealTimePrice> = {}

      data.forEach((coin: any) => {
        const symbol = `${coin.symbol.toUpperCase()}/USDT`
        pricesData[symbol] = {
          symbol,
          price: coin.current_price,
          change24h: coin.price_change_percentage_24h || 0,
          volume24h: coin.total_volume || 0,
          high24h: coin.high_24h || coin.current_price,
          low24h: coin.low_24h || coin.current_price,
          lastUpdate: Date.now(),
        }
      })

      setRealTimePrices(pricesData)

      // Generate portfolio history based on real price data
      const now = new Date()
      const portfolioData: PortfolioData[] = []

      for (let i = 29; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        const btcPrice = pricesData["BTC/USDT"]?.price || 43000
        const ethPrice = pricesData["ETH/USDT"]?.price || 2500

        // Simulate historical price variations
        const btcVariation = 1 + (Math.sin(i * 0.1) * 0.05 + Math.random() * 0.02 - 0.01)
        const ethVariation = 1 + (Math.sin(i * 0.15) * 0.06 + Math.random() * 0.03 - 0.015)

        const btcValue = btcPrice * btcVariation * 0.15 // 0.15 BTC
        const ethValue = ethPrice * ethVariation * 1.8 // 1.8 ETH
        const altValue = 3000 + Math.random() * 500 - 250 // Other assets

        portfolioData.push({
          timestamp: date.toISOString().split("T")[0],
          value: btcValue + ethValue + altValue,
          btc: btcValue,
          eth: ethValue,
          alt: altValue,
        })
      }

      setPortfolioHistory(portfolioData)

      // Generate P&L data
      const pnlData: PnLData[] = []
      let cumulativePnl = 0

      for (let i = 0; i < 14; i++) {
        const date = new Date(now.getTime() - (13 - i) * 24 * 60 * 60 * 1000)
        const dailyPnl = (Math.random() - 0.5) * 400 // Random P&L between -200 and +200
        cumulativePnl += dailyPnl

        pnlData.push({
          date: date.toISOString().split("T")[0],
          pnl: dailyPnl,
          cumulative: cumulativePnl,
        })
      }

      setPnlHistory(pnlData)

      // Calculate portfolio value from real prices
      const btcPrice = pricesData["BTC/USDT"]?.price || 43000
      const ethPrice = pricesData["ETH/USDT"]?.price || 2500
      const portfolioValue = btcPrice * 0.15 + ethPrice * 1.8 + 3000

      // Set asset allocation based on real prices
      const allocation: AssetAllocation[] = [
        {
          name: "Bitcoin",
          value: btcPrice * 0.15,
          color: "#F7931A",
          amount: btcPrice * 0.15,
          percentage: 45.2,
        },
        {
          name: "Ethereum",
          value: ethPrice * 1.8,
          color: "#627EEA",
          amount: ethPrice * 1.8,
          percentage: 28.7,
        },
        {
          name: "Binance Coin",
          value: (pricesData["BNB/USDT"]?.price || 300) * 6,
          color: "#F3BA2F",
          amount: (pricesData["BNB/USDT"]?.price || 300) * 6,
          percentage: 12.1,
        },
        {
          name: "Solana",
          value: (pricesData["SOL/USDT"]?.price || 100) * 13,
          color: "#9945FF",
          amount: (pricesData["SOL/USDT"]?.price || 100) * 13,
          percentage: 8.5,
        },
        {
          name: "USDT",
          value: 850,
          color: "#26A17B",
          amount: 850,
          percentage: 5.5,
        },
      ]

      setAssetAllocation(allocation)

      // Set dashboard stats
      setStats({
        totalPnL: cumulativePnl,
        todayPnL: pnlData[pnlData.length - 1]?.pnl || 0,
        activeBots: 12,
        totalTrades: 342,
        winRate: 73.8,
        portfolioValue,
        dailyVolume: Object.values(pricesData).reduce((sum, price) => sum + price.volume24h, 0),
        activeSignals: 8,
      })

      setLoading(false)
      setConnectionStatus("connected")
    } catch (error) {
      console.error("Error fetching initial data:", error)
      setConnectionStatus("disconnected")
      setLoading(false)
    }
  }, [])

  // Setup WebSocket connections for real-time updates
  const setupWebSocketConnections = useCallback(() => {
    const symbols = ["btcusdt", "ethusdt", "bnbusdt", "solusdt", "adausdt"]
    const connections: WebSocket[] = []

    symbols.forEach((symbol) => {
      try {
        const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@ticker`)

        ws.onopen = () => {
          console.log(`Connected to ${symbol} stream`)
          setConnectionStatus("connected")
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            const symbolFormatted = `${data.s.slice(0, -4)}/${data.s.slice(-4)}`

            setRealTimePrices((prev) => ({
              ...prev,
              [symbolFormatted]: {
                symbol: symbolFormatted,
                price: Number.parseFloat(data.c),
                change24h: Number.parseFloat(data.P),
                volume24h: Number.parseFloat(data.v),
                high24h: Number.parseFloat(data.h),
                low24h: Number.parseFloat(data.l),
                lastUpdate: Date.now(),
              },
            }))

            setLastUpdate(new Date())
          } catch (error) {
            console.error("Error parsing WebSocket data:", error)
          }
        }

        ws.onclose = () => {
          console.log(`Disconnected from ${symbol} stream`)
          setConnectionStatus("disconnected")
        }

        ws.onerror = (error) => {
          console.error(`WebSocket error for ${symbol}:`, error)
          setConnectionStatus("disconnected")
        }

        connections.push(ws)
      } catch (error) {
        console.error(`Failed to connect to ${symbol}:`, error)
      }
    })

    setWsConnections(connections)

    return () => {
      connections.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close()
        }
      })
    }
  }, [])

  // Update portfolio and stats based on real-time prices
  useEffect(() => {
    if (Object.keys(realTimePrices).length > 0) {
      const btcPrice = realTimePrices["BTC/USDT"]?.price || 43000
      const ethPrice = realTimePrices["ETH/USDT"]?.price || 2500
      const bnbPrice = realTimePrices["BNB/USDT"]?.price || 300
      const solPrice = realTimePrices["SOL/USDT"]?.price || 100

      const newPortfolioValue = btcPrice * 0.15 + ethPrice * 1.8 + bnbPrice * 6 + solPrice * 13 + 850

      // Update asset allocation with real prices
      const newAllocation: AssetAllocation[] = [
        {
          name: "Bitcoin",
          value: btcPrice * 0.15,
          color: "#F7931A",
          amount: btcPrice * 0.15,
          percentage: ((btcPrice * 0.15) / newPortfolioValue) * 100,
        },
        {
          name: "Ethereum",
          value: ethPrice * 1.8,
          color: "#627EEA",
          amount: ethPrice * 1.8,
          percentage: ((ethPrice * 1.8) / newPortfolioValue) * 100,
        },
        {
          name: "Binance Coin",
          value: bnbPrice * 6,
          color: "#F3BA2F",
          amount: bnbPrice * 6,
          percentage: ((bnbPrice * 6) / newPortfolioValue) * 100,
        },
        {
          name: "Solana",
          value: solPrice * 13,
          color: "#9945FF",
          amount: solPrice * 13,
          percentage: ((solPrice * 13) / newPortfolioValue) * 100,
        },
        {
          name: "USDT",
          value: 850,
          color: "#26A17B",
          amount: 850,
          percentage: (850 / newPortfolioValue) * 100,
        },
      ]

      setAssetAllocation(newAllocation)

      // Update stats with new portfolio value
      setStats((prev) =>
        prev
          ? {
              ...prev,
              portfolioValue: newPortfolioValue,
              dailyVolume: Object.values(realTimePrices).reduce((sum, price) => sum + price.volume24h, 0),
            }
          : null,
      )
    }
  }, [realTimePrices])

  // Initialize data and connections
  useEffect(() => {
    fetchInitialData()
    const cleanup = setupWebSocketConnections()

    return cleanup
  }, [fetchInitialData, setupWebSocketConnections])

  // Cleanup WebSocket connections on unmount
  useEffect(() => {
    return () => {
      wsConnections.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close()
        }
      })
    }
  }, [wsConnections])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatLargeNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`
    return formatCurrency(num)
  }

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? "+" : ""
    return `${sign}${value.toFixed(2)}%`
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-white">Live Trading Dashboard</h1>
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 animate-spin text-white" />
                <span className="text-sm text-gray-400">Connecting to live data...</span>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="bg-gray-800/50 border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="h-4 bg-gray-600 rounded w-20 animate-pulse" />
                    <div className="h-4 w-4 bg-gray-600 rounded animate-pulse" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-gray-600 rounded w-24 animate-pulse mb-2" />
                    <div className="h-3 bg-gray-600 rounded w-16 animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Live Trading Dashboard</h1>
              <div className="flex items-center space-x-2 mt-2">
                <Badge
                  variant="outline"
                  className={
                    connectionStatus === "connected" ? "text-green-400 border-green-400" : "text-red-400 border-red-400"
                  }
                >
                  {connectionStatus === "connected" ? (
                    <Wifi className="h-3 w-3 mr-1" />
                  ) : (
                    <WifiOff className="h-3 w-3 mr-1" />
                  )}
                  {connectionStatus === "connected" ? "Live Data" : "Disconnected"}
                </Badge>
                <span className="text-sm text-gray-400">Last updated: {lastUpdate.toLocaleTimeString()}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchInitialData}
                className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Real-time Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-0 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
                <DollarSign className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats?.portfolioValue || 0)}</div>
                <p className="text-xs opacity-80 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Real-time value
                </p>
              </CardContent>
            </Card>

            <Card
              className={`bg-gradient-to-r ${(stats?.totalPnL || 0) >= 0 ? "from-green-600 to-green-700" : "from-red-600 to-red-700"} border-0 text-white`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
                {(stats?.totalPnL || 0) >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats?.totalPnL || 0)}</div>
                <p className="text-xs opacity-80">Today: {formatCurrency(stats?.todayPnL || 0)}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-600 to-purple-700 border-0 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Bots</CardTitle>
                <Bot className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.activeBots || 0}</div>
                <p className="text-xs opacity-80">{stats?.totalTrades || 0} total trades</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-600 to-orange-700 border-0 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                <Target className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.winRate?.toFixed(1) || 0}%</div>
                <Progress value={stats?.winRate || 0} className="mt-2 bg-orange-800" />
              </CardContent>
            </Card>
          </div>

          {/* Live Market Data */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Globe className="h-5 w-5 mr-2 text-[#30D5C8]" />
                Live Market Data
                <Badge variant="outline" className="ml-2 text-green-400 border-green-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                  LIVE
                </Badge>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Real-time cryptocurrency prices from Binance WebSocket
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Object.values(realTimePrices)
                  .slice(0, 6)
                  .map((market) => (
                    <div
                      key={market.symbol}
                      className="p-4 border border-gray-700 rounded-lg bg-gradient-to-r from-gray-800/50 to-gray-700/50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-lg text-white">{market.symbol}</h4>
                        <Badge variant={market.change24h >= 0 ? "default" : "destructive"}>
                          {formatPercentage(market.change24h)}
                        </Badge>
                      </div>
                      <div className="text-3xl font-bold mb-2 text-white">{formatCurrency(market.price)}</div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
                        <div>24h High: {formatCurrency(market.high24h)}</div>
                        <div>24h Low: {formatCurrency(market.low24h)}</div>
                        <div>Volume: {formatLargeNumber(market.volume24h)}</div>
                        <div className="text-xs">Updated: {new Date(market.lastUpdate).toLocaleTimeString()}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Charts Section */}
          <Tabs defaultValue="portfolio" className="space-y-4">
            <TabsList className="bg-gray-800 border-gray-700">
              <TabsTrigger value="portfolio" className="data-[state=active]:bg-gray-700 text-white">
                Portfolio Performance
              </TabsTrigger>
              <TabsTrigger value="pnl" className="data-[state=active]:bg-gray-700 text-white">
                P&L Analysis
              </TabsTrigger>
              <TabsTrigger value="allocation" className="data-[state=active]:bg-gray-700 text-white">
                Asset Allocation
              </TabsTrigger>
              <TabsTrigger value="market" className="data-[state=active]:bg-gray-700 text-white">
                Market Overview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="portfolio" className="space-y-4">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Portfolio Performance (30 Days)</CardTitle>
                  <CardDescription className="text-gray-400">
                    Your portfolio value based on real-time prices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={portfolioHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="timestamp" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                      <Tooltip
                        formatter={(value) => [formatCurrency(Number(value)), "Portfolio Value"]}
                        contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: "8px" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#30D5C8"
                        fill="#30D5C8"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pnl" className="space-y-4">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">P&L History (14 Days)</CardTitle>
                  <CardDescription className="text-gray-400">Daily profit and loss tracking</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={pnlHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" tickFormatter={(value) => `$${value.toFixed(0)}`} />
                      <Tooltip
                        formatter={(value) => [formatCurrency(Number(value)), ""]}
                        contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: "8px" }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="pnl" stroke="#10b981" name="Daily P&L" strokeWidth={2} />
                      <Line
                        type="monotone"
                        dataKey="cumulative"
                        stroke="#f59e0b"
                        name="Cumulative P&L"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="allocation" className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Live Asset Allocation</CardTitle>
                    <CardDescription className="text-gray-400">
                      Your portfolio distribution updated in real-time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={assetAllocation}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                        >
                          {assetAllocation.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [formatCurrency(Number(value)), "Value"]}
                          contentStyle={{
                            backgroundColor: "#1F2937",
                            border: "1px solid #374151",
                            borderRadius: "8px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Portfolio Holdings</CardTitle>
                    <CardDescription className="text-gray-400">
                      Live asset values based on current market prices
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {assetAllocation.map((asset, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border border-gray-700 rounded-lg bg-gray-800/30"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: asset.color }}></div>
                            <div>
                              <div className="font-medium text-white">{asset.name}</div>
                              <div className="text-sm text-gray-400">{asset.percentage.toFixed(1)}% of portfolio</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-white">{formatCurrency(asset.amount)}</div>
                            <div className="text-xs text-green-400">Live Price</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="market" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Object.values(realTimePrices).map((data) => (
                  <Card key={data.symbol} className="bg-gray-800/50 border-gray-700">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-white">{data.symbol}</CardTitle>
                        <Badge variant={connectionStatus === "connected" ? "default" : "secondary"} className="text-xs">
                          {connectionStatus === "connected" ? "Live" : "Cached"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-2xl font-bold text-white">{formatCurrency(data.price)}</div>
                        <div
                          className={`flex items-center gap-2 ${data.change24h >= 0 ? "text-green-400" : "text-red-400"}`}
                        >
                          {data.change24h >= 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          <span className="font-medium">{formatPercentage(data.change24h)}</span>
                        </div>
                        <div className="text-sm text-gray-400">Volume: {formatLargeNumber(data.volume24h)}</div>
                        <div className="text-xs text-gray-500">
                          Updated: {new Date(data.lastUpdate).toLocaleTimeString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Additional Stats */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Daily Volume</CardTitle>
                <Activity className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{formatLargeNumber(stats?.dailyVolume || 0)}</div>
                <Progress value={75} className="mt-2 bg-gray-700" />
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Active Signals</CardTitle>
                <Zap className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats?.activeSignals || 0}</div>
                <p className="text-xs text-gray-400">Trading opportunities</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Market Status</CardTitle>
                <AlertCircle className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${connectionStatus === "connected" ? "text-green-400" : "text-red-400"}`}
                >
                  {connectionStatus === "connected" ? "Online" : "Offline"}
                </div>
                <p className="text-xs text-gray-400">
                  {connectionStatus === "connected" ? "All systems operational" : "Connection issues"}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Risk Level</CardTitle>
                <Shield className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-400">Medium</div>
                <Progress value={45} className="mt-2 bg-gray-700" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
