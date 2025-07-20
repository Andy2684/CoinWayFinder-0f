"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Plus, Play, Pause, Settings, TrendingUp, Bot, DollarSign } from "lucide-react"
import { BackToDashboard } from "@/components/back-to-dashboard"

export default function BotsPage() {
  const [bots] = useState([
    {
      id: 1,
      name: "BTC Scalper Pro",
      strategy: "Scalping",
      status: "active",
      profit: 2345.67,
      profitPercent: 12.3,
      trades: 156,
      winRate: 73.2,
      pair: "BTC/USDT",
    },
    {
      id: 2,
      name: "ETH Grid Bot",
      strategy: "Grid Trading",
      status: "active",
      profit: 1234.56,
      profitPercent: 8.7,
      trades: 89,
      winRate: 68.5,
      pair: "ETH/USDT",
    },
    {
      id: 3,
      name: "DCA Strategy",
      strategy: "DCA",
      status: "paused",
      profit: 987.43,
      profitPercent: 5.2,
      trades: 45,
      winRate: 82.1,
      pair: "ADA/USDT",
    },
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackToDashboard />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Trading Bots</h1>
            <p className="text-muted-foreground">Manage your automated trading strategies</p>
          </div>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create New Bot
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bots</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bots.length}</div>
            <p className="text-xs text-muted-foreground">
              {bots.filter((bot) => bot.status === "active").length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +${bots.reduce((sum, bot) => sum + bot.profit, 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">All time earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bots.reduce((sum, bot) => sum + bot.trades, 0)}</div>
            <p className="text-xs text-muted-foreground">Executed trades</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Win Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(bots.reduce((sum, bot) => sum + bot.winRate, 0) / bots.length).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Success rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Bots List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Bots</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="paused">Paused</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {bots.map((bot) => (
              <Card key={bot.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {bot.name}
                        <Badge variant={bot.status === "active" ? "default" : "secondary"}>{bot.status}</Badge>
                      </CardTitle>
                      <CardDescription>
                        {bot.strategy} • {bot.pair}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        {bot.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-sm font-medium">Profit</p>
                      <p className={`text-lg font-bold ${bot.profit > 0 ? "text-green-600" : "text-red-600"}`}>
                        ${bot.profit.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {bot.profitPercent > 0 ? "+" : ""}
                        {bot.profitPercent}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Trades</p>
                      <p className="text-lg font-bold">{bot.trades}</p>
                      <p className="text-xs text-muted-foreground">Total executed</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Win Rate</p>
                      <p className="text-lg font-bold">{bot.winRate}%</p>
                      <Progress value={bot.winRate} className="mt-1" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <p className="text-lg font-bold capitalize">{bot.status}</p>
                      <p className="text-xs text-muted-foreground">{bot.status === "active" ? "Running" : "Stopped"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4">
            {bots
              .filter((bot) => bot.status === "active")
              .map((bot) => (
                <Card key={bot.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {bot.name}
                          <Badge variant="default">Active</Badge>
                        </CardTitle>
                        <CardDescription>
                          {bot.strategy} • {bot.pair}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Pause className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div>
                        <p className="text-sm font-medium">Profit</p>
                        <p className="text-lg font-bold text-green-600">${bot.profit.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">+{bot.profitPercent}%</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Trades</p>
                        <p className="text-lg font-bold">{bot.trades}</p>
                        <p className="text-xs text-muted-foreground">Total executed</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Win Rate</p>
                        <p className="text-lg font-bold">{bot.winRate}%</p>
                        <Progress value={bot.winRate} className="mt-1" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Status</p>
                        <p className="text-lg font-bold text-green-600">Running</p>
                        <p className="text-xs text-muted-foreground">Active trading</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="paused" className="space-y-4">
          <div className="grid gap-4">
            {bots
              .filter((bot) => bot.status === "paused")
              .map((bot) => (
                <Card key={bot.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {bot.name}
                          <Badge variant="secondary">Paused</Badge>
                        </CardTitle>
                        <CardDescription>
                          {bot.strategy} • {bot.pair}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div>
                        <p className="text-sm font-medium">Profit</p>
                        <p className="text-lg font-bold text-green-600">${bot.profit.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">+{bot.profitPercent}%</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Trades</p>
                        <p className="text-lg font-bold">{bot.trades}</p>
                        <p className="text-xs text-muted-foreground">Total executed</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Win Rate</p>
                        <p className="text-lg font-bold">{bot.winRate}%</p>
                        <Progress value={bot.winRate} className="mt-1" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Status</p>
                        <p className="text-lg font-bold text-gray-600">Paused</p>
                        <p className="text-xs text-muted-foreground">Not trading</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
