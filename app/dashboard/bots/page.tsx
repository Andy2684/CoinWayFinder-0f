"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ActiveBots } from "@/components/bots/active-bots"
import { BotPerformance } from "@/components/bots/bot-performance"
import { BotStrategies } from "@/components/bots/bot-strategies"
import { BotsOverview } from "@/components/bots/bots-overview"
import { CreateBotDialog } from "@/components/bots/create-bot-dialog"
import { BackToDashboard, FloatingDashboardButton } from "@/components/back-to-dashboard"
import { Plus, Bot, TrendingUp, Activity, AlertCircle } from "lucide-react"

export default function BotsPage() {
  const [createBotOpen, setCreateBotOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackToDashboard />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Trading Bots</h1>
            <p className="text-muted-foreground">Manage your automated trading strategies and monitor performance</p>
          </div>
        </div>
        <Button onClick={() => setCreateBotOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Bot
        </Button>
      </div>

      {/* Bot Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bots</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+$8,234.56</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+15.2%</span> this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">73.5%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2.1%</span> vs last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-yellow-600">2 warnings</span>, 1 error
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bot Management Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Bots</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <ActiveBots />
        </TabsContent>

        <TabsContent value="performance">
          <BotPerformance />
        </TabsContent>

        <TabsContent value="strategies">
          <BotStrategies />
        </TabsContent>

        <TabsContent value="overview">
          <BotsOverview />
        </TabsContent>
      </Tabs>

      <CreateBotDialog open={createBotOpen} onOpenChange={setCreateBotOpen} />
      <FloatingDashboardButton />
    </div>
  )
}
