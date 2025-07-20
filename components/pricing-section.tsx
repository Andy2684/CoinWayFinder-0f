"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Check, Star } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

export function PricingSection() {
  const { user, loading } = useAuth()
  const [isYearly, setIsYearly] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const plans = [
    {
      name: "Starter",
      description: "Perfect for beginners getting started with automated trading",
      monthlyPrice: 29,
      yearlyPrice: 290,
      features: [
        "Up to 3 trading bots",
        "Basic trading strategies",
        "Real-time market data",
        "Email support",
        "Mobile app access",
        "Basic portfolio analytics",
      ],
      popular: false,
      cta: "Start Free Trial",
    },
    {
      name: "Pro",
      description: "Advanced features for serious traders and professionals",
      monthlyPrice: 99,
      yearlyPrice: 990,
      features: [
        "Unlimited trading bots",
        "Advanced AI strategies",
        "Priority market data",
        "24/7 priority support",
        "Advanced analytics",
        "Custom indicators",
        "API access",
        "Risk management tools",
      ],
      popular: true,
      cta: "Start Free Trial",
    },
    {
      name: "Enterprise",
      description: "Custom solutions for institutions and high-volume traders",
      monthlyPrice: 299,
      yearlyPrice: 2990,
      features: [
        "Everything in Pro",
        "Dedicated account manager",
        "Custom bot development",
        "White-label solutions",
        "Advanced reporting",
        "SLA guarantee",
        "Custom integrations",
        "Institutional support",
      ],
      popular: false,
      cta: "Contact Sales",
    },
  ]

  if (!mounted) {
    return (
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="h-12 bg-gray-700 rounded mb-6 mx-auto max-w-md animate-pulse"></div>
            <div className="h-6 bg-gray-700 rounded mb-8 mx-auto max-w-2xl animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-gray-700 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Choose Your
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block">
              Trading Plan
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Start with a free trial and scale as you grow. All plans include our core features and 24/7 support.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`text-lg ${!isYearly ? "text-white" : "text-gray-400"}`}>Monthly</span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} className="data-[state=checked]:bg-blue-600" />
            <span className={`text-lg ${isYearly ? "text-white" : "text-gray-400"}`}>Yearly</span>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Save 20%</Badge>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative bg-black/40 border-white/10 backdrop-blur-xl hover:bg-black/50 transition-all duration-300 hover:shadow-lg ${
                plan.popular ? "hover:shadow-blue-500/20 border-blue-500/30 scale-105" : "hover:shadow-purple-500/20"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-white mb-2">{plan.name}</CardTitle>
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
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-300">
                      <Check className="h-4 w-4 text-green-400 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="pt-6">
                  {loading ? (
                    <div className="h-12 bg-gray-700 rounded animate-pulse"></div>
                  ) : user ? (
                    <Link href="/dashboard">
                      <Button
                        className={`w-full ${
                          plan.popular
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            : "bg-white/10 hover:bg-white/20 border border-white/20"
                        }`}
                        size="lg"
                      >
                        Go to Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <Link href={plan.name === "Enterprise" ? "/contact" : "/auth/signup"}>
                      <Button
                        className={`w-full ${
                          plan.popular
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            : "bg-white/10 hover:bg-white/20 border border-white/20"
                        }`}
                        size="lg"
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="text-center mt-12">
          <p className="text-gray-400">
            All plans include a 14-day free trial. No credit card required. Cancel anytime.
          </p>
        </div>
      </div>
    </section>
  )
}
