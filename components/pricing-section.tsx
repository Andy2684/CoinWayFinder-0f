"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Zap, Crown } from "lucide-react"
import Link from "next/link"

export function PricingSection() {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      period: "forever",
      description: "Perfect for beginners getting started with crypto trading",
      icon: Zap,
      color: "from-green-500 to-emerald-500",
      badge: "Most Popular",
      features: [
        "1 Trading Bot",
        "Basic Strategies",
        "Real-time Alerts",
        "Mobile App Access",
        "Community Support",
        "Basic Analytics",
      ],
      limitations: ["Limited to $1,000 trading volume", "Basic customer support"],
    },
    {
      name: "Pro",
      price: "$29",
      period: "per month",
      description: "Advanced features for serious traders and professionals",
      icon: Star,
      color: "from-blue-500 to-purple-500",
      badge: "Best Value",
      popular: true,
      features: [
        "5 Trading Bots",
        "Advanced AI Strategies",
        "Portfolio Analytics",
        "Risk Management Tools",
        "Priority Support",
        "Custom Indicators",
        "Backtesting Tools",
        "API Access",
      ],
      limitations: ["Up to $50,000 trading volume"],
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "per month",
      description: "Full-featured solution for institutions and high-volume traders",
      icon: Crown,
      color: "from-purple-500 to-pink-500",
      badge: "Premium",
      features: [
        "Unlimited Trading Bots",
        "Custom AI Models",
        "Advanced Analytics Suite",
        "White-label Solutions",
        "Dedicated Account Manager",
        "Custom Integrations",
        "Advanced Risk Controls",
        "Institutional Support",
        "Multi-user Access",
      ],
      limitations: [],
    },
  ]

  return (
    <section className="py-20 px-4 relative">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Trading Plan
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Start free and upgrade as you grow. All plans include our core trading features.
          </p>

          {/* Pricing Toggle */}
          <div className="inline-flex items-center bg-white/5 backdrop-blur-xl rounded-full p-1 border border-white/10">
            <button className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium">
              Monthly
            </button>
            <button className="px-6 py-2 rounded-full text-gray-300 hover:text-white transition-colors">
              Annual (Save 20%)
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all duration-300 transform hover:scale-105 ${
                plan.popular ? "ring-2 ring-blue-500/50 shadow-2xl shadow-blue-500/20" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 text-sm font-semibold">
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-r ${plan.color} mb-4 mx-auto shadow-lg`}>
                  <plan.icon className="h-8 w-8 text-white" />
                </div>

                <CardTitle className="text-2xl font-bold text-white mb-2">{plan.name}</CardTitle>

                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  {plan.period && <span className="text-gray-400 ml-2">/{plan.period}</span>}
                </div>

                <CardDescription className="text-gray-300 text-base">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features List */}
                <div className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Check className="h-3 w-3 text-green-400" />
                      </div>
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Limitations */}
                {plan.limitations.length > 0 && (
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-sm text-gray-400 mb-2">Limitations:</p>
                    {plan.limitations.map((limitation, limitIndex) => (
                      <p key={limitIndex} className="text-sm text-gray-500">
                        • {limitation}
                      </p>
                    ))}
                  </div>
                )}

                {/* CTA Button */}
                <div className="pt-6">
                  <Link href="/auth/signup">
                    <Button
                      className={`w-full py-3 font-semibold rounded-xl transition-all duration-300 ${
                        plan.popular
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
                          : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                      }`}
                    >
                      {plan.price === "Free" ? "Get Started Free" : `Start ${plan.name} Plan`}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">All Plans Include</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-300">
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span>Bank-grade security</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span>24/7 trading automation</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span>Real-time market data</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-gray-400">
                Need a custom solution?
                <Link href="/contact" className="text-blue-400 hover:text-blue-300 ml-1 font-medium">
                  Contact our sales team
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
