"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"
import { Check, Star, Zap, Crown, UserPlus, LogIn } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false)
  const { user } = useAuth()

  const plans = [
    {
      name: "Starter",
      description: "Perfect for beginners getting started with crypto trading",
      monthlyPrice: 29,
      annualPrice: 290,
      icon: Zap,
      badge: "Most Popular",
      features: [
        "Up to 3 AI Trading Bots",
        "Basic Market Analysis",
        "Email Support",
        "Mobile App Access",
        "Basic Portfolio Tracking",
        "Standard Security Features",
      ],
      limitations: ["Limited to 5 trades per day", "Basic technical indicators only"],
    },
    {
      name: "Professional",
      description: "Advanced features for serious traders and professionals",
      monthlyPrice: 79,
      annualPrice: 790,
      icon: Star,
      badge: "Best Value",
      popular: true,
      features: [
        "Unlimited AI Trading Bots",
        "Advanced Market Analysis",
        "Priority Support",
        "Web & Mobile Access",
        "Advanced Portfolio Analytics",
        "Enhanced Security Features",
        "Custom Trading Strategies",
        "Real-time Alerts",
        "API Access",
        "Backtesting Tools",
      ],
      limitations: [],
    },
    {
      name: "Enterprise",
      description: "Complete solution for institutions and high-volume traders",
      monthlyPrice: 199,
      annualPrice: 1990,
      icon: Crown,
      badge: "Premium",
      features: [
        "Everything in Professional",
        "Dedicated Account Manager",
        "24/7 Phone Support",
        "Custom Integrations",
        "Advanced Risk Management",
        "Institutional-grade Security",
        "White-label Solutions",
        "Custom Reporting",
        "SLA Guarantee",
        "On-premise Deployment",
      ],
      limitations: [],
    },
  ]

  return (
    <section id="pricing" className="py-20 px-4 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent" />

      <div className="container mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="mb-4 bg-purple-600/20 text-purple-400 border-purple-600/30">Simple Pricing</Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Choose Your
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {" "}
              Trading Plan
            </span>
          </h2>
          <p className="text-xl text-gray-300 leading-relaxed mb-8">
            Start with our free trial, then choose the plan that fits your trading style. All plans include our core AI
            trading features.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm ${!isAnnual ? "text-white" : "text-gray-400"}`}>Monthly</span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-600 data-[state=checked]:to-purple-600"
            />
            <span className={`text-sm ${isAnnual ? "text-white" : "text-gray-400"}`}>Annual</span>
            {isAnnual && <Badge className="bg-green-600/20 text-green-400 border-green-600/30">Save 17%</Badge>}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 transition-all duration-300 ${
                plan.popular ? "ring-2 ring-blue-500/50 scale-105" : ""
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge
                    className={`${
                      plan.popular
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                        : "bg-gray-600/20 text-gray-400 border-gray-600/30"
                    }`}
                  >
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div
                    className={`p-3 rounded-lg ${
                      plan.popular ? "bg-gradient-to-r from-blue-600 to-purple-600" : "bg-gray-600/20"
                    }`}
                  >
                    <plan.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
                <p className="text-gray-400 text-sm">{plan.description}</p>
              </CardHeader>

              <CardContent>
                {/* Pricing */}
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-white">
                      ${isAnnual ? Math.floor(plan.annualPrice / 12) : plan.monthlyPrice}
                    </span>
                    <span className="text-gray-400">/month</span>
                  </div>
                  {isAnnual && <p className="text-sm text-gray-400 mt-1">Billed annually (${plan.annualPrice}/year)</p>}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                  {plan.limitations.map((limitation, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      <div className="h-4 w-4 mt-0.5 flex-shrink-0 flex items-center justify-center">
                        <div className="h-1 w-3 bg-gray-500 rounded" />
                      </div>
                      <span className="text-gray-500">{limitation}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Buttons */}
                <div className="space-y-2">
                  {user ? (
                    <Button
                      asChild
                      className={`w-full ${
                        plan.popular
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          : "bg-white/10 hover:bg-white/20 text-white"
                      }`}
                    >
                      <Link href="/dashboard/settings">Upgrade to {plan.name}</Link>
                    </Button>
                  ) : (
                    <>
                      <Button
                        asChild
                        className={`w-full ${
                          plan.popular
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            : "bg-white/10 hover:bg-white/20 text-white"
                        }`}
                      >
                        <Link href="/auth/signup">
                          <UserPlus className="mr-2 h-4 w-4" />
                          Get Started
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant="ghost"
                        className="w-full text-gray-400 hover:text-white hover:bg-white/5"
                      >
                        <Link href="/auth/login">
                          <LogIn className="mr-2 h-4 w-4" />
                          Sign In
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl p-8 md:p-12 backdrop-blur-lg border border-white/10">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">Frequently Asked Questions</h3>
            <p className="text-gray-300">Everything you need to know about our pricing and features</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-semibold mb-2">Can I change plans anytime?</h4>
              <p className="text-gray-400 text-sm">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">Is there a free trial?</h4>
              <p className="text-gray-400 text-sm">
                Yes, all plans come with a 7-day free trial. No credit card required to start.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">What payment methods do you accept?</h4>
              <p className="text-gray-400 text-sm">
                We accept all major credit cards, PayPal, and cryptocurrency payments.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">Can I cancel anytime?</h4>
              <p className="text-gray-400 text-sm">
                Yes, you can cancel your subscription at any time. No cancellation fees or penalties.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        {!user && (
          <div className="text-center mt-16">
            <h3 className="text-2xl font-bold text-white mb-4">Start Your Free Trial Today</h3>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              No credit card required. Get full access to all features for 7 days, then choose the plan that works best
              for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Link href="/auth/signup">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Create Free Account
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-white border-white/20 hover:bg-white/10 bg-transparent"
              >
                <Link href="/auth/login">
                  <LogIn className="mr-2 h-5 w-5" />
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
