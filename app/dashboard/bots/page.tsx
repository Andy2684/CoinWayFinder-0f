"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bot, Play, Pause, Settings, TrendingUp, Plus } from "lucide-react"

export default function BotsPage() {
  const bots = [
    {
      id: 1,
      name: "BTC Scalper",
      strategy: "Grid Trading",
      pair: "BTC/USDT",
      status: "active",
      profit: "+$1,234.56",
      profitPercent: "+12.3%",
      trades: 45,
    },
    {
      id: 2,
      name: "ETH DCA Bot",
      strategy: "DCA",
      pair: "ETH/USDT",
      status: "paused",
      profit: "+$567.89",
      profitPercent: "+8.7%",
      trades: 23,
    },
    {
      id: 3,
      name: "Altcoin Momentum",
      strategy: "Momentum",
      pair: "ADA/USDT",
      status: "active",
      profit: "-$123.45",
      profitPercent: "-2.1%",
      trades: 12,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trading Bots</h1>
          <p className="text-gray-600">Manage your automated trading strategies</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create New Bot
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {bots.map((bot) => (
          <Card key={bot.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{bot.name}</CardTitle>
                <Badge
                  variant={bot.status === "active" ? "default" : "secondary"}
                  className={bot.status === "active" ? "bg-green-500" : ""}
                >
                  {bot.status}
                </Badge>
              </div>
              <CardDescription>
                {bot.strategy} • {bot.pair}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Profit</span>
                <div className="text-right">
                  <p className={`font-medium ${bot.profit.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                    {bot.profit}
                  </p>
                  <p className={`text-xs ${bot.profitPercent.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                    {bot.profitPercent}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Trades</span>
                <span className="font-medium">{bot.trades}</span>
              </div>

              <div className="flex items-center space-x-2 pt-4">
                <Button size="sm" variant={bot.status === "active" ? "outline" : "default"} className="flex-1">
                  {bot.status === "active" ? (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Start
                    </>
                  )}
                </Button>
                <Button size="sm" variant="outline">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <TrendingUp className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {bots.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Bot className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No trading bots yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first automated trading bot to start earning passive income.
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Bot
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
