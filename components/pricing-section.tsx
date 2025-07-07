import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Zap } from "lucide-react"

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "forever",
    description: "Perfect for beginners getting started with crypto trading",
    features: [
      "5 AI trading signals per day",
      "Basic market analysis",
      "Telegram notifications",
      "Community support",
      "Basic portfolio tracking",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "Advanced features for serious traders",
    features: [
      "Unlimited AI trading signals",
      "Advanced market analysis",
      "Custom DCA bots (3 active)",
      "Priority support",
      "Advanced portfolio analytics",
      "Risk management tools",
      "Custom alerts",
      "Backtesting tools",
    ],
    cta: "Start Pro Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "per month",
    description: "For professional traders and institutions",
    features: [
      "Everything in Pro",
      "Unlimited DCA bots",
      "White-label solutions",
      "API access",
      "Dedicated account manager",
      "Custom integrations",
      "Advanced analytics",
      "Multi-user management",
    ],
    cta: "Contact Sales",
    popular: false,
  },
]

export function PricingSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-[#30D5C8]/10 text-[#30D5C8] border-[#30D5C8]/20">Pricing</Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Choose Your
            <br />
            <span className="bg-gradient-to-r from-[#30D5C8] to-blue-400 bg-clip-text text-transparent">
              Trading Plan
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Start free and upgrade as you grow. All plans include our core AI trading signals and Telegram integration.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative bg-gray-900/50 border-gray-800 hover:border-[#30D5C8]/50 transition-all duration-300 ${
                plan.popular ? "ring-2 ring-[#30D5C8]/50 scale-105" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-[#30D5C8] text-black font-semibold px-4 py-1">
                    <Star className="w-4 h-4 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-white mb-2">{plan.name}</CardTitle>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  {plan.period && <span className="text-gray-400 ml-2">/{plan.period}</span>}
                </div>
                <p className="text-gray-300">{plan.description}</p>
              </CardHeader>

              <CardContent className="pt-0">
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="w-5 h-5 text-[#30D5C8] mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full py-3 text-lg font-semibold ${
                    plan.popular
                      ? "bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-black"
                      : "bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.popular && <Zap className="w-5 h-5 mr-2" />}
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional info */}
        <div className="text-center mt-12">
          <p className="text-gray-400 mb-4">All plans include a 14-day free trial. No credit card required.</p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <span>✓ Cancel anytime</span>
            <span>✓ 24/7 support</span>
            <span>✓ 99.9% uptime</span>
            <span>✓ Secure & encrypted</span>
          </div>
        </div>
      </div>
    </section>
  )
}
