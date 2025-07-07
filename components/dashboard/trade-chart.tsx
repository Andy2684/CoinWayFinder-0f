"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { TrendingUp, Activity } from "lucide-react"

interface TradeData {
  date: string
  profit: number
  trades: number
  cumulative: number
}

export function TradeChart() {
  const [timeframe, setTimeframe] = useState("7d")
  const [chartData, setChartData] = useState<TradeData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTradeData()
  }, [timeframe])

  const loadTradeData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/trades?limit=100`, {
        headers: {
          "x-user-id": "demo-user",
        },
      })
      const data = await response.json()

      if (data.success) {
        // Process trades into chart data
        const processedData = processTradesForChart(data.trades, timeframe)
        setChartData(processedData)
      }
    } catch (error) {
      console.error("Failed to load trade data:", error)
    } finally {
      setLoading(false)
    }
  }

  const processTradesForChart = (trades: any[], timeframe: string): TradeData[] => {
    // Group trades by date based on timeframe
    const groupedTrades: { [key: string]: { profit: number; trades: number } } = {}

    trades.forEach((trade) => {
      if (trade.status === "filled" && trade.profit !== undefined) {
        const date = new Date(trade.timestamp)
        let dateKey = ""

        switch (timeframe) {
          case "24h":
            dateKey = `${date.getHours()}:00`
            break
          case "7d":
            dateKey = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
            break
          case "30d":
            dateKey = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
            break
          default:
            dateKey = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        }

        if (!groupedTrades[dateKey]) {
          groupedTrades[dateKey] = { profit: 0, trades: 0 }
        }

        groupedTrades[dateKey].profit += trade.profit
        groupedTrades[dateKey].trades += 1
      }
    })

    // Convert to array and calculate cumulative
    let cumulative = 0
    const result: TradeData[] = Object.entries(groupedTrades).map(([date, data]) => {
      cumulative += data.profit
      return {
        date,
        profit: data.profit,
        trades: data.trades,
        cumulative,
      }
    })

    return result.slice(-20) // Last 20 data points
  }

  if (loading) {
    return (
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-[#30D5C8]" />
            Trading Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#30D5C8]"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-[#30D5C8]" />
            Trading Performance
          </CardTitle>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="space-y-6">
            {/* Cumulative Profit Chart */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-3">Cumulative Profit</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#F9FAFB",
                    }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, "Cumulative Profit"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="cumulative"
                    stroke="#30D5C8"
                    strokeWidth={3}
                    dot={{ fill: "#30D5C8", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Daily Trades Chart */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-3">Daily Trades</h4>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#F9FAFB",
                    }}
                    formatter={(value: number) => [value, "Trades"]}
                  />
                  <Bar dataKey="trades" fill="#30D5C8" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="h-80 flex flex-col items-center justify-center text-gray-400">
            <Activity className="w-12 h-12 mb-4" />
            <p className="text-lg font-medium mb-2">No Trading Data</p>
            <p className="text-sm">Start trading to see your performance charts</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
