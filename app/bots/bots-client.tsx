"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Bot,
  Play,
  Pause,
  Square,
  Settings,
  DollarSign,
  Activity,
  BarChart3,
  Target,
  Plus,
  Copy,
  Upload,
  Filter,
  Search,
  MoreHorizontal,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownRight,
  Maximize2,
  Minimize2,
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface TradingBot {
  id: string
  name: string
  strategy: string
  status: "running" | "paused" | "stopped" | "error"
  profit: number
  profitPercent: number
  trades: number
  winRate: number
  balance: number
  risk: "low" | "medium" | "high"
  created: string
  lastActive: string
}

export default function BotsPageClient() {
  const { user, logout } = useAuth()
  const [bots, setBots] = useState<TradingBot[]>([
    {
      id: "bot-1",
      name: "Bitcoin Scalper",
      strategy: "Grid Trading",
      status: "running",
      profit: 1234.56,
      profitPercent: 12.4,
      trades: 156,
      winRate: 68.5,
      balance: 10000,
      risk: "medium",
      created: "2024-01-15",
      lastActive: "2 minutes ago",
    },
    {
      id: "bot-2",
      name: "ETH DCA Bot",
      strategy: "Dollar Cost Average",
      status: "running",
      profit: 892.33,
      profitPercent: 8.9,
      trades: 89,
      winRate: 72.1,
      balance: 10000,
      risk: "low",
      created: "2024-01-10",
      lastActive: "5 minutes ago",
    },
    {
      id: "bot-3",
      name: "Altcoin Hunter",
      strategy: "Momentum Trading",
      status: "paused",
      profit: -156.78,
      profitPercent: -1.6,
      trades: 45,
      winRate: 44.4,
      balance: 10000,
      risk: "high",
      created: "2024-01-20",
      lastActive: "1 hour ago",
    },
    {
      id: "bot-4",
      name: "Stable Arbitrage",
      strategy: "Arbitrage",
      status: "running",
      profit: 445.67,
      profitPercent: 4.5,
      trades: 234,
      winRate: 89.3,
      balance: 10000,
      risk: "low",
      created: "2024-01-05",
      lastActive: "30 seconds ago",
    },
  ])

  const [selectedBot, setSelectedBot] = useState<string | null>(null)
  const [showBalances, setShowBalances] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [isCompactView, setIsCompactView] = useState(false)

  const filteredBots = bots.filter((bot) => {
    const matchesSearch =
      bot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bot.strategy.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || bot.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const handleBotAction = (botId: string, action: string) => {
    setBots((prevBots) =>
      prevBots.map((bot) => {
        if (bot.id === botId) {
          switch (action) {
            case "start":
              return { ...bot, status: "running" as const }
            case "pause":
              return { ...bot, status: "paused" as const }
            case "stop":
              return { ...bot, status: "stopped" as const }
            default:
              return bot
          }
        }
        return bot
      }),
    )
    toast.success(`Bot ${action}ed successfully!`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "paused":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "stopped":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      case "error":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "text-green-400"
      case "medium":
        return "text-yellow-400"
      case "high":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const totalProfit = bots.reduce((sum, bot) => sum + bot.profit, 0)
  const totalTrades = bots.reduce((sum, bot) => sum + bot.trades, 0)
  const runningBots = bots.filter((bot) => bot.status === "running").length
  const avgWinRate = bots.reduce((sum, bot) => sum + bot.winRate, 0) / bots.length

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Card className="w-full max-w-md bg-black/40 backdrop-blur-xl border-white/10">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white text-lg">Please log in to access your bots</p>
            <Link href="/auth/login">
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700">Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-black/20 border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">Trading Bots</h1>
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                {runningBots} Active
              </Badge>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCompactView(!isCompactView)}
                className="text-white hover:bg-white/10"
              >
                {isCompactView ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBalances(!showBalances)}
                className="text-white hover:bg-white/10"
              >
                {showBalances ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>

              <Link href="/dashboard">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/10 text-white hover:bg-white/10 bg-transparent"
                >
                  Dashboard
                </Button>
              </Link>

              <Button variant="destructive" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Profit</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {showBalances ? `$${totalProfit.toLocaleString()}` : "••••••"}
              </div>
              <div className="flex items-center space-x-2 mt-2">
                {totalProfit >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${totalProfit >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {totalProfit >= 0 ? "+" : ""}
                  {((totalProfit / 40000) * 100).toFixed(2)}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Active Bots</CardTitle>
              <Bot className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{runningBots}</div>
              <p className="text-sm text-gray-400 mt-2">{bots.length - runningBots} inactive</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Trades</CardTitle>
              <Activity className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalTrades.toLocaleString()}</div>
              <p className="text-sm text-gray-400 mt-2">Across all bots</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Avg Win Rate</CardTitle>
              <Target className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{avgWinRate.toFixed(1)}%</div>
              <Progress value={avgWinRate} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Bot Management</CardTitle>
              <div className="flex items-center space-x-2">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Bot
                </Button>
                <Button variant="outline" className="border-white/10 text-white hover:bg-white/10 bg-transparent">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search bots..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="stopped">Stopped</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bots Grid */}
        <div
          className={`grid gap-6 ${isCompactView ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 lg:grid-cols-2"}`}
        >
          {filteredBots.map((bot) => (
            <Card
              key={bot.id}
              className="bg-black/40 border-white/10 backdrop-blur-xl hover:bg-black/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 group cursor-pointer"
              onClick={() => setSelectedBot(selectedBot === bot.id ? null : bot.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                      <Bot className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <CardTitle className="text-white">{bot.name}</CardTitle>
                      <CardDescription className="text-gray-400">{bot.strategy}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(bot.status)}>{bot.status}</Badge>
                    <Select>
                      <SelectTrigger className="w-[40px] h-8 bg-white/5 border-white/10">
                        <MoreHorizontal className="h-4 w-4 text-white" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="edit">Edit</SelectItem>
                        <SelectItem value="clone">Clone</SelectItem>
                        <SelectItem value="export">Export</SelectItem>
                        <SelectItem value="delete">Delete</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400 text-xs">Profit</Label>
                    <div className="flex items-center space-x-2">
                      <span className={`text-lg font-bold ${bot.profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {showBalances ? `$${bot.profit.toLocaleString()}` : "••••••"}
                      </span>
                      <span className={`text-sm ${bot.profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                        ({bot.profitPercent >= 0 ? "+" : ""}
                        {bot.profitPercent}%)
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-400 text-xs">Win Rate</Label>
                    <div className="text-lg font-bold text-white">{bot.winRate}%</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400 text-xs">Trades</Label>
                    <div className="text-lg font-bold text-white">{bot.trades}</div>
                  </div>
                  <div>
                    <Label className="text-gray-400 text-xs">Risk Level</Label>
                    <div className={`text-lg font-bold ${getRiskColor(bot.risk)}`}>{bot.risk.toUpperCase()}</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Performance</span>
                    <span>{bot.winRate}%</span>
                  </div>
                  <Progress value={bot.winRate} className="h-2" />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-2">
                    {bot.status === "running" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleBotAction(bot.id, "pause")
                        }}
                        className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20"
                      >
                        <Pause className="h-3 w-3 mr-1" />
                        Pause
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleBotAction(bot.id, "start")
                        }}
                        className="border-green-500/30 text-green-400 hover:bg-green-500/20"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Start
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleBotAction(bot.id, "stop")
                      }}
                      className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                    >
                      <Square className="h-3 w-3 mr-1" />
                      Stop
                    </Button>
                  </div>
                  <div className="text-xs text-gray-400">Last active: {bot.lastActive}</div>
                </div>

                {/* Expanded Details */}
                {selectedBot === bot.id && (
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="text-gray-400">Balance</Label>
                        <div className="text-white font-medium">
                          {showBalances ? `$${bot.balance.toLocaleString()}` : "••••••"}
                        </div>
                      </div>
                      <div>
                        <Label className="text-gray-400">Created</Label>
                        <div className="text-white font-medium">{bot.created}</div>
                      </div>
                    </div>

                    <Separator className="bg-white/10" />

                    <div className="flex items-center justify-between">
                      <Button size="sm" variant="ghost" className="text-blue-400 hover:bg-blue-500/20">
                        <Settings className="h-3 w-3 mr-1" />
                        Configure
                      </Button>
                      <Button size="sm" variant="ghost" className="text-purple-400 hover:bg-purple-500/20">
                        <BarChart3 className="h-3 w-3 mr-1" />
                        Analytics
                      </Button>
                      <Button size="sm" variant="ghost" className="text-green-400 hover:bg-green-500/20">
                        <Copy className="h-3 w-3 mr-1" />
                        Clone
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredBots.length === 0 && (
          <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
            <CardContent className="p-12 text-center">
              <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No bots found</h3>
              <p className="text-gray-400 mb-6">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Create your first trading bot to get started"}
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Bot
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
