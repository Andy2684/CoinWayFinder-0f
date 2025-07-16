'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, DollarSign, Activity, Bot, Globe } from 'lucide-react'

export function DashboardOverview() {
  const [stats, setStats] = useState({
    totalBalance: 45678.32,
    totalPnL: 3456.78,
    pnlPercent: 8.2,
    activeStrategies: 12,
    totalTrades: 1847,
    winRate: 73.4,
    connectedExchanges: 5,
    systemStatus: 'operational',
  })

  const [marketSummary, setMarketSummary] = useState({
    btcPrice: 67234.56,
    btcChange: 2.3,
    ethPrice: 3456.78,
    ethChange: -1.2,
    totalMarketCap: '2.1T',
    fearGreedIndex: 72,
  })

  const overviewCards = [
    {
      title: 'Total Portfolio Value',
      value: `$${stats.totalBalance.toLocaleString()}`,
      change: `+$${stats.totalPnL.toFixed(2)}`,
      changePercent: `+${stats.pnlPercent}%`,
      icon: DollarSign,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Active Strategies',
      value: stats.activeStrategies.toString(),
      change: '3 running',
      changePercent: '2 paused',
      icon: Bot,
      color: 'text-[#30D5C8]',
      bgColor: 'bg-[#30D5C8]/10',
    },
    {
      title: 'Win Rate',
      value: `${stats.winRate}%`,
      change: `${stats.totalTrades} trades`,
      changePercent: '+2.1% vs last month',
      icon: TrendingUp,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Connected Exchanges',
      value: stats.connectedExchanges.toString(),
      change: 'All operational',
      changePercent: '99.9% uptime',
      icon: Globe,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
  ]

  return (
    <section className="mb-8">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {overviewCards.map((card, index) => (
          <Card
            key={index}
            className="bg-gray-900/50 border-gray-800 hover:border-[#30D5C8]/50 transition-colors"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}
                >
                  <card.icon className={`w-6 h-6 ${card.color}`} />
                </div>
                <Badge variant="outline" className="border-gray-600 text-gray-300">
                  Live
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-white">{card.value}</p>
                <p className="text-sm text-gray-400">{card.title}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${card.color}`}>{card.change}</span>
                  <span className="text-xs text-gray-500">{card.changePercent}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Market Summary */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">📈 Market Summary</h3>
            <Badge className="bg-green-500/10 text-green-400">
              <Activity className="w-3 h-3 mr-1" />
              Live Data
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">BTC/USD</p>
              <p className="text-lg font-bold text-white">
                ${marketSummary.btcPrice.toLocaleString()}
              </p>
              <div className="flex items-center justify-center space-x-1">
                {marketSummary.btcChange > 0 ? (
                  <TrendingUp className="w-3 h-3 text-green-400" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-400" />
                )}
                <span className={marketSummary.btcChange > 0 ? 'text-green-400' : 'text-red-400'}>
                  {marketSummary.btcChange > 0 ? '+' : ''}
                  {marketSummary.btcChange}%
                </span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">ETH/USD</p>
              <p className="text-lg font-bold text-white">
                ${marketSummary.ethPrice.toLocaleString()}
              </p>
              <div className="flex items-center justify-center space-x-1">
                {marketSummary.ethChange > 0 ? (
                  <TrendingUp className="w-3 h-3 text-green-400" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-400" />
                )}
                <span className={marketSummary.ethChange > 0 ? 'text-green-400' : 'text-red-400'}>
                  {marketSummary.ethChange > 0 ? '+' : ''}
                  {marketSummary.ethChange}%
                </span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">Market Cap</p>
              <p className="text-lg font-bold text-white">${marketSummary.totalMarketCap}</p>
              <span className="text-green-400 text-sm">+1.8%</span>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">Fear & Greed</p>
              <p className="text-lg font-bold text-yellow-400">{marketSummary.fearGreedIndex}</p>
              <span className="text-yellow-400 text-sm">Greed</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
