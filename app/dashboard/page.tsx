"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, DollarSign, Bot, Activity, Plus } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

export default function DashboardPage() {
  const { user } = useAuth()

  const stats = [
    {
      title: "Total Portfolio Value",
      value: "$12,345.67",
      change: "+5.2%",
      trend: "up",
      icon: DollarSign,
    },
    {
      title: "Active Bots",
      value: "3",
      change: "+1",
      trend: "up",
      icon: Bot,
    },
    {
      title: "24h P&L",
      value: "+$234.56",
      change: "+12.3%",
      trend: "up",
      icon: TrendingUp,
    },
    {
      title: "Win Rate",
      value: "68.5%",
      change: "-2.1%",
      trend: "down",
      icon: Activity,
    },
  ]

  const recentTrades = [
    { pair: "BTC/USDT", type: "BUY", amount: "0.025", price: "$42,150", pnl: "+$125.50", status: "completed" },
    { pair: "ETH/USDT", type: "SELL", amount: "1.5", price: "$2,850", pnl: "-$45.20", status: "completed" },
    { pair: "ADA/USDT", type: "BUY", amount: "1000", price: "$0.45", pnl: "+$23.10", status: "pending" },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.firstName}!</h1>
          <p className="text-gray-600">Here's what's happening with your trading portfolio today.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create New Bot
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {stat.trend === "up" ? (
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                )}
                <span className={stat.trend === "up" ? "text-green-500" : "text-red-500"}>{stat.change}</span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trades">Recent Trades</TabsTrigger>
          <TabsTrigger value="bots">Active Bots</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Performance</CardTitle>
                <CardDescription>Your portfolio performance over the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center text-gray-500">
                  Chart placeholder - Portfolio performance graph
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Assets</CardTitle>
                <CardDescription>Your best performing assets this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">BTC</span>
                    <Badge variant="secondary" className="text-green-600">
                      +15.2%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">ETH</span>
                    <Badge variant="secondary" className="text-green-600">
                      +8.7%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">ADA</span>
                    <Badge variant="secondary" className="text-red-600">
                      -3.1%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Trades</CardTitle>
              <CardDescription>Your latest trading activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTrades.map((trade, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-4 last:border-b-0">
                    <div className="flex items-center space-x-4">
                      <Badge variant={trade.type === "BUY" ? "default" : "secondary"}>{trade.type}</Badge>
                      <div>
                        <p className="font-medium">{trade.pair}</p>
                        <p className="text-sm text-gray-500">
                          {trade.amount} @ {trade.price}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${trade.pnl.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                        {trade.pnl}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {trade.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bots" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Trading Bots</CardTitle>
              <CardDescription>Manage your automated trading strategies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Bot className="mx-auto h-12 w-12 mb-4" />
                <p>No active bots yet</p>
                <Button className="mt-4">Create Your First Bot</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
