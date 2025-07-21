"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownRight, TrendingUp, Bot, DollarSign, Activity } from "lucide-react"
import Link from "next/link"

export default function DashboardClient() {
  const [stats, setStats] = useState({
    totalBalance: 0,
    totalProfit: 0,
    activeBots: 0,
    totalTrades: 0,
    winRate: 0,
    monthlyReturn: 0,
  })

  const [recentTrades, setRecentTrades] = useState([
    {
      id: 1,
      pair: "BTC/USDT",
      type: "buy",
      amount: 0.025,
      price: 43250,
      profit: 125.5,
      time: "2 minutes ago",
    },
    {
      id: 2,
      pair: "ETH/USDT",
      type: "sell",
      amount: 1.5,
      price: 2650,
      profit: -45.2,
      time: "5 minutes ago",
    },
    {
      id: 3,
      pair: "ADA/USDT",
      type: "buy",
      amount: 1000,
      price: 0.45,
      profit: 78.9,
      time: "12 minutes ago",
    },
  ])

  useEffect(() => {
    // Simulate loading stats
    const timer = setTimeout(() => {
      setStats({
        totalBalance: 25847.32,
        totalProfit: 3247.89,
        activeBots: 5,
        totalTrades: 1247,
        winRate: 78.5,
        monthlyReturn: 12.4,
      })
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Trading Dashboard</h1>
            <p className="text-gray-300">Welcome back! Here's your trading overview.</p>
          </div>
          <div className="flex gap-4">
            <Link href="/dashboard/bots">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Bot className="h-4 w-4 mr-2" />
                Manage Bots
              </Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                Settings
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalBalance.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+2.5% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">+${stats.totalProfit.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+{stats.monthlyReturn}% this month</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Bots</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeBots}</div>
              <p className="text-xs text-muted-foreground">2 paused, 3 running</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTrades.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+45 today</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{stats.winRate}%</div>
              <p className="text-xs text-muted-foreground">Above average</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Return</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">+{stats.monthlyReturn}%</div>
              <p className="text-xs text-muted-foreground">Excellent performance</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Trades */}
        <Card className="bg-white/10 border-white/20 text-white">
          <CardHeader>
            <CardTitle>Recent Trades</CardTitle>
            <CardDescription className="text-gray-300">Your latest trading activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTrades.map((trade) => (
                <div key={trade.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${trade.type === "buy" ? "bg-green-600/20" : "bg-red-600/20"}`}>
                      {trade.type === "buy" ? (
                        <ArrowUpRight className="h-4 w-4 text-green-400" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{trade.pair}</p>
                      <p className="text-sm text-gray-400">
                        {trade.type.toUpperCase()} {trade.amount} @ ${trade.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${trade.profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {trade.profit >= 0 ? "+" : ""}${trade.profit.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-400">{trade.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
