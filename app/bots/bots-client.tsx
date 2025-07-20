"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ActiveBots } from "@/components/bots/active-bots"
import { BotPerformance } from "@/components/bots/bot-performance"
import { BotStrategies } from "@/components/bots/bot-strategies"
import { BotsOverview } from "@/components/bots/bots-overview"
import { CreateBotDialog } from "@/components/bots/create-bot-dialog"
import { ArrowLeft, Plus, Bot, TrendingUp, Activity, DollarSign } from "lucide-react"
import Link from "next/link"

export default function BotsClient() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-white hover:text-gray-300">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Trading Bots</h1>
                <p className="text-gray-400">Manage and monitor your automated trading strategies</p>
              </div>
            </div>
            <Button onClick={() => setShowCreateDialog(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Bot
            </Button>
          </div>

          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Bots</CardTitle>
                <Bot className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+2</span> from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">+$3,247.89</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+12.3%</span> this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">68.5%</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+3.2%</span> vs last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Trades</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-blue-600">Running</span> across all bots
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="active">Active Bots</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="strategies">Strategies</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <BotsOverview />
            </TabsContent>

            <TabsContent value="active">
              <ActiveBots />
            </TabsContent>

            <TabsContent value="performance">
              <BotPerformance />
            </TabsContent>

            <TabsContent value="strategies">
              <BotStrategies />
            </TabsContent>
          </Tabs>

          {/* Create Bot Dialog */}
          <CreateBotDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
        </div>
      </div>
    </div>
  )
}
