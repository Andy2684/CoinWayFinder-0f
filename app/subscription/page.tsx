"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Crown, Calendar, AlertTriangle, CheckCircle, Bot, Zap, Building } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

interface SubscriptionPlan {
  id: string
  name: string
  price: number
  interval: string
  features: string[]
  maxBots: number
  aiSmartBot: boolean
  priority: boolean
}

const PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free Trial",
    price: 0,
    interval: "3 days",
    features: ["1 Bot", "DCA Strategy", "Basic Analytics", "Email Support"],
    maxBots: 1,
    aiSmartBot: false,
    priority: false,
  },
  {
    id: "basic",
    name: "Basic",
    price: 29,
    interval: "month",
    features: ["3 Bots", "DCA + Grid Strategies", "Advanced Analytics", "Email Support"],
    maxBots: 3,
    aiSmartBot: false,
    priority: false,
  },
  {
    id: "premium",
    name: "Premium",
    price: 79,
    interval: "month",
    features: ["10 Bots", "All Strategies", "AI Smart Bot", "Priority Support", "Advanced Analytics"],
    maxBots: 10,
    aiSmartBot: true,
    priority: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 199,
    interval: "month",
    features: ["Unlimited Bots", "All Strategies", "AI Smart Bot", "Dedicated Support", "Custom Features"],
    maxBots: -1,
    aiSmartBot: true,
    priority: true,
  },
]

export default function SubscriptionPage() {
  const { user, refreshUser } = useAuth()
  const [upgrading, setUpgrading] = useState<string | null>(null)
  const [usageStats, setUsageStats] = useState<any>(null)

  useEffect(() => {
    if (user) {
      fetchUsageStats()
    }
  }, [user])

  const fetchUsageStats = async () => {
    try {
      const response = await fetch("/api/user/usage-stats")
      if (response.ok) {
        const data = await response.json()
        setUsageStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch usage stats:", error)
    }
  }

  const handleUpgrade = async (planId: string) => {
    setUpgrading(planId)

    try {
      const response = await fetch("/api/subscription/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Plan upgraded successfully!")
        await refreshUser()
        await fetchUsageStats()
      } else {
        toast.error(result.error || "Failed to upgrade plan")
      }
    } catch (error) {
      toast.error("Failed to upgrade plan")
    } finally {
      setUpgrading(null)
    }
  }

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case "free":
        return <Bot className="h-6 w-6" />
      case "basic":
        return <Zap className="h-6 w-6" />
      case "premium":
        return <Crown className="h-6 w-6" />
      case "enterprise":
        return <Building className="h-6 w-6" />
      default:
        return <Bot className="h-6 w-6" />
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to view subscription details</h1>
        </div>
      </div>
    )
  }

  const currentPlan = PLANS.find((p) => p.id === user.subscription.plan) || PLANS[0]
  const subscriptionStatus = user.subscriptionStatus
  const daysLeft = subscriptionStatus?.daysLeft || 0
  const progressPercentage = Math.max(0, Math.min(100, (daysLeft / 30) * 100))

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Subscription Management</h1>
        <p className="text-gray-600">Manage your subscription and upgrade your trading capabilities</p>
      </div>

      {/* Current Subscription Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold">{currentPlan.name}</span>
              <Badge variant={subscriptionStatus?.isActive ? "default" : "destructive"}>
                {subscriptionStatus?.isActive ? "Active" : "Expired"}
              </Badge>
            </div>
            <p className="text-gray-600 mb-4">
              ${currentPlan.price}/{currentPlan.interval}
            </p>

            {subscriptionStatus?.isActive && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Days remaining</span>
                  <span className="font-medium">{daysLeft} days</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Bot Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active Bots</span>
                <span className="font-medium">
                  {usageStats?.activeBots || 0} / {currentPlan.maxBots === -1 ? "∞" : currentPlan.maxBots}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Trades</span>
                <span className="font-medium">{usageStats?.totalTrades || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total P&L</span>
                <span
                  className={`font-medium ${(usageStats?.totalProfit || 0) >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  ${(usageStats?.totalProfit || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Next Billing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                {subscriptionStatus?.isActive
                  ? `Your subscription renews in ${daysLeft} days`
                  : "Subscription has expired"}
              </p>
              <p className="text-lg font-medium">{new Date(user.subscription.endDate).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Alerts */}
      {subscriptionStatus?.shouldDisconnect && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            Your subscription has expired. All bots have been automatically stopped. Please upgrade to continue trading.
          </AlertDescription>
        </Alert>
      )}

      {subscriptionStatus?.isActive && daysLeft <= 7 && (
        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-700">
            Your subscription expires in {daysLeft} days. Consider upgrading or renewing to avoid interruption.
          </AlertDescription>
        </Alert>
      )}

      {/* Available Plans */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={`relative ${plan.id === user.subscription.plan ? "ring-2 ring-blue-500" : ""} ${plan.id === "premium" ? "border-purple-200" : ""}`}
            >
              {plan.id === "premium" && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-600">Most Popular</Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">{getPlanIcon(plan.id)}</div>
                <CardTitle className="flex items-center justify-center gap-2">
                  {plan.name}
                  {plan.id === user.subscription.plan && <Badge variant="secondary">Current</Badge>}
                </CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold">${plan.price}</span>
                  {plan.price > 0 && <span className="text-gray-500">/{plan.interval}</span>}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.aiSmartBot && (
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-purple-700 text-sm font-medium">
                      <Zap className="h-4 w-4" />
                      AI Smart Bot Included
                    </div>
                    <p className="text-purple-600 text-xs mt-1">
                      Advanced AI-powered trading with market sentiment analysis
                    </p>
                  </div>
                )}

                <Button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={plan.id === user.subscription.plan || upgrading === plan.id}
                  className="w-full"
                  variant={plan.id === "premium" ? "default" : "outline"}
                >
                  {upgrading === plan.id ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Upgrading...
                    </div>
                  ) : plan.id === user.subscription.plan ? (
                    "Current Plan"
                  ) : plan.price === 0 ? (
                    "Start Free Trial"
                  ) : (
                    `Upgrade to ${plan.name}`
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* AI Smart Bot Feature Highlight */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <Zap className="h-6 w-6" />
            AI Smart Bot - Premium Feature
          </CardTitle>
          <CardDescription className="text-purple-600">
            Unlock advanced AI-powered trading capabilities with Premium and Enterprise plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-purple-700 mb-2">Smart Features</h4>
              <ul className="space-y-1 text-sm text-purple-600">
                <li>• Real-time market sentiment analysis</li>
                <li>• Adaptive strategy optimization</li>
                <li>• Risk assessment and warnings</li>
                <li>• Automated parameter tuning</li>
                <li>• News-based trading signals</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-purple-700 mb-2">Benefits</h4>
              <ul className="space-y-1 text-sm text-purple-600">
                <li>• Higher win rates with AI insights</li>
                <li>• Reduced risk through smart analysis</li>
                <li>• 24/7 market monitoring</li>
                <li>• Automatic strategy adjustments</li>
                <li>• Professional-grade performance</li>
              </ul>
            </div>
          </div>

          {!currentPlan.aiSmartBot && (
            <div className="mt-4">
              <Button onClick={() => handleUpgrade("premium")} className="bg-purple-600 hover:bg-purple-700">
                Upgrade to Premium for AI Smart Bot
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
