"use client"

import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import Link from "next/link"

export default function PricingSection() {
  const plans = [
    {
      name: "Starter",
      price: "$29",
      period: "/month",
      description: "Perfect for beginners getting started with crypto trading",
      features: [
        "5 AI Trading Signals per day",
        "1 Trading Bot",
        "Basic Portfolio Analytics",
        "Email Support",
        "Mobile App Access",
      ],
      popular: false,
    },
    {
      name: "Pro",
      price: "$79",
      period: "/month",
      description: "Advanced features for serious traders",
      features: [
        "Unlimited AI Trading Signals",
        "5 Trading Bots",
        "Advanced Portfolio Analytics",
        "Priority Support",
        "API Access",
        "Custom Risk Management",
        "Telegram Alerts",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$199",
      period: "/month",
      description: "Full-featured solution for professional traders",
      features: [
        "Everything in Pro",
        "Unlimited Trading Bots",
        "White-label Solution",
        "Dedicated Account Manager",
        "Custom Integrations",
        "Advanced Analytics",
        "24/7 Phone Support",
      ],
      popular: false,
    },
  ]

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that fits your trading needs. All plans include a 14-day free trial.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-lg border-2 p-8 ${
                plan.popular ? "border-green-500 shadow-lg scale-105" : "border-gray-200 hover:border-gray-300"
              } transition-all duration-300`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600 ml-1">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/auth/signup">
                <Button
                  className={`w-full ${
                    plan.popular ? "bg-green-600 hover:bg-green-700" : "bg-gray-900 hover:bg-gray-800"
                  }`}
                >
                  Start Free Trial
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
