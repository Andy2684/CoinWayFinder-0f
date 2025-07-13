"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
} from "recharts"
import { TrendingUp, PieChart, DollarSign, Download, BarChart3 } from "lucide-react"

interface PerformanceData {
  date: string
  portfolioValue: number
  benchmark: number
  dailyPnL: number
  cumulativePnL: number
  trades: number
  drawdown: number
}

export function PortfolioPerformanceChart() {
  const [timeframe, setTimeframe] = useState("30d")
  const [chartType, setChartType] = useState("value")
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([])
  const [metrics, setMetrics] = useState({
    totalReturn: 14.2,
    sharpeRatio: 1.85,
    maxDrawdown: -8.5,
    winRate: 73.4,
    totalTrades: 1247,
  })

  useEffect(() => {
    // Generate realistic performance data
    const generatePerformanceData = () => {
      const data: PerformanceData[] = []
      let portfolioValue = 50000
      let benchmarkValue = 50000
      let cumulativePnL = 0

      const days = timeframe === "7d" ? 7 : timeframe === "30d" ? 30 : 90

      for (let i = days; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)

        // Portfolio performance (slightly outperforming benchmark)
        const portfolioChange = (Math.random() - 0.45) * 0.03 // Slight positive bias
        const benchmarkChange = (Math.random() - 0.5) * 0.025

        portfolioValue *= 1 + portfolioChange
        benchmarkValue *= 1 + benchmarkChange

        const dailyPnL = portfolioValue * portfolioChange
        cumulativePnL += dailyPnL

        const drawdown = Math.min(0, (Math.random() - 0.8) * 0.15) // Occasional drawdowns

        data.push({
          date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          portfolioValue: Math.round(portfolioValue),
          benchmark: Math.round(benchmarkValue),
          dailyPnL: Math.round(dailyPnL),
          cumulativePnL: Math.round(cumulativePnL),
          trades: Math.floor(Math.random() * 20) + 5,
          drawdown: drawdown * 100,
        })
      }

      setPerformanceData(data)

      // Update metrics based on data
      const totalReturnCalc = ((portfolioValue - 50000) / 50000) * 100
      setMetrics((prev) => ({
        ...prev,
        totalReturn: totalReturnCalc,
      }))
    }

    generatePerformanceData()
  }, [timeframe])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg">
          <p className="text-gray-300 text-sm mb-2">{`Date: ${label}`}</p>
          <div className="space-y-1">
            <p className="text-white font-semibold">{`Portfolio: ${formatCurrency(data.portfolioValue)}`}</p>
            <p className="text-gray-400 text-sm">{`Benchmark: ${formatCurrency(data.benchmark)}`}</p>
            <p className={`text-sm ${data.dailyPnL >= 0 ? "text-green-400" : "text-red-400"}`}>
              {`Daily P&L: ${formatCurrency(data.dailyPnL)}`}
            </p>
            <p className="text-blue-400 text-sm">{`Trades: ${data.trades}`}</p>
          </div>
        </div>
      )
    }
    return null
  }

  const renderChart = () => {
    switch (chartType) {
      case "value":
        return (
          <AreaChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={formatCurrency} />
            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="portfolioValue"
              stackId="1"
              stroke="#30D5C8"
              fill="#30D5C8"
              fillOpacity={0.3}
              name="Portfolio"
            />
            <Area
              type="monotone"
              dataKey="benchmark"
              stackId="2"
              stroke="#6B7280"
              fill="#6B7280"
              fillOpacity={0.2}
              name="Benchmark"
            />
          </AreaChart>
        )

      case "pnl":
        return (
          <ComposedChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={formatCurrency} />
            <Tooltip content={<CustomTooltip />} />

            <Bar dataKey="dailyPnL" fill="#30D5C8" fillOpacity={0.8} name="Daily P&L" />
            <Line
              type="monotone"
              dataKey="cumulativePnL"
              stroke="#F59E0B"
              strokeWidth={2}
              dot={false}
              name="Cumulative P&L"
            />
          </ComposedChart>
        )

      case "drawdown":
        return (
          <AreaChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={formatPercent} />
            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="drawdown"
              stroke="#EF4444"
              fill="#EF4444"
              fillOpacity={0.3}
              name="Drawdown"
            />
          </AreaChart>
        )

      default:
        return null
    }
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-[#30D5C8]" />
            Portfolio Performance
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="value">Portfolio Value</SelectItem>
                <SelectItem value="pnl">P&L Analysis</SelectItem>
                <SelectItem value="drawdown">Drawdown</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-20 bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="7d">7d</SelectItem>
                <SelectItem value="30d">30d</SelectItem>
                <SelectItem value="90d">90d</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-3 bg-gray-800/30 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-green-400">+{metrics.totalReturn.toFixed(1)}%</p>
            <p className="text-xs text-gray-400">Total Return</p>
          </div>
          <div className="text-center p-3 bg-gray-800/30 rounded-lg">
            <PieChart className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-blue-400">{metrics.sharpeRatio.toFixed(2)}</p>
            <p className="text-xs text-gray-400">Sharpe Ratio</p>
          </div>
          <div className="text-center p-3 bg-gray-800/30 rounded-lg">
            <div className="w-5 h-5 bg-red-500 rounded mx-auto mb-1"></div>
            <p className="text-lg font-bold text-red-400">{metrics.maxDrawdown.toFixed(1)}%</p>
            <p className="text-xs text-gray-400">Max Drawdown</p>
          </div>
          <div className="text-center p-3 bg-gray-800/30 rounded-lg">
            <div className="w-5 h-5 bg-purple-500 rounded mx-auto mb-1"></div>
            <p className="text-lg font-bold text-purple-400">{metrics.winRate.toFixed(1)}%</p>
            <p className="text-xs text-gray-400">Win Rate</p>
          </div>
          <div className="text-center p-3 bg-gray-800/30 rounded-lg">
            <DollarSign className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-yellow-400">{metrics.totalTrades}</p>
            <p className="text-xs text-gray-400">Total Trades</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          {renderChart()}
        </ResponsiveContainer>

        {/* Chart Legend */}
        <div className="flex items-center justify-center space-x-6 mt-4 pt-4 border-t border-gray-700">
          {chartType === "value" && (
            <>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-[#30D5C8] rounded"></div>
                <span className="text-sm text-gray-400">Portfolio</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-500 rounded"></div>
                <span className="text-sm text-gray-400">Benchmark</span>
              </div>
            </>
          )}
          {chartType === "pnl" && (
            <>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-[#30D5C8] rounded"></div>
                <span className="text-sm text-gray-400">Daily P&L</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-1 bg-yellow-500 rounded"></div>
                <span className="text-sm text-gray-400">Cumulative P&L</span>
              </div>
            </>
          )}
          {chartType === "drawdown" && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-sm text-gray-400">Drawdown %</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
