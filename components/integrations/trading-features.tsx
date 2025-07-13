"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  BarChart3,
  Zap,
  Shield,
  RefreshCw,
  Bell,
  DollarSign,
  Activity,
  Target,
  Settings,
} from "lucide-react"

export function TradingFeatures() {
  const features = [
    {
      category: "Trading Execution",
      icon: TrendingUp,
      color: "text-green-400",
      items: [
        {
          name: "Spot Trading",
          description: "Execute spot trades across all connected exchanges",
          enabled: true,
          exchanges: ["Binance", "Coinbase", "Kraken"],
        },
        {
          name: "Futures Trading",
          description: "Trade futures contracts with leverage",
          enabled: true,
          exchanges: ["Binance", "Bybit", "OKX"],
        },
        {
          name: "Margin Trading",
          description: "Trade with borrowed funds for increased exposure",
          enabled: false,
          exchanges: ["Binance", "Kraken"],
        },
        {
          name: "Options Trading",
          description: "Trade crypto options contracts",
          enabled: false,
          exchanges: ["Bybit", "OKX"],
        },
      ],
    },
    {
      category: "Order Management",
      icon: Target,
      color: "text-blue-400",
      items: [
        {
          name: "Smart Order Routing",
          description: "Automatically route orders to best available exchange",
          enabled: true,
          exchanges: ["All Connected"],
        },
        {
          name: "Order Splitting",
          description: "Split large orders across multiple exchanges",
          enabled: true,
          exchanges: ["All Connected"],
        },
        {
          name: "Iceberg Orders",
          description: "Hide large order sizes with iceberg execution",
          enabled: false,
          exchanges: ["Binance", "OKX"],
        },
        {
          name: "TWAP Orders",
          description: "Time-weighted average price execution",
          enabled: false,
          exchanges: ["Professional"],
        },
      ],
    },
    {
      category: "Risk Management",
      icon: Shield,
      color: "text-red-400",
      items: [
        {
          name: "Position Limits",
          description: "Set maximum position sizes per exchange",
          enabled: true,
          exchanges: ["All Connected"],
        },
        {
          name: "Daily Loss Limits",
          description: "Automatic trading halt on daily loss threshold",
          enabled: true,
          exchanges: ["All Connected"],
        },
        {
          name: "Correlation Monitoring",
          description: "Monitor position correlation across exchanges",
          enabled: false,
          exchanges: ["Professional"],
        },
        {
          name: "Liquidation Protection",
          description: "Early warning system for margin positions",
          enabled: true,
          exchanges: ["Margin Enabled"],
        },
      ],
    },
    {
      category: "Data & Analytics",
      icon: BarChart3,
      color: "text-purple-400",
      items: [
        {
          name: "Real-time Data",
          description: "Live price feeds and order book data",
          enabled: true,
          exchanges: ["All Connected"],
        },
        {
          name: "Historical Data",
          description: "Access to historical OHLCV and trade data",
          enabled: true,
          exchanges: ["All Connected"],
        },
        {
          name: "Cross-Exchange Analytics",
          description: "Compare prices and volumes across exchanges",
          enabled: true,
          exchanges: ["All Connected"],
        },
        {
          name: "Custom Indicators",
          description: "Build and deploy custom technical indicators",
          enabled: false,
          exchanges: ["Professional"],
        },
      ],
    },
    {
      category: "Automation",
      icon: Zap,
      color: "text-yellow-400",
      items: [
        {
          name: "Trading Bots",
          description: "Deploy automated trading strategies",
          enabled: true,
          exchanges: ["All Connected"],
        },
        {
          name: "Portfolio Rebalancing",
          description: "Automatic portfolio rebalancing across exchanges",
          enabled: true,
          exchanges: ["All Connected"],
        },
        {
          name: "Arbitrage Detection",
          description: "Identify and execute arbitrage opportunities",
          enabled: false,
          exchanges: ["Multiple Required"],
        },
        {
          name: "Grid Trading",
          description: "Automated grid trading strategies",
          enabled: true,
          exchanges: ["All Connected"],
        },
      ],
    },
    {
      category: "Notifications",
      icon: Bell,
      color: "text-[#30D5C8]",
      items: [
        {
          name: "Trade Notifications",
          description: "Get notified of all trade executions",
          enabled: true,
          exchanges: ["All Connected"],
        },
        {
          name: "Price Alerts",
          description: "Custom price alerts across all exchanges",
          enabled: true,
          exchanges: ["All Connected"],
        },
        {
          name: "Balance Alerts",
          description: "Low balance and margin call notifications",
          enabled: true,
          exchanges: ["All Connected"],
        },
        {
          name: "System Alerts",
          description: "API errors and system status notifications",
          enabled: true,
          exchanges: ["All Connected"],
        },
      ],
    },
  ]

  return (
    <section className="mb-12">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">⚡ Trading Features</h2>
        <p className="text-gray-300">Configure available trading features across your connected exchanges</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {features.map((category, categoryIndex) => (
          <Card key={categoryIndex} className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-white flex items-center">
                <category.icon className={`w-5 h-5 mr-2 ${category.color}`} />
                {category.category}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {category.items.map((feature, featureIndex) => (
                <div key={featureIndex} className="flex items-start justify-between p-4 bg-gray-800/30 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">{feature.name}</h4>
                      <Switch checked={feature.enabled} />
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{feature.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {feature.exchanges.map((exchange, exchangeIndex) => (
                        <Badge key={exchangeIndex} variant="outline" className="text-xs border-gray-600 text-gray-300">
                          {exchange}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feature Summary */}
      <Card className="bg-gray-900/50 border-gray-800 mt-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Feature Configuration Summary</h3>
              <p className="text-gray-400">Manage global settings for all trading features</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800 bg-transparent">
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync All
              </Button>
              <Button className="bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E] font-semibold">
                <Settings className="w-4 h-4 mr-2" />
                Advanced Settings
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Activity className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-green-400 mb-1">18</p>
              <p className="text-sm text-gray-400">Active Features</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-yellow-400" />
              </div>
              <p className="text-2xl font-bold text-yellow-400 mb-1">6</p>
              <p className="text-sm text-gray-400">Risk Controls</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-blue-400 mb-1">12</p>
              <p className="text-sm text-gray-400">Trading Pairs</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Bell className="w-6 h-6 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-purple-400 mb-1">24/7</p>
              <p className="text-sm text-gray-400">Monitoring</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
