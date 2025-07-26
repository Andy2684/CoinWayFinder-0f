"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  Bot,
  Brain,
  TrendingUp,
  TrendingDown,
  Play,
  Pause,
  Settings,
  BarChart3,
  DollarSign,
  Activity,
  Zap,
  Target,
  Shield,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
} from "lucide-react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CreateBotDialog } from "@/components/bots/create-bot-dialog"

interface TradingBot {
  id: string
  name: string
  type: "traditional" | "ai"
  strategy: string
  status: "active" | "paused" | "stopped" | "training"
  profit: number
  profitPercent: number
  trades: number
  winRate: number
  investment: number
  pair: string
  createdAt: string
  lastTrade: string
  riskLevel: "Low" | "Medium" | "High"
  aiMetrics?: {
    confidence: number
    learningProgress: number
    adaptationRate: number
    predictionAccuracy: number
  }
}

export default function BotsPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterType, setFilterType] = useState("all")

  const [bots, setBots] = useState<TradingBot[]>([
    {
      id: "bot-1",
      name: "BTC DCA Master",
      type: "traditional",
      strategy: "DCA",
      status: "active",
      profit: 1247.32,
      profitPercent: 12.4,
      trades: 156,
      winRate: 78.2,
      investment: 10000,
      pair: "BTC/USDT",
      createdAt: "2024-01-01",
      lastTrade: "2 hours ago",
      riskLevel: "Low",
    },
    {
      id: "bot-2",
      name: "ETH Grid Pro",
      type: "traditional",
      strategy: "Grid Trading",
      status: "active",
      profit: 892.15,
      profitPercent: 17.8,
      trades: 234,
      winRate: 71.4,
      investment: 5000,
      pair: "ETH/USDT",
      createdAt: "2024-01-05",
      lastTrade: "15 minutes ago",
      riskLevel: "Medium",
    },
    {
      id: "bot-3",
      name: "Neural Trend Predictor",
      type: "ai",
      strategy: "Neural Network",
      status: "active",
      profit: 2134.67,
      profitPercent: 34.7,
      trades: 247,
      winRate: 82.1,
      investment: 15000,
      pair: "BTC/USDT",
      createdAt: "2024-01-15",
      lastTrade: "2 minutes ago",
      riskLevel: "Medium",
      aiMetrics: {
        confidence: 87,
        learningProgress: 94,
        adaptationRate: 76,
        predictionAccuracy: 84,
      },
    },
    {
      id: "bot-4",
      name: "Deep Learning Scalper",
      type: "ai",
      strategy: "Deep Learning",
      status: "training",
      profit: 567.89,
      profitPercent: 28.9,
      trades: 89,
      winRate: 75.8,
      investment: 8000,
      pair: "ETH/USDT",
      createdAt: "2024-01-10",
      lastTrade: "1 hour ago",
      riskLevel: "High",
      aiMetrics: {
        confidence: 92,
        learningProgress: 45,
        adaptationRate: 89,
        predictionAccuracy: 79,
      },
    },
    {
      id: "bot-5",
      name: "SOL Momentum Bot",
      type: "traditional",
      strategy: "Momentum",
      status: "paused",
      profit: -45.67,
      profitPercent: -1.5,
      trades: 67,
      winRate: 65.2,
      investment: 3000,
      pair: "SOL/USDT",
      createdAt: "2024-01-12",
      lastTrade: "1 day ago",
      riskLevel: "High",
    },
    {
      id: "bot-6",
      name: "Ensemble AI Master",
      type: "ai",
      strategy: "Ensemble AI",
      status: "active",
      profit: 3421.15,
      profitPercent: 42.1,
      trades: 156,
      winRate: 86.4,
      investment: 25000,
      pair: "Multiple",
      createdAt: "2024-01-05",
      lastTrade: "30 seconds ago",
      riskLevel: "Medium",
      aiMetrics: {
        confidence: 95,
        learningProgress: 97,
        adaptationRate: 91,
        predictionAccuracy: 89,
      },
    },
  ])

  const filteredBots = bots.filter((bot) => {
    const matchesSearch =
      bot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bot.strategy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bot.pair.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || bot.status === filterStatus
    const matchesType = filterType === "all" || bot.type === filterType
    return matchesSearch && matchesStatus && matchesType
  })

  const toggleBotStatus = (botId: string) => {
    setBots(
      bots.map((bot) => (bot.id === botId ? { ...bot, status: bot.status === "active" ? "paused" : "active" } : bot)),
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      case "paused":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
      case "stopped":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      case "training":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20"
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

  const getBotTypeIcon = (type: string, strategy: string) => {
    if (type === "ai") {
      switch (strategy) {
        case "Neural Network":
          return <Brain className="w-5 h-5" />
        case "Deep Learning":
          return <Zap className="w-5 h-5" />
        case "Reinforcement Learning":
          return <Target className="w-5 h-5" />
        case "Ensemble AI":
          return <BarChart3 className="w-5 h-5" />
        default:
          return <Brain className="w-5 h-5" />
      }
    }
    return <Bot className="w-5 h-5" />
  }

  const totalProfit = bots.reduce((sum, bot) => sum + bot.profit, 0)
  const activeBots = bots.filter((bot) => bot.status === "active").length
  const totalTrades = bots.reduce((sum, bot) => sum + bot.trades, 0)
  const avgWinRate = bots.reduce((sum, bot) => sum + bot.winRate, 0) / bots.length
  const totalInvestment = bots.reduce((sum, bot) => sum + bot.investment, 0)
  const aiBots = bots.filter((bot) => bot.type === "ai").length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Trading Bots</h1>
              <p className="text-gray-300">Manage your automated trading strategies</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800 bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <CreateBotDialog />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <Card className="bg-white/10 border-white/20 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Bots</p>
                  <p className="text-2xl font-bold">{bots.length}</p>
                </div>
                <Bot className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Bots</p>
                  <p className="text-2xl font-bold text-green-400">{activeBots}</p>
                </div>
                <Activity className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">AI Bots</p>
                  <p className="text-2xl font-bold text-purple-400">{aiBots}</p>
                </div>
                <Brain className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Profit</p>
                  <p className={`text-2xl font-bold ${totalProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                    ${totalProfit.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Trades</p>
                  <p className="text-2xl font-bold text-blue-400">{totalTrades}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Avg Win Rate</p>
                  <p className="text-2xl font-bold text-yellow-400">{avgWinRate.toFixed(1)}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/10 border-white/20">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white/20">
              Overview
            </TabsTrigger>
            <TabsTrigger value="traditional" className="data-[state=active]:bg-white/20">
              Traditional Bots
            </TabsTrigger>
            <TabsTrigger value="ai" className="data-[state=active]:bg-white/20">
              AI Bots
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-white/20">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="strategies" className="data-[state=active]:bg-white/20">
              Strategies
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search bots..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="stopped">Stopped</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="traditional">Traditional</SelectItem>
                    <SelectItem value="ai">AI Bots</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bots Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredBots.map((bot) => (
                <Card
                  key={bot.id}
                  className="bg-white/10 border-white/20 text-white hover:border-[#30D5C8]/50 transition-colors"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            bot.type === "ai" ? "bg-purple-500/10 text-purple-400" : "bg-blue-500/10 text-blue-400"
                          }`}
                        >
                          {getBotTypeIcon(bot.type, bot.strategy)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{bot.name}</CardTitle>
                          <div className="flex items-center space-x-2 text-sm text-gray-400">
                            <span>{bot.strategy}</span>
                            <span>•</span>
                            <span>{bot.pair}</span>
                            {bot.type === "ai" && (
                              <>
                                <span>•</span>
                                <Badge className="bg-purple-500/10 text-purple-400 text-xs">AI</Badge>
                              </>
                            )}
                          </div>
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
                    <Badge className={getStatusColor(bot.status)}>{bot.status}</Badge>
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

                    {/* AI Metrics for AI Bots */}
                    {bot.type === "ai" && bot.aiMetrics && (
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">AI Confidence</span>
                            <span className="text-white">{bot.aiMetrics.confidence}%</span>
                          </div>
                          <Progress value={bot.aiMetrics.confidence} className="h-1" />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">Learning Progress</span>
                            <span className="text-white">{bot.aiMetrics.learningProgress}%</span>
                          </div>
                          <Progress value={bot.aiMetrics.learningProgress} className="h-1" />
                        </div>
                      </div>
                    )}

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
                    <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={bot.status === "active"}
                          onCheckedChange={() => toggleBotStatus(bot.id)}
                          disabled={bot.status === "training"}
                        />
                        <span className="text-sm text-gray-300">
                          {bot.status === "active" ? "Running" : bot.status === "training" ? "Training" : "Paused"}
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
                          disabled={bot.status === "training"}
                        >
                          {bot.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {filteredBots.length === 0 && (
              <Card className="bg-white/10 border-white/20 text-white">
                <CardContent className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bot className="w-8 h-8 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">No Bots Found</h3>
                  <p className="text-gray-400 mb-6">
                    {searchTerm || filterStatus !== "all" || filterType !== "all"
                      ? "Try adjusting your search or filters"
                      : "Create your first trading bot to get started"}
                  </p>
                  <CreateBotDialog />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Traditional Bots Tab */}
          <TabsContent value="traditional" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {bots
                .filter((bot) => bot.type === "traditional")
                .map((bot) => (
                  <Card
                    key={bot.id}
                    className="bg-white/10 border-white/20 text-white hover:border-[#30D5C8]/50 transition-colors"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                            <Bot className="w-6 h-6" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{bot.name}</CardTitle>
                            <p className="text-sm text-gray-400">
                              {bot.strategy} • {bot.pair}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(bot.status)}>{bot.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-400">Profit</p>
                          <p className={`text-lg font-bold ${bot.profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                            ${bot.profit.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Win Rate</p>
                          <p className="text-lg font-bold">{bot.winRate}%</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                        <Switch checked={bot.status === "active"} onCheckedChange={() => toggleBotStatus(bot.id)} />
                        <Button variant="ghost" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          {/* AI Bots Tab */}
          <TabsContent value="ai" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {bots
                .filter((bot) => bot.type === "ai")
                .map((bot) => (
                  <Card
                    key={bot.id}
                    className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20 text-white"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                            {getBotTypeIcon(bot.type, bot.strategy)}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{bot.name}</CardTitle>
                            <p className="text-sm text-gray-400">
                              {bot.strategy} • {bot.pair}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(bot.status)}>{bot.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-400">Total Return</p>
                          <p className={`text-lg font-bold ${bot.profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {bot.profit >= 0 ? "+" : ""}${bot.profit.toFixed(2)}
                          </p>
                          <p className="text-xs text-green-400">+{bot.profitPercent}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Win Rate</p>
                          <p className="text-lg font-bold">{bot.winRate}%</p>
                          <p className="text-xs text-gray-400">{bot.trades} trades</p>
                        </div>
                      </div>

                      {bot.aiMetrics && (
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-400">AI Confidence</span>
                              <span>{bot.aiMetrics.confidence}%</span>
                            </div>
                            <Progress value={bot.aiMetrics.confidence} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-400">Learning Progress</span>
                              <span>{bot.aiMetrics.learningProgress}%</span>
                            </div>
                            <Progress value={bot.aiMetrics.learningProgress} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-400">Prediction Accuracy</span>
                              <span>{bot.aiMetrics.predictionAccuracy}%</span>
                            </div>
                            <Progress value={bot.aiMetrics.predictionAccuracy} className="h-2" />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={bot.status === "active"}
                            onCheckedChange={() => toggleBotStatus(bot.id)}
                            disabled={bot.status === "training"}
                          />
                          <span className="text-sm">
                            {bot.status === "training" ? "Training..." : bot.status === "active" ? "Running" : "Paused"}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" disabled={bot.status === "training"}>
                            {bot.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>

            {/* Create AI Bot CTA */}
            <Card className="border-dashed border-2 border-purple-500/25 bg-gradient-to-br from-purple-500/5 to-blue-500/5">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Brain className="w-16 h-16 text-purple-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Create AI Trading Bot</h3>
                <p className="text-gray-400 text-center mb-6 max-w-md">
                  Deploy advanced AI algorithms with neural networks, deep learning, and reinforcement learning
                </p>
                <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                  <Brain className="w-4 h-4 mr-2" />
                  Create AI Bot
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/10 border-white/20 text-white">
                <CardHeader>
                  <CardTitle>Portfolio Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total Investment</span>
                      <span className="font-bold">${totalInvestment.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Total Profit</span>
                      <span className={`font-bold ${totalProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                        ${totalProfit.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>ROI</span>
                      <span className="font-bold text-green-400">
                        {((totalProfit / totalInvestment) * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average Win Rate</span>
                      <span className="font-bold">{avgWinRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/20 text-white">
                <CardHeader>
                  <CardTitle>Bot Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Traditional Bots</span>
                      <span className="font-bold">{bots.filter((b) => b.type === "traditional").length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>AI Bots</span>
                      <span className="font-bold text-purple-400">{aiBots}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Active Bots</span>
                      <span className="font-bold text-green-400">{activeBots}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Paused Bots</span>
                      <span className="font-bold text-yellow-400">
                        {bots.filter((b) => b.status === "paused").length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Chart Placeholder */}
            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle>Performance Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-600 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400">Performance chart will be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Strategies Tab */}
          <TabsContent value="strategies" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* DCA Strategy */}
              <Card className="bg-white/10 border-white/20 text-white hover:border-blue-500/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle>DCA Strategy</CardTitle>
                      <p className="text-sm text-gray-400">Dollar Cost Averaging</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-300 mb-4">
                    Automatically buy crypto at regular intervals regardless of price to reduce volatility impact.
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Risk Level:</span>
                      <Badge className="bg-green-500/10 text-green-400">Low</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Time Frame:</span>
                      <span>Long-term</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Min Investment:</span>
                      <span>$100</span>
                    </div>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">Create DCA Bot</Button>
                </CardContent>
              </Card>

              {/* Grid Trading Strategy */}
              <Card className="bg-white/10 border-white/20 text-white hover:border-[#30D5C8]/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg bg-[#30D5C8]/10 text-[#30D5C8] flex items-center justify-center">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle>Grid Trading</CardTitle>
                      <p className="text-sm text-gray-400">Automated Grid Orders</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-300 mb-4">
                    Place buy and sell orders at predetermined intervals to profit from market volatility.
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Risk Level:</span>
                      <Badge className="bg-yellow-500/10 text-yellow-400">Medium</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Time Frame:</span>
                      <span>Short-Medium</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Min Investment:</span>
                      <span>$500</span>
                    </div>
                  </div>
                  <Button className="w-full bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E]">Create Grid Bot</Button>
                </CardContent>
              </Card>

              {/* AI Neural Network Strategy */}
              <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20 text-white hover:border-purple-500/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                      <Brain className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle>Neural Network AI</CardTitle>
                      <p className="text-sm text-gray-400">Advanced AI Trading</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-300 mb-4">
                    Use advanced neural networks for pattern recognition and intelligent trading decisions.
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Risk Level:</span>
                      <Badge className="bg-yellow-500/10 text-yellow-400">Medium</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Time Frame:</span>
                      <span>Adaptive</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Min Investment:</span>
                      <span>$1,000</span>
                    </div>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                    Create AI Bot
                  </Button>
                </CardContent>
              </Card>

              {/* Scalping Strategy */}
              <Card className="bg-white/10 border-white/20 text-white hover:border-red-500/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle>Scalping Bot</CardTitle>
                      <p className="text-sm text-gray-400">High-Frequency Trading</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-300 mb-4">
                    Execute high-frequency trades to capture small price movements throughout the day.
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Risk Level:</span>
                      <Badge className="bg-red-500/10 text-red-400">High</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Time Frame:</span>
                      <span>Very Short</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Min Investment:</span>
                      <span>$1,000</span>
                    </div>
                  </div>
                  <Button className="w-full bg-red-600 hover:bg-red-700">Create Scalping Bot</Button>
                </CardContent>
              </Card>

              {/* Momentum Strategy */}
              <Card className="bg-white/10 border-white/20 text-white hover:border-green-500/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center">
                      <Target className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle>Momentum Trading</CardTitle>
                      <p className="text-sm text-gray-400">Trend Following</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-300 mb-4">
                    Follow strong price trends and ride the momentum for maximum gains with proper risk management.
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Risk Level:</span>
                      <Badge className="bg-orange-500/10 text-orange-400">Medium-High</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Time Frame:</span>
                      <span>Short-Medium</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Min Investment:</span>
                      <span>$300</span>
                    </div>
                  </div>
                  <Button className="w-full bg-green-600 hover:bg-green-700">Create Momentum Bot</Button>
                </CardContent>
              </Card>

              {/* Arbitrage Strategy */}
              <Card className="bg-white/10 border-white/20 text-white hover:border-purple-500/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle>Arbitrage Bot</CardTitle>
                      <p className="text-sm text-gray-400">Risk-Free Profits</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-300 mb-4">
                    Exploit price differences between exchanges for consistent, low-risk profits.
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Risk Level:</span>
                      <Badge className="bg-green-500/10 text-green-400">Low</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Time Frame:</span>
                      <span>Instant</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Min Investment:</span>
                      <span>$2,000</span>
                    </div>
                  </div>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">Create Arbitrage Bot</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
