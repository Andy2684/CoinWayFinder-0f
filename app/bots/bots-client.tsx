"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ActiveBots } from "@/components/bots/active-bots"
import { BotPerformance } from "@/components/bots/bot-performance"
import { BotStrategies } from "@/components/bots/bot-strategies"
import { BotsOverview } from "@/components/bots/bots-overview"
import { CreateBotDialog } from "@/components/bots/create-bot-dialog"
import { BackToDashboard, FloatingDashboardButton } from "@/components/back-to-dashboard"
import { Plus, Bot, TrendingUp, Activity, AlertCircle } from "lucide-react"
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
  const [createBotOpen, setCreateBotOpen] = useState(false)

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
  const alerts =
    bots.filter((bot) => bot.status === "error").length + bots.filter((bot) => bot.profitPercent < 0).length

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackToDashboard />
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Trading Bots</h1>
                <p className="text-gray-400">Manage your automated trading strategies and monitor performance</p>
              </div>
            </div>
            <Button onClick={() => setCreateBotOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Bot
            </Button>
          </div>

          {/* Bot Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Bots</CardTitle>
                <Bot className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{runningBots}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+2</span> from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {showBalances ? `$${totalProfit.toLocaleString()}` : "••••••"}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+15.2%</span> this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgWinRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+2.1%</span> vs last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Alerts</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{alerts}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-yellow-600">2 warnings</span>, 1 error
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Bot Management Tabs */}
          <Tabs defaultValue="active" className="space-y-4">
            <TabsList>
              <TabsTrigger value="active">Active Bots</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="strategies">Strategies</TabsTrigger>
              <TabsTrigger value="overview">Overview</TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              <ActiveBots bots={bots} handleBotAction={handleBotAction} />
            </TabsContent>

            <TabsContent value="performance">
              <BotPerformance bots={bots} />
            </TabsContent>

            <TabsContent value="strategies">
              <BotStrategies bots={bots} />
            </TabsContent>

            <TabsContent value="overview">
              <BotsOverview bots={bots} />
            </TabsContent>
          </Tabs>

          <CreateBotDialog open={createBotOpen} onOpenChange={setCreateBotOpen} />
          <FloatingDashboardButton />
        </div>
      </div>
    </div>
  )
}
