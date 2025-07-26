"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Play, Pause, Settings, TrendingUp, Activity } from "lucide-react"
import Link from "next/link"

export default function BotsClient() {
  const [bots] = useState([
    {
      id: 1,
      name: "BTC Scalper Pro",
      status: "active",
      profit: 1234.56,
      trades: 45,
      winRate: 78.5,
      strategy: "Scalping",
    },
    {
      id: 2,
      name: "ETH Grid Bot",
      status: "paused",
      profit: -123.45,
      trades: 23,
      winRate: 65.2,
      strategy: "Grid Trading",
    },
    {
      id: 3,
      name: "Altcoin Hunter",
      status: "active",
      profit: 567.89,
      trades: 67,
      winRate: 82.1,
      strategy: "Momentum",
    },
  ])

  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-white">Trading Bots</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/10 border-white/20">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white/20">
              Overview
            </TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:bg-white/20">
              Active Bots
            </TabsTrigger>
            <TabsTrigger value="create" className="data-[state=active]:bg-white/20">
              Create Bot
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white/10 border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Total Bots
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{bots.length}</div>
                  <p className="text-sm text-gray-400">{bots.filter((b) => b.status === "active").length} active</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Total Profit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-400">
                    ${bots.reduce((sum, bot) => sum + bot.profit, 0).toFixed(2)}
                  </div>
                  <p className="text-sm text-gray-400">This month</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="text-lg">Avg Win Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-400">
                    {(bots.reduce((sum, bot) => sum + bot.winRate, 0) / bots.length).toFixed(1)}%
                  </div>
                  <p className="text-sm text-gray-400">Across all bots</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle>Recent Bot Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">BTC Scalper Pro executed trade</p>
                      <p className="text-sm text-gray-400">2 minutes ago</p>
                    </div>
                    <Badge className="bg-green-600">+$45.20</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Altcoin Hunter started new position</p>
                      <p className="text-sm text-gray-400">15 minutes ago</p>
                    </div>
                    <Badge variant="outline" className="border-blue-400 text-blue-400">
                      Active
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Active Bots</h2>
              <Button className="bg-blue-600 hover:bg-blue-700">Create New Bot</Button>
            </div>

            <div className="grid gap-6">
              {bots.map((bot) => (
                <Card key={bot.id} className="bg-white/10 border-white/20 text-white">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{bot.name}</CardTitle>
                        <CardDescription className="text-gray-300">
                          {bot.strategy} • {bot.trades} trades executed
                        </CardDescription>
                      </div>
                      <Badge className={bot.status === "active" ? "bg-green-600" : "bg-yellow-600"}>{bot.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-400">Profit/Loss</p>
                        <p className={`text-lg font-bold ${bot.profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {bot.profit >= 0 ? "+" : ""}${bot.profit.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Win Rate</p>
                        <p className="text-lg font-bold text-blue-400">{bot.winRate}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Total Trades</p>
                        <p className="text-lg font-bold">{bot.trades}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={bot.status === "active" ? "destructive" : "default"}
                        className={bot.status === "active" ? "" : "bg-green-600 hover:bg-green-700"}
                      >
                        {bot.status === "active" ? (
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
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle>Create New Trading Bot</CardTitle>
                <CardDescription className="text-gray-300">Set up a new automated trading strategy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Bot Name</label>
                    <input
                      type="text"
                      placeholder="Enter bot name"
                      className="w-full p-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Strategy</label>
                    <select className="w-full p-2 bg-white/10 border border-white/20 rounded text-white">
                      <option value="">Select strategy</option>
                      <option value="scalping">Scalping</option>
                      <option value="grid">Grid Trading</option>
                      <option value="momentum">Momentum</option>
                      <option value="arbitrage">Arbitrage</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Trading Pair</label>
                    <select className="w-full p-2 bg-white/10 border border-white/20 rounded text-white">
                      <option value="">Select pair</option>
                      <option value="BTC/USDT">BTC/USDT</option>
                      <option value="ETH/USDT">ETH/USDT</option>
                      <option value="BNB/USDT">BNB/USDT</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Initial Capital</label>
                    <input
                      type="number"
                      placeholder="1000"
                      className="w-full p-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400"
                    />
                  </div>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Create Bot</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
