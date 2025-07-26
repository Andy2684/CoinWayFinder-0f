"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Bot, Play, Pause, Settings, TrendingUp, DollarSign, Activity } from "lucide-react"
import Link from "next/link"

export default function DashboardBotsClient() {
  const [bots, setBots] = useState([
    {
      id: 1,
      name: "BTC Scalper Pro",
      status: "active",
      profit: 1234.56,
      trades: 45,
      winRate: 78.5,
      strategy: "Grid Trading",
      pair: "BTC/USDT",
      isActive: true,
    },
    {
      id: 2,
      name: "ETH Grid Bot",
      status: "active",
      profit: 856.23,
      trades: 32,
      winRate: 82.1,
      strategy: "DCA",
      pair: "ETH/USDT",
      isActive: true,
    },
    {
      id: 3,
      name: "Altcoin Hunter",
      status: "paused",
      profit: 423.78,
      trades: 18,
      winRate: 65.4,
      strategy: "Momentum",
      pair: "ADA/USDT",
      isActive: false,
    },
    {
      id: 4,
      name: "SOL Swing Trader",
      status: "active",
      profit: 678.9,
      trades: 28,
      winRate: 75.2,
      strategy: "Swing Trading",
      pair: "SOL/USDT",
      isActive: true,
    },
  ])

  const toggleBot = (id: number) => {
    setBots(
      bots.map((bot) =>
        bot.id === id ? { ...bot, isActive: !bot.isActive, status: bot.isActive ? "paused" : "active" } : bot,
      ),
    )
  }

  const totalProfit = bots.reduce((sum, bot) => sum + bot.profit, 0)
  const activeBots = bots.filter((bot) => bot.isActive).length
  const totalTrades = bots.reduce((sum, bot) => sum + bot.trades, 0)
  const avgWinRate = bots.reduce((sum, bot) => sum + bot.winRate, 0) / bots.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Trading Bots</h1>
              <p className="text-gray-300">Manage and monitor your automated trading bots</p>
            </div>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Bot className="h-4 w-4 mr-2" />
            Create New Bot
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">+${totalProfit.toFixed(2)}</div>
              <p className="text-xs text-gray-400">From all bots</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Bots</CardTitle>
              <Bot className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeBots}</div>
              <p className="text-xs text-gray-400">Out of {bots.length} total</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
              <Activity className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTrades}</div>
              <p className="text-xs text-gray-400">Executed trades</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Win Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgWinRate.toFixed(1)}%</div>
              <p className="text-xs text-gray-400">Success rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Bots Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {bots.map((bot) => (
            <Card key={bot.id} className="bg-white/10 border-white/20 text-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-blue-600/20">
                      <Bot className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{bot.name}</CardTitle>
                      <CardDescription className="text-gray-300">
                        {bot.pair} • {bot.strategy}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={bot.status === "active" ? "bg-green-600" : "bg-yellow-600"}>{bot.status}</Badge>
                    <Switch checked={bot.isActive} onCheckedChange={() => toggleBot(bot.id)} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-400">Profit</p>
                    <p className="text-lg font-bold text-green-400">+${bot.profit.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Trades</p>
                    <p className="text-lg font-bold">{bot.trades}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Win Rate</p>
                    <p className="text-lg font-bold">{bot.winRate}%</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-white/20 text-white hover:bg-white/10 bg-transparent"
                    onClick={() => toggleBot(bot.id)}
                  >
                    {bot.isActive ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Start
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
