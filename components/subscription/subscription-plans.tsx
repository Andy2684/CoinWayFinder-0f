"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Check, Sparkles } from "lucide-react"
import { TrialBanner } from "./trial-banner"

interface Plan {
  id: string
  name: string
  price: number
  yearlyPrice: number
  features: string[]
  popular?: boolean
  current?: boolean
}

interface TrialStatus {
  isEligible: boolean
  isActive: boolean
  daysRemaining: number
}

const plans: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 29,
    yearlyPrice: 290,
    features: ["3 Trading Bots", "100 Trades/Month", "AI Market Analysis", "Basic Strategies", "Email Support"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 99,
    yearlyPrice: 990,
    popular: true,
    features: [
      "10 Trading Bots",
      "1,000 Trades/Month",
      "Advanced AI Analysis",
      "Whale Tracking",
      "All Strategies",
      "Priority Support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 299,
    yearlyPrice: 2990,
    features: [
      "Unlimited Bots",
      "Unlimited Trades",
      "Custom AI Models",
      "Advanced Analytics",
      "White-label Options",
      "Dedicated Support",
    ],
  },
]

export function SubscriptionPlans() {
  const [isYearly, setIsYearly] = useState(false)
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null)
  const [currentPlan, setCurrentPlan] = useState<string>("free")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSubscriptionStatus()
  }, [])

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch("/api/subscription/trial-status")
      if (response.ok) {
        const data = await response.json()
        setTrialStatus(data.trialStatus)
        setCurrentPlan(data.currentPlan)
      }
    } catch (error) {
      console.error("Failed to fetch subscription status:", error)
    }
  }

  const handleSubscribe = async (planId: string) => {
    setLoading(true)
    try {
      const priceId = isYearly ? `price_${planId}_yearly` : `price_${planId}_monthly`

      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}/subscription/success`,
          cancelUrl: `${window.location.origin}/subscription`,
        }),
      })

      if (response.ok) {
        const { url } = await response.json()
        window.location.href = url
      }
    } catch (error) {
      console.error("Subscription error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartTrial = async (planId: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/subscription/start-trial", {
        method: "POST",
      })

      if (response.ok) {
        await fetchSubscriptionStatus()
      }
    } catch (error) {
      console.error("Failed to start trial:", error)
    } finally {
      setLoading(false)
    }
  }

  const getButtonText = (planId: string) => {
    if (currentPlan === planId) return "Current Plan"
    if (trialStatus?.isActive) return "Upgrade"
    if (trialStatus?.isEligible) return "Start 3-Day Free Trial"
    return "Subscribe"
  }

  const getButtonAction = (planId: string) => {
    if (currentPlan === planId) return () => {}
    if (trialStatus?.isEligible) return () => handleStartTrial(planId)
    return () => handleSubscribe(planId)
  }

  const getSavings = (plan: Plan) => {
    const monthlyCost = plan.price * 12
    const savings = monthlyCost - plan.yearlyPrice
    const percentage = Math.round((savings / monthlyCost) * 100)
    return { amount: savings, percentage }
  }

  return (
    <div className="space-y-8">
      {/* Trial Banner */}
      {(trialStatus?.isEligible || trialStatus?.isActive) && <TrialBanner onStartTrial={fetchSubscriptionStatus} />}

      {/* Billing Toggle */}
      <div className="flex items-center justify-center space-x-4">
        <Label htmlFor="billing-toggle" className={!isYearly ? "font-semibold" : ""}>
          Monthly
        </Label>
        <Switch id="billing-toggle" checked={isYearly} onCheckedChange={setIsYearly} />
        <Label htmlFor="billing-toggle" className={isYearly ? "font-semibold" : ""}>
          Yearly
        </Label>
        {isYearly && (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Save up to 17%
          </Badge>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const savings = getSavings(plan)
          const price = isYearly ? plan.yearlyPrice : plan.price
          const isCurrent = currentPlan === plan.id

          return (
            <Card
              key={plan.id}
              className={`relative ${
                plan.popular ? "border-2 border-blue-500 shadow-lg" : isCurrent ? "border-2 border-green-500" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-3 py-1">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              {isCurrent && (
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-green-500 text-white">Current</Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${price}</span>
                    <span className="text-muted-foreground">/{isYearly ? "year" : "month"}</span>
                  </div>
                  {isYearly && (
                    <div className="text-sm text-green-600 mt-1">
                      Save ${savings.amount} ({savings.percentage}% off)
                    </div>
                  )}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  disabled={loading || isCurrent}
                  onClick={getButtonAction(plan.id)}
                >
                  {loading ? "Processing..." : getButtonText(plan.id)}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Trial Info */}
      {trialStatus?.isEligible && (
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Start your 3-day free trial with any plan. No credit card required.
            <br />
            Cancel anytime during the trial period.
          </p>
        </div>
      )}
    </div>
  )
}
