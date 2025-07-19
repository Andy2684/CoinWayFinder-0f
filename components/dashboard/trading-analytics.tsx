"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Target, Shield, BarChart3 } from "lucide-react"
import { useState, useEffect } from "react"

interface TradingMetrics {
  totalTrades: number
  winRate: number
  profitFactor: number
  sharpeRatio: number
  maxDrawdown: number
  avgWin: number
  avgLoss: number
  bestTrade: number
  worstTrade: number
  consecutiveWins: number
  consecutiveLosses: number
}

interface PerformanceData {
  period: string
  pnl: number
  trades: number
  winRate: number
  volume: number
}

export function TradingAnalytics() {
  const [metrics, setMetrics] = useState<TradingMetrics>({
    totalTrades: 247,
    winRate: 72.5,
    profitFactor: 1.85,
    sharpeRatio: 1.23,
    maxDrawdown: 8.2,
    avgWin: 145.32,
    avgLoss: -78.45,
    bestTrade: 1250.0,
    worstTrade: -340.0,
    consecutiveWins: 8,
    consecutiveLosses: 3,
  })

  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([
    { period: "Today", pnl: 1234.56, trades: 15, winRate: 80.0, volume: 45000 },
    { period: "This Week", pnl: 3456.78, trades: 89, winRate: 74.2, volume: 180000 },
    { period: "This Month", pnl: 8750.32, trades: 247, winRate: 72.5, volume: 650000 },
    { period: "Last Month", pnl: 7234.89, trades: 198, winRate: 69.7, volume: 520000 },
  ])

  const [tradingHours, setTradingHours] = useState([
    { hour: "00-04", trades: 12, pnl: 234 },
    { hour: "04-08", trades: 28, pnl: 567 },
    { hour: "08-12", trades: 45, pnl: 890 },
    { hour: "12-16", trades: 67, pnl: 1234 },
    { hour: "16-20", trades: 52, pnl: 987 },
    { hour: "20-24", trades: 43, pnl: 765 },
  ])

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        winRate: Math.max(60, Math.min(85, prev.winRate + (Math.random() - 0.5) * 0.5)),
        profitFactor: Math.max(1.0, Math.min(3.0, prev.profitFactor + (Math.random() - 0.5) * 0.05)),
        sharpeRatio: Math.max(0.5, Math.min(2.0, prev.sharpeRatio + (Math.random() - 0.5) * 0.02)),
      }))
    }, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const getPerformanceColor = (value: number, isPositive = true) => {
    if (isPositive) {
      return value >= 0 ? "text-green-600" : "text-red-600"
    }
    return value <= 0 ? "text-green-600" : "text-red-600"
  }

  const getRiskLevel = (drawdown: number) => {
    if (drawdown <= 5) return { level: "Low", color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/20" }
    if (drawdown <= 10) return { level: "Medium", color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-900/20" }
    return { level: "High", color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/20" }
  }

  const riskLevel = getRiskLevel(metrics.maxDrawdown)

  return (
    <div className="space-y-6">
      {/* Key Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Target className="w-4 h-4 mr-2 text-blue-500" />
              Win Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.winRate.toFixed(1)}%</div>
            <Progress value={metrics.winRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">{metrics.totalTrades} total trades</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BarChart3 className="w-4 h-4 mr-2 text-purple-500" />
              Profit Factor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.profitFactor.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {metrics.profitFactor >= 1.5 ? "Excellent" : metrics.profitFactor >= 1.2 ? "Good" : "Fair"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Shield className="w-4 h-4 mr-2 text-orange-500" />
              Max Drawdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-{metrics.maxDrawdown}%</div>
            <Badge variant="outline" className={`mt-1 ${riskLevel.color} border-current`}>
              {riskLevel.level} Risk
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
              Sharpe Ratio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.sharpeRatio.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground mt-1">Risk-adjusted return</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="trades">Trade Analysis</TabsTrigger>
          <TabsTrigger value="timing">Timing Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance by Period</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceData.map((data, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{data.period}</div>
                        <div className="text-sm text-muted-foreground">
                          {data.trades} trades • {data.winRate.toFixed(1)}% win rate
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${getPerformanceColor(data.pnl)}`}>{formatCurrency(data.pnl)}</div>
                        <div className="text-sm text-muted-foreground">Vol: {formatCurrency(data.volume)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Trade Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                    <div className="text-lg font-bold text-green-600">{formatCurrency(metrics.avgWin)}</div>
                    <div className="text-sm text-muted-foreground">Avg Win</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                    <div className="text-lg font-bold text-red-600">{formatCurrency(metrics.avgLoss)}</div>
                    <div className="text-sm text-muted-foreground">Avg Loss</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Best Trade</span>
                    <span className="font-bold text-green-600">{formatCurrency(metrics.bestTrade)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Worst Trade</span>
                    <span className="font-bold text-red-600">{formatCurrency(metrics.worstTrade)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Consecutive Wins</span>
                    <span className="font-bold">{metrics.consecutiveWins}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Consecutive Losses</span>
                    <span className="font-bold">{metrics.consecutiveLosses}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trades" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Win/Loss Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Wins</span>
                    <span className="font-bold text-green-600">
                      {Math.round(metrics.totalTrades * (metrics.winRate / 100))}
                    </span>
                  </div>
                  <Progress value={metrics.winRate} className="h-2" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Losses</span>
                    <span className="font-bold text-red-600">
                      {Math.round(metrics.totalTrades * ((100 - metrics.winRate) / 100))}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Risk Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Win/Loss Ratio</span>
                  <span className="font-bold">{(Math.abs(metrics.avgWin) / Math.abs(metrics.avgLoss)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Expectancy</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(
                      (metrics.winRate / 100) * metrics.avgWin + ((100 - metrics.winRate) / 100) * metrics.avgLoss,
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Risk Level</span>
                  <Badge variant="outline" className={riskLevel.color}>
                    {riskLevel.level}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Performance Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">A-</div>
                  <div className="text-sm text-muted-foreground mb-3">Overall Grade</div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span>Profitability</span>
                      <span className="text-green-600">Excellent</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Consistency</span>
                      <span className="text-blue-600">Good</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Risk Control</span>
                      <span className="text-yellow-600">Average</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trading Hours Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tradingHours.map((hour, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="font-medium">{hour.hour}</div>
                      <Badge variant="outline">{hour.trades} trades</Badge>
                    </div>
                    <div className={`font-bold ${getPerformanceColor(hour.pnl)}`}>{formatCurrency(hour.pnl)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
