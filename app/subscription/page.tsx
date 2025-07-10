"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Check, Crown, Zap, Shield, TrendingUp, Bot, Globe, AlertTriangle, CreditCard, Users } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface SubscriptionPlan {
  id: string
  name: string
  price: number
  interval: "month" | "year"
  features: string[]
  limits: {
    bots: number
    apiCalls: number
    exchanges: number
    strategies: number
  }
  popular?: boolean
  current?: boolean
}

interface UserSubscription {
  plan: string
  status: "active" | "cancelled" | "expired" | "trial"
  currentPeriodEnd: string
  trialEnd?: string
  usage: {
    bots: number
    apiCalls: number
    exchanges: number
  }
}

export default function SubscriptionPage() {
  const [loading, setLoading] = useState(false)
  const [billingInterval, setBillingInterval] = useState<"month" | "year">("month")
  const [userSubscription, setUserSubscription] = useState<UserSubscription>({
    plan: "starter",
    status: "trial",
    currentPeriodEnd: "2024-01-14T00:00:00Z",
    trialEnd: "2024-01-14T00:00:00Z",
    usage: {
      bots: 2,
      apiCalls: 1247,
      exchanges: 2,
    },
  })

  const plans: SubscriptionPlan[] = [
    {
      id: "starter",
      name: "Starter",
      price: billingInterval === "month" ? 29 : 290,
      interval: billingInterval,
      features: [
        "Up to 3 trading bots",
        "Basic strategies (DCA, Grid)",
        "2 exchange connections",
        "Email support",
        "Basic analytics",
        "Mobile app access",
      ],
      limits: {
        bots: 3,
        apiCalls: 1000,
        exchanges: 2,
        strategies: 2,
      },
    },
    {
      id: "pro",
      name: "Pro",
      price: billingInterval === "month" ? 79 : 790,
      interval: billingInterval,
      popular: true,
      features: [
        "Up to 10 trading bots",
        "All strategies + AI signals",
        "5 exchange connections",
        "Priority support",
        "Advanced analytics",
        "API access",
        "Risk management tools",
        "Custom indicators",
      ],
      limits: {
        bots: 10,
        apiCalls: 10000,
        exchanges: 5,
        strategies: 8,
      },
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: billingInterval === "month" ? 199 : 1990,
      interval: billingInterval,
      features: [
        "Unlimited trading bots",
        "All strategies + custom AI",
        "Unlimited exchanges",
        "24/7 phone support",
        "White-label options",
        "Dedicated account manager",
        "Custom integrations",
        "Advanced risk controls",
      ],
      limits: {
        bots: -1, // unlimited
        apiCalls: 100000,
        exchanges: -1, // unlimited
        strategies: -1, // unlimited
      },
    },
  ]

  const handleUpgrade = async (planId: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/subscription/upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "demo-user",
        },
        body: JSON.stringify({
          planId,
          interval: billingInterval,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Redirect to Stripe checkout
        window.location.href = data.checkoutUrl
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to start upgrade process",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process upgrade request",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (
      !confirm(
        "Are you sure you want to cancel your subscription? You'll lose access to premium features at the end of your billing period.",
      )
    ) {
      return
    }

    try {
      const response = await fetch("/api/subscription", {
        method: "DELETE",
        headers: {
          "x-user-id": "demo-user",
        },
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Subscription Cancelled",
          description:
            "Your subscription has been cancelled. You'll retain access until the end of your billing period.",
        })
        // Refresh subscription status
        setUserSubscription((prev) => ({ ...prev, status: "cancelled" }))
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to cancel subscription",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel subscription",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0 // unlimited
    return Math.min((used / limit) * 100, 100)
  }

  const currentPlan = plans.find((plan) => plan.id === userSubscription.plan)
  const isTrialActive = userSubscription.status === "trial" && userSubscription.trialEnd
  const trialDaysLeft = isTrialActive
    ? Math.max(
        0,
        Math.ceil((new Date(userSubscription.trialEnd!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
      )
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Subscription & Billing</h1>
          <p className="text-gray-400">Manage your subscription and upgrade your trading capabilities</p>
        </div>

        {/* Trial Banner */}
        {isTrialActive && (
          <Alert className="mb-8 border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Free Trial Active:</strong> You have {trialDaysLeft} days left in your trial. Upgrade now to
              continue using premium features after {formatDate(userSubscription.trialEnd!)}.
            </AlertDescription>
          </Alert>
        )}

        {/* Current Subscription Status */}
        <Card className="bg-gray-900/50 border-gray-800 mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-[#30D5C8]" />
                  Current Subscription
                </CardTitle>
                <CardDescription className="text-gray-400">Your current plan and usage</CardDescription>
              </div>
              <Badge
                className={`${
                  userSubscription.status === "active"
                    ? "bg-green-500/10 text-green-400"
                    : userSubscription.status === "trial"
                      ? "bg-blue-500/10 text-blue-400"
                      : userSubscription.status === "cancelled"
                        ? "bg-yellow-500/10 text-yellow-400"
                        : "bg-red-500/10 text-red-400"
                }`}
              >
                {userSubscription.status === "trial" ? "Free Trial" : userSubscription.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-white font-medium mb-3">Plan Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Plan</span>
                    <span className="text-white capitalize">{currentPlan?.name || userSubscription.plan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status</span>
                    <span className="text-white capitalize">{userSubscription.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{isTrialActive ? "Trial Ends" : "Next Billing"}</span>
                    <span className="text-white">
                      {formatDate(isTrialActive ? userSubscription.trialEnd! : userSubscription.currentPeriodEnd)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-white font-medium mb-3">Usage This Month</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Trading Bots</span>
                      <span className="text-white">
                        {userSubscription.usage.bots} /{" "}
                        {currentPlan?.limits.bots === -1 ? "∞" : currentPlan?.limits.bots}
                      </span>
                    </div>
                    <Progress
                      value={getUsagePercentage(userSubscription.usage.bots, currentPlan?.limits.bots || 0)}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">API Calls</span>
                      <span className="text-white">
                        {userSubscription.usage.apiCalls.toLocaleString()} /{" "}
                        {currentPlan?.limits.apiCalls.toLocaleString()}
                      </span>
                    </div>
                    <Progress
                      value={getUsagePercentage(userSubscription.usage.apiCalls, currentPlan?.limits.apiCalls || 0)}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Exchanges</span>
                      <span className="text-white">
                        {userSubscription.usage.exchanges} /{" "}
                        {currentPlan?.limits.exchanges === -1 ? "∞" : currentPlan?.limits.exchanges}
                      </span>
                    </div>
                    <Progress
                      value={getUsagePercentage(userSubscription.usage.exchanges, currentPlan?.limits.exchanges || 0)}
                      className="h-2"
                    />
                  </div>
                </div>
              </div>
            </div>

            {userSubscription.status === "active" && (
              <div className="mt-6 pt-6 border-t border-gray-700">
                <Button
                  variant="outline"
                  onClick={handleCancelSubscription}
                  className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white bg-transparent"
                >
                  Cancel Subscription
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4 bg-gray-800/50 p-1 rounded-lg">
            <button
              onClick={() => setBillingInterval("month")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingInterval === "month" ? "bg-[#30D5C8] text-black" : "text-gray-400 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval("year")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingInterval === "year" ? "bg-[#30D5C8] text-black" : "text-gray-400 hover:text-white"
              }`}
            >
              Yearly
              <Badge className="ml-2 bg-green-500/10 text-green-400 text-xs">Save 17%</Badge>
            </button>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`bg-gray-900/50 border-gray-800 relative ${plan.popular ? "ring-2 ring-[#30D5C8]" : ""} ${
                plan.id === userSubscription.plan ? "border-[#30D5C8]" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-[#30D5C8] text-black">Most Popular</Badge>
                </div>
              )}

              {plan.id === userSubscription.plan && (
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-green-500/10 text-green-400">Current Plan</Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 mx-auto mb-4 bg-[#30D5C8]/10 rounded-lg flex items-center justify-center">
                  {plan.id === "starter" && <Zap className="w-6 h-6 text-[#30D5C8]" />}
                  {plan.id === "pro" && <Crown className="w-6 h-6 text-[#30D5C8]" />}
                  {plan.id === "enterprise" && <Shield className="w-6 h-6 text-[#30D5C8]" />}
                </div>
                <CardTitle className="text-white text-xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">${plan.price}</span>
                  <span className="text-gray-400">/{plan.interval}</span>
                </div>
                {billingInterval === "year" && (
                  <p className="text-sm text-green-400 mt-1">
                    Save ${Math.round((plan.price / 10) * 12 - plan.price)} per year
                  </p>
                )}
              </CardHeader>

              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-white font-medium mb-3">Features</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <Check className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-3">Limits</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center">
                      <Bot className="w-4 h-4 text-[#30D5C8] mr-2" />
                      <span className="text-gray-300">{plan.limits.bots === -1 ? "∞" : plan.limits.bots} bots</span>
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 text-[#30D5C8] mr-2" />
                      <span className="text-gray-300">{plan.limits.apiCalls.toLocaleString()} API calls</span>
                    </div>
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 text-[#30D5C8] mr-2" />
                      <span className="text-gray-300">
                        {plan.limits.exchanges === -1 ? "∞" : plan.limits.exchanges} exchanges
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-[#30D5C8] mr-2" />
                      <span className="text-gray-300">
                        {plan.limits.strategies === -1 ? "∞" : plan.limits.strategies} strategies
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={loading || plan.id === userSubscription.plan}
                  className={`w-full ${
                    plan.id === userSubscription.plan
                      ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                      : plan.popular
                        ? "bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-black"
                        : "bg-gray-700 hover:bg-gray-600 text-white"
                  }`}
                >
                  {plan.id === userSubscription.plan
                    ? "Current Plan"
                    : loading
                      ? "Processing..."
                      : `Upgrade to ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-white font-medium mb-2">Can I change my plan anytime?</h3>
              <p className="text-gray-400 text-sm">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately for upgrades,
                and at the end of your billing cycle for downgrades.
              </p>
            </div>
            <div>
              <h3 className="text-white font-medium mb-2">What happens if I exceed my limits?</h3>
              <p className="text-gray-400 text-sm">
                If you exceed your plan limits, you'll receive notifications to upgrade. API requests may be throttled,
                and new bot creation will be disabled until you upgrade.
              </p>
            </div>
            <div>
              <h3 className="text-white font-medium mb-2">Is there a free trial?</h3>
              <p className="text-gray-400 text-sm">
                Yes, all new users get a 7-day free trial with full access to Pro features. No credit card required to
                start your trial.
              </p>
            </div>
            <div>
              <h3 className="text-white font-medium mb-2">How secure is my data?</h3>
              <p className="text-gray-400 text-sm">
                We use bank-level encryption and never store your exchange API secret keys in plain text. All data is
                encrypted at rest and in transit.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
