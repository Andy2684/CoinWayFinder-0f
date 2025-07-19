"use client"

import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  TrendingDown,
  Bot,
  DollarSign,
  Activity,
  Eye,
  EyeOff,
  Plus,
  Settings,
  BarChart3,
  Zap,
  Globe,
  AlertTriangle,
} from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { RealtimeMarketTicker } from "@/components/dashboard/realtime-market-ticker"
import { RealtimeOrderBook } from "@/components/dashboard/realtime-order-book"
import { RealtimeTradeFeed } from "@/components/dashboard/realtime-trade-feed"
import { LiveMarketData } from "@/components/dashboard/live-market-data"

export default function DashboardPage() {
  const { user } = useAuth()
  const [hideBalance, setHideBalance] = useState(false)
  const [portfolioStats, setPortfolioStats] = useState({
    totalValue: 45250.67,
    todayChange: 1234.56,
    todayChangePercent: 2.82,
    activeBots: 5,
    totalTrades: 247,
    winRate: 72.5,
    availableBalance: 12450.0,
    totalPnL: 8750.32,
    openPositions: 8,
  })

  const [marketSummary, setMarketSummary] = useState({
    btcPrice: 67234.56,
    btcChange: 2.3,
    ethPrice: 3456.78,
    ethChange: -1.2,
    totalMarketCap: "2.1T",
    fearGreedIndex: 72,
    dominance: 54.2,
  })

  const [recentTrades, setRecentTrades] = useState([
    {
      id: 1,
      symbol: "BTC/USDT",
      side: "BUY",
      amount: 0.025,
      price: 67150.0,
      profit: 125.5,
      time: "2 min ago",
      status: "completed",
    },
    {
      id: 2,
      symbol: "ETH/USDT",
      side: "SELL",
      amount: 2.5,
      price: 3445.25,
      profit: -45.2,
      time: "5 min ago",
      status: "completed",
    },
    {
      id: 3,
      symbol: "ADA/USDT",
      side: "BUY",
      amount: 1000,
      price: 0.485,
      profit: 23.75,
      time: "8 min ago",
      status: "completed",
    },
    {
      id: 4,
      symbol: "DOT/USDT",
      side: "SELL",
      amount: 50,
      price: 7.22,
      profit: 67.8,
      time: "12 min ago",
      status: "completed",
    },
  ])

  const [activePositions, setActivePositions] = useState([
    {
      symbol: "BTC/USDT",
      side: "LONG",
      size: 0.1,
      entryPrice: 66800,
      currentPrice: 67234,
      pnl: 43.4,
      pnlPercent: 0.65,
    },
    { symbol: "ETH/USDT", side: "SHORT", size: 5, entryPrice: 3480, currentPrice: 3456, pnl: 120.0, pnlPercent: 3.45 },
    {
      symbol: "BNB/USDT",
      side: "LONG",
      size: 20,
      entryPrice: 315.5,
      currentPrice: 318.75,
      pnl: 65.0,
      pnlPercent: 1.03,
    },
  ])

  // Simulate real-time portfolio updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPortfolioStats((prev) => ({
        ...prev,
        totalValue: prev.totalValue + (Math.random() - 0.5) * 200,
        todayChange: prev.todayChange + (Math.random() - 0.5) * 50,
        todayChangePercent: prev.todayChangePercent + (Math.random() - 0.5) * 0.2,
      }))

      setMarketSummary((prev) => ({
        ...prev,
        btcPrice: prev.btcPrice + (Math.random() - 0.5) * 100,
        btcChange: prev.btcChange + (Math.random() - 0.5) * 0.5,
        ethPrice: prev.ethPrice + (Math.random() - 0.5) * 20,
        ethChange: prev.ethChange + (Math.random() - 0.5) * 0.3,
      }))

      // Update active positions
      setActivePositions((prev) =>
        prev.map((position) => {
          const priceChange = (Math.random() - 0.5) * 10
          const newCurrentPrice = position.currentPrice + priceChange
          const pnl = (newCurrentPrice - position.entryPrice) * position.size * (position.side === "LONG" ? 1 : -1)
          const pnlPercent = (pnl / (position.entryPrice * position.size)) * 100

          return {
            ...position,
            currentPrice: newCurrentPrice,
            pnl,
            pnlPercent,
          }
        }),
      )
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? "+" : ""}${percent.toFixed(2)}%`
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Trading Dashboard 📊</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back, {user?.firstName || "Trader"}! Monitor your trades and manage your portfolio in real-time.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="border-green-500 text-green-600">
            <Zap className="w-3 h-3 mr-1" />
            Live Data
          </Badge>
          <Button asChild>
            <Link href="/dashboard/bots/create">
              <Plus className="w-4 h-4 mr-2" />
              New Bot
            </Link>
          </Button>
        </div>
      </div>

      {/* Portfolio Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setHideBalance(!hideBalance)} className="h-8 w-8 p-0">
              {hideBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hideBalance ? "••••••" : formatCurrency(portfolioStats.totalValue)}
            </div>
            <div
              className={`text-xs flex items-center ${portfolioStats.todayChangePercent >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              {hideBalance ? "••••" : formatPercent(portfolioStats.todayChangePercent)} today
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's P&L</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${portfolioStats.todayChange >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {hideBalance ? "••••••" : formatCurrency(portfolioStats.todayChange)}
            </div>
            <div className="text-xs text-muted-foreground">From {portfolioStats.totalTrades} trades</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Positions</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolioStats.openPositions}</div>
            <div className="text-xs text-muted-foreground">{portfolioStats.activeBots} bots running</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{portfolioStats.winRate}%</div>
            <div className="text-xs text-muted-foreground">Last 30 days</div>
          </CardContent>
        </Card>
      </div>

      {/* Market Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">📈 Global Market Overview</h3>
            <Badge className="bg-green-500/10 text-green-600 border-green-500">
              <Globe className="w-3 h-3 mr-1" />
              Live Market Data
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Bitcoin</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                ${marketSummary.btcPrice.toLocaleString()}
              </p>
              <div className="flex items-center justify-center space-x-1">
                {marketSummary.btcChange > 0 ? (
                  <TrendingUp className="w-3 h-3 text-green-500" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-500" />
                )}
                <span className={marketSummary.btcChange > 0 ? "text-green-500" : "text-red-500"}>
                  {formatPercent(marketSummary.btcChange)}
                </span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Ethereum</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                ${marketSummary.ethPrice.toLocaleString()}
              </p>
              <div className="flex items-center justify-center space-x-1">
                {marketSummary.ethChange > 0 ? (
                  <TrendingUp className="w-3 h-3 text-green-500" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-500" />
                )}
                <span className={marketSummary.ethChange > 0 ? "text-green-500" : "text-red-500"}>
                  {formatPercent(marketSummary.ethChange)}
                </span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Market Cap</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">${marketSummary.totalMarketCap}</p>
              <span className="text-green-500 text-sm">+1.8%</span>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">BTC Dominance</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{marketSummary.dominance}%</p>
              <span className="text-blue-500 text-sm">+0.3%</span>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Fear & Greed</p>
              <p className="text-lg font-bold text-yellow-500">{marketSummary.fearGreedIndex}</p>
              <span className="text-yellow-500 text-sm">Greed</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Trading Interface */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Real-time Market Data */}
        <div className="lg:col-span-1">
          <RealtimeMarketTicker />
        </div>

        {/* Order Book */}
        <div className="lg:col-span-1">
          <RealtimeOrderBook />
        </div>

        {/* Trade Feed */}
        <div className="lg:col-span-1">
          <RealtimeTradeFeed />
        </div>
      </div>

      {/* Trading Tabs */}
      <Tabs defaultValue="positions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="positions">Active Positions</TabsTrigger>
          <TabsTrigger value="trades">Recent Trades</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="positions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Active Positions</span>
                <Badge variant="secondary">{activePositions.length} open</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activePositions.map((position, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="font-medium">{position.symbol}</div>
                      <Badge variant={position.side === "LONG" ? "default" : "secondary"}>{position.side}</Badge>
                      <div className="text-sm text-muted-foreground">Size: {position.size}</div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${position.pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {formatCurrency(position.pnl)}
                      </div>
                      <div className={`text-sm ${position.pnlPercent >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {formatPercent(position.pnlPercent)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Trades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTrades.map((trade) => (
                  <div key={trade.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant={trade.side === "BUY" ? "default" : "secondary"}>{trade.side}</Badge>
                      <div className="font-medium">{trade.symbol}</div>
                      <div className="text-sm text-muted-foreground">
                        {trade.amount} @ ${trade.price.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${trade.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {formatCurrency(trade.profit)}
                      </div>
                      <div className="text-xs text-muted-foreground">{trade.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total P&L</span>
                  <span className="font-bold text-green-600">{formatCurrency(portfolioStats.totalPnL)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Win Rate</span>
                  <span className="font-bold">{portfolioStats.winRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Trades</span>
                  <span className="font-bold">{portfolioStats.totalTrades}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Available Balance</span>
                  <span className="font-bold">{formatCurrency(portfolioStats.availableBalance)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Risk Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Risk Level</span>
                  <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Moderate
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max Drawdown</span>
                  <span className="font-bold text-red-600">-2.4%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Position Size</span>
                  <span className="font-bold">15% avg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stop Loss</span>
                  <span className="font-bold">-5% avg</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Live Market Data Component */}
      <LiveMarketData />

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button asChild className="h-16 flex-col">
              <Link href="/dashboard/bots/create">
                <Plus className="w-5 h-5 mb-1" />
                Create Bot
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-16 flex-col bg-transparent">
              <Link href="/dashboard/portfolio">
                <BarChart3 className="w-5 h-5 mb-1" />
                Portfolio
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-16 flex-col bg-transparent">
              <Link href="/signals">
                <TrendingUp className="w-5 h-5 mb-1" />
                Trading Signals
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-16 flex-col bg-transparent">
              <Link href="/dashboard/settings">
                <Settings className="w-5 h-5 mb-1" />
                Settings
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
