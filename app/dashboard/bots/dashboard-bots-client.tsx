"use client"

import { useAuth } from "@/components/auth/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BackToDashboard, FloatingDashboardButton } from "@/components/back-to-dashboard"
import { Bot, Plus } from "lucide-react"
import Link from "next/link"

export default function DashboardBotsPageClient() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-lg">Please log in to access your bots</p>
            <Link href="/auth/login">
              <Button className="mt-4">Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackToDashboard />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Trading Bots</h1>
            <p className="text-muted-foreground">Manage and monitor your automated trading bots</p>
          </div>
        </div>
        <Button asChild>
          <Link href="/bots">
            <Bot className="h-4 w-4 mr-2" />
            View All Bots
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Bitcoin Scalper
            </CardTitle>
            <CardDescription>Grid Trading Strategy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className="text-sm font-medium text-green-600">Running</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Profit</span>
                <span className="text-sm font-medium text-green-600">+$1,234.56</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Win Rate</span>
                <span className="text-sm font-medium">68.5%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              ETH DCA Bot
            </CardTitle>
            <CardDescription>Dollar Cost Average</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className="text-sm font-medium text-green-600">Running</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Profit</span>
                <span className="text-sm font-medium text-green-600">+$892.33</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Win Rate</span>
                <span className="text-sm font-medium">72.1%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <Bot className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">Create New Bot</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Set up a new automated trading bot with your preferred strategy
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Bot
            </Button>
          </CardContent>
        </Card>
      </div>

      <FloatingDashboardButton />
    </div>
  )
}
