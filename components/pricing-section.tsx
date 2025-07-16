"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Zap, Crown } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Starter",
    price: "29",
    period: "month",
    description: "Perfect for beginners getting started with crypto trading",
    icon: Zap,
    badge: "Most Popular",
    badgeColor: "bg-blue-500",
    features: [
      "5 AI Trading Signals per day",
      "1 Automated Trading Bot",
      "Basic Portfolio Analytics",
      "Email Support",
      "Mobile App Access",
      "Risk Management Tools",
      "Community Access",
    ],
    buttonText: "Start Free Trial",
    buttonVariant: "default" as const,
  },
  {
    name: "Professional",
    price: "79",
    period: "month",
    description: "Advanced features for serious traders and professionals",
    icon: Star,
    badge: "Best Value",
    badgeColor: "bg-purple-500",
    features: [
      "Unlimited AI Trading Signals",
      "5 Automated Trading Bots",
      "Advanced Analytics & Reports",
      "Priority Support",
      "Multi-Exchange Integration",
      "Custom Strategy Builder",
      "Backtesting Engine",
      "API Access",
      "Advanced Risk Controls",
    ],
    buttonText: "Start Free Trial",
    buttonVariant: "default" as const,
  },
  {
    name: "Enterprise",
    price: "199",
    period: "month",
    description: "Complete solution for institutions and high-volume traders",
    icon: Crown,
    badge: "Premium",
    badgeColor: "bg-gold-500",
    features: [
      "Everything in Professional",
      "Unlimited Trading Bots",
      "White-label Solutions",
      "Dedicated Account Manager",
      "Custom Integrations",
      "Advanced API Limits",
      "Institutional Support",
      "Custom Reporting",
      "SLA Guarantee",
    ],
    buttonText: "Contact Sales",
    buttonVariant: "outline" as const,
  },
]

export default function PricingSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            Pricing Plans
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Choose Your
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}
              Trading Plan
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Start with our free trial and upgrade as you grow. All plans include our core features with no hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 ${index === 1 ? "ring-2 ring-purple-500 scale-105" : ""} bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm`}
            >
              {plan.badge && (
                <div
                  className={`absolute -top-4 left-1/2 transform -translate-x-1/2 ${plan.badgeColor} text-white px-4 py-1 rounded-full text-sm font-semibold`}
                >
                  {plan.badge}
                </div>
              )}

              <CardHeader className="text-center pb-8 pt-8">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
                    <plan.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>

                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</CardTitle>

                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">${plan.price}</span>
                  <span className="text-gray-600 dark:text-gray-400">/{plan.period}</span>
                </div>

                <p className="text-gray-600 dark:text-gray-300 text-sm">{plan.description}</p>
              </CardHeader>

              <CardContent className="pt-0">
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/auth/signup" className="block">
                  <Button
                    variant={plan.buttonVariant}
                    className="w-full py-3 font-semibold group-hover:scale-105 transition-transform duration-300"
                  >
                    {plan.buttonText}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Money Back Guarantee */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 px-6 py-3 rounded-full">
            <Check className="h-5 w-5 mr-2" />
            <span className="font-semibold">30-day money-back guarantee</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-4 max-w-2xl mx-auto">
            Try any plan risk-free for 30 days. If you're not completely satisfied, we'll refund your money, no
            questions asked.
          </p>
        </div>
      </div>
    </section>
  )
}
