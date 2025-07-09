"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Loader2, Crown, Zap, Rocket } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { STRIPE_PLANS } from "@/lib/stripe"

interface SubscriptionPlansProps {
  currentPlan?: string
  onPlanSelect?: (planId: string) => void
}

export function SubscriptionPlans({ currentPlan = "free", onPlanSelect }: SubscriptionPlansProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSubscribe = async (planId: string) => {
    try {
      setLoading(planId)

      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session")
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("No checkout URL received")
      }
    } catch (error) {
      console.error("Subscription error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start checkout process",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  const plans = [
    {
      id: "free",
      name: "Free Plan",
      price: 0,
      interval: "forever",
      icon: <Zap className="h-6 w-6" />,
      features: ["1 Trading Bot", "10 Trades/Month", "Basic Strategies", "Email Support"],
      popular: false,
      buttonText: "Current Plan",
      disabled: true,
    },
    {
      id: "basic",
      name: STRIPE_PLANS.basic.name,
      price: STRIPE_PLANS.basic.price / 100,
      interval: STRIPE_PLANS.basic.interval,
      icon: <Crown className="h-6 w-6" />,
      features: STRIPE_PLANS.basic.features,
      popular: true,
      buttonText: "Start Basic Plan",
      disabled: false,
    },
    {
      id: "premium",
      name: STRIPE_PLANS.premium.name,
      price: STRIPE_PLANS.premium.price / 100,
      interval: STRIPE_PLANS.premium.interval,
      icon: <Rocket className="h-6 w-6" />,
      features: STRIPE_PLANS.premium.features,
      popular: false,
      buttonText: "Start Premium Plan",
      disabled: false,
    },
    {
      id: "enterprise",
      name: STRIPE_PLANS.enterprise.name,
      price: STRIPE_PLANS.enterprise.price / 100,
      interval: STRIPE_PLANS.enterprise.interval,
      icon: <Crown className="h-6 w-6 text-yellow-500" />,
      features: STRIPE_PLANS.enterprise.features,
      popular: false,
      buttonText: "Start Enterprise Plan",
      disabled: false,
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Choose Your Trading Plan</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Unlock advanced trading features and maximize your crypto profits with our professional plans.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative ${
              plan.popular ? "border-primary shadow-lg scale-105" : ""
            } ${currentPlan === plan.id ? "ring-2 ring-primary" : ""}`}
          >
            {plan.popular && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">Most Popular</Badge>
            )}

            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">{plan.icon}</div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/{plan.interval}</span>
              </CardDescription>
            </CardHeader>

            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter>
              <Button
                className="w-full"
                variant={plan.popular ? "default" : "outline"}
                disabled={plan.disabled || currentPlan === plan.id || loading === plan.id}
                onClick={() => plan.id !== "free" && handleSubscribe(plan.id)}
              >
                {loading === plan.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : currentPlan === plan.id ? (
                  "Current Plan"
                ) : (
                  plan.buttonText
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <div className="bg-muted/50 rounded-lg p-6 max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold mb-4">🔒 Secure Payment with Stripe</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              SSL Encrypted
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              PCI Compliant
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Cancel Anytime
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
              💳 Test Mode Active - Use card: 4242 4242 4242 4242
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Any future expiry date, any CVC, any ZIP code
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
