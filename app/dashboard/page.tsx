"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Bot,
  Activity,
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff,
  Plus,
} from "lucide-react"
import { RealtimeMarketTicker } from "@/components/dashboard/realtime-market-ticker"
import { RealtimeOrderBook } from "@/components/dashboard/realtime-order-book"
import { RealtimeTradeFeed } from "@/components/dashboard/realtime-trade-feed"
import { useAuth } from "@/hooks/use-auth"

interface PortfolioStats {
  totalValue: number
  dailyChange: number
  dailyChangePercent: number
  activeBots: number
  totalTrades: number
  winRate: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats>({
    totalValue: 0,
    dailyChange: 0,
    dailyChangePercent: 0,
    activeBots: 0,
    totalTrades: 0,
    winRate: 0,
  })
  const [loading, setLoading] = useState(true)
  const [showBalance, setShowBalance] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  // Simulate real-time portfolio updates
  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Generate realistic portfolio data
        const baseValue = 25000 + Math.random() * 50000
        const dailyChange = (Math.random() - 0.5) * 2000

        setPortfolioStats({
          totalValue: baseValue,
          dailyChange: dailyChange,
          dailyChangePercent: (dailyChange / baseValue) * 100,
          activeBots: Math.floor(Math.random() * 5) + 2,
          totalTrades: Math.floor(Math.random() * 50) + 100,
          winRate: 65 + Math.random() * 20,
        })

        setLastUpdate(new Date())
        setLoading(false)
      } catch (error) {
        console.error("Error fetching portfolio data:", error)
        setLoading(false)
      }
    }

    fetchPortfolioData()

    // Update portfolio stats every 30 seconds
    const interval = setInterval(() => {
      if (!loading) {
        fetchPortfolioData()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [loading])

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

  const getChangeColor = (change: number) => {
    return change >= 0 ? "text-green-400" : "text-red-400"
  }

  const getChangeIcon = (change: number) => {
    return change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400">Welcome back, loading your data...</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-8 bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400">
            Welcome back, {user?.firstName || user?.email || "Trader"}
            {lastUpdate && <span className="ml-2">• Last updated: {lastUpdate.toLocaleTimeString()}</span>}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="border-gray-600 text-white hover:bg-gray-800 bg-transparent"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Portfolio Value</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-white">
                    {showBalance ? formatCurrency(portfolioStats.totalValue) : "••••••"}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBalance(!showBalance)}
                    className="p-1 h-auto text-gray-400 hover:text-white"
                  >
                    {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                <div className={`flex items-center space-x-1 ${getChangeColor(portfolioStats.dailyChange)}`}>
                  {getChangeIcon(portfolioStats.dailyChange)}
                  <span className="text-sm font-medium">
                    {showBalance ? formatCurrency(Math.abs(portfolioStats.dailyChange)) : "••••"}(
                    {formatPercent(portfolioStats.dailyChangePercent)})
                  </span>
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-[#30D5C8]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Active Bots</p>
                <p className="text-2xl font-bold text-white">{portfolioStats.activeBots}</p>
                <div className="flex items-center space-x-1">
                  <Badge variant="outline" className="border-green-500 text-green-400 text-xs">
                    Running
                  </Badge>
                </div>
              </div>
              <Bot className="w-8 h-8 text-[#30D5C8]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Trades</p>
                <p className="text-2xl font-bold text-white">{portfolioStats.totalTrades}</p>
                <p className="text-sm text-gray-400">This month</p>
              </div>
              <Activity className="w-8 h-8 text-[#30D5C8]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Win Rate</p>
                <p className="text-2xl font-bold text-white">{portfolioStats.winRate.toFixed(1)}%</p>
                <div className="flex items-center space-x-1">
                  {portfolioStats.winRate >= 60 ? (
                    <Badge variant="outline" className="border-green-500 text-green-400 text-xs">
                      Good
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-yellow-500 text-yellow-400 text-xs">
                      Average
                    </Badge>
                  )}
                </div>
              </div>
              <TrendingUp className="w-8 h-8 text-[#30D5C8]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Market Ticker */}
      <RealtimeMarketTicker />

      {/* Real-time Data Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RealtimeOrderBook />
        <RealtimeTradeFeed />
      </div>

      {/* Quick Actions */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="bg-[#30D5C8] hover:bg-[#30D5C8]/80 text-black font-medium">
              <Plus className="w-4 h-4 mr-2" />
              Create New Bot
            </Button>
            <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800 bg-transparent">
              <Activity className="w-4 h-4 mr-2" />
              View All Trades
            </Button>
            <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800 bg-transparent">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Risk Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
