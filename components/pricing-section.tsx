"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Zap, Crown, Rocket } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for beginners to get started with automated trading",
    icon: Zap,
    badge: "Most Popular",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    features: [
      "1 Trading Bot",
      "Basic Strategies",
      "Email Support",
      "Mobile App Access",
      "Basic Analytics",
      "Demo Trading",
    ],
    buttonText: "Start Free",
    buttonVariant: "default" as const,
    highlighted: true,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "Advanced features for serious traders",
    icon: Star,
    badge: "Best Value",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    features: [
      "5 Trading Bots",
      "Advanced AI Strategies",
      "Priority Support",
      "Advanced Analytics",
      "Risk Management Tools",
      "Multi-Exchange Support",
      "Custom Indicators",
      "Backtesting",
    ],
    buttonText: "Go Pro",
    buttonVariant: "outline" as const,
    highlighted: false,
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "/month",
    description: "For professional traders and institutions",
    icon: Crown,
    badge: "Premium",
    badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    features: [
      "Unlimited Trading Bots",
      "Custom AI Strategies",
      "Dedicated Support",
      "White-label Solution",
      "API Access",
      "Advanced Risk Controls",
      "Institutional Features",
      "Custom Integrations",
      "Priority Execution",
    ],
    buttonText: "Contact Sales",
    buttonVariant: "outline" as const,
    highlighted: false,
  },
]

export function PricingSection() {
  return (
    <section className="py-20 px-4 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-green-500/20 text-green-300 border-green-500/30">
            <Rocket className="w-4 h-4 mr-2" />
            Simple Pricing
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Choose Your
            <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent block">
              Trading Plan
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Start free and scale as you grow. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all duration-300 ${
                plan.highlighted ? "ring-2 ring-blue-500/50 scale-105" : ""
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className={plan.badgeColor}>{plan.badge}</Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-white/10">
                    <plan.icon className="w-8 h-8 text-blue-400" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-white mb-2">{plan.name}</CardTitle>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  {plan.period && <span className="text-gray-400">{plan.period}</span>}
                </div>
                <CardDescription className="text-gray-300">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-300">
                      <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  variant={plan.buttonVariant}
                  className={`w-full ${
                    plan.buttonVariant === "default"
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "border-white/20 text-white hover:bg-white/10 bg-transparent"
                  }`}
                >
                  <Link href={plan.name === "Enterprise" ? "/contact" : "/auth/signup"}>{plan.buttonText}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-8">Frequently Asked Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-left">
              <h4 className="font-semibold text-white mb-2">Can I change plans anytime?</h4>
              <p className="text-gray-300 text-sm">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-white mb-2">Is there a free trial?</h4>
              <p className="text-gray-300 text-sm">
                Our Starter plan is completely free forever. No credit card required to get started.
              </p>
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-white mb-2">What exchanges are supported?</h4>
              <p className="text-gray-300 text-sm">
                We support all major exchanges including Binance, Coinbase, Kraken, KuCoin, and more.
              </p>
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-white mb-2">Is my data secure?</h4>
              <p className="text-gray-300 text-sm">
                Yes, we use bank-grade encryption and never store your exchange API secret keys.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
