"use client"

import { Button } from "@/components/ui/button"
import { Check, Star } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

const plans = [
  {
    name: "Starter",
    price: "$29",
    period: "/month",
    description: "Perfect for beginners getting started with crypto trading",
    features: [
      "1 AI Trading Bot",
      "Basic Trading Signals",
      "Portfolio Analytics",
      "Email Support",
      "Mobile App Access",
    ],
    popular: false,
    buttonText: "Start Free Trial",
  },
  {
    name: "Pro",
    price: "$79",
    period: "/month",
    description: "Advanced features for serious traders",
    features: [
      "5 AI Trading Bots",
      "Premium Trading Signals",
      "Advanced Analytics",
      "Risk Management Tools",
      "Priority Support",
      "API Access",
      "Custom Strategies",
    ],
    popular: true,
    buttonText: "Start Free Trial",
  },
  {
    name: "Enterprise",
    price: "$199",
    period: "/month",
    description: "Full-featured solution for professional traders",
    features: [
      "Unlimited AI Trading Bots",
      "Real-time Market Data",
      "Advanced Risk Management",
      "White-label Solutions",
      "Dedicated Account Manager",
      "Custom Integrations",
      "24/7 Phone Support",
    ],
    popular: false,
    buttonText: "Contact Sales",
  },
]

export function PricingSection() {
  const { user } = useAuth()

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Choose Your
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {" "}
              Trading Plan
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Start with a 14-day free trial. No credit card required.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border transition-all duration-300 hover:transform hover:scale-105 ${
                plan.popular
                  ? "border-blue-400/50 bg-gradient-to-b from-blue-900/20 to-purple-900/20"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center mb-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400 ml-1">{plan.period}</span>
                </div>
                <p className="text-gray-300">{plan.description}</p>
              </div>

              {/* Features List */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <div className="text-center">
                {user ? (
                  <Link href="/dashboard">
                    <Button
                      className={`w-full py-3 font-semibold rounded-full transition-all duration-200 ${
                        plan.popular
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                          : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                      }`}
                    >
                      {plan.buttonText}
                    </Button>
                  </Link>
                ) : (
                  <Link href="/auth/signup">
                    <Button
                      className={`w-full py-3 font-semibold rounded-full transition-all duration-200 ${
                        plan.popular
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                          : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                      }`}
                    >
                      {plan.buttonText}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
