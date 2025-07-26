"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Zap, Crown, Sparkles } from "lucide-react"
import Link from "next/link"

export function PricingCards() {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      period: "forever",
      description: "Perfect for beginners getting started with crypto trading",
      icon: Zap,
      color: "from-green-500 to-emerald-500",
      badge: "Most Popular",
      popular: false,
      features: [
        "1 Trading Bot",
        "Basic Trading Strategies",
        "Real-time Market Alerts",
        "Mobile App Access",
        "Community Support",
        "Basic Portfolio Analytics",
        "Paper Trading Mode",
        "Educational Resources",
      ],
      limitations: ["Limited to $1,000 monthly trading volume", "Basic customer support", "Standard execution speed"],
      cta: "Get Started Free",
      href: "/auth/signup",
    },
    {
      name: "Pro",
      price: "$29",
      period: "per month",
      originalPrice: "$39",
      description: "Advanced features for serious traders and professionals",
      icon: Star,
      color: "from-blue-500 to-purple-500",
      badge: "Best Value",
      popular: true,
      features: [
        "5 Trading Bots",
        "Advanced AI Strategies",
        "Portfolio Analytics Dashboard",
        "Risk Management Tools",
        "Priority Customer Support",
        "Custom Technical Indicators",
        "Backtesting & Optimization",
        "API Access & Webhooks",
        "Advanced Order Types",
        "Multi-Exchange Support",
        "Real-time P&L Tracking",
        "Strategy Performance Reports",
      ],
      limitations: ["Up to $50,000 monthly trading volume", "Standard API rate limits"],
      cta: "Start Pro Trial",
      href: "/auth/signup?plan=pro",
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "per month",
      originalPrice: "$149",
      description: "Full-featured solution for institutions and high-volume traders",
      icon: Crown,
      color: "from-purple-500 to-pink-500",
      badge: "Premium",
      popular: false,
      features: [
        "Unlimited Trading Bots",
        "Custom AI Model Training",
        "Advanced Analytics Suite",
        "White-label Solutions",
        "Dedicated Account Manager",
        "Custom Exchange Integrations",
        "Advanced Risk Controls",
        "Institutional-grade Security",
        "Multi-user Team Access",
        "Custom Strategy Development",
        "Priority Execution",
        "Advanced Reporting & Compliance",
        "24/7 Phone Support",
        "Custom SLA Agreement",
      ],
      limitations: [],
      cta: "Contact Sales",
      href: "/contact",
    },
  ]

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Pricing Toggle */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-white/5 backdrop-blur-xl rounded-full p-1 border border-white/10 mb-8">
            <button className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium transition-all">
              Monthly
            </button>
            <button className="px-6 py-2 rounded-full text-gray-300 hover:text-white transition-colors">
              Annual (Save 25%)
            </button>
          </div>
          <p className="text-gray-400">💡 Save up to 25% with annual billing</p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all duration-300 transform hover:scale-105 ${
                plan.popular ? "ring-2 ring-blue-500/50 shadow-2xl shadow-blue-500/20 scale-105" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 text-sm font-semibold">
                    <Sparkles className="w-3 h-3 mr-1" />
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
                  <div className="flex items-center justify-center gap-2">
                    {plan.originalPrice && (
                      <span className="text-lg text-gray-500 line-through">{plan.originalPrice}</span>
                    )}
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                  </div>
                  {plan.period && <span className="text-gray-400 text-sm">/{plan.period}</span>}
                </div>

                <CardDescription className="text-gray-300 text-base">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features List */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-white text-sm uppercase tracking-wide">What's Included:</h4>
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5">
                        <Check className="h-3 w-3 text-green-400" />
                      </div>
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Limitations */}
                {plan.limitations.length > 0 && (
                  <div className="pt-4 border-t border-white/10">
                    <h4 className="font-semibold text-gray-400 text-sm uppercase tracking-wide mb-2">Limitations:</h4>
                    {plan.limitations.map((limitation, limitIndex) => (
                      <p key={limitIndex} className="text-sm text-gray-500 mb-1">
                        • {limitation}
                      </p>
                    ))}
                  </div>
                )}

                {/* CTA Button */}
                <div className="pt-6">
                  <Link href={plan.href}>
                    <Button
                      className={`w-full py-3 font-semibold rounded-xl transition-all duration-300 ${
                        plan.popular
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
                          : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                      }`}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
