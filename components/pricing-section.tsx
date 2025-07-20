"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Zap, Crown } from "lucide-react"

export function PricingSection() {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for beginners getting started with crypto trading",
      icon: Star,
      features: [
        "Basic trading signals",
        "1 AI trading bot",
        "Email support",
        "Basic market analysis",
        "Mobile app access",
        "Community access",
      ],
      buttonText: "Get Started Free",
      buttonVariant: "outline" as const,
      popular: false,
    },
    {
      name: "Pro",
      price: "$49",
      period: "/month",
      description: "Advanced features for serious traders",
      icon: Zap,
      features: [
        "Advanced trading signals",
        "5 AI trading bots",
        "Priority support",
        "Advanced analytics",
        "Risk management tools",
        "Multi-exchange support",
        "Custom strategies",
        "Real-time alerts",
      ],
      buttonText: "Start Pro Trial",
      buttonVariant: "default" as const,
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$199",
      period: "/month",
      description: "Complete solution for professional traders",
      icon: Crown,
      features: [
        "Unlimited trading signals",
        "Unlimited AI bots",
        "24/7 phone support",
        "Custom AI models",
        "Portfolio management",
        "API access",
        "White-label solution",
        "Dedicated account manager",
        "Custom integrations",
        "Advanced reporting",
      ],
      buttonText: "Contact Sales",
      buttonVariant: "outline" as const,
      popular: false,
    },
  ]

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Pricing Plans
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              Trading Plan
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Start free and upgrade as you grow. All plans include our core AI trading features with no hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative border-2 transition-all duration-300 hover:shadow-xl ${
                plan.popular ? "border-emerald-500 shadow-lg scale-105" : "border-gray-200 hover:border-emerald-300"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-emerald-600 text-white px-4 py-1">Most Popular</Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                    plan.popular ? "bg-emerald-100" : "bg-gray-100"
                  }`}
                >
                  <plan.icon className={`w-8 h-8 ${plan.popular ? "text-emerald-600" : "text-gray-600"}`} />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.period && <span className="text-gray-600 ml-1">{plan.period}</span>}
                </div>
                <CardDescription className="mt-2 text-gray-600">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full py-3 ${
                    plan.buttonVariant === "default"
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                  }`}
                  variant={plan.buttonVariant}
                  size="lg"
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">All plans include a 14-day free trial. No credit card required.</p>
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500">
            <span>✓ Cancel anytime</span>
            <span>✓ 30-day money-back guarantee</span>
            <span>✓ No setup fees</span>
            <span>✓ Free migration support</span>
          </div>
        </div>
      </div>
    </section>
  )
}
