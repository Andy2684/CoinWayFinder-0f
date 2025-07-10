"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SignalFeed } from "@/components/signals/signal-feed"
import { SignalPerformance } from "@/components/signals/signal-performance"
import { SignalAlerts } from "@/components/signals/signal-alerts"
import { SignalFilters } from "@/components/signals/signal-filters"
import { CreateSignalDialog } from "@/components/signals/create-signal-dialog"
import { Button } from "@/components/ui/button"
import { Plus, TrendingUp, AlertTriangle, BarChart3 } from "lucide-react"

export default function SignalsPage() {
  const [activeTab, setActiveTab] = useState("feed")
  const [filters, setFilters] = useState({
    symbols: [],
    strategies: [],
    exchanges: [],
    timeframes: [],
    confidenceRange: [0, 100],
    pnlRange: [-100, 100],
    riskLevels: [],
  })

  return (
    <div className="min-h-screen bg-[#0A0B0F] text-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Trading Signals</h1>
            <p className="text-gray-400">AI-powered trading recommendations and market insights</p>
          </div>
          <div className="flex gap-3">
            <CreateSignalDialog>
              <Button className="bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E]">
                <Plus className="w-4 h-4 mr-2" />
                Create Signal
              </Button>
            </CreateSignalDialog>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-[#1A1B23] border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Signals</p>
                  <p className="text-2xl font-bold text-white">24</p>
                </div>
                <TrendingUp className="w-8 h-8 text-[#30D5C8]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1A1B23] border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Win Rate</p>
                  <p className="text-2xl font-bold text-green-400">73.2%</p>
                </div>
                <BarChart3 className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1A1B23] border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total P&L</p>
                  <p className="text-2xl font-bold text-green-400">+$12,847</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1A1B23] border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Alerts</p>
                  <p className="text-2xl font-bold text-yellow-400">8</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-[#1A1B23] border-gray-800">
            <TabsTrigger value="feed" className="data-[state=active]:bg-[#30D5C8] data-[state=active]:text-[#191A1E]">
              Signal Feed
            </TabsTrigger>
            <TabsTrigger
              value="performance"
              className="data-[state=active]:bg-[#30D5C8] data-[state=active]:text-[#191A1E]"
            >
              Performance
            </TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-[#30D5C8] data-[state=active]:text-[#191A1E]">
              Alerts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <SignalFilters filters={filters} onFiltersChange={setFilters} />
              </div>
              <div className="lg:col-span-3">
                <SignalFeed filters={filters} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="performance">
            <SignalPerformance />
          </TabsContent>

          <TabsContent value="alerts">
            <SignalAlerts />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
