"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FloatingDashboardButton } from "@/components/back-to-dashboard"
import { TrendingUp, DollarSign, Bot, Signal, NewspaperIcon as News, Settings, Wallet } from "lucide-react"
import Link from "next/link"

export default function DashboardPageClient() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your trading overview.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Link>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+20.1%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bots</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2</span> from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's P&L</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+$1,234.56</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5.2%</span> today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Signals</CardTitle>
            <Signal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">3 new</span> signals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Button asChild className="h-20 flex-col">
          <Link href="/dashboard/bots">
            <Bot className="h-6 w-6 mb-2" />
            Manage Bots
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-20 flex-col bg-transparent">
          <Link href="/signals">
            <Signal className="h-6 w-6 mb-2" />
            View Signals
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-20 flex-col bg-transparent">
          <Link href="/portfolio">
            <Wallet className="h-6 w-6 mb-2" />
            Portfolio
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-20 flex-col bg-transparent">
          <Link href="/news">
            <News className="h-6 w-6 mb-2" />
            Market News
          </Link>
        </Button>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Overview</CardTitle>
                <CardDescription>Your current holdings and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Bitcoin (BTC)</span>
                    <span className="text-sm">$28,450.00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Ethereum (ETH)</span>
                    <span className="text-sm">$12,340.00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Other Assets</span>
                    <span className="text-sm">$4,441.89</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Trades</CardTitle>
                <CardDescription>Your latest trading activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">BTC/USDT</p>
                      <p className="text-xs text-muted-foreground">Buy • 2 hours ago</p>
                    </div>
                    <span className="text-sm text-green-600">+$234.56</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">ETH/USDT</p>
                      <p className="text-xs text-muted-foreground">Sell • 4 hours ago</p>
                    </div>
                    <span className="text-sm text-red-600">-$123.45</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">ADA/USDT</p>
                      <p className="text-xs text-muted-foreground">Buy • 6 hours ago</p>
                    </div>
                    <span className="text-sm text-green-600">+$89.12</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>Detailed performance metrics and charts</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Performance charts and analytics will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recent trading and bot activity</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Recent activity feed will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <FloatingDashboardButton />
    </div>
  )
}
