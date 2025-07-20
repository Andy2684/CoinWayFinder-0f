"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Star, ArrowRight, UserPlus, LogIn } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "forever",
    description: "Perfect for beginners getting started with crypto trading",
    features: [
      "Basic trading bot",
      "Up to 3 active strategies",
      "Real-time market data",
      "Email support",
      "Basic portfolio tracking",
      "Community access",
    ],
    popular: false,
    cta: "Start Free",
    ctaVariant: "outline" as const,
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "Advanced features for serious traders",
    features: [
      "Advanced AI trading bots",
      "Unlimited strategies",
      "Advanced analytics",
      "Priority support",
      "Risk management tools",
      "Custom indicators",
      "API access",
      "Advanced portfolio management",
    ],
    popular: true,
    cta: "Start Pro Trial",
    ctaVariant: "default" as const,
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "per month",
    description: "For professional traders and institutions",
    features: [
      "Everything in Pro",
      "White-label solution",
      "Dedicated account manager",
      "Custom integrations",
      "Advanced reporting",
      "Multi-user accounts",
      "SLA guarantee",
      "Custom development",
    ],
    popular: false,
    cta: "Contact Sales",
    ctaVariant: "outline" as const,
  },
]

export function PricingSection() {
  const { user } = useAuth()

  return (
    <section className="py-24 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Choose Your
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}
              Trading Plan
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Start free and upgrade as you grow. All plans include our core AI trading features with no hidden fees or
            long-term commitments.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                plan.popular
                  ? "border-2 border-blue-500 shadow-xl scale-105"
                  : "border border-gray-200 hover:border-blue-300"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-2">
                  <Badge className="bg-white/20 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className={`text-center ${plan.popular ? "pt-12" : "pt-8"}`}>
                <CardTitle className="text-2xl font-bold text-gray-900">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.price !== "Free" && <span className="text-gray-600 ml-2">/{plan.period}</span>}
                </div>
                <CardDescription className="mt-4 text-gray-600">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="space-y-3">
                  <Link href={user ? "/dashboard" : "/auth/signup"}>
                    <Button
                      className={`w-full py-3 font-semibold ${
                        plan.popular
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                          : ""
                      }`}
                      variant={plan.ctaVariant}
                    >
                      {plan.cta}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>

                  {!user && (
                    <Link href="/auth/login">
                      <Button variant="ghost" className="w-full text-gray-600 hover:text-gray-900">
                        <LogIn className="w-4 h-4 mr-2" />
                        Sign In
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Not sure which plan is right for you?</h3>
          <p className="text-gray-600 mb-6">Start with our free plan and upgrade anytime. No credit card required.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 font-semibold">
                <UserPlus className="w-4 h-4 mr-2" />
                Create Free Account
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 font-semibold bg-transparent"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
