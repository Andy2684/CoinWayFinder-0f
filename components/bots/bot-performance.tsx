"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, Download } from "lucide-react"

export function BotPerformance() {
  // Mock performance data
  const performanceData = [
    { date: "Jan 1", profit: 0, cumulative: 0 },
    { date: "Jan 5", profit: 234, cumulative: 234 },
    { date: "Jan 10", profit: 156, cumulative: 390 },
    { date: "Jan 15", profit: 445, cumulative: 835 },
    { date: "Jan 20", profit: 289, cumulative: 1124 },
    { date: "Jan 25", profit: 567, cumulative: 1691 },
    { date: "Jan 30", profit: 334, cumulative: 2025 },
    { date: "Feb 5", profit: 822, cumulative: 2847 },
  ]

  const strategyPerformance = [
    { strategy: "DCA", profit: 1247, trades: 156, winRate: 78 },
    { strategy: "Grid", profit: 892, trades: 234, winRate: 71 },
    { strategy: "Momentum", profit: 567, trades: 89, winRate: 82 },
    { strategy: "AI Adaptive", profit: 234, trades: 67, winRate: 76 },
    { strategy: "Scalping", profit: -93, trades: 145, winRate: 65 },
  ]

  const pairDistribution = [
    { name: "BTC/USDT", value: 35, color: "#F7931A" },
    { name: "ETH/USDT", value: 25, color: "#627EEA" },
    { name: "SOL/USDT", value: 15, color: "#9945FF" },
    { name: "ADA/USDT", value: 12, color: "#0033AD" },
    { name: "Others", value: 13, color: "#30D5C8" },
  ]

  const topPerformers = [
    { name: "BTC DCA Master", profit: 1247.32, profitPercent: 12.4, pair: "BTC/USDT" },
    { name: "ETH Grid Pro", profit: 892.15, profitPercent: 17.8, pair: "ETH/USDT" },
    { name: "AI Multi-Pair", profit: 567.43, profitPercent: 22.7, pair: "Multiple" },
    { name: "ADA Momentum", profit: 234.89, profitPercent: 9.4, pair: "ADA/USDT" },
  ]

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">📊 Performance Analytics</h2>
          <p className="text-gray-300">Detailed insights into your bot performance</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select defaultValue="30d">
            <SelectTrigger className="w-32 bg-gray-900/50 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800 bg-transparent">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Cumulative Profit Chart */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-[#30D5C8]" />
              Cumulative Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
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
          </CardContent>
        </Card>

        {/* Strategy Performance */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Strategy Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={strategyPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="strategy" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="profit" fill="#30D5C8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performers */}
        <Card className="bg-gray-900/50 border-gray-800 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white">🏆 Top Performing Bots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformers.map((bot, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-[#30D5C8]/10 rounded-full flex items-center justify-center">
                      <span className="text-[#30D5C8] font-bold text-sm">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-white">{bot.name}</p>
                      <p className="text-sm text-gray-400">{bot.pair}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-400">${bot.profit.toFixed(2)}</p>
                    <p className="text-sm text-green-400">+{bot.profitPercent}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Trading Pair Distribution */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Trading Pairs</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pairDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pairDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {pairDistribution.map((pair, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: pair.color }}></div>
                    <span className="text-sm text-gray-300">{pair.name}</span>
                  </div>
                  <span className="text-sm text-white">{pair.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
