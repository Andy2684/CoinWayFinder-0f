"use client"

import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LiveMarketTicker } from "@/components/dashboard/live-market-ticker"
import { PortfolioOverview } from "@/components/dashboard/portfolio-overview"
import { RealtimeOrderBook } from "@/components/dashboard/realtime-order-book"
import { RealtimeTradeFeed } from "@/components/dashboard/realtime-trade-feed"
import { TrendingUp, Bot, Activity, Plus, Settings, BarChart3, Zap } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    activeBots: 3,
    totalTrades: 127,
    winRate: 68.5,
    activeSignals: 12,
  })

  // Simulate real-time stats updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        totalTrades: prev.totalTrades + Math.floor(Math.random() * 3),
        winRate: Math.max(50, Math.min(85, prev.winRate + (Math.random() - 0.5) * 2)),
        activeSignals: Math.max(8, Math.min(20, prev.activeSignals + Math.floor((Math.random() - 0.5) * 3))),
      }))
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.firstName || "Trader"}! 👋</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your trading portfolio today.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/dashboard/bots">
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

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTrades}</div>
            <div className="text-xs text-muted-foreground">+12 from yesterday</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.winRate.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">Last 30 days</div>
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

      {/* Portfolio Overview */}
      <PortfolioOverview />

      {/* Live Market Data */}
      <LiveMarketTicker />

      {/* Real-time Trading Components */}
      <div className="grid gap-6 md:grid-cols-2">
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
              <Link href="/dashboard/bots">
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
