'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import { PieChartIcon, TrendingUp, DollarSign, Percent, Target, Shield } from 'lucide-react'

export function PortfolioAnalytics() {
  const [timeframe, setTimeframe] = useState('30d')

  // Portfolio allocation data
  const allocationData = [
    { name: 'BTC', value: 35, amount: 15987.45, color: '#F7931A' },
    { name: 'ETH', value: 25, amount: 11420.32, color: '#627EEA' },
    { name: 'SOL', value: 15, amount: 6852.19, color: '#9945FF' },
    { name: 'ADA', value: 10, amount: 4568.13, color: '#0033AD' },
    { name: 'MATIC', value: 8, amount: 3654.5, color: '#8247E5' },
    { name: 'Others', value: 7, amount: 3195.73, color: '#6B7280' },
  ]

  // Performance by exchange
  const exchangePerformance = [
    { exchange: 'Binance', profit: 2456.78, percentage: 12.3, trades: 234, color: '#F0B90B' },
    { exchange: 'Bybit', profit: 1892.45, percentage: 9.8, trades: 189, color: '#FF6B35' },
    { exchange: 'OKX', profit: 1234.56, percentage: 8.1, trades: 156, color: '#000000' },
    { exchange: 'KuCoin', profit: 987.65, percentage: 6.4, trades: 123, color: '#24D366' },
    { exchange: 'Coinbase', profit: 543.21, percentage: 4.2, trades: 89, color: '#0052FF' },
  ]

  // Risk metrics
  const riskMetrics = [
    { metric: 'Portfolio Beta', value: '1.23', description: 'vs BTC', status: 'medium' },
    { metric: 'Sharpe Ratio', value: '2.45', description: 'Risk-adjusted return', status: 'good' },
    { metric: 'Max Drawdown', value: '8.7%', description: 'Largest loss', status: 'good' },
    { metric: 'Volatility', value: '15.2%', description: '30-day volatility', status: 'medium' },
    { metric: 'VaR (95%)', value: '$1,234', description: 'Value at Risk', status: 'medium' },
    { metric: 'Correlation', value: '0.78', description: 'vs Market', status: 'high' },
  ]

  // Performance over time
  const performanceData = [
    { date: 'Jan 1', portfolio: 40000, benchmark: 40000 },
    { date: 'Jan 7', portfolio: 41200, benchmark: 40800 },
    { date: 'Jan 14', portfolio: 42800, benchmark: 41200 },
    { date: 'Jan 21', portfolio: 44100, benchmark: 42100 },
    { date: 'Jan 28', portfolio: 45678, benchmark: 43200 },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-400'
      case 'medium':
        return 'text-yellow-400'
      case 'high':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const totalValue = allocationData.reduce((sum, item) => sum + item.amount, 0)

  return (
    <div className="space-y-8">
      {/* Portfolio Overview */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center">
              <PieChartIcon className="w-5 h-5 mr-2 text-[#30D5C8]" />
              Portfolio Analytics
            </CardTitle>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-24 bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="7d">7d</SelectItem>
                <SelectItem value="30d">30d</SelectItem>
                <SelectItem value="90d">90d</SelectItem>
                <SelectItem value="1y">1y</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="allocation" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800">
              <TabsTrigger value="allocation">Allocation</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="risk">Risk</TabsTrigger>
              <TabsTrigger value="exchanges">Exchanges</TabsTrigger>
            </TabsList>

            {/* Allocation Tab */}
            <TabsContent value="allocation" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div>
                  <h4 className="text-white font-medium mb-4">Asset Allocation</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={allocationData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={60}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {allocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Allocation Details */}
                <div>
                  <h4 className="text-white font-medium mb-4">Holdings</h4>
                  <div className="space-y-3">
                    {allocationData.map((asset, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: asset.color }}
                          ></div>
                          <div>
                            <p className="text-white font-medium">{asset.name}</p>
                            <p className="text-gray-400 text-sm">{asset.value}%</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium">${asset.amount.toLocaleString()}</p>
                          <p className="text-gray-400 text-sm">
                            ${((asset.amount / totalValue) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-6">
              <div>
                <h4 className="text-white font-medium mb-4">Portfolio vs Benchmark</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="portfolio"
                      stackId="1"
                      stroke="#30D5C8"
                      fill="#30D5C8"
                      fillOpacity={0.3}
                    />
                    <Area
                      type="monotone"
                      dataKey="benchmark"
                      stackId="2"
                      stroke="#6B7280"
                      fill="#6B7280"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <p className="text-lg font-bold text-green-400">+14.2%</p>
                  <p className="text-xs text-gray-400">Total Return</p>
                </div>
                <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                  <DollarSign className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <p className="text-lg font-bold text-blue-400">+$5,678</p>
                  <p className="text-xs text-gray-400">Absolute Gain</p>
                </div>
                <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                  <Percent className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <p className="text-lg font-bold text-purple-400">+3.8%</p>
                  <p className="text-xs text-gray-400">vs Benchmark</p>
                </div>
                <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                  <Target className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                  <p className="text-lg font-bold text-yellow-400">73.4%</p>
                  <p className="text-xs text-gray-400">Win Rate</p>
                </div>
              </div>
            </TabsContent>

            {/* Risk Tab */}
            <TabsContent value="risk" className="space-y-6">
              <div>
                <h4 className="text-white font-medium mb-4">Risk Metrics</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {riskMetrics.map((metric, index) => (
                    <div key={index} className="p-4 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-white font-medium">{metric.metric}</h5>
                        <Badge className={`${getStatusColor(metric.status)} bg-transparent border`}>
                          {metric.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                          {metric.value}
                        </span>
                        <span className="text-gray-400 text-sm">{metric.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Score */}
              <div className="text-center p-6 bg-gray-800/30 rounded-lg">
                <Shield className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h4 className="text-2xl font-bold text-yellow-400 mb-2">Medium Risk</h4>
                <p className="text-gray-400">
                  Your portfolio has moderate risk exposure with good diversification
                </p>
              </div>
            </TabsContent>

            {/* Exchanges Tab */}
            <TabsContent value="exchanges" className="space-y-6">
              <div>
                <h4 className="text-white font-medium mb-4">Performance by Exchange</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={exchangePerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="exchange" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="profit" fill="#30D5C8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Exchange Details */}
              <div className="space-y-3">
                {exchangePerformance.map((exchange, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: exchange.color }}
                      ></div>
                      <div>
                        <p className="text-white font-medium">{exchange.exchange}</p>
                        <p className="text-gray-400 text-sm">{exchange.trades} trades</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-medium">+${exchange.profit.toFixed(2)}</p>
                      <p className="text-green-400 text-sm">+{exchange.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
