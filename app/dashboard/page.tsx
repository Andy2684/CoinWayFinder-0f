"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, DollarSign, Activity, Users, BarChart3, Bot, Signal, Wallet, ArrowUpRight, ArrowDownRight, Play, Pause, Settings } from 'lucide-react'
import { useAuth } from "@/components/auth/auth-provider"

// Mock data for dashboard
const portfolioData = {
  totalBalance: 12450.67,
  totalPnL: 1234.56,
  pnlPercentage: 11.2,
  activeBots: 3,
  activeSignals: 12,
  winRate: 68.5,
}

const holdings = [
  { symbol: "BTC", amount: 0.5432, value: 23456.78, change: 2.4 },
  { symbol: "ETH", amount: 12.8765, value: 18765.43, change: -1.2 },
  { symbol: "ADA", amount: 5000, value: 2345.67, change: 5.8 },
  { symbol: "SOL", amount: 45.67, value: 3456.78, change: 3.2 },
]

const recentTrades = [
  { id: 1, type: "BUY", symbol: "BTC", amount: 0.1234, price: 43210.50, time: "2 min ago", pnl: 123.45 },
  { id: 2, type: "SELL", symbol: "ETH", amount: 2.5, price: 2456.78, time: "5 min ago", pnl: -45.67 },
  { id: 3, type: "BUY", symbol: "ADA", amount: 1000, price: 0.45, time: "12 min ago", pnl: 78.90 },
  { id: 4, type: "SELL", symbol: "SOL", amount: 10, price: 75.60, time: "18 min ago", pnl: 234.56 },
]

const activeBots = [
  { id: 1, name: "BTC Scalper", status: "active", profit: 456.78, winRate: 72 },
  { id: 2, name: "ETH Grid Bot", status: "active", profit: 234.56, winRate: 65 },
  { id: 3, name: "Multi-Coin DCA", status: "paused", profit: 543.21, winRate: 71 },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to access the dashboard</h2>
          <Button onClick={() => window.location.href = "/auth/login"}>
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Welcome back, {user.firstName || user.name}!</h1>
            <p className="text-gray-400 mt-1">{currentTime.toLocaleString()}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="bg-white/5 border-white/10 text-white">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-black/40 backdrop-blur-xl border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${portfolioData.totalBalance.toLocaleString()}</div>
              <p className="text-xs text-green-400 flex items-center mt-1">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +{portfolioData.pnlPercentage}% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">P&L Today</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">+${portfolioData.totalPnL.toLocaleString()}</div>
              <p className="text-xs text-gray-400 mt-1">
                Profit from {portfolioData.activeBots} active bots
              </p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Active Bots</CardTitle>
              <Bot className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{portfolioData.activeBots}</div>
              <p className="text-xs text-gray-400 mt-1">
                {portfolioData.winRate}% win rate
              </p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Active Signals</CardTitle>
              <Signal className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{portfolioData.activeSignals}</div>
              <p className="text-xs text-gray-400 mt-1">
                Real-time market signals
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Portfolio Holdings */}
          <div className="lg:col-span-2">
            <Card className="bg-black/40 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Wallet className="w-5 h-5 mr-2" />
                  Portfolio Holdings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {holdings.map((holding) => (
                    <div key={holding.symbol} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-yellow-400 flex items-center justify-center text-white font-bold text-sm">
                          {holding.symbol.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-white">{holding.symbol}</p>
                          <p className="text-sm text-gray-400">{holding.amount} {holding.symbol}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-white">${holding.value.toLocaleString()}</p>
                        <p className={`text-sm flex items-center ${holding.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {holding.change >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                          {Math.abs(holding.change)}%
                        </p>
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
                  <Bot className="w-5 h-5 mr-2" />
                  Active Bots
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeBots.map((bot) => (
                    <div key={bot.id} className="p-3 rounded-lg bg-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-white text-sm">{bot.name}</p>
                        <Badge variant={bot.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                          {bot.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Profit:</span>
                        <span className="text-green-400">+${bot.profit}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-gray-400">Win Rate:</span>
                        <span className="text-white">{bot.winRate}%</span>
                      </div>
                      <Progress value={bot.winRate} className="mt-2 h-1" />
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
              <Activity className="w-5 h-5 mr-2" />
              Recent Trades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTrades.map((trade) => (
                <div key={trade.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div className="flex items-center space-x-3">
                    <Badge variant={trade.type === 'BUY' ? 'default' : 'destructive'} className="text-xs">
                      {trade.type}
                    </Badge>
                    <div>
                      <p className="font-medium text-white text-sm">{trade.symbol}</p>
                      <p className="text-xs text-gray-400">{trade.amount} @ ${trade.price}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium text-sm ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {trade.pnl >= 0 ? '+' : ''}${trade.pnl}
                    </p>
                    <p className="text-xs text-gray-400">{trade.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button className="h-16 bg-blue-600 hover:bg-blue-700 text-white">
            <Bot className="w-5 h-5 mr-2" />
            Create New Bot
          </Button>
          <Button className="h-16 bg-purple-600 hover:bg-purple-700 text-white">
            <Signal className="w-5 h-5 mr-2" />
            View Signals
          </Button>
          <Button className="h-16 bg-green-600 hover:bg-green-700 text-white">
            <BarChart3 className="w-5 h-5 mr-2" />
            Analytics
          </Button>
        </div>
      </div>
    </div>
  )
}
