"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Star } from "lucide-react"
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
        "Basic market analysis",
        "Email notifications",
        "Community access",
        "Mobile app access",
        "Basic support",
      ],
      popular: false,
      buttonText: "Start Free Trial",
      buttonVariant: "outline" as const,
    },
    {
      name: "Professional",
      price: "$79",
      period: "/month",
      description: "Advanced features for serious traders and professionals",
      features: [
        "Unlimited AI Trading Signals",
        "Advanced market analysis",
        "Real-time notifications",
        "Priority community access",
        "Mobile & desktop apps",
        "AI trading bots (3 active)",
        "Advanced risk management",
        "Priority support",
      ],
      popular: true,
      buttonText: "Start Free Trial",
      buttonVariant: "default" as const,
    },
    {
      name: "Enterprise",
      price: "$199",
      period: "/month",
      description: "Complete solution for professional trading teams",
      features: [
        "Everything in Professional",
        "Unlimited AI trading bots",
        "Custom trading strategies",
        "API access",
        "White-label solutions",
        "Dedicated account manager",
        "Custom integrations",
        "24/7 phone support",
      ],
      popular: false,
      buttonText: "Contact Sales",
      buttonVariant: "outline" as const,
    },
  ]

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Star className="w-4 h-4 mr-2" />
            Pricing
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Choose Your <span className="text-emerald-600">Trading Plan</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Start with a free trial and upgrade as you grow. All plans include our core features and 24/7 support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative hover:shadow-xl transition-all duration-300 ${
                plan.popular ? "border-emerald-500 shadow-lg scale-105" : "border-gray-200 hover:border-emerald-300"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-emerald-600 text-white px-4 py-1">Most Popular</Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-gray-600 mt-2">{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </CardContent>

              <CardFooter className="pt-8">
                <Button
                  className={`w-full ${plan.popular ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`}
                  variant={plan.buttonVariant}
                  size="lg"
                  asChild
                >
                  <Link href="/auth/signup">{plan.buttonText}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Money Back Guarantee */}
        <div className="text-center mt-16">
          <div className="bg-gray-50 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">30-Day Money-Back Guarantee</h3>
            <p className="text-gray-600 mb-6">
              Try CoinWayFinder risk-free for 30 days. If you're not completely satisfied, we'll refund your money, no
              questions asked.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" asChild>
                <Link href="/auth/signup">Start Your Free Trial</Link>
              </Button>
              <Button variant="ghost" size="lg" asChild>
                <Link href="#features">Learn More About Features</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
