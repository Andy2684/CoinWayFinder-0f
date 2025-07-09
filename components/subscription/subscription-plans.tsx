"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Check, Zap, Crown, Building2 } from "lucide-react"
import { TrialBanner } from "./trial-banner"

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
}

const plans: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    description: "Perfect for getting started with automated trading",
    price: 29,
    yearlyPrice: 290,
    trialDays: 3,
    features: [
      "Up to 3 trading bots",
      "100 trades per month",
      "AI market analysis",
      "Basic trading strategies",
      "Email support",
      "Real-time notifications",
    ],
    icon: <Zap className="w-6 h-6" />,
  },
  {
    id: "premium",
    name: "Premium",
    description: "Advanced features for serious traders",
    price: 99,
    yearlyPrice: 990,
    trialDays: 3,
    popular: true,
    features: [
      "Up to 10 trading bots",
      "1,000 trades per month",
      "Advanced AI analysis",
      "Whale tracking alerts",
      "All trading strategies",
      "Priority support",
      "Custom indicators",
      "Portfolio analytics",
    ],
    icon: <Crown className="w-6 h-6" />,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Unlimited power for professional traders",
    price: 299,
    yearlyPrice: 2990,
    trialDays: 3,
    features: [
      "Unlimited trading bots",
      "Unlimited trades",
      "Custom AI models",
      "Advanced analytics",
      "White-label options",
      "Dedicated support",
      "API access",
      "Custom integrations",
    ],
    icon: <Building2 className="w-6 h-6" />,
  },
]

export function SubscriptionPlans() {
  const [isYearly, setIsYearly] = useState(false)
  const [trialStatus, setTrialStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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
    // If user has trial available, start trial first
    if (trialStatus?.hasTrialAvailable && !trialStatus?.isInTrial) {
      try {
        const response = await fetch("/api/subscription/start-trial", {
          method: "POST",
        })
        if (response.ok) {
          // Refresh trial status
          await fetchTrialStatus()
          return
        }
      } catch (error) {
        console.error("Error starting trial:", error)
      }
    }

    // Otherwise, redirect to checkout
    window.location.href = `/subscription/checkout?plan=${planId}&billing=${isYearly ? "yearly" : "monthly"}`
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>
  }

  return (
    <div className="space-y-8">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const price = isYearly ? plan.yearlyPrice : plan.price
          const savings = calculateSavings(plan.price, plan.yearlyPrice)
          const canStartTrial = trialStatus?.hasTrialAvailable && !trialStatus?.isInTrial
          const isInTrial = trialStatus?.isInTrial

          return (
            <Card
              key={plan.id}
              className={`relative ${
                plan.popular ? "border-2 border-primary shadow-lg scale-105" : "border border-border"
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">Most Popular</Badge>
              )}

              <CardHeader className="text-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10">
                  {plan.icon}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold">${price}</span>
                    <span className="text-muted-foreground ml-1">/{isYearly ? "year" : "month"}</span>
                  </div>
                  {isYearly && (
                    <div className="text-sm text-green-600 mt-1">
                      Save ${savings.amount} ({savings.percentage}%)
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handlePlanSelect(plan.id)}
                >
                  {canStartTrial
                    ? `Start ${plan.trialDays}-Day Free Trial`
                    : isInTrial
                      ? "Upgrade Plan"
                      : "Get Started"}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Trial Info */}
      {trialStatus?.hasTrialAvailable && (
        <div className="text-center text-sm text-muted-foreground">
          <p>All paid plans include a {plans[0].trialDays}-day free trial. No credit card required to start.</p>
        </div>
      )}
    </div>
  )
}
