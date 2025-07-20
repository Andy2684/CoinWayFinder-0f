"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Bot, Brain, TrendingUp, Zap, Settings, Play, Pause, BarChart3, DollarSign, Target } from "lucide-react"

interface AIBot {
  id: string
  name: string
  type: "neural_network" | "deep_learning" | "reinforcement" | "ensemble"
  status: "active" | "paused" | "training" | "optimizing"
  performance: {
    totalReturn: number
    winRate: number
    sharpeRatio: number
    maxDrawdown: number
    trades: number
    accuracy: number
  }
  aiMetrics: {
    confidence: number
    learningProgress: number
    adaptationRate: number
    predictionAccuracy: number
  }
  tradingPairs: string[]
  investment: number
  createdAt: string
  lastUpdate: string
}

export function AIBotDashboard() {
  const [bots, setBots] = useState<AIBot[]>([
    {
      id: "ai-bot-1",
      name: "Neural Trend Predictor",
      type: "neural_network",
      status: "active",
      performance: {
        totalReturn: 34.7,
        winRate: 78.3,
        sharpeRatio: 2.4,
        maxDrawdown: -8.2,
        trades: 247,
        accuracy: 82.1,
      },
      aiMetrics: {
        confidence: 87,
        learningProgress: 94,
        adaptationRate: 76,
        predictionAccuracy: 84,
      },
      tradingPairs: ["BTC/USDT", "ETH/USDT", "BNB/USDT"],
      investment: 10000,
      createdAt: "2024-01-15",
      lastUpdate: "2 minutes ago",
    },
    {
      id: "ai-bot-2",
      name: "Deep Learning Scalper",
      type: "deep_learning",
      status: "active",
      performance: {
        totalReturn: 28.9,
        winRate: 71.5,
        sharpeRatio: 1.9,
        maxDrawdown: -12.1,
        trades: 1834,
        accuracy: 75.8,
      },
      aiMetrics: {
        confidence: 92,
        learningProgress: 88,
        adaptationRate: 89,
        predictionAccuracy: 79,
      },
      tradingPairs: ["BTC/USDT", "ETH/USDT", "SOL/USDT", "ADA/USDT"],
      investment: 15000,
      createdAt: "2024-01-10",
      lastUpdate: "1 minute ago",
    },
    {
      id: "ai-bot-3",
      name: "Reinforcement Learner",
      type: "reinforcement",
      status: "training",
      performance: {
        totalReturn: 15.2,
        winRate: 68.9,
        sharpeRatio: 1.6,
        maxDrawdown: -6.7,
        trades: 89,
        accuracy: 71.2,
      },
      aiMetrics: {
        confidence: 73,
        learningProgress: 45,
        adaptationRate: 82,
        predictionAccuracy: 68,
      },
      tradingPairs: ["ETH/USDT", "MATIC/USDT"],
      investment: 5000,
      createdAt: "2024-01-20",
      lastUpdate: "5 minutes ago",
    },
    {
      id: "ai-bot-4",
      name: "Ensemble AI Master",
      type: "ensemble",
      status: "optimizing",
      performance: {
        totalReturn: 42.1,
        winRate: 81.7,
        sharpeRatio: 2.8,
        maxDrawdown: -5.3,
        trades: 156,
        accuracy: 86.4,
      },
      aiMetrics: {
        confidence: 95,
        learningProgress: 97,
        adaptationRate: 91,
        predictionAccuracy: 89,
      },
      tradingPairs: ["BTC/USDT", "ETH/USDT", "BNB/USDT", "SOL/USDT", "ADA/USDT"],
      investment: 25000,
      createdAt: "2024-01-05",
      lastUpdate: "30 seconds ago",
    },
  ])

  const [selectedBot, setSelectedBot] = useState<AIBot | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      case "paused":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
      case "training":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "optimizing":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20"
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20"
    }
  }

  const getBotTypeIcon = (type: string) => {
    switch (type) {
      case "neural_network":
        return <Brain className="w-5 h-5" />
      case "deep_learning":
        return <Zap className="w-5 h-5" />
      case "reinforcement":
        return <Target className="w-5 h-5" />
      case "ensemble":
        return <BarChart3 className="w-5 h-5" />
      default:
        return <Bot className="w-5 h-5" />
    }
  }

  const toggleBotStatus = (botId: string) => {
    setBots(
      bots.map((bot) => (bot.id === botId ? { ...bot, status: bot.status === "active" ? "paused" : "active" } : bot)),
    )
  }

  return (
    <div className="space-y-6">
      {/* AI Bots Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active AI Bots</p>
                <p className="text-2xl font-bold text-blue-400">
                  {bots.filter((bot) => bot.status === "active").length}
                </p>
              </div>
              <Brain className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total AI Return</p>
                <p className="text-2xl font-bold text-green-400">
                  +{bots.reduce((sum, bot) => sum + bot.performance.totalReturn, 0).toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg AI Accuracy</p>
                <p className="text-2xl font-bold text-purple-400">
                  {(bots.reduce((sum, bot) => sum + bot.aiMetrics.predictionAccuracy, 0) / bots.length).toFixed(1)}%
                </p>
              </div>
              <Target className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Investment</p>
                <p className="text-2xl font-bold text-orange-400">
                  ${bots.reduce((sum, bot) => sum + bot.investment, 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Bots List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {bots.map((bot) => (
          <Card
            key={bot.id}
            className="bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-colors"
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    {getBotTypeIcon(bot.type)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{bot.name}</CardTitle>
                    <p className="text-sm text-muted-foreground capitalize">{bot.type.replace("_", " ")} AI</p>
                  </div>
                </div>
                <Badge className={getStatusColor(bot.status)}>{bot.status}</Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Performance Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Return</p>
                  <p
                    className={`text-lg font-bold ${bot.performance.totalReturn >= 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    {bot.performance.totalReturn >= 0 ? "+" : ""}
                    {bot.performance.totalReturn}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Win Rate</p>
                  <p className="text-lg font-bold">{bot.performance.winRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Trades</p>
                  <p className="text-lg font-bold">{bot.performance.trades}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Sharpe Ratio</p>
                  <p className="text-lg font-bold">{bot.performance.sharpeRatio}</p>
                </div>
              </div>

              {/* AI Metrics */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>AI Confidence</span>
                    <span>{bot.aiMetrics.confidence}%</span>
                  </div>
                  <Progress value={bot.aiMetrics.confidence} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Learning Progress</span>
                    <span>{bot.aiMetrics.learningProgress}%</span>
                  </div>
                  <Progress value={bot.aiMetrics.learningProgress} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Prediction Accuracy</span>
                    <span>{bot.aiMetrics.predictionAccuracy}%</span>
                  </div>
                  <Progress value={bot.aiMetrics.predictionAccuracy} className="h-2" />
                </div>
              </div>

              {/* Trading Pairs */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Trading Pairs</p>
                <div className="flex flex-wrap gap-1">
                  {bot.tradingPairs.map((pair) => (
                    <Badge key={pair} variant="outline" className="text-xs">
                      {pair}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-xs text-muted-foreground">Updated {bot.lastUpdate}</div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedBot(bot)}>
                    <Settings className="w-4 h-4 mr-1" />
                    Configure
                  </Button>
                  <Button
                    variant={bot.status === "active" ? "destructive" : "default"}
                    size="sm"
                    onClick={() => toggleBotStatus(bot.id)}
                    disabled={bot.status === "training" || bot.status === "optimizing"}
                  >
                    {bot.status === "active" ? (
                      <>
                        <Pause className="w-4 h-4 mr-1" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-1" />
                        Start
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create New AI Bot Button */}
      <Card className="border-dashed border-2 border-muted-foreground/25 hover:border-primary/50 transition-colors">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Brain className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Create New AI Trading Bot</h3>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            Deploy advanced AI algorithms to automate your trading strategies with machine learning and neural networks.
          </p>
          <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
            <Brain className="w-4 h-4 mr-2" />
            Create AI Bot
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
