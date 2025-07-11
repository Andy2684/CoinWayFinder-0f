"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  PieChart,
  Activity,
  Clock,
  AlertCircle,
  CheckCircle,
  Wallet,
} from "lucide-react"

interface PortfolioData {
  exchange: string
  totalValue: number
  totalValueChange: number
  lastSync: string
  assets: {
    symbol: string
    name: string
    balance: number
    value: number
    price: number
    change24h: number
    allocation: number
  }[]
  syncStatus: "syncing" | "completed" | "error" | "idle"
}

export function PortfolioSync() {
  const [portfolios, setPortfolios] = useState<PortfolioData[]>([
    {
      exchange: "Binance",
      totalValue: 45230.5,
      totalValueChange: 5.2,
      lastSync: "2 minutes ago",
      syncStatus: "completed",
      assets: [
        {
          symbol: "BTC",
          name: "Bitcoin",
          balance: 0.5234,
          value: 22450.3,
          price: 42890.5,
          change24h: 2.1,
          allocation: 49.6,
        },
        {
          symbol: "ETH",
          name: "Ethereum",
          balance: 8.234,
          value: 18920.4,
          price: 2298.5,
          change24h: -1.2,
          allocation: 41.8,
        },
        { symbol: "BNB", name: "BNB", balance: 12.45, value: 3859.8, price: 310.2, change24h: 3.4, allocation: 8.6 },
      ],
    },
    {
      exchange: "Bybit",
      totalValue: 28450.75,
      totalValueChange: -2.1,
      lastSync: "5 minutes ago",
      syncStatus: "completed",
      assets: [
        {
          symbol: "BTC",
          name: "Bitcoin",
          balance: 0.3421,
          value: 14680.2,
          price: 42890.5,
          change24h: 2.1,
          allocation: 51.6,
        },
        {
          symbol: "SOL",
          name: "Solana",
          balance: 89.23,
          value: 8920.15,
          price: 99.95,
          change24h: -3.2,
          allocation: 31.4,
        },
        {
          symbol: "AVAX",
          name: "Avalanche",
          balance: 145.67,
          value: 4850.4,
          price: 33.3,
          change24h: 1.8,
          allocation: 17.0,
        },
      ],
    },
    {
      exchange: "KuCoin",
      totalValue: 15680.25,
      totalValueChange: 8.7,
      lastSync: "1 minute ago",
      syncStatus: "syncing",
      assets: [
        {
          symbol: "ADA",
          name: "Cardano",
          balance: 12450.3,
          value: 6225.15,
          price: 0.5,
          change24h: 4.2,
          allocation: 39.7,
        },
        {
          symbol: "DOT",
          name: "Polkadot",
          balance: 890.45,
          value: 5342.7,
          price: 6.0,
          change24h: -1.5,
          allocation: 34.1,
        },
        {
          symbol: "LINK",
          name: "Chainlink",
          balance: 234.56,
          value: 4112.4,
          price: 17.53,
          change24h: 2.8,
          allocation: 26.2,
        },
      ],
    },
  ])

  const [autoSync, setAutoSync] = useState(true)
  const [syncInterval, setSyncInterval] = useState(5) // minutes
  const [isRefreshing, setIsRefreshing] = useState(false)

  const totalPortfolioValue = portfolios.reduce((sum, portfolio) => sum + portfolio.totalValue, 0)
  const totalPortfolioChange =
    (portfolios.reduce((sum, portfolio) => sum + (portfolio.totalValue * portfolio.totalValueChange) / 100, 0) /
      totalPortfolioValue) *
    100

  const handleRefreshAll = async () => {
    setIsRefreshing(true)
    // Simulate API calls
    setPortfolios((prev) => prev.map((p) => ({ ...p, syncStatus: "syncing" as const })))

    setTimeout(() => {
      setPortfolios((prev) =>
        prev.map((p) => ({
          ...p,
          syncStatus: "completed" as const,
          lastSync: "Just now",
        })),
      )
      setIsRefreshing(false)
    }, 3000)
  }

  const handleRefreshExchange = async (exchange: string) => {
    setPortfolios((prev) => prev.map((p) => (p.exchange === exchange ? { ...p, syncStatus: "syncing" as const } : p)))

    setTimeout(() => {
      setPortfolios((prev) =>
        prev.map((p) =>
          p.exchange === exchange ? { ...p, syncStatus: "completed" as const, lastSync: "Just now" } : p,
        ),
      )
    }, 2000)
  }

  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case "syncing":
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-400" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-xl">📊 Portfolio Overview</CardTitle>
              <p className="text-gray-400 text-sm">Aggregated portfolio across all connected exchanges</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch checked={autoSync} onCheckedChange={setAutoSync} />
                <span className="text-sm text-gray-300">Auto-sync</span>
              </div>
              <Button
                onClick={handleRefreshAll}
                disabled={isRefreshing}
                className="bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E]"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Wallet className="w-5 h-5 text-[#30D5C8]" />
                <span className="text-gray-400 text-sm">Total Portfolio Value</span>
              </div>
              <div className="text-2xl font-bold text-white">
                ${totalPortfolioValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <div
                className={`flex items-center space-x-1 text-sm ${totalPortfolioChange >= 0 ? "text-green-400" : "text-red-400"}`}
              >
                {totalPortfolioChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>
                  {totalPortfolioChange >= 0 ? "+" : ""}
                  {totalPortfolioChange.toFixed(2)}%
                </span>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="w-5 h-5 text-[#30D5C8]" />
                <span className="text-gray-400 text-sm">Connected Exchanges</span>
              </div>
              <div className="text-2xl font-bold text-white">{portfolios.length}</div>
              <div className="text-sm text-gray-400">
                {portfolios.filter((p) => p.syncStatus === "completed").length} synced
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <PieChart className="w-5 h-5 text-[#30D5C8]" />
                <span className="text-gray-400 text-sm">Total Assets</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {portfolios.reduce((sum, p) => sum + p.assets.length, 0)}
              </div>
              <div className="text-sm text-gray-400">Unique tokens</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exchange Portfolios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {portfolios.map((portfolio) => (
          <Card key={portfolio.exchange} className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white text-lg">{portfolio.exchange}</CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    {getSyncStatusIcon(portfolio.syncStatus)}
                    <span className="text-gray-400 text-sm">{portfolio.lastSync}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRefreshExchange(portfolio.exchange)}
                  disabled={portfolio.syncStatus === "syncing"}
                >
                  <RefreshCw className={`w-4 h-4 ${portfolio.syncStatus === "syncing" ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Portfolio Value */}
              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Portfolio Value</span>
                  <div
                    className={`flex items-center space-x-1 text-sm ${portfolio.totalValueChange >= 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    {portfolio.totalValueChange >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span>
                      {portfolio.totalValueChange >= 0 ? "+" : ""}
                      {portfolio.totalValueChange.toFixed(2)}%
                    </span>
                  </div>
                </div>
                <div className="text-xl font-bold text-white">
                  ${portfolio.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
              </div>

              {/* Top Assets */}
              <div>
                <h4 className="text-white font-medium mb-3">Top Holdings</h4>
                <div className="space-y-2">
                  {portfolio.assets.slice(0, 3).map((asset) => (
                    <div key={asset.symbol} className="flex items-center justify-between p-2 bg-gray-800/30 rounded">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-[#30D5C8]/20 rounded-full flex items-center justify-center">
                          <span className="text-[#30D5C8] text-xs font-bold">{asset.symbol.slice(0, 2)}</span>
                        </div>
                        <div>
                          <div className="text-white text-sm font-medium">{asset.symbol}</div>
                          <div className="text-gray-400 text-xs">{asset.balance.toFixed(4)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white text-sm">${asset.value.toLocaleString()}</div>
                        <div className={`text-xs ${asset.change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {asset.change24h >= 0 ? "+" : ""}
                          {asset.change24h.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sync Progress */}
              {portfolio.syncStatus === "syncing" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Syncing...</span>
                    <span className="text-[#30D5C8]">75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Asset View */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">💰 Detailed Asset Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="bg-gray-800/50">
              <TabsTrigger value="all">All Assets</TabsTrigger>
              <TabsTrigger value="binance">Binance</TabsTrigger>
              <TabsTrigger value="bybit">Bybit</TabsTrigger>
              <TabsTrigger value="kucoin">KuCoin</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left text-gray-400 text-sm font-medium py-3">Asset</th>
                      <th className="text-left text-gray-400 text-sm font-medium py-3">Exchange</th>
                      <th className="text-right text-gray-400 text-sm font-medium py-3">Balance</th>
                      <th className="text-right text-gray-400 text-sm font-medium py-3">Value</th>
                      <th className="text-right text-gray-400 text-sm font-medium py-3">24h Change</th>
                      <th className="text-right text-gray-400 text-sm font-medium py-3">Allocation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolios.flatMap((portfolio) =>
                      portfolio.assets.map((asset) => (
                        <tr key={`${portfolio.exchange}-${asset.symbol}`} className="border-b border-gray-800/50">
                          <td className="py-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-[#30D5C8]/20 rounded-full flex items-center justify-center">
                                <span className="text-[#30D5C8] text-xs font-bold">{asset.symbol.slice(0, 2)}</span>
                              </div>
                              <div>
                                <div className="text-white font-medium">{asset.symbol}</div>
                                <div className="text-gray-400 text-sm">{asset.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3">
                            <Badge variant="outline" className="border-gray-600 text-gray-300">
                              {portfolio.exchange}
                            </Badge>
                          </td>
                          <td className="py-3 text-right text-white">{asset.balance.toFixed(4)}</td>
                          <td className="py-3 text-right text-white">${asset.value.toLocaleString()}</td>
                          <td className={`py-3 text-right ${asset.change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {asset.change24h >= 0 ? "+" : ""}
                            {asset.change24h.toFixed(2)}%
                          </td>
                          <td className="py-3 text-right text-white">{asset.allocation.toFixed(1)}%</td>
                        </tr>
                      )),
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            {portfolios.map((portfolio) => (
              <TabsContent key={portfolio.exchange.toLowerCase()} value={portfolio.exchange.toLowerCase()}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left text-gray-400 text-sm font-medium py-3">Asset</th>
                        <th className="text-right text-gray-400 text-sm font-medium py-3">Balance</th>
                        <th className="text-right text-gray-400 text-sm font-medium py-3">Value</th>
                        <th className="text-right text-gray-400 text-sm font-medium py-3">24h Change</th>
                        <th className="text-right text-gray-400 text-sm font-medium py-3">Allocation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolio.assets.map((asset) => (
                        <tr key={asset.symbol} className="border-b border-gray-800/50">
                          <td className="py-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-[#30D5C8]/20 rounded-full flex items-center justify-center">
                                <span className="text-[#30D5C8] text-xs font-bold">{asset.symbol.slice(0, 2)}</span>
                              </div>
                              <div>
                                <div className="text-white font-medium">{asset.symbol}</div>
                                <div className="text-gray-400 text-sm">{asset.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 text-right text-white">{asset.balance.toFixed(4)}</td>
                          <td className="py-3 text-right text-white">${asset.value.toLocaleString()}</td>
                          <td className={`py-3 text-right ${asset.change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {asset.change24h >= 0 ? "+" : ""}
                            {asset.change24h.toFixed(2)}%
                          </td>
                          <td className="py-3 text-right text-white">{asset.allocation.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
