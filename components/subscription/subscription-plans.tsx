"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Check, Sparkles, Zap, Crown, Building } from "lucide-react"
import { TrialBanner } from "./trial-banner"

interface SubscriptionPlansProps {
  currentPlan: string
  userId?: string
}

const plans = [
  {
    id: "basic",
    name: "Basic",
    icon: Zap,
    description: "Perfect for getting started with automated trading",
    monthlyPrice: 29,
    yearlyPrice: 290,
    features: [
      "Up to 3 trading bots",
      "100 trades per month",
      "AI market analysis",
      "Basic strategies",
      "Email support",
      "Mobile notifications",
    ],
    popular: false,
    trialDays: 3,
  },
  {
    id: "premium",
    name: "Premium",
    icon: Crown,
    description: "Advanced features for serious traders",
    monthlyPrice: 99,
    yearlyPrice: 990,
    features: [
      "Up to 10 trading bots",
      "1,000 trades per month",
      "Advanced AI analysis",
      "Whale movement tracking",
      "Premium strategies",
      "Priority support",
      "API access",
      "Custom indicators",
    ],
    popular: true,
    trialDays: 3,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    icon: Building,
    description: "Unlimited power for professional traders",
    monthlyPrice: 299,
    yearlyPrice: 2990,
    features: [
      "Unlimited trading bots",
      "Unlimited trades",
      "All AI features",
      "Custom strategies",
      "24/7 dedicated support",
      "Full API access",
      "White-label options",
      "Custom integrations",
    ],
    popular: false,
    trialDays: 3,
  },
]

export function SubscriptionPlans({ currentPlan, userId }: SubscriptionPlansProps) {
  const [isYearly, setIsYearly] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)

  const handleUpgrade = async (planId: string) => {
    if (!userId) return

    setLoading(planId)
    try {
      const response = await fetch("/api/subscription/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          plan: planId,
          billing: isYearly ? "yearly" : "monthly",
        }),
      })

      const data = await response.json()

      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else if (data.success) {
        window.location.reload()
      }
    } catch (error) {
      console.error("Upgrade error:", error)
    } finally {
      setLoading(null)
    }
  }

  const calculateSavings = (monthlyPrice: number, yearlyPrice: number) => {
    const monthlyCost = monthlyPrice * 12
    const savings = monthlyCost - yearlyPrice
    const percentage = Math.round((savings / monthlyCost) * 100)
    return { savings, percentage }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Choose Your Trading Plan</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Start with a 3-day free trial, then upgrade to unlock advanced features
        </p>

        {/* Trial Banner */}
        <div className="mb-8">
          <TrialBanner />
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className={`text-sm ${!isYearly ? "font-semibold" : "text-muted-foreground"}`}>Monthly</span>
          <Switch checked={isYearly} onCheckedChange={setIsYearly} className="data-[state=checked]:bg-green-600" />
          <span className={`text-sm ${isYearly ? "font-semibold" : "text-muted-foreground"}`}>Yearly</span>
          {isYearly && (
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              Save up to 20%
            </Badge>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const Icon = plan.icon
          const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice
          const savings = isYearly ? calculateSavings(plan.monthlyPrice, plan.yearlyPrice) : null
          const isCurrentPlan = currentPlan === plan.id
          const isTrialPlan = currentPlan === "trial"

          return (
            <Card
              key={plan.id}
              className={`relative ${
                plan.popular ? "border-2 border-blue-500 shadow-lg scale-105" : "border border-border"
              } ${isCurrentPlan ? "ring-2 ring-green-500" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-4 py-1">Most Popular</Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div
                    className={`p-3 rounded-full ${
                      plan.popular ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Icon className="h-8 w-8" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-sm">{plan.description}</CardDescription>

                <div className="mt-4">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">${price}</span>
                    <span className="text-muted-foreground">/{isYearly ? "year" : "month"}</span>
                  </div>
                  {isYearly && savings && (
                    <div className="text-sm text-green-600 font-medium mt-1">
                      Save ${savings.savings} ({savings.percentage}%)
                    </div>
                  )}
                  {!isCurrentPlan && !isTrialPlan && (
                    <div className="text-sm text-blue-600 font-medium mt-2">
                      <Sparkles className="h-4 w-4 inline mr-1" />
                      {plan.trialDays}-day free trial
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={loading === plan.id || isCurrentPlan}
                >
                  {loading === plan.id
                    ? "Processing..."
                    : isCurrentPlan
                      ? "Current Plan"
                      : isTrialPlan
                        ? "Upgrade from Trial"
                        : `Start ${plan.trialDays}-Day Free Trial`}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <div className="text-center mt-12">
        <p className="text-muted-foreground mb-4">All plans include our core trading features and mobile app access</p>
        <div className="flex justify-center gap-8 text-sm text-muted-foreground">
          <span>✓ Real-time market data</span>
          <span>✓ Secure API connections</span>
          <span>✓ 24/7 bot monitoring</span>
          <span>✓ Risk management tools</span>
        </div>
      </div>
    </div>
  )
}
