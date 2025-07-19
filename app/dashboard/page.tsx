"use client"

import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LiveMarketData } from "@/components/dashboard/live-market-data"
import { RealtimeMarketTicker } from "@/components/dashboard/realtime-market-ticker"
import { RealtimeOrderBook } from "@/components/dashboard/realtime-order-book"
import { RealtimeTradeFeed } from "@/components/dashboard/realtime-trade-feed"
import { TrendingUp, Bot, DollarSign, Activity, Eye, EyeOff, Plus, Settings, BarChart3 } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function DashboardPage() {
  const { user } = useAuth()
  const [hideBalance, setHideBalance] = useState(false)
  const [portfolioStats, setPortfolioStats] = useState({
    totalValue: 12450.67,
    todayChange: 234.56,
    todayChangePercent: 1.92,
    activeBots: 3,
    totalTrades: 127,
    winRate: 68.5,
  })

  // Simulate real-time portfolio updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPortfolioStats((prev) => ({
        ...prev,
        totalValue: prev.totalValue + (Math.random() - 0.5) * 100,
        todayChange: prev.todayChange + (Math.random() - 0.5) * 20,
        todayChangePercent: prev.todayChangePercent + (Math.random() - 0.5) * 0.5,
      }))
    }, 30000) // Update every 30 seconds

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.firstName || "Trader"}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Here's what's happening with your trading portfolio today.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/dashboard/bots/create">
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setHideBalance(!hideBalance)} className="h-8 w-8 p-0">
              {hideBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hideBalance ? "••••••" : formatCurrency(portfolioStats.totalValue)}
            </div>
            <div
              className={`text-xs flex items-center ${
                portfolioStats.todayChangePercent >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              {hideBalance ? "••••" : formatPercent(portfolioStats.todayChangePercent)} today
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bots</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolioStats.activeBots}</div>
            <div className="text-xs text-muted-foreground">2 profitable, 1 learning</div>
          </CardContent>
        </Card>

        <Card>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolioStats.winRate}%</div>
            <div className="text-xs text-muted-foreground">Last 30 days</div>
          </CardContent>
        </Card>
      </div>

      {/* Live Market Data */}
      <LiveMarketData />

      {/* Real-time Trading Components */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <RealtimeMarketTicker />
        <RealtimeOrderBook />
        <RealtimeTradeFeed />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button asChild className="h-20 flex-col">
              <Link href="/dashboard/bots/create">
                <Plus className="w-6 h-6 mb-2" />
                Create New Bot
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-20 flex-col bg-transparent">
              <Link href="/dashboard/bots">
                <Bot className="w-6 h-6 mb-2" />
                Manage Bots
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-20 flex-col bg-transparent">
              <Link href="/dashboard/portfolio">
                <BarChart3 className="w-6 h-6 mb-2" />
                View Portfolio
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-20 flex-col bg-transparent">
              <Link href="/dashboard/settings">
                <Settings className="w-6 h-6 mb-2" />
                Settings
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
