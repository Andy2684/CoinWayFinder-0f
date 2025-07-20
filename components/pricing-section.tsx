"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Star } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth/auth-provider"

export function PricingSection() {
  const { user } = useAuth()

  const plans = [
    {
      name: "Starter",
      price: "$29",
      period: "/month",
      description: "Perfect for beginners getting started with crypto trading",
      features: [
        "3 AI Trading Bots",
        "Basic Trading Signals",
        "Portfolio Tracking",
        "Email Support",
        "Mobile App Access",
        "Basic Analytics",
      ],
      popular: false,
      cta: user ? "Upgrade to Starter" : "Start Free Trial",
    },
    {
      name: "Professional",
      price: "$79",
      period: "/month",
      description: "Advanced features for serious traders and professionals",
      features: [
        "10 AI Trading Bots",
        "Premium Trading Signals",
        "Advanced Portfolio Analytics",
        "Priority Support",
        "API Access",
        "Custom Strategies",
        "Risk Management Tools",
        "Real-time Alerts",
      ],
      popular: true,
      cta: user ? "Upgrade to Pro" : "Start Free Trial",
    },
    {
      name: "Enterprise",
      price: "$199",
      period: "/month",
      description: "Complete solution for institutions and high-volume traders",
      features: [
        "Unlimited AI Trading Bots",
        "Premium + Custom Signals",
        "White-label Solutions",
        "Dedicated Account Manager",
        "Custom Integrations",
        "Advanced Risk Controls",
        "Institutional Support",
        "Custom Analytics Dashboard",
      ],
      popular: false,
      cta: user ? "Contact Sales" : "Contact Sales",
    },
  ]

  return (
    <section id="pricing" className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Choose Your
            <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Trading Plan
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Start with a free trial and upgrade as your trading grows. All plans include our core AI features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 ${
                plan.popular ? "ring-2 ring-blue-500/50 scale-105" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <CardTitle className="text-white text-2xl mb-2">{plan.name}</CardTitle>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400">{plan.period}</span>
                </div>
                <CardDescription className="text-gray-300">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-300">
                      <Check className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link href={user ? "/dashboard/settings" : "/auth/signup"}>
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
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-400 mb-4">All plans include a 14-day free trial. No credit card required.</p>
          <div className="flex justify-center space-x-8 text-sm text-gray-500">
            <span>✓ Cancel anytime</span>
            <span>✓ 24/7 support</span>
            <span>✓ 99.9% uptime SLA</span>
          </div>
        </div>
      </div>
    </section>
  )
}
