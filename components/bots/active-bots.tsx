"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Play, Pause, Settings, TrendingUp, TrendingDown, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Bot {
  id: string
  name: string
  strategy: string
  pair: string
  status: "running" | "paused" | "stopped"
  profit: number
  profitPercent: number
  trades: number
  winRate: number
  investment: number
  createdAt: string
  lastTrade: string
  riskLevel: "Low" | "Medium" | "High"
}

export function ActiveBots() {
  const [bots, setBots] = useState<Bot[]>([
    {
      id: "1",
      name: "BTC DCA Master",
      strategy: "DCA",
      pair: "BTC/USDT",
      status: "running",
      profit: 1247.32,
      profitPercent: 12.4,
      trades: 156,
      winRate: 78.2,
      investment: 10000,
      createdAt: "2024-01-01",
      lastTrade: "2 hours ago",
      riskLevel: "Low",
    },
    {
      id: "2",
      name: "ETH Grid Pro",
      strategy: "Grid Trading",
      pair: "ETH/USDT",
      status: "running",
      profit: 892.15,
      profitPercent: 17.8,
      trades: 234,
      winRate: 71.4,
      investment: 5000,
      createdAt: "2024-01-05",
      lastTrade: "15 minutes ago",
      riskLevel: "Medium",
    },
    {
      id: "3",
      name: "SOL Scalper",
      strategy: "Scalping",
      pair: "SOL/USDT",
      status: "paused",
      profit: -45.67,
      profitPercent: -1.5,
      trades: 89,
      winRate: 65.2,
      investment: 3000,
      createdAt: "2024-01-10",
      lastTrade: "1 day ago",
      riskLevel: "High",
    },
    {
      id: "4",
      name: "ADA Momentum",
      strategy: "Momentum",
      pair: "ADA/USDT",
      status: "running",
      profit: 234.89,
      profitPercent: 9.4,
      trades: 67,
      winRate: 82.1,
      investment: 2500,
      createdAt: "2024-01-12",
      lastTrade: "30 minutes ago",
      riskLevel: "Medium",
    },
    {
      id: "5",
      name: "AI Multi-Pair",
      strategy: "AI Adaptive",
      pair: "Multiple",
      status: "running",
      profit: 567.43,
      profitPercent: 22.7,
      trades: 145,
      winRate: 76.5,
      investment: 2500,
      createdAt: "2024-01-08",
      lastTrade: "5 minutes ago",
      riskLevel: "Medium",
    },
  ])

  const toggleBotStatus = (botId: string) => {
    setBots(
      bots.map((bot) => (bot.id === botId ? { ...bot, status: bot.status === "running" ? "paused" : "running" } : bot)),
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-green-500/10 text-green-400"
      case "paused":
        return "bg-yellow-500/10 text-yellow-400"
      case "stopped":
        return "bg-red-500/10 text-red-400"
      default:
        return "bg-gray-500/10 text-gray-400"
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low":
        return "bg-green-500/10 text-green-400"
      case "Medium":
        return "bg-yellow-500/10 text-yellow-400"
      case "High":
        return "bg-red-500/10 text-red-400"
      default:
        return "bg-gray-500/10 text-gray-400"
    }
  }

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">⚡ Active Bots</h2>
          <p className="text-gray-300">Monitor and manage your trading bots</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800 bg-transparent">
            <Settings className="w-4 h-4 mr-2" />
            Bulk Actions
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {bots.map((bot) => (
          <Card key={bot.id} className="bg-gray-900/50 border-gray-800 hover:border-[#30D5C8]/50 transition-colors">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <CardTitle className="text-white text-lg">{bot.name}</CardTitle>
                    <Badge className={getStatusColor(bot.status)}>{bot.status}</Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>{bot.strategy}</span>
                    <span>•</span>
                    <span>{bot.pair}</span>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-gray-900 border-gray-700">
                    <DropdownMenuItem className="text-gray-300 hover:bg-gray-800">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-gray-300 hover:bg-gray-800">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-gray-300 hover:bg-gray-800">
                      <Settings className="w-4 h-4 mr-2" />
                      Configure
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-400 hover:bg-gray-800">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Bot
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Performance Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Total Profit</p>
                  <div className="flex items-center space-x-2">
                    <p className={`text-lg font-bold ${bot.profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                      ${Math.abs(bot.profit).toFixed(2)}
                    </p>
                    {bot.profit >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <p className={`text-xs ${bot.profitPercent >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {bot.profitPercent >= 0 ? "+" : ""}
                    {bot.profitPercent}%
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 mb-1">Win Rate</p>
                  <p className="text-lg font-bold text-white">{bot.winRate}%</p>
                  <p className="text-xs text-gray-400">{bot.trades} trades</p>
                </div>
              </div>

              {/* Investment & Risk */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Investment</p>
                  <p className="text-sm font-semibold text-white">${bot.investment.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Risk Level</p>
                  <Badge className={getRiskColor(bot.riskLevel)}>{bot.riskLevel}</Badge>
                </div>
              </div>

              {/* Last Activity */}
              <div>
                <p className="text-xs text-gray-400 mb-1">Last Trade</p>
                <p className="text-sm text-gray-300">{bot.lastTrade}</p>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                <div className="flex items-center space-x-2">
                  <Switch checked={bot.status === "running"} onCheckedChange={() => toggleBotStatus(bot.id)} />
                  <span className="text-sm text-gray-300">{bot.status === "running" ? "Running" : "Paused"}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="h-8 px-3 text-gray-400 hover:text-white">
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 text-gray-400 hover:text-white"
                    onClick={() => toggleBotStatus(bot.id)}
                  >
                    {bot.status === "running" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {bots.length === 0 && (
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No Active Bots</h3>
            <p className="text-gray-400 mb-6">Create your first trading bot to get started</p>
            <Button className="bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E] font-semibold">
              Create Your First Bot
            </Button>
          </CardContent>
        </Card>
      )}
    </section>
  )
}
