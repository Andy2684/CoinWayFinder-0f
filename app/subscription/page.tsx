"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/hooks/use-auth"
import { Crown, Zap, Shield, TrendingUp, Brain, CheckCircle, AlertTriangle } from "lucide-react"

interface UsageStats {
  botsCreated: number
  maxBots: number
  tradesExecuted: number
  maxTrades: number
  aiAnalysisUsed: number
  maxAiAnalysis: number
}

export default function SubscriptionPage() {
  const { user, refreshUser } = useAuth()
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsageStats()
  }, [])

  const fetchUsageStats = async () => {
    try {
      const response = await fetch("/api/user/usage-stats")
      const data = await response.json()

      if (data.success) {
        setUsageStats(data.stats)
      }
    } catch (error) {
      console.error("Failed to fetch usage stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (plan: string) => {
    try {
      const response = await fetch("/api/subscription/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      })

      const data = await response.json()

      if (data.success) {
        await refreshUser()
        // Redirect to payment or show success message
      }
    } catch (error) {
      console.error("Upgrade error:", error)
    }
  }

  const getSubscriptionStatus = () => {
    if (!user?.subscription) return { status: "No subscription", color: "text-muted-foreground" }

    const { status, endDate } = user.subscription
    const daysLeft = Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

    if (status === "expired") {
      return { status: "Expired", color: "text-red-600" }
    }

    if (daysLeft <= 7 && status === "active") {
      return { status: `Expires in ${daysLeft} days`, color: "text-yellow-600" }
    }

    return { status: "Active", color: "text-green-600" }
  }

  const subscriptionStatus = getSubscriptionStatus()

  const plans = [
    {
      name: "Free Trial",
      price: "$0",
      period: "3 days",
      description: "Perfect for getting started",
      features: ["2 Trading Bots", "100 Trades/month", "Basic Strategies", "Email Support", "Basic Risk Management"],
      maxBots: 2,
      maxTrades: 100,
      maxAiAnalysis: 0,
      aiFeatures: false,
      current: user?.subscription?.plan === "free",
    },
    {
      name: "Basic",
      price: "$29",
      period: "month",
      description: "For individual traders",
      features: [
        "5 Trading Bots",
        "1,000 Trades/month",
        "All Basic Strategies",
        "Priority Support",
        "Advanced Risk Management",
        "Portfolio Analytics",
      ],
      maxBots: 5,
      maxTrades: 1000,
      maxAiAnalysis: 50,
      aiFeatures: false,
      current: user?.subscription?.plan === "basic",
    },
    {
      name: "Premium",
      price: "$99",
      period: "month",
      description: "For serious traders with AI",
      features: [
        "15 Trading Bots",
        "10,000 Trades/month",
        "All Strategies + AI Smart Bot",
        "24/7 Priority Support",
        "AI Risk Analysis",
        "Market Sentiment Analysis",
        "News-based Trading Signals",
        "Advanced Portfolio Analytics",
      ],
      maxBots: 15,
      maxTrades: 10000,
      maxAiAnalysis: 500,
      aiFeatures: true,
      current: user?.subscription?.plan === "premium",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$299",
      period: "month",
      description: "For professional trading teams",
      features: [
        "Unlimited Trading Bots",
        "Unlimited Trades",
        "All Features + Custom Strategies",
        "Dedicated Account Manager",
        "Advanced AI Features",
        "Custom Integrations",
        "White-label Options",
        "API Access",
      ],
      maxBots: 999,
      maxTrades: 999999,
      maxAiAnalysis: 9999,
      aiFeatures: true,
      current: user?.subscription?.plan === "enterprise",
    },
  ]

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-96 bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Subscription & Usage</h1>
          <p className="text-xl text-muted-foreground">Manage your subscription and monitor your usage</p>
        </div>

        {/* Current Subscription Status */}
        {user?.subscription && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Current Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    {user.subscription.plan.charAt(0).toUpperCase() + user.subscription.plan.slice(1)} Plan
                  </h3>
                  <p className={`text-sm ${subscriptionStatus.color}`}>{subscriptionStatus.status}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Expires</p>
                  <p className="font-medium">{new Date(user.subscription.endDate).toLocaleDateString()}</p>
                </div>
              </div>

              {user.subscription.status === "expired" && (
                <Alert className="border-red-500">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-red-600">
                    Your subscription has expired. All trading bots have been stopped. Please upgrade to continue
                    trading.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Usage Statistics */}
        {usageStats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Usage Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Trading Bots</span>
                    <span className="text-sm text-muted-foreground">
                      {usageStats.botsCreated}/{usageStats.maxBots}
                    </span>
                  </div>
                  <Progress value={(usageStats.botsCreated / usageStats.maxBots) * 100} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Trades This Month</span>
                    <span className="text-sm text-muted-foreground">
                      {usageStats.tradesExecuted}/{usageStats.maxTrades}
                    </span>
                  </div>
                  <Progress value={(usageStats.tradesExecuted / usageStats.maxTrades) * 100} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">AI Analysis</span>
                    <span className="text-sm text-muted-foreground">
                      {usageStats.aiAnalysisUsed}/{usageStats.maxAiAnalysis || "N/A"}
                    </span>
                  </div>
                  <Progress
                    value={usageStats.maxAiAnalysis ? (usageStats.aiAnalysisUsed / usageStats.maxAiAnalysis) * 100 : 0}
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subscription Plans */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center">Choose Your Plan</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative ${plan.popular ? "border-primary shadow-lg" : ""} ${plan.current ? "ring-2 ring-primary" : ""}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">Most Popular</Badge>
                )}

                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2">
                    {plan.aiFeatures && <Brain className="h-5 w-5 text-purple-500" />}
                    {plan.name}
                    {plan.current && <CheckCircle className="h-4 w-4 text-green-500" />}
                  </CardTitle>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold">
                      {plan.price}
                      <span className="text-lg font-normal text-muted-foreground">/{plan.period}</span>
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {plan.aiFeatures && (
                    <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-2 text-sm font-medium text-purple-700">
                        <Brain className="h-4 w-4" />
                        AI Smart Bot Features
                      </div>
                      <ul className="mt-2 space-y-1 text-xs text-purple-600">
                        <li>• Market sentiment analysis</li>
                        <li>• Adaptive strategy optimization</li>
                        <li>• News-based trading signals</li>
                        <li>• Advanced risk assessment</li>
                      </ul>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    variant={plan.current ? "outline" : "default"}
                    disabled={plan.current}
                    onClick={() => !plan.current && handleUpgrade(plan.name.toLowerCase())}
                  >
                    {plan.current ? "Current Plan" : `Upgrade to ${plan.name}`}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* AI Features Highlight */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Brain className="h-6 w-6" />
              AI Smart Bot - Premium Feature
            </CardTitle>
            <CardDescription className="text-purple-600">
              Unlock the power of artificial intelligence for your trading strategies
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-purple-700 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Real-time Market Analysis
                </h4>
                <p className="text-sm text-purple-600">
                  AI continuously analyzes market conditions and adjusts your trading parameters for optimal
                  performance.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-purple-700 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Advanced Risk Management
                </h4>
                <p className="text-sm text-purple-600">
                  AI-powered risk assessment prevents dangerous trades and protects your capital with intelligent
                  warnings.
                </p>
              </div>
            </div>

            {(!user?.subscription || !["premium", "enterprise"].includes(user.subscription.plan)) && (
              <Button
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                onClick={() => handleUpgrade("premium")}
              >
                <Crown className="mr-2 h-4 w-4" />
                Upgrade to Premium for AI Features
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
