"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Zap, Crown } from "lucide-react"
import Link from "next/link"

export function PricingSection() {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      period: "Forever",
      description: "Perfect for beginners getting started with crypto trading",
      icon: Zap,
      color: "text-green-400",
      badge: "Free",
      badgeColor: "bg-green-500/20 text-green-400 border-green-500/30",
      features: [
        "1 Trading Bot",
        "Basic Market Analysis",
        "5 Exchange Connections",
        "Email Support",
        "Mobile App Access",
        "Basic Portfolio Tracking",
      ],
      cta: "Get Started Free",
      popular: false,
    },
    {
      name: "Professional",
      price: "$29",
      period: "per month",
      description: "Advanced features for serious traders and professionals",
      icon: Star,
      color: "text-blue-400",
      badge: "Most Popular",
      badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      features: [
        "10 Trading Bots",
        "Advanced AI Analytics",
        "Unlimited Exchange Connections",
        "Priority Support",
        "Advanced Risk Management",
        "Custom Strategy Builder",
        "Backtesting Engine",
        "Copy Trading Access",
      ],
      cta: "Start Pro Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "per month",
      description: "Full-featured solution for institutions and high-volume traders",
      icon: Crown,
      color: "text-purple-400",
      badge: "Premium",
      badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      features: [
        "Unlimited Trading Bots",
        "White-label Solutions",
        "API Access & Webhooks",
        "Dedicated Account Manager",
        "Custom Integrations",
        "Advanced Reporting",
        "Multi-user Management",
        "SLA Guarantee",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ]

  return (
    <section className="py-24 bg-gradient-to-b from-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Choose Your
            <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Trading Plan
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Start free and scale as you grow. All plans include our core trading features with no hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 ${
                plan.popular ? "ring-2 ring-blue-500/50 scale-105" : "hover:scale-105"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-4 py-1">Most Popular</Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <div className="flex items-center justify-center mb-4">
                  <plan.icon className={`w-12 h-12 ${plan.color}`} />
                </div>
                <CardTitle className="text-2xl text-white mb-2">{plan.name}</CardTitle>
                <Badge className={plan.badgeColor}>{plan.badge}</Badge>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  {plan.period !== "Forever" && <span className="text-gray-400 ml-2">/{plan.period}</span>}
                </div>
                <p className="text-gray-400 mt-2">{plan.description}</p>
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
                  className={`w-full ${
                    plan.popular
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-white/10 hover:bg-white/20 border border-white/20"
                  } text-white`}
                >
                  <Link href="/auth/signup">{plan.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-400 mb-4">All plans include 14-day free trial • No setup fees • Cancel anytime</p>
          <div className="flex justify-center space-x-8 text-sm text-gray-500">
            <span>✓ 99.9% Uptime SLA</span>
            <span>✓ 24/7 Customer Support</span>
            <span>✓ Enterprise Security</span>
          </div>
        </div>
      </div>
    </section>
  )
}
