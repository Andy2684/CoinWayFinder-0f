"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Play,
  Pause,
  Settings,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { tradingBotEngine, type TradingBot } from "@/lib/trading-bot-engine"
import { CreateBotDialog } from "./create-bot-dialog"

export function ActiveBots() {
  const [bots, setBots] = useState<TradingBot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load bots from the engine
    const loadBots = () => {
      const allBots = tradingBotEngine.getAllBots()
      setBots(allBots)
      setLoading(false)
    }

    loadBots()

    // Set up polling to update bot stats
    const interval = setInterval(loadBots, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const toggleBotStatus = async (botId: string) => {
    const bot = bots.find((b) => b.id === botId)
    if (!bot) return

    let success = false
    if (bot.status === "running") {
      success = tradingBotEngine.pauseBot(botId)
    } else if (bot.status === "paused" || bot.status === "stopped") {
      success = tradingBotEngine.startBot(botId)
    }

    if (success) {
      setBots((prev) =>
        prev.map((b) => (b.id === botId ? { ...b, status: b.status === "running" ? "paused" : "running" } : b)),
      )
    }
  }

  const deleteBot = (botId: string) => {
    const success = tradingBotEngine.deleteBot(botId)
    if (success) {
      setBots((prev) => prev.filter((b) => b.id !== botId))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-green-500/10 text-green-400"
      case "paused":
        return "bg-yellow-500/10 text-yellow-400"
      case "stopped":
        return "bg-gray-500/10 text-gray-400"
      case "error":
        return "bg-red-500/10 text-red-400"
      default:
        return "bg-gray-500/10 text-gray-400"
    }
  }

  const getRiskColor = (riskLevel: number) => {
    if (riskLevel <= 30) return "bg-green-500/10 text-green-400"
    if (riskLevel <= 70) return "bg-yellow-500/10 text-yellow-400"
    return "bg-red-500/10 text-red-400"
  }

  const getRiskLabel = (riskLevel: number) => {
    if (riskLevel <= 30) return "Low"
    if (riskLevel <= 70) return "Medium"
    return "High"
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  if (loading) {
    return (
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">⚡ Active Bots</h2>
            <p className="text-gray-300">Loading your trading bots...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-gray-900/50 border-gray-800 animate-pulse">
              <CardHeader className="pb-4">
                <div className="h-6 bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-2/3"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">⚡ Active Bots</h2>
          <p className="text-gray-300">Monitor and manage your trading bots</p>
        </div>
        <div className="flex items-center space-x-2">
          <CreateBotDialog />
          <Button
            variant="outline"
            className="border-gray-600 text-white hover:bg-gray-800 bg-transparent"
            onClick={() => tradingBotEngine.emergencyStopAll()}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Emergency Stop
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {bots.map((bot) => {
          const netProfit = bot.stats.totalProfit - Math.abs(bot.stats.totalLoss)
          const profitPercent = bot.config.investment > 0 ? (netProfit / bot.config.investment) * 100 : 0

          return (
            <Card key={bot.id} className="bg-gray-900/50 border-gray-800 hover:border-[#30D5C8]/50 transition-colors">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <CardTitle className="text-white text-lg">{bot.name}</CardTitle>
                      <Badge className={getStatusColor(bot.status)}>{bot.status}</Badge>
                      {bot.status === "error" && <AlertTriangle className="w-4 h-4 text-red-400" />}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>{bot.strategy.toUpperCase()}</span>
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
                      <DropdownMenuItem className="text-red-400 hover:bg-gray-800" onClick={() => deleteBot(bot.id)}>
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
                    <p className="text-xs text-gray-400 mb-1">Net Profit</p>
                    <div className="flex items-center space-x-2">
                      <p className={`text-lg font-bold ${netProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                        ${Math.abs(netProfit).toFixed(2)}
                      </p>
                      {netProfit >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                    <p className={`text-xs ${profitPercent >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {profitPercent >= 0 ? "+" : ""}
                      {profitPercent.toFixed(2)}%
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400 mb-1">Win Rate</p>
                    <p className="text-lg font-bold text-white">{bot.stats.winRate.toFixed(1)}%</p>
                    <p className="text-xs text-gray-400">{bot.stats.totalTrades} trades</p>
                  </div>
                </div>

                {/* Investment & Risk */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Investment</p>
                    <p className="text-sm font-semibold text-white">${bot.config.investment.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Risk Level</p>
                    <Badge className={getRiskColor(bot.config.riskLevel)}>{getRiskLabel(bot.config.riskLevel)}</Badge>
                  </div>
                </div>

                {/* Last Activity */}
                <div>
                  <p className="text-xs text-gray-400 mb-1">Last Update</p>
                  <p className="text-sm text-gray-300">{formatTimeAgo(bot.lastUpdate)}</p>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={bot.status === "running"}
                      onCheckedChange={() => toggleBotStatus(bot.id)}
                      disabled={bot.status === "error"}
                    />
                    <span className="text-sm text-gray-300">
                      {bot.status === "running" ? "Running" : bot.status === "error" ? "Error" : "Stopped"}
                    </span>
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
                      disabled={bot.status === "error"}
                    >
                      {bot.status === "running" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
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
            <CreateBotDialog />
          </CardContent>
        </Card>
      )}
    </section>
  )
}
