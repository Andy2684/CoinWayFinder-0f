"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownRight, TrendingUp, Bot, DollarSign, Activity } from "lucide-react"
import Link from "next/link"

export default function DashboardClient() {
  const [stats, setStats] = useState({
    totalBalance: 12345.67,
    totalProfit: 1234.56,
    activeBots: 3,
    totalTrades: 156,
    winRate: 78.5,
    monthlyReturn: 12.3,
  })

  const [recentTrades] = useState([
    { id: 1, pair: "BTC/USDT", type: "buy", amount: 0.1, price: 45000, profit: 123.45, time: "2 min ago" },
    { id: 2, pair: "ETH/USDT", type: "sell", amount: 2.5, price: 3200, profit: -45.67, time: "5 min ago" },
    { id: 3, pair: "ADA/USDT", type: "buy", amount: 1000, price: 0.45, profit: 67.89, time: "10 min ago" },
  ])

  const [activeBots] = useState([
    { id: 1, name: "BTC Scalper Pro", status: "active", profit: 456.78, trades: 23 },
    { id: 2, name: "ETH Grid Bot", status: "active", profit: 234.56, trades: 15 },
    { id: 3, name: "Altcoin Hunter", status: "paused", profit: 123.45, trades: 8 },
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
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

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalBalance.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-400">+2.5%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">+${stats.totalProfit.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-400">+{stats.monthlyReturn}%</span> this month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Bots</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeBots}</div>
              <p className="text-xs text-muted-foreground">{stats.totalTrades} trades executed</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Trades */}
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Trades
              </CardTitle>
              <CardDescription className="text-gray-300">Your latest trading activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTrades.map((trade) => (
                  <div key={trade.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${trade.type === "buy" ? "bg-green-600/20" : "bg-red-600/20"}`}>
                        {trade.type === "buy" ? (
                          <ArrowUpRight className="h-4 w-4 text-green-400" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{trade.pair}</p>
                        <p className="text-sm text-gray-400">{trade.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {trade.amount} @ ${trade.price.toLocaleString()}
                      </p>
                      <p className={`text-sm ${trade.profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {trade.profit >= 0 ? "+" : ""}${trade.profit.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Bots */}
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Active Bots
              </CardTitle>
              <CardDescription className="text-gray-300">Your trading bots performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeBots.map((bot) => (
                  <div key={bot.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-blue-600/20">
                        <Bot className="h-4 w-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium">{bot.name}</p>
                        <p className="text-sm text-gray-400">{bot.trades} trades</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={bot.status === "active" ? "bg-green-600" : "bg-yellow-600"}>{bot.status}</Badge>
                      <p className="text-sm text-green-400 mt-1">+${bot.profit.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link href="/dashboard/bots">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">View All Bots</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
