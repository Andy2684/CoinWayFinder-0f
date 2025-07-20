"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SignalFeed } from "@/components/signals/signal-feed"
import { SignalPerformance } from "@/components/signals/signal-performance"
import { SignalAlerts } from "@/components/signals/signal-alerts"
import { SignalFilters } from "@/components/signals/signal-filters"
import { CreateSignalDialog } from "@/components/signals/create-signal-dialog"
import { BackToDashboard } from "@/components/back-to-dashboard"
import { Plus, TrendingUp, Target, Bell, Activity, RefreshCw } from "lucide-react"

export default function SignalsPage() {
  const [createSignalOpen, setCreateSignalOpen] = useState(false)

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackToDashboard />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Trading Signals</h1>
            <p className="text-muted-foreground">Monitor market signals and automated trading opportunities</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setCreateSignalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Signal
          </Button>
        </div>
      </div>

      {/* Signal Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Signals</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+3</span> from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">78.5%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2.1%</span> this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Generated</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+$5,432.10</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.3%</span> this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-yellow-600">3 high priority</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Signal Filters */}
      <SignalFilters />

      {/* Signal Management Tabs */}
      <Tabs defaultValue="feed" className="space-y-4">
        <TabsList>
          <TabsTrigger value="feed">Signal Feed</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="feed">
          <SignalFeed />
        </TabsContent>

        <TabsContent value="performance">
          <SignalPerformance />
        </TabsContent>

        <TabsContent value="alerts">
          <SignalAlerts />
        </TabsContent>
      </Tabs>

      <CreateSignalDialog open={createSignalOpen} onOpenChange={setCreateSignalOpen} />
    </div>
  )
}
