"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Activity, DollarSign, Target, AlertCircle } from "lucide-react"
import { tradingBotEngine, type TradingBot, type Trade } from "@/lib/trading-bot-engine"

export function BotPerformance() {
  const [bots, setBots] = useState<TradingBot[]>([])
  const [selectedBot, setSelectedBot] = useState<string>("")
  const [trades, setTrades] = useState<Trade[]>([])
  const [portfolioStats, setPortfolioStats] = useState({
    totalBots: 0,
    runningBots: 0,
    totalProfit: 0,
    totalTrades: 0,
    avgWinRate: 0,
  })

  useEffect(() => {
    const loadData = () => {
      const allBots = tradingBotEngine.getAllBots()
      setBots(allBots)

      const stats = tradingBotEngine.getPortfolioStats()
      setPortfolioStats(stats)

      if (selectedBot) {
        const botTrades = tradingBotEngine.getBotTrades(selectedBot)
        setTrades(botTrades)
      }
    }

    loadData()
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [selectedBot])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`
  }

  const getPerformanceColor = (value: number) => {
    return value >= 0 ? "text-green-400" : "text-red-400"
  }

  const selectedBotData = bots.find((bot) => bot.id === selectedBot)

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">📊 Bot Performance</h2>
          <p className="text-gray-300">Track your trading bot performance and analytics</p>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-[#30D5C8]" />
              <div>
                <p className="text-xs text-gray-400">Total Bots</p>
                <p className="text-xl font-bold text-white">{portfolioStats.totalBots}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-xs text-gray-400">Running Bots</p>
                <p className="text-xl font-bold text-white">{portfolioStats.runningBots}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className={`w-5 h-5 ${getPerformanceColor(portfolioStats.totalProfit)}`} />
              <div>
                <p className="text-xs text-gray-400">Total P&L</p>
                <p className={`text-xl font-bold ${getPerformanceColor(portfolioStats.totalProfit)}`}>
                  {formatCurrency(portfolioStats.totalProfit)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-xs text-gray-400">Total Trades</p>
                <p className="text-xl font-bold text-white">{portfolioStats.totalTrades}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-xs text-gray-400">Avg Win Rate</p>
                <p className="text-xl font-bold text-white">{portfolioStats.avgWinRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bot Selection and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bot List */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Your Bots</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {bots.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400">No bots created yet</p>
              </div>
            ) : (
              bots.map((bot) => {
                const netProfit = bot.stats.totalProfit - Math.abs(bot.stats.totalLoss)
                const profitPercent = bot.config.investment > 0 ? (netProfit / bot.config.investment) * 100 : 0

                return (
                  <div
                    key={bot.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedBot === bot.id
                        ? "bg-[#30D5C8]/10 border border-[#30D5C8]/30"
                        : "bg-gray-800/50 hover:bg-gray-800"
                    }`}
                    onClick={() => setSelectedBot(bot.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium text-sm">{bot.name}</h4>
                      <Badge
                        className={`text-xs ${
                          bot.status === "running"
                            ? "bg-green-500/10 text-green-400"
                            : bot.status === "paused"
                              ? "bg-yellow-500/10 text-yellow-400"
                              : bot.status === "error"
                                ? "bg-red-500/10 text-red-400"
                                : "bg-gray-500/10 text-gray-400"
                        }`}
                      >
                        {bot.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">{bot.pair}</span>
                      <span className={getPerformanceColor(profitPercent)}>{formatPercentage(profitPercent)}</span>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* Bot Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedBotData ? (
            <>
              {/* Bot Stats */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">{selectedBotData.name}</CardTitle>
                    <Badge
                      className={`${
                        selectedBotData.status === "running"
                          ? "bg-green-500/10 text-green-400"
                          : selectedBotData.status === "paused"
                            ? "bg-yellow-500/10 text-yellow-400"
                            : selectedBotData.status === "error"
                              ? "bg-red-500/10 text-red-400"
                              : "bg-gray-500/10 text-gray-400"
                      }`}
                    >
                      {selectedBotData.status}
                    </Badge>
                  </div>
                  <p className="text-gray-400 text-sm">
                    {selectedBotData.strategy.toUpperCase()} • {selectedBotData.pair}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Investment</p>
                      <p className="text-lg font-bold text-white">
                        {formatCurrency(selectedBotData.config.investment)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Net P&L</p>
                      <p
                        className={`text-lg font-bold ${getPerformanceColor(
                          selectedBotData.stats.totalProfit - Math.abs(selectedBotData.stats.totalLoss),
                        )}`}
                      >
                        {formatCurrency(selectedBotData.stats.totalProfit - Math.abs(selectedBotData.stats.totalLoss))}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Win Rate</p>
                      <p className="text-lg font-bold text-white">{selectedBotData.stats.winRate.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Total Trades</p>
                      <p className="text-lg font-bold text-white">{selectedBotData.stats.totalTrades}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Trades */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Recent Trades</CardTitle>
                </CardHeader>
                <CardContent>
                  {trades.length === 0 ? (
                    <div className="text-center py-8">
                      <Activity className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-400">No trades executed yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {trades
                        .slice(-10)
                        .reverse()
                        .map((trade) => (
                          <div
                            key={trade.id}
                            className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  trade.side === "buy" ? "bg-green-400" : "bg-red-400"
                                }`}
                              />
                              <div>
                                <p className="text-white text-sm font-medium">
                                  {trade.side.toUpperCase()} {trade.amount.toFixed(6)} {trade.symbol.split("/")[0]}
                                </p>
                                <p className="text-gray-400 text-xs">{trade.timestamp.toLocaleString()}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-white text-sm">{formatCurrency(trade.price)}</p>
                              <Badge
                                className={`text-xs ${
                                  trade.status === "filled"
                                    ? "bg-green-500/10 text-green-400"
                                    : trade.status === "pending"
                                      ? "bg-yellow-500/10 text-yellow-400"
                                      : trade.status === "cancelled"
                                        ? "bg-gray-500/10 text-gray-400"
                                        : "bg-red-500/10 text-red-400"
                                }`}
                              >
                                {trade.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="text-center py-12">
                <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Select a Bot</h3>
                <p className="text-gray-400">Choose a bot from the list to view its performance details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  )
}
