"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, DollarSign, Activity, Bot, Zap, BarChart3, Newspaper, FishIcon as Whale } from "lucide-react"
import { LiveCryptoPrices } from "@/components/dashboard/live-crypto-prices"
import { WhaleAlerts } from "@/components/dashboard/whale-alerts"
import { CryptoNewsFeed } from "@/components/dashboard/crypto-news-feed"
import { MarketTrends } from "@/components/dashboard/market-trends"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { ActiveStrategies } from "@/components/dashboard/active-strategies"
import { PnLTracking } from "@/components/dashboard/pnl-tracking"
import { TradeLogs } from "@/components/dashboard/trade-logs"
import { QuickActions } from "@/components/dashboard/quick-actions"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Trading Dashboard</h1>
              <p className="text-gray-400">Monitor your crypto trading performance and market data</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                <Activity className="h-3 w-3 mr-1" />
                Live Data
              </Badge>
            </div>
          </div>

          {/* Main Dashboard Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-gray-800/50 border-gray-700">
              <TabsTrigger value="overview" className="data-[state=active]:bg-[#30D5C8] data-[state=active]:text-black">
                <BarChart3 className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="market" className="data-[state=active]:bg-[#30D5C8] data-[state=active]:text-black">
                <TrendingUp className="h-4 w-4 mr-2" />
                Market
              </TabsTrigger>
              <TabsTrigger value="news" className="data-[state=active]:bg-[#30D5C8] data-[state=active]:text-black">
                <Newspaper className="h-4 w-4 mr-2" />
                News
              </TabsTrigger>
              <TabsTrigger value="whales" className="data-[state=active]:bg-[#30D5C8] data-[state=active]:text-black">
                <Whale className="h-4 w-4 mr-2" />
                Whales
              </TabsTrigger>
              <TabsTrigger value="trading" className="data-[state=active]:bg-[#30D5C8] data-[state=active]:text-black">
                <Bot className="h-4 w-4 mr-2" />
                Trading
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <DashboardOverview />
                <QuickActions />
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <LiveCryptoPrices />
                <MarketTrends />
              </div>
            </TabsContent>

            {/* Market Tab */}
            <TabsContent value="market" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <LiveCryptoPrices />
                <MarketTrends />
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Market Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#30D5C8]">$2.1T</div>
                        <div className="text-sm text-gray-400">Total Market Cap</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#30D5C8]">$89B</div>
                        <div className="text-sm text-gray-400">24h Volume</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">+2.4%</div>
                        <div className="text-sm text-gray-400">Market Change</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#30D5C8]">47.2%</div>
                        <div className="text-sm text-gray-400">BTC Dominance</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Fear & Greed Index
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-yellow-400 mb-2">72</div>
                      <div className="text-lg text-yellow-400 mb-2">Greed</div>
                      <div className="text-sm text-gray-400">
                        Market sentiment is showing greed, indicating potential buying opportunities
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* News Tab */}
            <TabsContent value="news" className="space-y-6">
              <CryptoNewsFeed />
            </TabsContent>

            {/* Whales Tab */}
            <TabsContent value="whales" className="space-y-6">
              <WhaleAlerts />
            </TabsContent>

            {/* Trading Tab */}
            <TabsContent value="trading" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <ActiveStrategies />
                <PnLTracking />
              </div>
              <TradeLogs />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
