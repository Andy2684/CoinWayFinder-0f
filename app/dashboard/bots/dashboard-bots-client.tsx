"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Play, Pause, Settings } from "lucide-react"
import Link from "next/link"

export default function DashboardBotsClient() {
  const [bots] = useState([
    {
      id: 1,
      name: "BTC Scalper Pro",
      status: "active",
      profit: 1234.56,
      trades: 45,
      winRate: 78.5,
    },
    {
      id: 2,
      name: "ETH Grid Bot",
      status: "paused",
      profit: -123.45,
      trades: 23,
      winRate: 65.2,
    },
    {
      id: 3,
      name: "Altcoin Hunter",
      status: "active",
      profit: 567.89,
      trades: 67,
      winRate: 82.1,
    },
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-white">Trading Bots</h1>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle className="text-lg">Total Bots</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{bots.length}</div>
              <p className="text-sm text-gray-400">2 active, 1 paused</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle className="text-lg">Total Profit</CardTitle>
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

        {/* Bots List */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Your Bots</h2>
            <Button className="bg-blue-600 hover:bg-blue-700">Create New Bot</Button>
          </div>

          <div className="grid gap-6">
            {bots.map((bot) => (
              <Card key={bot.id} className="bg-white/10 border-white/20 text-white">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{bot.name}</CardTitle>
                      <CardDescription className="text-gray-300">{bot.trades} trades executed</CardDescription>
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
        </div>
      </div>
    </div>
  )
}
