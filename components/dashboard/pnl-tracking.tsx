"use client"

import { useState } from "react"
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
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, DollarSign, Calendar, Download } from "lucide-react"

export function PnLTracking() {
  const [timeframe, setTimeframe] = useState("7d")

  const pnlData = [
    { date: "Jan 1", pnl: 0, cumulative: 0 },
    { date: "Jan 2", pnl: 234, cumulative: 234 },
    { date: "Jan 3", pnl: -156, cumulative: 78 },
    { date: "Jan 4", pnl: 445, cumulative: 523 },
    { date: "Jan 5", pnl: 289, cumulative: 812 },
    { date: "Jan 6", pnl: -67, cumulative: 745 },
    { date: "Jan 7", pnl: 567, cumulative: 1312 },
  ]

  const exchangeBreakdown = [
    { name: "Binance", value: 45, color: "#F7931A" },
    { name: "Bybit", value: 25, color: "#FF6B35" },
    { name: "OKX", value: 15, color: "#000000" },
    { name: "KuCoin", value: 10, color: "#24D366" },
    { name: "Coinbase", value: 5, color: "#0052FF" },
  ]

  const strategyPerformance = [
    { strategy: "DCA", profit: 1247, percentage: 35 },
    { strategy: "Grid", profit: 892, percentage: 25 },
    { strategy: "AI", profit: 567, percentage: 16 },
    { strategy: "Scalping", profit: 234, percentage: 7 },
    { strategy: "Manual", profit: -89, percentage: -3 },
  ]

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-[#30D5C8]" />
            P&L Tracking
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-20 bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="24h">24h</SelectItem>
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
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gray-800/30 rounded-lg">
            <DollarSign className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-green-400">+$3,456.78</p>
            <p className="text-xs text-gray-400">Total P&L</p>
          </div>
          <div className="text-center p-4 bg-gray-800/30 rounded-lg">
            <Calendar className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-blue-400">+8.2%</p>
            <p className="text-xs text-gray-400">ROI</p>
          </div>
        </div>

        {/* P&L Chart */}
        <div>
          <h4 className="text-white font-medium mb-3">Cumulative P&L</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={pnlData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
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
                strokeWidth={2}
                dot={{ fill: "#30D5C8", strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Exchange Breakdown */}
        <div>
          <h4 className="text-white font-medium mb-3">Exchange Distribution</h4>
          <div className="flex items-center space-x-4">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie
                  data={exchangeBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {exchangeBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {exchangeBreakdown.map((exchange, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: exchange.color }}></div>
                    <span className="text-sm text-gray-300">{exchange.name}</span>
                  </div>
                  <span className="text-sm text-white">{exchange.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Strategy Performance */}
        <div>
          <h4 className="text-white font-medium mb-3">Strategy Performance</h4>
          <div className="space-y-2">
            {strategyPerformance.map((strategy, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-800/30 rounded">
                <span className="text-sm text-gray-300">{strategy.strategy}</span>
                <div className="text-right">
                  <p className={`text-sm font-medium ${strategy.profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                    ${strategy.profit}
                  </p>
                  <p className={`text-xs ${strategy.percentage >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {strategy.percentage >= 0 ? "+" : ""}
                    {strategy.percentage}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
