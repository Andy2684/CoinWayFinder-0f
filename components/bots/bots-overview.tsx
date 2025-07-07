"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bot, TrendingUp, TrendingDown, Activity, DollarSign, Play, AlertTriangle } from "lucide-react"
import { tradingBotEngine } from "@/lib/trading-bot-engine"

export function BotsOverview() {
  const [portfolioStats, setPortfolioStats] = useState({
    totalBots: 0,
    runningBots: 0,
    totalProfit: 0,
    totalTrades: 0,
    avgWinRate: 0,
  })

  useEffect(() => {
    const loadStats = () => {
      const stats = tradingBotEngine.getPortfolioStats()
      setPortfolioStats(stats)
    }

    loadStats()
    const interval = setInterval(loadStats, 5000)
    return () => clearInterval(interval)
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const getPerformanceColor = (value: number) => {
    return value >= 0 ? "text-green-400" : "text-red-400"
  }

  const getPerformanceIcon = (value: number) => {
    return value >= 0 ? TrendingUp : TrendingDown
  }

  const PerformanceIcon = getPerformanceIcon(portfolioStats.totalProfit)

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">📈 Portfolio Overview</h2>
          <p className="text-gray-300">Your trading bot portfolio performance at a glance</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="border-gray-600 text-white hover:bg-gray-800 bg-transparent"
            onClick={() => tradingBotEngine.emergencyStopAll()}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Emergency Stop All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Bots */}
        <Card className="bg-gray-900/50 border-gray-800 hover:border-[#30D5C8]/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Bots</p>
                <p className="text-3xl font-bold text-white">{portfolioStats.totalBots}</p>
                <p className="text-xs text-gray-500 mt-1">{portfolioStats.runningBots} running</p>
              </div>
              <div className="w-12 h-12 bg-[#30D5C8]/10 rounded-lg flex items-center justify-center">
                <Bot className="w-6 h-6 text-[#30D5C8]" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Bots */}
        <Card className="bg-gray-900/50 border-gray-800 hover:border-green-500/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Active Bots</p>
                <p className="text-3xl font-bold text-white">{portfolioStats.runningBots}</p>
                <p className="text-xs text-green-400 mt-1">Currently trading</p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Play className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total P&L */}
        <Card className="bg-gray-900/50 border-gray-800 hover:border-blue-500/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total P&L</p>
                <p className={`text-3xl font-bold ${getPerformanceColor(portfolioStats.totalProfit)}`}>
                  {formatCurrency(portfolioStats.totalProfit)}
                </p>
                <p className="text-xs text-gray-500 mt-1">All-time performance</p>
              </div>
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  portfolioStats.totalProfit >= 0 ? "bg-green-500/10" : "bg-red-500/10"
                }`}
              >
                <PerformanceIcon className={`w-6 h-6 ${getPerformanceColor(portfolioStats.totalProfit)}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Win Rate */}
        <Card className="bg-gray-900/50 border-gray-800 hover:border-yellow-500/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Avg Win Rate</p>
                <p className="text-3xl font-bold text-white">{portfolioStats.avgWinRate.toFixed(1)}%</p>
                <p className="text-xs text-gray-500 mt-1">{portfolioStats.totalTrades} total trades</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-[#30D5C8]" />
            Quick Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-white mb-1">{portfolioStats.totalTrades}</p>
              <p className="text-sm text-gray-400">Total Trades</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400 mb-1">
                {portfolioStats.totalBots > 0
                  ? Math.round(portfolioStats.totalTrades * (portfolioStats.avgWinRate / 100))
                  : 0}
              </p>
              <p className="text-sm text-gray-400">Winning Trades</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400 mb-1">
                {portfolioStats.totalBots > 0
                  ? portfolioStats.totalTrades -
                    Math.round(portfolioStats.totalTrades * (portfolioStats.avgWinRate / 100))
                  : 0}
              </p>
              <p className="text-sm text-gray-400">Losing Trades</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[#30D5C8] mb-1">
                {portfolioStats.runningBots > 0
                  ? (portfolioStats.totalTrades / portfolioStats.runningBots).toFixed(1)
                  : "0"}
              </p>
              <p className="text-sm text-gray-400">Avg Trades/Bot</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
