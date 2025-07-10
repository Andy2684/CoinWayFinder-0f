import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Star } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Starter",
    price: "$29",
    period: "/month",
    description: "Perfect for beginners getting started with automated trading",
    features: [
      "3 Active Trading Bots",
      "Basic Strategies (DCA, Grid)",
      "5 Exchange Integrations",
      "Basic Analytics",
      "Email Support",
      "Mobile App Access",
    ],
    popular: false,
    cta: "Start Free Trial",
  },
  {
    name: "Pro",
    price: "$79",
    period: "/month",
    description: "Advanced features for serious traders and growing portfolios",
    features: [
      "15 Active Trading Bots",
      "All Trading Strategies",
      "Unlimited Exchange Integrations",
      "Advanced Analytics & Reports",
      "Priority Support",
      "AI Market Insights",
      "Custom Notifications",
      "Portfolio Optimization",
    ],
    popular: true,
    cta: "Start Free Trial",
  },
  {
    name: "Enterprise",
    price: "$199",
    period: "/month",
    description: "Maximum performance for professional traders and institutions",
    features: [
      "Unlimited Trading Bots",
      "Custom Strategy Development",
      "White-label Solutions",
      "Dedicated Account Manager",
      "24/7 Phone Support",
      "Advanced Risk Management",
      "API Access & Webhooks",
      "Custom Integrations",
      "Team Collaboration Tools",
    ],
    popular: false,
    cta: "Contact Sales",
  },
]

export function PricingSection() {
  return (
    <section className="py-24 px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white sm:text-5xl">
            Simple, Transparent
            <span className="text-[#30D5C8] block">Pricing</span>
          </h2>
          <p className="mt-6 text-lg text-gray-300 max-w-3xl mx-auto">
            Choose the perfect plan for your trading needs. All plans include a 14-day free trial with full access to
            our platform.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative bg-gray-900/50 border-gray-700 hover:border-[#30D5C8]/50 transition-colors ${
                plan.popular ? "ring-2 ring-[#30D5C8] lg:scale-105" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-[#30D5C8] text-black">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-8">
                <CardTitle className="text-white text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-gray-300">{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400">{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-300">
                      <Check className="h-4 w-4 text-[#30D5C8] mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link href="/subscription" className="block">
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-[#30D5C8] text-black hover:bg-[#30D5C8]/90"
                        : "bg-gray-800 text-white hover:bg-gray-700"
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

        <div className="mt-16 text-center">
          <p className="text-gray-300 mb-4">All plans include our 14-day money-back guarantee</p>
          <p className="text-sm text-gray-400">
            Need a custom solution?{" "}
            <Link href="/contact" className="text-[#30D5C8] hover:underline">
              Contact our sales team
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
