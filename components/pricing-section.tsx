"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

const plans = [
  {
    name: "Starter",
    price: "$29",
    period: "/month",
    description: "Perfect for beginners getting started with crypto trading",
    features: [
      "1 Trading Bot",
      "Basic Strategies",
      "Real-time Data",
      "Email Support",
      "Mobile App Access",
      "Basic Analytics",
    ],
    popular: false,
    cta: "Start Free Trial",
  },
  {
    name: "Pro",
    price: "$99",
    period: "/month",
    description: "Advanced features for serious traders and professionals",
    features: [
      "5 Trading Bots",
      "Advanced Strategies",
      "Real-time Data + Alerts",
      "Priority Support",
      "Mobile + Web App",
      "Advanced Analytics",
      "Custom Indicators",
      "Portfolio Management",
    ],
    popular: true,
    cta: "Start Free Trial",
  },
  {
    name: "Enterprise",
    price: "$299",
    period: "/month",
    description: "Full-scale solution for institutions and high-volume traders",
    features: [
      "Unlimited Trading Bots",
      "Custom Strategies",
      "Real-time Data + Premium Alerts",
      "24/7 Dedicated Support",
      "All Platform Access",
      "Advanced Analytics + Reports",
      "Custom Indicators + Backtesting",
      "Portfolio Management + API",
      "White-label Solutions",
      "Dedicated Account Manager",
    ],
    popular: false,
    cta: "Contact Sales",
  },
]

export function PricingSection() {
  const { user } = useAuth()

  return (
    <section id="pricing" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Choose Your
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {" "}
              Trading Plan
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Start with a free trial and scale as you grow. All plans include our core trading features.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative bg-black/20 backdrop-blur-md border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 ${
                plan.popular ? "ring-2 ring-blue-500/50" : ""
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  Most Popular
                </Badge>
              )}

              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-white mb-2">{plan.name}</CardTitle>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400">{plan.period}</span>
                </div>
                <CardDescription className="text-gray-300 text-base">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-300">
                      <Check className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-6">
                  {user ? (
                    <Link href="/dashboard">
                      <Button
                        className={`w-full py-3 ${
                          plan.popular
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            : "bg-white/10 hover:bg-white/20 border border-white/20"
                        } text-white font-semibold transition-all duration-300`}
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/auth/signup">
                      <Button
                        className={`w-full py-3 ${
                          plan.popular
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            : "bg-white/10 hover:bg-white/20 border border-white/20"
                        } text-white font-semibold transition-all duration-300`}
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

        {/* Bottom Info */}
        <div className="text-center">
          <p className="text-gray-400 mb-4">All plans include a 14-day free trial. No credit card required.</p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            <span className="flex items-center">
              <Check className="h-4 w-4 text-green-400 mr-2" />
              Cancel anytime
            </span>
            <span className="flex items-center">
              <Check className="h-4 w-4 text-green-400 mr-2" />
              24/7 Support
            </span>
            <span className="flex items-center">
              <Check className="h-4 w-4 text-green-400 mr-2" />
              99.9% Uptime SLA
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
