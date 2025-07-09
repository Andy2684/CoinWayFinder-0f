"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, Zap, Crown, Building, Gift, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"

interface SubscriptionPlan {
  id: string
  name: string
  price: number
  interval: "month" | "year"
  features: {
    maxBots: number
    strategies: string[]
    exchanges: string[]
    aiRiskAnalysis: boolean
    prioritySupport: boolean
    advancedAnalytics: boolean
    customStrategies: boolean
    apiAccess: boolean
  }
  limits: {
    maxInvestmentPerBot: number
    maxDailyTrades: number
    maxLeverage: number
  }
}

interface SubscriptionInfo {
  currentPlan: SubscriptionPlan
  usageStats: {
    botsUsed: number
    botsLimit: number
    dailyTrades: number
    dailyTradesLimit: number
    planName: string
  }
  isTrialExpired: boolean
  availablePlans: SubscriptionPlan[]
}

export function SubscriptionPlans() {
  const { user } = useAuth()
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchSubscriptionInfo()
    }
  }, [user])

  const fetchSubscriptionInfo = async () => {
    try {
      const response = await fetch(`/api/subscription?userId=${user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setSubscriptionInfo(data)
      }
    } catch (error) {
      console.error("Failed to fetch subscription info:", error)
      toast.error("Failed to load subscription information")
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (planId: string) => {
    if (!user) {
      toast.error("Please sign in to upgrade your plan")
      return
    }

    setUpgrading(planId)

    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId,
          interval: "month",
        }),
      })

      const result = await response.json()

      if (result.success && result.url) {
        // Redirect to Stripe Checkout
        window.location.href = result.url
      } else {
        toast.error(result.error || "Failed to create checkout session")
      }
    } catch (error) {
      console.error("Upgrade failed:", error)
      toast.error("Failed to upgrade plan")
    } finally {
      setUpgrading(null)
    }
  }

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case "free":
        return <Gift className="h-6 w-6" />
      case "basic":
        return <Zap className="h-6 w-6" />
      case "premium":
        return <Crown className="h-6 w-6" />
      case "enterprise":
        return <Building className="h-6 w-6" />
      default:
        return <Zap className="h-6 w-6" />
    }
  }

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case "free":
        return "border-gray-200"
      case "basic":
        return "border-blue-200"
      case "premium":
        return "border-purple-200 ring-2 ring-purple-100"
      case "enterprise":
        return "border-orange-200"
      default:
        return "border-gray-200"
    }
  }

  const formatLimit = (value: number) => {
    return value === -1 ? "Unlimited" : value.toLocaleString()
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[...Array(6)].map((_, j) => (
                  <div key={j} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!subscriptionInfo) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Failed to load subscription information</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Usage Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Current Usage</CardTitle>
          <CardDescription>Your current plan usage and limits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {subscriptionInfo.usageStats.botsUsed}
                {subscriptionInfo.usageStats.botsLimit !== -1 && (
                  <span className="text-gray-400">/{subscriptionInfo.usageStats.botsLimit}</span>
                )}
              </div>
              <p className="text-sm text-gray-500">Active Bots</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {subscriptionInfo.usageStats.dailyTrades}
                {subscriptionInfo.usageStats.dailyTradesLimit !== -1 && (
                  <span className="text-gray-400">/{subscriptionInfo.usageStats.dailyTradesLimit}</span>
                )}
              </div>
              <p className="text-sm text-gray-500">Daily Trades</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{subscriptionInfo.usageStats.planName}</div>
              <p className="text-sm text-gray-500">Current Plan</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {subscriptionInfo.availablePlans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative ${getPlanColor(plan.id)} ${
              plan.id === subscriptionInfo.currentPlan.id ? "ring-2 ring-blue-500" : ""
            }`}
          >
            {plan.id === "premium" && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-purple-500 text-white">Most Popular</Badge>
              </div>
            )}

            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">{getPlanIcon(plan.id)}</div>
              <CardTitle className="flex items-center justify-center gap-2">
                {plan.name}
                {plan.id === subscriptionInfo.currentPlan.id && <Badge variant="secondary">Current</Badge>}
              </CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold">${plan.price}</span>
                {plan.price > 0 && <span className="text-gray-500">/{plan.interval}</span>}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Features</h4>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    {formatLimit(plan.features.maxBots)} Bots
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    {plan.features.strategies.length} Strategies
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    {plan.features.exchanges.length} Exchanges
                  </li>
                  <li className="flex items-center gap-2">
                    {plan.features.aiRiskAnalysis ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                    AI Risk Analysis
                  </li>
                  <li className="flex items-center gap-2">
                    {plan.features.prioritySupport ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                    Priority Support
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Limits</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>${formatLimit(plan.limits.maxInvestmentPerBot)} per bot</li>
                  <li>{formatLimit(plan.limits.maxDailyTrades)} daily trades</li>
                  <li>{formatLimit(plan.limits.maxLeverage)}x max leverage</li>
                </ul>
              </div>
            </CardContent>

            <CardFooter>
              {plan.id === subscriptionInfo.currentPlan.id ? (
                <Button disabled className="w-full">
                  Current Plan
                </Button>
              ) : (
                <Button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={upgrading === plan.id}
                  className="w-full"
                  variant={plan.id === "premium" ? "default" : "outline"}
                >
                  {upgrading === plan.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : plan.price === 0 ? (
                    "Start Free Trial"
                  ) : (
                    "Upgrade"
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Trial Expiration Warning */}
      {subscriptionInfo.isTrialExpired && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Trial Expired</CardTitle>
            <CardDescription className="text-red-600">
              Your free trial has expired. Please upgrade to continue using the platform.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}
