"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Check, Zap, Crown, Building2, Loader2, Star } from "lucide-react"
import { TrialBanner } from "./trial-banner"
import { useAuth } from "@/hooks/use-auth"

interface Plan {
  id: string
  name: string
  description: string
  price: number
  yearlyPrice: number
  features: string[]
  popular?: boolean
  icon: React.ReactNode
  trialDays: number
  limits: {
    bots: number
    trades: number
    apiCalls: number
  }
  addOns?: string[]
}

const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for getting started with automated trading",
    price: 29,
    yearlyPrice: 290,
    trialDays: 7,
    features: [
      "Up to 5 trading bots",
      "500 trades per month",
      "AI market analysis",
      "Basic trading strategies",
      "Email support",
      "Real-time notifications",
      "Portfolio tracking",
      "Risk management tools",
    ],
    limits: {
      bots: 5,
      trades: 500,
      apiCalls: 1000,
    },
    icon: <Zap className="w-6 h-6" />,
  },
  {
    id: "pro",
    name: "Pro Trader",
    description: "Advanced features for serious traders",
    price: 99,
    yearlyPrice: 990,
    trialDays: 7,
    popular: true,
    features: [
      "Up to 20 trading bots",
      "5,000 trades per month",
      "Advanced AI analysis",
      "Whale tracking alerts",
      "All trading strategies",
      "Priority support",
      "Custom indicators",
      "Portfolio analytics",
      "Backtesting tools",
      "API access",
      "Telegram notifications",
    ],
    limits: {
      bots: 20,
      trades: 5000,
      apiCalls: 10000,
    },
    icon: <Crown className="w-6 h-6" />,
    addOns: ["premium-support", "advanced-analytics"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Unlimited power for professional traders",
    price: 299,
    yearlyPrice: 2990,
    trialDays: 14,
    features: [
      "Unlimited trading bots",
      "Unlimited trades",
      "Custom AI models",
      "Advanced analytics",
      "White-label options",
      "Dedicated support",
      "Full API access",
      "Custom integrations",
      "Multi-exchange support",
      "Team collaboration",
      "Custom reporting",
      "SLA guarantee",
    ],
    limits: {
      bots: -1, // unlimited
      trades: -1, // unlimited
      apiCalls: -1, // unlimited
    },
    icon: <Building2 className="w-6 h-6" />,
    addOns: ["white-label", "dedicated-support", "custom-development"],
  },
]

interface SubscriptionPlansProps {
  currentPlan?: string
  userId?: string
}

export function SubscriptionPlans({ currentPlan = "free", userId }: SubscriptionPlansProps) {
  const { user } = useAuth()
  const [isYearly, setIsYearly] = useState(false)
  const [trialStatus, setTrialStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processingPlan, setProcessingPlan] = useState<string | null>(null)

  useEffect(() => {
    fetchTrialStatus()
  }, [])

  const fetchTrialStatus = async () => {
    try {
      const response = await fetch("/api/subscription/trial-status")
      if (response.ok) {
        const data = await response.json()
        setTrialStatus(data)
      }
    } catch (error) {
      console.error("Error fetching trial status:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateSavings = (monthlyPrice: number, yearlyPrice: number) => {
    const monthlyCost = monthlyPrice * 12
    const savings = monthlyCost - yearlyPrice
    const percentage = Math.round((savings / monthlyCost) * 100)
    return { amount: savings, percentage }
  }

  const handlePlanSelect = async (planId: string) => {
    if (!user?.id) {
      // Redirect to login
      window.location.href = "/auth/signin"
      return
    }

    setProcessingPlan(planId)

    try {
      // If user has trial available, start trial first
      if (trialStatus?.hasTrialAvailable && !trialStatus?.isInTrial) {
        const trialResponse = await fetch("/api/subscription/start-trial", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId }),
        })

        if (trialResponse.ok) {
          // Refresh trial status and redirect to dashboard
          await fetchTrialStatus()
          window.location.href = "/dashboard?trial=started"
          return
        }
      }

      // Create checkout session
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          userId: user.id,
          billingCycle: isYearly ? "yearly" : "monthly",
          addOns: [],
        }),
      })

      const data = await response.json()

      if (data.success && data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url
      } else {
        throw new Error(data.error || "Failed to create checkout session")
      }
    } catch (error) {
      console.error("Error selecting plan:", error)
      alert("Failed to process subscription. Please try again.")
    } finally {
      setProcessingPlan(null)
    }
  }

  const isPlanCurrent = (planId: string) => {
    return currentPlan === planId
  }

  const getPlanButtonText = (plan: Plan) => {
    if (processingPlan === plan.id) {
      return "Processing..."
    }

    if (isPlanCurrent(plan.id)) {
      return "Current Plan"
    }

    const canStartTrial = trialStatus?.hasTrialAvailable && !trialStatus?.isInTrial
    const isInTrial = trialStatus?.isInTrial

    if (canStartTrial) {
      return `Start ${plan.trialDays}-Day Free Trial`
    }

    if (isInTrial) {
      return "Upgrade Plan"
    }

    return "Get Started"
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading subscription plans...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Choose Your Trading Plan</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Unlock the power of AI-driven cryptocurrency trading with our flexible subscription plans
        </p>
      </div>

      {/* Trial Banner */}
      <TrialBanner />

      {/* Billing Toggle */}
      <div className="flex items-center justify-center space-x-4">
        <span className={`text-sm ${!isYearly ? "font-medium" : "text-muted-foreground"}`}>Monthly</span>
        <Switch checked={isYearly} onCheckedChange={setIsYearly} />
        <span className={`text-sm ${isYearly ? "font-medium" : "text-muted-foreground"}`}>
          Yearly
          <Badge variant="secondary" className="ml-2">
            Save up to 20%
          </Badge>
        </span>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {plans.map((plan) => {
          const price = isYearly ? plan.yearlyPrice : plan.price
          const savings = calculateSavings(plan.price, plan.yearlyPrice)
          const isCurrentPlan = isPlanCurrent(plan.id)
          const isProcessing = processingPlan === plan.id

          return (
            <Card
              key={plan.id}
              className={`relative transition-all duration-200 hover:shadow-lg ${
                plan.popular
                  ? "border-2 border-primary shadow-lg scale-105"
                  : isCurrentPlan
                    ? "border-2 border-green-500"
                    : "border border-border"
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                  <Star className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              )}

              {isCurrentPlan && <Badge className="absolute -top-3 right-4 bg-green-500">Current Plan</Badge>}

              <CardHeader className="text-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10">
                  {plan.icon}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-base">{plan.description}</CardDescription>

                <div className="mt-6">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold">${price}</span>
                    <span className="text-muted-foreground ml-1">/{isYearly ? "year" : "month"}</span>
                  </div>
                  {isYearly && (
                    <div className="text-sm text-green-600 mt-1 font-medium">
                      Save ${savings.amount} ({savings.percentage}% off)
                    </div>
                  )}
                  {!isYearly && <div className="text-sm text-muted-foreground mt-1">or ${plan.yearlyPrice}/year</div>}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Usage Limits */}
                <div className="bg-muted/50 p-3 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Usage Limits</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Trading Bots:</span>
                      <span className="font-medium">{plan.limits.bots === -1 ? "Unlimited" : plan.limits.bots}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly Trades:</span>
                      <span className="font-medium">
                        {plan.limits.trades === -1 ? "Unlimited" : plan.limits.trades.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>API Calls:</span>
                      <span className="font-medium">
                        {plan.limits.apiCalls === -1 ? "Unlimited" : plan.limits.apiCalls.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h4 className="font-semibold text-sm mb-3">Features Included</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Add-ons */}
                {plan.addOns && plan.addOns.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Available Add-ons</h4>
                    <div className="flex flex-wrap gap-1">
                      {plan.addOns.map((addOn, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {addOn.replace("-", " ")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : isCurrentPlan ? "secondary" : "outline"}
                  onClick={() => handlePlanSelect(plan.id)}
                  disabled={isCurrentPlan || isProcessing}
                >
                  {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {getPlanButtonText(plan)}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Trial Info */}
      {trialStatus?.hasTrialAvailable && (
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            All paid plans include a free trial. No credit card required to start.
          </p>
          <p className="text-xs text-muted-foreground">Cancel anytime during your trial period with no charges.</p>
        </div>
      )}

      {/* Features Comparison */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">Compare All Features</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-border">
            <thead>
              <tr className="bg-muted/50">
                <th className="border border-border p-4 text-left">Feature</th>
                {plans.map((plan) => (
                  <th key={plan.id} className="border border-border p-4 text-center">
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-border p-4 font-medium">Trading Bots</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="border border-border p-4 text-center">
                    {plan.limits.bots === -1 ? "Unlimited" : plan.limits.bots}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border border-border p-4 font-medium">Monthly Trades</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="border border-border p-4 text-center">
                    {plan.limits.trades === -1 ? "Unlimited" : plan.limits.trades.toLocaleString()}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border border-border p-4 font-medium">AI Analysis</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="border border-border p-4 text-center">
                    <Check className="w-4 h-4 text-green-500 mx-auto" />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border border-border p-4 font-medium">API Access</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="border border-border p-4 text-center">
                    {plan.id === "starter" ? (
                      <Check className="w-4 h-4 text-green-500 mx-auto" />
                    ) : (
                      <Check className="w-4 h-4 text-green-500 mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border border-border p-4 font-medium">Priority Support</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="border border-border p-4 text-center">
                    {plan.id === "pro" || plan.id === "enterprise" ? (
                      <Check className="w-4 h-4 text-green-500 mx-auto" />
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What happens if I exceed my limits?</h3>
              <p className="text-sm text-muted-foreground">
                We'll notify you when you're approaching your limits. You can upgrade your plan to continue using the
                service.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, all paid plans include a free trial period. No credit card required to start.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
              <p className="text-sm text-muted-foreground">
                Absolutely. You can cancel your subscription at any time with no cancellation fees.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
