"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SignalFeed } from "@/components/signals/signal-feed"
import { SignalPerformance } from "@/components/signals/signal-performance"
import { SignalFilters } from "@/components/signals/signal-filters"
import { CreateSignalDialog } from "@/components/signals/create-signal-dialog"
import { SignalAlerts } from "@/components/signals/signal-alerts"
import { TrendingUp, Activity, Bell, Search } from "lucide-react"

export default function SignalsPage() {
  const [activeSignals, setActiveSignals] = useState(0)
  const [totalSignals, setTotalSignals] = useState(0)
  const [successRate, setSuccessRate] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")

  useEffect(() => {
    // Simulate loading signal stats
    setActiveSignals(24)
    setTotalSignals(156)
    setSuccessRate(73.2)
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Trading Signals</h1>
          <p className="text-muted-foreground">AI-powered trading recommendations and market insights</p>
        </div>
        <div className="flex gap-2">
          <CreateSignalDialog />
          <Button variant="outline">
            <Bell className="h-4 w-4 mr-2" />
            Alerts
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Signals</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSignals}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Signals</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSignals}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8</span> new today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2.1%</span> this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Return</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12.4%</div>
            <p className="text-xs text-muted-foreground">Per successful signal</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search signals by symbol, strategy, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedFilter} onValueChange={setSelectedFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter signals" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Signals</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="high-confidence">High Confidence</SelectItem>
            <SelectItem value="scalping">Scalping</SelectItem>
            <SelectItem value="swing">Swing Trading</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="feed" className="space-y-4">
        <TabsList>
          <TabsTrigger value="feed">Signal Feed</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="filters">Advanced Filters</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-4">
          <SignalFeed searchQuery={searchQuery} filter={selectedFilter} />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <SignalPerformance />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <SignalAlerts />
        </TabsContent>

        <TabsContent value="filters" className="space-y-4">
          <SignalFilters />
        </TabsContent>
      </Tabs>
    </div>
  )
}
