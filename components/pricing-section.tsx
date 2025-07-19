"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Starter",
    price: "$29",
    description: "Perfect for beginners getting started with crypto trading",
    badge: null,
    features: ["5 Trading Bots", "Basic Signals", "Portfolio Tracking", "Email Support", "Mobile App Access"],
  },
  {
    name: "Pro",
    price: "$99",
    description: "Advanced features for serious traders",
    badge: "Most Popular",
    features: [
      "Unlimited Trading Bots",
      "Advanced AI Signals",
      "Real-time Analytics",
      "Priority Support",
      "API Access",
      "Custom Strategies",
      "Risk Management Tools",
    ],
  },
  {
    name: "Enterprise",
    price: "$299",
    description: "Full-featured solution for professional traders",
    badge: null,
    features: [
      "Everything in Pro",
      "White-label Solution",
      "Dedicated Account Manager",
      "Custom Integrations",
      "Advanced Reporting",
      "Multi-user Access",
      "24/7 Phone Support",
    ],
  },
]

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20 sm:py-32 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Simple, transparent pricing</h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Choose the perfect plan for your trading needs. All plans include a 14-day free trial.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <div className="grid max-w-xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.name} className={`relative ${plan.badge ? "border-green-500 shadow-lg" : ""}`}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-green-600 hover:bg-green-700">{plan.badge}</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-base font-medium text-gray-500">/month</span>
                  </div>
                  <CardDescription className="mt-4">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center">
                        <Check className="h-5 w-5 text-green-600 mr-3" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/auth/signup" className="w-full">
                    <Button
                      className={`w-full ${plan.badge ? "bg-green-600 hover:bg-green-700" : ""}`}
                      variant={plan.badge ? "default" : "outline"}
                    >
                      Get Started
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
