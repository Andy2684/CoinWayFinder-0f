"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Zap, Crown, UserPlus, LogIn } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

export function PricingSection() {
  const { user } = useAuth()

  const plans = [
    {
      name: "Starter",
      price: "Free",
      period: "forever",
      description: "Perfect for beginners who want to try automated trading",
      features: [
        "1 Trading Bot",
        "Basic Strategies",
        "Email Support",
        "Mobile App Access",
        "Basic Analytics",
        "Paper Trading",
      ],
      limitations: ["Limited to $1,000 trading volume", "Basic market data only"],
      cta: "Get Started Free",
      popular: false,
      icon: Zap,
    },
    {
      name: "Pro",
      price: "$29",
      period: "per month",
      description: "For serious traders who want advanced features and higher limits",
      features: [
        "5 Trading Bots",
        "Advanced Strategies",
        "Priority Support",
        "Mobile & Web App",
        "Advanced Analytics",
        "Live Trading",
        "Custom Indicators",
        "Backtesting Tools",
        "Risk Management",
      ],
      limitations: [],
      cta: "Start Pro Trial",
      popular: true,
      icon: Star,
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "per month",
      description: "For professional traders and institutions with unlimited needs",
      features: [
        "Unlimited Trading Bots",
        "Custom Strategies",
        "24/7 Phone Support",
        "All Platform Access",
        "Premium Analytics",
        "Live Trading",
        "API Access",
        "White-label Options",
        "Dedicated Account Manager",
        "Custom Integrations",
      ],
      limitations: [],
      cta: "Contact Sales",
      popular: false,
      icon: Crown,
    },
  ]

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent" />

      <div className="relative max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium mb-6">
            <Star className="w-4 h-4 mr-2" />
            Simple Pricing
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Choose Your
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent block">
              Trading Plan
            </span>
          </h2>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Start free and scale as you grow. All plans include our core AI trading features with different limits and
            advanced capabilities.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 ${
                plan.popular ? "ring-2 ring-purple-500/50 scale-105" : ""
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  Most Popular
                </Badge>
              )}

              <CardHeader className="text-center">
                <div
                  className={`w-12 h-12 rounded-lg mx-auto mb-4 flex items-center justify-center ${
                    plan.popular
                      ? "bg-gradient-to-br from-purple-500 to-pink-500"
                      : "bg-gradient-to-br from-blue-500 to-purple-500"
                  }`}
                >
                  <plan.icon className="w-6 h-6 text-white" />
                </div>

                <CardTitle className="text-white text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-gray-300 mb-4">{plan.description}</CardDescription>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  {plan.period && <span className="text-gray-400 ml-2">/{plan.period}</span>}
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-300">
                      <Check className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                  {plan.limitations.map((limitation, idx) => (
                    <li key={idx} className="flex items-center text-gray-500 text-sm">
                      <div className="w-4 h-4 mr-3 flex-shrink-0" />
                      {limitation}
                    </li>
                  ))}
                </ul>

                <div className="space-y-3">
                  <Button
                    asChild
                    className={`w-full font-semibold ${
                      plan.popular
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                        : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    }`}
                  >
                    <Link href={user ? "/dashboard" : "/auth/signup"}>{plan.cta}</Link>
                  </Button>

                  {!user && (
                    <Button asChild variant="ghost" className="w-full text-gray-400 hover:text-white hover:bg-white/10">
                      <Link href="/auth/login" className="flex items-center justify-center">
                        <LogIn className="w-4 h-4 mr-2" />
                        Sign In
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="bg-white/5 rounded-2xl p-8 border border-white/10 backdrop-blur-sm mb-16">
          <h3 className="text-2xl font-bold text-white text-center mb-8">All Plans Include</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-white font-semibold mb-2">Secure Trading</h4>
              <p className="text-gray-400 text-sm">Bank-level security for all your trades</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-white font-semibold mb-2">Fast Execution</h4>
              <p className="text-gray-400 text-sm">Lightning-fast trade execution</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-white font-semibold mb-2">24/7 Support</h4>
              <p className="text-gray-400 text-sm">Round-the-clock customer support</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center mx-auto mb-3">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-white font-semibold mb-2">Regular Updates</h4>
              <p className="text-gray-400 text-sm">Continuous platform improvements</p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        {!user && (
          <div className="text-center bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-2xl p-8 border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-4">Start Your Free Trial Today</h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              No credit card required. Get full access to all Pro features for 14 days.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8"
              >
                <Link href="/auth/signup" className="flex items-center">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Create Free Account
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 px-8 bg-transparent"
              >
                <Link href="/auth/login" className="flex items-center">
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
