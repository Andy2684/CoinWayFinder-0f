"use client"

import { useAuth } from "@/components/auth/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  TrendingDown,
  Bot,
  Activity,
  Plus,
  Settings,
  BarChart3,
  Zap,
  DollarSign,
  Target,
} from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const [stats, setStats] = useState({
    totalBalance: 12450.67,
    todayPnL: 234.56,
    todayPnLPercent: 1.92,
    activeBots: 3,
    totalTrades: 127,
    winRate: 68.5,
    activeSignals: 12,
  })

  const [portfolioData, setPortfolioData] = useState([
    { symbol: "BTC", amount: 0.5432, value: 23456.78, change: 2.34 },
    { symbol: "ETH", amount: 12.8765, value: 18765.43, change: -1.23 },
    { symbol: "ADA", amount: 5000, value: 2345.67, change: 4.56 },
    { symbol: "SOL", amount: 45.67, value: 3456.78, change: 0.89 },
  ])

  const [recentTrades, setRecentTrades] = useState([
    { id: 1, symbol: "BTC/USDT", type: "BUY", amount: 0.1234, price: 43250.67, time: "2 min ago", profit: 45.67 },
    { id: 2, symbol: "ETH/USDT", type: "SELL", amount: 2.5678, price: 2456.78, time: "5 min ago", profit: -12.34 },
    { id: 3, symbol: "ADA/USDT", type: "BUY", amount: 1000, price: 0.4567, time: "8 min ago", profit: 23.45 },
    { id: 4, symbol: "SOL/USDT", type: "SELL", amount: 10.234, price: 78.9, time: "12 min ago", profit: 67.89 },
  ])

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        totalBalance: prev.totalBalance + (Math.random() - 0.5) * 100,
        todayPnL: prev.todayPnL + (Math.random() - 0.5) * 50,
        todayPnLPercent: prev.todayPnLPercent + (Math.random() - 0.5) * 0.5,
        totalTrades: prev.totalTrades + Math.floor(Math.random() * 2),
        winRate: Math.max(50, Math.min(85, prev.winRate + (Math.random() - 0.5) * 2)),
        activeSignals: Math.max(8, Math.min(20, prev.activeSignals + Math.floor((Math.random() - 0.5) * 3))),
      }))

      // Update portfolio values
      setPortfolioData((prev) =>
        prev.map((item) => ({
          ...item,
          change: item.change + (Math.random() - 0.5) * 2,
          value: item.value * (1 + (Math.random() - 0.5) * 0.02),
        })),
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Please log in to access the dashboard.</p>
            <Button asChild className="w-full">
              <Link href="/auth/login">Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Welcome back, {user.firstName || user.name || "Trader"}! 👋
            </h1>
            <p className="text-slate-600 mt-1">Here's what's happening with your trading portfolio today.</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button asChild>
              <Link href="/bots">
                <Plus className="w-4 h-4 mr-2" />
                Create Bot
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/settings">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </Button>
          </div>
        </div>

        {/* Portfolio Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalBalance.toLocaleString()}</div>
              <div
                className={`text-xs flex items-center ${stats.todayPnLPercent >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {stats.todayPnLPercent >= 0 ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}
                {stats.todayPnLPercent >= 0 ? "+" : ""}
                {stats.todayPnL.toFixed(2)} ({stats.todayPnLPercent.toFixed(2)}%)
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Bots</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeBots}</div>
              <div className="text-xs text-muted-foreground">2 profitable, 1 learning</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.winRate.toFixed(1)}%</div>
              <Progress value={stats.winRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Signals</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSignals}</div>
              <div className="text-xs text-muted-foreground">3 new today</div>
            </CardContent>
          </Card>
        </div>

        {/* Portfolio Holdings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Portfolio Holdings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {portfolioData.map((asset) => (
                <div key={asset.symbol} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {asset.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-semibold">{asset.symbol}</div>
                      <div className="text-sm text-muted-foreground">
                        {asset.amount.toLocaleString()} {asset.symbol}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${asset.value.toLocaleString()}</div>
                    <div
                      className={`text-sm flex items-center ${asset.change >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {asset.change >= 0 ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {asset.change >= 0 ? "+" : ""}
                      {asset.change.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Trades */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Recent Trades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTrades.map((trade) => (
                <div key={trade.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant={trade.type === "BUY" ? "default" : "secondary"}>{trade.type}</Badge>
                    <div>
                      <div className="font-medium">{trade.symbol}</div>
                      <div className="text-sm text-muted-foreground">{trade.time}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {trade.amount} @ ${trade.price.toLocaleString()}
                    </div>
                    <div className={`text-sm ${trade.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {trade.profit >= 0 ? "+" : ""}${trade.profit.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button asChild className="h-20 flex-col">
                <Link href="/bots">
                  <Plus className="w-6 h-6 mb-2" />
                  Create New Bot
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-20 flex-col bg-transparent">
                <Link href="/signals">
                  <Zap className="w-6 h-6 mb-2" />
                  View Signals
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-20 flex-col bg-transparent">
                <Link href="/portfolio">
                  <BarChart3 className="w-6 h-6 mb-2" />
                  Portfolio Analytics
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-20 flex-col bg-transparent">
                <Link href="/integrations">
                  <Settings className="w-6 h-6 mb-2" />
                  Integrations
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
