'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp, Target, Shield, DollarSign } from 'lucide-react'

export function SignalPerformance() {
  const [timeframe, setTimeframe] = useState('7d')

  // Mock performance data
  const performanceData = [
    { date: '2024-01-08', pnl: 1250, signals: 12, winRate: 75 },
    { date: '2024-01-09', pnl: 2100, signals: 15, winRate: 80 },
    { date: '2024-01-10', pnl: 1800, signals: 18, winRate: 72 },
    { date: '2024-01-11', pnl: 3200, signals: 22, winRate: 82 },
    { date: '2024-01-12', pnl: 2800, signals: 20, winRate: 78 },
    { date: '2024-01-13', pnl: 4100, signals: 25, winRate: 84 },
    { date: '2024-01-14', pnl: 3600, signals: 24, winRate: 79 },
  ]

  const strategyPerformance = [
    { strategy: 'Trend Following', signals: 45, winRate: 78, pnl: 8420, avgReturn: 3.2 },
    { strategy: 'Mean Reversion', signals: 32, winRate: 82, pnl: 6180, avgReturn: 2.8 },
    { strategy: 'Breakout', signals: 28, winRate: 71, pnl: 4950, avgReturn: 4.1 },
    { strategy: 'Support/Resistance', signals: 38, winRate: 75, pnl: 5670, avgReturn: 2.9 },
    { strategy: 'Momentum', signals: 22, winRate: 86, pnl: 4320, avgReturn: 3.8 },
  ]

  const riskDistribution = [
    { name: 'Low Risk', value: 45, color: '#10B981' },
    { name: 'Medium Risk', value: 38, color: '#F59E0B' },
    { name: 'High Risk', value: 17, color: '#EF4444' },
  ]

  const timeframeData = [
    { timeframe: '15M', signals: 28, winRate: 68, avgReturn: 1.8 },
    { timeframe: '30M', signals: 35, winRate: 72, avgReturn: 2.1 },
    { timeframe: '1H', signals: 42, winRate: 76, avgReturn: 2.8 },
    { timeframe: '2H', signals: 38, winRate: 79, avgReturn: 3.2 },
    { timeframe: '4H', signals: 32, winRate: 82, avgReturn: 3.9 },
    { timeframe: '1D', signals: 18, winRate: 85, avgReturn: 4.5 },
  ]

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-[#1A1B23] border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total P&L</p>
                <p className="text-2xl font-bold text-green-400">+$29,540</p>
                <p className="text-xs text-green-400">+12.3% this week</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1B23] border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Win Rate</p>
                <p className="text-2xl font-bold text-[#30D5C8]">78.4%</p>
                <p className="text-xs text-green-400">+2.1% this week</p>
              </div>
              <Target className="w-8 h-8 text-[#30D5C8]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1B23] border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Avg Return</p>
                <p className="text-2xl font-bold text-white">3.2%</p>
                <p className="text-xs text-green-400">+0.4% this week</p>
              </div>
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1B23] border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Sharpe Ratio</p>
                <p className="text-2xl font-bold text-white">2.18</p>
                <p className="text-xs text-green-400">Excellent</p>
              </div>
              <Shield className="w-8 h-8 text-white" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1A1B23] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">P&L Over Time</CardTitle>
            <CardDescription>Daily profit and loss performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="pnl"
                  stroke="#30D5C8"
                  fill="#30D5C8"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1B23] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Win Rate Trend</CardTitle>
            <CardDescription>Daily win rate percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="winRate"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: '#10B981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Strategy Performance */}
      <Card className="bg-[#1A1B23] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Strategy Performance</CardTitle>
          <CardDescription>Performance breakdown by trading strategy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {strategyPerformance.map((strategy, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-[#0F1015] rounded-lg border border-gray-800"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <h4 className="font-medium text-white">{strategy.strategy}</h4>
                    <p className="text-sm text-gray-400">{strategy.signals} signals</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-400">Win Rate</p>
                    <p className="font-medium text-[#30D5C8]">{strategy.winRate}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-400">P&L</p>
                    <p className="font-medium text-green-400">+${strategy.pnl.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-400">Avg Return</p>
                    <p className="font-medium text-white">{strategy.avgReturn}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1A1B23] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Risk Distribution</CardTitle>
            <CardDescription>Signal distribution by risk level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1B23] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Timeframe Analysis</CardTitle>
            <CardDescription>Performance by trading timeframe</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timeframeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="timeframe" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="winRate" fill="#30D5C8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
