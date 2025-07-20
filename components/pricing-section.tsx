"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

const plans = [
  {
    name: "Starter",
    price: "$29",
    period: "/month",
    description: "Perfect for beginners getting started with crypto trading",
    features: [
      "Up to 3 trading bots",
      "Basic market analysis",
      "Email support",
      "Mobile app access",
      "Basic portfolio tracking",
    ],
    popular: false,
  },
  {
    name: "Professional",
    price: "$99",
    period: "/month",
    description: "Advanced features for serious traders",
    features: [
      "Unlimited trading bots",
      "Advanced AI strategies",
      "Real-time alerts",
      "Priority support",
      "Advanced analytics",
      "API access",
      "Custom indicators",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$299",
    period: "/month",
    description: "Full-featured solution for professional teams",
    features: [
      "Everything in Professional",
      "White-label solution",
      "Dedicated account manager",
      "Custom integrations",
      "Advanced risk management",
      "Multi-user accounts",
      "24/7 phone support",
    ],
    popular: false,
  },
]

export function PricingSection() {
  const { user } = useAuth()

  return (
    <section id="pricing" className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Trading Plan
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Start with our free trial and upgrade as you grow. All plans include our core features with no hidden fees
            or long-term commitments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white/5 backdrop-blur-sm border rounded-xl p-8 ${
                plan.popular ? "border-blue-500 ring-2 ring-blue-500/20" : "border-white/10"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-300 mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-300 ml-1">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {user ? (
                <Link href="/dashboard">
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        : "bg-white/10 hover:bg-white/20 text-white"
                    }`}
                  >
                    Upgrade to {plan.name}
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/signup">
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        : "bg-white/10 hover:bg-white/20 text-white"
                    }`}
                  >
                    Get Started
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
