"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Bot,
  Signal,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Play,
  Pause,
  Settings,
  BarChart3,
  Target,
  Zap,
  Globe,
  CheckCircle,
  Plus,
} from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [stats, setStats] = useState({
    totalBalance: 45678.32,
    totalPnL: 3456.78,
    pnlPercent: 8.2,
    activeBots: 12,
    totalTrades: 1847,
    winRate: 73.4,
    connectedExchanges: 5,
    activeSignals: 24,
    todayPnL: 567.89,
    todayPnLPercent: 1.3,
  })

  const [portfolioHoldings, setPortfolioHoldings] = useState([
    {
      symbol: "BTC",
      name: "Bitcoin",
      amount: 1.2345,
      value: 52340.67,
      change: 2.4,
      allocation: 45.2,
      avgPrice: 42000,
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      amount: 15.8765,
      value: 38765.43,
      change: -1.2,
      allocation: 33.5,
      avgPrice: 2400,
    },
    {
      symbol: "ADA",
      name: "Cardano",
      amount: 25000,
      value: 12345.67,
      change: 5.8,
      allocation: 10.7,
      avgPrice: 0.48,
    },
    {
      symbol: "SOL",
      name: "Solana",
      amount: 145.67,
      value: 8456.78,
      change: 3.2,
      allocation: 7.3,
      avgPrice: 55,
    },
    {
      symbol: "DOT",
      name: "Polkadot",
      amount: 890.45,
      value: 4234.56,
      change: -0.8,
      allocation: 3.3,
      avgPrice: 4.5,
    },
  ])

  const [recentTrades, setRecentTrades] = useState([
    {
      id: 1,
      type: "BUY",
      symbol: "BTC/USDT",
      amount: 0.1234,
      price: 67234.5,
      total: 8291.45,
      time: "2 minutes ago",
      pnl: 123.45,
      exchange: "Binance",
      status: "Filled",
    },
    {
      id: 2,
      type: "SELL",
      symbol: "ETH/USDT",
      amount: 2.5,
      price: 3456.78,
      total: 8641.95,
      time: "5 minutes ago",
      pnl: -45.67,
      exchange: "Bybit",
      status: "Filled",
    },
    {
      id: 3,
      type: "BUY",
      symbol: "ADA/USDT",
      amount: 1000,
      price: 0.4567,
      total: 456.7,
      time: "12 minutes ago",
      pnl: 78.9,
      exchange: "KuCoin",
      status: "Filled",
    },
    {
      id: 4,
      type: "SELL",
      symbol: "SOL/USDT",
      amount: 10.234,
      price: 156.78,
      total: 1604.49,
      time: "18 minutes ago",
      pnl: 234.56,
      exchange: "OKX",
      status: "Partial",
    },
    {
      id: 5,
      type: "BUY",
      symbol: "DOT/USDT",
      amount: 100,
      price: 5.67,
      total: 567.0,
      time: "25 minutes ago",
      pnl: -12.34,
      exchange: "Coinbase",
      status: "Filled",
    },
  ])

  const [activeBots, setActiveBots] = useState([
    {
      id: 1,
      name: "BTC DCA Master",
      strategy: "DCA",
      status: "active",
      profit: 2456.78,
      profitPercent: 12.4,
      winRate: 78.2,
      trades: 156,
      allocation: 8500,
      lastTrade: "2 hours ago",
      exchange: "Binance",
    },
    {
      id: 2,
      name: "ETH Grid Trader",
      strategy: "Grid",
      status: "active",
      profit: 1834.56,
      profitPercent: 15.7,
      winRate: 71.4,
      trades: 234,
      allocation: 6200,
      lastTrade: "15 minutes ago",
      exchange: "Bybit",
    },
    {
      id: 3,
      name: "Multi-Coin Scalper",
      strategy: "Scalping",
      status: "active",
      profit: 967.43,
      profitPercent: 8.9,
      winRate: 68.9,
      trades: 445,
      allocation: 4500,
      lastTrade: "5 minutes ago",
      exchange: "KuCoin",
    },
    {
      id: 4,
      name: "AI Trend Follower",
      strategy: "AI",
      status: "paused",
      profit: -145.67,
      profitPercent: -2.1,
      winRate: 65.2,
      trades: 89,
      allocation: 3000,
      lastTrade: "1 day ago",
      exchange: "OKX",
    },
  ])

  const [marketData, setMarketData] = useState({
    btcPrice: 67234.56,
    btcChange: 2.3,
    ethPrice: 3456.78,
    ethChange: -1.2,
    totalMarketCap: "2.1T",
    fearGreedIndex: 72,
    dominance: 52.4,
  })

  const [activeSignals, setActiveSignals] = useState([
    {
      id: 1,
      symbol: "BTC/USDT",
      type: "BUY",
      confidence: 85,
      targetPrice: 68500,
      currentPrice: 67234,
      timeframe: "4H",
      source: "AI Analysis",
    },
    {
      id: 2,
      symbol: "ETH/USDT",
      type: "SELL",
      confidence: 72,
      targetPrice: 3200,
      currentPrice: 3456,
      timeframe: "1H",
      source: "Technical",
    },
    {
      id: 3,
      symbol: "ADA/USDT",
      type: "BUY",
      confidence: 78,
      targetPrice: 0.52,
      currentPrice: 0.4567,
      timeframe: "1D",
      source: "Fundamental",
    },
  ])

  // Real-time updates simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())

      // Update stats with small random changes
      setStats((prev) => ({
        ...prev,
        totalBalance: prev.totalBalance + (Math.random() - 0.5) * 100,
        todayPnL: prev.todayPnL + (Math.random() - 0.5) * 50,
        todayPnLPercent: prev.todayPnLPercent + (Math.random() - 0.5) * 0.1,
        totalTrades: prev.totalTrades + Math.floor(Math.random() * 2),
        winRate: Math.max(65, Math.min(80, prev.winRate + (Math.random() - 0.5) * 0.5)),
      }))

      // Update market data
      setMarketData((prev) => ({
        ...prev,
        btcPrice: prev.btcPrice + (Math.random() - 0.5) * 500,
        btcChange: prev.btcChange + (Math.random() - 0.5) * 0.5,
        ethPrice: prev.ethPrice + (Math.random() - 0.5) * 100,
        ethChange: prev.ethChange + (Math.random() - 0.5) * 0.5,
      }))

      // Update portfolio holdings
      setPortfolioHoldings((prev) =>
        prev.map((holding) => ({
          ...holding,
          change: holding.change + (Math.random() - 0.5) * 1,
          value: holding.value * (1 + (Math.random() - 0.5) * 0.01),
        })),
      )
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Card className="w-full max-w-md bg-black/40 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4">Please log in to access the dashboard.</p>
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
              <Link href="/auth/login">Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Welcome back, {user.firstName || user.name || "Trader"}! 👋
            </h1>
            <p className="text-gray-400 mt-1">
              {currentTime.toLocaleDateString()} • {currentTime.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
              <CheckCircle className="w-3 h-3 mr-1" />
              System Operational
            </Badge>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/bots">
                <Plus className="w-4 h-4 mr-2" />
                Create Bot
              </Link>
            </Button>
            <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-black/40 backdrop-blur-xl border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Portfolio Value</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${stats.totalBalance.toLocaleString()}</div>
              <div className="flex items-center text-xs mt-1">
                <TrendingUp className="w-3 h-3 mr-1 text-green-400" />
                <span className="text-green-400">
                  +${stats.totalPnL.toFixed(2)} ({stats.pnlPercent}%)
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Today's P&L</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">+${stats.todayPnL.toFixed(2)}</div>
              <div className="flex items-center text-xs mt-1">
                <ArrowUpRight className="w-3 h-3 mr-1 text-green-400" />
                <span className="text-green-400">+{stats.todayPnLPercent.toFixed(2)}% today</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Active Bots</CardTitle>
              <Bot className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.activeBots}</div>
              <div className="flex items-center text-xs mt-1">
                <Target className="w-3 h-3 mr-1 text-blue-400" />
                <span className="text-blue-400">{stats.winRate.toFixed(1)}% win rate</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Active Signals</CardTitle>
              <Zap className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.activeSignals}</div>
              <div className="flex items-center text-xs mt-1">
                <Signal className="w-3 h-3 mr-1 text-purple-400" />
                <span className="text-purple-400">Real-time signals</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Market Summary */}
        <Card className="bg-black/40 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Globe className="w-5 h-5 mr-2 text-blue-400" />
              Market Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div className="text-center">
                <p className="text-xs text-gray-400 mb-1">BTC/USD</p>
                <p className="text-lg font-bold text-white">${marketData.btcPrice.toLocaleString()}</p>
                <div className="flex items-center justify-center space-x-1">
                  {marketData.btcChange > 0 ? (
                    <TrendingUp className="w-3 h-3 text-green-400" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-400" />
                  )}
                  <span className={marketData.btcChange > 0 ? "text-green-400" : "text-red-400"}>
                    {marketData.btcChange > 0 ? "+" : ""}
                    {marketData.btcChange.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-400 mb-1">ETH/USD</p>
                <p className="text-lg font-bold text-white">${marketData.ethPrice.toLocaleString()}</p>
                <div className="flex items-center justify-center space-x-1">
                  {marketData.ethChange > 0 ? (
                    <TrendingUp className="w-3 h-3 text-green-400" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-400" />
                  )}
                  <span className={marketData.ethChange > 0 ? "text-green-400" : "text-red-400"}>
                    {marketData.ethChange > 0 ? "+" : ""}
                    {marketData.ethChange.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-400 mb-1">Market Cap</p>
                <p className="text-lg font-bold text-white">${marketData.totalMarketCap}</p>
                <span className="text-green-400 text-sm">+1.8%</span>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-400 mb-1">Fear & Greed</p>
                <p className="text-lg font-bold text-yellow-400">{marketData.fearGreedIndex}</p>
                <span className="text-yellow-400 text-sm">Greed</span>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-400 mb-1">BTC Dominance</p>
                <p className="text-lg font-bold text-white">{marketData.dominance}%</p>
                <span className="text-blue-400 text-sm">Stable</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Portfolio Holdings */}
          <div className="lg:col-span-2">
            <Card className="bg-black/40 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Wallet className="w-5 h-5 mr-2 text-green-400" />
                  Portfolio Holdings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {portfolioHoldings.map((holding) => (
                    <div
                      key={holding.symbol}
                      className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-400 to-yellow-400 flex items-center justify-center text-white font-bold">
                          {holding.symbol.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{holding.symbol}</p>
                          <p className="text-sm text-gray-400">{holding.name}</p>
                          <p className="text-xs text-gray-500">
                            {holding.amount.toLocaleString()} {holding.symbol}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-white">${holding.value.toLocaleString()}</p>
                        <p
                          className={`text-sm flex items-center justify-end ${holding.change >= 0 ? "text-green-400" : "text-red-400"}`}
                        >
                          {holding.change >= 0 ? (
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3 mr-1" />
                          )}
                          {Math.abs(holding.change).toFixed(2)}%
                        </p>
                        <p className="text-xs text-gray-500">{holding.allocation}% allocation</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Bots */}
          <div>
            <Card className="bg-black/40 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Bot className="w-5 h-5 mr-2 text-blue-400" />
                  Active Bots
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeBots.map((bot) => (
                    <div key={bot.id} className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-white text-sm">{bot.name}</p>
                        <Badge variant={bot.status === "active" ? "default" : "secondary"} className="text-xs">
                          {bot.status === "active" ? (
                            <>
                              <Play className="w-3 h-3 mr-1" /> Active
                            </>
                          ) : (
                            <>
                              <Pause className="w-3 h-3 mr-1" /> Paused
                            </>
                          )}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Strategy:</span>
                          <span className="text-white">{bot.strategy}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Profit:</span>
                          <span className={bot.profit >= 0 ? "text-green-400" : "text-red-400"}>
                            {bot.profit >= 0 ? "+" : ""}${bot.profit.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Win Rate:</span>
                          <span className="text-white">{bot.winRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Trades:</span>
                          <span className="text-white">{bot.trades}</span>
                        </div>
                      </div>
                      <Progress value={bot.winRate} className="mt-2 h-1" />
                      <p className="text-xs text-gray-500 mt-1">Last trade: {bot.lastTrade}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Trades */}
        <Card className="bg-black/40 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Activity className="w-5 h-5 mr-2 text-purple-400" />
              Recent Trades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="space-y-3">
                {recentTrades.map((trade) => (
                  <div
                    key={trade.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <Badge variant={trade.type === "BUY" ? "default" : "destructive"} className="text-xs">
                        {trade.type}
                      </Badge>
                      <div>
                        <p className="font-medium text-white text-sm">{trade.symbol}</p>
                        <p className="text-xs text-gray-400">{trade.exchange}</p>
                      </div>
                      <div className="text-xs text-gray-400">
                        <p>
                          {trade.amount} @ ${trade.price.toLocaleString()}
                        </p>
                        <p>Total: ${trade.total.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={trade.status === "Filled" ? "default" : "secondary"} className="text-xs mb-1">
                        {trade.status}
                      </Badge>
                      <p className={`font-medium text-sm ${trade.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400">{trade.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Signals */}
        <Card className="bg-black/40 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-400" />
              Active Trading Signals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeSignals.map((signal) => (
                <div key={signal.id} className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-white">{signal.symbol}</p>
                    <Badge variant={signal.type === "BUY" ? "default" : "destructive"} className="text-xs">
                      {signal.type}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Confidence:</span>
                      <span className="text-green-400">{signal.confidence}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Target:</span>
                      <span className="text-white">${signal.targetPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Current:</span>
                      <span className="text-white">${signal.currentPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Timeframe:</span>
                      <span className="text-white">{signal.timeframe}</span>
                    </div>
                  </div>
                  <Progress value={signal.confidence} className="mt-2 h-1" />
                  <p className="text-xs text-gray-500 mt-1">Source: {signal.source}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button asChild className="h-16 bg-blue-600 hover:bg-blue-700 text-white">
            <Link href="/bots">
              <Bot className="w-5 h-5 mr-2" />
              Create New Bot
            </Link>
          </Button>
          <Button asChild className="h-16 bg-purple-600 hover:bg-purple-700 text-white">
            <Link href="/signals">
              <Zap className="w-5 h-5 mr-2" />
              View All Signals
            </Link>
          </Button>
          <Button asChild className="h-16 bg-green-600 hover:bg-green-700 text-white">
            <Link href="/portfolio">
              <BarChart3 className="w-5 h-5 mr-2" />
              Portfolio Analytics
            </Link>
          </Button>
          <Button asChild className="h-16 bg-orange-600 hover:bg-orange-700 text-white">
            <Link href="/integrations">
              <Settings className="w-5 h-5 mr-2" />
              Exchange Settings
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
