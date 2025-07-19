"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, DollarSign, Activity, Bot, CheckCircle, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { ActiveStrategies } from "@/components/dashboard/active-strategies"
import { PnLTracking } from "@/components/dashboard/pnl-tracking"
import { TradeLogs } from "@/components/dashboard/trade-logs"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { PortfolioAnalytics } from "@/components/dashboard/portfolio-analytics"
import { RiskManagement } from "@/components/dashboard/risk-management"
import { LiveMarketData } from "@/components/dashboard/live-market-data"
import { ProtectedRoute } from "@/components/auth/protected-route"

function DashboardContent() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalBalance: 0,
    todayPnL: 0,
    activeBots: 0,
    successRate: 0,
    totalTrades: 0,
    winRate: 0,
  })

  useEffect(() => {
    // Simulate loading and fetch real data
    const timer = setTimeout(() => {
      setStats({
        totalBalance: 45678.9,
        todayPnL: 1234.56,
        activeBots: 8,
        successRate: 87.5,
        totalTrades: 156,
        winRate: 73.2,
      })
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const quickStats = [
    {
      title: "Total Balance",
      value: `$${stats.totalBalance.toLocaleString()}`,
      change: "+12.5%",
      changeType: "positive" as const,
      icon: DollarSign,
      description: "Portfolio value",
    },
    {
      title: "Today's P&L",
      value: `$${stats.todayPnL.toLocaleString()}`,
      change: "+5.8%",
      changeType: "positive" as const,
      icon: TrendingUp,
      description: "24h performance",
    },
    {
      title: "Active Bots",
      value: stats.activeBots.toString(),
      change: "2 new",
      changeType: "neutral" as const,
      icon: Bot,
      description: "Running strategies",
    },
    {
      title: "Success Rate",
      value: `${stats.successRate}%`,
      change: "+2.1%",
      changeType: "positive" as const,
      icon: Activity,
      description: "Win percentage",
    },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-20 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Navigation />

      <div className="container mx-auto px-4 pt-20 pb-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Trading Dashboard</h1>
            <p className="text-muted-foreground">Monitor your trading performance and manage your strategies</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-emerald-600 border-emerald-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              All Systems Operational
            </Badge>
            <Button className="bg-emerald-600 hover:bg-emerald-700 transition-colors duration-300">
              <TrendingUp className="w-4 h-4 mr-2" />
              New Strategy
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => (
            <Card
              key={stat.title}
              className="card-hover crypto-gradient border-emerald-100 dark:border-emerald-900/20"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
                    <stat.icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div
                    className={`flex items-center text-sm font-medium ${
                      stat.changeType === "positive"
                        ? "text-emerald-600"
                        : stat.changeType === "negative"
                          ? "text-red-500"
                          : "text-muted-foreground"
                    }`}
                  >
                    {stat.changeType === "positive" && <ArrowUpRight className="w-3 h-3 mr-1" />}
                    {stat.changeType === "negative" && <ArrowDownRight className="w-3 h-3 mr-1" />}
                    {stat.change}
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
            <TabsTrigger value="overview" className="transition-all duration-300">
              Overview
            </TabsTrigger>
            <TabsTrigger value="strategies" className="transition-all duration-300">
              Strategies
            </TabsTrigger>
            <TabsTrigger value="pnl" className="transition-all duration-300">
              P&L
            </TabsTrigger>
            <TabsTrigger value="trades" className="transition-all duration-300">
              Trades
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="transition-all duration-300">
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="risk" className="transition-all duration-300">
              Risk
            </TabsTrigger>
            <TabsTrigger value="market" className="transition-all duration-300">
              Market
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <DashboardOverview />
              </div>
              <div>
                <QuickActions />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="strategies">
            <ActiveStrategies />
          </TabsContent>

          <TabsContent value="pnl">
            <PnLTracking />
          </TabsContent>

          <TabsContent value="trades">
            <TradeLogs />
          </TabsContent>

          <TabsContent value="portfolio">
            <PortfolioAnalytics />
          </TabsContent>

          <TabsContent value="risk">
            <RiskManagement />
          </TabsContent>

          <TabsContent value="market">
            <LiveMarketData />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
