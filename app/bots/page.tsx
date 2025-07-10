"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreateBotDialog } from "@/components/bots/create-bot-dialog"
import { BotPerformance } from "@/components/bots/bot-performance"
import { BotStrategies } from "@/components/bots/bot-strategies"
import { ActiveBots } from "@/components/bots/active-bots"
import { Bot, Play, Pause, Square, TrendingUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { BotErrorBoundary } from "@/components/error-boundaries/bot-error-boundary"
import { BotsOverview } from "@/components/bots/bots-overview"

interface TradingBot {
  id: string
  name: string
  strategy: string
  status: "running" | "paused" | "stopped"
  pnl: number
  trades: number
  winRate: number
  createdAt: string
}

export default function BotsPage() {
  const [bots, setBots] = useState<TradingBot[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchBots()
  }, [])

  const fetchBots = async () => {
    try {
      const response = await fetch("/api/bots")
      if (response.ok) {
        const data = await response.json()
        setBots(data.bots || [])
      }
    } catch (error) {
      console.error("Failed to fetch bots:", error)
      toast({
        title: "Error",
        description: "Failed to load trading bots",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBotAction = async (botId: string, action: "start" | "pause" | "stop") => {
    try {
      const response = await fetch(`/api/bots/${botId}/${action}`, {
        method: "POST",
      })

      if (response.ok) {
        await fetchBots() // Refresh bots list
        toast({
          title: "Success",
          description: `Bot ${action}ed successfully`,
        })
      } else {
        throw new Error(`Failed to ${action} bot`)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} bot`,
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      case "paused":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
      case "stopped":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20"
    }
  }

  return (
    <BotErrorBoundary>
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Trading Bots</h1>
          <p className="text-muted-foreground">Create and manage your automated trading strategies</p>
        </div>

        <BotsOverview />

        {/* Bot Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Bots</p>
                  <p className="text-2xl font-bold text-white">{bots.length}</p>
                </div>
                <Bot className="w-8 h-8 text-teal-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Running</p>
                  <p className="text-2xl font-bold text-green-400">
                    {bots.filter((bot) => bot.status === "running").length}
                  </p>
                </div>
                <Play className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total P&L</p>
                  <p className="text-2xl font-bold text-green-400">
                    +${bots.reduce((sum, bot) => sum + bot.pnl, 0).toFixed(2)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Avg Win Rate</p>
                  <p className="text-2xl font-bold text-white">
                    {bots.length > 0 ? (bots.reduce((sum, bot) => sum + bot.winRate, 0) / bots.length).toFixed(1) : 0}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bots List */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Your Trading Bots</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400 mx-auto"></div>
                <p className="text-slate-400 mt-2">Loading bots...</p>
              </div>
            ) : bots.length === 0 ? (
              <div className="text-center py-8">
                <Bot className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">No trading bots created yet</p>
                <Button onClick={() => setCreateDialogOpen(true)} className="bg-teal-500 hover:bg-teal-600">
                  Create Your First Bot
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {bots.map((bot) => (
                  <div
                    key={bot.id}
                    className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center">
                        <Bot className="w-5 h-5 text-teal-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{bot.name}</h3>
                        <p className="text-slate-400 text-sm">{bot.strategy} Strategy</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="text-white font-medium">
                          {bot.pnl >= 0 ? "+" : ""}${bot.pnl.toFixed(2)}
                        </p>
                        <p className="text-slate-400 text-sm">{bot.trades} trades</p>
                      </div>

                      <Badge variant="outline" className={getStatusColor(bot.status)}>
                        {bot.status}
                      </Badge>

                      <div className="flex space-x-2">
                        {bot.status === "stopped" && (
                          <Button
                            size="sm"
                            onClick={() => handleBotAction(bot.id, "start")}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                        {bot.status === "running" && (
                          <Button
                            size="sm"
                            onClick={() => handleBotAction(bot.id, "pause")}
                            className="bg-yellow-500 hover:bg-yellow-600"
                          >
                            <Pause className="w-4 h-4" />
                          </Button>
                        )}
                        {bot.status === "paused" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleBotAction(bot.id, "start")}
                              className="bg-green-500 hover:bg-green-600"
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleBotAction(bot.id, "stop")}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              <Square className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Components */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BotPerformance />
          <BotStrategies />
        </div>

        <ActiveBots />

        <CreateBotDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onBotCreated={fetchBots} />
      </div>
    </BotErrorBoundary>
  )
}
