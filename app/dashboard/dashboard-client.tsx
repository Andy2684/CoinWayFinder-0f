"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, TrendingUp, DollarSign, Activity, Users, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function DashboardClient() {
  const [portfolioValue] = useState(125430.5)
  const [dailyChange] = useState(2.34)
  const [activeBots] = useState(12)
  const [totalTrades] = useState(1847)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-white">Trading Dashboard</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${portfolioValue.toLocaleString()}</div>
              <p className="text-xs text-green-400 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />+{dailyChange}% from yesterday
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Bots</CardTitle>
              <Activity className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeBots}</div>
              <p className="text-xs text-blue-400">3 new this week</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTrades.toLocaleString()}</div>
              <p className="text-xs text-purple-400">+12% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <Users className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78.5%</div>
              <p className="text-xs text-yellow-400">Above average</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription className="text-gray-300">Manage your trading activities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/dashboard/bots">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Manage Bots</Button>
              </Link>
              <Link href="/signals">
                <Button
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent"
                >
                  View Signals
                </Button>
              </Link>
              <Link href="/portfolio">
                <Button
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent"
                >
                  Portfolio Analysis
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription className="text-gray-300">Latest trading activities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">BTC/USDT Trade</p>
                  <p className="text-sm text-gray-400">2 minutes ago</p>
                </div>
                <Badge className="bg-green-600">+$234.50</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">ETH/USDT Trade</p>
                  <p className="text-sm text-gray-400">15 minutes ago</p>
                </div>
                <Badge className="bg-red-600">-$45.20</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New Bot Created</p>
                  <p className="text-sm text-gray-400">1 hour ago</p>
                </div>
                <Badge variant="outline" className="border-blue-400 text-blue-400">
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
          <Link href="/dashboard/settings">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
              Settings
            </Button>
          </Link>
          <Link href="/integrations">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
              Integrations
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
