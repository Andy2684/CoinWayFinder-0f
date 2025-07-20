"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Check, Star, Zap, Crown } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth/auth-provider"

const plans = [
  {
    name: "Starter",
    icon: Zap,
    description: "Perfect for beginners",
    monthlyPrice: 29,
    yearlyPrice: 290,
    badge: null,
    features: [
      "2 Trading Bots",
      "Basic Strategies",
      "Email Support",
      "Mobile App Access",
      "Basic Analytics",
      "1 Exchange Connection",
    ],
    limitations: ["Limited to $10K trading volume", "Standard execution speed"],
  },
  {
    name: "Professional",
    icon: Star,
    description: "Most popular choice",
    monthlyPrice: 99,
    yearlyPrice: 990,
    badge: "Most Popular",
    features: [
      "10 Trading Bots",
      "Advanced Strategies",
      "Priority Support",
      "Mobile & Web App",
      "Advanced Analytics",
      "5 Exchange Connections",
      "Custom Indicators",
      "Risk Management Tools",
      "Backtesting Features",
    ],
    limitations: ["Limited to $100K trading volume"],
  },
  {
    name: "Enterprise",
    icon: Crown,
    description: "For serious traders",
    monthlyPrice: 299,
    yearlyPrice: 2990,
    badge: "Best Value",
    features: [
      "Unlimited Trading Bots",
      "All Strategies + Custom",
      "24/7 Phone Support",
      "All Platform Access",
      "Premium Analytics",
      "Unlimited Exchanges",
      "Custom Indicators",
      "Advanced Risk Management",
      "Full Backtesting Suite",
      "API Access",
      "White-label Options",
      "Dedicated Account Manager",
    ],
    limitations: [],
  },
]

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { user, loading } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  const getButtonText = (planName: string) => {
    if (!mounted || loading) return "Loading..."
    if (user) return "Upgrade Plan"
    return planName === "Starter" ? "Start Free Trial" : "Get Started"
  }

  const getButtonHref = (planName: string) => {
    if (user) return "/dashboard/settings"
    return "/auth/signup"
  }

  return (
    <section className="py-20 px-4 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-green-500/20 text-green-300 border-green-500/30">
            Pricing
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Choose Your
            <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent block mt-2">
              Trading Plan
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Start with our free trial and upgrade as you grow. All plans include our core AI trading features with no
            hidden fees or setup costs.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-lg ${!isYearly ? "text-white" : "text-gray-400"}`}>Monthly</span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} className="data-[state=checked]:bg-green-500" />
            <span className={`text-lg ${isYearly ? "text-white" : "text-gray-400"}`}>Yearly</span>
            <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30 ml-2">
              Save 20%
            </Badge>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                plan.badge === "Most Popular"
                  ? "ring-2 ring-blue-500/50 hover:shadow-blue-500/20"
                  : "hover:shadow-purple-500/20"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge
                    className={`${
                      plan.badge === "Most Popular" ? "bg-blue-500 text-white" : "bg-green-500 text-white"
                    } px-4 py-1`}
                  >
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 bg-opacity-20">
                    <plan.icon className="w-8 h-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-white mb-2">{plan.name}</CardTitle>
                <CardDescription className="text-gray-300 mb-6">{plan.description}</CardDescription>

                <div className="mb-6">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-white">
                      ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-gray-400 ml-2">/{isYearly ? "year" : "month"}</span>
                  </div>
                  {isYearly && (
                    <div className="text-sm text-green-400 mt-2">
                      Save ${plan.monthlyPrice * 12 - plan.yearlyPrice} per year
                    </div>
                  )}
                </div>

                <Button
                  asChild
                  className={`w-full ${
                    plan.badge === "Most Popular"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-purple-600 hover:bg-purple-700"
                  } text-white`}
                  disabled={!mounted || loading}
                >
                  <Link href={getButtonHref(plan.name)}>{getButtonText(plan.name)}</Link>
                </Button>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-white font-semibold mb-3">Features Included:</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-gray-300">
                          <Check className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {plan.limitations.length > 0 && (
                    <div className="pt-4 border-t border-white/10">
                      <h4 className="text-gray-400 font-semibold mb-2 text-sm">Limitations:</h4>
                      <ul className="space-y-1">
                        {plan.limitations.map((limitation, limitIndex) => (
                          <li key={limitIndex} className="text-gray-500 text-sm">
                            • {limitation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-8">Frequently Asked Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-left">
              <h4 className="text-white font-semibold mb-2">Can I change plans anytime?</h4>
              <p className="text-gray-300 text-sm">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div className="text-left">
              <h4 className="text-white font-semibold mb-2">Is there a free trial?</h4>
              <p className="text-gray-300 text-sm">
                Yes, all plans come with a 14-day free trial. No credit card required to start.
              </p>
            </div>
            <div className="text-left">
              <h4 className="text-white font-semibold mb-2">What exchanges are supported?</h4>
              <p className="text-gray-300 text-sm">
                We support 15+ major exchanges including Binance, Coinbase Pro, Kraken, and more.
              </p>
            </div>
            <div className="text-left">
              <h4 className="text-white font-semibold mb-2">Is my data secure?</h4>
              <p className="text-gray-300 text-sm">
                Yes, we use bank-grade encryption and never store your exchange withdrawal permissions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
