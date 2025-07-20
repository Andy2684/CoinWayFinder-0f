"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Star } from "lucide-react"
import Link from "next/link"

export function PricingSection() {
  const plans = [
    {
      name: "Starter",
      price: "$29",
      period: "/month",
      description: "Perfect for beginners getting started with crypto trading",
      badge: null,
      features: [
        "1 AI Trading Bot",
        "Basic Market Analysis",
        "Email Support",
        "Mobile App Access",
        "Basic Risk Management",
        "Community Access",
      ],
      buttonText: "Start Free Trial",
      buttonVariant: "outline" as const,
      popular: false,
    },
    {
      name: "Professional",
      price: "$99",
      period: "/month",
      description: "Advanced features for serious traders and professionals",
      badge: "Most Popular",
      features: [
        "5 AI Trading Bots",
        "Advanced Market Analysis",
        "Priority Support",
        "Web & Mobile Access",
        "Advanced Risk Management",
        "Copy Trading",
        "Custom Indicators",
        "Portfolio Analytics",
      ],
      buttonText: "Start Free Trial",
      buttonVariant: "default" as const,
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$299",
      period: "/month",
      description: "Complete solution for institutions and high-volume traders",
      badge: "Best Value",
      features: [
        "Unlimited AI Trading Bots",
        "Premium Market Analysis",
        "24/7 Phone Support",
        "All Platform Access",
        "Enterprise Risk Management",
        "White-label Solutions",
        "API Access",
        "Dedicated Account Manager",
        "Custom Integrations",
        "Advanced Reporting",
      ],
      buttonText: "Contact Sales",
      buttonVariant: "outline" as const,
      popular: false,
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Pricing Plans
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Choose Your
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
              Trading Plan
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Start with a free trial and upgrade as you grow. All plans include our core AI trading features with no
            hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative ${plan.popular ? "ring-2 ring-blue-500 shadow-xl scale-105" : "hover:shadow-lg"} transition-all duration-300`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
                <p className="text-gray-600 mt-2">{plan.description}</p>
              </CardHeader>

              <CardContent className="pt-0">
                <Button
                  className={`w-full mb-6 ${plan.popular ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" : ""}`}
                  variant={plan.buttonVariant}
                  size="lg"
                  asChild
                >
                  <Link href="/auth/signup">{plan.buttonText}</Link>
                </Button>

                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">All plans include a 14-day free trial. No credit card required.</p>
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500">
            <span>✓ Cancel anytime</span>
            <span>✓ 30-day money-back guarantee</span>
            <span>✓ 24/7 customer support</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PricingSection
