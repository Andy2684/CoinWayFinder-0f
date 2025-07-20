"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { CheckCircle, X, Star, Zap, Crown } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Starter",
    icon: Zap,
    description: "Perfect for beginners",
    monthlyPrice: 29,
    yearlyPrice: 290,
    color: "blue",
    features: [
      "Up to 3 trading bots",
      "Basic trading strategies",
      "Email support",
      "Mobile app access",
      "Basic analytics",
      "1 exchange connection",
    ],
    limitations: ["Advanced strategies", "Priority support", "Custom indicators"],
  },
  {
    name: "Professional",
    icon: Star,
    description: "Most popular choice",
    monthlyPrice: 79,
    yearlyPrice: 790,
    color: "purple",
    popular: true,
    features: [
      "Up to 10 trading bots",
      "Advanced trading strategies",
      "Priority support",
      "Mobile app access",
      "Advanced analytics",
      "5 exchange connections",
      "Custom indicators",
      "Backtesting tools",
      "Risk management",
    ],
    limitations: ["White-label solution"],
  },
  {
    name: "Enterprise",
    icon: Crown,
    description: "For serious traders",
    monthlyPrice: 199,
    yearlyPrice: 1990,
    color: "gold",
    features: [
      "Unlimited trading bots",
      "All trading strategies",
      "24/7 dedicated support",
      "Mobile app access",
      "Premium analytics",
      "Unlimited exchanges",
      "Custom indicators",
      "Advanced backtesting",
      "Portfolio management",
      "White-label solution",
      "API access",
      "Custom integrations",
    ],
    limitations: [],
  },
]

const additionalFeatures = [
  "Real-time market data",
  "Secure API connections",
  "Multi-device sync",
  "Trade history export",
  "Performance reports",
  "Community access",
]

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <section className="py-24 bg-gradient-to-b from-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 mb-4">Pricing</Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Choose Your
            <span className="block bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
              Trading Plan
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Start with our free trial, then choose the plan that fits your trading goals. All plans include our core
            features with no hidden fees.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`text-sm ${!isYearly ? "text-white font-semibold" : "text-gray-400"}`}>Monthly</span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} className="data-[state=checked]:bg-purple-600" />
            <span className={`text-sm ${isYearly ? "text-white font-semibold" : "text-gray-400"}`}>Yearly</span>
            {isYearly && <Badge className="bg-green-500/20 text-green-400 border-green-500/30 ml-2">Save 17%</Badge>}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative bg-black/40 border-white/10 backdrop-blur-xl hover:bg-black/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl group ${
                plan.popular ? "ring-2 ring-purple-500/50 hover:ring-purple-400/70" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-1 font-semibold">
                    <Star className="w-4 h-4 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div
                  className={`w-16 h-16 rounded-2xl bg-${plan.color}-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
                >
                  <plan.icon className={`h-8 w-8 text-${plan.color}-400`} />
                </div>
                <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
                <CardDescription className="text-gray-400">{plan.description}</CardDescription>

                <div className="mt-6">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-white">
                      ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-gray-400 ml-2">/{isYearly ? "year" : "month"}</span>
                  </div>
                  {isYearly && (
                    <div className="text-sm text-green-400 mt-1">
                      Save ${plan.monthlyPrice * 12 - plan.yearlyPrice} per year
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features */}
                <div>
                  <h4 className="text-white font-semibold mb-3">What's included:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-gray-300">
                        <CheckCircle className={`h-4 w-4 text-${plan.color}-400 mr-3 flex-shrink-0`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Limitations */}
                {plan.limitations.length > 0 && (
                  <div>
                    <h4 className="text-gray-400 font-semibold mb-3 text-sm">Not included:</h4>
                    <ul className="space-y-2">
                      {plan.limitations.map((limitation, limitationIndex) => (
                        <li key={limitationIndex} className="flex items-center text-sm text-gray-500">
                          <X className="h-4 w-4 text-gray-500 mr-3 flex-shrink-0" />
                          {limitation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* CTA Button */}
                <Link href="/auth/signup">
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        : `bg-${plan.color}-600 hover:bg-${plan.color}-700`
                    } text-white font-semibold py-3`}
                  >
                    {plan.name === "Enterprise" ? "Contact Sales" : "Start Free Trial"}
                  </Button>
                </Link>

                <p className="text-xs text-gray-500 text-center">14-day free trial • No credit card required</p>
              </CardContent>

              {/* Hover Effect */}
              <div
                className={`absolute inset-0 bg-gradient-to-br from-${plan.color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-lg`}
              />
            </Card>
          ))}
        </div>

        {/* Additional Features */}
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold text-white mb-6">All Plans Include</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {additionalFeatures.map((feature, index) => (
              <div key={index} className="flex items-center justify-center text-gray-300 text-sm">
                <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">Frequently Asked Questions</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-white font-semibold mb-2">Can I change plans anytime?</h4>
              <p className="text-gray-400 text-sm">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">Is there a free trial?</h4>
              <p className="text-gray-400 text-sm">
                All plans come with a 14-day free trial. No credit card required to start.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">What exchanges are supported?</h4>
              <p className="text-gray-400 text-sm">
                We support 15+ major exchanges including Binance, Coinbase Pro, Kraken, and more.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">Is my data secure?</h4>
              <p className="text-gray-400 text-sm">
                Yes, we use bank-level encryption and never store your exchange API keys. All data is encrypted in
                transit and at rest.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
