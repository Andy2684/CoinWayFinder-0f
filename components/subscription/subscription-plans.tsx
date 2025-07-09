"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Loader2, Crown, Zap, Rocket, ExternalLink } from "lucide-react"
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

  const handleCryptoPayment = () => {
    window.open(
      "https://commerce.coinbase.com/checkout/d8e91b96-8299-4b72-a9ed-77981687a3cc",
      "_blank",
      "noopener,noreferrer",
    )
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

            <CardFooter className="flex flex-col gap-2">
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

              {plan.id !== "free" && currentPlan !== plan.id && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs bg-transparent"
                  onClick={handleCryptoPayment}
                >
                  🪙 Pay with Crypto
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <div className="bg-muted/50 rounded-lg p-6 max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold mb-4">🔒 Secure Payment Options</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Stripe Payment */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">💳 Credit Card (Stripe)</h4>
              <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                <li>• SSL Encrypted & PCI Compliant</li>
                <li>• Instant activation</li>
                <li>• Cancel anytime</li>
                <li>• Test: 4242 4242 4242 4242</li>
              </ul>
            </div>

            {/* Crypto Payment */}
            <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
              <h4 className="font-semibold text-orange-700 dark:text-orange-300 mb-2">🪙 Cryptocurrency (Coinbase)</h4>
              <ul className="text-sm text-orange-600 dark:text-orange-400 space-y-1">
                <li>• Bitcoin, Ethereum, USDC</li>
                <li>• Secure blockchain payments</li>
                <li>• No chargebacks</li>
                <li>• Manual activation (24h)</li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <p className="text-sm font-medium text-green-700 dark:text-green-300">
              ✅ Both payment methods unlock the same premium features
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              Crypto payments may take up to 24 hours for manual verification and activation
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
