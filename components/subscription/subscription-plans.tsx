"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Check, Loader2, Zap, ExternalLink, Users, TrendingUp, Bot } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { STRIPE_PLANS, ADD_ONS } from "@/lib/stripe"

interface SubscriptionPlansProps {
  currentPlan?: string
  userId?: string
  onPlanSelect?: (planId: string) => void
}

export function SubscriptionPlans({ currentPlan = "free", userId, onPlanSelect }: SubscriptionPlansProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])
  const { toast } = useToast()

  const handleSubscribe = async (planId: string) => {
    if (!userId) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe to a plan.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(planId)

      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId,
          userId,
          addOns: selectedAddOns,
        }),
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

  const toggleAddOn = (addOnId: string) => {
    setSelectedAddOns((prev) => (prev.includes(addOnId) ? prev.filter((id) => id !== addOnId) : [...prev, addOnId]))
  }

  const calculateTotal = (planPrice: number) => {
    const addOnTotal = selectedAddOns.reduce((total, addOnId) => {
      const addOn = ADD_ONS[addOnId as keyof typeof ADD_ONS]
      return total + (addOn ? addOn.price : 0)
    }, 0)
    return (planPrice + addOnTotal) / 100
  }

  const plans = [
    {
      id: "free",
      name: "Free Plan (Trial)",
      price: 0,
      interval: "3 days",
      icon: <Zap className="h-6 w-6 text-green-500" />,
      color: "green",
      emoji: "🟢",
      features: [
        "1 Active AI Trading Bot (DCA or Scalping)",
        "Real-Time Market Signals (limited)",
        "Telegram Group Access",
        "Whale Wallet Tracker (read-only)",
        "Crypto Analytics Dashboard (basic)",
        "Referral Bonus: Invite a friend = +5 days free",
      ],
      popular: false,
      buttonText: "Current Plan",
      disabled: true,
    },
    {
      id: "starter",
      name: STRIPE_PLANS.starter.name,
      price: STRIPE_PLANS.starter.price / 100,
      interval: STRIPE_PLANS.starter.interval,
      icon: <Bot className="h-6 w-6 text-blue-500" />,
      color: "blue",
      emoji: "🔵",
      features: STRIPE_PLANS.starter.features,
      popular: false,
      buttonText: "Start Starter Plan",
      disabled: false,
    },
    {
      id: "pro",
      name: STRIPE_PLANS.pro.name,
      price: STRIPE_PLANS.pro.price / 100,
      interval: STRIPE_PLANS.pro.interval,
      icon: <TrendingUp className="h-6 w-6 text-yellow-500" />,
      color: "yellow",
      emoji: "🟡",
      features: STRIPE_PLANS.pro.features,
      popular: true,
      buttonText: "Start Pro Trader",
      disabled: false,
      badge: "Best for Active Futures & Spot Traders",
    },
    {
      id: "enterprise",
      name: STRIPE_PLANS.enterprise.name,
      price: STRIPE_PLANS.enterprise.price / 100,
      interval: STRIPE_PLANS.enterprise.interval,
      icon: <Users className="h-6 w-6 text-red-500" />,
      color: "red",
      emoji: "🔴",
      features: STRIPE_PLANS.enterprise.features,
      popular: false,
      buttonText: "Start Enterprise",
      disabled: false,
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold mb-4">CoinWayfinder Pricing Plans</h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Flexible plans for traders, analysts, and crypto enthusiasts of all levels.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-12">
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
              <CardTitle className="text-xl flex items-center justify-center gap-2">
                <span className="text-2xl">{plan.emoji}</span>
                {plan.name}
              </CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/{plan.interval}</span>
              </CardDescription>
              {plan.badge && (
                <Badge variant="outline" className="mt-2">
                  {plan.badge}
                </Badge>
              )}
            </CardHeader>

            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
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

      {/* Add-ons Section */}
      <div className="max-w-4xl mx-auto mb-12">
        <h3 className="text-2xl font-bold text-center mb-6">🧲 Optional Add-ons</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(ADD_ONS).map(([id, addOn]) => (
            <Card key={id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Checkbox id={id} checked={selectedAddOns.includes(id)} onCheckedChange={() => toggleAddOn(id)} />
                  <div>
                    <label htmlFor={id} className="font-medium cursor-pointer">
                      {addOn.name}
                    </label>
                    <p className="text-sm text-muted-foreground">{addOn.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">${addOn.price / 100}</div>
                  <div className="text-xs text-muted-foreground">
                    {addOn.interval === "one_time" ? "once" : `/${addOn.interval}`}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-muted/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-6 text-center">💳 Payment Methods</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-center">
              <div className="text-2xl mb-2">💳</div>
              <h4 className="font-semibold text-blue-700 dark:text-blue-300">Credit/Debit Cards</h4>
              <p className="text-xs text-blue-600 dark:text-blue-400">(via Stripe)</p>
            </div>

            <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg text-center">
              <div className="text-2xl mb-2">🪙</div>
              <h4 className="font-semibold text-orange-700 dark:text-orange-300">Crypto Payments</h4>
              <p className="text-xs text-orange-600 dark:text-orange-400">(Coinbase Commerce)</p>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg text-center">
              <div className="text-2xl mb-2">💰</div>
              <h4 className="font-semibold text-purple-700 dark:text-purple-300">PayPal</h4>
              <p className="text-xs text-purple-600 dark:text-purple-400">(on request)</p>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg text-center">
              <div className="text-2xl mb-2">🏦</div>
              <h4 className="font-semibold text-green-700 dark:text-green-300">Bank Transfer</h4>
              <p className="text-xs text-green-600 dark:text-green-400">(Enterprise only)</p>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stripe Payment Details */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">💳 Credit Card (Stripe)</h4>
              <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                <li>✅ SSL Encrypted & PCI Compliant</li>
                <li>✅ Instant activation</li>
                <li>✅ Cancel anytime</li>
                <li>🧪 Test: 4242 4242 4242 4242</li>
              </ul>
            </div>

            {/* Crypto Payment Details */}
            <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
              <h4 className="font-semibold text-orange-700 dark:text-orange-300 mb-2">🪙 Cryptocurrency (Coinbase)</h4>
              <ul className="text-sm text-orange-600 dark:text-orange-400 space-y-1">
                <li>✅ Bitcoin, Ethereum, USDC</li>
                <li>✅ Secure blockchain payments</li>
                <li>✅ No chargebacks</li>
                <li>⏱️ Manual activation (24h)</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg text-center">
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
