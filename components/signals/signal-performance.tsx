"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
} from "recharts"
import { TrendingUp, Target, Award, DollarSign } from "lucide-react"

const performanceData = [
  { date: "2024-01-01", totalPnL: 0, winRate: 0, signals: 0 },
  { date: "2024-01-02", totalPnL: 150, winRate: 75, signals: 4 },
  { date: "2024-01-03", totalPnL: 280, winRate: 80, signals: 5 },
  { date: "2024-01-04", totalPnL: 420, winRate: 70, signals: 10 },
  { date: "2024-01-05", totalPnL: 380, winRate: 65, signals: 8 },
  { date: "2024-01-06", totalPnL: 520, winRate: 78, signals: 12 },
  { date: "2024-01-07", totalPnL: 680, winRate: 82, signals: 15 },
  { date: "2024-01-08", totalPnL: 750, winRate: 85, signals: 18 },
  { date: "2024-01-09", totalPnL: 920, winRate: 73, signals: 22 },
  { date: "2024-01-10", totalPnL: 1150, winRate: 76, signals: 24 },
]

const strategyPerformance = [
  { strategy: "AI Trend Following", signals: 45, winRate: 78, avgReturn: 12.4, totalPnL: 558 },
  { strategy: "Mean Reversion", signals: 32, winRate: 85, avgReturn: 8.7, totalPnL: 278 },
  { strategy: "Breakout Scalping", signals: 28, winRate: 68, avgReturn: 15.2, totalPnL: 426 },
  { strategy: "Grid Trading", signals: 25, winRate: 72, avgReturn: 6.8, totalPnL: 170 },
  { strategy: "DCA Accumulation", signals: 18, winRate: 89, avgReturn: 4.5, totalPnL: 81 },
  { strategy: "Arbitrage", signals: 8, winRate: 95, avgReturn: 2.1, totalPnL: 17 },
]

const riskDistribution = [
  { name: "Low Risk", value: 45, color: "#10B981" },
  { name: "Medium Risk", value: 35, color: "#F59E0B" },
  { name: "High Risk", value: 20, color: "#EF4444" },
]

const timeframeData = [
  { timeframe: "15M", signals: 28, winRate: 65, avgReturn: 3.2 },
  { timeframe: "1H", signals: 35, winRate: 72, avgReturn: 5.8 },
  { timeframe: "4H", signals: 42, winRate: 78, avgReturn: 8.4 },
  { timeframe: "1D", signals: 25, winRate: 84, avgReturn: 12.1 },
]

export function SignalPerformance() {
  const [selectedPeriod, setSelectedPeriod] = useState("7d")

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+$1,150</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+23.5%</span> this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">76%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+3%</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Return</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.7%</div>
            <p className="text-xs text-muted-foreground">Per winning signal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Streak</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Consecutive wins</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
          <TabsTrigger value="timeframes">Timeframes</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* P&L Chart */}
            <Card>
              <CardHeader>
                <CardTitle>P&L Performance</CardTitle>
                <CardDescription>Cumulative profit and loss over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value: number) => [`$${value}`, "P&L"]}
                    />
                    <Area type="monotone" dataKey="totalPnL" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Win Rate Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Win Rate Trend</CardTitle>
                <CardDescription>Success rate percentage over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value: number) => [`${value}%`, "Win Rate"]}
                    />
                    <Line type="monotone" dataKey="winRate" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="strategies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Strategy Performance Comparison</CardTitle>
              <CardDescription>Performance metrics by trading strategy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {strategyPerformance.map((strategy, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold">{strategy.strategy}</h4>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                        <span>{strategy.signals} signals</span>
                        <Badge variant="outline">{strategy.winRate}% win rate</Badge>
                        <span className="text-green-600">+{strategy.avgReturn}% avg</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">+${strategy.totalPnL}</div>
                      <Progress value={strategy.winRate} className="w-20 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeframes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Timeframe Analysis</CardTitle>
              <CardDescription>Performance breakdown by trading timeframe</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={timeframeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timeframe" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="signals" fill="#3B82F6" name="Signal Count" />
                  <Bar yAxisId="right" dataKey="winRate" fill="#10B981" name="Win Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
                <CardDescription>Signal distribution by risk level</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={riskDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Metrics</CardTitle>
                <CardDescription>Key risk management statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Max Drawdown</span>
                  <span className="text-sm text-red-600">-8.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Sharpe Ratio</span>
                  <span className="text-sm">2.34</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Profit Factor</span>
                  <span className="text-sm text-green-600">1.87</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Average Risk per Trade</span>
                  <span className="text-sm">2.1%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Risk-Reward Ratio</span>
                  <span className="text-sm text-green-600">1:2.8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Recovery Factor</span>
                  <span className="text-sm">13.5</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
